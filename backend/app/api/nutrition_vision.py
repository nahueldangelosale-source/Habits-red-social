import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional
import base64

from app.middleware.auth import get_current_user, TokenData
from app.services.nutrition_vision import (
    NutritionVisionService, 
    ImageAnalysisRequest, 
    ImageAnalysisResponse
)

router = APIRouter(prefix="/api/v1/nutrition-vision", tags=["Nutrition Vision"])

@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_meal_image(
    request: ImageAnalysisRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Analiza una imagen de comida en Base64 utilizando GPT-4o Vision (Nutrium Killer).
    Devuelve desglose de ingredientes, gramos estimados y macronutrientes.
    """
    try:
        service = NutritionVisionService()
        result = await service.analyze_image(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al analizar la imagen: {str(e)}"
        )

@router.post("/analyze-file", response_model=ImageAnalysisResponse)
async def analyze_meal_file(
    file: UploadFile = File(...),
    meal_type: Optional[str] = Form(None),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Permite subir un archivo de imagen directo (multipart/form-data) para análisis nutricional.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo proporcionado debe ser una imagen válida (JPEG, PNG, WebP)"
        )

    try:
        contents = await file.read()
        base64_img = base64.b64encode(contents).decode("utf-8")
        
        request = ImageAnalysisRequest(
            image_base64=base64_img,
            client_id=current_user.user_id if isinstance(current_user.user_id, uuid.UUID) else uuid.UUID(str(current_user.user_id)),
            meal_type=meal_type
        )
        
        service = NutritionVisionService()
        result = await service.analyze_image(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar archivo de imagen: {str(e)}"
        )
