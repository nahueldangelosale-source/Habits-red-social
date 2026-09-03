import uuid
from typing import List, Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import WorkoutPlan, WorkoutDay, SupersetGroup, ExerciseTarget
from app.schemas.fitness import WorkoutPlanCreate

class WorkoutRepository:
    """
    Repositorio de acceso a datos para WorkoutBuilder.
    Asegura Aislamiento Multi-Tenant y Soft Deletes a nivel de consulta.
    """
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID):
        self._session = session
        self._tenant_id = tenant_id

    def _base_query(self):
        """Regla de Oro: Todo query debe filtrar por tenant_id y no estar borrado."""
        return select(WorkoutPlan).where(
            WorkoutPlan.tenant_id == self._tenant_id,
            WorkoutPlan.is_deleted == False
        )

    async def list_plans(self, client_id: Optional[uuid.UUID] = None) -> List[WorkoutPlan]:
        """Lista los planes, filtrables opcionalmente por client_id."""
        query = self._base_query()
        if client_id:
            query = query.where(WorkoutPlan.client_id == client_id)
        
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def get_plan_with_details(self, plan_id: uuid.UUID) -> Optional[WorkoutPlan]:
        """
        Obtiene un plan específico. Las relaciones se cargarán de forma diferida (lazy)
        o mediante refresco explícito para evitar errores de caché de asyncpg.
        """
        query = self._base_query().where(WorkoutPlan.id == plan_id)
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def create_plan(self, professional_id: uuid.UUID, plan_data: WorkoutPlanCreate) -> WorkoutPlan:
        """
        Crea de forma transaccional un plan y todos sus días, superseries y ejercicios,
        asignando a todos los hijos el mismo tenant_id.
        """
        new_plan = WorkoutPlan(
            tenant_id=self._tenant_id,
            professional_id=professional_id,
            client_id=plan_data.client_id,
            title=plan_data.title,
            description=plan_data.description
        )
        
        for day_data in plan_data.days:
            new_day = WorkoutDay(
                tenant_id=self._tenant_id,
                name=day_data.name,
                order=day_data.order,
                plan=new_plan
            )
            for superset_data in day_data.supersets:
                new_superset = SupersetGroup(
                    tenant_id=self._tenant_id,
                    order=superset_data.order,
                    notes=superset_data.notes,
                    day=new_day
                )
                for exercise_data in superset_data.exercises:
                    new_exercise = ExerciseTarget(
                        tenant_id=self._tenant_id,
                        exercise_id=exercise_data.exercise_id,
                        order=exercise_data.order,
                        sets=exercise_data.sets,
                        reps=exercise_data.reps,
                        rpe=exercise_data.rpe,
                        weight=exercise_data.weight,
                        rest_seconds=exercise_data.rest_seconds,
                        notes=exercise_data.notes,
                        superset_group=new_superset
                    )
                    self._session.add(new_exercise)
                self._session.add(new_superset)
            self._session.add(new_day)
        
        self._session.add(new_plan)
        # Flush is handled contextually by unit of work / API route commit
        return new_plan

    async def soft_delete_plan(self, plan_id: uuid.UUID) -> bool:
        """Aplica soft-delete seguro por tenant."""
        stmt = (
            update(WorkoutPlan)
            .where(
                WorkoutPlan.id == plan_id,
                WorkoutPlan.tenant_id == self._tenant_id,
                WorkoutPlan.is_deleted == False
            )
            .values(is_deleted=True)
        )
        result = await self._session.execute(stmt)
        return result.rowcount > 0
