import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BrainCircuit } from 'lucide-react';

interface CopilotGenericBlockProps {
    id: string;
    typeName: string;
}

export const CopilotGenericBlock: React.FC<CopilotGenericBlockProps> = ({ id, typeName }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { type: 'GenericBlock', block_type: typeName }
    });

    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                p-3 border rounded-lg flex items-center gap-2 cursor-grab w-48 text-sm font-medium transition-all shadow-sm
                ${isDragging
                    ? 'bg-primary/20 border-primary/50 text-primary z-50 shadow-lg scale-105'
                    : 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'
                }
            `}
        >
            <BrainCircuit size={16} className={isDragging ? 'animate-pulse' : ''} />
            {typeName}
        </div>
    );
};
