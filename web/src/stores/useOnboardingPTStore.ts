import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AthleteTrait, AthleteTraitSchema } from '../schemas/traitsSchema';

export interface TraitEvent {
  action: 'ADDED' | 'STALED' | 'REMOVED';
  traitId: string;
  timestamp: string;
}

export type Gender = 'male' | 'female' | 'other' | null;

export interface BiometricsPT {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
}

export interface TrainingPT {
  experience_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  days_per_week: number;
  duration_pref: number;
  equipment: string[];
  coaching_preference: string;
}

export interface IdentityPT {
  first_name: string;
  last_name: string;
  email: string;
  payment_status?: 'ACTIVE' | 'PAST_DUE';
}

export interface HealthDataPT {
  activityLevel: number;
  experienceLevel: number;
  medications: boolean;
  smokerFreq: string;
  recentCheckup: boolean;
  commStyle: string;
  currentDiet: string;
  eatsOutFreq: string;
  alcohol: string;
  mealsPerDay: string;
  workActivityLevel: string;
}

export interface Injury {
  id: string;
  zone: string;
  joint: string;
  painLevel: number; // 1-5
}

export interface OnboardingPTState {
  // Block 0: Services / Needs
  services: string[];
  toggleService: (srv: string) => void;

  // Block 1: Biometrics
  biometrics: BiometricsPT;
  setBiometrics: (data: Partial<BiometricsPT>) => void;

  // Block 2: Training & Equipment
  training: TrainingPT;
  setTraining: (data: Partial<TrainingPT>) => void;
  toggleEquipment: (eq: string) => void;
  goalTags: string[];
  toggleGoalTag: (tag: string) => void;

  // Block 3: Medical & Habits (El Cáliz del SNC)
  medicalTags: string[];
  toggleMedicalTag: (tag: string) => void;
  
  injuries: Injury[];
  addInjury: (injury: Injury) => void;
  updateInjury: (id: string, data: Partial<Injury>) => void;
  removeInjury: (id: string) => void;

  sleepQuality: number; // 1-5
  setSleepQuality: (val: number) => void;
  stressLevel: number; // 1-5
  setStressLevel: (val: number) => void;
  workType: 'SEDENTARY' | 'ACTIVE';
  setWorkType: (val: 'SEDENTARY' | 'ACTIVE') => void;
  
  healthData: HealthDataPT;
  setHealthData: (data: Partial<HealthDataPT>) => void;

  // Block 4: Identity
  identity: IdentityPT;
  setIdentity: (data: Partial<IdentityPT>) => void;

  // UI State
  currentBlockIndex: number;
  direction: number; // 1 for forward, -1 for backward
  setCurrentBlockIndex: (index: number) => void;
  nextBlock: () => void;
  prevBlock: () => void;

  // Labor Illusion Effect
  isCalculating: boolean;
  setIsCalculating: (isCalculating: boolean) => void;

  // Bypass / PLG
  loadDummyPatient: () => void;

  // Created Athlete Reference (populated after POST /api/v1/athletes)
  createdAthleteId: string | null;
  setCreatedAthleteId: (id: string | null) => void;

  // Soft-Lock State
  isSoftLocked: boolean;
  setIsSoftLocked: (val: boolean) => void;

  // Reset State
  resetOnboarding: () => void;

  // Behavioral Traits (Clinical Engine)
  activeTraits: Record<string, AthleteTrait>;
  traitEventsLog: TraitEvent[];
  injectTrait: (trait: Partial<AthleteTrait>) => void;
  processStaleTraits: () => void;
}

