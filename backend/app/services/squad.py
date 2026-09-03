"""
Squad & Engagement Service - "Tribus"
Gamification module with accountability squads and streaks, backed by PostgreSQL.

Strategic Pillars:
1. Framework "Octalysis" & Design of Motivation: White Hat (XP in AthleteWallet) & Black Hat (Empathetic Spanish warnings for Drive 8: Loss Aversion + Streak Shields).
2. Dopamine Domino Effect & Micro-Recompenses: Immediate dopamine pulse response (<1s), Goal Fragmenter to 12-day MicroMilestones.
3. Sticky Communities & Social Capital: 5-member limit squads, relative leaderboards, and structured time-limited Group Challenges.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, List, Tuple
from uuid import UUID, uuid4

from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc

from app.db.models import (
    Squad as DBSquad,
    SquadMember as DBSquadMember,
    SquadActivity as DBSquadActivity,
    SquadNotification as DBSquadNotification,
    AthleteWallet as DBAthleteWallet,
    WalletTransaction as DBWalletTransaction,
    MicroMilestone as DBMicroMilestone
)


# =============================================================================
# ENUMS
# =============================================================================

class SquadGoalType(str, Enum):
    """Tipos de objetivo del squad."""
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    GENERAL_FITNESS = "general_fitness"
    NUTRITION_ADHERENCE = "nutrition_adherence"
    TRAINING_CONSISTENCY = "training_consistency"


class ActivityType(str, Enum):
    """Tipos de actividad trackeable."""
    WORKOUT_COMPLETED = "workout_completed"
    MEAL_LOGGED = "meal_logged"
    WEIGHT_LOGGED = "weight_logged"
    STREAK_MILESTONE = "streak_milestone"
    GOAL_ACHIEVED = "goal_achieved"


class MilestoneType(str, Enum):
    """Tipos de milestone de racha."""
    WEEK_1 = "week_1"      # 7 días
    WEEK_2 = "week_2"      # 14 días
    MONTH_1 = "month_1"    # 30 días
    MONTH_3 = "month_3"    # 90 días
    MONTH_6 = "month_6"    # 180 días
    YEAR_1 = "year_1"      # 365 días


# =============================================================================
# SCHEMAS
# =============================================================================

class SquadMember(BaseModel):
    """Miembro de un squad."""
    id: UUID
    client_id: UUID
    name: str
    avatar_url: Optional[str] = None
    current_streak: int = 0
    total_activities: int = 0
    joined_at: datetime
    is_leader: bool = False
    streak_shields: int = 0

    class Config:
        from_attributes = True


class Squad(BaseModel):
    """Squad de responsabilidad (max 5 miembros)."""
    id: UUID
    tenant_id: UUID
    name: str
    description: Optional[str] = None
    goal_type: SquadGoalType
    goal_target: Optional[str] = None
    members: list[SquadMember] = []
    created_at: datetime
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_active: bool = True
    challenge_title: Optional[str] = None
    challenge_ends_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Activity(BaseModel):
    """Actividad registrada por un miembro."""
    id: UUID
    member_id: UUID
    squad_id: UUID
    activity_type: ActivityType
    description: str
    metadata: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


class StreakInfo(BaseModel):
    """Información de racha de un miembro."""
    current_streak: int
    longest_streak: int
    last_activity_at: Optional[datetime]
    next_milestone: Optional[MilestoneType]
    days_to_milestone: int = 0
    streak_shields: int = 0


class Notification(BaseModel):
    """Notificación para squad."""
    id: UUID
    squad_id: UUID
    sender_id: UUID
    sender_name: str
    activity_type: ActivityType
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    """Entrada del leaderboard."""
    rank: int
    member_id: UUID
    member_name: str
    avatar_url: Optional[str]
    streak: int
    activities_this_week: int
    points: int


class DopaminePulseResponse(BaseModel):
    """Respuesta inmediata de micro-recompensa para el Efecto Dominó de Dopamina."""
    success: bool
    message: str
    xp_gained: int
    new_balance: int
    current_streak: int
    streak_saved_by_shield: bool
    dopamine_animation: str  # e.g. "confetti", "streak_fire", "shield_bubble"


# =============================================================================
# SERVICE
# =============================================================================

class SquadService:
    """
    Servicio de squads y gamificación relacional.
    Maneja grupos de responsabilidad asíncronamente con base de datos PostgreSQL.
    """
    
    MAX_SQUAD_SIZE = 5
    
    # Milestone thresholds (days)
    MILESTONES = {
        MilestoneType.WEEK_1: 7,
        MilestoneType.WEEK_2: 14,
        MilestoneType.MONTH_1: 30,
        MilestoneType.MONTH_3: 90,
        MilestoneType.MONTH_6: 180,
        MilestoneType.YEAR_1: 365,
    }

    async def _get_or_create_wallet(self, db: AsyncSession, client_id: UUID) -> DBAthleteWallet:
        """Obtiene o crea la billetera del atleta para la economía O2O (Vital Points/XP)."""
        stmt = select(DBAthleteWallet).where(DBAthleteWallet.client_id == client_id)
        result = await db.execute(stmt)
        wallet = result.scalars().first()
        if not wallet:
            wallet = DBAthleteWallet(client_id=client_id, balance=0)
            db.add(wallet)
            await db.flush()
        return wallet

    async def create_squad(
        self,
        db: AsyncSession,
        tenant_id: UUID,
        name: str,
        goal_type: SquadGoalType,
        creator_id: UUID,
        creator_name: str,
        description: Optional[str] = None,
        goal_target: Optional[str] = None,
    ) -> Squad:
        """Crea un nuevo squad en Postgres con el creador como líder."""
        squad = DBSquad(
            tenant_id=tenant_id,
            name=name,
            description=description,
            goal_type=goal_type.value,
            goal_target=goal_target,
            starts_at=datetime.utcnow(),
            is_active=True
        )
        db.add(squad)
        await db.flush()

        leader = DBSquadMember(
            squad_id=squad.id,
            client_id=creator_id,
            name=creator_name,
            is_leader=True,
            current_streak=0,
            total_activities=0,
            streak_shields=0
        )
        db.add(leader)
        await db.flush()

        # Inicializar billetera si no existe
        await self._get_or_create_wallet(db, creator_id)

        # Crear notificación de bienvenida
        welcome_notif = DBSquadNotification(
            squad_id=squad.id,
            sender_id=creator_id,
            sender_name=creator_name,
            activity_type=ActivityType.GOAL_ACHIEVED.value,
            message=f"🎉 ¡{creator_name} ha creado el squad '{name}' como líder!"
        )
        db.add(welcome_notif)
        await db.commit()

        # Retornar Pydantic Squad
        return Squad(
            id=squad.id,
            tenant_id=squad.tenant_id,
            name=squad.name,
            description=squad.description,
            goal_type=SquadGoalType(squad.goal_type),
            goal_target=squad.goal_target,
            members=[SquadMember.model_validate(leader)],
            created_at=squad.created_at,
            starts_at=squad.starts_at,
            is_active=squad.is_active
        )
    
    async def join_squad(
        self,
        db: AsyncSession,
        squad_id: UUID,
        client_id: UUID,
        client_name: str,
    ) -> Tuple[bool, str]:
        """Unirse a un squad existente con límite estricto de 5 personas."""
        # Obtener squad
        stmt = select(DBSquad).where(DBSquad.id == squad_id)
        res = await db.execute(stmt)
        squad = res.scalars().first()
        if not squad:
            return False, "Squad no encontrado"

        if not squad.is_active:
            return False, "El squad ya no está activo"

        # Contar miembros
        stmt_count = select(func.count(DBSquadMember.id)).where(DBSquadMember.squad_id == squad_id)
        count_res = await db.execute(stmt_count)
        current_size = count_res.scalar() or 0

        if current_size >= self.MAX_SQUAD_SIZE:
            return False, "Squad lleno (máx 5 miembros)"

        # Verificar si ya es miembro
        stmt_mem = select(DBSquadMember).where(
            and_(DBSquadMember.squad_id == squad_id, DBSquadMember.client_id == client_id)
        )
        res_mem = await db.execute(stmt_mem)
        if res_mem.scalars().first():
            return False, "Ya eres miembro de este squad"

        # Añadir miembro
        new_member = DBSquadMember(
            squad_id=squad_id,
            client_id=client_id,
            name=client_name,
            is_leader=False,
            current_streak=0,
            total_activities=0,
            streak_shields=0
        )
        db.add(new_member)

        # Asegurar billetera
        await self._get_or_create_wallet(db, client_id)

        # Notificar al squad
        notif = DBSquadNotification(
            squad_id=squad_id,
            sender_id=client_id,
            sender_name=client_name,
            activity_type=ActivityType.GOAL_ACHIEVED.value,
            message=f"🎉 ¡{client_name} se ha unido al squad!"
        )
        db.add(notif)
        await db.commit()

        return True, "Bienvenido al squad"
    
    async def log_activity(
        self,
        db: AsyncSession,
        squad_id: UUID,
        client_id: UUID,
        activity_type: ActivityType,
        description: str,
        metadata: Optional[dict] = None,
    ) -> DopaminePulseResponse:
        """
        Registra actividad de salud asíncronamente en PostgreSQL.
        Aplica el pilar de aversión a la pérdida con Streak Shields y recompensa XP.
        """
        # Validar miembro
        stmt_mem = select(DBSquadMember).where(
            and_(DBSquadMember.squad_id == squad_id, DBSquadMember.client_id == client_id)
        )
        res_mem = await db.execute(stmt_mem)
        member = res_mem.scalars().first()
        if not member:
            raise ValueError("Miembro no encontrado en el squad")

        now = datetime.utcnow()
        streak_saved_by_shield = False
        xp_gained = 20  # Recompensa base por entrenar/registrar
        dopamine_animation = "confetti"

        # Lógica de racha no-punitiva (Streak Repair - Octalysis)
        if member.last_activity_at:
            delta_days = (now.date() - member.last_activity_at.date()).days
            
            if delta_days == 0:
                # Ya registró hoy, la racha continúa igual
                pass
            elif delta_days == 1:
                # Día consecutivo, incrementamos
                member.current_streak += 1
                dopamine_animation = "streak_fire"
            else:
                # Se saltó uno o más días
                if member.streak_shields > 0:
                    # Reparar racha!
                    member.streak_shields -= 1
                    streak_saved_by_shield = True
                    member.current_streak += 1
                    dopamine_animation = "shield_bubble"
                else:
                    # Racha rota
                    member.current_streak = 1
                    dopamine_animation = "confetti"
        else:
            # Primera actividad
            member.current_streak = 1
            dopamine_animation = "streak_fire"

        # Registrar actividad en DB
        activity = DBSquadActivity(
            squad_id=squad_id,
            client_id=client_id,
            activity_type=activity_type.value,
            description=description,
            metadata_json=metadata or {}
        )
        db.add(activity)

        # Actualizar miembro
        member.total_activities += 1
        member.last_activity_at = now

        # Entregar XP (White Hat)
        wallet = await self._get_or_create_wallet(db, client_id)
        wallet.balance += xp_gained
        
        # Guardar transacción
        tx = DBWalletTransaction(
            wallet_id=wallet.id,
            amount=xp_gained,
            transaction_type="EARNED",
            reference_id=f"activity_{activity_type.value}",
            description=f"Logro registrado: {description}"
        )
        db.add(tx)

        # Verificar si hay alerta de hito (Streak Milestone)
        milestone_message = ""
        for milestone, days in sorted(self.MILESTONES.items(), key=lambda x: x[1]):
            if member.current_streak == days:
                # Hito alcanzado! Entregar +100 XP
                milestone_xp = 100
                wallet.balance += milestone_xp
                
                milestone_tx = DBWalletTransaction(
                    wallet_id=wallet.id,
                    amount=milestone_xp,
                    transaction_type="EARNED",
                    reference_id=f"milestone_{milestone.value}",
                    description=f"Hito de Racha alcanzado ({days} dias consecutivas)"
                )
                db.add(milestone_tx)
                
                milestone_message = f" 🔥 ¡Hito de racha de {days} días alcanzado! +100 XP otorgados."
                break

        # Notificar socialmente
        emoji_map = {
            ActivityType.WORKOUT_COMPLETED: "💪",
            ActivityType.MEAL_LOGGED: "🥗",
            ActivityType.WEIGHT_LOGGED: "⚖️",
            ActivityType.STREAK_MILESTONE: "🔥",
            ActivityType.GOAL_ACHIEVED: "🏆",
        }
        emoji = emoji_map.get(activity_type, "✅")
        
        message_body = f"{emoji} {member.name}: {description} (Racha: {member.current_streak} días)."
        if streak_saved_by_shield:
            message_body += " ¡Racha salvada por Escudo! 🛡️"
        if milestone_message:
            message_body += milestone_message

        notif = DBSquadNotification(
            squad_id=squad_id,
            sender_id=client_id,
            sender_name=member.name,
            activity_type=activity_type.value,
            message=message_body
        )
        db.add(notif)

        await db.commit()

        return DopaminePulseResponse(
            success=True,
            message=message_body,
            xp_gained=xp_gained,
            new_balance=wallet.balance,
            current_streak=member.current_streak,
            streak_saved_by_shield=streak_saved_by_shield,
            dopamine_animation=dopamine_animation
        )

    async def get_squad(self, db: AsyncSession, squad_id: UUID) -> Optional[Squad]:
        """Obtiene squad de la base de datos con sus miembros cargados."""
        stmt = select(DBSquad).where(DBSquad.id == squad_id)
        res = await db.execute(stmt)
        squad = res.scalars().first()
        if not squad:
            return None

        # Cargar miembros
        stmt_m = select(DBSquadMember).where(DBSquadMember.squad_id == squad_id).order_by(DBSquadMember.joined_at)
        res_m = await db.execute(stmt_m)
        members = res_m.scalars().all()

        return Squad(
            id=squad.id,
            tenant_id=squad.tenant_id,
            name=squad.name,
            description=squad.description,
            goal_type=SquadGoalType(squad.goal_type),
            goal_target=squad.goal_target,
            members=[SquadMember.model_validate(m) for m in members],
            created_at=squad.created_at,
            starts_at=squad.starts_at,
            ends_at=squad.ends_at,
            is_active=squad.is_active,
            challenge_title=squad.challenge_title,
            challenge_ends_at=squad.challenge_ends_at
        )

    async def get_leaderboard(self, db: AsyncSession, squad_id: UUID) -> List[LeaderboardEntry]:
        """Genera leaderboard relativo dinámico basado en Racha y Actividades semanales."""
        stmt_m = select(DBSquadMember).where(DBSquadMember.squad_id == squad_id)
        res_m = await db.execute(stmt_m)
        members = res_m.scalars().all()

        week_ago = datetime.utcnow() - timedelta(days=7)
        entries = []

        for member in members:
            # Contar actividades de la última semana
            stmt_act = select(func.count(DBSquadActivity.id)).where(
                and_(
                    DBSquadActivity.squad_id == squad_id,
                    DBSquadActivity.client_id == member.client_id,
                    DBSquadActivity.created_at >= week_ago
                )
            )
            res_act = await db.execute(stmt_act)
            activities_this_week = res_act.scalar() or 0

            # Fórmula de Puntos (Octalysis Social Influence)
            points = (member.current_streak * 10) + (activities_this_week * 5)

            entries.append(LeaderboardEntry(
                rank=0,
                member_id=member.client_id,
                member_name=member.name,
                avatar_url=member.avatar_url,
                streak=member.current_streak,
                activities_this_week=activities_this_week,
                points=points
            ))

        # Ordenar y rankear
        entries.sort(key=lambda x: x.points, reverse=True)
        for i, entry in enumerate(entries, 1):
            entry.rank = i

        return entries

    async def get_notifications(
        self,
        db: AsyncSession,
        squad_id: UUID,
        limit: int = 20,
        cursor: Optional[datetime] = None
    ) -> List[Notification]:
        """Obtiene notificaciones del feed de actividad de la micro-comunidad."""
        stmt = select(DBSquadNotification).where(
            DBSquadNotification.squad_id == squad_id
        )
        if cursor:
            stmt = stmt.where(DBSquadNotification.created_at < cursor)
            
        stmt = stmt.order_by(desc(DBSquadNotification.created_at)).limit(limit)
        
        res = await db.execute(stmt)
        notifications = res.scalars().all()

        return [
            Notification(
                id=n.id,
                squad_id=n.squad_id,
                sender_id=n.sender_id,
                sender_name=n.sender_name,
                activity_type=ActivityType(n.activity_type),
                message=n.message,
                created_at=n.created_at
            )
            for n in notifications
        ]

    async def get_streak(self, db: AsyncSession, client_id: UUID) -> StreakInfo:
        """Obtiene info de racha de un miembro y calcula su próximo milestone."""
        stmt_m = select(DBSquadMember).where(DBSquadMember.client_id == client_id)
        res_m = await db.execute(stmt_m)
        member = res_m.scalars().first()
        if not member:
            return StreakInfo(
                current_streak=0,
                longest_streak=0,
                last_activity_at=None,
                next_milestone=MilestoneType.WEEK_1,
                days_to_milestone=7,
                streak_shields=0
            )

        # Calcular próximo milestone
        next_milestone = None
        days_to_milestone = 0
        for milestone, days in sorted(self.MILESTONES.items(), key=lambda x: x[1]):
            if member.current_streak < days:
                next_milestone = milestone
                days_to_milestone = days - member.current_streak
                break

        return StreakInfo(
            current_streak=member.current_streak,
            longest_streak=member.current_streak, # Simplificado para DB
            last_activity_at=member.last_activity_at,
            next_milestone=next_milestone,
            days_to_milestone=days_to_milestone,
            streak_shields=member.streak_shields
        )

    async def buy_streak_shield(self, db: AsyncSession, client_id: UUID) -> Tuple[bool, str, int]:
        """Permite comprar 1 Streak Shield (100 XP) con saldo de AthleteWallet."""
        # 1. Obtener billetera
        wallet = await self._get_or_create_wallet(db, client_id)
        if wallet.balance < 100:
            return False, f"Saldo insuficiente. Cuestas 100 XP pero tienes {wallet.balance} XP.", wallet.balance

        # 2. Descontar balance
        wallet.balance -= 100
        
        # 3. Registrar transacción
        tx = DBWalletTransaction(
            wallet_id=wallet.id,
            amount=-100,
            transaction_type="SPENT",
            reference_id="buy_streak_shield",
            description="Compra de Escudo de Racha (Streak Shield) para reparar racha"
        )
        db.add(tx)

        # 4. Incrementar escudo en todos los squads donde sea miembro
        stmt_m = select(DBSquadMember).where(DBSquadMember.client_id == client_id)
        res_m = await db.execute(stmt_m)
        members = res_m.scalars().all()
        
        for member in members:
            member.streak_shields += 1

        await db.commit()
        return True, "🛡️ ¡Escudo de Racha adquirido exitosamente! Estás protegido ante fallos.", wallet.balance

    async def fragment_goal(self, db: AsyncSession, client_id: UUID, goal_name: str) -> List[DBMicroMilestone]:
        """
        Fragmenta metas anuales/mensuales a largo plazo del atleta en
        micro-victorias neurobiológicas de 12 días (SMART-T).
        """
        # Crear 3 hitos de 12 días en base de datos
        milestones = []
        now = datetime.utcnow().date()
        
        hitos = [
            ("Micro-hito 1: Consistencia Inicial de 12 días", 12),
            ("Micro-hito 2: Hábito Afianzado (Consistencia de 24 días)", 24),
            ("Micro-hito 3: Transformación en Marcha (Consistencia de 36 días)", 36)
        ]

        # Borrar hitos de dopamina no logrados anteriores
        stmt_del = select(DBMicroMilestone).where(
            and_(DBMicroMilestone.client_id == client_id, DBMicroMilestone.is_achieved == False)
        )
        res_del = await db.execute(stmt_del)
        for m_del in res_del.scalars().all():
            await db.delete(m_del)

        for name, days in hitos:
            target_date = now + timedelta(days=days)
            m = DBMicroMilestone(
                client_id=client_id,
                target_logical_date=target_date,
                milestone_name=f"{goal_name} - {name}",
                is_achieved=False,
                xp_reward=50
            )
            db.add(m)
            milestones.append(m)

        await db.commit()
        return milestones

    async def set_squad_challenge(
        self,
        db: AsyncSession,
        squad_id: UUID,
        challenge_title: str,
        duration_days: int = 7
    ) -> Tuple[bool, str]:
        """Establece un desafío grupal estructurado con límite de tiempo."""
        stmt = select(DBSquad).where(DBSquad.id == squad_id)
        res = await db.execute(stmt)
        squad = res.scalars().first()
        if not squad:
            return False, "Squad no encontrado"

        squad.challenge_title = challenge_title
        squad.challenge_ends_at = datetime.utcnow() + timedelta(days=duration_days)

        # Obtener el líder del squad para usarlo como sender_id válido (evitando violación de FK)
        stmt_leader = select(DBSquadMember.client_id).where(
            and_(DBSquadMember.squad_id == squad_id, DBSquadMember.is_leader == True)
        )
        res_leader = await db.execute(stmt_leader)
        leader_client_id = res_leader.scalar()
        if not leader_client_id:
            # Fallback a cualquier miembro si no se encuentra un líder
            stmt_any = select(DBSquadMember.client_id).where(DBSquadMember.squad_id == squad_id).limit(1)
            res_any = await db.execute(stmt_any)
            leader_client_id = res_any.scalar()

        if not leader_client_id:
            return False, "No se encontraron miembros en el squad para emitir la notificación"

        # Notificación colectiva
        notif = DBSquadNotification(
            squad_id=squad_id,
            sender_id=leader_client_id,
            sender_name="SQUAD BOT",
            activity_type=ActivityType.STREAK_MILESTONE.value,
            message=f"📢 ¡NUEVO DESAFÍO GRUPAL ACTIVADO! '{challenge_title}' termina el {squad.challenge_ends_at.strftime('%d/%m/%Y')}. ¡Colaboremos para completarlo!"
        )
        db.add(notif)
        await db.commit()

        return True, f"Desafío '{challenge_title}' activado exitosamente."


# Instancia global asíncrona
squad_service = SquadService()
