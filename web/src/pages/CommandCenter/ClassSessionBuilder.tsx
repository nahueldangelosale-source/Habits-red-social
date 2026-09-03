import React, { useState } from 'react';
import { useCreateClassSession, useFetchResources } from '../../hooks/useScheduling';
import { CalendarPlus, Clock } from 'lucide-react';
import { WaitlistMonitorComponent } from './WaitlistMonitorComponent';

export const ClassSessionBuilder: React.FC = () => {
  const [resourceId, setResourceId] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number | ''>('');

  const { data: resources } = useFetchResources();
  const createSession = useCreateClassSession();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId || !name || !date || !startTime || !endTime || !maxCapacity) return;

    // Combine date and time
    // Example: 2026-06-08T10:00:00Z
    // For simplicity, we just create a local date and convert to ISO String
    const startIso = new Date(`${date}T${startTime}`).toISOString();
    const endIso = new Date(`${date}T${endTime}`).toISOString();

    createSession.mutate(
      {
        resource_id: resourceId,
        name,
        start_time: startIso,
        end_time: endIso,
        max_capacity: Number(maxCapacity),
      },
      {
        onSuccess: () => {
          setName('');
          // Keep the date/time/resource to ease multiple creations
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarPlus className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-800">Programar Clase (Session)</h2>
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nombre de la Clase</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Cross Training Avanzado"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Recurso / Sala</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={resourceId}
              onChange={(e) => {
                setResourceId(e.target.value);
                const r = resources?.find(r => r.id === e.target.value);
                if (r) setMaxCapacity(r.capacity);
              }}
              required
            >
              <option value="" disabled>Selecciona un recurso...</option>
              {resources?.map(r => (
                <option key={r.id} value={r.id}>{r.name} (Max {r.capacity})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Hora Inicio</label>
            <input
              type="time"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Hora Fin</label>
            <input
              type="time"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Cupos Reales</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value) || '')}
              min="1"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={createSession.isPending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {createSession.isPending ? 'Programando...' : <><Clock className="w-4 h-4" /> Programar</>}
          </button>
        </div>
      </form>

      {/* DEMO WAITLIST MONITOR */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-md font-semibold text-slate-800 mb-4">Monitor de Lista de Espera (Demo UI)</h3>
        <WaitlistMonitorComponent reservation={{
          id: 'res-1',
          athleteName: 'Carlos Giménez',
          status: 'OFFERED',
          updatedAt: new Date().toISOString()
        }} />
        <WaitlistMonitorComponent reservation={{
          id: 'res-2',
          athleteName: 'María Pérez',
          status: 'WAITLISTED',
          updatedAt: new Date().toISOString()
        }} />
      </div>
    </div>
  );
};
