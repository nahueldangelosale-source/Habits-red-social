import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { apiRequest, API_BASE_URL } from '../api/client';

// ═══════════════════════════════════════════════════════════════
// TIPOS CORE — Slice Vertical B2C MVP
// ═══════════════════════════════════════════════════════════════

// ─── XP & LEVELING SYSTEM ───────────────────────────────────────
export type XPSource = 'workout' | 'meal' | 'habit' | 'readiness';

export interface XPEvent {
  idempotencyKey: string;
  source: XPSource;
  amount: number;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'drift_failed';
}

// Exponential leveling: early levels fast, high levels require dedication
// 200 XP → Lvl 3  |  1000 XP → Lvl 6  |  5000 XP → Lvl 14  |  10000 XP → Lvl 19
export const calculateLevel = (xp: number): number => Math.floor(1.8 * Math.sqrt(xp)) + 1;

export const XP_FOR_LEVEL = (level: number): number => Math.ceil(((level - 1) / 1.8) ** 2);

export const LEVEL_TITLES: Record<string, string> = {
  NOVATO: 'Novato',       // 1-5
  GUERRERO: 'Guerrero',   // 6-10
  TITAN: 'Titán',         // 11-15
  LEYENDA: 'Leyenda',     // 16+
};

export const getLevelTitle = (level: number): string => {
  if (level <= 5) return LEVEL_TITLES.NOVATO;
  if (level <= 10) return LEVEL_TITLES.GUERRERO;
  if (level <= 15) return LEVEL_TITLES.TITAN;
  return LEVEL_TITLES.LEYENDA;
};

const XP_TABLE: Record<XPSource, number> = {
  workout: 50,
  meal: 20,
  habit: 10,
  readiness: 15,
};

export type ChallengeType = 'STREAK' | 'VOLUME' | 'CONSISTENCY';
export type ChallengeState = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PIVOTED';
export type ProgressSource = 'HABIT_CHECKIN' | 'WORKOUT_COMPLETE' | 'MANUAL';

export interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  targetValue: number;
  currentValue: number;
  state: ChallengeState;
  startDate: string;    // ISO
  endDate: string;      // ISO
  durationDays: number;
  assignedClients: string[];
  squadId: string | null;
  deployedAt: string | null;
  completedAt: string | null;
}

export interface ProgressEvent {
  id: string;
  challengeId: string;
  clientId: string;
  value: number;
  timestamp: string;
  source: ProgressSource;
}

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;       // Initials (e.g. "NH")
  completedToday: boolean;
  lastCheckinTime: string | null;
  isSimulated: boolean; // true = AI-driven stochastic behavior
  isMe: boolean;
}

export interface KudoEvent {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  timestamp: string;
  seen: boolean;
}

export interface FeedMessage {
  id: string;
  type: 'SYSTEM_CHECKIN' | 'KUDO' | 'MILESTONE';
  text: string;
  timestamp: string;
  memberAvatar: string;
  memberName: string;
  seen: boolean;
}

export interface Squad {
  id: string;
  name: string;
  members: SquadMember[];
  streakCollective: number;
  kudos: KudoEvent[];
  feedMessages: FeedMessage[];
}

// ═══════════════════════════════════════════════════════════════
// SIMULADOR DE ACTIVIDAD HUMANA (Opción A)
// Motor estocástico que emula check-ins de compañeros del Squad
// para validar la hipótesis de Presión Asíncrona de Pares
// sin infraestructura backend.
// ═══════════════════════════════════════════════════════════════

const SIMULATED_NAMES = [
  { name: 'Mateo R.', avatar: 'MR' },
  { name: 'Valentina S.', avatar: 'VS' },
  { name: 'Tomás L.', avatar: 'TL' },
];

/**
 * Calcula probabilísticamente si un miembro simulado ha completado
 * su check-in basado en la hora actual del día.
 * 
 * Curva de probabilidad:
 * - 06:00-09:00 → 20% (madrugadores)
 * - 09:00-12:00 → 45% (mañana activa)
 * - 12:00-17:00 → 70% (tarde productiva)
 * - 17:00-21:00 → 85% (post-trabajo, pico de gym)
 * - 21:00-23:59 → 95% (cierre del día)
 * 
 * Usa un seed determinístico basado en (memberId + fecha)
 * para que el mismo usuario vea resultados consistentes
 * durante el mismo día sin re-rolls al recargar.
 */
