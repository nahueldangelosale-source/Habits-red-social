/**
 * CONTEXTUAL INBOX - Async Feedback Management
 * Story 3.2: "The Command Center"
 * 
 * Features:
 * - Unified inbox organized by context
 * - Exercise-specific message grouping
 * - Quick voice/text reply
 * - Priority sorting
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Inbox,
    MessageCircle,
    Mic,
    Send,
    Clock,
    AlertCircle,
    Play,
    Dumbbell,
    Apple,
    Search
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Types
interface Message {
    id: string;
    clientName: string;
    clientAvatar: string;
    context: 'exercise' | 'nutrition' | 'general' | 'urgent';
    exerciseName?: string;
    content: string;
    timestamp: Date;
    hasMedia: boolean;
    isRead: boolean;
    priority: 'high' | 'medium' | 'low';
}

interface ContextGroup {
    context: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    messages: Message[];
}

// Mock messages
const mockMessages: Message[] = [
    {
        id: '1',
        clientName: 'María González',
        clientAvatar: 'MG',
        context: 'exercise',
        exerciseName: 'Sentadilla Búlgara',
        content: '¿Puedes revisar mi técnica? Siento un poco de molestia en la rodilla trasera.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        hasMedia: true,
        isRead: false,
        priority: 'high'
    },
    {
        id: '2',
        clientName: 'Carlos López',
        clientAvatar: 'CL',
        context: 'exercise',
        exerciseName: 'Press Banca',
        content: 'Logré 90kg x 5! 🎉 ¿Qué piensas del próximo objetivo?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        hasMedia: true,
        isRead: false,
        priority: 'medium'
    },
    {
        id: '3',
        clientName: 'Ana Martínez',
        clientAvatar: 'AM',
        context: 'nutrition',
        content: 'Me cuesta llegar a las proteínas del día. ¿Algún snack que me recomiendes?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        hasMedia: false,
        isRead: true,
        priority: 'medium'
    },
    {
        id: '4',
        clientName: 'Diego Morales',
        clientAvatar: 'DM',
        context: 'urgent',
        content: 'Tuve un tirón en el isquiotibial ayer. ¿Debo parar el entrenamiento?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        hasMedia: false,
        isRead: false,
        priority: 'high'
    },
    {
        id: '5',
        clientName: 'María González',
        clientAvatar: 'MG',
        context: 'exercise',
        exerciseName: 'Hip Thrust',
        content: '¿Cuánto peso debería agregar esta semana?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        hasMedia: false,
        isRead: true,
        priority: 'low'
    },
    {
        id: '6',
        clientName: 'Carlos López',
        clientAvatar: 'CL',
        context: 'general',
        content: '¿A qué hora agenado la sesión de fotos para el antes/después?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        hasMedia: false,
        isRead: true,
        priority: 'low'
    },
];

// Context configuration
const contextConfig = {
    urgent: { icon: AlertCircle, color: '#EF4444', label: 'Urgente' },
    exercise: { icon: Dumbbell, color: '#8B5CF6', label: 'Ejercicios' },
    nutrition: { icon: Apple, color: '#10B981', label: 'Nutrición' },
    general: { icon: MessageCircle, color: '#3B82F6', label: 'General' },
};

export function ContextualInbox() {
    const { mode } = useTheme();
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [replyText, setReplyText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const accentColor = mode === 'CLINICAL' ? '#88B04B' : '#6366f1';
    const cardBg = mode === 'CLINICAL' ? 'var(--surface)' : 'var(--surface)';

    // Group messages by context
    const groupedMessages = (): ContextGroup[] => {
        const filtered = messages.filter(m =>
            activeFilter === 'all' || m.context === activeFilter
        ).filter(m =>
            searchQuery === '' ||
            m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const groups: Record<string, Message[]> = {};
        filtered.forEach(m => {
            const key = m.context;
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });

        return Object.entries(groups)
            .map(([context, msgs]) => ({
                context,
                icon: contextConfig[context as keyof typeof contextConfig].icon,
                color: contextConfig[context as keyof typeof contextConfig].color,
                messages: msgs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            }))
            .sort((a, b) => {
                // Urgent first
                if (a.context === 'urgent') return -1;
                if (b.context === 'urgent') return 1;
                return 0;
            });
    };

    const markAsRead = (id: string) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    };

    const formatTime = (date: Date) => {
        const diff = Date.now() - date.getTime();
        if (diff < 1000 * 60 * 60) return `${Math.floor(diff / 1000 / 60)}m`;
        if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / 1000 / 60 / 60)}h`;
        return `${Math.floor(diff / 1000 / 60 / 60 / 24)}d`;
    };

    const unreadCount = messages.filter(m => !m.isRead).length;

    return (
        <div className="contextual-inbox">
            <div className="inbox-header">
                <div className="inbox-title">
                    <Inbox size={24} style={{ color: accentColor }} />
                    <h2>Contextual Inbox</h2>
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </div>
                <p className="inbox-subtitle">
                    Client messages organized by context for faster, more relevant responses.
                </p>
            </div>

            <div className="inbox-layout">
                {/* Left: Message List */}
                <div className="messages-panel" style={{ background: cardBg }}>
                    {/* Search and filters */}
                    <div className="inbox-controls">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('all')}
                                style={{ borderColor: activeFilter === 'all' ? accentColor : 'transparent' }}
                            >
                                All
                            </button>
                            {Object.entries(contextConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    className={`filter-tab ${activeFilter === key ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(key)}
                                    style={{
                                        borderColor: activeFilter === key ? config.color : 'transparent',
                                        color: activeFilter === key ? config.color : 'var(--text-muted)'
                                    }}
                                >
                                    <config.icon size={14} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grouped messages */}
                    <div className="message-groups">
                        {groupedMessages().map(group => (
                            <div key={group.context} className="message-group">
                                <div className="group-header" style={{ color: group.color }}>
                                    <group.icon size={16} />
                                    <span>{contextConfig[group.context as keyof typeof contextConfig].label}</span>
                                    <span className="group-count">{group.messages.length}</span>
                                </div>

                                {group.messages.map(message => (
                                    <motion.div
                                        key={message.id}
                                        className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''} ${!message.isRead ? 'unread' : ''}`}
                                        onClick={() => {
                                            setSelectedMessage(message);
                                            markAsRead(message.id);
                                        }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="message-avatar" style={{ background: `${group.color}20`, color: group.color }}>
                                            {message.clientAvatar}
                                        </div>
                                        <div className="message-content">
                                            <div className="message-header">
                                                <span className="client-name">{message.clientName}</span>
                                                <span className="message-time">{formatTime(message.timestamp)}</span>
                                            </div>
                                            {message.exerciseName && (
                                                <span className="exercise-tag" style={{ color: group.color }}>
                                                    {message.exerciseName}
                                                </span>
                                            )}
                                            <p className="message-preview">{message.content}</p>
                                        </div>
                                        {message.hasMedia && <Play size={14} className="media-indicator" />}
                                        {!message.isRead && <div className="unread-dot" style={{ background: group.color }} />}
                                    </motion.div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Message Detail & Reply */}
                <div className="detail-panel" style={{ background: cardBg }}>
                    <AnimatePresence mode="wait">
                        {selectedMessage ? (
                            <motion.div
                                key={selectedMessage.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="message-detail"
                            >
                                {/* Client header */}
                                <div className="detail-header">
                                    <div className="client-info">
                                        <div
                                            className="client-avatar-lg"
                                            style={{
                                                background: `${contextConfig[selectedMessage.context as keyof typeof contextConfig].color}20`,
                                                color: contextConfig[selectedMessage.context as keyof typeof contextConfig].color
                                            }}
                                        >
                                            {selectedMessage.clientAvatar}
                                        </div>
                                        <div>
                                            <h3>{selectedMessage.clientName}</h3>
                                            <div className="context-info">
                                                {selectedMessage.exerciseName && (
                                                    <span className="exercise-badge">
                                                        <Dumbbell size={12} />
                                                        {selectedMessage.exerciseName}
                                                    </span>
                                                )}
                                                <span className="timestamp">
                                                    <Clock size={12} />
                                                    {selectedMessage.timestamp.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedMessage.priority === 'high' && (
                                        <span className="priority-badge high">Alta prioridad</span>
                                    )}
                                </div>

                                {/* Message content */}
                                <div className="full-message">
                                    <p>{selectedMessage.content}</p>
                                    {selectedMessage.hasMedia && (
                                        <div className="media-placeholder">
                                            <Play size={24} />
                                            <span>Ver video adjunto</span>
                                        </div>
                                    )}
                                </div>

                                {/* Quick replies */}
                                <div className="quick-replies">
                                    <span className="quick-label">Respuestas rápidas:</span>
                                    <div className="quick-options">
                                        <button onClick={() => setReplyText('¡Excelente progreso! Sigue así 💪')}>
                                            ¡Excelente! 💪
                                        </button>
                                        <button onClick={() => setReplyText('Te envío un video con la corrección.')}>
                                            Envío video
                                        </button>
                                        <button onClick={() => setReplyText('Hablemos en la próxima sesión.')}>
                                            Hablamos pronto
                                        </button>
                                    </div>
                                </div>

                                {/* Reply box */}
                                <div className="reply-box">
                                    <input
                                        type="text"
                                        placeholder="Write your reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <button
                                        className={`voice-btn ${isRecording ? 'recording' : ''}`}
                                        onClick={() => setIsRecording(!isRecording)}
                                    >
                                        <Mic size={18} />
                                    </button>
                                    <button
                                        className="send-btn"
                                        style={{ background: accentColor }}
                                        disabled={!replyText.trim()}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="no-selection"
                            >
                                <MessageCircle size={48} style={{ color: 'var(--text-muted)' }} />
                                <p>Selecciona un mensaje para ver detalles</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
