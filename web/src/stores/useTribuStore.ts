import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useGamificationStore } from './useGamificationStore';

// ═══════════════════════════════════════════════════════════════
// TIPOS CORE — TRIBU, RETOS DE SQUAD & MOTOR VIRAL DE INVITACIÓN
// ═══════════════════════════════════════════════════════════════

export type ChallengeType = 'HABIT_SYNC' | 'COLLECTIVE_VOLUME' | 'STREAK_PACT';
export type MemberRiskLevel = 'NONE' | 'LOW' | 'HIGH';

export interface SquadItem {
  id: string;
  name: string;
  avatarEmoji: string;
  level: number;
  xp: number;
  multiplier: number;
  memberCount: number;
  category: string;
}

export interface TribuMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'Líder' | 'Veterano' | 'Compañero' | 'Recluta';
  streakDays: number;
  dailyCompletionRate: number; // 0 a 100%
  weeklyVolumeKg: number;
  isCurrentUser?: boolean;
  isGuest?: boolean;
  joinedAt: string;
}

export interface ChallengeParticipant {
  memberId: string;
  name: string;
  avatarUrl: string;
  contribution: number; // ej. 5 días cumplidos o 2,500 kg aportados
  hasCheckedInToday: boolean;
  riskLevel: MemberRiskLevel;
}

export interface SquadChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  category: string;
  icon: string;
  targetValue: number;
  currentValue: number;
  unit: string; // 'días', 'kg', 'litros', 'sesiones'
  durationDays: number;
  startDate: string; // ISO
  endDate: string; // ISO
  rewardXP: number;
  rewardBadge: string;
  participants: ChallengeParticipant[];
  hasUserCheckedInToday: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export interface VictoryFeedCard {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  actionTitle: string;
  actionDescription: string;
  timestamp: string;
  kudosCount: number;
  hasGivenKudos: boolean;
  type: 'CHALLENGE_CHECKIN' | 'VIRAL_JOIN' | 'HABIT_PERFECT' | 'WORKOUT_PR' | 'NUTRITION_STREAK';
  badgeEmoji?: string;
  rewardXP?: number;
  metric?: string;
  reactions?: {
    fire: number;
    muscle: number;
    rocket: number;
    clap: number;
  };
  userReactions?: string[];
}

export interface TribuState {
  // ─── ESTADO PERSISTENTE (IMMUTABLE BUSINESS CORE) ──────────────
  squadId: string;
  squadName: string;
  squadAvatarUrl: string;
  squadLevel: number;
  squadXP: number;
  squadMultiplier: number;
  inviteCode: string;
  members: TribuMember[];
  challenges: SquadChallenge[];
  feed: VictoryFeedCard[];
  mySquads: SquadItem[];
  activeSquadId: string;
  setActiveSquad: (squadId: string) => void;
  createAndSwitchSquad: (newSquad: Omit<SquadItem, 'id'>) => string;
  claimedIdempotencyKeys: Record<string, boolean>; // Prevención de doble gasto de XP

  // ─── ESTADO TRANSITORIO (NUNCA SE PERSISTE - DEFENSE AGAINST STATE BLOAT)
  isInviting: boolean;
  activeWizardStep: number;
  isCheckingIn: boolean;
  transientError: string | null;

  // ─── ACCIONES DEL STORE ───────────────────────────────────────
  createChallenge: (challengeData: Omit<SquadChallenge, 'id' | 'createdAt' | 'currentValue' | 'hasUserCheckedInToday' | 'isCompleted' | 'participants'>) => string;
  checkInChallenge: (challengeId: string, idempotencyKey?: string) => { success: boolean; xpEarned: number };
  joinSquadFromInvite: (inviteCode: string, guestName: string, avatarUrl?: string, idempotencyKey?: string) => { success: boolean; xpBonus: number; error?: string };
  claimViralRewardSafely: (idempotencyKey: string, athleteName: string) => { success: boolean; xpAwarded: number };
  giveKudos: (cardId: string) => void;
  resetTransientState: () => void;
  getChallengeById: (id: string) => SquadChallenge | undefined;
}

// ═══════════════════════════════════════════════════════════════
// DATOS INICIALES SEED REALISTAS
// ═══════════════════════════════════════════════════════════════

