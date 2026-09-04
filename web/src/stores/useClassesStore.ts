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

const INITIAL_CLASSES: ClassGroupDetail[] = [];

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
      name: 'bienestar-classes-v2'
    }
  )
);

// Purgar storage anterior con mock data de 4 clases
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('bienestar-classes-storage');
  } catch {}
}
