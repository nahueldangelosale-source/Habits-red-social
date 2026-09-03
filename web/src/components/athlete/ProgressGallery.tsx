import React, { useState } from 'react';
import { Camera, Eye, EyeOff, Plus, ChevronRight, CheckCircle2, SlidersHorizontal, Sparkles, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaselinePhotoModal } from './BaselinePhotoModal';
import { VisualComparisonModal } from './VisualComparisonModal';

interface ProgressGalleryProps {
    hideHeader?: boolean;
}

export const ProgressGallery: React.FC<ProgressGalleryProps> = ({ hideHeader = false }) => {
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

    // Read stored baseline photo or fallback
    const isBaselineCompleted = localStorage.getItem('athlete-baseline-photo-completed') === 'true';
    const storedFront = localStorage.getItem('athlete-baseline-photo-front') || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80';
    const storedSide = localStorage.getItem('athlete-baseline-photo-side') || null;
    const storedBack = localStorage.getItem('athlete-baseline-photo-back') || null;
    const nextDays = localStorage.getItem('athlete-next-photo-days') || '30';

    if (!isBaselineCompleted && !storedFront) {
        return (
            <div className="p-4 sm:p-5 text-center space-y-3 font-lato">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-200/60 dark:border-purple-500/20">
                    <Camera className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black font-montserrat text-slate-800 dark:text-zinc-200">
                        Establece tu Punto de Partida
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                        Sube tu foto inicial para comparar tu cambio corporal mes a mes.
                    </p>
                </div>
                <button 
                    onClick={() => setIsCaptureModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs py-2.5 px-5 rounded-2xl transition-all shadow-md shadow-purple-600/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Sacar Foto de Inicio (+100 XP)
                </button>

                <BaselinePhotoModal
                    isOpen={isCaptureModalOpen}
                    onClose={() => setIsCaptureModalOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-3 font-lato">
            {/* Mensaje pedagógico claro */}
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-bold leading-relaxed bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex items-start gap-2">
                <Shield size={15} className="text-purple-500 shrink-0 mt-0.5" />
                <span>
                    <strong className="text-slate-900 dark:text-white">Privado & Seguro:</strong> Tus fotos de control se guardan de forma confidencial. Sube un registro cada 30 días para evaluar tu progreso físico real.
                </span>
            </p>

            {/* Cabecera de la Línea Base */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-montserrat">
                        Punto de Partida (Línea Base)
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-800/40">
                        Día 1
                    </span>
                </div>

                <button 
                    onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                    title={isPrivacyMode ? 'Revelar Fotos' : 'Ocultar (Desenfoque)'}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-white dark:bg-zinc-800 px-2 py-1 rounded-xl border border-slate-200/80 dark:border-white/5 transition-all"
                >
                    {isPrivacyMode ? <EyeOff size={12} className="text-amber-500" /> : <Eye size={12} />}
                    <span>{isPrivacyMode ? 'Oculto' : 'Visible'}</span>
                </button>
            </div>

            {/* Cuadrícula de 3 Fotos (Frente, Perfil, Espalda) */}
            <div className="grid grid-cols-3 gap-2.5">
                {/* Frente */}
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 relative group shadow-xs">
                    <img
                        src={storedFront}
                        alt="Frente"
                        className="w-full h-full object-cover transition-all duration-300"
                        style={{ filter: isPrivacyMode ? 'blur(14px)' : 'none' }}
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                        Frente
                    </span>
                </div>

                {/* Perfil */}
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 relative group shadow-xs">
                    {storedSide ? (
                        <img
                            src={storedSide}
                            alt="Perfil"
                            className="w-full h-full object-cover transition-all duration-300"
                            style={{ filter: isPrivacyMode ? 'blur(14px)' : 'none' }}
                        />
                    ) : (
                        <button
                            onClick={() => setIsCaptureModalOpen(true)}
                            className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-2 text-center transition-colors"
                        >
                            <Camera size={18} className="opacity-50 mb-1" />
                            <span className="text-[10px] font-bold">+ Perfil</span>
                        </button>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                        Perfil
                    </span>
                </div>

                {/* Espalda */}
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 relative group shadow-xs">
                    {storedBack ? (
                        <img
                            src={storedBack}
                            alt="Espalda"
                            className="w-full h-full object-cover transition-all duration-300"
                            style={{ filter: isPrivacyMode ? 'blur(14px)' : 'none' }}
                        />
                    ) : (
                        <button
                            onClick={() => setIsCaptureModalOpen(true)}
                            className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-2 text-center transition-colors"
                        >
                            <Camera size={18} className="opacity-50 mb-1" />
                            <span className="text-[10px] font-bold">+ Espalda</span>
                        </button>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                        Espalda
                    </span>
                </div>
            </div>

            {/* Barra de Acciones Principales */}
            <div className="pt-2 flex items-center justify-between gap-2">
                <button
                    onClick={() => setIsCaptureModalOpen(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-200/60 dark:border-white/5"
                >
                    <Plus size={14} className="text-purple-500" />
                    <span>Actualizar Foto</span>
                </button>

                <button
                    onClick={() => setIsComparisonModalOpen(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-95"
                >
                    <SlidersHorizontal size={14} />
                    <span>Comparador Visual</span>
                </button>
            </div>

            {/* Modals */}
            <BaselinePhotoModal
                isOpen={isCaptureModalOpen}
                onClose={() => setIsCaptureModalOpen(false)}
            />

            <VisualComparisonModal
                isOpen={isComparisonModalOpen}
                onClose={() => setIsComparisonModalOpen(false)}
                daysPassed={parseInt(nextDays) || 30}
            />
        </div>
    );
};
