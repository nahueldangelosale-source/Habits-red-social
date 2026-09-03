import React from 'react';
import { Search } from 'lucide-react';

// B2B Copilot: Empty Fallback Component (Graceful Degradation)
export const EmptyExerciseCard: React.FC = () => {
    return (
        <div className="w-full bg-background border border-dashed border-red-500/30 p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-24 transition-colors hover:border-red-500/50 hover:bg-red-500/5 cursor-pointer">
            <Search className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-500">Operación Degradada (Módulo Manual)</span>
            <span className="text-xs opacity-70 text-center max-w-56">
                El análisis biométrico ha sido interrumpido. Por favor, selecciona el ejercicio manualmente.
            </span>
        </div>
    );
};
