import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface Alternative {
    id: string;
    name: string;
    portion: number;
    unit: string;
    suitabilityScore: number;
    reason: string;
    isHardConstraint?: boolean;
    hardConstraintReason?: string;
}

interface FoodSwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalFood: { name: string; portion: number; unit: string };
    onSwap: (newFood: any) => void;
    x?: number;
    y?: number;
}

const MOCK_ALTERNATIVES: Record<string, Alternative[]> = {
    'Pollo': [
        { id: 'a1', name: 'Tofu Firme', portion: 210, unit: 'g', suitabilityScore: 98, reason: 'Equivale a los 30g de proteína de la porción original, manteniendo el déficit calórico intacto y respetando la restricción vegana.' },
        { id: 'a2', name: 'Tempeh', portion: 180, unit: 'g', suitabilityScore: 85, reason: 'Excelente perfil proteico, aunque incrementa ligeramente la carga calórica total (+45 kcal).' },
        { id: 'a3', name: 'Seitán (Gluten de Trigo)', portion: 120, unit: 'g', suitabilityScore: 0, reason: '', isHardConstraint: true, hardConstraintReason: 'Violación de Restricción Dura (Enfermedad Celíaca). Riesgo clínico alto.' }
    ],
    'Ajo': [
        { id: 'r1', name: 'Aceite de Oliva Infusionado', portion: 15, unit: 'ml', suitabilityScore: 100, reason: 'Low-FODMAP absoluto. Aporta el perfil de sabor sin los fructanos que desencadenan la sintomatología SIBO.' },
        { id: 'r2', name: 'Parte verde de cebolleta', portion: 20, unit: 'g', suitabilityScore: 90, reason: 'Bajo en FODMAPs, proporciona perfil aromático similar.' }
    ]
};

