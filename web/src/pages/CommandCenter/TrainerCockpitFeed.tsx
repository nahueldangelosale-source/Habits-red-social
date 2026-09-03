import React from 'react';
import { useActionCards } from '../../hooks/useActionCards';

export const TrainerCockpitFeed: React.FC = () => {
  const { query, markContacted } = useActionCards();

  if (query.isLoading) {
    return <div className="text-gray-400 p-4">Cargando ActionCards...</div>;
  }

  if (query.isError) {
    return <div className="text-red-500 p-4">Error cargando tarjetas.</div>;
  }

  const cards = query.data || [];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
      <h2 className="text-xl font-bold mb-4">Cockpit de Entrenadores</h2>
      {cards.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          Sin alertas pendientes.
        </div>
      )}
      {cards.map((card) => {
        const isHighPriority = card.status === 'PENDING';
        
        return (
          <div
            key={card.id}
            className={`
              p-4 rounded-lg border-l-4 shadow-sm transition-all
              ${
                isHighPriority
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-400 bg-gray-50 opacity-80'
              }
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className={`font-semibold ${
                    isHighPriority ? 'text-red-900' : 'text-gray-800'
                  }`}
                >
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Atleta: {card.context_variables.first_name} {card.context_variables.last_name}
                </p>
                <p className="text-sm font-mono mt-1 text-gray-500">
                  CRI: {card.score.toFixed(1)}
                </p>
              </div>

              {isHighPriority && (
                <button
                  onClick={() => markContacted.mutate(card.id)}
                  className="
                    min-h-11 min-w-11 px-4 py-2 
                    bg-red-600 hover:bg-red-700 active:bg-red-800
                    text-white font-bold rounded-md
                    shadow transition-colors
                    flex items-center justify-center
                  "
                  aria-label="Marcar como contactado"
                >
                  Marcar Contactado
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
