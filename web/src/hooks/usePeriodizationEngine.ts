import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface SmartSlotInjectionParams {
    patternId: string;
    hasKneeInjury: boolean;
    // We mock exercise lookup since we are pure logic. We return the criteria so the caller can add the exercise.
}

export interface InjectionResult {
    name: string;
    pattern: string;
    isAdapted: boolean;
}

/**
 * Motor puro de periodización. No contiene UI, solo lógica de negocio y estado abstracto.
 */
export function usePeriodizationEngine() {
    // Generación matemática de la progresión del mesociclo
    const generateMesocycleProgression = useCallback((baseRoutine: any[]) => {
        if (!baseRoutine || baseRoutine.length === 0) {
            throw new Error("Se requiere al menos un bloque/día base para la progresión.");
        }
        
        // Simulación de progresión ondulante. Devuelve 4 microciclos.
        const mesocycle = Array.from({ length: 4 }).map((_, weekIndex) => {
            return baseRoutine.map(item => {
                const progressionMultiplier = 1 + (weekIndex * 0.025); // +2.5% por semana
                return {
                    ...item,
                    progression: `Semana ${weekIndex + 1} (+${(weekIndex * 2.5).toFixed(1)}%)`,
                    week: weekIndex + 1,
                    multiplier: progressionMultiplier
                };
            });
        });
        
        return mesocycle;
    }, []);

    const resolveSmartSlot = useCallback(({ patternId, hasKneeInjury }: SmartSlotInjectionParams): InjectionResult => {
        let result: InjectionResult = {
            name: "Ejercicio Estándar",
            pattern: patternId,
            isAdapted: false
        };

        if (patternId === 'RODILLA') {
            if (hasKneeInjury) {
                result = { name: "Sentadilla en Caja (Bajo Impacto)", pattern: "KNEE_DOM_BILATERAL", isAdapted: true };
            } else {
                result = { name: "Sentadilla Trasera con Barra", pattern: "RODILLA", isAdapted: false };
            }
        } else if (patternId === 'CADERA') {
            result = { name: "Peso Muerto Rumano", pattern: "CADERA", isAdapted: false };
        } else if (patternId === 'EMPUJE_V') {
            result = { name: "Press Militar", pattern: "EMPUJE_V", isAdapted: false };
        } else if (patternId === 'EMPUJE_H') {
            result = { name: "Press de Banca", pattern: "EMPUJE_H", isAdapted: false };
        } else if (patternId === 'TRACCION_V') {
            result = { name: "Dominadas", pattern: "TRACCION_V", isAdapted: false };
        }

        return result;
    }, []);

    const validateBiomechanicalSwap = useCallback((currentPlane: string, newPlane: string): boolean => {
        if (currentPlane !== newPlane) {
            toast.error(`Warning: Biomechanical Dissonance. No puedes cambiar un ejercicio de plano ${currentPlane} por uno ${newPlane}.`, {
                icon: '⚠️',
                duration: 4000
            });
            return false;
        }
        return true;
    }, []);

    return {
        generateMesocycleProgression,
        resolveSmartSlot,
        validateBiomechanicalSwap
    };
}
