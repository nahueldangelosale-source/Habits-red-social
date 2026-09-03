import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Settings2, ShieldCheck, Wrench, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export function MasterLibrary() {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const [equipment, setEquipment] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await api.get('/api/v1/inventory/equipment');
                setEquipment(res);
            } catch (err) {
                console.error("Failed to fetch equipment:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    // Traffic Light Logic
    const getZoneStatus = (zone: string) => {
        const zoneEq = equipment.filter(eq => eq.zone === zone);
        if (zoneEq.length === 0) return { status: 'Desconocido', color: 'text-gray-500', bg: 'bg-gray-500' };
        
        const activeCount = zoneEq.filter(eq => eq.status === 'active').length;
        const ratio = activeCount / zoneEq.length;

        if (ratio > 0.8) return { status: 'Disponible', color: 'text-emerald-400', bg: 'bg-emerald-500' };
        if (ratio > 0.4) return { status: 'Moderado', color: 'text-amber-400', bg: 'bg-amber-500' };
        return { status: 'Saturado', color: 'text-red-400', bg: 'bg-red-500' };
    };

    const zones = ['free_weight', 'cardio', 'machines', 'functional'];
    const zoneNames: Record<string, string> = {
        free_weight: 'Peso Libre',
        cardio: 'Cardio',
        machines: 'Máquinas Selectorizadas',
        functional: 'Funcional'
    };

    return (
        <div className={`min-h-screen pt-24 pb-20 px-6 animate-in fade-in duration-500 ${isClinical ? 'bg-slate-900 text-slate-200' : 'bg-black text-white'}`}>
            <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
                <div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-xs uppercase tracking-widest font-bold opacity-50 flex items-center gap-2 mb-4 hover:opacity-100 transition-opacity"
                    >
                        <ArrowLeft size={16} /> Volver al Dashboard
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-4">
                        Master Library 
                        <span className="text-sm px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono tracking-widest uppercase">Swap Engine Sync</span>
                    </h1>
                    <p className="text-sm opacity-60 max-w-2xl">
                        Infraestructura física del gimnasio. El Swap Engine utiliza esta disponibilidad global para recetar ejercicios realistas a los atletas sin cuellos de botella en sala.
                    </p>
                </div>
                <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors">
                    <Plus size={18} /> Añadir Activo
                </button>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Traffic Light Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <article className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                            <Activity className="text-emerald-400" size={20} />
                            <h2 className="text-sm font-bold uppercase tracking-wider">Semáforo de Capacidad</h2>
                        </div>
                    </article>
                </div>
            </main>
        </div>
    );
}

export default MasterLibrary;