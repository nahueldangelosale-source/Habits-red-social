import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
    Activity, Dumbbell, ShieldAlert, Video, BrainCircuit, 
    ArrowUpRight, HeartPulse, Shield, MessageSquare, Plus,
    X, Check, FastForward, PlayCircle, Mic, RotateCcw,
    Users, Calendar, BatteryWarning, ChevronRight, Calendar as CalendarIcon, LayoutDashboard, Lock, ChevronDown, Zap, FileText, CreditCard, ActivitySquare, ArrowLeft, CheckCircle2, MessageCircle, ClipboardEdit, Trash2,
    Flame, Clock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useRBAC } from '../context/RBACContext';

import { AthleteDetailView } from './drilldown/AthleteDetailView';
import { trainerApi, type TrainerDashboardData } from '../api/trainer';

import { HealthBentoGrid } from './ui/HealthBentoGrid';
import { UpcomingSessionCard } from '../widgets/UpcomingSessionCard';
import { A2UIRenderer } from './a2ui/A2UIRenderer';
import { FinanceBentoWidget } from '../domains/coach/widgets/FinanceBentoWidget';
import AnalyticalRadar from './dashboard/AnalyticalRadar';
import ValidationTinderPanel from './dashboard/ValidationTinderPanel';
import { SmartCalendar } from './nutritionist/SmartCalendar';
import { RetentionRadarWidget } from './dashboard/RetentionRadarWidget';
import { LocalErrorBoundary } from './ui/LocalErrorBoundary';
import { useOnboardingPTStore } from '../stores/useOnboardingPTStore';
import { useValidationsStore } from '../stores/coach/useValidationsStore';
import { CreateClassGroupModal, type TargetAudience } from './coach/CreateClassGroupModal';
import { ActiveClassesWidget } from './coach/ActiveClassesWidget';

type TrainerTab = 'OVERVIEW' | 'CASCADE_BUILDER' | 'VALIDATION_SWIPE' | 'RADAR' | 'AGENDA';

