import React from 'react';

interface AthleteAlert {
  id: string;
  name: string;
  cri: number;
  acwr_value: string;
  latencia_dias: number;
}

const MOCK_ATHLETES: AthleteAlert[] = [
  { id: '1', name: 'Nahuel D\'Angelo', cri: 85, acwr_value: '1.6', latencia_dias: 4 },
  { id: '2', name: 'Sofia T.', cri: 45, acwr_value: '1.0', latencia_dias: 1 },
  { id: '3', name: 'Marcos R.', cri: 30, acwr_value: '0.9', latencia_dias: 0 },
  { id: '4', name: 'Lucas G.', cri: 78, acwr_value: '1.5', latencia_dias: 5 },
];

export const RetentionRadarList: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {MOCK_ATHLETES.map((athlete) => (
        <div 
          key={athlete.id} 
          className="group relative flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100"
        >
          <div className="flex flex-col">
            {/* Regla de la Ausencia: Mutear si CRI < 50, alertar si CRI > 75 */}
            <span className={`font-heading font-semibold text-lg tracking-tight ${
              athlete.cri > 75 ? 'text-risk-high' : 'text-clinical-muted'
            }`}>
              {athlete.name}
            </span>
            {/* Lato para telemetría densa */}
            <span className="font-sans text-sm text-clinical-muted font-medium">
              ACWR: {athlete.acwr_value} | Latencia: {athlete.latencia_dias}d
            </span>
          </div>

          {/* Microinteracción de 1-Clic oculta hasta el hover */}
          {athlete.cri > 75 && (
            <button className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-risk-high hover:bg-red-600 text-white px-4 py-2 rounded-md font-heading font-bold text-xs tracking-wider shadow-md transform hover:scale-105 active:scale-95 duration-200">
              INTERVENIR
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
