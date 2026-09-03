import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { emitSignatureEvent } from '../../utils/telemetry';
import { ShieldCheck, X } from 'lucide-react';

interface SignatureModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ onClose, onSuccess }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const lockRoutine = usePlanBuilderStore(state => state.lockRoutine);
  
  const [hasStartedDrawing, setHasStartedDrawing] = useState(false);
  const [mountTime] = useState(Date.now());
  const [firstStrokeTime, setFirstStrokeTime] = useState<number | null>(null);

  useEffect(() => {
    // Bloquear scroll del body al montar
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBeginStroke = () => {
    if (!hasStartedDrawing) {
      setHasStartedDrawing(true);
      setFirstStrokeTime(Date.now());
    }
  };

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setHasStartedDrawing(false);
      setFirstStrokeTime(null);
    }
  };

  const handleApplyLock = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const base64 = sigCanvas.current.toDataURL('image/png');
      const timeToFirstStroke = firstStrokeTime ? firstStrokeTime - mountTime : 0;
      
      // Emit Telemetry
      emitSignatureEvent({
        time_to_first_stroke: timeToFirstStroke,
        completion_status: true,
        is_routine_locked: true
      });

      lockRoutine(base64);
      onSuccess();
    }
  };

  const handleClose = () => {
    emitSignatureEvent({
      time_to_first_stroke: firstStrokeTime ? firstStrokeTime - mountTime : 0,
      completion_status: false,
      is_routine_locked: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight font-montserrat">
                Autorización de Arquitectura Clínica
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5 font-lato">
                Cierre de Prescripción B2B
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Declaración de Responsabilidad</span>
            <p className="text-sm text-amber-900 leading-relaxed font-lato font-medium">
              Confirmo que esta arquitectura biomecánica respeta las restricciones clínicas del atleta y ha sido diseñada bajo estrictos parámetros de dosificación progresiva (NSCA). 
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Firma del Profesional
              </span>
              {hasStartedDrawing && (
                <button 
                  onClick={handleClear}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline font-bold"
                >
                  Limpiar Lienzo
                </button>
              )}
            </div>
            <div className="border-2 border-slate-200 rounded-2xl bg-slate-50 overflow-hidden touch-none relative">
              {!hasStartedDrawing && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <span className="text-slate-300 font-bold tracking-widest text-lg uppercase opacity-50">Firmar Aquí</span>
                </div>
              )}
              <SignatureCanvas
                ref={sigCanvas}
                onBegin={handleBeginStroke}
                penColor="#334155" // slate-700
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: 'sigCanvas w-full cursor-crosshair'
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center font-medium mt-1">
              Dibuja tu rúbrica usando el mouse o pantalla táctil
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleApplyLock}
            disabled={!hasStartedDrawing}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
              hasStartedDrawing 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Firmar y Aplicar Blindaje
          </button>
        </div>
      </div>
    </div>
  );
};
