import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useCeremonyStore } from '../stores/useCeremonyStore';

export const useCanvasWebSocket = (token: string | null) => {
  const queryClient = useQueryClient();
  const triggerShatteringEffect = useCeremonyStore((state: any) => state.triggerShatteringEffect);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backoffRef = useRef(1000); // Start with 1s

  // Phase 61: Buffer Logarítmico para Atenuación de Saturación Hedónica Offline
  const eventBufferRef = useRef<number>(0);
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const HEARTBEAT_INTERVAL = 45000; // 45 seconds timeout for zombie connections

  const processBufferedEvents = () => {
    const count = eventBufferRef.current;
    eventBufferRef.current = 0; // reset
    if (count === 0) return;

    if (count === 1) {
      triggerShatteringEffect(); 
    } else if (count >= 2 && count <= 3) {
      toast(`¡Ceremonia Consolidada! ${count} logros desbloqueados.`, { icon: '🔥', duration: 4000 });
      triggerShatteringEffect(); 
    } else if (count >= 4) {
      toast(`¡Ceremonia Épica! Mientras estabas fuera conquistaste ${count} hitos.`, { icon: '🏆', duration: 6000 });
      triggerShatteringEffect(); 
    }
  };

  const getTenantIdFromToken = (jwt: string): string | null => {
      try {
          const payload = JSON.parse(atob(jwt.split('.')[1]));
          return payload.tenant_id || "CHAOS_001";
      } catch {
          return "CHAOS_001";
      }
  };

  const connect = () => {
    // Protocolo seguro WS nativo (Zero-Trust)
    const tenantId = getTenantIdFromToken(token!);
    const wsUrl = `ws://localhost:8000/api/v1/ws/tenant/${tenantId}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const resetHeartbeat = () => {
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      heartbeatTimeoutRef.current = setTimeout(() => {
        console.warn("WebSocket zombie connection detected (no heartbeat). Closing...");
        ws.close();
      }, HEARTBEAT_INTERVAL);
    };

    ws.onopen = () => {
      console.log("WebSocket connected");
      backoffRef.current = 1000; // Reset backoff on success
      resetHeartbeat();
      // Opción Simple: Query Fallback. Invalida al reconectar por si hubo microcortes.
      queryClient.invalidateQueries({ queryKey: ['canvas', 'current'] });
    };

    ws.onmessage = (event) => {
      resetHeartbeat(); // Recibir cualquier mensaje resetea el timer zombi
      
      try {
        const payload = JSON.parse(event.data);

        if (payload.event_type === 'PING') {
          // Responder al ping del servidor
          ws.send("PONG");
        } else if (payload.event_type === 'VALIDATION_APPROVED' || payload.event_type === 'SHATTERING_GLASS') {
          // 1. Orquestar el bucle de dopamina visual con Atenuación Logarítmica
          eventBufferRef.current += 1;
          if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
          bufferTimeoutRef.current = setTimeout(processBufferedEvents, 500);
          
          // 2. Hidratar los nuevos datos calculados sin refrescar la página (TanStack Query)
          // Esto delega la resiliencia en React Query para buscar la verdad absoluta de Postgres
          queryClient.invalidateQueries({ queryKey: ['canvas', 'current'] });
        } else if (payload.event_type === 'PROTOCOL_UPDATED') {
          // Fase 11: Mantenemos idempotencia comparando versiones o simplemente notificando al atleta
          // y actualizando en segundo plano para no romper su input actual.
          toast('Tu entrenador ha actualizado tu plan en tiempo real.', {
            icon: '⚡',
            position: 'top-center'
          });
          queryClient.invalidateQueries({ queryKey: ['athlete-routine'] });
        }
      } catch (err) {
        console.error("Error parsing WS message", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
    
    ws.onclose = () => {
      console.log("WebSocket closed. Attempting reconnect...");
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
      
      // Exponential backoff reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        backoffRef.current = Math.min(backoffRef.current * 1.5, 30000); // Max 30s
        connect();
      }, backoffRef.current);
    };
  };

  useEffect(() => {
    if (token) {
      connect();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
      if (wsRef.current) {
        // Prevent onclose logic from triggering reconnect on unmount
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [token]);
};
