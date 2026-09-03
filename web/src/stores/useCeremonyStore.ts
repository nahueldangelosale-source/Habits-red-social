import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CeremonyState {
    hasSeenShatteringGlass: boolean;
    markShatteringGlassSeen: () => void;
    resetCeremonies: () => void;
    
    // Phase 65.2: Protocol Rebase Conflicts (Global State)
    pendingConflicts: string[]; // List of client_ids with MERGE_CONFLICT_DETECTED
    addConflict: (client_id: string) => void;
    removeConflict: (client_id: string) => void;
    setConflicts: (client_ids: string[]) => void;
}

export const useCeremonyStore = create<CeremonyState>()(
    persist(
        (set) => ({
            hasSeenShatteringGlass: false,
            markShatteringGlassSeen: () => set({ hasSeenShatteringGlass: true }),
            resetCeremonies: () => set({ hasSeenShatteringGlass: false, pendingConflicts: [] }),
            
            pendingConflicts: [],
            addConflict: (client_id) => set((state) => ({
                pendingConflicts: state.pendingConflicts.includes(client_id) 
                    ? state.pendingConflicts 
                    : [...state.pendingConflicts, client_id]
            })),
            removeConflict: (client_id) => set((state) => ({
                pendingConflicts: state.pendingConflicts.filter(id => id !== client_id)
            })),
            setConflicts: (client_ids) => set({ pendingConflicts: client_ids })
        }),
        {
            name: 'bienestar-ceremony-storage',
            // Only store specific fields if needed, default stores all state
            partialize: (state) => ({ 
                hasSeenShatteringGlass: state.hasSeenShatteringGlass,
                // Do not persist pendingConflicts to localStorage, we rely on Sync-on-Wakeup API instead
                // to avoid stale UI if conflicts were resolved elsewhere or expired.
            }),
        }
    )
);
