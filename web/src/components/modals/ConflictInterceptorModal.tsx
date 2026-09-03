import React, { useEffect, useState } from 'react';
import { conflictEmitter } from '../../api/conflictEmitter';
import type { ApiConflictError } from '../../types/api';

type ConflictDetail = ApiConflictError['response']['data']['detail'];

export const ConflictInterceptorModal: React.FC = () => {
  const [conflict, setConflict] = useState<ConflictDetail | null>(null);

  useEffect(() => {
    const unsubscribe = conflictEmitter.subscribe((err) => {
      setConflict(err);
    });
    return unsubscribe;
  }, []);

  if (!conflict) return null;

  const { conflict_session } = conflict;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 text-xl font-bold">!</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-900">Conflicto de Agenda</h2>
            <p className="text-sm text-red-700">{conflict.error}</p>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {conflict.message || "El profesor ya tiene una clase asignada en este horario."}
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 space-y-2 font-mono">
            <p><span className="font-semibold">Clase:</span> {conflict_session.name}</p>
            <p><span className="font-semibold">Horario:</span> {new Date(conflict_session.start_time).toLocaleTimeString()} - {new Date(conflict_session.end_time).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => setConflict(null)}
            className="min-h-[44px] min-w-[44px] px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              // Action logic could dispatch an event to open PT alternatives
              console.log("Buscar alternativas para", conflict_session.session_id);
              setConflict(null);
            }}
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-medium shadow transition-colors"
          >
            Ver alternativas
          </button>
        </div>
      </div>
    </div>
  );
};
