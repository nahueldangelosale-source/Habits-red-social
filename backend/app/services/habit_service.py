"""
Habit Service — Dominio de Hábitos y Psicología Conductual (Lally et al.)

Gestiona la prescripción, cumplimiento diario, cálculo de zonas de tolerancia (90%+),
re-cálculo inmutable de rachas y niveles de habituación.
"""

import uuid
from datetime import date, datetime, timedelta
from typing import List, Optional, Tuple, Dict, Any

from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Habit, HabitLog, Client


HABIT_LEVEL_THRESHOLDS = [7, 21, 45, 66, 90, 180, 365]
NUMERIC_TOLERANCE = 0.90  # 90% = Zona LOW (racha vive), 100%+ = Zona HIGH (excelencia)


class HabitService:
    @staticmethod
    def evaluate_zone(input_type: str, target_value: Optional[float], value: Optional[float], completed: bool) -> str:
        """Determina la zona de cumplimiento: 'NONE', 'LOW' o 'HIGH'."""
        if input_type == "BOOLEAN":
            return "HIGH" if completed else "NONE"

        if not target_value or target_value <= 0:
            return "HIGH" if (value and value > 0) or completed else "NONE"

        val = value if value is not None else 0.0
        ratio = val / target_value

        if ratio >= 1.0:
            return "HIGH"
        if ratio >= NUMERIC_TOLERANCE:
            return "LOW"
        return "NONE"

    @staticmethod
    def recalc_level(completed_days_count: int) -> int:
        """Calcula el nivel Lally (0 a 7) según la cantidad de días completados."""
        level = 0
        for i, threshold in enumerate(HABIT_LEVEL_THRESHOLDS):
            if completed_days_count >= threshold:
                level = i + 1
        return level

    @classmethod
    async def get_client_habits(
        cls, db: AsyncSession, client_id: uuid.UUID, include_inactive: bool = False
    ) -> List[Habit]:
        """Obtiene todos los hábitos de un cliente con sus logs precargados."""
        query = select(Habit).options(selectinload(Habit.logs)).where(Habit.client_id == client_id)
        if not include_inactive:
            query = query.where(Habit.is_active.is_(True))
        query = query.order_by(Habit.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @classmethod
    async def get_habit_by_id(cls, db: AsyncSession, habit_id: uuid.UUID) -> Optional[Habit]:
        """Obtiene un hábito por ID con sus logs."""
        query = select(Habit).options(selectinload(Habit.logs)).where(Habit.id == habit_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def prescribe_or_create_habit(
        cls,
        db: AsyncSession,
        tenant_id: uuid.UUID,
        client_id: uuid.UUID,
        template_id: str,
        title: str,
        type: str = "BUILD",
        category: str = "CUSTOM",
        input_type: str = "BOOLEAN",
        unit: Optional[str] = None,
        target_value: Optional[float] = None,
        duration: str = "INDEFINITE",
        scheduled_days: Optional[List[int]] = None,
        tags: Optional[List[str]] = None,
        is_custom: bool = False,
        start_date: Optional[date] = None,
    ) -> Habit:
        """Crea o prescribe un nuevo hábito para el cliente."""
        days = scheduled_days if scheduled_days and len(scheduled_days) > 0 else [1, 2, 3, 4, 5, 6, 7]
        tag_list = tags or []

        # Evitar duplicados activos del mismo template
        existing_query = select(Habit).where(
            and_(
                Habit.client_id == client_id,
                Habit.template_id == template_id,
                Habit.is_active.is_(True),
            )
        )
        existing = (await db.execute(existing_query)).scalar_one_or_none()
        if existing:
            return existing

        new_habit = Habit(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            client_id=client_id,
            template_id=template_id,
            title=title,
            type=type,
            category=category,
            input_type=input_type,
            unit=unit,
            target_value=target_value,
            duration=duration,
            scheduled_days=days,
            tags=tag_list,
            is_custom=is_custom,
            is_active=True,
            streak_current=0,
            streak_best=0,
            level=0,
            start_date=start_date or datetime.utcnow().date(),
        )

        db.add(new_habit)
        await db.commit()
        await db.refresh(new_habit)
        return new_habit

    @classmethod
    async def record_check_in(
        cls,
        db: AsyncSession,
        habit_id: uuid.UUID,
        log_date: date,
        completed: bool,
        value: Optional[float] = None,
    ) -> Tuple[Habit, HabitLog]:
        """
        Registra o actualiza el check-in diario de un hábito y recalcula
        racha actual, racha histórica y nivel Lally.
        """
        habit = await cls.get_habit_by_id(db, habit_id)
        if not habit:
            raise ValueError("Habit not found")

        zone = cls.evaluate_zone(habit.input_type, habit.target_value, value, completed)

        # Buscar log existente para esa fecha
        log_query = select(HabitLog).where(
            and_(HabitLog.habit_id == habit_id, HabitLog.log_date == log_date)
        )
        log = (await db.execute(log_query)).scalar_one_or_none()

        is_completed = zone != "NONE"

        if log:
            log.completed = is_completed
            log.value = value
            log.zone = zone
        else:
            log = HabitLog(
                id=uuid.uuid4(),
                habit_id=habit_id,
                log_date=log_date,
                completed=is_completed,
                value=value,
                zone=zone,
            )
            db.add(log)

        await db.flush()

        # Recalcular rachas y niveles
        await cls._recalculate_habit_metrics(db, habit)
        await db.commit()
        await db.refresh(habit)
        await db.refresh(log)

        return habit, log

    @classmethod
    async def remove_check_in(
        cls, db: AsyncSession, habit_id: uuid.UUID, log_date: date
    ) -> Habit:
        """Elimina un check-in de una fecha específica."""
        habit = await cls.get_habit_by_id(db, habit_id)
        if not habit:
            raise ValueError("Habit not found")

        delete_stmt = delete(HabitLog).where(
            and_(HabitLog.habit_id == habit_id, HabitLog.log_date == log_date)
        )
        await db.execute(delete_stmt)
        await db.flush()

        await cls._recalculate_habit_metrics(db, habit)
        await db.commit()
        await db.refresh(habit)
        return habit

    @classmethod
    async def _recalculate_habit_metrics(cls, db: AsyncSession, habit: Habit) -> None:
        """Recalcula streak_current, streak_best y level para un hábito."""
        # Obtener todos los logs completados
        query = select(HabitLog).where(
            and_(HabitLog.habit_id == habit.id, HabitLog.completed.is_(True))
        ).order_by(HabitLog.log_date.asc())
        logs = list((await db.execute(query)).scalars().all())

        completed_dates = {l.log_date for l in logs}
        habit.level = cls.recalc_level(len(completed_dates))

        # Calcular racha diaria desde hoy hacia atrás
        today = datetime.utcnow().date()
        scheduled_set = set(habit.scheduled_days or [1, 2, 3, 4, 5, 6, 7])

        streak = 0
        for i in range(365):
            day_cursor = today - timedelta(days=i)
            iso_weekday = day_cursor.isoweekday()  # 1=Lunes .. 7=Domingo
            if iso_weekday not in scheduled_set:
                continue  # Día no programado no rompe racha

            if day_cursor in completed_dates:
                streak += 1
            else:
                # Si hoy todavía no se completó, no rompe racha si ayer sí se completó
                if i == 0:
                    continue
                break

        habit.streak_current = streak
        if streak > habit.streak_best:
            habit.streak_best = streak

    @classmethod
    async def update_habit(
        cls,
        db: AsyncSession,
        habit_id: uuid.UUID,
        title: Optional[str] = None,
        scheduled_days: Optional[List[int]] = None,
        target_value: Optional[float] = None,
        unit: Optional[str] = None,
        tags: Optional[List[str]] = None,
        duration: Optional[str] = None,
    ) -> Habit:
        """Actualiza la configuración de un hábito."""
        habit = await cls.get_habit_by_id(db, habit_id)
        if not habit:
            raise ValueError("Habit not found")

        if title is not None:
            habit.title = title
        if scheduled_days is not None:
            habit.scheduled_days = scheduled_days if len(scheduled_days) > 0 else [1, 2, 3, 4, 5, 6, 7]
        if target_value is not None:
            habit.target_value = target_value
        if unit is not None:
            habit.unit = unit
        if tags is not None:
            habit.tags = tags
        if duration is not None:
            habit.duration = duration

        habit.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(habit)
        return habit

    @classmethod
    async def soft_delete_habit(cls, db: AsyncSession, habit_id: uuid.UUID) -> bool:
        """Desactiva un hábito (soft-delete)."""
        habit = await cls.get_habit_by_id(db, habit_id)
        if not habit:
            return False

        habit.is_active = False
        habit.updated_at = datetime.utcnow()
        await db.commit()
        return True

    @classmethod
    async def calculate_client_adherence(cls, db: AsyncSession, client_id: uuid.UUID) -> Dict[str, Any]:
        """Calcula estadísticas consolidadas de adherencia y racha del atleta."""
        habits = await cls.get_client_habits(db, client_id)
        if not habits:
            return {"adherence_pct": 0, "active_habits_count": 0, "daily_streak": 0}

        total_prescribed = 0
        total_completed = 0
        now = datetime.utcnow().date()

        for h in habits:
            days_active = max(1, (now - h.start_date).days + 1)
            scheduled_fraction = len(h.scheduled_days or [1, 2, 3, 4, 5, 6, 7]) / 7.0
            prescribed_count = max(1, round(days_active * scheduled_fraction))
            completed_count = len([l for l in h.logs if l.completed])

            total_prescribed += prescribed_count
            total_completed += completed_count

        adherence_pct = min(100, round((total_completed / total_prescribed) * 100)) if total_prescribed > 0 else 0

        # Racha global: mayor racha actual entre todos sus hábitos
        max_streak = max([h.streak_current for h in habits]) if habits else 0

        return {
            "adherence_pct": adherence_pct,
            "active_habits_count": len(habits),
            "daily_streak": max_streak,
        }
