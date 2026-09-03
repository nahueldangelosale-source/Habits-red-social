/**
 * useIntelligentInbox — Custom Hook for SSE Coach Notifications
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMissedMessages } from '../api/athleteApi';

export interface InboxEvent {
    type: string;
    payload: any;
}

export function useIntelligentInbox() {
    const [events, setEvents] = useState<InboxEvent[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { token } = useAuth();

    const refreshInbox = useCallback(async () => {
        try {
            const data = await fetchMissedMessages();
            setUnreadCount(data.length);
        } catch (err: any) {
            console.error('[Inbox] Error fetching missed messages:', err);
        }
    }, []);

    useEffect(() => {
        refreshInbox();

        if (!token) return;

        const eventSource = new EventSource('/api/v1/inbox/stream', {
            withCredentials: false // Token could be in cookies or we need a specific SSE auth approach, but usually EventSource uses cookies or token query param
        });

        eventSource.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                
                // Add new event
                setEvents(prev => [parsed, ...prev]);
                
                if (parsed.type === 'NEW_MESSAGE' || parsed.type === 'RISK_ALERT') {
                    setUnreadCount(prev => prev + 1);
                }
            } catch (e) {
                console.error("Error parsing SSE data", e);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
            // Optional: Implement reconnect logic with exponential backoff here
        };

        return () => {
            eventSource.close();
        };
    }, [refreshInbox, token]);

    return {
        events,
        unreadCount,
        markAllRead: () => setUnreadCount(0),
        refresh: refreshInbox
    };
}