export const FoodSwapModal: React.FC<FoodSwapModalProps> = ({ isOpen, onClose, originalFood, onSwap, x = 0, y = 0 }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const [hoveredAlt, setHoveredAlt] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    // Obtener alternativas o genéricas
    const searchKey = Object.keys(MOCK_ALTERNATIVES).find(k => originalFood.name.toLowerCase().includes(k.toLowerCase())) || 'Pollo';
    const alternatives = MOCK_ALTERNATIVES[searchKey] || MOCK_ALTERNATIVES['Pollo'];

    // Escudo contra Colapso de Macros
    const isProteinSource = originalFood.name.toLowerCase().includes('pollo') || 
                            originalFood.name.toLowerCase().includes('chicken') || 
                            originalFood.name.toLowerCase().includes('carne') ||
                            originalFood.name.toLowerCase().includes('pescado');
    
    const isLowProteinSearch = searchQuery.trim() !== '' && (
        searchQuery.toLowerCase().includes('broc') || 
        searchQuery.toLowerCase().includes('espi') || 
        searchQuery.toLowerCase().includes('lech') || 
        searchQuery.toLowerCase().includes('vege') || 
        searchQuery.toLowerCase().includes('verd') || 
        searchQuery.toLowerCase().includes('toma') || 
        searchQuery.toLowerCase().includes('zana') ||
        searchQuery.toLowerCase().includes('manz') ||
        searchQuery.toLowerCase().includes('apple') ||
        searchQuery.toLowerCase().includes('pepi')
    );
    const hasMacroCollapse = isProteinSource && isLowProteinSearch;

    const filteredAlternatives = alternatives.filter(alt => 
        alt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alt.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayAlternatives: Alternative[] = [...filteredAlternatives];
    if (hasMacroCollapse && !displayAlternatives.some(alt => alt.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
        displayAlternatives.push({
            id: 'v-custom',
            name: searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1),
            portion: 150,
            unit: 'g',
            suitabilityScore: 12,
            reason: 'Alarma de Colapso de Macros: Reemplazar pollo por un vegetal rompe la estructura del plan (-26.4g proteína). Se requiere compensación.',
            isHardConstraint: false
        });
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
        if (score >= 50) return 'text-amber-500 stroke-amber-500';
        return 'text-rose-500 stroke-rose-500';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'text-emerald-500/20 stroke-emerald-500/20';
        if (score >= 50) return 'text-amber-500/20 stroke-amber-500/20';
        return 'text-rose-500/20 stroke-rose-500/20';
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
                    isClinical ? 'bg-slate-900/20' : 'bg-black/50'
                }`}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    onClick={e => e.stopPropagation()}
                    className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${
                        isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                    }`}
                >
                    {/* Header */}
                    <div className={`p-5 border-b flex flex-col gap-2 ${isClinical ? 'border-slate-100' : 'border-zinc-800'}`}>
                        <div className="flex items-center gap-2">
                            <RefreshCw size={16} className={isClinical ? 'text-slate-400' : 'text-zinc-500'} />
                            <h3 className={`font-bold text-sm uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                Motor de Intercambio (RAG)
                            </h3>
                        </div>
                        <h2 className={`text-2xl font-black tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                            Reemplazar <span className="line-through opacity-40">{originalFood.portion}{originalFood.unit} de {originalFood.name}</span>
                        </h2>
                    </div>

                    {/* Search Bar */}
                    <div className={`p-4 border-b ${isClinical ? 'border-slate-100 bg-slate-50/50' : 'border-zinc-800 bg-zinc-950/50'}`}>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                            isClinical ? 'bg-white border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 ring-emerald-500/20' : 'bg-zinc-900 border-zinc-700 focus-within:border-indigo-500'
                        }`}>
                            <Search size={18} className={isClinical ? 'text-slate-400' : 'text-zinc-400'} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar alternativa específica (ej. Brócoli, Tofu)..."
                                className="flex-1 bg-transparent text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Macro Collapse Warning Banner */}
                    {hasMacroCollapse && (
                        <div className={`mx-4 mt-4 p-4 rounded-2xl border transition-all ${
                            isClinical ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}>
                            <div className="flex items-start gap-3">
                                <AlertTriangle className={`shrink-0 mt-0.5 ${isClinical ? 'text-amber-600' : 'text-amber-400'}`} size={18} />
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                                        Escudo de Colapso de Macros Activo
                                    </h4>
                                    <p className="text-xs opacity-90 mb-3">
                                        Intentas reemplazar <strong>{originalFood.name}</strong> (alto en proteínas) por <strong>{searchQuery}</strong> (bajo en proteínas). Esto produce una desviación crítica de <strong>-26.4g de proteína</strong>.
                                    </p>
                                    <div className="text-[11px] font-semibold uppercase tracking-wider opacity-75 mb-2">
                                        Reemplazos Equivalentes Sugeridos (Relación ALTERNATIVE_TO):
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => onSwap({ id: 'a1', name: 'Tofu Firme', portion: 210, unit: 'g', suitabilityScore: 98, reason: 'Equivalente a la porción original de proteína de forma determinista.' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                isClinical ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950'
                                            }`}
                                        >
                                            Tofu Firme (210g)
                                        </button>
                                        <button
                                            onClick={() => onSwap({ id: 'a2', name: 'Tempeh', portion: 180, unit: 'g', suitabilityScore: 85, reason: 'Equivalente proteico con ligero aporte extra calórico.' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                isClinical ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950'
                                            }`}
                                        >
                                            Tempeh (180g)
                                        </button>
                                        <button
                                            onClick={() => onSwap({ id: 'a4', name: 'Seitán', portion: 120, unit: 'g', suitabilityScore: 92, reason: 'Equivalente en contenido proteico.' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                isClinical ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950'
                                            }`}
                                        >
                                            Seitán (120g)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alternatives List */}
                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
                            Sugerencias Semánticas Calculadas
                        </div>
                        
                        <div className="space-y-2 px-2">
                            {displayAlternatives.map(alt => (
                                <div 
                                    key={alt.id}
                                    onMouseEnter={() => setHoveredAlt(alt.id)}
                                    onMouseLeave={() => setHoveredAlt(null)}
                                    className={`relative group p-4 rounded-2xl border transition-all ${
                                        alt.isHardConstraint 
                                            ? (isClinical ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-900/60') 
                                            : isClinical 
                                                ? 'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md cursor-pointer' 
                                                : 'bg-zinc-900 border-zinc-800 hover:border-indigo-500/50 cursor-pointer'
                                    }`}
                                    onClick={() => !alt.isHardConstraint && onSwap(alt)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Suitability Score Ring or Hard Constraint Shield */}
                                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                                            {alt.isHardConstraint ? (
                                                <div className={`w-full h-full rounded-full border-2 flex items-center justify-center ${
                                                    isClinical 
                                                        ? 'bg-rose-100 border-rose-500 text-rose-500' 
                                                        : 'bg-rose-950/30 border-rose-500/50 text-rose-450'
                                                }`}>
                                                    <AlertTriangle size={20} />
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                        <path
                                                            className={getScoreBg(alt.suitabilityScore)}
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className={getScoreColor(alt.suitabilityScore)}
                                                            strokeDasharray={`${alt.suitabilityScore}, 100`}
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute flex flex-col items-center justify-center text-[10px] font-bold">
                                                        {alt.suitabilityScore}%
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Core Info */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`font-bold text-base flex items-center gap-2 ${
                                                    alt.isHardConstraint 
                                                        ? (isClinical ? 'text-rose-800' : 'text-rose-300') 
                                                        : ''
                                                }`}>
                                                    {alt.name}
                                                </h4>
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                    alt.isHardConstraint 
                                                        ? (isClinical ? 'bg-rose-100 text-rose-700' : 'bg-rose-950/30 text-rose-300 border border-rose-900/50') 
                                                        : isClinical 
                                                            ? 'bg-slate-100 text-slate-700' 
                                                            : 'bg-white/10 text-white'
                                                }`}>
                                                    {alt.portion}{alt.unit}
                                                </span>
                                            </div>
                                            
                                            {/* Progressive Disclosure & Hard Constraint Logic */}
                                            {alt.isHardConstraint ? (
                                                <div className="mt-2">
                                                    <p className={`text-xs font-medium mb-3 flex gap-2 ${isClinical ? 'text-rose-700' : 'text-rose-300'}`}>
                                                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                                        {alt.hardConstraintReason}
                                                    </p>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onSwap(alt); }}
                                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm w-full transition-colors"
                                                    >
                                                        Forzar Manual Override
                                                    </button>
                                                </div>
                                            ) : (
                                                <AnimatePresence>
                                                    {(hoveredAlt === alt.id || alt.suitabilityScore < 50) && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="overflow-hidden"
                                                        >
                                                            <p className={`text-xs mt-2 flex gap-2 ${
                                                                alt.suitabilityScore < 50 
                                                                    ? (isClinical ? 'text-amber-600' : 'text-amber-450') 
                                                                    : isClinical 
                                                                        ? 'text-slate-500' 
                                                                        : 'text-zinc-400'
                                                            }`}>
                                                                <Info size={14} className="shrink-0 mt-0.5" />
                                                                {alt.reason}
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
