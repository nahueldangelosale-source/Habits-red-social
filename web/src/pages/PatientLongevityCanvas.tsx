import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { CognitiveInsightCard } from '../domains/clinical/components/CognitiveInsightCard';
import type { CognitiveTranslationPayload } from '../domains/clinical/interfaces/CognitiveContract';
import { Activity, Droplets, Moon, Sun, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

export const PatientLongevityCanvas: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const clientId = location.state?.clientId;
  
  const pollAttemptsRef = useRef(0);
  const [isTakingTooLong, setIsTakingTooLong] = useState(false);

  const { data: patient, error, refetch, isFetching } = useQuery({
    queryKey: ['patient', clientId],
    queryFn: async () => {
      if (!clientId) {
        // En desarrollo o navegación directa, retornamos un mock
        return {
          id: 'mock-id',
          extra_data: { dietqa_status: 'COMPLETED' }
        };
      }
      const res = await fetch(`/api/v1/patients/${clientId}`);
      if (!res.ok) throw new Error('Error al obtener el perfil clínico.');
      return res.json();
    },
    refetchInterval: (data: any) => {
      // Compatibility with TanStack Query v4 (data) and v5 (query)
      const payload = data?.state?.data || data; 
      
      if (payload?.extra_data?.dietqa_status === 'PENDING') {
        pollAttemptsRef.current += 1;
        if (pollAttemptsRef.current >= 12) {
          setIsTakingTooLong(true);
          return false; // Circuit Breaker: Stop polling after 12 attempts
        }
        return 3000;
      }
      return false;
    },
    enabled: true // Always run once
  });

  // Derived state from patient payload
  const dietStatus = patient?.extra_data?.dietqa_status || 'PENDING';
  
  const isPending = dietStatus === 'PENDING' && !isTakingTooLong;
  const isFailed = dietStatus === 'FAILED';
  const isCompleted = dietStatus === 'COMPLETED';

  // Mocked Cognitive Payload based on real UI Contract
  const insightPayload: CognitiveTranslationPayload = {
    biomarker: 'glucose_spike',
    raw_value: 145,
    status: 'High',
    professional_view: {
      diagnosis: 'Alta variabilidad glucémica detectada. Riesgo de hipoglucemia reactiva.',
      ui_directive: 'risk-high'
    },
    patient_view: {
      pedagogical_copy: 'El motor DietQA ha compilado tu expediente. Notamos que tu energía puede oscilar hoy. Es completamente normal sentir niebla mental o fatiga después de fluctuaciones de glucosa.',
      education_pill: 'Los picos ocurren cuando los carbohidratos entran al torrente sanguíneo sin un freno. El cuerpo libera una ola de insulina que luego causa un bajón brusco, robándote la energía.',
      actionable_habit: 'Aplica la regla del orden: En tu próxima comida, consume primero vegetales y proteínas. Suma una caminata de 10 minutos post-comida.'
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans selection:bg-green-200 selection:text-slate-800">
      {/* Navbar Minimalista */}
      <nav className="flex justify-between items-center p-6 lg:px-12">
        <h1 className="font-heading font-semibold tracking-wide text-slate-800 text-xl cursor-pointer" onClick={() => navigate('/dashboard')}>
          Bienestar<span className="text-green-200">.Bio</span>
        </h1>
        <div className="flex gap-4">
          <button className="text-slate-500 hover:text-slate-800 transition-colors">
            <Sun size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=32" alt="Patient" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Saludo Diario */}
        <header className="flex flex-col gap-2">
          <p className="text-slate-600 font-heading text-sm uppercase tracking-widest font-semibold">Tus biomarcadores hoy</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-medium text-slate-800 leading-tight">
            Buenos días. <br />
            <span className="text-slate-500">Tu cuerpo necesita equilibrio.</span>
          </h2>
        </header>

        {/* Dynamic State Rendering */}
        <section className="w-full">
          
          {/* STATE 1: PENDING (Skeleton Loader) */}
          {isPending && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-200/50 p-8 max-w-2xl mx-auto flex flex-col items-center justify-center gap-6 text-center animate-pulse">
              <RefreshCw className="w-12 h-12 text-green-200 animate-spin" />
              <div>
                <h3 className="text-xl font-bold font-montserrat text-slate-800 mb-2">Compilando tu Expediente</h3>
                <p className="text-slate-500 font-lato">Nuestro motor cognitivo está cruzando tus biomarcadores con los últimos protocolos médicos.</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div className="w-1/3 h-full bg-green-200 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          {/* STATE 2: CIRCUIT BREAKER (Taking too long) */}
          {isTakingTooLong && dietStatus === 'PENDING' && (
            <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-8 max-w-2xl mx-auto flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
              <h3 className="text-xl font-bold font-montserrat text-amber-900">Está tomando más tiempo de lo habitual</h3>
              <p className="text-amber-700 font-lato">
                El motor clínico está procesando una carga alta de datos. No te preocupes, tu expediente se guardará de forma segura y te notificaremos cuando esté listo.
              </p>
              <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all">
                Volver al Inicio
              </button>
            </div>
          )}

          {/* STATE 3: FAILED (Error State) */}
          {isFailed && (
            <div className="bg-red-50 rounded-2xl shadow-sm border border-red-200 p-8 max-w-2xl mx-auto flex flex-col items-center gap-4 text-center">
              <XCircle className="w-12 h-12 text-red-500" />
              <h3 className="text-xl font-bold font-montserrat text-red-900">Fallo en el Procesamiento Clínico</h3>
              <p className="text-red-700 font-lato">
                Hubo un inconveniente al generar tu protocolo personalizado. Nuestro equipo de soporte técnico ya ha sido notificado.
              </p>
              <button onClick={() => refetch()} className="mt-4 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2">
                <RefreshCw size={18} /> Reintentar Generación
              </button>
            </div>
          )}

          {/* STATE 4: COMPLETED (Actual Content) */}
          {isCompleted && (
            <CognitiveInsightCard 
              biomarkerTitle="Respuesta Glucémica Postprandial" 
              patientView={insightPayload.patient_view} 
            />
          )}

        </section>

        {/* Micro-Hábitos Consistencia */}
        {isCompleted && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto w-full transition-all duration-500 opacity-100">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 opacity-50 grayscale">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Droplets size={18} />
              </div>
              <div>
                <p className="font-heading text-xs uppercase text-slate-400 font-bold">Hidratación</p>
                <p className="text-sm font-sans text-slate-600">2 / 3 Litros</p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 opacity-50 grayscale">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Moon size={18} />
              </div>
              <div>
                <p className="font-heading text-xs uppercase text-slate-400 font-bold">Ayuno</p>
                <p className="text-sm font-sans text-slate-600">14h completadas</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-green-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-200/20 flex items-center justify-center text-slate-800">
                <Activity size={18} />
              </div>
              <div>
                <p className="font-heading text-xs uppercase text-slate-800 font-bold">Pico Activo</p>
                <p className="text-sm font-sans text-slate-800 font-medium">Intervención Requerida</p>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};
export default PatientLongevityCanvas;
