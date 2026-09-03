import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface ProfessionalCoach {
  id: string;
  name: string;
  avatarUrl: string;
  title: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  studentsCount: number;
  priceMonthlyUSD: number;
  priceMonthlyARS: number;
  bio: string;
  isOnline: boolean;
  responseTime: string;
}

export type BusinessPlanTier = 'FREE_TRIAL' | 'HABITS_PRO' | 'HABITS_COACH_PRO';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'coach' | 'me';
  time: string;
  mediaType?: 'text' | 'video_check' | 'routine_update';
  mediaUrl?: string;
}

interface CoachState {
  hasAssignedCoach: boolean;
  assignedCoach: ProfessionalCoach | null;
  activePlanTier: BusinessPlanTier;
  trialDaysRemaining: number;
  messages: ChatMessage[];
  availableCoaches: ProfessionalCoach[];
  
  // Actions
  assignCoach: (coach: ProfessionalCoach, tier?: BusinessPlanTier) => void;
  unlinkCoach: () => void;
  linkCoachByCode: (code: string) => { success: boolean; message: string };
  sendMessage: (text: string, mediaType?: 'text' | 'video_check') => void;
  upgradePlan: (tier: BusinessPlanTier) => void;
}

const DEFAULT_COACHES: ProfessionalCoach[] = [
  {
    id: 'coach_leandro_usea',
    name: 'Leandro Usea',
    avatarUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    title: 'Head Coach & Biomecánica',
    specialty: 'Hipertrofia, Fuerza & Readaptación',
    rating: 4.9,
    reviewCount: 142,
    studentsCount: 48,
    priceMonthlyUSD: 49,
    priceMonthlyARS: 49000,
    bio: 'Especialista en periodización por ciclos y prescripción personalizada de sobrecarga.',
    isOnline: true,
    responseTime: 'Menos de 2 horas'
  },
  {
    id: 'coach_sofia_martinez',
    name: 'Dra. Sofía Martínez',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    title: 'Nutricionista Deportiva & Coach',
    specialty: 'Recomposición Corporal & Salud Hormonal',
    rating: 5.0,
    reviewCount: 98,
    studentsCount: 35,
    priceMonthlyUSD: 55,
    priceMonthlyARS: 55000,
    bio: 'Planes nutricionales adaptativos con equivalencia isocalórica y flexibilidad.',
    isOnline: true,
    responseTime: 'Menos de 1 hora'
  },
  {
    id: 'coach_martin_palermo',
    name: 'Martín Palermo',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    title: 'Entrenador CrossFit L3 & Endurance',
    specialty: 'CrossFit, WODs & Rendimiento Atlético',
    rating: 4.8,
    reviewCount: 86,
    studentsCount: 42,
    priceMonthlyUSD: 45,
    priceMonthlyARS: 45000,
    bio: 'Preparación atlética integral, pacing para WODs y prevención de sobrecargas axiales.',
    isOnline: false,
    responseTime: 'Menos de 4 horas'
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    text: '¡Hola Nahuel! Bienvenido a tu plan personalizado. Ya cargué tu rutina de Fuerza Día 1 con prescripción por ciclos.',
    sender: 'coach',
    time: '10:30'
  },
  {
    id: '2',
    text: '¡Genial Coach! La probé hoy y me sentí muy bien en las primeras series de Sentadilla.',
    sender: 'me',
    time: '11:15'
  },
  {
    id: '3',
    text: 'Impecable. Vi tu check-in al 100%. Mándame un video de tu última serie pesada para chequear la profundidad.',
    sender: 'coach',
    time: '11:20'
  }
];

export const useCoachStore = create<CoachState>()(
  devtools(
    persist(
      (set, get) => ({
        hasAssignedCoach: true, // Default active coach for seamless demo
        assignedCoach: DEFAULT_COACHES[0],
        activePlanTier: 'HABITS_COACH_PRO',
        trialDaysRemaining: 14,
        messages: INITIAL_MESSAGES,
        availableCoaches: DEFAULT_COACHES,

        assignCoach: (coach: ProfessionalCoach, tier: BusinessPlanTier = 'HABITS_COACH_PRO') => {
          set({
            hasAssignedCoach: true,
            assignedCoach: coach,
            activePlanTier: tier,
            messages: [
              {
                id: Date.now().toString(),
                text: `¡Hola! Soy ${coach.name}, tu coach asignado. Cuéntame sobre tus metas principales para ajustar tu plan.`,
                sender: 'coach',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          });
        },

        unlinkCoach: () => {
          set({
            hasAssignedCoach: false,
            assignedCoach: null,
            activePlanTier: 'HABITS_PRO'
          });
        },

        linkCoachByCode: (code: string) => {
          const cleanCode = code.trim().toUpperCase();
          if (cleanCode === 'LEANDRO' || cleanCode === 'COACH10' || cleanCode === 'BIENESTAR' || cleanCode === 'USEA') {
            const coach = DEFAULT_COACHES[0];
            get().assignCoach(coach, 'HABITS_COACH_PRO');
            return {
              success: true,
              message: `¡Vinculado con éxito con ${coach.name}!`
            };
          }
          if (cleanCode === 'SOFIA' || cleanCode === 'NUTRI') {
            const coach = DEFAULT_COACHES[1];
            get().assignCoach(coach, 'HABITS_COACH_PRO');
            return {
              success: true,
              message: `¡Vinculado con éxito con ${coach.name}!`
            };
          }
          return {
            success: false,
            message: 'Código de entrenador no válido. Prueba con "LEANDRO" o "SOFIA".'
          };
        },

        sendMessage: (text: string, mediaType: 'text' | 'video_check' = 'text') => {
          const newMsg: ChatMessage = {
            id: Date.now().toString(),
            text,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mediaType
          };

          set((state) => ({
            messages: [...state.messages, newMsg]
          }));

          // Mock Coach Auto-Reply after 1.5s
          setTimeout(() => {
            const coachName = get().assignedCoach?.name || 'Tu Coach';
            const replyText = mediaType === 'video_check'
              ? `🎥 ${coachName}: Recibí tu video. La alineación de rodillas se ve muy sólida. ¡Mantén esa profundidad en la serie final!`
              : `💬 ${coachName}: Recibido. Lo tengo en cuenta para ajustar las cargas de tu próxima sesión.`;

            const replyMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              text: replyText,
              sender: 'coach',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            set((state) => ({
              messages: [...state.messages, replyMsg]
            }));
          }, 1800);
        },

        upgradePlan: (tier: BusinessPlanTier) => {
          set({ activePlanTier: tier });
        }
      }),
      {
        name: 'bienestar-coach-store'
      }
    )
  )
);