const INITIAL_MEMBERS: TribuMember[] = [
  {
    id: 'm_current',
    name: 'Nahuel (Tú)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Líder',
    streakDays: 14,
    dailyCompletionRate: 100,
    weeklyVolumeKg: 8400,
    isCurrentUser: true,
    joinedAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'm2',
    name: 'Laura Gómez',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Veterano',
    streakDays: 12,
    dailyCompletionRate: 100,
    weeklyVolumeKg: 6200,
    joinedAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'm3',
    name: 'Diego Ruiz',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Compañero',
    streakDays: 3,
    dailyCompletionRate: 60,
    weeklyVolumeKg: 4100,
    joinedAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'm4',
    name: 'Valentina Rossi',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Recluta',
    streakDays: 1,
    dailyCompletionRate: 40,
    weeklyVolumeKg: 2800,
    isGuest: true,
    joinedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const INITIAL_CHALLENGES: SquadChallenge[] = [
  {
    id: 'chal_7d_habits',
    title: '7 Días Sin Fallos',
    description: 'Cada miembro del escuadrón debe completar el 100% de sus hábitos diarios durante toda la semana.',
    type: 'HABIT_SYNC',
    category: 'HABITOS',
    icon: '🔥',
    targetValue: 28, // 4 miembros x 7 días
    currentValue: 19,
    unit: 'Check-ins',
    durationDays: 7,
    startDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    rewardXP: 150,
    rewardBadge: 'Titán Invencible 🛡️',
    hasUserCheckedInToday: false,
    isCompleted: false,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    participants: [
      { memberId: 'm_current', name: 'Nahuel (Tú)', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', contribution: 4, hasCheckedInToday: false, riskLevel: 'NONE' },
      { memberId: 'm2', name: 'Laura Gómez', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', contribution: 4, hasCheckedInToday: true, riskLevel: 'NONE' },
      { memberId: 'm3', name: 'Diego Ruiz', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', contribution: 2, hasCheckedInToday: false, riskLevel: 'HIGH' },
      { memberId: 'm4', name: 'Valentina Rossi', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', contribution: 1, hasCheckedInToday: false, riskLevel: 'LOW' }
    ]
  },
  {
    id: 'chal_raid_volumen',
    title: 'Raid de Fuerza: 30,000 kg',
    description: 'Tonelaje acumulativo de fuerza. Sumamos el peso levantado en cada serie de todos los integrantes.',
    type: 'COLLECTIVE_VOLUME',
    category: 'ENTRENO',
    icon: '🏋️',
    targetValue: 30000,
    currentValue: 21500,
    unit: 'kg',
    durationDays: 7,
    startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    rewardXP: 200,
    rewardBadge: 'Levantadores Colosales ⚡',
    hasUserCheckedInToday: true,
    isCompleted: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    participants: [
      { memberId: 'm_current', name: 'Nahuel (Tú)', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', contribution: 8400, hasCheckedInToday: true, riskLevel: 'NONE' },
      { memberId: 'm2', name: 'Laura Gómez', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', contribution: 6200, hasCheckedInToday: true, riskLevel: 'NONE' },
      { memberId: 'm3', name: 'Diego Ruiz', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', contribution: 4100, hasCheckedInToday: false, riskLevel: 'LOW' },
      { memberId: 'm4', name: 'Valentina Rossi', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', contribution: 2800, hasCheckedInToday: true, riskLevel: 'NONE' }
    ]
  }
];

const INITIAL_FEED: VictoryFeedCard[] = [
  {
    id: 'f1',
    memberId: 'm_current',
    memberName: 'Nahuel (Tú)',
    memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    actionTitle: 'Completó Rutina de Fuerza & PR',
    actionDescription: '12.450 kg levantados en Sentadilla & Press',
    timestamp: 'Hace 5 min',
    kudosCount: 8,
    hasGivenKudos: false,
    type: 'WORKOUT_PR',
    badgeEmoji: '🏋️',
    rewardXP: 50,
    metric: '12.450 kg acumulados',
    reactions: { fire: 14, muscle: 8, rocket: 5, clap: 11 },
    userReactions: ['fire']
  },
  {
    id: 'f2',
    memberId: 'm2',
    memberName: 'Laura Gómez',
    memberAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    actionTitle: 'Racha Perfecta de 12 Días',
    actionDescription: 'Cumplió todos sus hábitos diarios sin fallar',
    timestamp: 'Hace 18 min',
    kudosCount: 12,
    hasGivenKudos: true,
    type: 'HABIT_PERFECT',
    badgeEmoji: '🔥',
    rewardXP: 35,
    metric: '12 días invicta',
    reactions: { fire: 19, muscle: 6, rocket: 9, clap: 15 },
    userReactions: ['fire', 'clap']
  },
  {
    id: 'f3',
    memberId: 'm3',
    memberName: 'Diego Ruiz',
    memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    actionTitle: 'Meta Nutricional al 100%',
    actionDescription: 'Balance exacto de proteínas y calorías del día',
    timestamp: 'Hace 1 hora',
    kudosCount: 5,
    hasGivenKudos: false,
    type: 'NUTRITION_STREAK',
    badgeEmoji: '🥗',
    rewardXP: 25,
    metric: '100% Adherencia',
    reactions: { fire: 7, muscle: 4, rocket: 2, clap: 8 },
    userReactions: []
  },
  {
    id: 'f4',
    memberId: 'm4',
    memberName: 'Valentina Rossi',
    memberAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    actionTitle: 'Aporte al Reto de Tribu',
    actionDescription: 'Sumó 2.800 kg al Raid de Fuerza Colectivo',
    timestamp: 'Hace 2 horas',
    kudosCount: 9,
    hasGivenKudos: true,
    type: 'CHALLENGE_CHECKIN',
    badgeEmoji: '🎯',
    rewardXP: 40,
    metric: '+2.800 kg al Squad',
    reactions: { fire: 11, muscle: 10, rocket: 7, clap: 6 },
    userReactions: ['muscle']
  }
];

// ═══════════════════════════════════════════════════════════════
// IMPLEMENTACIÓN DEL STORE CON BLINDAJE ANTI-STATE-BLOAT
// ═══════════════════════════════════════════════════════════════

const DEFAULT_SQUADS: SquadItem[] = [
  {
    id: 'squad-1',
    name: 'La Banda',
    avatarEmoji: '🦁',
    level: 1,
    xp: 100,
    multiplier: 1.2,
    memberCount: 5,
    category: 'Tribu Cooperativa'
  },
  {
    id: 'squad-2',
    name: 'CrossFit 8am',
    avatarEmoji: '🏋️',
    level: 3,
    xp: 2400,
    multiplier: 1.5,
    memberCount: 12,
    category: 'Clase / Box'
  },
  {
    id: 'squad-3',
    name: 'Running Club',
    avatarEmoji: '🏃',
    level: 2,
    xp: 1100,
    multiplier: 1.3,
    memberCount: 8,
    category: 'Running'
  }
];

export const useTribuStore = create<TribuState>()(
  devtools(
    persist(
      (set, get) => ({
        squadId: 'sq_alfa_01',
        squadName: 'Escuadrón Alfa',
        squadAvatarUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80',
        squadLevel: 4,
        squadXP: 3850,
        squadMultiplier: 1.5,
        inviteCode: 'squad-alfa-7x',
        members: INITIAL_MEMBERS,
        challenges: INITIAL_CHALLENGES,
        feed: INITIAL_FEED,
      mySquads: DEFAULT_SQUADS,
      activeSquadId: 'squad-1',

      setActiveSquad: (squadId: string) => {
        const found = get().mySquads.find(s => s.id === squadId);
        if (found) {
          set({
            activeSquadId: squadId,
            squadName: found.name,
            squadLevel: found.level,
            squadXP: found.xp,
            squadMultiplier: found.multiplier
          });
        }
      },

      createAndSwitchSquad: (newSquadData) => {
        const newId = `squad-${Date.now()}`;
        const newSquad: SquadItem = {
          id: newId,
          ...newSquadData
        };
        const updated = [...get().mySquads, newSquad];
        set({
          mySquads: updated,
          activeSquadId: newId,
          squadName: newSquad.name,
          squadLevel: newSquad.level,
          squadXP: newSquad.xp,
          squadMultiplier: newSquad.multiplier
        });
        return newId;
      },
        claimedIdempotencyKeys: {},

        // Transient state defaults
        isInviting: false,
        activeWizardStep: 1,
        isCheckingIn: false,
        transientError: null,

        // ─── ACCIONES ─────────────────────────────────────────────

        createChallenge: (challengeData) => {
          const newId = `chal_${uuidv4().slice(0, 8)}`;
          const currentMembers = get().members;
          
          const initialParticipants: ChallengeParticipant[] = currentMembers.map(m => ({
            memberId: m.id,
            name: m.name,
            avatarUrl: m.avatarUrl,
            contribution: 0,
            hasCheckedInToday: false,
            riskLevel: 'NONE'
          }));

          const newChallenge: SquadChallenge = {
            ...challengeData,
            id: newId,
            currentValue: 0,
            hasUserCheckedInToday: false,
            isCompleted: false,
            participants: initialParticipants,
            createdAt: new Date().toISOString()
          };

          const newFeedCard: VictoryFeedCard = {
            id: `f_${uuidv4().slice(0, 8)}`,
            memberId: 'm_current',
            memberName: 'Nahuel (Tú)',
            memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            actionTitle: `Nuevo Reto de Tribu: ${newChallenge.title}`,
            actionDescription: newChallenge.description,
            timestamp: 'Justo ahora',
            kudosCount: 1,
            hasGivenKudos: false,
            type: 'CHALLENGE_CHECKIN'
          };

          set((state) => ({
            challenges: [newChallenge, ...state.challenges],
            feed: [newFeedCard, ...state.feed],
            squadXP: state.squadXP + 25 // Bono de XP por iniciar reto
          }));

          return newId;
        },

        checkInChallenge: (challengeId, customIdempotencyKey) => {
          const key = customIdempotencyKey || `checkin_${challengeId}_${new Date().toISOString().split('T')[0]}`;
          
          // Barrera de Idempotencia contra Doble Gasto
          if (get().claimedIdempotencyKeys[key]) {
            console.warn('[Idempotencia] Check-in ya registrado hoy para esta clave:', key);
            return { success: false, xpEarned: 0 };
          }

          const targetChallenge = get().challenges.find(c => c.id === challengeId);
          if (!targetChallenge) {
            return { success: false, xpEarned: 0 };
          }

          const xpAwarded = 35;

          set((state) => {
            const updatedChallenges = state.challenges.map(chal => {
              if (chal.id === challengeId) {
                const addValue = chal.type === 'COLLECTIVE_VOLUME' ? 650 : 1;
                const newCurrentVal = chal.currentValue + addValue;
                const isNowCompleted = newCurrentVal >= chal.targetValue;

                const updatedParticipants = chal.participants.map(p => {
                  if (p.memberId === 'm_current') {
                    return {
                      ...p,
                      contribution: p.contribution + addValue,
                      hasCheckedInToday: true,
                      riskLevel: 'NONE' as MemberRiskLevel
                    };
                  }
                  return p;
                });

                return {
                  ...chal,
                  currentValue: newCurrentVal,
                  hasUserCheckedInToday: true,
                  isCompleted: isNowCompleted,
                  participants: updatedParticipants
                };
              }
              return chal;
            });

            const newFeedCard: VictoryFeedCard = {
              id: `f_${uuidv4().slice(0, 8)}`,
              memberId: 'm_current',
              memberName: 'Nahuel (Tú)',
              memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              actionTitle: `Check-in en "${targetChallenge.title}"`,
              actionDescription: `Sumó aporte diario al objetivo del squad. +${xpAwarded} XP 🚀`,
              timestamp: 'Justo ahora',
              kudosCount: 1,
              hasGivenKudos: false,
              type: 'CHALLENGE_CHECKIN'
            };

            return {
              challenges: updatedChallenges,
              feed: [newFeedCard, ...state.feed],
              squadXP: state.squadXP + xpAwarded,
              claimedIdempotencyKeys: {
                ...state.claimedIdempotencyKeys,
                [key]: true
              }
            };
          });

          // Otorgar XP individual en el motor de gamificación
          try {
            useGamificationStore.getState().awardXP('habit', xpAwarded);
          } catch (e) {
            console.error('Error synchronizing XP to gamification store:', e);
          }

          return { success: true, xpEarned: xpAwarded };
        },

        joinSquadFromInvite: (inviteCode, guestName, avatarUrl, customIdempotencyKey) => {
          const key = customIdempotencyKey || `join_${inviteCode}_${guestName.toLowerCase().replace(/\s+/g, '_')}`;

          if (get().claimedIdempotencyKeys[key]) {
            return { success: false, xpBonus: 0, error: 'Esta invitación ya fue procesada.' };
          }

          const newMemberId = `m_guest_${uuidv4().slice(0, 6)}`;
          const assignedAvatar = avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

          const newMember: TribuMember = {
            id: newMemberId,
            name: guestName,
            avatarUrl: assignedAvatar,
            role: 'Recluta',
            streakDays: 1,
            dailyCompletionRate: 100,
            weeklyVolumeKg: 1200,
            isGuest: true,
            joinedAt: new Date().toISOString()
          };

          const welcomeXP = 50;

          set((state) => {
            // Incorporar al nuevo miembro a los retos activos
            const updatedChallenges = state.challenges.map(chal => ({
              ...chal,
              participants: [
                ...chal.participants,
                {
                  memberId: newMemberId,
                  name: guestName,
                  avatarUrl: assignedAvatar,
                  contribution: 1,
                  hasCheckedInToday: true,
                  riskLevel: 'NONE' as MemberRiskLevel
                }
              ]
            }));

            const welcomeCard: VictoryFeedCard = {
              id: `f_${uuidv4().slice(0, 8)}`,
              memberId: newMemberId,
              memberName: guestName,
              memberAvatar: assignedAvatar,
              actionTitle: '¡Nuevo Atleta se sumó al Squad!',
              actionDescription: `Entró con el código ${inviteCode} y desbloqueó el bono de +50 XP. 🎉`,
              timestamp: 'Justo ahora',
              kudosCount: 5,
              hasGivenKudos: true,
              type: 'VIRAL_JOIN'
            };

            return {
              members: [...state.members, newMember],
              challenges: updatedChallenges,
              feed: [welcomeCard, ...state.feed],
              squadXP: state.squadXP + welcomeXP,
              claimedIdempotencyKeys: {
                ...state.claimedIdempotencyKeys,
                [key]: true
              }
            };
          });

          return { success: true, xpBonus: welcomeXP };
        },

        claimViralRewardSafely: (idempotencyKey, athleteName) => {
          if (get().claimedIdempotencyKeys[idempotencyKey]) {
            return { success: false, xpAwarded: 0 };
          }

          const xpAwarded = 50;

          set((state) => ({
            squadXP: state.squadXP + xpAwarded,
            claimedIdempotencyKeys: {
              ...state.claimedIdempotencyKeys,
              [idempotencyKey]: true
            }
          }));

          try {
            useGamificationStore.getState().awardXP('habit', xpAwarded);
          } catch (e) {
            console.error('Error adding XP to gamification store:', e);
          }

          return { success: true, xpAwarded };
        },

        giveKudos: (cardId: string) => {
          set((state) => ({
            feed: state.feed.map(card => {
              if (card.id === cardId) {
                const nextState = !card.hasGivenKudos;
                return {
                  ...card,
                  hasGivenKudos: nextState,
                  kudosCount: nextState ? card.kudosCount + 1 : Math.max(0, card.kudosCount - 1)
                };
              }
              return card;
            })
          }));
        },

        resetTransientState: () => {
          set({
            isInviting: false,
            activeWizardStep: 1,
            isCheckingIn: false,
            transientError: null
          });
        },

        getChallengeById: (id: string) => {
          return get().challenges.find(c => c.id === id);
        }
      }),
      {
        name: 'habits-tribu-offline-store',
        // ─── DEFENSA MATEMÁTICA CONTRA STATE BLOAT (PARTIALIZE ESTRICTO) ───
        // Excluimos explícitamente estados de wizard, modales y flags transitorios
        partialize: (state) =>
          Object.fromEntries(
            Object.entries(state).filter(
              ([key]) => !['isInviting', 'activeWizardStep', 'isCheckingIn', 'transientError'].includes(key)
            )
          ) as TribuState,
      }
    ),
    { name: 'useTribuStore' }
  )
);
