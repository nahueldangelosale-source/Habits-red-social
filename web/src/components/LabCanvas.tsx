/**
 * THE LAB CANVAS - Nutrition/Workout Plan Builder
 * Split-screen workspace with library and weekly schedule.
 * Architect's blueprint aesthetic.
 */

import { useState } from 'react';

interface LibraryItem {
    id: string;
    name: string;
    category: string;
    meta: string;
}

interface ScheduleBlock {
    id: string;
    title: string;
    meta: string;
    day: number;
}

const libraryItems: LibraryItem[] = [
    { id: '1', name: 'Pechuga de Pollo', category: 'Proteína', meta: '165 kcal · 31g P' },
    { id: '2', name: 'Arroz Integral', category: 'Carbohidrato', meta: '216 kcal · 45g C' },
    { id: '3', name: 'Brócoli al Vapor', category: 'Vegetal', meta: '55 kcal · 11g C' },
    { id: '4', name: 'Salmón a la Plancha', category: 'Proteína', meta: '208 kcal · 28g P' },
    { id: '5', name: 'Quinoa', category: 'Carbohidrato', meta: '222 kcal · 39g C' },
    { id: '6', name: 'Aguacate', category: 'Grasa', meta: '160 kcal · 15g F' },
    { id: '7', name: 'Huevos Revueltos', category: 'Proteína', meta: '147 kcal · 10g P' },
    { id: '8', name: 'Avena con Frutas', category: 'Desayuno', meta: '307 kcal · 55g C' },
];

const initialSchedule: ScheduleBlock[] = [
    { id: '1', title: 'Desayuno Power', meta: '450 kcal', day: 0 },
    { id: '2', title: 'Almuerzo Balance', meta: '620 kcal', day: 0 },
    { id: '3', title: 'Cena Ligera', meta: '380 kcal', day: 0 },
    { id: '4', title: 'Desayuno Power', meta: '450 kcal', day: 1 },
    { id: '5', title: 'Almuerzo Proteico', meta: '580 kcal', day: 1 },
    { id: '6', title: 'Entrenamiento: Upper', meta: '45 min', day: 2 },
    { id: '7', title: 'Post-Workout Meal', meta: '520 kcal', day: 2 },
];

const DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export function LabCanvas() {
    const [searchTerm, setSearchTerm] = useState('');
    const [schedule] = useState(initialSchedule);

    const filteredItems = libraryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="split-panel">
                {/* Library Panel */}
                <div className="panel panel-left">
                    <div className="panel-header">
                        <div className="panel-search">
                            <span style={{ color: 'var(--text-faint)' }}>⌕</span>
                            <input
                                type="text"
                                placeholder="Search ingredients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="panel-content">
                        {filteredItems.map(item => (
                            <div key={item.id} className="library-item">
                                <div>{item.name}</div>
                                <div className="library-item-meta">{item.meta}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Schedule Panel */}
                <div className="panel panel-right">
                    <div className="schedule-grid">
                        {DAYS.map((day, dayIndex) => (
                            <div key={day} className="schedule-day">
                                <div className="schedule-day-header">{day}</div>
                                {schedule
                                    .filter(block => block.day === dayIndex)
                                    .map(block => (
                                        <div key={block.id} className="schedule-block">
                                            <div className="schedule-block-title">{block.title}</div>
                                            <div className="schedule-block-meta">{block.meta}</div>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Voice Command Bar */}
            <div className="voice-bar">
                <span>Press</span>
                <kbd>/</kbd>
                <span>to speak or type command</span>
            </div>
        </>
    );
}
