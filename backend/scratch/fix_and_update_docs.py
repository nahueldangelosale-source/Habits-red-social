"""
Script de Limpieza de Codificación y Actualización Exhaustiva de Documentación Maestra (SSOT)
Bienestar APP - Agosto 2026
"""

import re
import os

UTF8_FIXES = {
    'ðŸ”¬': '🔬',
    'ðŸŸ¢': '🟢',
    'ðŸ”¥': '🔥',
    'ðŸ©º': '🩺',
    'ðŸ”„': '🔄',
    'ðŸ§ª': '🧪',
    'âœ…': '✅',
    'â¬œ': '⬜',
    'âóŒ': '❌',
    'âó„ï¸ó': '❄️',
    'â€”': '—',
    'â†’': '→',
    'â‰≥': '≥',
    'â‰≤': '≤',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã\xad': 'í',
    'Ã\xb3': 'ó',
    'Ã\xa9': 'é',
    'Ã\xa1': 'á',
    'Ã\xba': 'ú',
    'Ã\xb1': 'ñ',
    'Ã“': 'Ó',
    'Ã\x93': 'Ó'
}

def clean_garbled_text(text: str) -> str:
    """Limpia caracteres corruptos y desajustes de codificación."""
    # 1. Reemplazar caracteres corruptos de bytes UTF-8
    for bad, good in UTF8_FIXES.items():
        text = text.replace(bad, good)
        
    # 2. Deshacer inyecciones espurias de 'ó' antes de consonantes (ej: oón -> on, eón -> en, ión -> in, óm -> m, óg -> g)
    text = re.sub(r'oón', 'on', text)
    text = re.sub(r'eón', 'en', text)
    text = re.sub(r'aón', 'an', text)
    text = re.sub(r'uón', 'un', text)
    text = re.sub(r'ióón', 'ción', text)
    text = re.sub(r'ió([a-z])', r'i\1', text)
    text = re.sub(r'óm([a-z])', r'm\1', text)
    text = re.sub(r'óg([a-z])', r'g\1', text)
    text = re.sub(r'deón', 'den', text)
    text = re.sub(r'teón', 'ten', text)
    text = re.sub(r'coón', 'con', text)
    text = re.sub(r'([a-z])ó([mnlsrdptcgbvf])', r'\1\2', text)
    text = re.sub(r'PostógreSQL', 'PostgreSQL', text)
    text = re.sub(r'postógresql', 'postgresql', text)
    text = re.sub(r'Postgresql', 'PostgreSQL', text)
    text = re.sub(r'Postgres', 'PostgreSQL', text)
    text = re.sub(r'Bieónestar', 'Bienestar', text)
    text = re.sub(r'bieónestar', 'bienestar', text)
    
    # 3. Arreglar acentuaciones comunes legítimas
    text = re.sub(r'\bacion\b', 'ación', text)
    text = re.sub(r'\baciones\b', 'aciones', text)
    text = re.sub(r'\bclinico\b', 'clínico', text)
    text = re.sub(r'\bclinica\b', 'clínica', text)
    text = re.sub(r'\bmedico\b', 'médico', text)
    text = re.sub(r'\bmedica\b', 'médica', text)
    text = re.sub(r'\bautonomico\b', 'autonómico', text)
    text = re.sub(r'\bautonomica\b', 'autonómica', text)
    
    return text

print("Módulo de limpieza listo.")
