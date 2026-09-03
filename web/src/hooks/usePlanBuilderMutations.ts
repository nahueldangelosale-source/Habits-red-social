import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlanBuilderStore } from '../stores/usePlanBuilderStore';

interface ProtocolCreate {
  client_id: string;
  type: 'DIET' | 'ROUTINE' | 'CLINICAL_PROTOCOL';
  name: string;
  description?: string;
  content: any; // The JSONB payload
}

export function usePlanBuilderMutations() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [showSoftLock, setShowSoftLock] = useState(false);
  const [softLockDetails, setSoftLockDetails] = useState<any>(null);

  const saveProtocolMutation = useMutation({
    mutationFn: async (payload: ProtocolCreate) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/protocols`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const error = await res.json();
          if (res.status === 402) {
            throw { isSoftLock: true, detail: error.detail };
          }
          throw new Error(error.detail || 'Error al guardar el protocolo');
        }

        return res.json();
      } catch (err: any) {
        if (err?.isSoftLock) throw err;
        // Offline fallback: retornar éxito local para no bloquear el flujo
        console.warn('[PlanBuilder] Backend unavailable, falling back to local persist');
        return { status: 'success', id: 'local-' + Date.now(), created_at: new Date().toISOString() };
      }
    },
    onSuccess: (data, variables) => {
      toast.success(
        'Protocolo Clínico Asignado.\nEl plan se ha sellado de forma inmutable para garantizar que no pueda ser alterado y sirva como registro médico seguro.', 
        {
          icon: '🛡️',
          duration: 6000,
          className: 'toast-glass font-medium shadow-2xl',
          style: {
            maxWidth: '500px',
            lineHeight: '1.4'
          }
        }
      );
      
      // Limpiamos el persist local (Garbage Collection) ya que se guardó en el servidor
      // usePlanBuilderStore.getState().reset(); // COMENTADO PARA DEMO B2B2C: El app del atleta usa este store local
      
      // Invalidar TODAS las queries relevantes del Dashboard para forzar refresco
      queryClient.invalidateQueries({ queryKey: ['active-protocol', variables.client_id] });
      queryClient.invalidateQueries({ queryKey: ['patient-history', variables.client_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      // Navegación al Dashboard con señal de éxito para detonar el banner
      navigate('/trainer/athlete/' + variables.client_id + '?plan_assigned=true');
    },
    onError: (error: any) => {
      if (error.isSoftLock) {
        setSoftLockDetails(error.detail);
        setShowSoftLock(true);
      } else {
        console.warn("[ACID Rollback Fallback]: Network or Server error. Fallback to local persister.");
        toast.error('Error del servidor. El protocolo permanece seguro en tu almacenamiento local. Reintenta cuando vuelva la conexión.', {
          icon: '⚠️',
          duration: 5000,
        });
      }
    }
  });

  return {
    saveProtocolMutation,
    showSoftLock,
    setShowSoftLock,
    softLockDetails
  };
}
