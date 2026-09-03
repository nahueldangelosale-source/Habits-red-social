import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, AlertTriangle, AlertCircle, Info, Send, 
    User, Sparkles, Plus, RefreshCw, BarChart2, 
    BookOpen, CheckSquare, MessageSquare, ClipboardList, ShieldAlert
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';

// =============================================================================
// MOCK DATA
// =============================================================================
interface ClinicalFlag {
    id: string;
    severity: 'red' | 'yellow' | 'info';
    message: string;
}

interface Meal {
    name: string;
    details: string;
    macros: { calories: number; protein: number; carbs: number; fat: number };
}

interface ZeroDraft {
    id: string;
    patientName: string;
    age: number;
    weight: number;
    height: number;
    tmb: number;
    goal: string;
    archetype: string;
    dailyCalories: number;
    macroTargets: { protein: number; carbs: number; fat: number };
    flags: ClinicalFlag[];
    meals: Meal[];
}

const INITIAL_DRAFTS: ZeroDraft[] = [
    {
        id: 'zd-1',
        patientName: 'Laura Martinez',
        age: 32,
        weight: 68.5,
        height: 165,
        tmb: 1420,
        goal: 'Déficit Calórico / Pérdida de Grasa',
        archetype: 'ARQ_03_BUSY_MOM',
        dailyCalories: 1600,
        macroTargets: { protein: 120, carbs: 150, fat: 55 },
        flags: [
            {
                id: 'f1-1',
                severity: 'red',
                message: 'Alta sensibilidad gastrointestinal reportada. Se excluyen lácteos enteros. AUREA reemplazó queso cottage por tofu orgánico y yogur de coco sin azúcar.'
            },
            {
                id: 'f1-2',
                severity: 'yellow',
                message: 'Historial familiar de resistencia a la insulina. El índice glucémico de la merienda se redujo al reemplazar banana madura por frutos rojos y almendras.'
            }
        ],
        meals: [
            {
                name: 'Desayuno (08:30)',
                details: 'Omelette de 3 claras y 1 huevo entero con espinaca fresca y 1 tostada de pan de masa madre integral.',
                macros: { calories: 350, protein: 26, carbs: 24, fat: 12 }
            },
            {
                name: 'Almuerzo (13:00)',
                details: '150g de Suprema de pollo grillada, 120g de quinoa cocida y un mix de vegetales al vapor (brócoli, zanahoria, zucchini) aderezado con 1 cucharada de aceite de oliva.',
                macros: { calories: 520, protein: 42, carbs: 46, fat: 16 }
            },
            {
                name: 'Merienda (17:00)',
                details: '150g de Yogur de coco sin azúcar con 50g de arándanos frescos y 15g de almendras fileteadas.',
                macros: { calories: 280, protein: 8, carbs: 22, fat: 18 }
            },
            {
                name: 'Cena (21:00)',
                details: '150g de Filete de merluza al horno con finas hierbas y 200g de puré rústico de calabaza asada.',
                macros: { calories: 450, protein: 44, carbs: 58, fat: 9 }
            }
        ]
    },
    {
        id: 'zd-2',
        patientName: 'Pedro Sanchez',
        age: 28,
        weight: 84.2,
        height: 182,
        tmb: 1890,
        goal: 'Hipertrofia Muscular / Superávit',
        archetype: 'ARQ_01_HYPERTROPHY_PT',
        dailyCalories: 2800,
        macroTargets: { protein: 160, carbs: 350, fat: 80 },
        flags: [
            {
                id: 'f2-1',
                severity: 'red',
                message: 'Paciente en rehabilitación kinésica por lesión rotuliana. Se inyectó protocolo de nutrición antiinflamatoria: aumento de Omega-3 y antioxidantes (chía y nueces en la merienda).'
            },
            {
                id: 'f2-2',
                severity: 'info',
                message: 'Volumen calórico elevado. AUREA distribuyó los carbohidratos en 5 ingestas equilibradas para mitigar picos de somnolencia e indigestión.'
            }
        ],
        meals: [
            {
                name: 'Desayuno (07:30)',
                details: 'Batido de 40g de proteína de arveja con 100g de avena, 1 banana, 20g de manteca de maní y leche de almendras.',
                macros: { calories: 680, protein: 48, carbs: 82, fat: 18 }
            },
            {
                name: 'Almuerzo (12:30)',
                details: '200g de Filete de ternera magra, 200g de arroz integral cocido y ensalada de hojas verdes con tomate y semillas de girasol.',
                macros: { calories: 720, protein: 52, carbs: 78, fat: 22 }
            },
            {
                name: 'Colación (16:30)',
                details: '2 huevos duros, 2 tostadas de arroz con palta pisada y un puñado de 30g de nueces pecanas.',
                macros: { calories: 440, protein: 18, carbs: 32, fat: 26 }
            },
            {
                name: 'Cena (20:30)',
                details: '200g de Salmón rosado grillado con 250g de batatas al horno de barro y espárragos salteados.',
                macros: { calories: 760, protein: 40, carbs: 90, fat: 24 }
            },
            {
                name: 'Snack Nocturno (22:30)',
                details: '200g de yogur de coco con 2 cucharadas de semillas de chía hidratadas y frutillas.',
                macros: { calories: 200, protein: 6, carbs: 28, fat: 10 }
            }
        ]
    },
    {
        id: 'zd-3',
        patientName: 'Elena Gomez',
        age: 41,
        weight: 62.1,
        height: 160,
        tmb: 1310,
        goal: 'Recomposición Corporal',
        archetype: 'ARQ_05_ATHLETIC_40',
        dailyCalories: 1800,
        macroTargets: { protein: 130, carbs: 180, fat: 60 },
        flags: [
            {
                id: 'f3-1',
                severity: 'yellow',
                message: 'GLP-1 Safety Mode Activo (paciente en tratamiento con semaglutida). Riesgo de náuseas. Se redujo el volumen de la porción en la cena un 30% a favor de un snack proteico nocturno de fácil digestión.'
            }
        ],
        meals: [
            {
                name: 'Desayuno (09:00)',
                details: 'Tostado de pan integral con 100g de tofu revuelto con cúrcuma y tomate cherry picado.',
                macros: { calories: 380, protein: 22, carbs: 38, fat: 14 }
            },
            {
                name: 'Almuerzo (13:30)',
                details: '150g de Pechuga de pavo, 150g de calabaza al horno y mix de lechuga, pepino y aderezo tahini ligero.',
                macros: { calories: 480, protein: 38, carbs: 42, fat: 16 }
            },
            {
                name: 'Merienda (18:00)',
                details: 'Licuado de proteína aislada de soja con frambuesas y agua, acompañado de 1 pancake de avena sin yema.',
                macros: { calories: 320, protein: 28, carbs: 35, fat: 6 }
            },
            {
                name: 'Cena Liviana (20:30)',
                details: '120g de Filete de lenguado grillado con ensalada verde (rúcula y rabanito).',
                macros: { calories: 290, protein: 30, carbs: 15, fat: 11 }
            },
            {
                name: 'Snack Nocturno (22:30)',
                details: 'Gelatina light con 100g de frutos rojos y 20g de nueces.',
                macros: { calories: 330, protein: 12, carbs: 50, fat: 13 }
            }
        ]
    },
    {
        id: 'zd-4',
        patientName: 'Diego Lopez',
        age: 35,
        weight: 79.8,
        height: 178,
        tmb: 1720,
        goal: 'Mantenimiento & Rendimiento Deportivo',
        archetype: 'ARQ_02_ATHLETIC_BASE',
        dailyCalories: 2400,
        macroTargets: { protein: 145, carbs: 270, fat: 75 },
        flags: [
            {
                id: 'f4-1',
                severity: 'yellow',
                message: 'Análisis de sangre reciente indica anemia subclínica (Hierro bajo). AUREA priorizó espinacas, lentejas, semillas de calabaza y cortes de carne roja magra en el menú semanal.'
            }
        ],
        meals: [
            {
                name: 'Desayuno (08:00)',
                details: 'Pancake de 4 claras y 1 huevo entero, 60g de harina de avena, 1 cucharadita de miel y mix de frutos secos.',
                macros: { calories: 490, protein: 28, carbs: 52, fat: 18 }
            },
            {
                name: 'Almuerzo (13:00)',
                details: 'Guiso frío de lentejas (150g cocidas) con pimiento, cebolla, 100g de bife de ternera magra y aderezo de limón (para mejorar la absorción de hierro no hemo).',
                macros: { calories: 680, protein: 46, carbs: 78, fat: 20 }
            },
            {
                name: 'Merienda (17:30)',
                details: 'Sándwich en pan integral con 100g de jamón natural bajo en sodio, rodajas de tomate y 30g de palta.',
                macros: { calories: 390, protein: 22, carbs: 42, fat: 14 }
            },
            {
                name: 'Cena (21:00)',
                details: '180g de Suprema de pollo con ensalada tibia de brócoli, espinacas y 150g de papas al horno.',
                macros: { calories: 840, protein: 49, carbs: 98, fat: 23 }
            }
        ]
    }
];

