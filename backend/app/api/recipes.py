from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
import uuid

from app.db.connection import get_db
from app.middleware.auth import get_current_user, TokenData
from app.db.models import Recipe

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_recipes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtiene la lista de recetas para un tenant específico.
    """
    try:
        tenant_uuid = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
        
        stmt = select(Recipe).where(
            Recipe.tenant_id == tenant_uuid
        ).offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        recipes = result.scalars().all()
        
        # Convertir a dict explícitamente para simplificar el schema
        return [
            {
                "id": str(r.id),
                "title": r.title,
                "ingredients": r.ingredients,
                "macros": r.macros,
                "instructions": r.instructions,
                "tags": r.tags,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in recipes
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/", response_model=dict)
async def create_recipe(
    recipe_in: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crea una nueva receta.
    """
    try:
        tenant_uuid = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
        user_uuid = current_user.user_id if isinstance(current_user.user_id, UUID) else UUID(str(current_user.user_id))
        
        new_recipe = Recipe(
            id=uuid.uuid4(),
            tenant_id=tenant_uuid,
            professional_id=user_uuid,
            title=recipe_in.get("title", "Nueva Receta"),
            ingredients=recipe_in.get("ingredients", []),
            macros=recipe_in.get("macros", {}),
            instructions=recipe_in.get("instructions"),
            tags=recipe_in.get("tags", [])
        )
        
        db.add(new_recipe)
        await db.commit()
        await db.refresh(new_recipe)
        
        return {
            "id": str(new_recipe.id),
            "title": new_recipe.title,
            "ingredients": new_recipe.ingredients,
            "macros": new_recipe.macros,
            "instructions": new_recipe.instructions,
            "tags": new_recipe.tags,
            "created_at": new_recipe.created_at.isoformat() if new_recipe.created_at else None,
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Elimina una receta.
    """
    try:
        tenant_uuid = current_user.tenant_id if isinstance(current_user.tenant_id, UUID) else UUID(str(current_user.tenant_id))
        
        stmt = select(Recipe).where(
            Recipe.id == UUID(recipe_id),
            Recipe.tenant_id == tenant_uuid
        )
        result = await db.execute(stmt)
        recipe = result.scalars().first()
        
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
            
        await db.delete(recipe)
        await db.commit()
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
