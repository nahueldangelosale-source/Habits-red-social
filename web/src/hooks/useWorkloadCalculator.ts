import { useMemo } from 'react';

export interface RoutineItemAdapter {
    type?: 'EXERCISE' | 'BLOCK';
    items?: RoutineItemAdapter[];
    sets?: string;
    reps?: string;
    weight?: string;
    rpe?: string;
}

export interface WorkloadMetrics {
    totalVolumeLoad: number; // sets * reps * weight
    totalSets: number;
    averageRPE: number;
}

export function calculateMicrocycleVolume(items: RoutineItemAdapter[]): WorkloadMetrics {
    let totalVolumeLoad = 0;
    let totalSets = 0;
    let rpeSum = 0;
    let rpeCount = 0;

    const flatItems: RoutineItemAdapter[] = [];
    items.forEach(item => {
        if (item.type === 'BLOCK' && item.items) {
            flatItems.push(...item.items);
        } else {
            flatItems.push(item);
        }
    });

    flatItems.forEach(item => {
        const parseArray = (str: string) => str.split(/[,/\-\s]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));
        
        const setsMatch = item.sets?.match(/(\d+)/);
        const rpeArr = item.rpe ? parseArray(item.rpe) : [];

        if (setsMatch) {
            const s = parseInt(setsMatch[1], 10);
            totalSets += s;
            
            const repsArr = item.reps ? parseArray(item.reps) : [];
            const weightsArr = item.weight ? parseArray(item.weight) : [];

            if (repsArr.length > 0 && weightsArr.length > 0) {
                for (let i = 0; i < s; i++) {
                    const r = repsArr[i % repsArr.length];
                    const w = weightsArr[i % weightsArr.length];
                    if (!isNaN(r) && !isNaN(w)) {
                        totalVolumeLoad += (r * w);
                    }
                }
            }
        }

        if (rpeArr.length > 0) {
            rpeArr.forEach(rpe => {
                rpeSum += rpe;
                rpeCount += 1;
            });
        }
    });

    return {
        totalVolumeLoad,
        totalSets,
        averageRPE: rpeCount > 0 ? rpeSum / rpeCount : 0
    };
}

export function useWorkloadCalculator(routineItems: RoutineItemAdapter[]) {
    const metrics = useMemo(() => calculateMicrocycleVolume(routineItems), [routineItems]);
    return metrics;
}
