import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { IWorkoutDay } from '../../api/types';
import { SupersetGroupDropzone } from './SupersetGroupDropzone';

interface WorkoutDayProps {
    day: IWorkoutDay;
}

export const WorkoutDayDropzone = React.memo(function WorkoutDayDropzone({ day }: WorkoutDayProps) {
    const { setNodeRef } = useDroppable({
        id: day.id,
        data: { type: 'WorkoutDay', day }
    });

    const supersetIds = day.supersets?.map(s => s.id) || [];

    return (
        <div className="flex flex-col gap-4 rounded-2xl bg-card border shadow p-5 min-w-80 max-w-96 transition-all duration-300 will-change-transform transform-gpu">
            <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-bold">Día {day.order + 1}</h3>
                <span className="text-sm font-medium bg-muted px-2 py-1 rounded-md">{day.name}</span>
            </div>

            {/* A Dropzone for the full day to drop exercises/supersets into */}
            <div ref={setNodeRef} className="flex-1 flex flex-col gap-4 min-h-48">
                {day.supersets?.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl m-2">
                        Arrastra un bloque aquí...
                    </div>
                ) : (
                    <SortableContext items={supersetIds} strategy={verticalListSortingStrategy}>
                        {day.supersets?.map((group) => (
                            <SupersetGroupDropzone key={group.id} group={group} />
                        ))}
                    </SortableContext>
                )}
            </div>
        </div>
    );
}, (prev, next) => prev.day.id === next.day.id
    && prev.day.name === next.day.name
    && prev.day.order === next.day.order
    && prev.day.supersets?.length === next.day.supersets?.length
    && prev.day.supersets?.every((s, i) => s.id === next.day.supersets?.[i]?.id) === true
);
