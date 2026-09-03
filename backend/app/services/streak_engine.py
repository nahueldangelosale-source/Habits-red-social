from datetime import datetime, timedelta
import pytz

def get_logical_habit_date(utc_timestamp: datetime, target_timezone_str: str = "America/Argentina/Buenos_Aires") -> datetime.date:
    """
    Night Owl Grace Period Engine (Phase 23)
    -----------------------------------------
    Evalúa a qué "día lógico" pertenece un hábito completado.
    Evita que los usuarios pierdan su racha si terminan su rutina o toman su último
    vaso de agua después de la medianoche. El día termina lógicamente a las 03:00 AM.
    
    Args:
        utc_timestamp: El momento exacto en UTC de la concreción del hábito.
        target_timezone_str: El huso horario configurado para el Tenant.
        
    Returns:
        date: La fecha lógica a la que se debe computar la racha.
    """
    
    try:
        tenant_tz = pytz.timezone(target_timezone_str)
    except pytz.UnknownTimeZoneError:
        # Fallback de seguridad al standard de la App si la config del Tenant está rota
        tenant_tz = pytz.timezone("America/Argentina/Buenos_Aires")
        
    # 1. Convertimos la hora absoluta del servidor (UTC) a la hora local del usuario
    if utc_timestamp.tzinfo is None:
        utc_timestamp = pytz.utc.localize(utc_timestamp)
        
    local_time = utc_timestamp.astimezone(tenant_tz)
    
    # 2. El Offset Nocturno (Night Owl Grace Period)
    # Restamos 3 horas lógicas al timestamp.
    # Ejemplo A: Si son las 02:30 AM del 15 de Marzo, al restar 3h -> 23:30 P.M del 14 de Marzo.
    # Ejemplo B: Si son las 15:00 PM del 15 de Marzo, al restar 3h -> 12:00 P.M del 15 de Marzo.
    offset_time = local_time - timedelta(hours=3)
    
    # 3. Retornamos solo la fecha pura, que es la KEY para la base de datos de rachas
    return offset_time.date()

def is_streak_active(last_habit_logical_date: datetime.date, current_utc_timestamp: datetime, target_timezone_str: str = "America/Argentina/Buenos_Aires") -> bool:
    """
    Verifica si una racha sigue viva comparando el último día lógico registrado
    contra el día lógico actual.
    
    Returns:
        True si la diferencia de días lógicos <= 1.
    """
    current_logical_date = get_logical_habit_date(current_utc_timestamp, target_timezone_str)
    
    delta = current_logical_date - last_habit_logical_date
    return delta.days <= 1
