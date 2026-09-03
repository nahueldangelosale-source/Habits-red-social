import { useState, useCallback } from 'react';

export interface TribuMember {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
}

export interface VictoryCard {
    id: string;
    memberId: string;
    actionTitle: string;
    actionDescription: string;
    timestamp: string;
    kudosCount: number;
    hasGivenKudos: boolean; // Estado local por sesión
}

// Datos Mockeados
const MOCK_MEMBERS: Record<string, TribuMember> = {
    'm1': { id: 'm1', name: 'Laura Gómez', avatarUrl: 'https://i.pravatar.cc/150?u=laura', role: 'Compañera' },
    'm2': { id: 'm2', name: 'Diego Ruiz', avatarUrl: 'https://i.pravatar.cc/150?u=diego', role: 'Compañero' },
    'm3': { id: 'm3', name: 'Tú', avatarUrl: 'https://i.pravatar.cc/150?u=you', role: 'Tú' },
};

const INITIAL_FEED: VictoryCard[] = [
    {
        id: 'c1',
        memberId: 'm1',
        actionTitle: 'Completó Día de Nutrición',
        actionDescription: '100% de adherencia. Racha actual: 4 días 🔥',
        timestamp: 'Hace 10 min',
        kudosCount: 2,
        hasGivenKudos: false
    },
    {
        id: 'c2',
        memberId: 'm2',
        actionTitle: 'Finalizó Entrenamiento',
        actionDescription: 'Fuerza tren superior. RPE: 8/10 ⚡',
        timestamp: 'Hace 2 horas',
        kudosCount: 5,
        hasGivenKudos: false
    }
];

export const useTribuData = () => {
    const [feed, setFeed] = useState<VictoryCard[]>(INITIAL_FEED);
    const squadName = "Escuadrón Alfa";
    const members = Object.values(MOCK_MEMBERS);

    // Lógica Optimista y Prevención de Inflación TAA (Idempotencia)
    const giveKudos = useCallback((cardId: string) => {
        setFeed(prevFeed => prevFeed.map(card => {
            if (card.id === cardId) {
                // Si es la primera vez que da Kudos en esta sesión
                if (!card.hasGivenKudos) {
                    // TODO: Analytics.track('Kudos_Given', { cardId, time: Date.now() })
                    // Aquí es donde se dispara el evento real de telemetría para medir el TAA.
                    console.log(`[Telemetría] Kudos disparado para carta ${cardId}. TAA protegido.`);
                    
                    return {
                        ...card,
                        kudosCount: card.kudosCount + 1,
                        hasGivenKudos: true
                    };
                } else {
                    // Si ya había dado Kudos y toca de nuevo, simplemente revertimos la UI localmente
                    // SIN disparar el evento de telemetría (previene falsos positivos en el dashboard de AURA).
                    console.log(`[Telemetría] Kudos revertido para carta ${cardId}. No se envía evento.`);
                    return {
                        ...card,
                        kudosCount: card.kudosCount - 1,
                        hasGivenKudos: false
                    };
                }
            }
            return card;
        }));
    }, []);

    const getMemberById = (id: string) => MOCK_MEMBERS[id];

    return {
        squadName,
        members,
        feed,
        giveKudos,
        getMemberById
    };
};
