"""
Biomechanical Swap Engine Service - "Bóveda Global y Filtro McGill"
Module C: Sustitución Biomecánica Inteligente de Ejercicios

Este motor se encarga de sugerir alternativas seguras para un ejercicio
dado, aplicando restricciones duras (Hard Constraints) basadas en las
lesiones o el perfil del cliente (Arquetipo/Tags).
"""

from typing import List
from sqlalchemy.orm import Session

from app.db.models import Exercise

class BiomechanicalSwapEngine:
    """
    Servicio de sustitución de ejercicios (Biomechanical Swap Engine).
    Utiliza taxonomía de 11 columnas para encontrar reemplazos biomecánicamente idénticos
    pero seguros para las patologías del cliente.
    """
    
    def __init__(self):
        # Mapeo de Hard Constraints (Filtro McGill y otros)
        self.HARD_CONSTRAINTS = {
            "inj_lower_back": {
                "exclude_axial_load": True,
                "exclude_impact": ["Alto"]
            },
            "inj_knees": {
                "exclude_impact": ["Alto", "Medio"]
            },
            "inj_shoulders": {
                # Ejemplo: Limitar ejercicios de empuje vertical
                "exclude_patterns": ["Empuje Vertical"]
            }
        }
    
    def get_alternatives(
        self, 
        db: Session, 
        target_exercise_id: str, 
        client_tags: List[str]
    ) -> List[Exercise]:
        """
        Obtiene alternativas seguras para un ejercicio objetivo, aplicando
        filtros de exclusión basados en los tags del cliente.
        
        Args:
            db: Sesión de SQLAlchemy
            target_exercise_id: ID del ejercicio a sustituir
            client_tags: Lista de etiquetas del cliente (e.g. ['inj_lower_back', 'freq_low'])
            
        Returns:
            Lista de objetos Exercise alternativos.
        """
        # 1. Obtener el ejercicio objetivo para conocer su patrón de movimiento
        target = db.query(Exercise).filter(Exercise.exercise_id == target_exercise_id).first()
        if not target:
            return []
            
        # 2. Iniciar query base buscando el MISMO patrón de movimiento
        query = db.query(Exercise).filter(
            Exercise.movement_pattern == target.movement_pattern,
            Exercise.exercise_id != target_exercise_id
        )
        
        # 3. Aplicar "Filtro McGill" y otros Hard Constraints
        exclude_axial = False
        exclude_impacts = set()
        exclude_patterns = set()
        
        for tag in client_tags:
            if tag in self.HARD_CONSTRAINTS:
                constraint = self.HARD_CONSTRAINTS[tag]
                
                if constraint.get("exclude_axial_load"):
                    exclude_axial = True
                    
                if "exclude_impact" in constraint:
                    exclude_impacts.update(constraint["exclude_impact"])
                    
                if "exclude_patterns" in constraint:
                    exclude_patterns.update(constraint["exclude_patterns"])
        
        # Aplicar reglas SQL
        if exclude_axial:
            query = query.filter(Exercise.axial_load == False)
            
        if exclude_impacts:
            query = query.filter(Exercise.joint_impact.notin_(list(exclude_impacts)))
            
        if exclude_patterns:
            query = query.filter(Exercise.movement_pattern.notin_(list(exclude_patterns)))
            
        # 4. Ordenar por Nivel de Habilidad (priorizar ejercicios accesibles)
        # Podría conectarse al inventario B2B del gimnasio en el futuro para cruzar con equipment_required
        return query.order_by(Exercise.skill_level.asc()).limit(5).all()

# Singleton
biomechanical_swap_engine = BiomechanicalSwapEngine()
