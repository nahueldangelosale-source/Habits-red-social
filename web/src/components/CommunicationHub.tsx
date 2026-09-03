import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { CommunicationConfigTab } from './inbox/CommunicationConfigTab';

export const CommunicationHub: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-lato">
            {/* Header de Navegación Rápida */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/inbox?tab=communication')}
                        className="w-9 h-9 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                        title="Volver a Mensajes & Validaciones"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-base font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                            CANALES & AUTOMATIZACIONES
                        </h1>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Pestaña integrada en el módulo de Mensajes & Validaciones
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col">
                <CommunicationConfigTab />
            </div>
        </div>
    );
};

export default CommunicationHub;
