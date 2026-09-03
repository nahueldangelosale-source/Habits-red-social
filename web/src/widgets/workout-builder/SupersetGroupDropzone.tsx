import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ISupersetGroup } from '../../api/types';
import { ExerciseCard } from './ExerciseCard';

interface SupersetGroupProps {
    group: ISupersetGroup;
}

export const SupersetGroupDropzone = React.memo(function SupersetGroupDropzone({ group }: SupersetGroupProps) {
    // Sortable context for items inside the superset
    // Droppable to allow items to be dropped into an empty superset
    const { setNodeRef } = useDroppable({
        id: group.id,
        data: { type: 'Superset', group }
    });

    const exerciseIds = group.exercises?.map((ex) => ex.id) || [];

    return (
        <div
            ref={setNodeRef}
            className={`rounded-xl border-dashed border-2 p-3 flex flex-col gap-3 min-h-24 transition-colors will-change-transform transform-gpu
        ${exerciseIds.length > 1 ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/10'}`}
        >
            <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold px-1 uppercase tracking-wider">
                <span>{exerciseIds.length > 1 ? 'Superserie' : 'Bloque Simple'}</span>
                <span>{exerciseIds.length} Ejercicio(s)</span>
            </div>

            <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                    {group.exercises?.map((exercise) => (
                        <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}, (prev, next) => prev.group.id === next.group.id
    && prev.group.exercises?.length === next.group.exercises?.length
    && prev.group.exercises?.every((e, i) => e.id === next.group.exercises?.[i]?.id) === true
);
