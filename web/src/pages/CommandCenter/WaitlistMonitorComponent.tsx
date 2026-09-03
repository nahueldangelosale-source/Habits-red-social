import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';

interface ReservationProps {
  id: string;
  athleteName: string;
  status: 'WAITLISTED' | 'OFFERED' | 'EXPIRED' | 'BOOKED';
  updatedAt: string; // ISO string when it transitioned to OFFERED
}

export const WaitlistMonitorComponent: React.FC<{ reservation: ReservationProps }> = ({ reservation }) => {
  // If OFFERED, calculate expiration as updatedAt + 15 mins
  const expirationTime = React.useMemo(() => {
    if (reservation.status !== 'OFFERED') return null;
    const date = new Date(reservation.updatedAt);
    date.setMinutes(date.getMinutes() + 15);
    return date.toISOString();
  }, [reservation.status, reservation.updatedAt]);

  const timeLeft = useCountdown(expirationTime);
  
  // Si timeLeft es <= 0 y estaba OFFERED, lo tratamos visualmente como expirado para UI Optimista
  const isLocallyExpired = reservation.status === 'OFFERED' && timeLeft <= 0 && expirationTime !== null;
  const isExpired = reservation.status === 'EXPIRED' || isLocallyExpired;

  // Formatear minutos y segundos
  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      className={`
        flex items-center justify-between p-3 border-b border-gray-200
        transition-opacity duration-500 ease-in-out
        ${isExpired ? 'opacity-40' : 'opacity-100'}
        h-16
      `}
    >
      <div className="flex flex-col">
        <span className={`font-semibold text-lg ${isExpired ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {reservation.athleteName}
        </span>
        <span className="text-sm text-gray-500">
          Estado: {isExpired ? 'EXPIRED' : reservation.status}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {reservation.status === 'OFFERED' && !isExpired && (
          <div className="text-amber-600 font-mono font-bold bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            {formatTime(timeLeft)}
          </div>
        )}
        
        {reservation.status === 'WAITLISTED' && (
          <div className="text-gray-400 font-medium px-3 py-1">
            En espera
          </div>
        )}
      </div>
    </div>
  );
};
