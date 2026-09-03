import uuid
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status
from pydantic import BaseModel

from app.config import get_settings

settings = get_settings()

class AttendanceTokenData(BaseModel):
    user_id: uuid.UUID
    reservation_id: uuid.UUID
    tenant_id: uuid.UUID

def create_attendance_token(user_id: uuid.UUID, reservation_id: uuid.UUID, tenant_id: uuid.UUID) -> str:
    """
    Genera un token efímero válido por 30 segundos (TTL corto para evitar capturas de pantalla).
    """
    if not settings.secret_key or settings.secret_key == "dev-secret-key-change-in-production":
        raise ValueError("SECRET_KEY must be set in production")
        
    now = datetime.utcnow()
    expire = now + timedelta(seconds=30)
    
    payload = {
        "sub": str(user_id),
        "res_id": str(reservation_id),
        "tenant_id": str(tenant_id),
        "type": "attendance_qr",
        "exp": expire,
        "iat": now,
        "jti": str(uuid.uuid4())
    }
    
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def decode_attendance_token(token: str) -> AttendanceTokenData:
    """
    Decodifica el token efímero de asistencia.
    Utiliza leeway de 10s para mitigar desincronización de relojes (Clock Skew) según directiva del CTO.
    """
    try:
        # Añadimos margen de gracia de 10 segundos
        payload = jwt.decode(
            token, 
            settings.secret_key, 
            algorithms=[settings.algorithm],
            options={"leeway": 10}
        )
        
        token_type = payload.get("type")
        if token_type != "attendance_qr":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de token inválido para asistencia"
            )
            
        user_id = payload.get("sub")
        res_id = payload.get("res_id")
        tenant_id = payload.get("tenant_id")
        
        if not user_id or not res_id or not tenant_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: faltan claims"
            )
            
        return AttendanceTokenData(
            user_id=uuid.UUID(user_id),
            reservation_id=uuid.UUID(res_id),
            tenant_id=uuid.UUID(tenant_id)
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token expirado o inválido: {str(e)}"
        )
