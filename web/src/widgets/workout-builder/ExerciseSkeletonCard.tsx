import React from 'react';
import { Sparkles } from 'lucide-react';

// B2B Copilot: Pulsing Skeleton Component (Frictionless UX)
export const ExerciseSkeletonCard: React.FC = () => {
    return (
        <div className="w-full bg-background border border-primary/20 p-4 rounded-lg flex items-center justify-between gap-4 animate-pulse relative overflow-hidden min-h-24">
            {/* Shimmer effect inside */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/5 to-transparent z-0" />

            <div className="flex items-center gap-3 relative z-10 w-full">
                {/* AI Icon placeholder */}
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary opacity-50" />
                </div>

                {/* Text lines */}
                <div className="flex flex-col gap-2 w-full">
                    <div className="h-4 bg-primary/10 rounded w-1/2"></div>
                    <div className="h-3 bg-muted/60 rounded w-1/3"></div>
                </div>

                {/* Right side metrics placeholder */}
                <div className="flex gap-2">
                    <div className="w-8 h-6 bg-primary/10 rounded"></div>
                    <div className="w-8 h-6 bg-primary/10 rounded"></div>
                    <div className="w-12 h-6 bg-primary/10 rounded"></div>
                </div>
            </div>
        </div>
    );
};
