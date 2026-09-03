"use client"

import * as React from "react"

import { useGlobalSimulator } from '../stores/useGlobalSimulator'

export type FatigueState = 'optimal' | 'risk' | 'fatigued'

interface CognitiveLoad {
  state: FatigueState
  calmMode: boolean
  gamingLocked: boolean
  athletePhase: 'ONBOARDING' | 'CONSOLIDATED'
  resilienceXp: number
}

export function useCognitiveLoad() {
  const simulator = useGlobalSimulator();

  // Mapeamos el estado del Simulador Global al "CognitiveLoad" local
  const [load, setLoad] = React.useState<CognitiveLoad>({
    state: simulator.athleteStressLevel === 'optimal' ? 'optimal' : 'fatigued',
    calmMode: simulator.athleteStressLevel === 'danger' || simulator.athleteStressLevel === 'fatigued',
    gamingLocked: simulator.athleteStressLevel === 'danger',
    athletePhase: simulator.athletePhase,
    resilienceXp: simulator.athleteResilienceXP,
  });

  // Efecto para sincronizar cambios del simulador al estado local reactivo
  React.useEffect(() => {
    setLoad({
      state: simulator.athleteStressLevel === 'optimal' ? 'optimal' : 'fatigued',
      calmMode: simulator.athleteStressLevel === 'danger' || simulator.athleteStressLevel === 'fatigued',
      gamingLocked: simulator.athleteStressLevel === 'danger',
      athletePhase: simulator.athletePhase,
      resilienceXp: simulator.athleteResilienceXP,
    });
  }, [simulator.athleteStressLevel, simulator.athletePhase, simulator.athleteResilienceXP]);

  React.useEffect(() => {
    const handleUpdate = (event: CustomEvent<FatigueState>) => {
      const state = event.detail
      setLoad(prev => ({
        ...prev,
        state,
        calmMode: state === 'fatigued' || state === 'risk',
        gamingLocked: state === 'fatigued',
      }))
    }

    const handlePhaseUpdate = (event: CustomEvent<'ONBOARDING' | 'CONSOLIDATED'>) => {
      setLoad(prev => ({ ...prev, athletePhase: event.detail }))
    }

    const handleAddXp = (event: CustomEvent<number>) => {
      setLoad(prev => ({ ...prev, resilienceXp: prev.resilienceXp + event.detail }))
    }

    const eventName = "bienestar-fatigue-update"
    const phaseEventName = "bienestar-phase-update"
    const xpEventName = "bienestar-add-xp"
    
    window.addEventListener(eventName as any, handleUpdate as any)
    window.addEventListener(phaseEventName as any, handlePhaseUpdate as any)
    window.addEventListener(xpEventName as any, handleAddXp as any)
    
    return () => {
      window.removeEventListener(eventName as any, handleUpdate as any)
      window.removeEventListener(phaseEventName as any, handlePhaseUpdate as any)
      window.removeEventListener(xpEventName as any, handleAddXp as any)
    }
  }, [])

  return load
}

export const addResilienceXp = (amount: number) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("bienestar-add-xp", { detail: amount }))
  }
}

/**
 * UTILITY: Trigger fatigue update (for testing/agent Simulation)
 */
export const triggerFatigueUpdate = (state: FatigueState) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("bienestar-fatigue-update", { detail: state }))
  }
}
