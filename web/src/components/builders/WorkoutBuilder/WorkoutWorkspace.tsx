import React, { useState } from 'react';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { WorkoutLibraryPanel } from './WorkoutLibraryPanel';
import { WorkoutBuilderCanvas } from './WorkoutBuilderCanvas';
import { useTheme } from '../../../context/ThemeContext';

export const WorkoutWorkspace: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    
    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active.data.current?.type === 'EXERCISE_ITEM') {
            setActiveDragItem(active.data.current.item);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragItem(null);
        const { active, over } = event;
        
        if (!over) return; // Dropped outside a valid zone

        const isExerciseItem = active.data.current?.type === 'EXERCISE_ITEM';
        const isWorkoutDay = over.data.current?.type === 'WORKOUT_DAY_DROP_ZONE';

        if (isExerciseItem && isWorkoutDay) {
            const exercise = active.data.current?.item;
            const dayId = over.data.current?.dayId;
            
            // TODO: Here we would dispatch an action to our Zustand store to add the exercise
            console.log(`Dropped exercise ${exercise.name} into day ${dayId}`);
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className={`flex w-full h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-[#09090b] border-white/10'}`}>
                
                {/* Panel de Biblioteca (Izquierda) */}
                <div className="hidden xl:block h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    <WorkoutLibraryPanel />
                </div>

                {/* Lienzo de Construcción (Derecha) */}
                <div className="flex-1 h-full min-w-0 bg-slate-50/50">
                    <WorkoutBuilderCanvas />
                </div>

            </div>

            {/* Overlay Magnético durante el arrastre */}
            <DragOverlay dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeDragItem ? (
                    <div className={`p-3 rounded-xl border shadow-xl flex flex-col gap-1 w-64 ${isClinical ? 'bg-white border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-zinc-800 border-indigo-500/50'}`}>
                        <div className="flex justify-between items-start">
                            <span className={`font-bold text-xs font-montserrat ${isClinical ? 'text-slate-800' : 'text-white'}`}>{activeDragItem.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isClinical ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-500/20 text-indigo-400'}`}>Lvl {activeDragItem.level}</span>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