function simulateMemberCheckin(memberId: string, dateStr: string): { completed: boolean; checkinTime: string | null } {
  // Seed determinístico: hash simple del memberId + fecha
  let seed = 0;
  const seedStr = `${memberId}-${dateStr}`;
  for (let i = 0; i < seedStr.length; i++) {
    seed = ((seed << 5) - seed + seedStr.charCodeAt(i)) | 0;
  }
  // Normalizar seed a [0, 1)
  const pseudoRandom = Math.abs(seed % 10000) / 10000;

  const now = new Date();
  const hour = now.getHours();
  
  let probability: number;
  let checkinHourOffset: number;
  
  if (hour < 6) {
    probability = 0.05;
    checkinHourOffset = 0;
  } else if (hour < 9) {
    probability = 0.20;
    checkinHourOffset = 6 + pseudoRandom * 3;
  } else if (hour < 12) {
    probability = 0.45;
    checkinHourOffset = 7 + pseudoRandom * 4;
  } else if (hour < 17) {
    probability = 0.70;
    checkinHourOffset = 8 + pseudoRandom * 8;
  } else if (hour < 21) {
    probability = 0.85;
    checkinHourOffset = 9 + pseudoRandom * 10;
  } else {
    probability = 0.95;
    checkinHourOffset = 10 + pseudoRandom * 12;
  }

  const completed = pseudoRandom < probability;
  
  if (!completed) return { completed: false, checkinTime: null };
  
  // Generar hora de check-in realista
  const checkinDate = new Date(dateStr);
  checkinDate.setHours(Math.floor(checkinHourOffset), Math.floor((checkinHourOffset % 1) * 60));
  
  return {
    completed: true,
    checkinTime: checkinDate.toISOString()
  };
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT SQUAD (MVP — 1 usuario real + 3 simulados)
// ═══════════════════════════════════════════════════════════════

function createDefaultSquad(): Squad {
  return {
    id: 'squad-alpha-001',
    name: 'Los Espartanos',
    members: [
      {
        id: 'me',
        name: 'Tú',
        avatar: 'YO',
        completedToday: false,
        lastCheckinTime: null,
        isSimulated: false,
        isMe: true,
      },
      ...SIMULATED_NAMES.map((s, i) => ({
        id: `sim-${i + 1}`,
        name: s.name,
        avatar: s.avatar,
        completedToday: false,
        lastCheckinTime: null,
        isSimulated: true,
        isMe: false,
      })),
    ],
    streakCollective: 3,
    kudos: [],
    feedMessages: [],
  };
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CHALLENGE (MVP — "Racha Perfecta 7 Días")
// ═══════════════════════════════════════════════════════════════

function createDefaultChallenge(): Challenge {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  
  return {
    id: 'challenge-mvp-001',
    title: 'Racha Perfecta 7 Días',
    type: 'STREAK',
    targetValue: 7,
    currentValue: 0,
    state: 'ACTIVE',
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    durationDays: 7,
    assignedClients: ['me'],
    squadId: 'squad-alpha-001',
    deployedAt: start.toISOString(),
    completedAt: null,
  };
}

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

interface GamificationState {
  // Data
  challenges: Challenge[];
  progressEvents: ProgressEvent[];
  squad: Squad;
  
  // ─── XP & LEVELING ──────────────────────────────────────
  totalXP: number;
  level: number;
  xpOutbox: XPEvent[];
  xpMultiplier: number;  // Shadow Degradation: 1.5x after sync failure
  hasSyncAnomaly: boolean; // "Anomalía Temporal" flag
  
  // Telemetría HVI
  hviCheckins: { timestamp: string; withinWindow: boolean }[];
  lastNotificationTimestamp: string | null;
}

interface GamificationActions {
  // Coach Actions
  deployChallenge: (challenge: Omit<Challenge, 'id' | 'state' | 'currentValue' | 'deployedAt' | 'completedAt'>) => void;
  
  // Athlete Actions
  recordProgress: (event?: Partial<Omit<ProgressEvent, 'id'>>) => void;
  markMyCheckinToday: () => void;
  sendKudo: (toMemberId: string) => void;
  markFeedSeen: (messageId: string) => void;
  
  // ─── XP ACTIONS ──────────────────────────────────────────
  awardXP: (source: XPSource, amount: number) => void;
  syncOutbox: () => Promise<void>;
  clearSyncAnomaly: () => void;
  
  // Squad Simulation
  tickSimulation: () => void;
  
  // Queries
  getActiveChallenge: () => Challenge | null;
  getSquadCompletionToday: () => number;
  getSquadSegments: () => { memberId: string; avatar: string; completed: boolean; isMe: boolean }[];
  getUnseenFeedCount: () => number;
  getHVI: () => number;
  getXPProgress: () => { currentXP: number; xpForCurrentLevel: number; xpForNextLevel: number; progressPercent: number };
  getLeaderboard: () => { id: string; name: string; avatar: string; weeklyXP: number; isMe: boolean }[];
  
  // HVI Telemetry
  recordNotificationSent: () => void;
  recordHVICheckin: (withinWindow: boolean) => void;
  
  // Lifecycle
  resetGamification: () => void;
  initXPListener: () => () => void;
}

const INITIAL_STATE: GamificationState = {
  challenges: [createDefaultChallenge()],
  progressEvents: [],
  squad: createDefaultSquad(),
  totalXP: 0,
  level: 1,
  xpOutbox: [],
  xpMultiplier: 1,
  hasSyncAnomaly: false,
  hviCheckins: [],
  lastNotificationTimestamp: null,
};

export const useGamificationStore = create<GamificationState & GamificationActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...INITIAL_STATE,

        // ─── COACH: Deploy Challenge ───────────────────────────
        deployChallenge: (challengeInput) => {
          set((state) => {
            const newChallenge: Challenge = {
              ...challengeInput,
              id: `challenge-${uuidv4().slice(0, 8)}`,
              state: 'ACTIVE',
              currentValue: 0,
              deployedAt: new Date().toISOString(),
              completedAt: null,
            };
            state.challenges.push(newChallenge);
          });
        },

        // ─── ATHLETE: Record Progress ─────────────────────────
        recordProgress: (eventInput) => {
          set((state) => {
            const val = typeof eventInput?.value === 'number' ? eventInput.value : 1;
            const event: ProgressEvent = {
              challengeId: eventInput?.challengeId || state.challenges.find(c => c.state === 'ACTIVE')?.id || 'default-challenge',
              clientId: eventInput?.clientId || 'me',
              value: val,
              timestamp: eventInput?.timestamp || new Date().toISOString(),
              source: eventInput?.source || 'HABIT_CHECKIN',
              id: `pe-${uuidv4().slice(0, 8)}`,
            };
            state.progressEvents.push(event);

            // Update active challenge
            const activeChallenge = state.challenges.find(c => c.state === 'ACTIVE');
            if (activeChallenge) {
              activeChallenge.currentValue = (activeChallenge.currentValue || 0) + val;
              
              // Check completion
              if (activeChallenge.currentValue >= activeChallenge.targetValue) {
                activeChallenge.state = 'COMPLETED';
                activeChallenge.completedAt = new Date().toISOString();
                
                // Feed message: milestone
                state.squad.feedMessages.unshift({
                  id: `fm-${uuidv4().slice(0, 8)}`,
                  type: 'MILESTONE',
                  text: `🏆 ¡Reto "${activeChallenge.title}" completado! El Squad lo logró.`,
                  timestamp: new Date().toISOString(),
                  memberAvatar: '🏆',
                  memberName: 'Sistema',
                  seen: false,
                });
              }
            }
          });
        },

        // ─── ATHLETE: Mark my check-in today ──────────────────
        markMyCheckinToday: () => {
          set((state) => {
            const me = state.squad.members.find(m => m.isMe);
            if (me && !me.completedToday) {
              me.completedToday = true;
              me.lastCheckinTime = new Date().toISOString();
              
              // Squad streak logic
              const allCompleted = state.squad.members.every(m => m.completedToday);
              if (allCompleted) {
                state.squad.streakCollective += 1;
              }
              
              // Auto system message to feed
              state.squad.feedMessages.unshift({
                id: `fm-${uuidv4().slice(0, 8)}`,
                type: 'SYSTEM_CHECKIN',
                text: `¡Completaste tu check-in! 🔥 Tu Squad brilla al ${Math.round(get().getSquadCompletionToday())}%`,
                timestamp: new Date().toISOString(),
                memberAvatar: me.avatar,
                memberName: me.name,
                seen: false,
              });
            }
          });
        },

        // ─── ATHLETE: Send Kudo ───────────────────────────────
        sendKudo: (toMemberId: string) => {
          set((state) => {
            const me = state.squad.members.find(m => m.isMe);
            const target = state.squad.members.find(m => m.id === toMemberId);
            if (!me || !target) return;

            const kudo: KudoEvent = {
              id: `kudo-${uuidv4().slice(0, 8)}`,
              fromId: me.id,
              fromName: me.name,
              toId: toMemberId,
              timestamp: new Date().toISOString(),
              seen: false,
            };
            state.squad.kudos.push(kudo);

            // Feed message
            state.squad.feedMessages.unshift({
              id: `fm-${uuidv4().slice(0, 8)}`,
              type: 'KUDO',
              text: `${me.name} envió un 🤜 Kudo a ${target.name}`,
              timestamp: new Date().toISOString(),
              memberAvatar: me.avatar,
              memberName: me.name,
              seen: false,
            });
          });
        },

        // ─── Mark feed seen ───────────────────────────────────
        markFeedSeen: (messageId: string) => {
          set((state) => {
            const msg = state.squad.feedMessages.find(m => m.id === messageId);
            if (msg) msg.seen = true;
          });
        },

        // ─── SQUAD SIMULATION ENGINE ──────────────────────────
        // Opción A: Motor estocástico de actividad humana.
        // Se ejecuta al abrir la app / cada vez que el componente
        // del Squad se monta. Calcula determinísticamente si los
        // compañeros simulados han "completado" su hábito hoy.
        tickSimulation: () => {
          set((state) => {
            const today = getToday();
            
            state.squad.members.forEach(member => {
              if (!member.isSimulated) return;
              
              const sim = simulateMemberCheckin(member.id, today);
              const wasCompleted = member.completedToday;
              member.completedToday = sim.completed;
              member.lastCheckinTime = sim.checkinTime;
              
              // Generate feed message if member "just checked in"
              // (only if they weren't marked as completed before this tick)
              if (sim.completed && !wasCompleted) {
                const completion = state.squad.members.filter(m => m.completedToday).length;
                const total = state.squad.members.length;
                const pct = Math.round((completion / total) * 100);
                
                state.squad.feedMessages.unshift({
                  id: `fm-sim-${member.id}-${today}`,
                  type: 'SYSTEM_CHECKIN',
                  text: `¡${member.name} completó su check-in! 🔥 Tu Squad brilla al ${pct}%`,
                  timestamp: sim.checkinTime || new Date().toISOString(),
                  memberAvatar: member.avatar,
                  memberName: member.name,
                  seen: false,
                });
              }
            });
            
            // Deduplicate feed messages by id
            const seen = new Set<string>();
            state.squad.feedMessages = state.squad.feedMessages.filter(msg => {
              if (seen.has(msg.id)) return false;
              seen.add(msg.id);
              return true;
            });
          });
        },

        // ─── XP SYSTEM ────────────────────────────────────────
        awardXP: (source, amount) => {
          const multiplier = get().xpMultiplier;
          const finalAmount = Math.round(amount * multiplier);
          
          const event: XPEvent = {
            idempotencyKey: uuidv4(),
            source,
            amount: finalAmount,
            timestamp: Date.now(),
            syncStatus: 'pending',
          };

          // Optimistic UI: mutate state immediately
          set((state) => {
            state.totalXP += finalAmount;
            state.level = calculateLevel(state.totalXP);
            state.xpOutbox.push(event);
            // Clear multiplier after use (Shadow Degradation recovery)
            if (state.xpMultiplier > 1) {
              state.xpMultiplier = 1;
              state.hasSyncAnomaly = false;
            }
          });

          // Batch sync via requestIdleCallback
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => get().syncOutbox());
          }
        },

        syncOutbox: async () => {
          const { xpOutbox } = get();
          const pending = xpOutbox.filter(e => e.syncStatus === 'pending');
          if (pending.length === 0) return;

          try {
            const data = await apiRequest<{ synced_events_count: number; current_balance: number }>(
              `${API_BASE_URL}/api/v1/gamification/sync-xp-outbox`,
              {
                method: 'POST',
                body: JSON.stringify({ events: pending }),
              }
            );

            set((state) => {
              state.xpOutbox = state.xpOutbox.filter(e => e.syncStatus !== 'pending');
              if (data && typeof data.current_balance === 'number' && data.current_balance > state.totalXP) {
                state.totalXP = data.current_balance;
                state.level = calculateLevel(state.totalXP);
              }
            });
          } catch (err) {
            // Shadow Degradation / Offline resilience: don't rollback, compensate on next award
            console.warn('[XP Sync] Server unreachable, preserved in outbox:', err);
            set((state) => {
              state.xpMultiplier = 1.5;
              state.hasSyncAnomaly = true;
            });
          }
        },

        clearSyncAnomaly: () => {
          set((state) => {
            state.hasSyncAnomaly = false;
            state.xpMultiplier = 1;
          });
        },

        // ─── QUERIES ──────────────────────────────────────────
        getActiveChallenge: () => {
          return get().challenges.find(c => c.state === 'ACTIVE') || null;
        },

        getSquadCompletionToday: () => {
          const members = get().squad.members;
          if (members.length === 0) return 0;
          const completed = members.filter(m => m.completedToday).length;
          return (completed / members.length) * 100;
        },

        getSquadSegments: () => {
          return get().squad.members.map(m => ({
            memberId: m.id,
            avatar: m.avatar,
            completed: m.completedToday,
            isMe: m.isMe,
          }));
        },

        getUnseenFeedCount: () => {
          return get().squad.feedMessages.filter(m => !m.seen).length;
        },

        getXPProgress: () => {
          const { totalXP, level } = get();
          const xpForCurrentLevel = XP_FOR_LEVEL(level);
          const xpForNextLevel = XP_FOR_LEVEL(level + 1);
          const range = xpForNextLevel - xpForCurrentLevel;
          const progress = totalXP - xpForCurrentLevel;
          return {
            currentXP: totalXP,
            xpForCurrentLevel,
            xpForNextLevel,
            progressPercent: range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 100,
          };
        },

        getLeaderboard: () => {
          const { squad, totalXP } = get();
          // Generate simulated weekly XP for squad members
          const today = getToday();
          return squad.members.map(m => {
            if (m.isMe) {
              return { id: m.id, name: m.name, avatar: m.avatar, weeklyXP: totalXP, isMe: true };
            }
            // Deterministic simulated XP based on member seed
            let seed = 0;
            const seedStr = `${m.id}-${today}-xp`;
            for (let i = 0; i < seedStr.length; i++) {
              seed = ((seed << 5) - seed + seedStr.charCodeAt(i)) | 0;
            }
            const simXP = Math.abs(seed % 400) + 50; // 50-450 range
            return { id: m.id, name: m.name, avatar: m.avatar, weeklyXP: simXP, isMe: false };
          }).sort((a, b) => b.weeklyXP - a.weeklyXP);
        },

        // ─── HVI TELEMETRY ────────────────────────────────────
        getHVI: () => {
          const checkins = get().hviCheckins;
          if (checkins.length === 0) return 0;
          const within = checkins.filter(c => c.withinWindow).length;
          return Math.round((within / checkins.length) * 100);
        },

        recordNotificationSent: () => {
          set((state) => {
            state.lastNotificationTimestamp = new Date().toISOString();
          });
        },

        recordHVICheckin: (withinWindow: boolean) => {
          set((state) => {
            state.hviCheckins.push({
              timestamp: new Date().toISOString(),
              withinWindow,
            });
          });
        },

        // ─── XP EVENT LISTENER (Decoupled via CustomEvent) ───
        initXPListener: () => {
          const handler = (e: Event) => {
            const { source, amount } = (e as CustomEvent).detail;
            if (source && amount) {
              get().awardXP(source, amount);
            }
          };
          window.addEventListener('xp:award', handler);
          return () => window.removeEventListener('xp:award', handler);
        },

        // ─── LIFECYCLE ────────────────────────────────────────
        resetGamification: () => {
          set(() => ({
            ...INITIAL_STATE,
            squad: createDefaultSquad(),
            challenges: [createDefaultChallenge()],
            totalXP: 0,
            level: 1,
            xpOutbox: [],
            xpMultiplier: 1,
            hasSyncAnomaly: false,
          }));
        },
      })),
      {
        name: 'bienestar-gamification-v2',
        version: 2,
      }
    ),
    { name: 'GamificationStore' }
  )
);
