import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any

from sqlalchemy import select, func, and_, or_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import NutritionPlan, SaraFoodItem, Recipe, NutritionLog
from app.schemas.nutrition_plan import NutritionPlanCreate, NutritionPlanUpdate

class NutritionRepository:
    """
    Repositorio de acceso a datos para el Módulo de Nutrición.
    Asegura Aislamiento Multi-Tenant y operaciones atómicas sobre planes, recetas, SARA 2 y logs.
    """
    def __init__(self, session: AsyncSession, tenant_id: uuid.UUID):
        self._session = session
        self._tenant_id = tenant_id

    # -------------------------------------------------------------------------
    # 1. Catálogo SARA 2 (Alimentos ENNyS 2)
    # -------------------------------------------------------------------------
    async def search_foods(
        self, 
        query_str: Optional[str] = None, 
        category: Optional[str] = None,
        limit: int = 50, 
        offset: int = 0
    ) -> Tuple[List[SaraFoodItem], int]:
        """
        Búsqueda paginada en el catálogo SARA 2 de alimentos con soporte para búsqueda insensible a mayúsculas/minúsculas.
        """
        stmt = select(SaraFoodItem)
        count_stmt = select(func.count()).select_from(SaraFoodItem)

        filters = []
        if query_str and query_str.strip():
            term = f"%{query_str.strip()}%"
            filters.append(SaraFoodItem.name.ilike(term))
        if category and category.strip():
            filters.append(SaraFoodItem.category == category.strip())

        if filters:
            stmt = stmt.where(and_(*filters))
            count_stmt = count_stmt.where(and_(*filters))

        total_res = await self._session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.order_by(SaraFoodItem.name.asc()).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_food_by_id(self, food_id: uuid.UUID) -> Optional[SaraFoodItem]:
        """Obtiene un alimento SARA 2 por ID."""
        stmt = select(SaraFoodItem).where(SaraFoodItem.id == food_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    # -------------------------------------------------------------------------
    # 2. Nutrition Plans (Planes Nutricionales)
    # -------------------------------------------------------------------------
    def _base_plan_query(self):
        """Regla de Oro: Filtrar siempre por tenant_id."""
        return select(NutritionPlan).where(NutritionPlan.tenant_id == self._tenant_id)

    async def list_plans(
        self, 
        client_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[NutritionPlan]:
        """Lista planes nutricionales del tenant, opcionalmente filtrados por client_id."""
        query = self._base_plan_query()
        if client_id:
            query = query.where(NutritionPlan.client_id == client_id)
        query = query.order_by(NutritionPlan.created_at.desc()).offset(skip).limit(limit)
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def get_plan_by_id(self, plan_id: uuid.UUID) -> Optional[NutritionPlan]:
        """Obtiene un plan nutricional específico con verificación de tenant."""
        query = self._base_plan_query().where(NutritionPlan.id == plan_id)
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_active_plan_for_client(self, client_id: uuid.UUID) -> Optional[NutritionPlan]:
        """Obtiene el plan nutricional más reciente para un cliente."""
        query = self._base_plan_query().where(
            NutritionPlan.client_id == client_id
        ).order_by(NutritionPlan.created_at.desc()).limit(1)
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def create_plan(
        self, 
        professional_id: uuid.UUID, 
        plan_data: NutritionPlanCreate
    ) -> NutritionPlan:
        """Crea un nuevo plan nutricional de forma multi-tenant."""
        new_plan = NutritionPlan(
            id=uuid.uuid4(),
            tenant_id=self._tenant_id,
            professional_id=professional_id,
            client_id=plan_data.client_id,
            title=plan_data.title,
            daily_macros_target=plan_data.daily_macros_target.model_dump(),
            meals=[meal.model_dump() for meal in plan_data.meals]
        )
        self._session.add(new_plan)
        await self._session.commit()
        await self._session.refresh(new_plan)
        return new_plan

    async def update_plan(
        self, 
        plan_id: uuid.UUID, 
        plan_data: NutritionPlanUpdate
    ) -> Optional[NutritionPlan]:
        """Actualiza un plan nutricional existente respetando tenant isolation."""
        plan = await self.get_plan_by_id(plan_id)
        if not plan:
            return None

        update_data = plan_data.model_dump(exclude_unset=True)
        if "title" in update_data and update_data["title"] is not None:
            plan.title = update_data["title"]
        if "daily_macros_target" in update_data and update_data["daily_macros_target"] is not None:
            plan.daily_macros_target = update_data["daily_macros_target"]
        if "meals" in update_data and update_data["meals"] is not None:
            plan.meals = update_data["meals"]

        plan.updated_at = datetime.now(timezone.utc)
        await self._session.commit()
        await self._session.refresh(plan)
        return plan

    async def delete_plan(self, plan_id: uuid.UUID) -> bool:
        """Elimina un plan nutricional dentro del tenant."""
        plan = await self.get_plan_by_id(plan_id)
        if not plan:
            return False
        await self._session.delete(plan)
        await self._session.commit()
        return True

    # -------------------------------------------------------------------------
    # 3. Recetas (Recipes)
    # -------------------------------------------------------------------------
    def _base_recipe_query(self):
        return select(Recipe).where(Recipe.tenant_id == self._tenant_id)

    async def list_recipes(self, skip: int = 0, limit: int = 50) -> List[Recipe]:
        """Lista recetas del tenant."""
        query = self._base_recipe_query().order_by(Recipe.created_at.desc()).offset(skip).limit(limit)
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def get_recipe_by_id(self, recipe_id: uuid.UUID) -> Optional[Recipe]:
        """Obtiene una receta por ID."""
        query = self._base_recipe_query().where(Recipe.id == recipe_id)
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def create_recipe(
        self,
        professional_id: uuid.UUID,
        title: str,
        ingredients: List[Dict[str, Any]],
        macros: Dict[str, Any],
        instructions: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> Recipe:
        """Crea una nueva receta."""
        new_recipe = Recipe(
            id=uuid.uuid4(),
            tenant_id=self._tenant_id,
            professional_id=professional_id,
            title=title,
            ingredients=ingredients,
            macros=macros,
            instructions=instructions,
            tags=tags or []
        )
        self._session.add(new_recipe)
        await self._session.commit()
        await self._session.refresh(new_recipe)
        return new_recipe

    async def delete_recipe(self, recipe_id: uuid.UUID) -> bool:
        """Elimina una receta."""
        recipe = await self.get_recipe_by_id(recipe_id)
        if not recipe:
            return False
        await self._session.delete(recipe)
        await self._session.commit()
        return True

    # -------------------------------------------------------------------------
    # 4. Meal Logs & Adherencia (Diario de Comidas)
    # -------------------------------------------------------------------------
    async def create_meal_log(
        self,
        client_id: uuid.UUID,
        raw_text: str,
        estimated_calories: Optional[float] = None,
        estimated_protein: Optional[float] = None,
        estimated_carbs: Optional[float] = None,
        estimated_fat: Optional[float] = None,
        parsed_items: Optional[List[Dict[str, Any]]] = None
    ) -> NutritionLog:
        """Crea un registro de comida en el diario nutricional del atleta."""
        log = NutritionLog(
            id=uuid.uuid4(),
            tenant_id=self._tenant_id,
            client_id=client_id,
            raw_text=raw_text,
            estimated_calories=estimated_calories,
            estimated_protein=estimated_protein,
            estimated_carbs=estimated_carbs,
            estimated_fat=estimated_fat,
            parsed_items=parsed_items or []
        )
        self._session.add(log)
        await self._session.commit()
        await self._session.refresh(log)
        return log

    async def list_meal_logs_for_client(
        self, 
        client_id: uuid.UUID, 
        skip: int = 0, 
        limit: int = 50
    ) -> List[NutritionLog]:
        """Lista registros de comidas de un atleta."""
        stmt = select(NutritionLog).where(
            and_(
                NutritionLog.tenant_id == self._tenant_id,
                NutritionLog.client_id == client_id
            )
        ).order_by(NutritionLog.created_at.desc()).offset(skip).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
