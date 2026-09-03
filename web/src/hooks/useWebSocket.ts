import { useEffect, useRef, useState, useCallback } from 'react';
import { useCeremonyStore } from '../stores/useCeremonyStore';

interface WebSocketMessage {
    sender: string;
    content: string;
    timestamp: string;
    type?: 'text' | 'typing' | 'status';
}

interface UseWebSocketReturn {
    isConnected: boolean;
    messages: WebSocketMessage[];
    sendMessage: (content: string) => void;
    connect: (clientId: string) => void;
    disconnect: () => void;
}

export const useWebSocket = (endpoint: string = 'ws://localhost:8010/ws'): UseWebSocketReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const setConflicts = useCeremonyStore((state) => state.setConflicts);

    const connect = useCallback((clientId: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        // Construct full URL with clientId
        const url = `${endpoint}/${clientId}`;
        console.log(`Connecting to WebSocket: ${url}`);

        const socket = new WebSocket(url);

        socket.onopen = async () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
            reconnectAttemptsRef.current = 0; // Reset backoff
            
            // Clear any reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            // Sync-on-Wakeup: Fetch pending conflicts to guarantee state matches DB
            try {
                // Determine token from localStorage or context if needed, assuming it's managed via fetch interceptors
                // We'll use a direct fetch or axios call.
                const token = localStorage.getItem('token'); 
                const res = await fetch('/api/v1/clinical/conflicts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.conflicts) {
                        setConflicts(data.conflicts.map((c: any) => c.client_id));
                    }
                }
            } catch (err) {
                console.error('Failed to Sync-on-Wakeup conflicts', err);
            }
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Handle Push Events
                if (data.event === 'MERGE_CONFLICT_DETECTED' && data.client_id) {
                    useCeremonyStore.getState().addConflict(data.client_id);
                }

                if (typeof data === 'object') {
                    setMessages((prev) => [...prev, data]);
                } else {
                    // Handle raw text if simple echo
                    setMessages((prev) => [...prev, {
                        sender: 'server',
                        content: event.data,
                        timestamp: new Date().toISOString()
                    }]);
                }
            } catch (e) {
                console.warn('Failed to parse WebSocket message:', event.data);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
            socketRef.current = null;

            // Exponential backoff
            const delay = Math.min(1000 * (2 ** reconnectAttemptsRef.current), 30000);
            reconnectAttemptsRef.current += 1;

            reconnectTimeoutRef.current = setTimeout(() => {
                console.log(`Attempting to reconnect... (Attempt ${reconnectAttemptsRef.current})`);
                connect(clientId);
            }, delay);
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            socket.close();
        };

        socketRef.current = socket;
    }, [endpoint]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (socketRef.current) {
            socketRef.current.close();
        }
    }, []);

    const sendMessage = useCallback((content: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(content);
            // Optimistic UI update (optional, but good for UX)
            // setMessages((prev) => [...prev, { sender: 'me', content, timestamp: new Date().toISOString() }]);
        } else {
            console.warn('Cannot send message: WebSocket is not open');
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return { isConnected, messages, sendMessage, connect, disconnect };
};
