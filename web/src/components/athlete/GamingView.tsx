import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, Zap, Target, Star, Brain, Heart, Crosshair, X } from 'lucide-react';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { useHabitStore } from '../../stores/useHabitStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { useGamificationStore, getLevelTitle } from '../../stores/useGamificationStore';
import { MindView } from './MindView';

const RadarChart = () => {
    // Un radar básico usando SVG nativo
    // Centro: 100, 100. Radio máximo: 80
    // Coordenadas fijas para el polígono para dar ese efecto "gaming"
    return (
        <div className="relative w-full aspect-square bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center overflow-hidden shadow-sm dark:shadow-[0_0_40px_rgba(206,255,0,0.05)]">
            {/* Título estilo HUD */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <span className="text-xs font-black text-slate-900 dark:text-white tracking-[0.2em]">FATIGA GLOBAL</span>
                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/30 flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    SOBRECARGA
                </span>
            </div>

            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[250px] relative z-0">
                {/* Ejes y background web */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                    <polygon 
                        key={i}
                        points="100,20 180,100 100,180 20,100" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="1"
                        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
                    />
                ))}
                
                {/* Ejes cruzados */}
                <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* Polígono de Datos (Estilo Videojuego - Neon Lime) */}
                <motion.polygon 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    points="100,40 160,120 100,170 30,100" 
                    fill="rgba(206, 255, 0, 0.15)" 
                    stroke="#6366f1" 
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(206, 255, 0, 0.5))' }}
                />

                {/* Etiquetas de los Ejes */}
                <text x="100" y="15" fill="#666" fontSize="8" textAnchor="middle" className="font-bold tracking-widest">SNC</text>
                <text x="185" y="103" fill="#666" fontSize="8" textAnchor="start" className="font-bold tracking-widest">TREN INFERIOR</text>
                <text x="100" y="190" fill="#666" fontSize="8" textAnchor="middle" className="font-bold tracking-widest">CORE</text>
                <text x="15" y="103" fill="#666" fontSize="8" textAnchor="end" className="font-bold tracking-widest">TREN SUPERIOR</text>
            </svg>
        </div>
    );
};

const SkillTree = () => {
    const { resilienceXp } = useCognitiveLoad();
    
    // Calculate level based on XP (e.g. 100 XP per level)
    const resilienceLevel = Math.floor(resilienceXp / 100);

    return (
        <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-3xl p-6 mt-6">
            <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-6 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Árbol de Habilidades
            </h3>
            
            <div className="relative h-48 w-full flex items-center justify-center">
                {/* Conexiones SVG */}
                <svg className="absolute inset-0 w-full h-full z-0">
                    <line x1="50%" y1="20%" x2="20%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <line x1="50%" y1="20%" x2="80%" y2="80%" stroke="#6366f1" strokeWidth="3" className="opacity-40" />
                    <line x1="50%" y1="20%" x2="50%" y2="80%" stroke={resilienceLevel > 1 ? "#818cf8" : "rgba(255,255,255,0.1)"} strokeWidth="3" className="opacity-60" />
                </svg>

                {/* Nodos */}
                <div className="absolute top-[10%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-black border-2 border-lime-500 dark:border-lime-400 flex items-center justify-center shadow-[0_0_20px_rgba(206,255,0,0.2)]">
                        <Star className="w-8 h-8 text-lime-600 dark:text-lime-400" />
                    </div>
                    <span className="text-xs font-bold mt-2 text-slate-900 dark:text-white">Fuerza Base</span>
                    <span className="text-[10px] text-lime-400 font-black tracking-widest">LVL 5</span>
                </div>

                <div className="absolute top-[80%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 opacity-50 grayscale">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-zinc-600 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-slate-400 dark:text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-bold mt-2 text-slate-500 dark:text-zinc-400 text-center">Resistencia<br/>Metabólica</span>
                </div>

                {/* Nodo de Recuperación / Resiliencia (Se alimenta de los Hábitos) */}
                <div className={`absolute top-[80%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all ${resilienceLevel > 1 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                    <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-black border-2 flex items-center justify-center ${resilienceLevel > 1 ? 'border-indigo-500 dark:border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.3)]' : 'border-slate-300 dark:border-zinc-600'}`}>
                        <Brain className={`w-7 h-7 ${resilienceLevel > 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-400'}`} />
                    </div>
                    <span className="text-[10px] font-bold mt-2 text-slate-900 dark:text-white">Maestría SNC</span>
                    <span className="text-[10px] text-indigo-400 font-black tracking-widest">LVL {resilienceLevel}</span>
                </div>

                <div className="absolute top-[80%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-black border-2 border-lime-500 dark:border-lime-400 flex items-center justify-center shadow-[0_0_15px_rgba(206,255,0,0.1)]">
                        <Crosshair className="w-7 h-7 text-lime-600 dark:text-lime-400" />
                    </div>
                    <span className="text-[10px] font-bold mt-2 text-slate-900 dark:text-white">Hipertrofia</span>
                    <span className="text-[10px] text-lime-400 font-black tracking-widest">LVL 2</span>
                </div>
            </div>
        </div>
    );
};

