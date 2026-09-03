"""
Gamification Service — Motor de Gamificación, Retención y Contabilidad de Doble Entrada (XP).

Implementa:
1. Cálculo de Nivel Exponencial: level = floor(1.8 * sqrt(xp)) + 1
2. Billetera de Vital Points / XP con transacciones idempotentes inmutables
3. Retos de Squad e Individuales con progresión en tiempo real
"""

import math
import uuid
from datetime import date, datetime, timedelta
from typing import List, Optional, Tuple, Dict, Any

from sqlalchemy import select, and_, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import (
    AthleteWallet,
    WalletTransaction,
    AthleteChallenge,
    ChallengeProgressEvent,
    Squad,
    SquadMember,
    SquadActivity,
    Client
)


LEVEL_TITLES = {
    "NOVATO": "Novato",       # 1-5
    "GUERRERO": "Guerrero",   # 6-10
    "TITAN": "Titán",         # 11-15
    "LEYENDA": "Leyenda",     # 16+
}


class GamificationService:
    @staticmethod
    def calculate_level(xp: int) -> int:
        """Fórmula exponencial de nivel: level = floor(1.8 * sqrt(xp)) + 1"""
        if xp <= 0:
            return 1
        return math.floor(1.8 * math.sqrt(xp)) + 1

    @staticmethod
    def get_xp_for_level(level: int) -> int:
        """XP mínima requerida para alcanzar un nivel."""
        if level <= 1:
            return 0
        return math.ceil(((level - 1) / 1.8) ** 2)

    @classmethod
    def get_level_title(cls, level: int) -> str:
        """Título honorífico según el nivel."""
        if level <= 5:
            return LEVEL_TITLES["NOVATO"]
        if level <= 10:
            return LEVEL_TITLES["GUERRERO"]
        if level <= 15:
            return LEVEL_TITLES["TITAN"]
        return LEVEL_TITLES["LEYENDA"]

    @classmethod
    def get_xp_progress(cls, xp: int) -> Dict[str, Any]:
        """Calcula el progreso porcentual y XP restante hacia el siguiente nivel."""
        current_level = cls.calculate_level(xp)
        current_level_min_xp = cls.get_xp_for_level(current_level)
        next_level_min_xp = cls.get_xp_for_level(current_level + 1)
        
        span = next_level_min_xp - current_level_min_xp
        progress_in_level = max(0, xp - current_level_min_xp)
        percent = min(100, round((progress_in_level / span) * 100)) if span > 0 else 100

        return {
            "current_xp": xp,
            "current_level": current_level,
            "level_title": cls.get_level_title(current_level),
            "xp_for_current_level": current_level_min_xp,
            "xp_for_next_level": next_level_min_xp,
            "remaining_xp": max(0, next_level_min_xp - xp),
            "progress_percent": percent,
        }

    @classmethod
    async def get_or_create_wallet(cls, db: AsyncSession, client_id: uuid.UUID) -> AthleteWallet:
        """Obtiene la billetera de XP del atleta o la crea si no existe."""
        query = select(AthleteWallet).where(AthleteWallet.client_id == client_id)
        wallet = (await db.execute(query)).scalar_one_or_none()
        if not wallet:
            wallet = AthleteWallet(
                id=uuid.uuid4(),
                client_id=client_id,
                balance=0,
            )
            db.add(wallet)
            await db.flush()
            await db.commit()
            await db.refresh(wallet)
        return wallet

    @classmethod
    async def award_xp(
        cls,
        db: AsyncSession,
        client_id: uuid.UUID,
        amount: int,
        source: str = "workout",
        idempotency_key: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Tuple[AthleteWallet, Optional[WalletTransaction], bool]:
        """
        Acredita XP al atleta de forma atómica e inmutable.
        Garantiza idempotencia: si ya se procesó el idempotency_key, no duplica puntos.
        """
        wallet = await cls.get_or_create_wallet(db, client_id)
        
        # Verificar idempotencia si se proporciona key
        if idempotency_key:
            existing_tx_query = select(WalletTransaction).where(
                and_(
                    WalletTransaction.wallet_id == wallet.id,
                    WalletTransaction.reference_id == idempotency_key,
                )
            )
            existing_tx = (await db.execute(existing_tx_query)).scalar_one_or_none()
            if existing_tx:
                return wallet, existing_tx, False  # Ya fue acreditado

        # Crear transacción de crédito
        tx = WalletTransaction(
            id=uuid.uuid4(),
            wallet_id=wallet.id,
            amount=amount,
            transaction_type=f"EARNED_{source.upper()}",
            reference_id=idempotency_key or str(uuid.uuid4()),
            description=description or f"Puntos ganados por {source}",
        )
        db.add(tx)
        
        # Actualizar saldo de la billetera
        wallet.balance += amount
        wallet.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(wallet)
        await db.refresh(tx)

        return wallet, tx, True

    @classmethod
    async def sync_xp_outbox(
        cls, db: AsyncSession, client_id: uuid.UUID, events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Procesa en lote una cola de eventos de XP generados offline en el cliente.
        """
        wallet = await cls.get_or_create_wallet(db, client_id)
        processed_count = 0
        total_awarded = 0

        for event in events:
            key = event.get("idempotencyKey")
            amount = int(event.get("amount", 0))
            source = event.get("source", "generic")
            
            if amount <= 0:
                continue

            _, _, is_new = await cls.award_xp(
                db=db,
                client_id=client_id,
                amount=amount,
                source=source,
                idempotency_key=key,
                description=f"Offline sync: {source}",
            )
            if is_new:
                processed_count += 1
                total_awarded += amount

        await db.refresh(wallet)
        level_info = cls.get_xp_progress(wallet.balance)

        return {
            "synced_events_count": processed_count,
            "total_awarded_xp": total_awarded,
            "current_balance": wallet.balance,
            "level_info": level_info,
        }

    @classmethod
    async def get_athlete_status(cls, db: AsyncSession, client_id: uuid.UUID) -> Dict[str, Any]:
        """Consulta consolidada de gamificación: XP, nivel, retos y squad."""
        wallet = await cls.get_or_create_wallet(db, client_id)
        level_info = cls.get_xp_progress(wallet.balance)

        # Consultar retos activos
        challenges_query = select(AthleteChallenge).where(
            and_(
                AthleteChallenge.client_id == client_id,
                AthleteChallenge.state == "ACTIVE",
            )
        ).order_by(AthleteChallenge.deployed_at.desc())
        challenges = list((await db.execute(challenges_query)).scalars().all())

        return {
            "total_xp": wallet.balance,
            "level": level_info["current_level"],
            "level_title": level_info["level_title"],
            "xp_progress": level_info,
            "active_challenges_count": len(challenges),
        }

    @classmethod
    async def get_active_challenges(cls, db: AsyncSession, client_id: uuid.UUID) -> List[AthleteChallenge]:
        """Lista todos los retos activos asignados al atleta."""
        query = select(AthleteChallenge).where(
            and_(
                AthleteChallenge.client_id == client_id,
                AthleteChallenge.state == "ACTIVE",
            )
        ).order_by(AthleteChallenge.deployed_at.desc())
        return list((await db.execute(query)).scalars().all())

    @classmethod
    async def create_challenge(
        cls,
        db: AsyncSession,
        tenant_id: uuid.UUID,
        client_id: uuid.UUID,
        title: str,
        type: str = "STREAK",
        target_value: int = 7,
        duration_days: int = 7,
        squad_id: Optional[uuid.UUID] = None,
    ) -> AthleteChallenge:
        """Crea y asigna un nuevo reto individual o de squad."""
        start_d = datetime.utcnow().date()
        end_d = start_d + timedelta(days=duration_days)

        challenge = AthleteChallenge(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            client_id=client_id,
            squad_id=squad_id,
            title=title,
            type=type,
            target_value=target_value,
            current_value=0,
            state="ACTIVE",
            start_date=start_d,
            end_date=end_d,
            duration_days=duration_days,
            deployed_at=datetime.utcnow(),
        )
        db.add(challenge)
        await db.commit()
        await db.refresh(challenge)
        return challenge

    @classmethod
    async def record_challenge_progress(
        cls,
        db: AsyncSession,
        challenge_id: uuid.UUID,
        client_id: uuid.UUID,
        value: int = 1,
        source: str = "HABIT_CHECKIN",
    ) -> Tuple[AthleteChallenge, bool]:
        """Registra avance en un reto y verifica si se completó."""
        query = select(AthleteChallenge).where(AthleteChallenge.id == challenge_id)
        challenge = (await db.execute(query)).scalar_one_or_none()
        if not challenge:
            raise ValueError("Challenge not found")

        # Registrar evento de progreso
        event = ChallengeProgressEvent(
            id=uuid.uuid4(),
            challenge_id=challenge.id,
            client_id=client_id,
            value=value,
            source=source,
        )
        db.add(event)

        challenge.current_value += value
        is_completed = challenge.current_value >= challenge.target_value
        if is_completed and challenge.state == "ACTIVE":
            challenge.state = "COMPLETED"
            challenge.completed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(challenge)
        return challenge, is_completed
