import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const GLOBAL_POOL_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export type Gender = 'male' | 'female' | 'other' | null;

export interface Biometrics {
  weight: number;
  height: number;
  age: number;
  waist: number;
  gender: Gender;
  activityLevel: 'sedentary' | 'light' | 'active';
}

export type Archetype = 
  | 'ARQ_09_LONGEVITY_VITALITY' 
  | 'ARQ_07_TIME_CRUNCH_2X' 
  | 'ARQ_03_PPL'
  | 'ARQ_01_WELLNESS'
  | 'ARQ_CUSTOM'
  | null;

export type ClinicalHardStop = 
  | 'CERO_LACTEOS'
  | 'SIN_GLUTEN'
  | 'VEGANO'
  | 'KETO'
  | 'HIPERTENSION';

export interface Identity {
  name: string;
  phone: string;
  email: string;
}

export interface OnboardingState {
  // Routing & Attribution
  tenantId: string | null;
  setTenantId: (id: string | null) => void;

  // Block 1: Biometrics
  biometrics: Biometrics;
  setBiometrics: (data: Partial<Biometrics>) => void;

  // Block 2: Archetype Match
  archetype: Archetype;
  setArchetype: (archetype: Archetype) => void;

  // Block 3: Clinical Hard Stops
  clinicalHardStops: ClinicalHardStop[];
  toggleClinicalHardStop: (stop: ClinicalHardStop) => void;
  gutHealth: 'perfect' | 'bloated' | 'irregular';
  setGutHealth: (status: 'perfect' | 'bloated' | 'irregular') => void;
  medicationGLP1: boolean;
  setMedicationGLP1: (status: boolean) => void;
  mealSchedule: '3meals' | '5meals' | 'fasting';
  setMealSchedule: (schedule: '3meals' | '5meals' | 'fasting') => void;

  // Block 4: Identity Fusion
  identity: Identity;
  setIdentity: (data: Partial<Identity>) => void;

  // UI State
  currentBlockIndex: number;
  setCurrentBlockIndex: (index: number) => void;
  nextBlock: () => void;
  prevBlock: () => void;

  // Labor Illusion Effect
  isCalculating: boolean;
  setIsCalculating: (isCalculating: boolean) => void;

  // Demo / Bypass
  loadDummyPatient: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      tenantId: null,
      setTenantId: (id) => set({ tenantId: id }),

      biometrics: {
    weight: 70,
    height: 170,
    age: 30,
    gender: null,
    waist: 80,
    activityLevel: 'sedentary',
  },
  setBiometrics: (data) => 
    set((state) => ({ 
      biometrics: { ...state.biometrics, ...data } 
    })),

  archetype: null,
  setArchetype: (archetype) => set({ archetype }),

  clinicalHardStops: [],
  toggleClinicalHardStop: (stop) => 
    set((state) => {
      const exists = state.clinicalHardStops.includes(stop);
      if (exists) {
        return { clinicalHardStops: state.clinicalHardStops.filter(s => s !== stop) };
      } else {
        return { clinicalHardStops: [...state.clinicalHardStops, stop] };
      }
    }),
  gutHealth: 'perfect',
  setGutHealth: (status) => set({ gutHealth: status }),
  medicationGLP1: false,
  setMedicationGLP1: (status) => set({ medicationGLP1: status }),
  mealSchedule: '3meals',
  setMealSchedule: (schedule) => set({ mealSchedule: schedule }),

  identity: { name: '', phone: '', email: '' },
  setIdentity: (data) => set((state) => ({ identity: { ...state.identity, ...data } })),

  currentBlockIndex: 0,
  setCurrentBlockIndex: (index) => set({ currentBlockIndex: index }),
  nextBlock: () => set((state) => ({ currentBlockIndex: Math.min(state.currentBlockIndex + 1, 3) })),
  prevBlock: () => set((state) => ({ currentBlockIndex: Math.max(state.currentBlockIndex - 1, 0) })),

  isCalculating: false,
  setIsCalculating: (isCalculating) => set({ isCalculating }),

  loadDummyPatient: () => set({
    biometrics: { weight: 82, height: 185, age: 34, waist: 95, gender: 'male', activityLevel: 'light' },
    archetype: 'ARQ_07_TIME_CRUNCH_2X',
    clinicalHardStops: ['CERO_LACTEOS'],
    gutHealth: 'bloated',
    medicationGLP1: false,
    mealSchedule: '3meals',
    identity: { name: 'Carlos Ruiz', phone: '+5491122334455', email: 'carlos.ruiz@example.com' },
    currentBlockIndex: 3,
  }),
    }),
    {
      name: 'onboarding-b2c-storage',
    }
  )
);