export const GamingView: React.FC = () => {
    const { athletePhase, calmMode } = useCognitiveLoad();
    const { getDailyStreak } = useHabitStore();
    const { identity } = useOnboardingPTStore();
    const { totalXP, level, hasSyncAnomaly, xpMultiplier, getXPProgress, getLeaderboard } = useGamificationStore();
    const { currentXP, xpForNextLevel, progressPercent } = getXPProgress();
    const leaderboard = getLeaderboard();
    
    const activeClientId = identity.fullName || 'unknown';
    const streak = getDailyStreak(activeClientId);
    
    const [isClinicOpen, setIsClinicOpen] = useState(false);
    
    const isOnboarding = athletePhase === 'ONBOARDING';

    return (
        <div className="min-h-full p-6 pb-32 bg-transparent relative">
            
            <header className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Perfil Atlético</h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Nivel {level} • {getLevelTitle(level)}</p>
            </header>

            {/* XP Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Progreso de Nivel</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        XP: {currentXP} / {xpForNextLevel}
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                    />
                </div>
                {hasSyncAnomaly && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                    >
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Zap size={16} />
                            </motion.div>
                            <span className="text-xs font-bold uppercase tracking-wider">Anomalía Temporal Detectada</span>
                        </div>
                        <span className="text-xs font-black bg-amber-500 text-white px-2 py-1 rounded-md">
                            {xpMultiplier}x XP
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Consistency Ring siempre arriba */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none p-4 rounded-2xl mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-full border-4 border-slate-100 dark:border-zinc-800 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="none" className="text-orange-500" strokeDasharray="163" strokeDashoffset={163 - (streak > 0 ? (streak / 30) * 163 : 0)} strokeLinecap="round" />
                        </svg>
                        <Flame className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold">Racha Actual</h4>
                        <p className="text-orange-500 text-sm font-black tracking-widest">{streak} DÍAS</p>
                    </div>
                </div>
                
                {/* Botón Clínica de Recuperación (Santuario) */}
                <button 
                    onClick={() => setIsClinicOpen(true)}
                    className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"
                >
                    <Brain size={24} />
                </button>
            </div>

            {/* Modal de Clínica de Recuperación */}
            <AnimatePresence>
                {isClinicOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto"
                    >
                        <div className="sticky top-0 z-50 flex justify-between items-center p-4 bg-slate-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Brain size={20} />
                                <span className="font-bold uppercase tracking-widest text-xs">Clínica de Recuperación</span>
                            </div>
                            <button 
                                onClick={() => setIsClinicOpen(false)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-200 dark:bg-zinc-900 rounded-full text-slate-600 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="relative min-h-full">
                            <MindView />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Badges / Coleccionables */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Star size={16} className="text-amber-500" />
                        Logros & Medallas
                    </h3>
                    <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">2 de 12 Desbloqueados</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* Badge 1 - Unlocked */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="relative rounded-3xl bg-gradient-to-b from-amber-500/20 to-orange-600/10 border border-amber-500/30 p-5 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                            <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                                <Flame className="w-8 h-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                            </div>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white text-center">Fuego Inicial</h4>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400/80 font-bold uppercase tracking-widest mt-1 text-center">Racha de 7 días</p>
                    </motion.div>

                    {/* Badge 2 - Unlocked */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="relative rounded-3xl bg-gradient-to-b from-blue-500/20 to-indigo-600/10 border border-blue-500/30 p-5 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 p-1 mb-3 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                            <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                                <Shield className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            </div>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white text-center">Escudo de Hierro</h4>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400/80 font-bold uppercase tracking-widest mt-1 text-center">Protector del Squad</p>
                    </motion.div>

                    {/* Badge 3 - Locked */}
                    <div className="relative rounded-3xl bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 p-5 flex flex-col items-center justify-center opacity-60 grayscale transition-all hover:grayscale-0">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-zinc-800 p-1 mb-3">
                            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
                            </div>
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-zinc-400 text-center">Alto Voltaje</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-widest mt-1 text-center">Requiere Nivel 20</p>
                    </div>

                    {/* Badge 4 - Locked */}
                    <div className="relative rounded-3xl bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 p-5 flex flex-col items-center justify-center opacity-60 grayscale transition-all hover:grayscale-0">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-zinc-800 p-1 mb-3">
                            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                                <Target className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
                            </div>
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-zinc-400 text-center">Francotirador</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-widest mt-1 text-center">30 Días 100% Adh</p>
                    </div>
                </div>
            </div>

            {/* Mini Leaderboard */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Flame size={16} className="text-orange-500" />
                        Ranking Semanal del Squad
                    </h3>
                </div>
                
                <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col gap-[1px]">
                    {leaderboard.slice(0, 4).map((member, index) => (
                        <motion.div 
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center p-4 gap-4 bg-slate-50 dark:bg-[#0a0a0a] ${member.isMe ? 'border-l-4 border-l-indigo-500' : ''}`}
                        >
                            <span className="text-sm font-black text-slate-400 dark:text-zinc-600 w-4 text-center">{index + 1}</span>
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold text-slate-500 dark:text-zinc-400">{member.name.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-bold truncate ${member.isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                                    {member.name} {member.isMe && '(Tú)'}
                                </h4>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className="text-sm font-black text-slate-900 dark:text-white block">{member.weeklyXP}</span>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">XP</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Revelación Progresiva: Radares y Skill Trees solo para Consolidados */}
            {isOnboarding ? (
                <div className="bg-slate-200/50 dark:bg-zinc-900/30 border border-slate-300 dark:border-white/5 rounded-3xl p-8 text-center flex flex-col items-center">
                    <Brain className="w-12 h-12 text-slate-400 dark:text-zinc-600 mb-4" />
                    <h3 className="text-slate-900 dark:text-white font-bold mb-2">Telemetría Avanzada Bloqueada</h3>
                    <p className="text-slate-500 dark:text-zinc-500 text-sm">
                        Mantén tu racha por 18 días más para desbloquear el Radar de Fatiga y el Árbol de Habilidades. Enfócate en la consistencia.
                    </p>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <RadarChart />
                    <SkillTree />
                </motion.div>
            )}

        </div>
    );
};
