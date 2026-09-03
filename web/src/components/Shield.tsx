/**
 * THE SHIELD - Smart Inbox
 * Communication hub categorized by urgency, not chronology.
 * Three-column layout with bubble-less editorial chat.
 */

import { useState } from 'react';

interface Message {
    id: string;
    sender: 'client' | 'coach';
    text: string;
    time: string;
}

interface Conversation {
    id: string;
    name: string;
    category: 'urgent' | 'feedback' | 'casual';
    preview: string;
    messages: Message[];
    stats: {
        adherence: number;
        currentWeek: number;
        totalWeeks: number;
        lastWeight: string;
    };
}

const conversations: Conversation[] = [
    {
        id: '1',
        name: 'Luis Fernández',
        category: 'urgent',
        preview: 'Me sentí mareado después del entreno...',
        messages: [
            { id: '1', sender: 'client', text: 'Hola, ayer me sentí muy mareado después del entrenamiento de la tarde.', time: '18:42' },
            { id: '2', sender: 'coach', text: '¿Comiste algo antes del entreno? ¿Cuántas horas pasaron desde tu última comida?', time: '18:45' },
            { id: '3', sender: 'client', text: 'Mmm creo que como 5 horas. No me dio tiempo de comer.', time: '18:47' },
            { id: '4', sender: 'coach', text: 'Ahí está el problema. Necesitas energía para entrenar. Vamos a ajustar tus horarios.', time: '18:50' },
        ],
        stats: { adherence: 28, currentWeek: 2, totalWeeks: 8, lastWeight: '92.4 kg' }
    },
    {
        id: '2',
        name: 'Carlos Rodríguez',
        category: 'urgent',
        preview: 'Mi glucosa subió a 145...',
        messages: [
            { id: '1', sender: 'client', text: 'Hola, mi glucosa en ayunas marcó 145 esta mañana.', time: '07:15' },
            { id: '2', sender: 'coach', text: '¿Qué cenaste anoche? ¿A qué hora?', time: '07:22' },
        ],
        stats: { adherence: 58, currentWeek: 8, totalWeeks: 16, lastWeight: '88.1 kg' }
    },
    {
        id: '3',
        name: 'María González',
        category: 'feedback',
        preview: '¿Puedo cambiar el brócoli por espinaca?',
        messages: [
            { id: '1', sender: 'client', text: '¿Puedo cambiar el brócoli de la cena por espinaca? No me gusta mucho.', time: '12:30' },
        ],
        stats: { adherence: 91, currentWeek: 4, totalWeeks: 12, lastWeight: '68.4 kg' }
    },
    {
        id: '4',
        name: 'Elena Sánchez',
        category: 'feedback',
        preview: 'El entrenamiento de ayer estuvo genial',
        messages: [
            { id: '1', sender: 'client', text: 'El entrenamiento de ayer estuvo genial, pero me quedaron muy adoloridas las piernas.', time: '09:15' },
        ],
        stats: { adherence: 88, currentWeek: 6, totalWeeks: 12, lastWeight: '71.8 kg' }
    },
    {
        id: '5',
        name: 'Sofía Herrera',
        category: 'casual',
        preview: '¡Bajé 2kg esta semana! 🎉',
        messages: [
            { id: '1', sender: 'client', text: '¡Bajé 2kg esta semana! Estoy muy contenta con el progreso.', time: '08:00' },
            { id: '2', sender: 'coach', text: '¡Excelente Sofía! Tu constancia está dando frutos. Sigamos así.', time: '08:15' },
        ],
        stats: { adherence: 97, currentWeek: 10, totalWeeks: 12, lastWeight: '62.1 kg' }
    },
];

const categoryIcons = {
    urgent: '⚠',
    feedback: '💬',
    casual: '✓',
};

const categoryLabels = {
    urgent: 'Urgent (Clinical Risk)',
    feedback: 'Feedback Required',
    casual: 'Casual Updates',
};

export function Shield() {
    const [selectedId, setSelectedId] = useState(conversations[0].id);
    const selected = conversations.find(c => c.id === selectedId)!;

    const grouped = {
        urgent: conversations.filter(c => c.category === 'urgent'),
        feedback: conversations.filter(c => c.category === 'feedback'),
        casual: conversations.filter(c => c.category === 'casual'),
    };

    return (
        <div className="inbox-layout">
            {/* Triage Column */}
            <div className="inbox-panel" style={{ borderRight: '1px solid var(--border)' }}>
                {(['urgent', 'feedback', 'casual'] as const).map(category => (
                    <div key={category} className="triage-group">
                        <div className={`triage-label ${category}`}>
                            <span>{categoryIcons[category]}</span>
                            <span>{categoryLabels[category]}</span>
                        </div>
                        {grouped[category].map(conv => (
                            <div
                                key={conv.id}
                                className={`triage-item ${conv.id === selectedId ? 'active' : ''}`}
                                onClick={() => setSelectedId(conv.id)}
                            >
                                <div className="triage-name">{conv.name}</div>
                                <div className="triage-preview">{conv.preview}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Conversation Column */}
            <div className="inbox-panel">
                <div className="panel-header border-b">
                    <span className="font-medium">{selected.name}</span>
                </div>
                <div className="chat-container">
                    {selected.messages.map(msg => (
                        <div key={msg.id} className={`chat-message ${msg.sender}`}>
                            <div className="chat-text">{msg.text}</div>
                            <div className="chat-time">{msg.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Context Sidecar */}
            <div className="inbox-panel context-panel">
                <div className="context-section">
                    <div className="context-label">Client Stats</div>
                    <div className="context-stat">
                        <span>Adherence</span>
                        <span className="context-stat-value">{selected.stats.adherence}%</span>
                    </div>
                    <div className="context-stat">
                        <span>Progress</span>
                        <span className="context-stat-value">Week {selected.stats.currentWeek}/{selected.stats.totalWeeks}</span>
                    </div>
                    <div className="context-stat">
                        <span>Last Weight</span>
                        <span className="context-stat-value">{selected.stats.lastWeight}</span>
                    </div>
                </div>

                <div className="context-section">
                    <div className="context-label">Quick Actions</div>
                    <button className="w-full" style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        marginBottom: 'var(--space-sm)'
                    }}>
                        📋 View Full Plan
                    </button>
                    <button className="w-full" style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                    }}>
                        📊 Open Analytics
                    </button>
                </div>
            </div>
        </div>
    );
}
