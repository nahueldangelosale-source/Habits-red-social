import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';
import { getLocalDb, executeOptimisticMutation } from '../../domains/core/localDb';

type ProfilerTag = {
    id: string;
    category: string;
    ui_label: string;
    ui_icon: string | null;
    backend_value: string;
};

export function ProgressiveProfilerWidget() {
    const [tags, setTags] = useState<ProfilerTag[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const db = getLocalDb();
                const result = await db.execute("SELECT * FROM onboarding_tags WHERE category IN ('COACHING_STYLE', 'STRESS', 'SLEEP', 'DIET')");
                const mappedTags = result.rows.map(r => ({
                    id: r.id as string,
                    category: r.category as string,
                    ui_label: r.ui_label as string,
                    ui_icon: r.ui_icon as string | null,
                    backend_value: r.backend_value as string
                }));
                setTags(mappedTags);
            } catch (err) {
                console.error("❌ Error fetching profiler tags:", err);
            }
        };
        fetchTags();
    }, []);

    const categories = ['COACHING_STYLE', 'STRESS', 'SLEEP', 'DIET'];
    // Only show categories that we actually retrieved from the DB
    const availableCategories = categories.filter(c => tags.some(t => t.category === c));
    const currentCategory = availableCategories[currentStep];
    const categoryTags = tags.filter(t => t.category === currentCategory);

    const getQuestionText = (cat: string) => {
        switch (cat) {
            case 'COACHING_STYLE': return '¿Qué tipo de Coach te motiva más?';
            case 'STRESS': return '¿Cómo es tu nivel de estrés diario?';
            case 'SLEEP': return '¿Cómo describirías tu calidad de sueño?';
            case 'DIET': return '¿Tienes alguna preferencia dietética?';
            default: return 'Selecciona una opción';
        }
    };

    const handleSelect = async (backendValue: string) => {
        // Optimistic Save to the athlete profile
        try {
            const updatePayload = JSON.stringify({ [currentCategory]: backendValue });
            await executeOptimisticMutation(
                "INSERT OR REPLACE INTO athlete_profiles (id, payload) VALUES (?, ?)", 
                ["temp-user-id", updatePayload] // In a real app, merge with existing JSON
            );
        } catch (err) {
            console.error(err);
        }

        if (currentStep < availableCategories.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            setIsComplete(true);
        }
    };

    if (availableCategories.length === 0) return null;

    if (isComplete) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-[24px] p-6 text-center backdrop-blur-xl"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Algoritmo Calibrado</h3>
                <p className="text-zinc-400 text-sm">El Swap Engine ha integrado tus preferencias. El emparejamiento con tu Coach está en camino y las rutinas se ajustarán a tu perfil metabólico.</p>
            </motion.div>
        );
    }

    return (
        <div className="bg-black/40 border border-white/10 rounded-[24px] p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            {/* Liquid Tech Background */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={100} className="text-indigo-400" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                        Matchmaker AI Calibrando...
                    </span>
                </div>
                
                <h2 className="text-2xl font-black text-white italic tracking-tight mb-1">
                    {getQuestionText(currentCategory)}
                </h2>
                <p className="text-xs text-zinc-400 mb-6">Fina afinación del algoritmo algorítmico mientras buscamos tu mejor opción.</p>

                <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {categoryTags.map(tag => (
                            <motion.button
                                key={tag.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(tag.backend_value)}
                                className="w-full text-left bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/10"
                            >
                                <span className="text-2xl bg-black/50 w-12 h-12 rounded-full flex items-center justify-center">
                                    {tag.ui_icon}
                                </span>
                                <span className="font-bold text-zinc-200 text-lg">
                                    {tag.ui_label}
                                </span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
                
                <div className="mt-6 flex justify-center gap-2">
                    {availableCategories.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-cyan-400 w-8' : idx < currentStep ? 'bg-emerald-400 w-4' : 'bg-white/20 w-4'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