export const CommandCenter: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { activeWorkspace } = useRBAC();
    const isClinical = mode === 'CLINICAL' || activeWorkspace === 'CLINICAL';
    
    // Tab por defecto basado en Workspace
    const [activeTab, setActiveTab] = useState<TrainerTab>(
        activeWorkspace === 'CLINICAL' ? 'RADAR' : 'OVERVIEW'
    );



    useEffect(() => {
        // Sync tab with workspace mode
        if (activeWorkspace === 'CLINICAL') setActiveTab('RADAR');
        else setActiveTab('OVERVIEW');
    }, [activeWorkspace]);

    const [showBanner, setShowBanner] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    // Detonar banner de éxito cuando el entrenador llega desde el PlanBuilder
    useEffect(() => {
        if (searchParams.get('plan_assigned') === 'true') {
            setShowBanner(true);
            // Limpiar el parámetro de la URL para evitar bucles en recargas
            setSearchParams({}, { replace: true });
            // Auto-dismiss del banner tras 6 segundos
            const timer = setTimeout(() => setShowBanner(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, setSearchParams]);
    


    const [dashboardData, setDashboardData] = useState<TrainerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Sincronizando telemetría de la base de datos...');
    const [prescriptionApplied, setPrescriptionApplied] = useState<Record<string, boolean>>({});

    const handleApplyPrescription = (clientId: string) => {
        // Mocked async mutation for prescriptive action
        setPrescriptionApplied(prev => ({ ...prev, [clientId]: true }));
        toast.success("Prescripción aplicada: Volumen ajustado exitosamente.", {
            icon: '✅',
            style: { background: '#18181b', color: '#10b981', border: '1px solid #059669' }
        });
    };

    useEffect(() => {
        let isMounted = true;
        const fetchDashboard = async () => {
            try {
                // Labor Illusion steps
                setTimeout(() => { if(isMounted) setLoadingMessage('Calculando ACWR de la cartera de clientes...'); }, 200);
                setTimeout(() => { if(isMounted) setLoadingMessage('Sincronizando resumen de Inicio...'); }, 400);

                const data = await trainerApi.getDashboard();
                if (isMounted) {
                    if (data && data.clients) {
                        data.clients = data.clients.map((c, idx) => ({
                            ...c,
                            planStatus: (c as any).planStatus || 'ACTIVE',
                            paymentStatus: (c as any).paymentStatus || 'paid',
                            hasUnreadMessage: (c as any).hasUnreadMessage ?? (idx === 0),
                            unreadMessagesCount: (c as any).unreadMessagesCount ?? (idx === 0 ? 1 : 0)
                        }));
                    }
                    setDashboardData(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchDashboard();
        return () => { isMounted = false; };
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // ACCIONES RÁPIDAS A 1 CLIC (CON e.stopPropagation())
    // ═══════════════════════════════════════════════════════════════════════════

    // 1 Clic: Alternar Cuota (Al Día <-> En Mora)
    const handleTogglePaymentStatus = (clientId: string, clientName: string) => {
        setDashboardData(prev => {
            if (!prev) return prev;
            let updatedStatus = 'paid';
            const updatedClients = prev.clients.map(c => {
                if (c.id === clientId) {
                    const currentStatus = (c as any).paymentStatus || 'paid';
                    const newStatus = currentStatus === 'paid' ? 'past_due' : 'paid';
                    updatedStatus = newStatus;
                    return { ...c, paymentStatus: newStatus };
                }
                return c;
            });

            if (updatedStatus === 'paid') {
                toast.success(`Cuota de ${clientName}: Marcada Al Día ✅`, {
                    icon: '💳',
                    duration: 3000
                });
            } else {
                toast.error(`Cuota de ${clientName}: Marcada En Mora ⚠️`, {
                    icon: '⚠️',
                    duration: 3000
                });
            }

            return { ...prev, clients: updatedClients };
        });
    };

    // 1 Clic: Alternar Estado de Plan (Activo <-> Pendiente)
    const handleTogglePlanStatus = (clientId: string, clientName: string) => {
        setDashboardData(prev => {
            if (!prev) return prev;
            let updatedPlan = 'ACTIVE';
            const updatedClients = prev.clients.map(c => {
                if (c.id === clientId) {
                    const currentStatus = (c as any).planStatus || 'ACTIVE';
                    const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
                    updatedPlan = newStatus;
                    return { ...c, planStatus: newStatus };
                }
                return c;
            });

            if (updatedPlan === 'ACTIVE') {
                toast.success(`Plan de ${clientName}: Activado ✅`, {
                    icon: '🏋️',
                    duration: 3000
                });
            } else {
                toast.success(`Plan de ${clientName}: En Borrador / Pendiente ⏳`, {
                    icon: '📝',
                    duration: 3000
                });
            }

            return { ...prev, clients: updatedClients };
        });
    };

    // 1 Clic: Agendar Turno en Calendario
    const handleQuickSchedule = (clientId: string, clientName: string) => {
        toast.success(`Abriendo agenda para ${clientName}...`, { icon: '📅' });
        navigate(`/calendar?athlete=${clientId}&name=${encodeURIComponent(clientName)}`);
    };

    // 1 Clic: Diseñar / Ver Rutina en Plan Builder
    const handleQuickPlan = (clientId: string, clientName: string) => {
        toast.success(`Cargando diseñador de rutinas para ${clientName}...`, { icon: '🏋️' });
        navigate(`/plan-builder?athleteId=${clientId}`);
    };

    // 1 Clic: Mensajería Interna Propia de la Plataforma
    const handleQuickInternalChat = (clientId: string, clientName: string) => {
        setDashboardData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                clients: prev.clients.map(c => c.id === clientId ? { ...c, hasUnreadMessage: false, unreadMessagesCount: 0 } : c)
            };
        });
        toast.success(`Abriendo mensajería interna con ${clientName}...`, { icon: '💬' });
        navigate(`/inbox?athlete=${clientId}`);
    };

    const { queue: swipeQueue, approveTask, rejectTask } = useValidationsStore();
    const pendingValidationsCount = swipeQueue.length;
    const [recordingVoice, setRecordingVoice] = useState(false);
    const [isTranslatingCue, setIsTranslatingCue] = useState(false);

    
        const safeData = dashboardData || { clients: [] };
        // Clients are fetched from the API
        // safeData.clients will be empty if there are no real clients
        const riskClients = safeData.clients.filter(c => c.riskLevel === 'RED' || c.riskLevel === 'ORANGE');

    const allRiskResolved = riskClients.length === 0 || riskClients.every(c => prescriptionApplied[c.id]);

    const handleSwipe = (direction: 'LEFT' | 'RIGHT', id: string) => {
        if (direction === 'RIGHT') {
            toast.success("Aprobado y enviado a la bitácora.");
            approveTask(id);
        } else {
            toast.error("Rechazado. Esperando corrección (Voice-Over).");
            rejectTask(id);
        }
    };

    const handleVoiceCorrection = () => {
        setRecordingVoice(true);
        setTimeout(() => {
            setRecordingVoice(false);
            setIsTranslatingCue(true);
            setTimeout(() => {
                setIsTranslatingCue(false);
                toast.success("Cues biomecánicos traducidos y enviados.");
                if (swipeQueue.length > 0) {
                    rejectTask(swipeQueue[0].id);
                }
            }, 1500);
        }, 2000);
    };

    const renderValidationSwipe = () => {
        if (swipeQueue.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] animate-in zoom-in">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                          isClinical ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                          <Check size={48} />
                      </div>
                      <h2 className={`text-3xl font-black mb-2 ${isClinical ? 'text-slate-900' : 'text-white'}`}>Inbox Zero</h2>
                      <p className={isClinical ? 'text-slate-500' : 'text-zinc-400'}>Has revisado todos los videos técnicos. La IA manejó el resto.</p>
                </div>
            );
        }

        const card = swipeQueue[0];

        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                        <Video className="text-indigo-400" /> Revisión Rápida (Triaje)
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">Videos pendientes: {swipeQueue.length}</p>
                </div>

                <AnimatePresence mode="popLayout">
                    <motion.div 
                        key={card.id}
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, x: -200 }}
                        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
                    >
                        {/* Priority Badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase z-10 flex items-center gap-1 shadow-lg ${
                            card.priority === 'RED' ? 'bg-rose-600 text-white' : 
                            card.priority === 'GREEN' ? 'bg-emerald-500 text-white' : 
                            'bg-amber-500 text-black'
                        }`}>
                            {card.priority === 'RED' && <ShieldAlert size={14} />}
                            {card.priority === 'GREEN' && <Shield size={14} />}
                            {card.priority === 'AMBER' && <Activity size={14} />}
                            Prioridad {card.priority === 'RED' ? '1' : card.priority === 'AMBER' ? '2' : '3'}
                        </div>

                        {/* Video Mock */}
                        <div className="h-72 bg-zinc-950 flex flex-col items-center justify-center relative">
                            <span className="text-6xl mb-4">{card.videoPreview}</span>
                            <PlayCircle size={48} className="text-white/20 absolute" />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-2xl font-black text-white">{card.name}</h3>
                            <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">{card.exercise}</p>
                            
                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
                                <p className="text-sm font-bold text-zinc-400 mb-1">Diagnóstico IA (Bio-Visión):</p>
                                <p className="text-white font-medium">{card.issue}</p>
                            </div>

                            {/* Action Buttons - Always manual review */}
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleSwipe('LEFT', card.id)}
                                        className="flex-1 py-4 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-black uppercase flex items-center justify-center gap-2 transition-all"
                                    >
                                        <X size={24} /> Rechazar
                                    </button>
                                    <button 
                                        onClick={() => handleSwipe('RIGHT', card.id)}
                                        className="flex-1 py-4 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-black uppercase flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Check size={24} /> Aprobar
                                    </button>
                                </div>

                                    {/* Voice to Chart Correction */}
                                    <div className="pt-2">
                                        {isTranslatingCue ? (
                                            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3 animate-pulse">
                                                <BrainCircuit className="text-indigo-400" />
                                                <div className="text-sm">
                                                    <p className="text-indigo-400 font-bold uppercase text-[10px]">Traducción Biomecánica Cognitiva</p>
                                                    <p className="text-indigo-100 mt-1 line-through opacity-50 text-xs">"Aprieta fuerte los glúteos y baja lento"</p>
                                                    <p className="text-white font-medium text-sm mt-1 flex items-center gap-1">
                                                        <ArrowUpRight size={14} className="text-indigo-400" />
                                                        "Empuja el suelo hacia afuera y rompe el piso a la mitad."
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleVoiceCorrection}
                                                className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all ${
                                                    recordingVoice 
                                                        ? 'bg-rose-500 text-white animate-pulse' 
                                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                }`}
                                            >
                                                <Mic size={18} /> {recordingVoice ? 'Grabando Corrección (Voice-Over)...' : 'Grabar Corrección (Voice-to-Chart)'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    };

    const renderOverview = () => (
        <div className={`animate-in fade-in duration-500 pb-20 min-h-screen pt-8 mt-2`}>
            
            {/* 1. Welcome Banner */}
            <AnimatePresence>
                {showBanner && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl p-5 mb-8 flex items-center justify-between shadow-2xl relative overflow-hidden toast-glass border border-white/60"
                    >
                        <div className="flex items-center gap-4 z-10 pl-2">
                            <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center text-slate-800 shadow-sm border border-white/50">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-black font-montserrat text-lg mb-0.5 tracking-tight text-slate-900">
                                    ¡Plan Asignado con Éxito!
                                </h3>
                                <p className="text-sm font-lato text-slate-700">
                                    El nuevo plan de entrenamiento ya está disponible en la app de tu atleta.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 z-10">
                            <button 
                                onClick={() => { setShowBanner(false); }}
                                className="px-5 py-2.5 font-bold rounded-xl text-sm transition-all shadow-md bg-slate-900 hover:bg-slate-800 text-white">
                                Entendido
                            </button>
                            <button onClick={() => setShowBanner(false)} className="transition-colors p-1 text-slate-500 hover:text-slate-900">
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-50">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>Inicio</h1>
                        <p className={`mt-0.5 text-xs md:text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Tu centro de control y resumen operativo</p>
                    </div>
                </div>

                {/* Botón superior de Nuevo siempre visible con sutil glow cálido */}
                <div className="relative group/newbtn">
                    {/* Sutil glow cálido imperceptible detrás del botón principal oscuro [+ NUEVO] (Regla del 3% neuroestética) */}
                    <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-indigo-500/20 blur-md opacity-60 group-hover/newbtn:opacity-100 transition-opacity duration-500" />
                    <button 
                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                        className={`relative flex items-center gap-2 font-black uppercase tracking-widest text-xs px-5 py-2.5 rounded-xl transition-all ${
                            isClinical 
                                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30'
                        }`}
                    >
                        <Plus size={16} /> Nuevo <ChevronDown size={14} className="ml-1 opacity-70" />
                    </button>

                    <AnimatePresence>
                        {isCreateOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-xl overflow-hidden border z-50 ${
                                    isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                                }`}
                            >
                                <div className="p-2 space-y-1">
                                    <button onClick={() => { setIsCreateOpen(false); useOnboardingPTStore.getState().resetOnboarding(); navigate('/cliente-cero-pt'); }} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                                        <div className={`mt-0.5 p-1.5 rounded-lg ${isClinical ? 'bg-indigo-50' : 'bg-indigo-500/10'}`}>
                                            <Users size={16} className={isClinical ? 'text-indigo-500' : 'text-indigo-400'} />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-white'}`}>Nuevo Cliente</div>
                                            <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Da de alta un perfil para empezar a enviarle planes.</div>
                                        </div>
                                    </button>

                                    <button onClick={() => { setIsCreateOpen(false); setIsCreateClassModalOpen(true); }} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                                        <div className={`mt-0.5 p-1.5 rounded-lg ${isClinical ? 'bg-purple-50' : 'bg-purple-500/10'}`}>
                                            <Zap size={16} className={isClinical ? 'text-purple-500' : 'text-purple-400'} />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-white'}`}>Crear Clase / Grupo</div>
                                            <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Fuerza, CrossFit, Running, Yoga o disciplina custom.</div>
                                        </div>
                                    </button>
                                    
                                    <button onClick={() => { setIsCreateOpen(false); navigate('/plan-builder'); }} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                                        <div className={`mt-0.5 p-1.5 rounded-lg ${isClinical ? 'bg-emerald-50' : 'bg-emerald-500/10'}`}>
                                            <FileText size={16} className={isClinical ? 'text-emerald-500' : 'text-emerald-400'} />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-white'}`}>Crear Plan de Entrenamiento</div>
                                            <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Arma una rutina desde cero en el Plan Builder.</div>
                                        </div>
                                    </button>

                                    <button onClick={() => setIsCreateOpen(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                                        <div className={`mt-0.5 p-1.5 rounded-lg ${isClinical ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
                                            <CreditCard size={16} className={isClinical ? 'text-amber-500' : 'text-amber-400'} />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-white'}`}>Registrar Cobro</div>
                                            <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Anota un pago manual para mantener tus finanzas al día.</div>
                                        </div>
                                    </button>

                                    <button onClick={() => { setIsCreateOpen(false); setActiveTab('AGENDA'); }} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                                        <div className={`mt-0.5 p-1.5 rounded-lg ${isClinical ? 'bg-rose-50' : 'bg-rose-500/10'}`}>
                                            <CalendarIcon size={16} className={isClinical ? 'text-rose-500' : 'text-rose-400'} />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-white'}`}>Agendar Cita</div>
                                            <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Reserva un turno presencial o por videollamada.</div>
                                        </div>
                                    </button>

                                    <div className={`my-1 border-t ${isClinical ? 'border-slate-100' : 'border-zinc-800'}`}></div>

                                    <button onClick={() => setIsCreateOpen(false)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                                        <div className={`mt-0.5 p-1.5 rounded-lg ${isClinical ? 'bg-slate-100' : 'bg-zinc-800'}`}>
                                            <ActivitySquare size={16} className={isClinical ? 'text-slate-500' : 'text-zinc-400'} />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-white'}`}>Ajuste de Nutrición</div>
                                            <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Modifica rápidamente las calorías o macros de alguien.</div>
                                        </div>
                                    </button>

                                    <button onClick={() => {
                                        setIsCreateOpen(false);
                                        toast.custom((t) => (
                                            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-zinc-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-zinc-800`}>
                                                <div className="flex-1 w-0 p-4">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 pt-0.5">
                                                            <HeartPulse className="h-10 w-10 text-rose-500 bg-rose-500/10 p-2 rounded-xl" />
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <p className="text-sm font-bold text-white">Selecciona el Atleta primero</p>
                                                            <p className="mt-1 text-[11px] text-zinc-400">
                                                                El registro de métricas y pliegues ISAK debe realizarse directamente desde el expediente del atleta.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex border-l border-zinc-800">
                                                    <button
                                                        onClick={() => {
                                                            toast.dismiss(t.id);
                                                            setActiveTab('ROSTER');
                                                        }}
                                                        className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 focus:outline-none transition-colors"
                                                    >
                                                        Ir al Roster
                                                    </button>
                                                </div>
                                            </div>
                                        ), { duration: 5000 });
                                    }} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                                        <div className={`mt-0.5 p-1.5 rounded-lg ${isClinical ? 'bg-slate-100' : 'bg-zinc-800'}`}>
                                            <HeartPulse size={16} className={isClinical ? 'text-slate-500' : 'text-zinc-400'} />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-white'}`}>Registrar Peso/Medidas</div>
                                            <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Anota el progreso físico de tu cliente.</div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* 1. NOTIFICACIÓN INTELIGENTE DE ALERTAS CLÍNICAS / LESIÓN / SOBRECARGA */}
            {/* Solo aparece si hay clientes con reporte de molestia, dolor o riesgo real */}
            <AnimatePresence>
                {riskClients.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -8, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.99 }}
                        className={`mb-6 p-4 md:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm ${
                            isClinical 
                                ? 'bg-gradient-to-r from-rose-50 to-amber-50/50 border-rose-200 text-rose-950' 
                                : 'bg-gradient-to-r from-rose-500/10 to-amber-500/5 border-rose-500/30 text-rose-200 shadow-rose-950/20'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl shrink-0 ${
                                isClinical ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                                <ShieldAlert size={22} className="animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-black text-sm ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                        {riskClients.length === 1 ? (isClinical ? '1 Paciente requiere atención' : '1 Alumno requiere atención') : `${riskClients.length} ${isClinical ? 'Pacientes' : 'Alumnos'} requieren atención`}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                        isClinical ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    }`}>
                                        Prioridad Alta
                                    </span>
                                </div>
                                <p className={`text-xs mt-0.5 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                    {riskClients.map(c => c.name).slice(0, 2).join(', ')}
                                    {riskClients.length > 2 ? ` y ${riskClients.length - 2} más` : ''} 
                                    {' '}presentan sobrecarga acumulada (ACWR) o molestias articulares registradas.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('RADAR')}
                            className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                isClinical 
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm' 
                                    : 'bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20'
                            }`}
                        >
                            Revisar Casos <ChevronRight size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. HERO CARDS OPERATIVOS: Revisiones, Agenda y Atletas en Seguimiento (Diseño Compacto & Prolijo) */}
            {(safeData.clients.length) > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Tarjeta 1: Revisiones (Video de Técnica & Fotos de Platos) */}
                    <motion.div 
                        whileHover={{ y: -3, scale: 1.008 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => {
                            if (swipeQueue.length > 0) {
                                setActiveTab('VALIDATION_SWIPE');
                            } else {
                                navigate('/validations');
                            }
                        }} 
                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer group p-4 sm:p-5 flex flex-col justify-between backdrop-blur-xl ${
                            isClinical 
                                ? 'bg-white/90 border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_28px_rgba(99,102,241,0.1)] hover:border-indigo-300' 
                                : 'bg-zinc-900/80 border-white/10 shadow-lg hover:shadow-[0_12px_28px_rgba(99,102,241,0.15)] hover:border-indigo-500/40'
                        }`}
                    >
                        {/* Specular Cut-Glass Edge Light */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 dark:via-indigo-400/20 to-transparent pointer-events-none" />

                        {/* Top Row: Icon Capsule + Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-xs border ${
                                swipeQueue.length > 0 
                                    ? (isClinical ? 'bg-indigo-50 text-indigo-600 border-indigo-200/80' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40') 
                                    : (isClinical ? 'bg-slate-100/70 text-slate-600 border-slate-200/60' : 'bg-white/5 text-zinc-400 border-white/5')
                            }`}>
                                <Video size={18} />
                                {swipeQueue.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                                )}
                            </div>

                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1.5 ${
                                swipeQueue.length > 0
                                    ? (isClinical ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30')
                                    : (isClinical ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30')
                            }`}>
                                {swipeQueue.length > 0 ? (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                                        Prioridad Media
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={11} />
                                        Al Día
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Middle/Bottom: KPI & Action (Bold Number Contrast CRO/LIFT) */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-400 mb-0.5">
                                Revisiones Pendientes
                            </p>
                            {swipeQueue.length > 0 ? (
                                <h3 className={`text-2xl font-black tracking-tight flex items-baseline gap-1.5 ${isClinical ? 'text-slate-950' : 'text-white'}`}>
                                    <span className="text-2xl font-black font-montserrat tracking-tighter text-indigo-600 dark:text-indigo-400">{swipeQueue.length}</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">por validar</span>
                                </h3>
                            ) : (
                                <h3 className={`text-xl font-black tracking-tight ${isClinical ? 'text-slate-950' : 'text-white'}`}>
                                    Bandeja al día
                                </h3>
                            )}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                <p className={`text-[11px] font-bold flex items-center gap-1 ${
                                    swipeQueue.length > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                    <span>{swipeQueue.length > 0 ? 'Validar técnica y fotos' : 'Sin videos pendientes'}</span>
                                </p>
                                <div className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tarjeta 2: Agenda de Hoy */}
                    <motion.div 
                        whileHover={{ y: -3, scale: 1.008 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => navigate('/calendar')} 
                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer group p-4 sm:p-5 flex flex-col justify-between backdrop-blur-xl ${
                            isClinical 
                                ? 'bg-white/90 border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_28px_rgba(168,85,247,0.1)] hover:border-purple-300' 
                                : 'bg-zinc-900/80 border-white/10 shadow-lg hover:shadow-[0_12px_28px_rgba(168,85,247,0.15)] hover:border-purple-500/40'
                        }`}
                    >
                        {/* Specular Cut-Glass Edge Light */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 dark:via-purple-400/20 to-transparent pointer-events-none" />

                        {/* Top Row: Icon Capsule + Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-xs border ${
                                isClinical ? 'bg-purple-50 text-purple-600 border-purple-200/80' : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            }`}>
                                <CalendarIcon size={18} />
                            </div>

                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1.5 ${
                                isClinical ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
                                En 45 min
                            </span>
                        </div>

                        {/* Middle/Bottom: KPI & Action (Bold Number Contrast CRO/LIFT) */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-400 mb-0.5">
                                Agenda de Hoy
                            </p>
                            <h3 className={`text-2xl font-black tracking-tight flex items-baseline gap-1.5 ${isClinical ? 'text-slate-950' : 'text-white'}`}>
                                <span className="text-2xl font-black font-montserrat tracking-tighter text-purple-600 dark:text-purple-400">2</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">Turnos Programados</span>
                            </h3>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                    Próximo: Fuerza Funcional
                                </p>
                                <div className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tarjeta 3: Alumnos / Pacientes Activos */}
                    <motion.div 
                        whileHover={{ y: -3, scale: 1.008 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => navigate('/roster')} 
                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer group p-4 sm:p-5 flex flex-col justify-between backdrop-blur-xl ${
                            isClinical 
                                ? 'bg-white/90 border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.08)] hover:border-emerald-300' 
                                : 'bg-zinc-900/80 border-white/10 shadow-lg hover:shadow-[0_8px_25px_rgba(16,185,129,0.15)] hover:border-emerald-500/40'
                        }`}
                    >
                        {/* Specular Cut-Glass Edge Light */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 dark:via-emerald-400/20 to-transparent pointer-events-none" />

                        {/* Top Row: Icon Capsule + Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-xs border ${
                                isClinical ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                                <Users size={18} />
                            </div>

                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1.5 ${
                                isClinical ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}>
                                <CheckCircle2 size={11} />
                                100% al día
                            </span>
                        </div>

                        {/* Middle/Bottom: KPI & Action (Bold Number Contrast CRO/LIFT) */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-400 mb-0.5">
                                {isClinical ? 'Pacientes en Seguimiento' : 'Alumnos en Seguimiento'}
                            </p>
                            <h3 className={`text-2xl font-black tracking-tight flex items-baseline gap-1.5 ${isClinical ? 'text-slate-950' : 'text-white'}`}>
                                <span className="text-2xl font-black font-montserrat tracking-tighter text-emerald-600 dark:text-emerald-400">{safeData.clients.length}</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">{safeData.clients.length === 1 ? (isClinical ? 'Paciente' : 'Alumno') : (isClinical ? 'Pacientes' : 'Alumnos')}</span>
                            </h3>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Todos con plan asignado
                                </p>
                                <div className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Grid for Atletas and Actividad Reciente */}
            {!isLoading && safeData.clients.length === 0 ? (
                /* ═══════════════════════════════════════════════════════════════
                   EMPTY STATE: "El Aterrizaje Triunfal"
                   High-conversion empty state designed to drive the trainer's
                   first macro-conversion: inviting their first client.
                   ═══════════════════════════════════════════════════════════════ */
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={`rounded-3xl border p-10 md:p-14 text-center mb-12 relative overflow-hidden backdrop-blur-2xl ${
                        isClinical 
                        ? 'border-slate-200/90 bg-gradient-to-b from-white via-slate-50/70 to-indigo-50/20 shadow-[0_8px_32px_rgba(15,23,42,0.04)]' 
                        : 'border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-zinc-950 shadow-2xl'
                    }`}
                >
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-indigo-500/[0.06] dark:bg-indigo-500/10 blur-3xl" />

                    {/* Geometric Habits Mandala Line Art con animación en bucle orgánico lento (8s) */}
                    <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
                        <motion.div 
                            animate={{
                                scale: [0.95, 1.25, 0.95],
                                opacity: [0.2, 0.45, 0.2]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                            className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-amber-500/15 blur-xl" 
                        />
                        <motion.svg 
                            animate={{
                                scale: [1, 1.03, 1]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                            viewBox="0 0 100 100" 
                            className="w-20 h-20 text-indigo-600 dark:text-indigo-400 stroke-current fill-none relative z-10"
                        >
                            <circle cx="50" cy="50" r="42" strokeWidth="1.2" strokeDasharray="3 3" className="opacity-40" />
                            <circle cx="50" cy="50" r="28" strokeWidth="1.5" className="opacity-60" />
                            <path d="M50 18 C62 34, 78 40, 78 56 C78 72, 62 82, 50 82 C38 82, 22 72, 22 56 C22 40, 38 34, 50 18 Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="opacity-90" />
                            <circle cx="50" cy="50" r="4" className="fill-indigo-600 dark:fill-indigo-400" />
                        </motion.svg>
                    </div>

                    {/* Copy */}
                    <h3 className={`text-2xl md:text-3xl font-black mb-3 tracking-tight ${
                        isClinical ? 'text-slate-900' : 'text-white'
                    }`}>
                        Comienza a construir hábitos con tus {isClinical ? 'pacientes' : 'alumnos'}
                    </h3>
                    <p className={`text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-8 ${
                        isClinical ? 'text-slate-600' : 'text-zinc-400'
                    }`}>
                        Tu plataforma está configurada y lista. Invita a tu primer {isClinical ? 'paciente' : 'alumno'} para enviar planes, coordinar turnos y acompañar su progreso en tiempo real.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsCreateOpen(true)}
                            className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center gap-2.5 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Invitar {isClinical ? 'primer paciente' : 'primer alumno'}
                        </motion.button>
                        <button
                            onClick={() => navigate('/roster')}
                            className={`px-5 py-3.5 rounded-xl font-bold text-xs transition-colors ${
                                isClinical 
                                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            Ver lista completa →
                        </button>
                    </div>

                    {/* Trust Signals */}
                    <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-[11px] font-medium text-slate-400 dark:text-zinc-500 flex-wrap">
                        <span className="flex items-center gap-1.5">⚡ Asignación ágil en 1-click</span>
                        <span className="flex items-center gap-1.5">🔒 Expediente privado Zero-Trust</span>
                        <span className="flex items-center gap-1.5">📈 Métricas de carga y adherencia</span>
                    </div>
                </motion.div>
            ) : (
                /* ═══════════════════════════════════════════════════════════════
                   NORMAL STATE: Contactos Recientes + Activity Feed 
                   ═══════════════════════════════════════════════════════════════ */
            <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <div className="xl:col-span-3">
                    {/* Grupos & Clases Activos (Widget con Horarios & Alumnos) */}
                    <ActiveClassesWidget isClinical={isClinical} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
                <div className="xl:col-span-2">
                    {/* 3. Contactos Recientes (Quick Access) */}
            <div className={`rounded-3xl border shadow-sm overflow-hidden ${isClinical ? 'bg-white border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)]' : 'bg-zinc-900 border-zinc-800'}`}>
                <div className={`px-6 py-5 border-b flex justify-between items-center ${isClinical ? 'border-slate-100 bg-slate-50/70' : 'border-zinc-800 bg-zinc-900'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isClinical ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <Users size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className={`text-base font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                    {isClinical ? 'Pacientes Recientes' : 'Alumnos Recientes'}
                                </h3>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isClinical ? 'bg-slate-200/70 text-slate-700' : 'bg-zinc-800 text-zinc-300'}`}>
                                    {safeData.clients.length}
                                </span>
                            </div>
                            <p className={`text-xs ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>Acceso rápido al expediente, plan y métricas de carga</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/roster')} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                        isClinical ? 'text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-700' : 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20'
                    }`}>
                        Ver Todos <ChevronRight size={14} />
                    </button>
                </div>
                
                <div className={`divide-y ${isClinical ? 'divide-slate-100' : 'divide-zinc-800'}`}>
                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-11 h-11 rounded-xl bg-zinc-800/50" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-zinc-800/50 rounded w-1/4" />
                                        <div className="h-3 bg-zinc-800/50 rounded w-1/2" />
                                    </div>
                                    <div className="w-20 h-6 rounded-lg bg-zinc-800/50" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        safeData.clients.map((client) => {
                            const hasUnread = (client as any).hasUnreadMessage;
                            const isPaid = (client as any).paymentStatus !== 'past_due';
                            const isPlanActive = (client as any).planStatus !== 'DRAFT';

                            return (
                                <div 
                                    key={client.id}
                                    onClick={() => navigate(`/trainer/athlete/${client.id}`)}
                                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-200 cursor-pointer group hover:bg-slate-50/80 dark:hover:bg-zinc-800/60"
                                >
                                    {/* LADO IZQUIERDO: AVATAR Y DATOS VITALES */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Avatar con indicador de mensaje interno no leído */}
                                        <div className="relative shrink-0">
                                            {client.photoUrl ? (
                                                <img 
                                                    src={client.photoUrl} 
                                                    alt={client.name} 
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-zinc-700" 
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-montserrat font-black text-sm ${
                                                    isClinical 
                                                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200/70' 
                                                        : 'bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500/30'
                                                }`}>
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}

                                            {/* Indicador de Mensajería Interna No Leída (Punto Ámbar Pulso) */}
                                            {hasUnread && (
                                                <span 
                                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse shadow-xs" 
                                                    title="Mensaje interno sin leer en la plataforma"
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <h4 className={`font-black font-montserrat text-sm truncate ${
                                                    isClinical ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-400'
                                                } transition-colors`}>
                                                    {client.name}
                                                </h4>
                                                {!client.lastWorkout && (
                                                    <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                        isClinical ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                        Nuevo
                                                    </span>
                                                )}
                                                {(client.streak ?? 0) > 0 && (
                                                    <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                                        isClinical ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                        <Flame size={10} />
                                                        {client.streak}d racha
                                                    </span>
                                                )}
                                                {hasUnread && (
                                                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                                                        Mensaje pendiente
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                                <p className={`text-[11px] font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                                    {client.lastWorkout 
                                                        ? `${isClinical ? 'Última sesión' : 'Último entreno'}: ${client.lastWorkout}` 
                                                        : (isClinical ? 'Sin sesiones aún' : 'Sin entrenos aún')}
                                                </p>
                                            </div>

                                            {client.criticalTags && client.criticalTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {client.criticalTags.map(tag => (
                                                        <span key={tag} className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap border ${
                                                            client.riskLevel === 'RED'
                                                                ? isClinical ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                : isClinical ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* LADO DERECHO: ESTADOS A SIMPLE VISTA Y BARRA DE ACCIONES A 1 CLIC */}
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 md:gap-6 shrink-0 self-start lg:self-auto ml-16 lg:ml-0">
                                        
                                        {/* Estado del Plan (Interactivo a 1 clic para alternar) */}
                                        <div className="text-right">
                                            <p className={`text-[10px] font-black font-montserrat uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                                Plan
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePlanStatus(client.id, client.name);
                                                }}
                                                title="Clic para alternar estado de plan (Activo / Pendiente)"
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                                    isPlanActive 
                                                        ? (isClinical ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30')
                                                        : (isClinical ? 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30')
                                                }`}
                                            >
                                                {isPlanActive ? (
                                                    <>
                                                        <CheckCircle2 size={11} className="text-indigo-600 dark:text-indigo-400" />
                                                        <span>Activo</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={11} className="text-amber-500" />
                                                        <span>Pendiente</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        
                                        {/* Estado de Cuota (Interactivo a 1 clic para alternar) */}
                                        <div className="text-right">
                                            <p className={`text-[10px] font-black font-montserrat uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                                Cuota
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePaymentStatus(client.id, client.name);
                                                }}
                                                title="Clic para alternar cuota (Al Día / En Mora)"
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                                    isPaid 
                                                        ? (isClinical ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30')
                                                        : (isClinical ? 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30')
                                                }`}
                                            >
                                                {isPaid ? (
                                                    <>
                                                        <CheckCircle2 size={11} className="text-emerald-500" />
                                                        <span>Al Día</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle size={11} className="text-rose-500" />
                                                        <span>En Mora</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* ═══════════════════════════════════════════════════════════════
                                            MICRO-TOOLBAR DE ACCIONES RÁPIDAS A 1 CLIC
                                           ═══════════════════════════════════════════════════════════════ */}
                                        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border transition-all ${
                                            isClinical ? 'bg-slate-100/80 border-slate-200/80' : 'bg-zinc-950/70 border-zinc-800'
                                        }`}>
                                            {/* Acción 1: 📅 Agendar Turno */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickSchedule(client.id, client.name);
                                                }}
                                                title="📅 Agendar Turno en Calendario"
                                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    isClinical 
                                                        ? 'hover:bg-white text-slate-600 hover:text-indigo-600 hover:shadow-xs' 
                                                        : 'hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400'
                                                }`}
                                            >
                                                <Calendar size={15} />
                                            </button>

                                            {/* Acción 2: 🏋️ Diseñar / Ver Rutina */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickPlan(client.id, client.name);
                                                }}
                                                title={isClinical ? "📋 Diseñar o Ver Plan Nutricional / Clínico" : "🏋️ Diseñar o Ver Plan de Entrenamiento"}
                                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    isClinical 
                                                        ? 'hover:bg-white text-slate-600 hover:text-sky-600 hover:shadow-xs' 
                                                        : 'hover:bg-zinc-800 text-zinc-400 hover:text-sky-400'
                                                }`}
                                            >
                                                <Dumbbell size={15} />
                                            </button>

                                            {/* Acción 3: 💬 Mensajería Interna de la Plataforma */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickInternalChat(client.id, client.name);
                                                }}
                                                title={hasUnread ? "💬 Tienes un mensaje interno sin leer" : "💬 Enviar Mensaje Interno (Chat Propio)"}
                                                className={`p-2 rounded-xl transition-all cursor-pointer relative ${
                                                    isClinical 
                                                        ? 'hover:bg-white text-slate-600 hover:text-emerald-600 hover:shadow-xs' 
                                                        : 'hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400'
                                                }`}
                                            >
                                                <MessageSquare size={15} />
                                                {hasUnread && (
                                                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                                                )}
                                            </button>

                                            {/* Acción 4: 💳 Alternar Cuota */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePaymentStatus(client.id, client.name);
                                                }}
                                                title={isPaid ? "💳 Cuota al día (clic para marcar mora)" : "💳 Cuota en mora (clic para registrar cobro)"}
                                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    isClinical 
                                                        ? 'hover:bg-white text-slate-600 hover:text-emerald-600 hover:shadow-xs' 
                                                        : 'hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400'
                                                }`}
                                            >
                                                <CreditCard size={15} />
                                            </button>

                                            {/* Acción 5: ➡️ Ficha Completa del Atleta */}
                                            <button
                                                onClick={() => navigate(`/trainer/athlete/${client.id}`)}
                                                title={isClinical ? "Ver Expediente Completo del Paciente" : "Ver Ficha Completa del Alumno"}
                                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    isClinical 
                                                        ? 'bg-white text-slate-700 hover:bg-indigo-600 hover:text-white shadow-2xs' 
                                                        : 'bg-zinc-800 text-zinc-300 hover:bg-indigo-500 hover:text-white'
                                                }`}
                                            >
                                                <ChevronRight size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
        
        {/* 4. Actividad Reciente */}
        <div className="xl:col-span-1 relative group/activity">
            {/* Sutil glow cálido imperceptible detrás de la tarjeta de Actividad Reciente (Regla del 3% neuroestética) */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-3xl blur-xl opacity-60 group-hover/activity:opacity-90 transition-opacity duration-700 pointer-events-none" />
            
            <div className={`relative rounded-3xl border shadow-sm overflow-hidden ${isClinical ? 'bg-white border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)]' : 'bg-zinc-900 border-zinc-800'}`}>
                <div className={`px-6 py-5 border-b flex justify-between items-center ${isClinical ? 'border-slate-100 bg-slate-50/50' : 'border-zinc-800 bg-zinc-900'}`}>
                    <h3 className={`text-base font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Actividad Reciente</h3>
                    <Zap size={16} className={isClinical ? 'text-indigo-500' : 'text-indigo-400'} />
                </div>
                <div className={`divide-y flex-1 overflow-y-auto ${isClinical ? 'divide-slate-100' : 'divide-zinc-800'}`}>
                    {/* Activity Feed Empty State con respiración orgánica de 6s */}
                    <div className="flex flex-col items-center justify-center p-8 text-center my-auto min-h-[220px]">
                        <motion.div 
                            animate={{
                                scale: [1, 1.025, 1],
                                opacity: [0.92, 1, 0.92]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative w-16 h-16 mb-4 flex items-center justify-center"
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-indigo-500/15 blur-lg" />
                            <svg viewBox="0 0 64 64" className="w-12 h-12 text-indigo-600 dark:text-indigo-400 stroke-current fill-none">
                                <circle cx="32" cy="32" r="26" strokeWidth="1.2" strokeDasharray="3 3" className="opacity-40" />
                                <path d="M16 33 L24 33 L28 22 L36 42 L40 33 L48 33" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="32" cy="32" r="2.5" className="fill-indigo-600 dark:fill-indigo-400" />
                            </svg>
                        </motion.div>
                        <p className={`text-sm font-bold ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>Bandeja al Día</p>
                        <p className={`text-xs mt-1.5 max-w-[210px] leading-relaxed ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                            Todo en orden. Las sesiones y registros de tus {isClinical ? 'pacientes' : 'alumnos'} aparecerán en vivo aquí.
                        </p>
                    </div>
                </div>
                <div className={`p-4 border-t text-center mt-auto ${isClinical ? 'border-slate-100 bg-slate-50/30' : 'border-zinc-800 bg-zinc-900/30'}`}>
                    <button className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-slate-400 hover:text-slate-600' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        Ver Historial Completo
                    </button>
                </div>
            </div>
        </div>
    </div>
    </>
            )}
        </div>
    );


    const renderB2BOverview = () => (
        <div className={`animate-in fade-in duration-500 pb-20 min-h-screen pt-8 mt-2`}>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-3xl font-black tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>Centro de Control Global</h1>
                    <p className={`mt-1 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Visión Ejecutiva y Clientes en Riesgo</p>
                </div>
            </header>

            {/* B2B METRICS (Leading Indicators) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className={`p-6 rounded-2xl border shadow-sm flex items-start gap-4 ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                        <Lock size={24} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Riesgo de Fuga</p>
                        <h3 className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>15 Atletas <span className="text-lg text-rose-500 font-normal">en Soft-Lock</span></h3>
                        <p className="text-sm font-bold mt-1 text-rose-500">$750 MRR retenido pendiente de recuperación</p>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm flex items-start gap-4 ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>MRR Activo Global</p>
                        <h3 className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>$4,500 <span className={`text-lg font-normal ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>/mes</span></h3>
                        <p className="text-sm font-medium mt-1 text-emerald-500">Sano y Conciliado</p>
                    </div>
                </div>
            </div>
            
            <div className="mb-10">
                <h3 className={`text-lg font-bold mb-4 ${isClinical ? 'text-slate-900' : 'text-white'}`}>Recuperación de Clientes</h3>
                <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>T+24h (Autoridad Indiferente)</span>
                        <span className={`text-sm font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>8 Atletas impactados</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isClinical ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                        <div className="bg-indigo-500 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm font-bold ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>T+72h (Escasez - Ultimátum)</span>
                        <span className="text-sm font-bold text-rose-500">7 Atletas en riesgo de purga</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isClinical ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                        <div className="bg-rose-500 h-2 rounded-full" style={{width: '40%'}}></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRadar = () => {
        const sortedClients = dashboardData?.clients ? [...dashboardData.clients].sort((a, b) => {
            const getOrder = (vol: number) => vol > 10000 ? 0 : 2;
            return getOrder(a.lastSessionVolume) - getOrder(b.lastSessionVolume);
        }) : [];

        return (
            <div className={`animate-in fade-in duration-500 pb-20 min-h-screen pt-8 mt-2`}>
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>Radar Analítico</h1>
                        <p className={`mt-1 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Centro de Control Biomecánico</p>
                    </div>
                </header>

                <section aria-label="Cockpit del Entrenador" className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
                    
                    {/* COGNITIVE BIOMETRICS & CLIENTS (Span 8) */}
                    <div className="col-span-12 md:col-span-8 row-span-2 space-y-6">
                        <article className={`p-6 rounded-3xl border flex flex-col justify-between ${
                            isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                        }`}>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold">Estado Clínico de Atletas</h3>
                                    <p className="text-xs text-zinc-400">Atención ordenada según severidad y alertas de lesión</p>
                                </div>

                            </div>
                            
                            {allRiskResolved ? (
                                <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                                        isClinical ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-500/10 text-indigo-400'
                                    }`}>
                                        <Check size={32} className="text-emerald-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-emerald-400 mb-2">Estado Zen Activo</h4>
                                    <p className="text-sm text-zinc-400 max-w-md mb-6">Todos tus atletas están operando en <strong>Estado Óptimo</strong>. Riesgo de lesión minimizado a nivel de cartera.</p>
                                    
                                    {/* Mock Gaussian Bell Chart for ACWR */}
                                    <div className="w-full max-w-sm h-24 relative flex items-end justify-between px-2 gap-1 opacity-80">
                                        {[10, 20, 35, 60, 90, 100, 90, 60, 35, 20, 10].map((h, i) => (
                                            <div key={i} className="w-full bg-emerald-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                                                {h > 80 && <div className="w-full h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] rounded-t-sm" />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between w-full max-w-sm mt-2 text-[10px] text-zinc-500 font-bold">
                                        <span>Baja Carga</span>
                                        <span className="text-emerald-500">Estado Estado Óptimo</span>
                                        <span>Over-training</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {riskClients.map(client => {
                                        const isRed = client.riskLevel === 'RED';
                                        const buttonText = client.criticalTags?.includes('Intolerancia a la Flexión Lumbar') || client.criticalTags?.includes('Dolor Agudo') 
                                            ? 'Aplicar McGill (-100% Carga Axial)' 
                                            : 'Aplicar Recorte 20% Volumen';
                                        
                                        return (
                                            <div key={client.id} className={`p-4 rounded-2xl flex flex-col justify-between ${
                                                isRed ? 'bg-red-500/5 border border-red-500/10' : 'bg-amber-500/5 border border-amber-500/10'
                                            }`}>
                                                <div>
                                                    <h4 className={`text-sm font-bold mb-1 ${isRed ? 'text-red-500' : 'text-amber-500'}`}>
                                                        {client.name}
                                                    </h4>
                                                    <p className="text-xs text-zinc-400">
                                                        {isRed ? 'Riesgo Crítico detectado.' : 'Fatiga / Sensibilidad biomecánica detectada.'}{' '}
                                                        Restricciones: <strong className="text-zinc-300">{client.criticalTags?.join(', ') || 'General'}</strong>
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => handleApplyPrescription(client.id)}
                                                    disabled={prescriptionApplied[client.id]}
                                                    className={`mt-3 w-full py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
                                                        prescriptionApplied[client.id] 
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                                            : isRed 
                                                                ? 'bg-red-500 text-white hover:bg-red-400' 
                                                                : 'bg-indigo-500 text-black hover:bg-indigo-400'
                                                    }`}
                                                >
                                                    {prescriptionApplied[client.id] ? <><Check size={14} /> Aplicado</> : buttonText}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="pt-4 border-t border-white/5 mt-6 flex justify-between items-center">
                                <span className="text-xs text-zinc-400">Total atletas a cargo: {safeData.clients.length || 0}</span>
                                <button className="text-xs font-bold text-indigo-400 hover:underline">Revisar Alarmas</button>
                            </div>
                        </article>

                        <div className="pt-4">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4 px-4 font-bold">Salud del Grupo</h3>
                            <HealthBentoGrid metrics={[]} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Action Cards (Span 4) */}
                    <div className="col-span-12 md:col-span-4 row-span-2 flex flex-col gap-6">
                        <UpcomingSessionCard mode={mode} />
                        
                        <article className={`p-6 rounded-3xl border flex flex-col justify-between flex-1 ${
                            isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                        }`}>
                            <div>
                                <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-4">Accesos de Prescripción</h3>
                                <div className="space-y-2">
                                    <button onClick={() => navigate('/plan-builder')} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold flex justify-between items-center">
                                        <span>Revisión Biomecánica Completa</span>
                                        <ChevronRight size={12} className="text-zinc-500" />
                                    </button>
                                    <button className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold flex justify-between items-center">
                                        <span>Bóveda de Bloques</span>
                                        <ArrowUpRight size={14} />
                                    </button>
                                    <button className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold flex justify-between items-center">
                                        <span>Dictar Ficha por Voz</span>
                                        <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </article>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Inbox Inteligente</h3>
                            {/* TODO: Connect to real inbox feed from backend */}
                            <p className="text-sm text-zinc-500 italic">No hay nuevas alertas biomecánicas o nutricionales.</p>
                        </div>
                    </div>

                    {/* BOTTOM COLUMN: Urgent Attention Client List (Span 12) */}
                    <div className="col-span-12">
                        <article className={`p-6 rounded-3xl border ${
                            isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                        }`}>
                            <h3 className="text-lg font-bold mb-6">Atención Requerida - Planilla Completa</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {sortedClients.map(client => (
                                    <div key={client.id} className={`p-4 rounded-xl border transition-colors ${
                                        isClinical ? 'bg-slate-50 border-slate-100 hover:bg-slate-100' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800/50'
                                    }`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm">{client.name}</span>
                                            <span className={`w-2 h-2 rounded-full ${
                                                client.lastSessionVolume > 10000 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'
                                            }`} />
                                        </div>
                                        <p className="text-xs text-zinc-400 mb-2">{client.painAreas?.join(', ') || 'Optimización'}</p>
                                        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                                            <span>Atleta</span>
                                            <span className="underline cursor-pointer hover:opacity-100" onClick={() => navigate(`/trainer/athlete/${client.id}`)}>Revisar</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>
                </section>
            </div>
        );
    };

    if (id) {
        return <AthleteDetailView athleteId={id} onBack={() => navigate(-1)} />;
    }

    return (
        <div className={`min-h-screen ${
            isClinical ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#090d16] text-white'
        } p-6 md:p-10 transition-colors duration-500 relative overflow-hidden`}>
            {/* Ambient Soul Gradient Reflections - Soft warm brand presence */}
            <div className="pointer-events-none absolute -top-48 right-1/4 w-[550px] h-[550px] rounded-full bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06] blur-[140px]" />
            <div className="pointer-events-none absolute top-1/3 -left-36 w-[450px] h-[450px] rounded-full bg-purple-500/[0.03] dark:bg-purple-500/[0.05] blur-[120px]" />

            <div className="relative z-10">
                {activeTab !== 'OVERVIEW' && (
                    <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
                        <button 
                            onClick={() => setActiveTab('OVERVIEW')}
                            className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl transition-colors ${
                                isClinical 
                                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' 
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 shadow-sm'
                            }`}
                        >
                            <ArrowLeft size={16} /> Volver al Inicio
                        </button>
                    </div>
                )}

                {activeTab === 'OVERVIEW' && (activeWorkspace === 'B2B' ? renderB2BOverview() : renderOverview())}
                {activeTab === 'RADAR' && <AnalyticalRadar />}
                {activeTab === 'VALIDATION_SWIPE' && (
                    <ValidationTinderPanel 
                        onComplete={() => {
                            setSwipeQueue([]);
                            setActiveTab('OVERVIEW');
                        }} 
                    />
                )}
                {activeTab === 'AGENDA' && <SmartCalendar />}
                {/* Modal de Creación de Clases / Grupos en el Dashboard Principal */}
                <CreateClassGroupModal
                    isOpen={isCreateClassModalOpen}
                    onClose={() => setIsCreateClassModalOpen(false)}
                    onClassCreated={(newAudience) => {
                        toast.success(`¡Clase "${newAudience.name}" creada exitosamente!`, {
                            icon: '🎉',
                            style: { background: '#18181b', color: '#a855f7', border: '1px solid #7e22ce' }
                        });
                    }}
                />
            </div>
        </div>
    );
};
