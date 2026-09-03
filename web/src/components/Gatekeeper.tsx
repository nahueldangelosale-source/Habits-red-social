
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Shield,
    Bell,
    BellOff,
    MessageSquare,
    AlertTriangle,
    Calendar,
    Moon,
    Sun,
    Check,
    X,
    Edit2,
    Save
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Types
interface DaySchedule {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
}

interface QueuedMessage {
    id: string;
    clientName: string;
    clientAvatar: string;
    content: string;
    timestamp: Date;
    isUrgent: boolean;
}

interface AutoResponse {
    id: string;
    trigger: 'outside_hours' | 'vacation' | 'busy';
    message: string;
    active: boolean;
}

// Default schedule
const defaultSchedule: DaySchedule[] = [
    { day: 'Lunes', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Martes', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Miércoles', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Jueves', enabled: true, start: '09:00', end: '18:00' },
    { day: 'Viernes', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Sábado', enabled: false, start: '10:00', end: '13:00' },
    { day: 'Domingo', enabled: false, start: '10:00', end: '13:00' },
];

// Mock queued messages
const mockQueue: QueuedMessage[] = [
    { id: '1', clientName: 'María G.', clientAvatar: 'MG', content: '¿Podemos mover la cita de mañana?', timestamp: new Date(Date.now() - 1000 * 60 * 30), isUrgent: false },
    { id: '2', clientName: 'Carlos L.', clientAvatar: 'CL', content: 'Pregunta sobre el plan de esta semana', timestamp: new Date(Date.now() - 1000 * 60 * 45), isUrgent: false },
    { id: '3', clientName: 'Diego M.', clientAvatar: 'DM', content: '⚠️ Dolor fuerte en rodilla', timestamp: new Date(Date.now() - 1000 * 60 * 15), isUrgent: true },
];

// Default auto responses
const defaultResponses: AutoResponse[] = [
    { id: '1', trigger: 'outside_hours', message: '¡Hola! Gracias por tu mensaje. Estoy fuera de horario de atención. Te responderé mañana a primera hora. Si es una emergencia, marca tu mensaje como urgente. 🙏', active: true },
    { id: '2', trigger: 'vacation', message: 'Estoy de vacaciones hasta el [FECHA]. Para urgencias, contacta a mi colega [NOMBRE]. ¡Gracias!', active: false },
    { id: '3', trigger: 'busy', message: 'Estoy en una sesión ahora mismo. Te respondo en cuanto termine (máx 1 hora). 💪', active: false },
];

export function Gatekeeper() {
    const { mode } = useTheme();
    const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule);
    const [emergencyBypass, setEmergencyBypass] = useState(true);
    const [autoResponses, setAutoResponses] = useState<AutoResponse[]>(defaultResponses);
    const [queue] = useState<QueuedMessage[]>(mockQueue);
    const [editingResponse, setEditingResponse] = useState<string | null>(null);
    const [isOfficeHours, setIsOfficeHours] = useState(true);

    const isDark = mode === 'ADRENALINE';
    const accentColor = isDark ? '#3B82F6' : '#2563EB'; // Blue
    const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-white' : 'text-slate-900';
    const textSub = isDark ? 'text-zinc-400' : 'text-slate-500';

    const toggleDay = (index: number) => {
        setSchedule(prev => prev.map((d, i) =>
            i === index ? { ...d, enabled: !d.enabled } : d
        ));
    };

    const updateTime = (index: number, field: 'start' | 'end', value: string) => {
        setSchedule(prev => prev.map((d, i) =>
            i === index ? { ...d, [field]: value } : d
        ));
    };

    const toggleResponse = (id: string) => {
        setAutoResponses(prev => prev.map(r =>
            r.id === id ? { ...r, active: !r.active } : r
        ));
    };

    const urgentCount = queue.filter(m => m.isUrgent).length;

    return (
        <div className={`p-6 ${isDark ? 'bg-zinc-950 text-white' : 'bg-[#F5F5F7] text-slate-800'}`}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="text-blue-500" />
                        Gatekeeper
                        <span className={`text-xs px-2 py-1 rounded-full border ${isOfficeHours ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {isOfficeHours ? 'Online' : 'Fuera de horario'}
                        </span>
                    </h2>
                    <p className={`text-sm mt-1 ${textSub}`}>
                        Protege tu tiempo con respuestas automáticas inteligentes.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Schedule & Settings */}
                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    {/* Quick Toggle */}
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-dashed border-gray-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOfficeHours ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                {isOfficeHours ? <Sun size={20} /> : <Moon size={20} />}
                            </div>
                            <div>
                                <div className="font-bold text-sm">{isOfficeHours ? 'Disponible' : 'No molestar'}</div>
                                <div className="text-xs opacity-60">
                                    {isOfficeHours ? 'Recibiendo mensajes' : 'Auto-respuesta activa'}
                                </div>
                            </div>
                        </div>
                        <button
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isOfficeHours ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-700'}`}
                            onClick={() => setIsOfficeHours(!isOfficeHours)}
                        >
                            <motion.div
                                className="w-4 h-4 rounded-full bg-white shadow-sm"
                                animate={{ x: isOfficeHours ? 24 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="mb-8">
                        <h3 className="font-bold text-sm uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                            <Calendar size={14} /> Horario Semanal
                        </h3>
                        <div className="space-y-2">
                            {schedule.map((day, i) => (
                                <div key={day.day} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${day.enabled ? 'bg-transparent' : 'opacity-40'}`}>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleDay(i)}
                                            className={`w-5 h-5 rounded flex items-center justify-center border ${day.enabled ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-zinc-600'}`}
                                        >
                                            {day.enabled && <Check size={12} />}
                                        </button>
                                        <span className="text-sm font-medium w-20">{day.day}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={day.start}
                                            onChange={(e) => updateTime(i, 'start', e.target.value)}
                                            disabled={!day.enabled}
                                            className="bg-gray-50 dark:bg-zinc-800 rounded px-2 py-1 text-xs border border-transparent focus:border-blue-500 outline-none w-20 text-center"
                                        />
                                        <span className="text-xs opacity-40">-</span>
                                        <input
                                            type="time"
                                            value={day.end}
                                            onChange={(e) => updateTime(i, 'end', e.target.value)}
                                            disabled={!day.enabled}
                                            className="bg-gray-50 dark:bg-zinc-800 rounded px-2 py-1 text-xs border border-transparent focus:border-blue-500 outline-none w-20 text-center"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Emergency Bypass */}
                    <div className={`p-4 rounded-xl flex items-center justify-between ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={18} className="text-red-500" />
                            <div>
                                <div className="text-sm font-bold text-red-600 dark:text-red-400">Emergency Bypass</div>
                                <div className="text-xs text-red-500/70">Mensajes urgentes siempre llegan</div>
                            </div>
                        </div>
                        <button
                            className={`w-10 h-6 rounded-full p-1 transition-colors ${emergencyBypass ? 'bg-red-500' : 'bg-gray-300 dark:bg-zinc-700'}`}
                            onClick={() => setEmergencyBypass(!emergencyBypass)}
                        >
                            <motion.div
                                className="w-4 h-4 rounded-full bg-white shadow-sm"
                                animate={{ x: emergencyBypass ? 16 : 0 }}
                            />
                        </button>
                    </div>
                </div>

                {/* Center: Auto-Responses */}
                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    <h3 className="font-bold text-sm uppercase tracking-wider opacity-60 mb-6 flex items-center gap-2">
                        <MessageSquare size={14} /> Auto-Respuestas
                    </h3>

                    <div className="space-y-4">
                        {autoResponses.map(response => (
                            <div key={response.id} className={`p-4 rounded-xl border transition-all ${response.active ? 'border-blue-500/30 bg-blue-500/5' : 'border-gray-200 dark:border-zinc-800 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-zinc-950/5 dark:bg-white/10">
                                        {response.trigger === 'outside_hours' && '🌙 Fuera de Horario'}
                                        {response.trigger === 'vacation' && '🏖️ Vacaciones'}
                                        {response.trigger === 'busy' && '💼 Ocupado'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingResponse(editingResponse === response.id ? null : response.id)} className="p-1 hover:bg-zinc-950/5 rounded">
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => toggleResponse(response.id)}
                                            className={`text-xs font-bold px-2 py-1 rounded ${response.active ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-zinc-700 text-gray-500'}`}
                                        >
                                            {response.active ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {editingResponse === response.id ? (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <textarea
                                                value={response.message}
                                                onChange={(e) => {
                                                    setAutoResponses(prev => prev.map(r =>
                                                        r.id === response.id ? { ...r, message: e.target.value } : r
                                                    ));
                                                }}
                                                className="w-full p-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 focus:border-blue-500 outline-none mb-2"
                                                rows={3}
                                            />
                                            <button
                                                className="text-xs flex items-center gap-1 font-bold text-blue-500 ml-auto"
                                                onClick={() => setEditingResponse(null)}
                                            >
                                                <Save size={12} /> Guardar
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <p className="text-sm  opacity-80 leading-relaxed">"{response.message}"</p>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Message Queue */}
                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-sm uppercase tracking-wider opacity-60 flex items-center gap-2">
                            <Clock size={14} /> Cola de Mensajes
                        </h3>
                        {urgentCount > 0 && (
                            <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full animate-pulse">
                                {urgentCount} urgentes
                            </span>
                        )}
                    </div>

                    <div className="space-y-3">
                        {queue.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 opacity-40">
                                <Check size={48} className="text-green-500 mb-2" />
                                <p className="text-sm">Todo al día</p>
                            </div>
                        ) : (
                            queue.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0)).map(msg => (
                                <motion.div
                                    key={msg.id}
                                    className={`p-3 rounded-xl border relative ${msg.isUrgent ? 'border-red-500/30 bg-red-500/5' : 'border-transparent bg-zinc-950/5 dark:bg-white/5'}`}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.isUrgent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {msg.clientAvatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold truncate">{msg.clientName}</span>
                                                <span className="text-xs opacity-40">
                                                    {Math.floor((Date.now() - msg.timestamp.getTime()) / 1000 / 60)}m
                                                </span>
                                            </div>
                                            <p className="text-xs opacity-70 line-clamp-2">{msg.content}</p>
                                        </div>
                                    </div>
                                    {msg.isUrgent && (
                                        <AlertTriangle size={12} className="absolute top-3 right-3 text-red-500" />
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-zinc-800 text-center">
                        <span className="text-xs font-mono opacity-50">
                            Próxima ventana: 09:00 AM
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
