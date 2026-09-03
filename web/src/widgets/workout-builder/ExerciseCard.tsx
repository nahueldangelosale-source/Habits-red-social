import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { GripVertical, Clock, Settings2, ShieldCheck } from 'lucide-react';
import type { IExerciseTarget } from '../../api/types';
import { ExerciseSkeletonCard } from './ExerciseSkeletonCard';
import { EmptyExerciseCard } from './EmptyExerciseCard';

interface ExerciseCardProps {
    exercise: IExerciseTarget;
}

export const ExerciseCard = React.memo(function ExerciseCard({ exercise }: ExerciseCardProps) {
    if (exercise.is_skeleton_loading) {
        return <ExerciseSkeletonCard />;
    }

    if (exercise.is_empty_fallback) {
        return <EmptyExerciseCard />;
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: exercise.id, // [RULE 2] Strict unique ID for dnd-kit layout collision avoidance
        data: { type: 'Exercise', exercise }
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 99 : 1,
        viewTransitionName: `card-${exercise.id}`
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            layoutId={exercise.id} // [RULE 2] Strict unique ID mapping to Framer Motion to prevent flickering
            className={`card rounded-xl p-3 border shadow-sm flex flex-col gap-2 relative
        ${isDragging ? 'border-primary ring-2 ring-primary/20 bg-background' : 'border-border/40 bg-card'}
        ${exercise.isAiSwapped ? 'ring-1 ring-neon-primary/50 shadow-glow-lime bg-gradient-to-br from-emerald-950/20 to-transparent' : ''}`}
        >
            {exercise.isAiSwapped && (
                <Tooltip.Provider>
                    <Tooltip.Root delayDuration={0}>
                        <Tooltip.Trigger asChild>
                            <div className="absolute -top-2 -right-2 bg-zinc-950 border border-emerald-500/50 rounded-full p-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-20 cursor-help">
                                <ShieldCheck size={14} className="text-neon-primary drop-shadow-[0_0_5px_oklch(0.92_0.23_130/0.8)]" />
                            </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content side="top" sideOffset={8} className="z-[100] max-w-64">
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-2xl font-sans"
                                >
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                        <strong className="text-neon-primary font-semibold block mb-1 flex items-center gap-1"><ShieldCheck size={12} /> Swap Engine (IA) Activo</strong>
                                        Adaptado automáticamente por restricción clínica: <span className="text-white font-medium">{exercise.clinicalContext || 'Prevención general'}</span>.
                                    </p>
                                    <Tooltip.Arrow className="fill-zinc-800" />
                                </motion.div>
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Drag Handle */}
                    <button
                        {...attributes}
                        {...listeners}
                        type="button"
                        aria-label="Arrastrar ejercicio"
                        className="p-1 rounded hover:bg-muted text-muted-foreground cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-primary"
                    >
                        <GripVertical size={16} />
                    </button>
                    <span className="font-medium text-sm">
                        Exercise #{exercise.exercise_id?.substring(0, 4)}
                    </span>
                </div>

                {/* Intelligence Status Badge */}
                {exercise.weight && !exercise.sets && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold flex items-center gap-1">
                        <Settings2 size={12} /> Auto 1RM
                    </span>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex flex-col items-center bg-muted/30 p-2 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Sets x Reps</span>
                    <span className="font-mono text-sm">{exercise.sets || '-'} x {exercise.reps || '-'}</span>
                </div>
                <div className="flex flex-col items-center bg-muted/30 p-2 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Carga</span>
                    <span className="font-mono text-sm">{exercise.weight ? `${exercise.weight}kg` : '-'}</span>
                </div>
                <div className="flex flex-col items-center bg-muted/30 p-2 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Rest</span>
                    <span className="font-mono text-sm flex items-center gap-1">
                        <Clock size={12} /> {exercise.rest_seconds || '0'}s
                    </span>
                </div>
            </div>
        </motion.div>
    );
}, (prev, next) => prev.exercise.id === next.exercise.id
    && prev.exercise.sets === next.exercise.sets
    && prev.exercise.reps === next.exercise.reps
    && prev.exercise.weight === next.exercise.weight
    && prev.exercise.rest_seconds === next.exercise.rest_seconds
    && prev.exercise.is_skeleton_loading === next.exercise.is_skeleton_loading
    && prev.exercise.is_empty_fallback === next.exercise.is_empty_fallback
    && prev.exercise.isAiSwapped === next.exercise.isAiSwapped
    && prev.exercise.clinicalContext === next.exercise.clinicalContext
);
