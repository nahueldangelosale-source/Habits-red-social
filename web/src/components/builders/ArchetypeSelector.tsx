import React, { useState } from 'react';
import { useBuilderStore } from '../../stores/builderStore';
import { useTheme } from '../../context/ThemeContext';
import { Zap, Shield, ArrowRight, LayoutTemplate, Plus, Check } from 'lucide-react';

interface ArchetypeSelectorProps {
    type: 'NUTRITION' | 'FITNESS';
    onClose: () => void;
}

export const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({ type, onClose }) => {
    const { archetypes, applyArchetype, saveAsArchetype } = useBuilderStore();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customTags, setCustomTags] = useState('Low Carb, Anti-Inflammatory');

    const filteredArchetypes = archetypes.filter(a => a.type === type);

    const handleSelect = (archetypeId: string) => {
        applyArchetype('user-123', archetypeId); // Mock User ID
        onClose();
    };

    const handleCreateCustom = () => {
        // Enforce basic constraints for the custom archetype
        saveAsArchetype(type, customName || 'Custom Archetype', {
            deficit: 300,
            blacklistedTags: customTags.split(',').map(t => t.trim())
        });
        setIsCreatingCustom(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] ${isClinical
                ? 'bg-white'
                : 'bg-zinc-900 border border-white/10'}`}>

                {/* Header */}
                <div className={`p-6 border-b ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-500/20 text-purple-400'}`}>
                            {isCreatingCustom ? <Plus size={20} /> : <LayoutTemplate size={20} />}
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                {isCreatingCustom ? 'Create Custom Archetype' : 'Select Smart Archetype'}
                            </h3>
                            <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                {isCreatingCustom 
                                    ? 'Define Clinical Guardrails to auto-morph future plans.' 
                                    : (type === 'NUTRITION' ? 'Metabolic Protocols' : 'Training Blueprints') + ' that adapt to your patient.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isCreatingCustom ? (
                        <div className="space-y-4 max-w-md mx-auto py-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                    Archetype Name
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Protocolo SIBO Fase 2"
                                    value={customName}
                                    onChange={e => setCustomName(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                                        isClinical ? 'bg-white border-slate-200 focus:ring-emerald-500/20 text-slate-800' : 'bg-zinc-950 border-zinc-800 focus:ring-indigo-500/20 text-white'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                    Blacklisted Tags (Guardrails)
                                </label>
                                <input 
                                    type="text" 
                                    value={customTags}
                                    onChange={e => setCustomTags(e.target.value)}
                                    placeholder="Lácteos, Azúcar, Gluten"
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                                        isClinical ? 'bg-white border-slate-200 focus:ring-emerald-500/20 text-slate-800' : 'bg-zinc-950 border-zinc-800 focus:ring-indigo-500/20 text-white'
                                    }`}
                                />
                                <p className={`mt-2 text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                                    The RAG engine will block any food containing these tags.
                                </p>
                            </div>
                            
                            <div className={`mt-6 p-4 rounded-xl text-sm ${isClinical ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-amber-900/20 text-amber-300 border border-amber-900/50'}`}>
                                <strong>Important:</strong> Custom archetypes enforce strict Clinical Guardrails. Macros will still auto-calculate based on patient BMR.
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredArchetypes.map(arch => (
                                <div key={arch.id} className={`group relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col h-full ${isClinical
                                    ? 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10'
                                    : 'bg-white/5 border-white/10 hover:border-indigo-500 hover:bg-white/[0.07]'
                                    }`}
                                    onClick={() => handleSelect(arch.id)}
                                >
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {arch.tags.map(tag => (
                                            <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isClinical
                                                ? 'bg-slate-100 text-slate-600'
                                                : 'bg-white/10 text-zinc-400'
                                                }`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <h4 className={`font-bold text-lg mb-1 group-hover:underline ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                        {arch.name}
                                    </h4>
                                    {isClinical && arch.clinicalMetric && (
                                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full mb-2 border border-emerald-200 self-start">
                                            Trigger: {arch.clinicalMetric}
                                        </div>
                                    )}
                                    <p className={`text-xs mb-4 line-clamp-2 flex-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                                        {arch.description}
                                    </p>

                                    {/* "Auto-Morph" Preview */}
                                    <div className={`mt-auto p-3 rounded-lg text-xs ${isClinical ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-900/20 text-purple-300'}`}>
                                        <div className="flex items-center gap-1.5 font-bold mb-1">
                                            <Zap size={12} className="fill-current" /> Auto-Morph Logic:
                                        </div>
                                        <ul className="space-y-1 opacity-80 pl-1">
                                            {type === 'NUTRITION' ? (
                                                <>
                                                    <li>• Autoscales to BMR - {arch.config?.deficit}kcal</li>
                                                    <li>• Filters {arch.config?.blacklistedTags?.join(', ') || 'Allergens'}</li>
                                                </>
                                            ) : (
                                                <>
                                                    <li>• Swaps checks for Injuries</li>
                                                    <li>• {arch.config?.progressionModel} progression</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    <div className={`absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${isClinical ? 'text-emerald-500' : 'text-indigo-400'}`}>
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            ))}

                            {/* Empty State / Create New */}
                            <button 
                                onClick={() => setIsCreatingCustom(true)}
                                className={`p-5 rounded-xl border border-dashed flex flex-col items-center justify-center gap-3 transition-all ${isClinical
                                    ? 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-600'
                                    : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-400'
                                }`}>
                                <div className={`p-3 rounded-full ${isClinical ? 'bg-slate-50' : 'bg-white/5'}`}>
                                    <Zap size={20} />
                                </div>
                                <span className="text-sm font-bold">Create New Archetype</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex justify-between items-center ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-2 text-xs opacity-60">
                        <Shield size={12} />
                        <span>Protected by Clinical Guardrails</span>
                    </div>
                    <div className="flex gap-2">
                        {isCreatingCustom ? (
                            <>
                                <button
                                    onClick={() => setIsCreatingCustom(false)}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-white'}`}>
                                    Back
                                </button>
                                <button
                                    onClick={handleCreateCustom}
                                    className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-lg shadow-sm ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-indigo-500 text-black hover:scale-105'}`}>
                                    <Check size={14} /> Save Archetype
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-white'}`}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
