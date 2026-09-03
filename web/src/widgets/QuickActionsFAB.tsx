import { useState } from 'react';

interface QuickActionsFABProps {
    mode: string;
}

export function QuickActionsFAB({ mode }: QuickActionsFABProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isClinical = mode === 'CLINICAL';

    return (
        <nav aria-label="Acciones Rápidas" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {isOpen && (
                <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <button className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border font-bold text-sm transition-transform hover:scale-105 ${isClinical ? 'bg-white text-slate-700 border-slate-100' : 'bg-[var(--color-adrenaline-surface)] text-white border-white/5'
                        }`} onClick={() => console.log('Grabar Nota de Voz (Próximamente)')}>
                        <span>Grabar Nota de Voz</span>
                        <span aria-hidden="true">🎙️</span>
                    </button>
                    <button className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border font-bold text-sm transition-transform hover:scale-105 ${isClinical ? 'bg-white text-slate-700 border-slate-100' : 'bg-[var(--color-adrenaline-surface)] text-white border-white/5'
                        }`} onClick={() => console.log('Agregar Nuevo Cliente (Próximamente)')}>
                        <span>Agregar Nuevo Cliente</span>
                        <span aria-hidden="true">➕</span>
                    </button>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Cerrar menú de acciones" : "Abrir menú de acciones rápidas"}
                className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 text-xl font-bold ${isClinical
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-[var(--color-action-primary)] text-black shadow-[0_4px_14px_rgba(206,255,0,0.2)]'
                    }`}
            >
                {isOpen ? '✕' : '⚡'}
            </button>
        </nav>
    );
}