export const ZeroDraftInbox: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // States
    const [drafts, setDrafts] = useState<ZeroDraft[]>(INITIAL_DRAFTS);
    const [selectedId, setSelectedId] = useState<string>(INITIAL_DRAFTS[0]?.id || '');
    const [checkedFlags, setCheckedFlags] = useState<Record<string, boolean>>({});
    const [authorNotes, setAuthorNotes] = useState<string>('');
    const [isApproving, setIsApproving] = useState<boolean>(false);
    const [laborState, setLaborState] = useState<'idle' | 'analyzing' | 'optimizing' | 'success'>('idle');

    // Metrics for OKR Board
    const [totalApproved, setTotalApproved] = useState<number>(14); // starts with some historical mock data
    const [lowTouchCount, setLowTouchCount] = useState<number>(12); // approved with 0 manual edits
    const [manualEditsCount, setManualEditsCount] = useState<number>(2); // approved with manual adjustments

    const selectedDraft = drafts.find(d => d.id === selectedId) || drafts[0];

    // Compute Low-Touch Acceptance Rate (Métrica de Retención / OKR)
    const totalTransactions = totalApproved;
    const cleanApprovalRate = totalTransactions > 0 
        ? ((lowTouchCount / totalTransactions) * 100).toFixed(1) 
        : '0.0';

    const handleSelectDraft = (id: string) => {
        setSelectedId(id);
        setAuthorNotes('');
    };

    const handleToggleFlag = (flagId: string) => {
        setCheckedFlags(prev => ({
            ...prev,
            [flagId]: !prev[flagId]
        }));
    };

    const handleApprove = async () => {
        if (!selectedDraft) return;

        // Check if all flags are checked for this draft
        const allFlagsChecked = selectedDraft.flags.every(f => checkedFlags[f.id]);
        if (!allFlagsChecked) {
            toast.error('❌ Debes revisar y firmar (Sign-off) cada una de las alertas clínicas destacadas por AUREA para desbloquear el despacho.');
            return;
        }

        // Labor Illusion Logic (Sistema 2 Trigger)
        setIsApproving(true);
        setLaborState('analyzing');
        
        await new Promise(r => setTimeout(r, 1200));
        setLaborState('optimizing');
        
        await new Promise(r => setTimeout(r, 1000));
        setLaborState('success');
        
        await new Promise(r => setTimeout(r, 600));

        // Processing Approval Outcomes
        const hasManualNotes = authorNotes.trim().length > 0;
        
        // Update stats
        setTotalApproved(prev => prev + 1);
        if (hasManualNotes) {
            setManualEditsCount(prev => prev + 1);
            toast.success(`✅ Plan de ${selectedDraft.patientName} despachado con Ajustes de Autor (Inyección Manual).`);
        } else {
            setLowTouchCount(prev => prev + 1);
            toast.success(`✨ Plan de ${selectedDraft.patientName} despachado con Tasa de Aceptación Limpia (Low-Touch).`);
        }

        // Remove from list and select another
        const updatedDrafts = drafts.filter(d => d.id !== selectedDraft.id);
        setDrafts(updatedDrafts);
        
        if (updatedDrafts.length > 0) {
            setSelectedId(updatedDrafts[0].id);
        } else {
            setSelectedId('');
        }

        setIsApproving(false);
        setLaborState('idle');
        setAuthorNotes('');
    };

    const handleReset = () => {
        setDrafts(INITIAL_DRAFTS);
        setSelectedId(INITIAL_DRAFTS[0].id);
        setCheckedFlags({});
        setAuthorNotes('');
        setTotalApproved(14);
        setLowTouchCount(12);
        setManualEditsCount(2);
        toast.success('Mocks de Borradores Cero restablecidos para auditoría.');
    };

    const currentDraftFlagsChecked = selectedDraft 
        ? selectedDraft.flags.every(f => checkedFlags[f.id])
        : false;

    return (
        <div className="flex flex-col gap-6 font-sans">
            
            {/* OKR STATUS BOARD - HEADER */}
            <div className={`p-6 rounded-[2rem] border backdrop-blur-xl transition-all ${
                isClinical 
                    ? 'bg-white border-slate-200/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)]' 
                    : 'bg-zinc-900/80 border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.2)]'
            }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isClinical ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Auditoría Clínica por Excepción</span>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight mt-0.5">Bandeja de Borradores Cero (AUREA)</h2>
                        </div>
                    </div>
                    
                    {/* Metrics widgets */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Tasa de Aceptación Limpia</span>
                            <span className={`text-xl font-black flex items-center gap-1.5 ${
                                parseFloat(cleanApprovalRate) >= 80 
                                    ? 'text-emerald-500' 
                                    : 'text-amber-500'
                            }`}>
                                <Sparkles size={16} />
                                {cleanApprovalRate}%
                                <span className="text-[10px] font-semibold text-slate-400"> (Meta: &gt;80%)</span>
                            </span>
                        </div>
                        <div className={`w-[1px] h-8 hidden md:block ${isClinical ? 'bg-slate-200' : 'bg-zinc-800'}`} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Procesados este turno</span>
                            <span className="text-xl font-black">{totalApproved} <span className="text-xs font-normal opacity-50">pacientes</span></span>
                        </div>
                        <div className={`w-[1px] h-8 hidden md:block ${isClinical ? 'bg-slate-200' : 'bg-zinc-800'}`} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Desviaciones/Intervenciones</span>
                            <span className="text-xl font-black text-rose-500">{manualEditsCount} <span className="text-xs font-normal opacity-50">casos</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {drafts.length === 0 ? (
                /* INBOX ZERO STATE */
                <div className={`min-h-[500px] flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed p-8 text-center ${
                    isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                }`}>
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                        <Check size={40} className="stroke-[3]" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-2">Bandeja Limpia — Zero-Draft Completo</h3>
                    <p className={`max-w-md text-sm leading-relaxed ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                        Has auditado y despachado todos los borradores autogenerados por AUREA. Los planes nutricionales están activos en la app móvil de tus pacientes.
                    </p>
                    <button 
                        onClick={handleReset} 
                        className={`mt-6 px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 ${
                            isClinical 
                                ? 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700' 
                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                    >
                        <RefreshCw size={14} /> Recargar Borradores de Prueba
                    </button>
                </div>
            ) : (
                /* WORKFLOW LAYOUT */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] items-stretch">
                    
                    {/* Left Pane: Roster of Pending Drafts */}
                    <aside className={`lg:col-span-4 rounded-[2rem] border overflow-hidden flex flex-col shadow-lg ${
                        isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                    }`}>
                        <div className={`p-4 border-b flex items-center justify-between ${
                            isClinical ? 'bg-slate-50/50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800'
                        }`}>
                            <span className="text-xs font-black uppercase tracking-widest opacity-60">Cola de Prescripción</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isClinical ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>{drafts.length} pendientes</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {drafts.map((draft) => {
                                const isSelected = draft.id === selectedId;
                                const pendingCount = draft.flags.filter(f => !checkedFlags[f.id]).length;
                                return (
                                    <button
                                        key={draft.id}
                                        onClick={() => handleSelectDraft(draft.id)}
                                        className={`w-full p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col gap-2 relative ${
                                            isSelected 
                                                ? (isClinical ? 'bg-slate-100/80 border-slate-300' : 'bg-white/10 border-white/20')
                                                : (isClinical ? 'bg-white border-slate-100 hover:bg-slate-50' : 'bg-zinc-900/50 border-transparent hover:bg-zinc-800/40')
                                        }`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <div>
                                                <h4 className="font-black text-sm">{draft.patientName}</h4>
                                                <span className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${
                                                    isClinical ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                    {draft.archetype}
                                                </span>
                                            </div>
                                            {pendingCount > 0 ? (
                                                <span className="flex h-2 w-2 relative mt-1">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                                </span>
                                            ) : (
                                                <Check className="text-emerald-500 stroke-[3]" size={14} />
                                            )}
                                        </div>
                                        <div className="text-[11px] opacity-75 truncate max-w-[280px]">
                                            {draft.goal}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] opacity-50 mt-1 border-t pt-2 border-slate-200/40">
                                            <span>🔥 {draft.dailyCalories} kcal</span>
                                            <span>•</span>
                                            <span>⚠️ {draft.flags.length} Alertas</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Main/Right Pane: Draft Editor & Audit cockpit */}
                    <main className={`lg:col-span-8 rounded-[2rem] border shadow-lg flex flex-col overflow-hidden ${
                        isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                    }`}>
                        {selectedDraft ? (
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                
                                {/* Active Patient Header */}
                                <div className={`p-6 border-b flex justify-between items-center ${
                                    isClinical ? 'bg-slate-50/50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800'
                                }`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg md:text-xl font-black">{selectedDraft.patientName}</h3>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                                AUREA Draft v1
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs opacity-60 mt-1">
                                            <span>Edad: {selectedDraft.age} años</span>
                                            <span>•</span>
                                            <span>Peso: {selectedDraft.weight} kg</span>
                                            <span>•</span>
                                            <span>TMB: {selectedDraft.tmb} kcal/día</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-wider block opacity-50">Dieta Objetivo</span>
                                        <span className="text-lg font-black text-indigo-500">{selectedDraft.dailyCalories} <span className="text-xs font-normal text-slate-400">kcal</span></span>
                                    </div>
                                </div>

                                {/* Body Split: Left Details / Right Clinical Flags & Notes */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden items-stretch">
                                    
                                    {/* Left Split: Meals Catalog */}
                                    <div className={`p-6 overflow-y-auto space-y-4 border-r ${
                                        isClinical ? 'border-slate-100 bg-slate-50/20' : 'border-zinc-800 bg-zinc-950/20'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-xs uppercase tracking-wider opacity-60 flex items-center gap-1">
                                                <BookOpen size={12} /> Plan Nutricional Propuesto
                                            </h4>
                                            <div className="flex gap-2 text-[10px] font-bold">
                                                <span className="text-indigo-500">P: {selectedDraft.macroTargets.protein}g</span>
                                                <span className="text-amber-500">C: {selectedDraft.macroTargets.carbs}g</span>
                                                <span className="text-rose-500">F: {selectedDraft.macroTargets.fat}g</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {selectedDraft.meals.map((meal, index) => (
                                                <div 
                                                    key={index}
                                                    className={`p-4 rounded-2xl border transition-all ${
                                                        isClinical ? 'bg-white border-slate-150 shadow-sm' : 'bg-zinc-900 border-zinc-800'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-black text-xs text-indigo-500">{meal.name}</span>
                                                        <span className="text-[9px] opacity-50">
                                                            {meal.macros.calories} kcal | P: {meal.macros.protein}g | C: {meal.macros.carbs}g
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-medium leading-relaxed opacity-80">
                                                        {meal.details}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Split: Clinical Flags (Auditoría Guiada) & BATNA adjustments */}
                                    <div className="p-6 overflow-y-auto flex flex-col gap-6">
                                        
                                        {/* Clinical Flags Audit Block */}
                                        <div className="flex flex-col gap-3">
                                            <h4 className="font-bold text-xs uppercase tracking-wider opacity-60 flex items-center gap-1.5 text-rose-500">
                                                <ShieldAlert size={14} /> Auditoría Obligatoria de Anomalías
                                            </h4>
                                            <p className="text-[10px] opacity-50 -mt-1 leading-tight">
                                                Por favor, audite cada desviación y adaptación metabólica realizada por la IA.
                                            </p>

                                            <div className="space-y-2 mt-1">
                                                {selectedDraft.flags.map((flag) => {
                                                    const isChecked = checkedFlags[flag.id] || false;
                                                    return (
                                                        <div 
                                                            key={flag.id} 
                                                            onClick={() => handleToggleFlag(flag.id)}
                                                            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-3 items-start select-none ${
                                                                isChecked 
                                                                    ? (isClinical ? 'bg-emerald-50/40 border-emerald-200' : 'bg-emerald-950/10 border-emerald-900/50')
                                                                    : (isClinical ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/50' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80')
                                                            }`}
                                                        >
                                                            <div className="mt-0.5 shrink-0">
                                                                {flag.severity === 'red' && <AlertCircle className="text-rose-500" size={16} />}
                                                                {flag.severity === 'yellow' && <AlertTriangle className="text-amber-500" size={16} />}
                                                                {flag.severity === 'info' && <Info className="text-blue-500" size={16} />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-semibold leading-relaxed opacity-95">
                                                                    {flag.message}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-2">
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                                        isChecked 
                                                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                                            : 'border-slate-300'
                                                                    }`}>
                                                                        {isChecked && <Check size={10} className="stroke-[3]" />}
                                                                    </div>
                                                                    <span className={`text-[9px] font-bold ${isChecked ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                                        {isChecked ? 'Auditado e Inscripto' : 'Marcar como Auditado'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* BATNA Box: Ajustes de Autor */}
                                        <div className="flex flex-col gap-2 mt-auto">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-xs uppercase tracking-wider opacity-60 flex items-center gap-1">
                                                    <MessageSquare size={12} /> Ajustes de Autor (Inyección Manual)
                                                </h4>
                                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">BATNA Guard</span>
                                            </div>
                                            <p className="text-[10px] opacity-40 -mt-1 leading-tight">
                                                Escribe cualquier ajuste específico o receta personalizada. No demore el lanzamiento solicitando cambios en la macro.
                                            </p>
                                            <textarea 
                                                value={authorNotes}
                                                onChange={(e) => setAuthorNotes(e.target.value)}
                                                placeholder="Ej. Reemplazar tofu por claras de huevo adicionales en almuerzo. Agregar notas para preparación de espinacas..."
                                                className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 min-h-[90px] resize-none ${
                                                    isClinical 
                                                        ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' 
                                                        : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Dispatch Bar */}
                                <div className={`p-4 border-t flex items-center justify-between ${
                                    isClinical ? 'bg-slate-50/50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800'
                                }`}>
                                    <div className="text-xs opacity-50 flex items-center gap-2">
                                        <CheckSquare size={14} />
                                        <span>
                                            {selectedDraft.flags.filter(f => checkedFlags[f.id]).length} de {selectedDraft.flags.length} auditados
                                        </span>
                                    </div>

                                    {/* Action Button with Labor Illusion */}
                                    <button 
                                        onClick={handleApprove}
                                        disabled={isApproving || !currentDraftFlagsChecked}
                                        className={`px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 flex items-center gap-2 ${
                                            currentDraftFlagsChecked && !isApproving
                                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-emerald-500/10'
                                                : 'bg-slate-200/80 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                                        }`}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isApproving ? (
                                                <motion.div 
                                                    key="labor"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <RefreshCw size={14} className="animate-spin text-white" />
                                                    <span>
                                                        {laborState === 'analyzing' && 'AUREA: Analizando biomecánica...'}
                                                        {laborState === 'optimizing' && 'AUREA: Indexando a ficha médica...'}
                                                        {laborState === 'success' && '¡Despachado!'}
                                                    </span>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="normal"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Send size={14} />
                                                    <span>Aprobar y Despachar Plan</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-8 opacity-50">
                                Ningún borrador seleccionado.
                            </div>
                        )}
                    </main>
                </div>
            )}
        </div>
    );
};

export default ZeroDraftInbox;
