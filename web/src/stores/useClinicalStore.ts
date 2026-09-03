import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Pathology = 'LUMBAR_PAIN' | 'SHOULDER_IMPINGEMENT' | 'PATELLOFEMORAL_PAIN' | 'ACHILLES_TENDINOPATHY';
export type RedFlag = 'NEUROLOGICAL_DEFICIT' | 'CARDIOPULMONARY_COMPROMISE' | 'SYSTEMIC_ONCOLOGIC_SUSPICION' | 'ACUTE_MECHANICAL_DYSFUNCTION';

interface ClinicalState {
  activePathologies: Pathology[];
  redFlags: RedFlag[];
  wbltDeficit: boolean; // Weight-bearing Lunge Test deficit (< 30 deg or 10% asymmetry)
  morningVAS: number; // Visual Analogue Scale for pain in the morning (0-10)
}

interface ClinicalActions {
  addPathology: (pathology: Pathology) => void;
  removePathology: (pathology: Pathology) => void;
  addRedFlag: (redFlag: RedFlag) => void;
  removeRedFlag: (redFlag: RedFlag) => void;
  setWBLTDeficit: (deficit: boolean) => void;
  setMorningVAS: (vas: number) => void;
  clearClinicalProfile: () => void;
}

export const useClinicalStore = create<ClinicalState & ClinicalActions>()(
  persist(
    (set) => ({
      activePathologies: [],
      redFlags: [],
      wbltDeficit: false,
      morningVAS: 0,
      
      addPathology: (pathology) => set((state) => ({
        activePathologies: state.activePathologies.includes(pathology) 
          ? state.activePathologies 
          : [...state.activePathologies, pathology]
      })),
      
      removePathology: (pathology) => set((state) => ({
        activePathologies: state.activePathologies.filter((p) => p !== pathology)
      })),
      
      addRedFlag: (redFlag) => set((state) => ({
        redFlags: state.redFlags.includes(redFlag) 
          ? state.redFlags 
          : [...state.redFlags, redFlag]
      })),
      
      removeRedFlag: (redFlag) => set((state) => ({
        redFlags: state.redFlags.filter((f) => f !== redFlag)
      })),

      setWBLTDeficit: (deficit) => set({ wbltDeficit: deficit }),
      
      setMorningVAS: (vas) => set({ morningVAS: vas }),
      
      clearClinicalProfile: () => set({
        activePathologies: [],
        redFlags: [],
        wbltDeficit: false,
        morningVAS: 0
      })
    }),
    {
      name: 'clinical-store',
    }
  )
);
