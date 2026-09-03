"""
ONBOARDING B2B2C MODELS
Maneja la persistencia de la Matriz Clínica (Escudo de Responsabilidad), 
el Estilo de Vida y las Transacciones de MercadoPago (Lead-to-Cash).
"""

from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

try:
    from app.db.base import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()


class ClinicalHistory(Base):
    """
    El Escudo Clínico. Almacena la telemetría del AnatomicalInjuryMap.
    """
    __tablename__ = "clinical_histories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, index=True, nullable=False) # FK al Tenant/Patient
    
    # Anatomical Injury Map Payload
    # Schema esperado: [{"zone": "Rodilla", "type": "Articular", "pain_level": "High"}]
    injuries = Column(JSONB, default=list) 
    
    # Metadata Clínica
    medications = Column(Text, nullable=True)
    smoker = Column(Boolean, default=False)
    last_medical_checkup = Column(String, nullable=True)
    
    # UX Híbrida: Estilo de comunicación elegido por el paciente para el Agente IA
    communication_style = Column(String, default="Standard")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LifestyleProfile(Base):
    """
    Persistencia de los PedagogicalSliders para reducir carga cognitiva.
    Valores del 1 al 5 mapeados a descripciones pedagógicas en el Frontend.
    """
    __tablename__ = "lifestyle_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, index=True, nullable=False)
    
    # Pedagogical Sliders (Escalas 1 al 5)
    activity_level = Column(Integer, default=3)
    training_experience = Column(Integer, default=1)
    eating_out_frequency = Column(Integer, default=3)
    
    current_diet = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class OnboardingTransaction(Base):
    """
    Lead-to-Cash Automático. Gestiona el enrutamiento dinámico de precios 
    y el estado de los webhooks de MercadoPago.
    """
    __tablename__ = "onboarding_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, index=True, nullable=False)
    
    # El Plan seleccionado (Standard, Personalizada, ID PLAN) inyectado por el Magic Link
    plan_tier_id = Column(String, nullable=False) 
    
    # Integración MercadoPago
    mp_preference_id = Column(String, nullable=True)
    mp_init_point = Column(String, nullable=True) # Link de checkout
    
    # Estado transaccional ('pending', 'paid', 'failed')
    payment_status = Column(String, default="pending")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