export const useOnboardingPTStore = create<OnboardingPTState>()(
  persist(
    (set) => ({
      activeTraits: {},
      traitEventsLog: [],

      injectTrait: (partialTrait) => {
        const fullTrait = {
          discoveredAt: new Date().toISOString(),
          isStale: false,
          ...partialTrait
        };
        const result = AthleteTraitSchema.safeParse(fullTrait);
        if (!result.success) {
          console.error("[Clinical Engine] Trait validation failed", result.error);
          return; 
        }
        const trait = result.data;
        set((state) => {
          const newEvent: TraitEvent = {
            action: 'ADDED',
            traitId: trait.traitId,
            timestamp: new Date().toISOString(),
          };
          return {
            activeTraits: {
              ...state.activeTraits,
              [trait.traitId]: trait
            },
            traitEventsLog: [...state.traitEventsLog, newEvent]
          };
        });
      },

      processStaleTraits: () => {
        set((state) => {
          const now = new Date();
          let hasChanges = false;
          const nextTraits = { ...state.activeTraits };
          const newEvents: TraitEvent[] = [];
          Object.values(nextTraits).forEach(trait => {
            if (!trait.isStale && trait.expiresAt) {
              const expirationDate = new Date(trait.expiresAt);
              if (now >= expirationDate) {
                nextTraits[trait.traitId] = { ...trait, isStale: true };
                newEvents.push({
                  action: 'STALED',
                  traitId: trait.traitId,
                  timestamp: now.toISOString(),
                });
                hasChanges = true;
              }
            }
          });
          if (!hasChanges) return state;
          return {
            activeTraits: nextTraits,
            traitEventsLog: [...state.traitEventsLog, ...newEvents]
          };
        });
      },

      createdAthleteId: null,
      setCreatedAthleteId: (id) => set({ createdAthleteId: id }),
      isSoftLocked: false,
      setIsSoftLocked: (val) => set({ isSoftLocked: val }),
  services: [],
  toggleService: (srv) =>
    set((state) => {
      const exists = state.services.includes(srv);
      return { services: exists ? state.services.filter(s => s !== srv) : [...state.services, srv] };
    }),

  biometrics: {
    weight: 75,
    height: 175,
    age: 30,
    gender: null,
  },
  setBiometrics: (data) => 
    set((state) => ({ 
      biometrics: { ...state.biometrics, ...data } 
    })),

  training: {
    experience_level: 'BEGINNER',
    days_per_week: 3,
    duration_pref: 60,
    equipment: ['COMMERCIAL_GYM'],
    coaching_preference: 'DATA_SCIENCE',
  },
  setTraining: (data) =>
    set((state) => {
      const updatedTraining = { ...state.training, ...data };
      let updatedHealth = state.healthData;
      if (data.experience_level !== undefined) {
        const mappedNum = data.experience_level === 'BEGINNER' ? 1 : data.experience_level === 'INTERMEDIATE' ? 3 : 4;
        updatedHealth = { ...state.healthData, experienceLevel: mappedNum };
      }
      return { training: updatedTraining, healthData: updatedHealth };
    }),
  toggleEquipment: (eq) =>
    set((state) => {
      const exists = state.training.equipment.includes(eq);
      const newEq = exists 
        ? state.training.equipment.filter(e => e !== eq)
        : [...state.training.equipment, eq];
      return { training: { ...state.training, equipment: newEq } };
    }),
  goalTags: [],
  toggleGoalTag: (tag) => 
    set((state) => {
      // Mutually exclusive selection: Selecting an archetype replaces the previous one
      const exists = state.goalTags.includes(tag);
      return { goalTags: exists ? [] : [tag] };
    }),

  medicalTags: [],
  toggleMedicalTag: (tag) =>
    set((state) => {
      const exists = state.medicalTags.includes(tag);
      return { medicalTags: exists ? state.medicalTags.filter(t => t !== tag) : [...state.medicalTags, tag] };
    }),

  injuries: [],
  addInjury: (injury) => set((state) => ({ injuries: [...state.injuries, injury] })),
  updateInjury: (id, data) => set((state) => ({
    injuries: state.injuries.map(i => i.id === id ? { ...i, ...data } : i)
  })),
  removeInjury: (id) => set((state) => ({
    injuries: state.injuries.filter(i => i.id !== id)
  })),

  sleepQuality: 3,
  setSleepQuality: (val) => set({ sleepQuality: val }),
  stressLevel: 3,
  setStressLevel: (val) => set({ stressLevel: val }),
  workType: 'SEDENTARY',
  setWorkType: (val) => set({ workType: val }),

  healthData: {
    activityLevel: 2,
    experienceLevel: 1,
    medications: false,
    smokerFreq: 'NO_FUMO',
    recentCheckup: true,
    commStyle: 'empathic',
    currentDiet: 'FLEXIBLE',
    eatsOutFreq: 'RARA_VEZ',
    alcohol: 'NADA',
    mealsPerDay: '3_4',
    workActivityLevel: 'SEDENTARY'
  },
  setHealthData: (data) => set((state) => {
    const updatedHealth = { ...state.healthData, ...data };
    let updatedTraining = state.training;
    if (data.experienceLevel !== undefined) {
      const mapped: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 
        data.experienceLevel <= 2 ? 'BEGINNER' : data.experienceLevel === 3 ? 'INTERMEDIATE' : 'ADVANCED';
      updatedTraining = { ...state.training, experience_level: mapped };
    }
    return { healthData: updatedHealth, training: updatedTraining };
  }),

  identity: { first_name: '', last_name: '', email: '' },
  setIdentity: (data) => set((state) => ({ identity: { ...state.identity, ...data } })),

  currentBlockIndex: 0,
  direction: 1,
  setCurrentBlockIndex: (index) => set((state) => ({ 
    currentBlockIndex: index,
    direction: index > state.currentBlockIndex ? 1 : -1
  })),
  nextBlock: () => set((state) => ({ 
    currentBlockIndex: Math.min(state.currentBlockIndex + 1, 11),
    direction: 1
  })),
  prevBlock: () => set((state) => ({ 
    currentBlockIndex: Math.max(state.currentBlockIndex - 1, 0),
    direction: -1
  })),

  isCalculating: false,
  setIsCalculating: (isCalculating) => set({ isCalculating }),

  loadDummyPatient: () => set({
    services: ['PT', 'GYM'],
    biometrics: { weight: 82, height: 178, age: 35, gender: 'male' },
    training: { experience_level: 'INTERMEDIATE', days_per_week: 4, duration_pref: 45, equipment: ['COMMERCIAL_GYM', 'HOME_GYM'], coaching_preference: 'STRICT_DISCIPLINE' },
    goalTags: ['HIPERTROFIA', 'STRENGTH'],
    medicalTags: ['LOWER_BACK_PAIN'],
    injuries: [{ id: '1', zone: 'Core / Columna', joint: 'Lumbar', painLevel: 3 }],
    sleepQuality: 2,
    stressLevel: 5,
    workType: 'SEDENTARY',
    identity: { first_name: 'Carlos', last_name: 'Ejecutivo', email: 'carlos.ejecutivo@example.com', payment_status: 'PAST_DUE' },
    currentBlockIndex: 3,
  }),

  resetOnboarding: () => set({
    services: [],
    biometrics: { weight: 75, height: 175, age: 30, gender: null },
    training: { experience_level: 'BEGINNER', days_per_week: 3, duration_pref: 60, equipment: ['COMMERCIAL_GYM'], coaching_preference: 'DATA_SCIENCE' },
    goalTags: [],
    medicalTags: [],
    injuries: [],
    sleepQuality: 3,
    stressLevel: 3,
    workType: 'SEDENTARY',
    healthData: { activityLevel: 2, experienceLevel: 1, medications: false, smokerFreq: 'NO_FUMO', recentCheckup: true, commStyle: 'empathic', currentDiet: 'FLEXIBLE', eatsOutFreq: 'RARA_VEZ', alcohol: 'NADA', mealsPerDay: '3_4', workActivityLevel: 'SEDENTARY' },
    identity: { first_name: '', last_name: '', email: '' },
    currentBlockIndex: 0,
    direction: 1,
    isCalculating: false,
    isSoftLocked: false,
    createdAthleteId: null,
    activeTraits: {},
    traitEventsLog: [],
  }),
    }),
    {
      name: 'onboarding-pt-storage',
    }
  )
);
