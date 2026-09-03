import { useState, useEffect, useCallback } from 'react';

export type SquadNotification = {
    id: string;
    sender_id: string;
    activity_type: 'PR' | 'WORKOUT_COMPLETED' | 'SQUAD_JOIN' | 'LEVEL_UP';
    sender_name: string;
    message: string;
    created_at: string;
    avatar?: string;
};

const MOCK_DB: SquadNotification[] = [
    {
        id: 'ev-1',
        sender_id: 'u-1',
        activity_type: 'PR',
        sender_name: 'Marcos Ruiz',
        message: 'rompió su PR en Deadlift (145kg) 🔥',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop'
    },
    {
        id: 'ev-2',
        sender_id: 'u-2',
        activity_type: 'WORKOUT_COMPLETED',
        sender_name: 'Sofia Viale',
        message: 'completó "Murph" en 42:15 🥵',
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    },
    {
        id: 'ev-3',
        sender_id: 'u-3',
        activity_type: 'LEVEL_UP',
        sender_name: 'Lucas Mendez',
        message: 'alcanzó el Nivel 21 (Elite) 👑',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    }
];

export const useSquadFeed = (squadId: string) => {
    const [feedEvents, setFeedEvents] = useState<SquadNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setIsLoading(true);
        // Simulate network latency
        const timer = setTimeout(() => {
            setFeedEvents(MOCK_DB);
            setIsLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [squadId]);

    const fetchNextPage = useCallback(() => {
        if (isLoading) return;
        setIsLoading(true);
        
        setTimeout(() => {
            const moreEvents: SquadNotification[] = [
                {
                    id: `ev-old-${page}`,
                    sender_id: 'u-4',
                    activity_type: 'SQUAD_JOIN',
                    sender_name: 'Nuevo Miembro',
                    message: 'se unió al Squad de Alto Rendimiento',
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * page).toISOString()
                }
            ];
            setFeedEvents(prev => [...prev, ...moreEvents]);
            setPage(p => p + 1);
            setIsLoading(false);
        }, 800);
    }, [isLoading, page]);

    const addOptimisticEvent = useCallback((event: Omit<SquadNotification, 'id' | 'created_at'>) => {
        const newEvent: SquadNotification = {
            ...event,
            id: `ev-opt-${Date.now()}`,
            created_at: new Date().toISOString()
        };
        setFeedEvents(prev => [newEvent, ...prev]);
    }, []);

    return {
        feedEvents,
        isLoading,
        fetchNextPage,
        hasNextPage: page < 3,
        addOptimisticEvent
    };
};
