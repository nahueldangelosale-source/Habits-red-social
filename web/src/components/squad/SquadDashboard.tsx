import React, { useState } from 'react';
import { useSquadFeed, SquadNotification } from '../../hooks/useSquadFeed';
import { useAuth } from '../../context/AuthContext';
import { Virtuoso } from 'react-virtuoso';

interface SquadDashboardProps {
    squadId: string;
    squadName: string;
}

const getEmojiForActivity = (type: string) => {
    switch (type) {
        case 'workout_completed': return '💪';
        case 'meal_logged': return '🥗';
        case 'streak_milestone': return '🔥';
        case 'goal_achieved': return '🏆';
        default: return '✅';
    }
};

export const SquadDashboard: React.FC<SquadDashboardProps> = ({ squadId, squadName }) => {
    const { user } = useAuth();
    const { 
        feedEvents, 
        isLoading, 
        fetchNextPage, 
        hasNextPage, 
        addOptimisticEvent 
    } = useSquadFeed(squadId);

    const [isPosting, setIsPosting] = useState(false);

    // Simulated local post for Optimistic UI testing
    const handleQuickCheer = () => {
        if (!user) return;
        setIsPosting(true);
        
        // 1. Optimistic Update immediately
        addOptimisticEvent(
            'goal_achieved',
            '¡Vamos equipo! 💪',
            user.first_name || 'Tú',
            user.id
        );

        // 2. Network Request (Mocked logic, assumes an endpoint exists)
        fetch(`/api/v1/squads/${squadId}/activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify({
                member_id: user.id,
                activity_type: 'goal_achieved',
                description: '¡Vamos equipo! 💪'
            })
        }).finally(() => {
            setIsPosting(false);
        });
    };

    if (isLoading && feedEvents.length === 0) {
        return <div className="p-4 text-center text-gray-500 animate-pulse">Cargando Activity Feed...</div>;
    }

    // Render individual item
    const Row = (index: number, notification: SquadNotification) => {
        const isMe = notification.sender_id === user?.id;
        return (
            <div className={`p-4 mb-3 rounded-lg shadow-sm flex items-start gap-4 transition-all ${
                isMe ? 'bg-indigo-50 border border-indigo-100' : 'bg-white border border-gray-100'
            }`}>
                <div className="text-3xl shrink-0">
                    {getEmojiForActivity(notification.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                        {isMe ? 'Tú' : notification.sender_name}
                    </p>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString([], {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{squadName}</h2>
                    <p className="text-sm text-gray-500">Live Activity Feed</p>
                </div>
                <button 
                    onClick={handleQuickCheer}
                    disabled={isPosting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                    {isPosting ? 'Enviando...' : 'Animar 📣'}
                </button>
            </div>

            {/* Virtualized Infinite Scroll Feed */}
            <div className="flex-1 p-4 overflow-hidden relative">
                {feedEvents.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 italic">
                        Sin actividad reciente. ¡Sé el primero en entrenar!
                    </div>
                ) : (
                    <Virtuoso
                        style={{ height: '100%', width: '100%' }}
                        data={feedEvents}
                        endReached={() => {
                            if (hasNextPage) {
                                fetchNextPage();
                            }
                        }}
                        itemContent={Row}
                        components={{
                            Footer: () => (
                                hasNextPage ? (
                                    <div className="p-4 text-center text-sm text-gray-400">
                                        Cargando historial...
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-400 italic">
                                        Fin del historial del Squad
                                    </div>
                                )
                            )
                        }}
                    />
                )}
            </div>
        </div>
    );
};
