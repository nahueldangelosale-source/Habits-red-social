import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface RosterClient {
    id: string;
    name: string;
    riskLevel: 'GREEN' | 'ORANGE' | 'RED';
    acwr: number;
    adherence: number;
    lastCheckin: string;
    tags: string[];
}

interface RosterState {
    clients: RosterClient[];
}

interface RosterActions {
    updateRiskLevel: (clientId: string, riskLevel: 'GREEN' | 'ORANGE' | 'RED') => void;
}

const MOCK_ROSTER: RosterClient[] = [
    { id: 'c-1', name: 'Gonzalo Quesada', riskLevel: 'RED', acwr: 1.4, adherence: 65, lastCheckin: '2023-10-24T10:00:00Z', tags: ['Lesión Lumbar'] },
    { id: 'c-2', name: 'Martina Silva', riskLevel: 'ORANGE', acwr: 1.2, adherence: 80, lastCheckin: '2023-10-25T08:30:00Z', tags: ['Principiante'] },
    { id: 'c-3', name: 'Federico Mancuello', riskLevel: 'GREEN', acwr: 1.0, adherence: 95, lastCheckin: '2023-10-26T12:00:00Z', tags: ['Atleta Avanzado'] }
];

export const useRosterStore = create<RosterState & RosterActions>()(
    devtools(
        immer((set) => ({
            clients: MOCK_ROSTER,
            
            updateRiskLevel: (clientId, riskLevel) => {
                set((state) => {
                    const client = state.clients.find(c => c.id === clientId);
                    if (client) {
                        client.riskLevel = riskLevel;
                    }
                });
            }
        })),
        { name: 'RosterStore' }
    )
);
