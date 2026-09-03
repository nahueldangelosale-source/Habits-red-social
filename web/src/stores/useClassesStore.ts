import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClassMember {
  id: string;
  name: string;
  avatarUrl: string;
  streakDays: number;
  status: 'ACTIVE' | 'MISSED' | 'PENDING';
  lastActivity: string;
}

export interface ClassGroupDetail {
  id: string;
  name: string;
  discipline: string;
  icon: string;
  schedule: string;
  count: string;
  activeChallengeTitle?: string;
  members: ClassMember[];
  createdAt?: string;
}

const INITIAL_CLASSES: ClassGroupDetail[] = [
  {
    id: 'class_funcional',
    name: 'Clase Funcional & WOD',
    discipline: 'Funcional & CrossFit',
    icon: '⚡',
    schedule: 'Lunes, Mié y Vie • 19:00 hs',
    count: '14 atletas',
    activeChallengeTitle: 'Guerra de WODs: 30 Entrenamientos',
    createdAt: '2026-08-01T10:00:00.000Z',
    members: [
      { id: 'm1', name: 'Laura Gómez', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', streakDays: 12, status: 'ACTIVE', lastActivity: 'Hoy 19:45 hs' },
      { id: 'm2', name: 'Diego Ruiz', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', streakDays: 8, status: 'ACTIVE', lastActivity: 'Hoy 19:30 hs' },
      { id: 'm3', name: 'Nahuel Dangelo', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', streakDays: 14, status: 'ACTIVE', lastActivity: 'Hoy 20:00 hs' },
      { id: 'm4', name: 'Valentina Rossi', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', streakDays: 5, status: 'ACTIVE', lastActivity: 'Ayer' }
    ]
  },
  {
    id: 'class_running',
    name: 'Running Club (Sábados)',
    discipline: 'Running & Cardio',
    icon: '🏃',
    schedule: 'Sábados • 08:30 hs (Outdoor)',
    count: '18 atletas',
    activeChallengeTitle: 'Desafío Ruta de la Tribu: 100 KM',
    createdAt: '2026-08-05T10:00:00.000Z',
    members: [
      { id: 'm5', name: 'Martín Palermo', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', streakDays: 15, status: 'ACTIVE', lastActivity: 'Sábado' },
      { id: 'm6', name: 'Sofía Martínez', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', streakDays: 9, status: 'ACTIVE', lastActivity: 'Ayer' }
    ]
  },
  {
    id: 'class_hipertrofia',
    name: 'Grupo Hipertrofia & Fuerza',
    discipline: 'Fuerza & Musculación',
    icon: '🏋️',
    schedule: 'Lunes a Viernes • 18:00 hs',
    count: '12 atletas',
    activeChallengeTitle: 'Raid de Fuerza: 50,000 kg',
    createdAt: '2026-08-10T10:00:00.000Z',
    members: [
      { id: 'm7', name: 'Gonzalo Quesada', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', streakDays: 6, status: 'ACTIVE', lastActivity: 'Hoy 18:30 hs' },
      { id: 'm8', name: 'Federico Mancuello', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', streakDays: 11, status: 'ACTIVE', lastActivity: 'Hoy 18:15 hs' }
    ]
  },
  {
    id: 'class_yoga',
    name: 'Yoga & Movilidad Matutina',
    discipline: 'Yoga & Movilidad',
    icon: '🧘',
    schedule: 'Martes y Jueves • 07:30 hs',
    count: '9 atletas',
    activeChallengeTitle: '7 Días Sin Fallos (Constancia 100%)',
    createdAt: '2026-08-12T10:00:00.000Z',
    members: [
      { id: 'm9', name: 'Camila Sosa', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', streakDays: 14, status: 'ACTIVE', lastActivity: 'Hoy 08:15 hs' }
    ]
  }
];

interface ClassesState {
  classes: ClassGroupDetail[];
  addClass: (newClass: Omit<ClassGroupDetail, 'id' | 'members'> & { members?: ClassMember[] }) => ClassGroupDetail;
  updateClass: (id: string, updates: Partial<ClassGroupDetail>) => void;
  deleteClass: (id: string) => void;
  assignChallengeToClass: (classId: string, challengeTitle: string) => void;
}

export const useClassesStore = create<ClassesState>()(
  persist(
    (set, get) => ({
      classes: INITIAL_CLASSES,

      addClass: (newClassData) => {
        const id = `class_${Date.now()}`;
        const defaultMembers: ClassMember[] = newClassData.members || [
          {
            id: `m_${Date.now()}`,
            name: 'Nahuel (Coach)',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            streakDays: 1,
            status: 'ACTIVE',
            lastActivity: 'Recién asignado'
          }
        ];

        const created: ClassGroupDetail = {
          ...newClassData,
          id,
          members: defaultMembers,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          classes: [created, ...state.classes]
        }));

        return created;
      },

      updateClass: (id, updates) => {
        set((state) => ({
          classes: state.classes.map((cls) => (cls.id === id ? { ...cls, ...updates } : cls))
        }));
      },

      deleteClass: (id) => {
        set((state) => ({
          classes: state.classes.filter((cls) => cls.id !== id)
        }));
      },

      assignChallengeToClass: (classId, challengeTitle) => {
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === classId || classId === 'all_gym'
              ? { ...cls, activeChallengeTitle: challengeTitle }
              : cls
          )
        }));
      }
    }),
    {
      name: 'bienestar-classes-storage'
    }
  )
);
