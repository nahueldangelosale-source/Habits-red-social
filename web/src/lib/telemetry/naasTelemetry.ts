import { useSessionLogStore } from '../../stores/useSessionLogStore';

// Contrato de Datos para Telemetría NaaS
export interface NaaSTelemetryPayload {
  // 1. Identidad y Contexto Base
  event_name: 'modal_v2_viewed' | 'modal_v2_cta_clicked' | 'modal_v2_dismissed' | 'first_plan_v2_created' | 'session_start' | 'plan_published' | 'drag_item_started' | 'drop_item_calculated' | 'value_override_applied' | 'tolerance_warning_shown';
  session_id: string; // Extraído del JWT actual (Mock para MVP)
  timestamp: string;  // Formato ISO 8601 UTC

  // 2. Dimensiones de Segmentación (Inyectadas sincrónicamente desde el Store del cliente)
  user_segment: 'POWER_USER' | 'NEW_USER'; // Basado en la regla de > 10 planes
  ui_version: 'V2_CLEAN' | 'V1_LEGACY'; // Identificador del rediseño

  // 3. Metadatos de Interacción y Rendimiento (Dinámico)
  metadata: {
    // Para eventos de Modal
    time_to_click_ms?: number; 
    dismiss_method?: 'overlay_click' | 'esc_key' | 'close_btn';
    
    // Para el evento first_plan_v2_created
    time_to_complete_seconds?: number; // El TTC calculado desde el inicio del draft hasta el guardado
    interaction_count?: number; // Cantidad de clics/drags (para medir fricción)
    [key: string]: any; // Catch-all temporal para eventos genéricos
  }
}

export const trackNaaSEvent = (
  eventName: NaaSTelemetryPayload['event_name'],
  metadata: Record<string, any> = {}
) => {
  // Fire-and-forget de forma asíncrona para no bloquear el hilo principal
  setTimeout(() => {
    try {
      // 1. Obtener estado cacheado sincrónicamente (sin latencia de DB)
      const state = useSessionLogStore.getState();
      const totalPlansCreated = state.completedSessions.length || 0; // Aproximación para MVP
      
      // 2. Regla de Segmentación (Heurística)
      const user_segment = totalPlansCreated > 10 ? 'POWER_USER' : 'NEW_USER';
      
      const payload: NaaSTelemetryPayload = {
        event_name: eventName,
        session_id: 'mock-session-' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        user_segment,
        ui_version: 'V2_CLEAN',
        metadata
      };

      console.log(`[NaaS Telemetry] ${eventName}`, payload);
      
      // En producción:
      // fetch('/api/v1/telemetry', { method: 'POST', body: JSON.stringify(payload) });
    } catch (e) {
      console.error('[NaaS Telemetry] Error tracking event', e);
    }
  }, 0);
};
