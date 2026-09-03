"""
Fine-grained spelling and typography polisher for docs/roadmap/roadmap_b2b2c_estrategico.md and docs/auditoria/auditoria_operativa_junio_2026.md
"""

import re

CORRECTIONS = [
    (r'\bViscin\b', 'Visión'),
    (r'\bviscin\b', 'visión'),
    (r'ccin\b', 'cción'),
    (r'ccines\b', 'cciones'),
    (r'\bómdulo\b', 'módulo'),
    (r'\bómdulos\b', 'módulos'),
    (r'\bónueva\b', 'nueva'),
    (r'\bónuevas\b', 'nuevas'),
    (r'\bónuevo\b', 'nuevo'),
    (r'\bónuevos\b', 'nuevos'),
    (r'\bómás\b', 'más'),
    (r'\bómíónimo\b', 'mínimo'),
    (r'\bCogónitive\b', 'Cognitive'),
    (r'\bcogónitive\b', 'cognitive'),
    (r'\bIgónite\b', 'Ignite'),
    (r'\bigónite\b', 'ignite'),
    (r'\basíóncrono\b', 'asíncrono'),
    (r'\basíóncrona\b', 'asíncrona'),
    (r'\bClíónico\b', 'Clínico'),
    (r'\bclíónico\b', 'clínico'),
    (r'\bOrgáónico\b', 'Orgánico'),
    (r'\borgáónico\b', 'orgánico'),
    (r'\bdisoónaóncia\b', 'disonancia'),
    (r'\bcogónitiva\b', 'cognitiva'),
    (r'\bcogónitivo\b', 'cognitivo'),
    (r'\bFisiología/Nutriccin\b', 'Fisiología/Nutrición'),
    (r'\bNutriccin\b', 'Nutrición'),
    (r'\bCoógónitive\b', 'Cognitive'),
    (r'\bIónyecc\b', 'Inyecc'),
    (r'\bIónyect\b', 'Inyect'),
    (r'\biónyect\b', 'inyect'),
    (r'\beóndpoiónt\b', 'endpoint'),
    (r'\bEóndpoiónt\b', 'Endpoint'),
    (r'\bcoóntrato\b', 'contrato'),
    (r'\bCoóntrato\b', 'Contrato'),
    (r'\breeómplaza\b', 'reemplaza'),
    (r'\bReeómplaza\b', 'Reemplaza'),
    (r'\bdeómos\b', 'demos'),
    (r'\bDeómos\b', 'Demos'),
    (r'\bSkeletoón\b', 'Skeleton'),
    (r'\bskeletoón\b', 'skeleton'),
    (r'\bBeónto\b', 'Bento'),
    (r'\bbeónto\b', 'bento'),
    (r'\bproógreso\b', 'progreso'),
    (r'\bProógreso\b', 'Progreso'),
    (r'\bdiagnstico\b', 'diagnóstico'),
    (r'\bDiagnstico\b', 'Diagnóstico'),
    (r'\bautnomo\b', 'autónomo'),
    (r'\bautnoma\b', 'autónoma'),
    (r'\bmetodologa\b', 'metodología'),
    (r'\bMetodologa\b', 'Metodología'),
    (r'\btecnologa\b', 'tecnología'),
    (r'\bTecnologa\b', 'Tecnología'),
    (r'\bcompaa\b', 'compañía'),
    (r'\bCompaa\b', 'Compañía'),
    (r'\banlisis\b', 'análisis'),
    (r'\bAnlisis\b', 'Análisis'),
    (r'\bautomtico\b', 'automático'),
    (r'\bAutomtico\b', 'Automático'),
    (r'\bautomtica\b', 'automática'),
    (r'\bAutomtica\b', 'Automática'),
    (r'\bautnomamente\b', 'autónomamente'),
    (r'\bptimo\b', 'óptimo'),
    (r'\bptima\b', 'óptima'),
    (r'\bptimos\b', 'óptimos'),
    (r'\bptimas\b', 'óptimas'),
    (r'\bPtimo\b', 'Óptimo'),
    (r'\bPtima\b', 'Óptima'),
    (r'\bparmetro\b', 'parámetro'),
    (r'\bparmetros\b', 'parámetros'),
    (r'\bParmetro\b', 'Parámetro'),
    (r'\bParmetros\b', 'Parámetros'),
    (r'\bparamtrico\b', 'paramétrico'),
    (r'\bparamtrica\b', 'paramétrica'),
    (r'\bparamtricos\b', 'paramétricos'),
    (r'\bparamtricas\b', 'paramétricas'),
    (r'\bParamtrico\b', 'Paramétrico'),
    (r'\bParamtrica\b', 'Paramétrica'),
    (r'\bcrdito\b', 'crédito'),
    (r'\bcrditos\b', 'créditos'),
    (r'\bCrdito\b', 'Crédito'),
    (r'\bCrditos\b', 'Créditos'),
    (r'\bdebito\b', 'débito'),
    (r'\bDebito\b', 'Débito'),
]

def polish_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for pattern, repl in CORRECTIONS:
        content = re.sub(pattern, repl, content)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Pulido exitosamente: {file_path}")

polish_file('docs/roadmap/roadmap_b2b2c_estrategico.md')
polish_file('docs/auditoria/auditoria_operativa_junio_2026.md')
