import React, { useState } from 'react';
import { useCreateResource, useFetchResources } from '../../hooks/useScheduling';
import { Plus, Server } from 'lucide-react';

export const ResourceConfigurator: React.FC = () => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  
  const { data: resources, isLoading: isFetching } = useFetchResources();
  const createResource = useCreateResource();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !capacity) return;
    
    createResource.mutate(
      { name, capacity: Number(capacity), is_active: true },
      {
        onSuccess: () => {
          setName('');
          setCapacity('');
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Server className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-800">Recursos y Salas</h2>
      </div>

      <form onSubmit={handleCreate} className="flex gap-4 items-end mb-8">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-600 mb-1">Nombre (ej. Sala A)</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del recurso"
            required
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-slate-600 mb-1">Capacidad</label>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value) || '')}
            placeholder="Max"
            required
          />
        </div>
        <button
          type="submit"
          disabled={createResource.isPending}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {createResource.isPending ? 'Creando...' : <><Plus className="w-4 h-4" /> Agregar</>}
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Recursos Activos</h3>
        {isFetching ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : resources?.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay recursos configurados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources?.map((resource) => (
              <div key={resource.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center hover:border-indigo-300 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800">{resource.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Capacidad: {resource.capacity} px</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
