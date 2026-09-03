import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Send } from 'lucide-react';
import { DietBuilderCanvas } from '../components/builders/DietBuilder/DietBuilderCanvas';
import { MacroRadarWidget } from '../components/builders/DietBuilder/MacroRadarWidget';
import { MetabolicGPSWidget } from '../components/builders/DietBuilder/MetabolicGPSWidget';

export type MetabolicArchetype = 'RECOMP' | 'ATHLETE' | 'GASTRO' | 'ENDOCRINE' | 'LONGEVITY' | 'BIOMECHANIC';

const ARCHETYPES: { id: MetabolicArchetype; label: string; icon: string }[] = [
    { id: 'RECOMP', label: 'Recomposición', icon: '💪' },
    { id: 'ATHLETE', label: 'Atleta / High-Low', icon: '⚡' },
    { id: 'GASTRO', label: 'Gastro-Inmune', icon: '🦠' },
    { id: 'ENDOCRINE', label: 'Endocrino (NAFLD)', icon: '🩸' },
    { id: 'LONGEVITY', label: 'Longevidad', icon: '🧬' },
    { id: 'BIOMECHANIC', label: 'Biomecánica (Wearable)', icon: '⌚' }
];

export const DietQAPage = () => {
    const { mode } = useTheme();
    const [activeArchetype, setActiveArchetype] = React.useState<MetabolicArchetype>('RECOMP');
    const [showXAI, setShowXAI] = React.useState(false);

    return (
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 ${mode === 'CLINICAL' ? 'bg-slate-100' : 'bg-[var(--color-adrenaline-bg)]'}`}>
            <header className='mb-6'>
                <div className='flex items-center gap-3 mb-2'>
                    <div className='px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest'>Motor de Planificación Clínico</div>
                </div>
                <h1 className={`text-3xl md:text-4xl font-black font-sans tracking-tight ${mode === 'CLINICAL' ? 'text-slate-900' : 'text-white'}`}>DietQA Builder</h1>
                <p className={`mt-2 font-medium ${mode === 'CLINICAL' ? 'text-slate-500' : 'text-zinc-400'}`}>Diseñador de planes interactivo con Copiloto Inteligente</p>
            </header>

            <section aria-label="Diseñador de Dietas (DietQA)" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* CANVAS PRINCIPAL (IZQUIERDA) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className={`shadow-xl rounded-3xl overflow-hidden border relative ${
                        mode === 'CLINICAL' ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/5'
                    }`}>
                        <DietBuilderCanvas activeArchetype={activeArchetype} />
                    </div>
                </div>

                {/* BARRA LATERAL PROMPT-TO-PLAN (DERECHA) */}
                <aside className={`lg:col-span-4 rounded-3xl flex flex-col border shadow-xl ${
                    mode === 'CLINICAL' ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                }`}>
                    <div className={`p-4 border-b flex flex-col gap-3 ${mode === 'CLINICAL' ? 'border-slate-100' : 'border-zinc-800'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm ${mode === 'CLINICAL' ? 'text-slate-800' : 'text-white'}`}>Copiloto Clínico (RAG)</h3>
                                <p className={`text-xs ${mode === 'CLINICAL' ? 'text-slate-500' : 'text-zinc-400'}`}>Prompt-to-Plan Engine</p>
                            </div>
                        </div>

                        {/* Router de Arquetipos */}
                        <div className="mt-2">
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mode === 'CLINICAL' ? 'text-slate-400' : 'text-zinc-400'}`}>Arquetipo Metabólico</p>
                            <div className="flex flex-wrap gap-2">
                                {ARCHETYPES.map(a => (
                                    <button 
                                        key={a.id}
                                        onClick={() => setActiveArchetype(a.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                            activeArchetype === a.id 
                                                ? (mode === 'CLINICAL' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400')
                                                : (mode === 'CLINICAL' ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800')
                                        }`}
                                    >
                                        <span>{a.icon}</span> {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
                        <div className={`p-3 rounded-2xl rounded-tl-sm max-w-[85%] ${
                            mode === 'CLINICAL' ? 'bg-slate-100 text-slate-700' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                            Hola. ¿Qué arquitectura metabólica diseñamos hoy? Puedes dictarme el perfil del paciente y sus restricciones.
                        </div>
                        <div className={`p-3 rounded-2xl rounded-tr-sm max-w-[85%] ml-auto ${
                            mode === 'CLINICAL' ? 'bg-emerald-600 text-white' : 'bg-[var(--color-action-primary)] text-black'
                        }`}>
                            Paciente masculino, 85kg. Objetivo déficit 2200 kcal. Alta proteína, sin lácteos y alérgico al maní.
                        </div>
                        <div className={`p-3 rounded-2xl rounded-tl-sm max-w-[85%] relative ${
                            mode === 'CLINICAL' ? 'bg-slate-100 text-slate-700' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                            <span className="font-bold block mb-1">Cálculo completado:</span>
                            TMB estimada: 1850 kcal. Ajustando a 2200 kcal (Déficit leve por NEAT alto asumiendo actividad).<br/>
                            Generando protocolo de 12 semanas libre de caseína y alérgenos reportados...
                            
                            {/* XAI Confidence Badge & Glass-box AI */}
                            <div className="mt-3 border-t border-black/5 pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${mode === 'CLINICAL' ? 'text-emerald-600' : 'text-emerald-400'}`}>
                                        <Sparkles size={12} />
                                        <span>Confianza RAG: 98.4%</span>
                                    </div>
                                    <button 
                                        onClick={() => setShowXAI(!showXAI)}
                                        className={`text-xs font-bold px-2 py-1 rounded transition-colors ${
                                            mode === 'CLINICAL' 
                                                ? 'text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20' 
                                                : 'text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30'
                                        }`}
                                    >
                                        Cadena de Inferencia (XAI) {showXAI ? '▲' : '▼'}
                                    </button>
                                </div>
                                
                                {/* Chain of Thought Accordion */}
                                {showXAI && (
                                    <div className={`mt-2 p-3 border rounded-xl text-xs space-y-2 animate-in slide-in-from-top-2 duration-200 ${
                                        mode === 'CLINICAL' 
                                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                                            : 'bg-emerald-950/30 border-emerald-900/50'
                                    }`}>
                                        <p className={`font-bold uppercase tracking-widest text-xs ${mode === 'CLINICAL' ? 'text-emerald-700/80' : 'text-emerald-400/80'}`}>
                                            Tensores de Decisión Utilizados:
                                        </p>
                                        <ol className={`list-decimal list-inside space-y-1.5 ${mode === 'CLINICAL' ? 'text-emerald-900/80' : 'text-emerald-100/70'}`}>
                                            <li><span className="font-bold">Oura HRV:</span> Indica estrés agudo (Caída 15% vs Baseline).</li>
                                            <li><span className="font-bold">Check-in:</span> Paciente reportó "fatiga sistémica".</li>
                                            <li><span className="font-bold">Smart Lab OCR:</span> Glucosa basal elevada (98 mg/dL) asimilada hoy.</li>
                                        </ol>
                                        <div className={`mt-2 text-xs italic border-t pt-2 ${
                                            mode === 'CLINICAL' ? 'text-emerald-600/80 border-emerald-500/20' : 'text-emerald-400/60 border-emerald-900/50'
                                        }`}>
                                            <strong>Resolución Algorítmica:</strong> Ajuste neuro-protector y déficit leve según directrices ESPEN 2025 (Ponderación 60% clínica).
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 border-t ${mode === 'CLINICAL' ? 'border-slate-100' : 'border-zinc-800'}`}>
                        <div className={`flex items-center gap-2 p-2 rounded-xl border focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all ${
                            mode === 'CLINICAL' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-700'
                        }`}>
                            <input 
                                type="text" 
                                placeholder="Escribe un comando clínico..." 
                                className="flex-1 bg-transparent text-sm focus:outline-none px-2"
                            />
                            <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                mode === 'CLINICAL' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-[var(--color-action-primary)] text-black'
                            }`}>
                                <Send size={14} />
                            </button>
                        </div>
                        <p className="text-xs text-center mt-3 opacity-50 font-bold uppercase tracking-widest">Powered by Bounded AI</p>
                    </div>

                    {/* Simulador GPS Metabólico */}
                    <div className={`p-4 border-t ${mode === 'CLINICAL' ? 'border-slate-100 bg-slate-50' : 'border-zinc-800 bg-zinc-900/50'}`}>
                        <MetabolicGPSWidget />
                    </div>

                    {/* Macro Radar Widget */}
                    <div className={`p-4 border-t ${mode === 'CLINICAL' ? 'border-slate-100' : 'border-zinc-800'}`}>
                        <MacroRadarWidget />
                    </div>
                </aside>

            </section>
        </main>
    );
};
