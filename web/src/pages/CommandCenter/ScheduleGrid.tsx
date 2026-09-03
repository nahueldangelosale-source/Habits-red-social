import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useGridKeyboardNav } from '../../hooks/useGridKeyboardNav';
import { Clock, User } from 'lucide-react';

const HOURS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
const ROOMS = ['Box Principal', 'Zona HIIT', 'Zona Fuerza', 'Consultorio 1', 'Consultorio 2'];

interface ScheduleSession {
    id: string;
    title: string;
    instructor: string;
    startTime: string;
    duration: number; // in hours for simplicity
    roomIndex: number;
    capacity: number;
    enrolled: number;
    type: 'class' | 'clinical' | 'pt';
}

const mockSessions: ScheduleSession[] = [
    { id: '1', title: 'WOD Alpha', instructor: 'Coach Marcos', startTime: '07:00', duration: 1, roomIndex: 0, capacity: 20, enrolled: 18, type: 'class' },
    { id: '2', title: 'HIIT Extreme', instructor: 'Coach Anita', startTime: '08:00', duration: 1, roomIndex: 1, capacity: 15, enrolled: 15, type: 'class' },
    { id: '3', title: 'Evaluación Nutricional', instructor: 'Lic. Viale', startTime: '09:00', duration: 0.5, roomIndex: 3, capacity: 1, enrolled: 1, type: 'clinical' },
    { id: '4', title: 'Fuerza Máxima', instructor: 'Coach Marcos', startTime: '18:00', duration: 1.5, roomIndex: 2, capacity: 10, enrolled: 8, type: 'class' },
    { id: '5', title: 'Personal Training', instructor: 'Coach Anita', startTime: '10:00', duration: 1, roomIndex: 2, capacity: 1, enrolled: 1, type: 'pt' },
];

export const ScheduleGrid: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const containerRef = useRef<HTMLDivElement>(null);

    const { focusedCell, setFocusedCell } = useGridKeyboardNav({
        rows: HOURS.length,
        cols: ROOMS.length,
        containerRef
    });

    const getSessionAt = (time: string, roomIndex: number) => {
        return mockSessions.find(s => s.startTime === time && s.roomIndex === roomIndex);
    };

    const getTypeColor = (type: 'class' | 'clinical' | 'pt') => {
        if (isClinical) {
            switch(type) {
                case 'class': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                case 'clinical': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                case 'pt': return 'bg-amber-100 text-amber-800 border-amber-200';
            }
        } else {
            switch(type) {
                case 'class': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
                case 'clinical': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                case 'pt': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            }
        }
    };

    return (
        <div 
            className="flex-1 w-full overflow-hidden flex flex-col"
            ref={containerRef}
            tabIndex={0}
            onFocus={() => { if(!focusedCell) setFocusedCell({row: 0, col: 0}) }}
        >
            <div className={`flex items-center justify-between p-4 border-b ${isClinical ? 'border-slate-200' : 'border-zinc-800'}`}>
                <div>
                    <h2 className="text-xl font-bold font-sans">Command Center Grid</h2>
                    <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Gestión de Recursos y Horarios (Usa las flechas para navegar)</p>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${isClinical ? 'bg-indigo-400' : 'bg-indigo-500'}`}></span> Clases</div>
                    <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${isClinical ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span> Clínico</div>
                    <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${isClinical ? 'bg-amber-400' : 'bg-amber-500'}`}></span> PT</div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="min-w-[50rem] w-full">
                    {/* Header Row */}
                    <div className="flex">
                        <div className={`w-20 shrink-0 p-4 sticky left-0 z-10 ${isClinical ? 'bg-white' : 'bg-zinc-950'} border-b border-r ${isClinical ? 'border-slate-200' : 'border-zinc-800'}`}></div>
                        {ROOMS.map((room, i) => (
                            <div key={room} className={`flex-1 p-3 text-center font-bold text-sm border-b border-r ${isClinical ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-zinc-800 bg-zinc-900 text-zinc-300'}`}>
                                {room}
                            </div>
                        ))}
                    </div>

                    {/* Time Rows */}
                    {HOURS.map((hour, rIndex) => (
                        <div key={hour} className="flex group">
                            {/* Time Column */}
                            <div className={`w-20 shrink-0 flex items-center justify-center border-b border-r ${isClinical ? 'border-slate-200 bg-white text-slate-500' : 'border-zinc-800 bg-zinc-950 text-zinc-500'} sticky left-0 z-10 font-mono text-sm`}>
                                {hour}
                            </div>
                            
                            {/* Cells */}
                            {ROOMS.map((room, cIndex) => {
                                const session = getSessionAt(hour, cIndex);
                                const isFocused = focusedCell?.row === rIndex && focusedCell?.col === cIndex;

                                return (
                                    <div 
                                        key={`${hour}-${cIndex}`} 
                                        className={`flex-1 min-h-20 p-1 border-b border-r transition-colors cursor-pointer relative
                                            ${isClinical ? 'border-slate-100 hover:bg-slate-50' : 'border-zinc-800/50 hover:bg-zinc-900/50'}
                                            ${isFocused ? (isClinical ? 'ring-inset ring-2 ring-indigo-500 bg-indigo-50' : 'ring-inset ring-2 ring-emerald-500 bg-zinc-900') : ''}
                                        `}
                                        onClick={() => setFocusedCell({ row: rIndex, col: cIndex })}
                                    >
                                        {session && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`w-full h-full p-2 rounded-lg border flex flex-col justify-between shadow-sm ${getTypeColor(session.type)}`}
                                            >
                                                <div>
                                                    <div className="font-bold text-xs truncate">{session.title}</div>
                                                    <div className="text-[0.65rem] opacity-80 flex items-center gap-1 mt-0.5">
                                                        <User className="w-3 h-3" /> {session.instructor}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <div className="text-[0.65rem] opacity-80 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {session.duration}h
                                                    </div>
                                                    <div className="text-[0.65rem] font-mono font-bold">
                                                        {session.enrolled}/{session.capacity}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
