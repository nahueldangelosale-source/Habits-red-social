import re
from app.db.models import IntentCategory

class IntentClassifierService:
    """
    Sovereign Agora: Pre-procesador superrápido de Intenciones (NLP ligero).
    Usa regex iterativo y priorización keyword-driven en lugar de un LLM pesado 
    para asegurar tiempos de latencia ínfimos por cada mensaje entrante.
    """
    
    # Dictionarios de peso para Intenciones
    KEYWORDS = {
        IntentCategory.NUTRITION: [
            r'diet(a|as)', r'comida', r'alimento', r'proteina', r'carbo', 
            r'ayuno', r'suplemento', r'hambre', r'receta', r'macro', r'caloria'
        ],
        IntentCategory.TRAINING: [
            r'rutina', r'entreno', r'ejercicio', r'reps', r'repeticion', r'serie', 
            r'peso', r'musculo', r'dolor', r'lesion', r'molestia', r'fatiga', 
            r'sentadilla', r'banco', r'pecho', r'espalda', r'pierna'
        ],
        IntentCategory.BILLING: [
            r'pago', r'tarjeta', r'cobro', r'suscripcion', r'factura', r'precio',
            r'mes', r'pagar', r'banco', r'rechazado', r'error'
        ]
    }

    @classmethod
    def categorize(cls, text: str) -> IntentCategory:
        """Categoriza un mensaje en NUTRITION, TRAINING, BILLING o GENERAL."""
        if not text:
            return IntentCategory.GENERAL
            
        text_lower = text.lower()
        
        scores = {
            IntentCategory.NUTRITION: 0,
            IntentCategory.TRAINING: 0,
            IntentCategory.BILLING: 0
        }
        
        for intent, patterns in cls.KEYWORDS.items():
            for pattern in patterns:
                # Buscar ocurrencias del pattern en el texto
                matches = re.findall(pattern, text_lower)
                if matches:
                    scores[intent] += len(matches)
                    
        # Para forzar un empuje "Billing" o "Dolor" hacia arriba, podríamos dar overrides:
        if "error" in text_lower and "pago" in text_lower:
            scores[IntentCategory.BILLING] += 10
            
        if "dolor" in text_lower or "lesion" in text_lower:
            scores[IntentCategory.TRAINING] += 10
            
        # Determinar el ganador
        max_score = 0
        best_intent = IntentCategory.GENERAL
        
        for intent, score in scores.items():
            if score > max_score:
                max_score = score
                best_intent = intent
                
        # Si el puntaje es muy bajo, lo mandamos a general
        if max_score == 0:
            return IntentCategory.GENERAL
            
        return best_intent
