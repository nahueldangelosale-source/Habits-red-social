import uuid
import pytest
from datetime import datetime, timedelta
from jose import jwt
from fastapi import HTTPException

from app.domain.scheduling.security import create_attendance_token, decode_attendance_token, AttendanceTokenData
from app.config import get_settings

settings = get_settings()

def test_create_and_decode_valid_token():
    user_id = uuid.uuid4()
    res_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    
    token = create_attendance_token(user_id, res_id, tenant_id)
    
    decoded = decode_attendance_token(token)
    assert decoded.user_id == user_id
    assert decoded.reservation_id == res_id
    assert decoded.tenant_id == tenant_id

def test_token_expired_but_within_leeway():
    user_id = uuid.uuid4()
    res_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    
    # Simular un token que expiró hace 5 segundos (leeway es 10)
    now = datetime.utcnow()
    expire = now - timedelta(seconds=5)
    
    payload = {
        "sub": str(user_id),
        "res_id": str(res_id),
        "tenant_id": str(tenant_id),
        "type": "attendance_qr",
        "exp": expire,
        "iat": now - timedelta(seconds=35),
        "jti": str(uuid.uuid4())
    }
    
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    
    # Debería decodificarse correctamente gracias al leeway
    decoded = decode_attendance_token(token)
    assert decoded.user_id == user_id

def test_token_expired_outside_leeway():
    user_id = uuid.uuid4()
    res_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    
    # Simular un token que expiró hace 15 segundos (leeway es 10)
    now = datetime.utcnow()
    expire = now - timedelta(seconds=15)
    
    payload = {
        "sub": str(user_id),
        "res_id": str(res_id),
        "tenant_id": str(tenant_id),
        "type": "attendance_qr",
        "exp": expire,
        "iat": now - timedelta(seconds=45),
        "jti": str(uuid.uuid4())
    }
    
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    
    # Debería lanzar error por estar fuera del leeway
    with pytest.raises(HTTPException) as excinfo:
        decode_attendance_token(token)
    
    assert excinfo.value.status_code == 401
    assert "Token expirado o inválido" in excinfo.value.detail

def test_invalid_token_type():
    user_id = uuid.uuid4()
    
    now = datetime.utcnow()
    expire = now + timedelta(seconds=30)
    
    payload = {
        "sub": str(user_id),
        "type": "wrong_type",
        "exp": expire,
        "iat": now
    }
    
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    
    with pytest.raises(HTTPException) as excinfo:
        decode_attendance_token(token)
        
    assert excinfo.value.status_code == 400
    assert "Tipo de token inválido para asistencia" in excinfo.value.detail
