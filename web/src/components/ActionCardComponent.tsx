import React, { useState } from 'react';
import type { ActionCardData } from './types';
import { executeAction } from './ActionExecutor';

interface Props {
  card: ActionCardData;
  onStatusUpdate: (id: string, type?: string, payload?: any) => void;
}

export const ActionCardComponent: React.FC<Props> = ({ card, onStatusUpdate }) => {
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [modalOpenTime, setModalOpenTime] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const dispatchTelemetry = (actionTaken: 'ACCEPT' | 'DISMISS', reason?: string, latencyMs: number = 0) => {
    const isBlindClick = actionTaken === 'DISMISS' && latencyMs < 800;
    
    const payload = {
      interaction_id: crypto.randomUUID(),
      trigger_id: card.trigger_id || `legacy-${card.id}`,
      athlete_snapshot: card.athlete_snapshot || {
        acwr_delta: 0.0,
        current_load: 'unknown',
        consistency_score: 0.0
      },
      model_context: card.model_context || {
        predicted_risk: card.risk_score / 100,
        model_version: 'v1.2.0-canary',
        confidence_score: 0.5,
        reasoning_tag: 'UNKNOWN'
      },
      coach_interaction: {
        action_taken: actionTaken,
        latency_ms: latencyMs,
        is_blind_click: isBlindClick,
        feedback_type: card.model_context && card.model_context.confidence_score > 0.8 ? 'PREFERENCE_STYLE' : 'MODEL_INACCURACY',
        manual_override_reason: reason || 'NONE'
      }
    };
    
    fetch('/api/v1/telemetry/interaction-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(console.error);
  };

  const handleAccept = () => {
    dispatchTelemetry('ACCEPT', undefined, 0);
    executeAction(card, onStatusUpdate);
  };

  const handleOpenDismiss = () => {
    setShowDismissModal(true);
    setOverrideReason('');
    setCustomReason('');
    setModalOpenTime(performance.now());
  };

  const confirmDismiss = () => {
    const latency = performance.now() - modalOpenTime;
    const finalReason = overrideReason === 'OTHER' ? `OTHER: ${customReason}` : overrideReason;
    
    dispatchTelemetry('DISMISS', finalReason, latency);
    setFeedbackMessage('Entendido. Ajustando el algoritmo a tu estilo de coaching...');
    
    // Auto-close and update parent after showing feedback
    setTimeout(() => {
      setShowDismissModal(false);
      onStatusUpdate(card.id, undefined, undefined);
    }, 1500);
  };

  const isConfirmDisabled = 
    !overrideReason || 
    (overrideReason === 'OTHER' && customReason.length < 10);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full relative">
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskColor(card.risk_score)}`}>
            CRI {card.risk_score}%
          </span>
          <span className="text-xs text-slate-400 font-mono">ID: {card.athlete_id.substring(0, 8)}</span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-1">{card.athlete_name}</h3>
        <p className="text-sm font-medium text-slate-500 mb-3">{card.title}</p>
        
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4">
          <p className="text-xs text-slate-600 italic line-clamp-3">"{card.message}"</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleOpenDismiss}
          className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          Ignorar
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          Actuar
        </button>
      </div>

      {showDismissModal && (
        <div className="absolute inset-0 bg-white/95 z-10 p-4 flex flex-col justify-center rounded-xl border border-slate-200 shadow-inner">
          {feedbackMessage ? (
            <div className="text-center animate-pulse text-emerald-600 font-medium text-sm">
              {feedbackMessage}
            </div>
          ) : (
            <>
              <h4 className="text-sm font-bold text-slate-800 mb-3">Razón para ignorar</h4>
              <div className="space-y-2 mb-4 text-sm">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="reason" value="MODEL_INACCURACY" onChange={(e) => setOverrideReason(e.target.value)} className="mt-0.5" />
                  <span className="text-slate-700">El atleta no está fatigado (Fallo del Sistema)</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="reason" value="ATHLETE_ADAPTED_FAST" onChange={(e) => setOverrideReason(e.target.value)} className="mt-0.5" />
                  <span className="text-slate-700">El atleta responde bien a estas cargas (Contexto de Coach)</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="reason" value="KNOWN_MACROCYCLE" onChange={(e) => setOverrideReason(e.target.value)} className="mt-0.5" />
                  <span className="text-slate-700">Contexto de macrociclo esperado (Contexto de Coach)</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="reason" value="OTHER" onChange={(e) => setOverrideReason(e.target.value)} className="mt-0.5" />
                  <span className="text-slate-700">Otro (Especificar)</span>
                </label>
                {overrideReason === 'OTHER' && (
                  <textarea 
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Escribe al menos 10 caracteres..."
                    className="w-full mt-2 text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                    rows={2}
                  />
                )}
              </div>
              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => setShowDismissModal(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 text-slate-600 rounded text-sm hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDismiss}
                  disabled={isConfirmDisabled}
                  className="flex-1 py-2 px-3 bg-slate-900 text-white rounded text-sm hover:bg-slate-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirmar y Descartar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
