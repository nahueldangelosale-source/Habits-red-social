import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Check, Zap, Shield, Star, Crown } from 'lucide-react';

interface PlanProps {
    onSelect: (plan: 'ESSENTIAL' | 'ELITE') => void;
}

// -----------------------------------------------------------------------------
// 3D TILT CARD COMPONENT
// -----------------------------------------------------------------------------
const TiltCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;
        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative transition-all duration-200 ease-out cursor-pointer ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.div>
    );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export const PlanSelection: React.FC<PlanProps> = ({ onSelect }) => {
    return (
        <div className="w-full max-w-5xl mx-auto p-6 flex flex-col items-center">

            <div className="text-center mb-12 space-y-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-5xl font-sans font-medium text-slate-900 dark:text-white"
                >
                    Choose Your Protocol
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto"
                >
                    Select the level of intervention required for your goals. Upgrade or downgrade at any time.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full perspective-[1000px]">

                {/* PLAN A: ESSENTIAL (Clinical) */}
                <TiltCard
                    className="group"
                    onClick={() => onSelect('ESSENTIAL')}
                >
                    <div className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-white/60 dark:border-white/10 shadow-xl" />
                    <div className="relative p-8 h-full flex flex-col justify-between z-10">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-emerald-100/50 dark:bg-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-400">
                                    <Shield size={24} />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300">
                                    CLINICAL
                                </span>
                            </div>

                            <h3 className="text-2xl font-sans font-bold text-slate-800 dark:text-white mb-2">Essential</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white">$45</span>
                                <span className="text-slate-500">/mo</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    "Nutritional Audit",
                                    "Weekly Macro Adjustments",
                                    "Clinical Chat Support",
                                    "Basic Habit Tracking"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <Check size={16} className="text-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className="w-full py-4 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold text-sm tracking-wide hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                            SELECT ESSENTIAL
                        </button>
                    </div>
                </TiltCard>

                {/* PLAN B: PERFORMANCE (Elite) */}
                <TiltCard
                    className="group"
                    onClick={() => onSelect('ELITE')}
                >
                    {/* HOLOGRAPHIC BORDER EFFECT */}
                    <div className="absolute inset-0 rounded-3xl p-[2px] overflow-hidden">
                        <div className="absolute inset-[-50%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,#6366F1_90deg,#6366f1_180deg,#F43F5E_270deg,transparent_360deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Card Background */}
                    <div className="absolute inset-[2px] bg-zinc-900/90 backdrop-blur-xl rounded-[22px] border border-white/10" />

                    {/* Content */}
                    <div className="relative p-8 h-full flex flex-col justify-between z-10">
                        {/* Iridescent Glow */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-indigo-500 text-black shadow-[0_0_20px_rgba(206,255,0,0.4)]">
                                    MOST POPULAR
                                </span>
                            </div>

                            <h3 className="text-2xl font-sans font-bold text-white mb-2">Performance</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-white">$90</span>
                                <span className="text-zinc-400">/mo</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {[
                                    "Everything in Essential",
                                    "Daily Workout Programming",
                                    "Video Form Review (Unlimited)",
                                    "Priority 24/7 Response",
                                    "Elite Mindset Content"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                        <div className="p-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                                            <Check size={12} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className="relative w-full py-4 rounded-xl group-hover:scale-[1.02] transition-transform overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <span className="relative text-white font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                                <Crown size={16} /> Join the Elite
                            </span>
                        </button>
                    </div>
                </TiltCard>

            </div>
        </div>
    );
};
