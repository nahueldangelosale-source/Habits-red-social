import React, { Suspense, lazy, useState, useEffect } from 'react';
import {
    ChevronLeft,
    TrendingUp,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Lightbulb,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Send,
    DollarSign,
    X,
    CreditCard,
    BarChart3,
    Bell,
    PieChart,
    MessageCircle,
    Search,
    Filter,
    Plus,
    Copy,
    ExternalLink,
    Sparkles,
    ShieldCheck,
    Tag,
    Layers,
    Calendar,
    Check,
    Edit3,
    Trash2,
    Share2,
    Eye,
    Settings,
    RotateCcw,
    Sliders
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ChartSkeleton } from './ChartSkeleton';
import { 
    useFinanceStore, 
    type FinanceClient, 
    type PaymentStatus, 
    type CommercialPlan, 
    type PlanCategory, 
    type PlanTier,
    type BillingFrequency,
    type WhatsAppTemplates,
    DEFAULT_WHATSAPP_TEMPLATES
} from '../../stores/useFinanceStore';
import { useFinanceSync } from '../../hooks/useFinanceSync';
import toast from 'react-hot-toast';

// Code Splitting: recharts isolated from main bundle
const LazyFinanceChart = lazy(() => import('./FinanceChart'));

// ═══════════════════════════════════════════════════════════════
// STATUS BADGE PEDAGÓGICO
// ═══════════════════════════════════════════════════════════════
const StatusBadge: React.FC<{ status: PaymentStatus; isClinical: boolean }> = ({ status }) => {
    const config: Record<PaymentStatus, { label: string; icon: typeof CheckCircle2; colors: string }> = {
        PAID: { label: 'Al Día', icon: CheckCircle2, colors: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
        PENDING: { label: 'Por Vencer', icon: Clock, colors: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
        OVERDUE: { label: 'Vencido / Mora', icon: AlertTriangle, colors: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
        FAILED: { label: 'Rechazado', icon: X, colors: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
    };
    const { label, icon: Icon, colors } = config[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${colors}`}>
            <Icon size={12} /> {label}
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════
// MODAL DE RECORDATORIO WHATSAPP RÁPIDO & EDITABLE
// ═══════════════════════════════════════════════════════════════
interface WhatsAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: FinanceClient | null;
    template: string;
    onMarkPaid: (clientId: string) => void;
    onSaveAsDefaultTemplate: (newTemplate: string) => void;
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ 
    isOpen, 
    onClose, 
    client, 
    template, 
    onMarkPaid,
    onSaveAsDefaultTemplate 
}) => {
    const [messageText, setMessageText] = useState('');
    const [isSavingDefault, setIsSavingDefault] = useState(false);

    useEffect(() => {
        if (client) {
            const interpolated = template
                .replace(/{nombre}/g, client.name)
                .replace(/{plan}/g, client.plan)
                .replace(/{monto}/g, `$${client.monthlyAmount.toLocaleString('es-AR')}`)
                .replace(/{link}/g, `https://bienestar.app/pay/${client.id}`)
                .replace(/{dias_mora}/g, `${client.daysOverdue}`);
            setMessageText(interpolated);
        }
    }, [client, template]);

    if (!isOpen || !client) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(messageText);
        toast.success('Mensaje copiado al portapapeles para WhatsApp', { icon: '📋' });
    };

    const handleOpenWhatsApp = () => {
        const encoded = encodeURIComponent(messageText);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
        toast.success('Abriendo WhatsApp...');
    };

    const handleSaveDefault = () => {
        // Build template from current text
        onSaveAsDefaultTemplate(messageText);
        toast.success('Plantilla de recordatorio guardada como predeterminada', { icon: '💾' });
        setIsSavingDefault(false);
    };

    const insertTag = (tag: string) => {
        setMessageText(prev => prev + ' ' + tag);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 my-8"
            >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black font-montserrat">Recordatorio por WhatsApp</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">Personaliza el mensaje para {client.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                        <span className="text-slate-500 dark:text-zinc-400">Plan:</span>
                        <span>{client.plan}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span className="text-slate-500 dark:text-zinc-400">Cuota Mensual:</span>
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm font-black">${client.monthlyAmount.toLocaleString('es-AR')}</span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            Mensaje para Enviar (Editable)
                        </label>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                            ✍️ Dale tu toque personal
                        </span>
                    </div>
                    <textarea
                        rows={5}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed resize-none focus:outline-none focus:border-emerald-500 font-medium"
                    />

                    {/* Chips de Inserción Rápida */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        <span className="text-[10px] text-slate-400 font-bold">Agregar:</span>
                        <button
                            type="button"
                            onClick={() => insertTag(`💪 ¡A seguir entrenando con todo!`)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-400 transition-colors"
                        >
                            + Cierre Motivacional
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTag(`Alias MP: ${client.name.split(' ')[0].toLowerCase()}.coach.fit`)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-400 transition-colors"
                        >
                            + Mi Alias
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTag(`(Podés abonar por Transferencia o Tarjeta)`)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-400 transition-colors"
                        >
                            + Formas de Pago
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                        <Copy size={14} /> Copiar Texto
                    </button>
                    <button
                        onClick={handleOpenWhatsApp}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                    >
                        <MessageCircle size={14} /> Enviar WhatsApp
                    </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                    <button
                        onClick={() => {
                            onMarkPaid(client.id);
                            toast.success(`Cuota de ${client.name} marcada como pagada.`);
                            onClose();
                        }}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                        <CheckCircle2 size={13} /> Ya me pagó (Marcar Al Día)
                    </button>

                    <button
                        onClick={handleSaveDefault}
                        className="font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 text-[11px]"
                        title="Guardar este texto como tu plantilla habitual"
                    >
                        <Sliders size={12} /> Guardar como mi plantilla
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MODAL DE COMPARTIR PLAN POR WHATSAPP (EDITABLE)
// ═══════════════════════════════════════════════════════════════
interface WhatsAppPlanShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: CommercialPlan | null;
    template: string;
    onSaveAsDefaultTemplate: (newTemplate: string) => void;
}

const WhatsAppPlanShareModal: React.FC<WhatsAppPlanShareModalProps> = ({
    isOpen,
    onClose,
    plan,
    template,
    onSaveAsDefaultTemplate
}) => {
    const [messageText, setMessageText] = useState('');

    useEffect(() => {
        if (plan) {
            const featuresText = plan.features.slice(0, 4).map(f => `• ${f}`).join('\n');
            const interpolated = template
                .replace(/{nombre_plan}/g, plan.name)
                .replace(/{precio}/g, `$${plan.price.toLocaleString('es-AR')}`)
                .replace(/{duracion}/g, plan.durationText ? ` - ${plan.durationText}` : '')
                .replace(/{descripcion}/g, plan.description)
                .replace(/{beneficios}/g, featuresText)
                .replace(/{link}/g, `https://bienestar.app/pay/${plan.id}`);
            setMessageText(interpolated);
        }
    }, [plan, template]);

    if (!isOpen || !plan) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(messageText);
        toast.success('Propuesta copiada al portapapeles para WhatsApp', { icon: '📋' });
    };

    const handleOpenWhatsApp = () => {
        const encoded = encodeURIComponent(messageText);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
        toast.success('Abriendo WhatsApp...');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 my-8"
            >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black font-montserrat">Compartir Plan por WhatsApp</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">{plan.name} (${plan.price.toLocaleString('es-AR')})</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                        Mensaje de Propuesta Comercial (Editable)
                    </label>
                    <textarea
                        rows={7}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed resize-none focus:outline-none focus:border-emerald-500 font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                        <Copy size={14} /> Copiar Texto
                    </button>
                    <button
                        onClick={handleOpenWhatsApp}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                    >
                        <MessageCircle size={14} /> Enviar WhatsApp
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MODAL DE CONFIGURACIÓN MAESTRA DE PLANTILLAS WHATSAPP
// ═══════════════════════════════════════════════════════════════
interface WhatsAppSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: WhatsAppTemplates;
    onSave: (templates: WhatsAppTemplates) => void;
    onReset: () => void;
}

const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({
    isOpen,
    onClose,
    templates,
    onSave,
    onReset
}) => {
    const [selectedTab, setSelectedTab] = useState<'REMINDER' | 'PLAN' | 'THANKS'>('REMINDER');
    const [reminderText, setReminderText] = useState(templates.paymentReminder);
    const [planText, setPlanText] = useState(templates.planShare);
    const [thanksText, setThanksText] = useState(templates.paymentThanks);

    useEffect(() => {
        setReminderText(templates.paymentReminder);
        setPlanText(templates.planShare);
        setThanksText(templates.paymentThanks);
    }, [templates]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            paymentReminder: reminderText,
            planShare: planText,
            paymentThanks: thanksText
        });
        toast.success('Plantillas de WhatsApp guardadas con éxito', { icon: '💬' });
        onClose();
    };

    const handleApplyTone = (tone: 'FRIENDLY' | 'DIRECT' | 'MOTIVATIONAL') => {
        if (selectedTab === 'REMINDER') {
            if (tone === 'FRIENDLY') {
                setReminderText(`¡Hola {nombre}! 😊 ¿Cómo estás? Te dejamos el recordatorio de la cuota mensual de tu {plan} (${'{monto}'}). ¡A seguir entrenando con todo! Link de pago: {link}`);
            } else if (tone === 'DIRECT') {
                setReminderText(`Hola {nombre}. Te enviamos el recordatorio de vencimiento de tu cuota de {plan} (${'{monto}'}). Podés realizar el pago en el siguiente link: {link}. Saludos.`);
            } else {
                setReminderText(`¡Vamos {nombre}! 🔥 Te dejamos el link para renovar tu {plan} (${'{monto}'}) y seguir rompiendo tus marcas este mes 💪 Link: {link}`);
            }
            toast.success('Tono aplicado al recordatorio');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 my-8"
            >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Settings size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black font-montserrat">Configurar Mensajes de WhatsApp</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">Personaliza los textos automáticos con tu propio estilo y firma.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sub-tabs de Plantillas */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-xs">
                    <button
                        type="button"
                        onClick={() => setSelectedTab('REMINDER')}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                            selectedTab === 'REMINDER'
                                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-600 dark:text-zinc-400'
                        }`}
                    >
                        💰 Recordatorio de Cuota
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('PLAN')}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                            selectedTab === 'PLAN'
                                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-600 dark:text-zinc-400'
                        }`}
                    >
                        🏷️ Propuesta Comercial
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('THANKS')}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                            selectedTab === 'THANKS'
                                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-600 dark:text-zinc-400'
                        }`}
                    >
                        💖 Agradecimiento
                    </button>
                </div>

                {/* Tono Rápido */}
                {selectedTab === 'REMINDER' && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400">Tono sugerido:</span>
                        <button
                            type="button"
                            onClick={() => handleApplyTone('FRIENDLY')}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors"
                        >
                            😊 Cálido y Cercano
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyTone('DIRECT')}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors"
                        >
                            📋 Directo y Formal
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyTone('MOTIVATIONAL')}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors"
                        >
                            🔥 Motivacional & Fitness
                        </button>
                    </div>
                )}

                {/* Editor del Template Activo */}
                <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                        Texto de la Plantilla
                    </label>
                    {selectedTab === 'REMINDER' && (
                        <>
                            <textarea
                                rows={5}
                                value={reminderText}
                                onChange={(e) => setReminderText(e.target.value)}
                                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                Variables disponibles: <code className="text-indigo-500">{`{nombre}`}</code>, <code className="text-indigo-500">{`{plan}`}</code>, <code className="text-indigo-500">{`{monto}`}</code>, <code className="text-indigo-500">{`{link}`}</code>
                            </p>
                        </>
                    )}

                    {selectedTab === 'PLAN' && (
                        <>
                            <textarea
                                rows={6}
                                value={planText}
                                onChange={(e) => setPlanText(e.target.value)}
                                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                Variables disponibles: <code className="text-indigo-500">{`{nombre_plan}`}</code>, <code className="text-indigo-500">{`{precio}`}</code>, <code className="text-indigo-500">{`{duracion}`}</code>, <code className="text-indigo-500">{`{descripcion}`}</code>, <code className="text-indigo-500">{`{beneficios}`}</code>, <code className="text-indigo-500">{`{link}`}</code>
                            </p>
                        </>
                    )}

                    {selectedTab === 'THANKS' && (
                        <>
                            <textarea
                                rows={4}
                                value={thanksText}
                                onChange={(e) => setThanksText(e.target.value)}
                                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white leading-relaxed resize-none focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                Variables disponibles: <code className="text-indigo-500">{`{nombre}`}</code>, <code className="text-indigo-500">{`{plan}`}</code>, <code className="text-indigo-500">{`{monto}`}</code>
                            </p>
                        </>
                    )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => {
                            onReset();
                            setReminderText(DEFAULT_WHATSAPP_TEMPLATES.paymentReminder);
                            setPlanText(DEFAULT_WHATSAPP_TEMPLATES.planShare);
                            setThanksText(DEFAULT_WHATSAPP_TEMPLATES.paymentThanks);
                            toast.success('Plantillas restauradas a los valores de fábrica');
                        }}
                        className="text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    >
                        <RotateCcw size={13} /> Restaurar Originales
                    </button>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                        >
                            Guardar Plantillas
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MODAL DE CREAR / EDITAR PLAN COMERCIAL
// ═══════════════════════════════════════════════════════════════
interface CreateEditPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingPlan: CommercialPlan | null;
    onSave: (plan: Omit<CommercialPlan, 'id' | 'activeSubscribersCount'>) => void;
}

const CreateEditPlanModal: React.FC<CreateEditPlanModalProps> = ({ isOpen, onClose, editingPlan, onSave }) => {
    const [name, setName] = useState(editingPlan?.name || '');
    const [category, setCategory] = useState<PlanCategory>(editingPlan?.category || 'RECURRING');
    const [tier, setTier] = useState<PlanTier>(editingPlan?.tier || 'PRO');
    const [price, setPrice] = useState(editingPlan?.price || 45000);
    const [frequency, setFrequency] = useState<BillingFrequency>(editingPlan?.frequency || 'MONTHLY');
    const [durationText, setDurationText] = useState(editingPlan?.durationText || 'Mensual recurrente');
    const [description, setDescription] = useState(editingPlan?.description || '');
    const [badge, setBadge] = useState(editingPlan?.badge || '');
    const [featuresText, setFeaturesText] = useState(editingPlan?.features?.join('\n') || 'Acceso a App Móvil\nRutina personalizada por Ciclos\nPauta Nutricional & Macros\nSoporte por WhatsApp');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Ingresa un nombre para el plan');
            return;
        }

        const featuresArray = featuresText
            .split('\n')
            .map(f => f.trim())
            .filter(f => f.length > 0);

        onSave({
            name,
            category,
            tier,
            price: Number(price),
            currency: 'ARS',
            frequency,
            durationText,
            description,
            badge: badge.trim() || undefined,
            features: featuresArray,
            isActive: true
        });

        toast.success(editingPlan ? 'Plan actualizado con éxito' : 'Nuevo plan creado con éxito');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 my-8"
            >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Tag size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black font-montserrat">
                                {editingPlan ? 'Editar Plan / Servicio' : 'Crear Nuevo Plan / Servicio'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Estandariza tarifas, duración y qué incluye para tus alumnos.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Nombre del Plan */}
                    <div>
                        <label className="block font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                            Nombre del Plan / Oferta Comercial
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej. Plan Pro Élite, Pack 6 Meses, Asesoría ISAK..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Categoría y Nivel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                                Formato Comercial
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as PlanCategory)}
                                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="RECURRING">🔄 Membresía Mensual Recurrente</option>
                                <option value="PACK">📦 Pack (3 o 6 Meses)</option>
                                <option value="ONE_OFF">⚡ Rutina Suelta / Pago Único</option>
                                <option value="ADVISORY">🩺 Asesoría 1 a 1 / Consulta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                                Nivel de Servicio (Tier)
                            </label>
                            <select
                                value={tier}
                                onChange={(e) => setTier(e.target.value as PlanTier)}
                                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="PRO">PRO (Servicio Integral con Video & Ajustes)</option>
                                <option value="PREMIUM">PREMIUM (Entrenamiento + Nutrición)</option>
                                <option value="BASIC">BASIC (Solo Rutina en App)</option>
                                <option value="CUSTOM">CUSTOM (Personalizado / Asesoría)</option>
                            </select>
                        </div>
                    </div>

                    {/* Precio y Duración */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                                Precio Total ($ ARS)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="1000"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="w-full pl-8 pr-3 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                                Texto de Duración / Frecuencia
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. Mensual, Pack 6 Meses, Por Sesión..."
                                value={durationText}
                                onChange={(e) => setDurationText(e.target.value)}
                                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Etiqueta Destacada */}
                    <div>
                        <label className="block font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                            Distintivo Opcional (Badge)
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. Más Vendido 🔥, Ahorro 25% 💎, Recomendado ⭐..."
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                            Descripción Breve del Servicio
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Explica en 1 o 2 líneas para quién es ideal este plan..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Beneficios Incluidos */}
                    <div>
                        <label className="block font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                            ¿Qué incluye? (1 beneficio por línea)
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Acceso a la App móvil&#10;Rutina personalizada por Ciclos&#10;Pauta Nutricional & Macros&#10;Soporte WhatsApp"
                            value={featuresText}
                            onChange={(e) => setFeaturesText(e.target.value)}
                            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-900 dark:text-white resize-none focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                        >
                            {editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION HERO BANNER (SUGERENCIAS Y ALERTAS SUPERIORES)
// ═══════════════════════════════════════════════════════════════
const TopSuggestionsBanner: React.FC<{
    alertsCount: number;
    totalOverdue: number;
    onViewOverdue: () => void;
}> = ({ alertsCount, totalOverdue, onViewOverdue }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/20 shadow-sm relative overflow-hidden text-slate-900 dark:text-zinc-100"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0 mt-0.5">
                            <Lightbulb size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                                    💡 Sugerencia Financiera
                                </span>
                                {alertsCount > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <AlertTriangle size={11} /> {alertsCount} Cobro{alertsCount > 1 ? 's' : ''} pendiente{alertsCount > 1 ? 's' : ''} (${totalOverdue.toLocaleString('es-AR')})
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                                {alertsCount > 0 
                                    ? `Recuperación de Cuotas: Tienes $${totalOverdue.toLocaleString('es-AR')} en cobros pendientes`
                                    : '¡Excelente gestión! 100% de tus alumnos están al día con su cuota'}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                                {alertsCount > 0
                                    ? 'Un recordatorio cordial por WhatsApp suele regularizar el 90% de los pagos el mismo día. Haz clic en "Recordar WhatsApp" en cada alumno para enviar el link de cobro en 1 toque.'
                                    : 'Tu retención de cuotas este mes es del 88%. Hay 3 alumnos con planes Básicos con alta constancia ideales para ofrecerles un upgrade al Plan Pro.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {alertsCount > 0 && (
                            <button
                                onClick={onViewOverdue}
                                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                            >
                                <Users size={14} />
                                <span>Ver Pendientes</span>
                            </button>
                        )}
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 transition-colors"
                            title="Ocultar sugerencia"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export const FinanceDashboardView: React.FC = () => {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    useFinanceSync();

    const { 
        clients, 
        revenueHistory, 
        plans, 
        whatsappTemplates,
        getMetrics, 
        getOverdueClients, 
        getClientsByTier, 
        markClientPaid, 
        sendPaymentReminder,
        addPlan,
        updatePlan,
        deletePlan,
        togglePlanActive,
        updateWhatsAppTemplates,
        resetWhatsAppTemplates
    } = useFinanceStore();

    const metrics = getMetrics();
    const overdueClients = getOverdueClients();
    const tierBreakdown = getClientsByTier();

    const [mainTab, setMainTab] = useState<'OVERVIEW' | 'CATALOG'>('OVERVIEW');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING_OVERDUE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClientForWhatsApp, setSelectedClientForWhatsApp] = useState<FinanceClient | null>(null);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [chartTimeframe, setChartTimeframe] = useState<'6M' | '12M'>('12M');

    // Estado para catálogo de planes y personalización de mensajes
    const [planCategoryFilter, setPlanCategoryFilter] = useState<'ALL' | PlanCategory>('ALL');
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<CommercialPlan | null>(null);
    const [selectedPlanForWhatsApp, setSelectedPlanForWhatsApp] = useState<CommercialPlan | null>(null);
    const [isWhatsAppPlanModalOpen, setIsWhatsAppPlanModalOpen] = useState(false);
    const [isWhatsAppSettingsOpen, setIsWhatsAppSettingsOpen] = useState(false);

    const handleNavigate = (path: string) => {
        if (!(document as any).startViewTransition) {
            navigate(path);
            return;
        }
        (document as any).startViewTransition(() => {
            navigate(path);
        });
    };

    // Filter chart data based on selected timeframe
    const filteredHistory = chartTimeframe === '6M' ? revenueHistory.slice(-6) : revenueHistory;
    const chartData = filteredHistory.map(r => ({ month: r.month, revenue: r.revenue }));

    // Filter table clients
    const filteredClients = clients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.plan.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (statusFilter === 'PAID') return c.status === 'PAID';
        if (statusFilter === 'PENDING_OVERDUE') return c.status === 'OVERDUE' || c.status === 'PENDING' || c.status === 'FAILED';
        return true;
    });

    const paidCount = clients.filter(c => c.status === 'PAID').length;
    const pendingCount = clients.filter(c => c.status !== 'PAID').length;

    // Filter commercial plans
    const filteredPlans = plans.filter(p => {
        if (planCategoryFilter === 'ALL') return true;
        return p.category === planCategoryFilter;
    });

    const recurringPlansCount = plans.filter(p => p.category === 'RECURRING').length;
    const packPlansCount = plans.filter(p => p.category === 'PACK').length;
    const oneOffPlansCount = plans.filter(p => p.category === 'ONE_OFF').length;
    const advisoryPlansCount = plans.filter(p => p.category === 'ADVISORY').length;

    // Share plan link
    const handleSharePlanWhatsApp = (plan: CommercialPlan) => {
        setSelectedPlanForWhatsApp(plan);
        setIsWhatsAppPlanModalOpen(true);
    };

    const handleCopyPlanLink = (planId: string) => {
        const link = `https://bienestar.app/pay/${planId}`;
        navigator.clipboard.writeText(link);
        toast.success('Link de pago copiado al portapapeles', { icon: '🔗' });
    };

    const handleViewOverdue = () => {
        setMainTab('OVERVIEW');
        setStatusFilter('PENDING_OVERDUE');
        setTimeout(() => {
            const table = document.getElementById('tabla-alumnos');
            if (table) {
                table.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 80);
    };

    return (
        <main aria-label="Finance Command Center" className="min-h-screen p-4 sm:p-8 md:p-10 font-lato bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative overflow-y-auto">
            {/* Header Principal */}
            <header className="max-w-6xl mx-auto mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5">
                        <button
                            onClick={() => handleNavigate('/trainer')}
                            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                            aria-label="Volver al panel principal"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                                    FINANZAS & COBROS
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/40">
                                    Coach Pro
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                                Control de cuotas mensuales, cobranzas por WhatsApp y estandarización de tus planes y servicios.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Recaudación Mensual</span>
                            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-montserrat">
                                ${metrics.mrr.toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    SWITCHER DE PESTAÑAS PRINCIPAL: RESUMEN vs CATÁLOGO DE PLANES
                   ═══════════════════════════════════════════════════════════════ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setMainTab('OVERVIEW')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                                mainTab === 'OVERVIEW'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            <BarChart3 size={15} />
                            <span>Resumen & Cobranzas</span>
                        </button>

                        <button
                            onClick={() => setMainTab('CATALOG')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                                mainTab === 'CATALOG'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            <Tag size={15} />
                            <span>Catálogo de Planes & Precios</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                mainTab === 'CATALOG' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                            }`}>
                                {plans.length}
                            </span>
                        </button>
                    </div>

                    {/* Botón Maestro para Personalizar Mensajes de WhatsApp */}
                    <button
                        onClick={() => setIsWhatsAppSettingsOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
                        title="Personalizar mensajes automáticos de WhatsApp con tu estilo propio"
                    >
                        <MessageCircle size={15} className="text-emerald-500" />
                        <span>Personalizar Mensajes WhatsApp</span>
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto space-y-6">
                {mainTab === 'OVERVIEW' ? (
                    <>
                        {/* ═══════════════════════════════════════════════════════════════
                            1. MODO NOTIFICACIÓN: SUGERENCIAS & ALERTAS ARRIBA
                           ═══════════════════════════════════════════════════════════════ */}
                        <TopSuggestionsBanner
                            alertsCount={metrics.overdueCount}
                            totalOverdue={metrics.totalOverdue}
                            onViewOverdue={handleViewOverdue}
                        />

                        {/* ═══════════════════════════════════════════════════════════════
                            2. STRIP DE 4 KPIS PEDAGÓGICOS & AMIGABLES
                           ═══════════════════════════════════════════════════════════════ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* KPI 1: Ingreso del Mes */}
                            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        💰 Recaudación Mensual
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                        <ArrowUpRight size={12} /> +11.7%
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black font-montserrat text-slate-900 dark:text-white">
                                    ${metrics.mrr.toLocaleString('es-AR')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                    Suma de cuotas abonadas en el mes
                                </p>
                            </div>

                            {/* KPI 2: Alumnos al Día */}
                            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        👥 Alumnos al Día
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                        {metrics.retentionRate}% Retención
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black font-montserrat text-slate-900 dark:text-white">
                                    {paidCount} de {clients.length} Alumnos
                                </h3>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                    {paidCount} cuotas cobradas con éxito
                                </p>
                            </div>

                            {/* KPI 3: Cobros Pendientes (Clickable to Filter & Scroll) */}
                            <div 
                                onClick={handleViewOverdue}
                                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-300 dark:hover:border-rose-800/80 transition-all group"
                                title="Hacer clic para ver el desglose de cuotas pendientes"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        ⏳ Cobros Pendientes
                                    </span>
                                    {pendingCount > 0 ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                            {pendingCount} por cobrar
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                                            Al Día
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-black font-montserrat text-rose-600 dark:text-rose-400">
                                    ${metrics.totalOverdue.toLocaleString('es-AR')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center justify-between">
                                    <span>{pendingCount} cuotas para enviar recordatorio</span>
                                    <ArrowDownRight size={14} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                            </div>

                            {/* KPI 4: Cuota Promedio */}
                            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        💎 Cuota Promedio
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                        Plan Pro Top
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black font-montserrat text-slate-900 dark:text-white">
                                    ${metrics.averageTicket.toLocaleString('es-AR')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                    Valor promedio mensual por alumno
                                </p>
                            </div>
                        </div>

                        {/* ═══════════════════════════════════════════════════════════════
                            3. GRÁFICO DE EVOLUCIÓN & DISTRIBUCIÓN DE PLANES
                           ═══════════════════════════════════════════════════════════════ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Gráfico Principal */}
                            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                    <div>
                                        <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-2">
                                            <TrendingUp size={18} className="text-indigo-500" />
                                            Evolución de Ingresos Mensuales
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                                            Crecimiento sostenido de recaudación en los últimos meses.
                                        </p>
                                    </div>

                                    {/* Selector de Rango */}
                                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 self-start sm:self-auto">
                                        <button
                                            onClick={() => setChartTimeframe('6M')}
                                            className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                                                chartTimeframe === '6M'
                                                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            6 Meses
                                        </button>
                                        <button
                                            onClick={() => setChartTimeframe('12M')}
                                            className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                                                chartTimeframe === '12M'
                                                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            Año Completo
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[280px] w-full relative">
                                    <Suspense fallback={<ChartSkeleton />}>
                                        <LazyFinanceChart data={chartData} isClinical={isClinical} />
                                    </Suspense>
                                </div>
                            </div>

                            {/* Distribución de Planes */}
                            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-2">
                                            <PieChart size={18} className="text-purple-500" />
                                            Distribución de Planes
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
                                        Preferencia de membresías contratadas por tu comunidad.
                                    </p>

                                    <div className="space-y-4">
                                        {[
                                            { tier: 'PRO' as const, label: 'Plan Pro ($42k-$45k)', barColor: 'bg-indigo-500' },
                                            { tier: 'PREMIUM' as const, label: 'Plan Premium ($35k-$38k)', barColor: 'bg-purple-500' },
                                            { tier: 'BASIC' as const, label: 'Plan Basic ($28k)', barColor: 'bg-emerald-500' },
                                            { tier: 'CUSTOM' as const, label: 'Personalizado ($55k+)', barColor: 'bg-amber-500' },
                                        ].map(({ tier, label, barColor }) => {
                                            const count = tierBreakdown[tier] || 0;
                                            const pct = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;
                                            return (
                                                <div key={tier}>
                                                    <div className="flex justify-between items-center text-xs mb-1">
                                                        <span className="font-bold text-slate-700 dark:text-zinc-300">{label}</span>
                                                        <span className="font-black text-slate-900 dark:text-white">{count} ({pct}%)</span>
                                                    </div>
                                                    <div className="h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                                                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-zinc-400 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                                        <span>{plans.length} planes configurados.</span>
                                    </div>
                                    <button
                                        onClick={() => setMainTab('CATALOG')}
                                        className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        Ver Catálogo <ArrowUpRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════════════════════════════════════════════════════
                            4. TABLA DETALLADA: DESGLOSE DE ALUMNOS & COBROS
                           ═══════════════════════════════════════════════════════════════ */}
                        <div id="tabla-alumnos" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5 scroll-mt-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users size={18} className="text-indigo-500" />
                                        Desglose de Alumnos & Cuotas
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                                        Toca en el nombre del alumno para abrir su ficha completa. Envía recordatorios por WhatsApp en 1 toque.
                                    </p>
                                </div>

                                {/* Filtros y Buscador */}
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {/* Buscador */}
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar alumno o plan..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
                                        />
                                    </div>

                                    {/* Pestañas de Estado */}
                                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                                        <button
                                            onClick={() => setStatusFilter('ALL')}
                                            className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                                                statusFilter === 'ALL'
                                                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                    : 'text-slate-500 dark:text-zinc-400'
                                            }`}
                                        >
                                            Todos ({clients.length})
                                        </button>
                                        <button
                                            onClick={() => setStatusFilter('PAID')}
                                            className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                                                statusFilter === 'PAID'
                                                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                    : 'text-slate-500 dark:text-zinc-400'
                                            }`}
                                        >
                                            Al Día ({paidCount})
                                        </button>
                                        <button
                                            onClick={() => setStatusFilter('PENDING_OVERDUE')}
                                            className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                                                statusFilter === 'PENDING_OVERDUE'
                                                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                                                    : 'text-slate-500 dark:text-zinc-400'
                                            }`}
                                        >
                                            Pendientes ({pendingCount})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left" aria-label="Tabla de alumnos y finanzas">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-zinc-800 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 select-none">
                                            <th className="pb-3 pl-2">Alumno</th>
                                            <th className="pb-3">Plan de Entrenamiento</th>
                                            <th className="pb-3">Cuota Mensual</th>
                                            <th className="pb-3 text-center">Último Pago / Vencimiento</th>
                                            <th className="pb-3 text-center">Estado</th>
                                            <th className="pb-3 text-right pr-2">Acción Rápida</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {filteredClients.map((client) => (
                                            <tr key={client.id} className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                                {/* Alumno con Redirección a Perfil */}
                                                <td className="py-3.5 pl-2">
                                                    <button
                                                        onClick={() => handleNavigate(`/trainer/athlete/${client.id}`)}
                                                        className="flex items-center gap-2.5 text-left group/user cursor-pointer transition-transform hover:translate-x-0.5"
                                                        title="Toca para abrir el perfil completo del alumno"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center group-hover/user:ring-2 group-hover/user:ring-indigo-500 transition-all">
                                                            {client.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover/user:text-indigo-600 dark:group-hover/user:text-indigo-400 group-hover/user:underline transition-colors flex items-center gap-1">
                                                                {client.name}
                                                                <ArrowUpRight size={13} className="opacity-0 group-hover/user:opacity-100 text-indigo-500 transition-opacity" />
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">{client.email || 'Alumno activo'}</p>
                                                        </div>
                                                    </button>
                                                </td>

                                                {/* Plan */}
                                                <td className="py-3.5">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                                                        {client.plan}
                                                    </span>
                                                </td>

                                                {/* Cuota */}
                                                <td className="py-3.5">
                                                    <span className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                                                        ${client.monthlyAmount.toLocaleString('es-AR')}
                                                    </span>
                                                </td>

                                                {/* Fecha / Vencimiento */}
                                                <td className="py-3.5 text-center">
                                                    {client.status === 'OVERDUE' ? (
                                                        <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                                                            {client.daysOverdue} días de mora
                                                        </span>
                                                    ) : client.status === 'PENDING' ? (
                                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                                                            Vence pronto ({client.daysOverdue}d)
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                                                            Abonado el {client.lastPaymentDate || '01/08/2026'}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Estado */}
                                                <td className="py-3.5 text-center">
                                                    <StatusBadge status={client.status} isClinical={isClinical} />
                                                </td>

                                                {/* Acciones */}
                                                <td className="py-3.5 text-right pr-2">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {client.status !== 'PAID' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedClientForWhatsApp(client);
                                                                    setIsWhatsAppModalOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all active:scale-95"
                                                                title="Enviar recordatorio por WhatsApp"
                                                            >
                                                                <MessageCircle size={13} />
                                                                <span>Recordar WhatsApp</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pr-2">
                                                                <CheckCircle2 size={14} /> Al Día
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* ═══════════════════════════════════════════════════════════════
                        CATÁLOGO DE PLANES & OFERTAS COMERCIALES (CONFIGURADOR)
                       ═══════════════════════════════════════════════════════════════ */
                    <div className="space-y-6">
                        {/* Banner Pedagógico de Catálogo */}
                        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
                                    <Tag size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                                            🏷️ Estandarización de Oferta
                                        </span>
                                    </div>
                                    <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                                        Tus Planes, Packs y Asesorías Estandarizadas
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                                        Define tus tarifas oficiales para membresías mensuales, packs de transformación (3 o 6 meses), rutinas sueltas o consultas 1 a 1. Podés compartir el link de pago directo por WhatsApp a tus prospectos.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setEditingPlan(null);
                                    setIsPlanModalOpen(true);
                                }}
                                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
                            >
                                <Plus size={16} />
                                <span>Crear Nuevo Plan</span>
                            </button>
                        </div>

                        {/* Filtros por Formato Comercial */}
                        <div className="flex flex-wrap items-center gap-2 pb-2">
                            <button
                                onClick={() => setPlanCategoryFilter('ALL')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                                    planCategoryFilter === 'ALL'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                Todos ({plans.length})
                            </button>
                            <button
                                onClick={() => setPlanCategoryFilter('RECURRING')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                                    planCategoryFilter === 'RECURRING'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                🔄 Membresías Mensuales ({recurringPlansCount})
                            </button>
                            <button
                                onClick={() => setPlanCategoryFilter('PACK')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                                    planCategoryFilter === 'PACK'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                📦 Packs 3 y 6 Meses ({packPlansCount})
                            </button>
                            <button
                                onClick={() => setPlanCategoryFilter('ONE_OFF')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                                    planCategoryFilter === 'ONE_OFF'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                ⚡ Rutinas Sueltas ({oneOffPlansCount})
                            </button>
                            <button
                                onClick={() => setPlanCategoryFilter('ADVISORY')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                                    planCategoryFilter === 'ADVISORY'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                🩺 Asesorías 1 a 1 ({advisoryPlansCount})
                            </button>
                        </div>

                        {/* Grid de Planes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
                                >
                                    {/* Top Badges */}
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-black uppercase tracking-wider">
                                                {plan.category === 'RECURRING' && '🔄 Mensual Recurrente'}
                                                {plan.category === 'PACK' && '📦 Pack Fidelización'}
                                                {plan.category === 'ONE_OFF' && '⚡ Rutina Suelta'}
                                                {plan.category === 'ADVISORY' && '🩺 Asesoría 1 a 1'}
                                            </span>

                                            {plan.badge && (
                                                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                                                    {plan.badge}
                                                </span>
                                            )}
                                        </div>

                                        {/* Título y Precio */}
                                        <h4 className="text-lg font-black font-montserrat text-slate-900 dark:text-white mb-1">
                                            {plan.name}
                                        </h4>
                                        <div className="flex items-baseline gap-1.5 mb-2">
                                            <span className="text-3xl font-black font-montserrat text-indigo-600 dark:text-indigo-400">
                                                ${plan.price.toLocaleString('es-AR')}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">
                                                {plan.durationText ? `/ ${plan.durationText}` : ''}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4 leading-relaxed line-clamp-2">
                                            {plan.description}
                                        </p>

                                        {/* Checklist de Beneficios */}
                                        <div className="space-y-2 py-3 border-t border-b border-slate-100 dark:border-zinc-800/80 mb-4">
                                            {plan.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-zinc-300">
                                                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer con Acciones de Venta */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span className="font-bold flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                                                <Users size={13} /> {plan.activeSubscribersCount} alumnos activos
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditingPlan(plan);
                                                    setIsPlanModalOpen(true);
                                                }}
                                                className="hover:text-indigo-600 dark:hover:text-indigo-400 font-bold flex items-center gap-1 transition-colors"
                                            >
                                                <Edit3 size={12} /> Editar
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleCopyPlanLink(plan.id)}
                                                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Copy size={13} /> Copiar Link
                                            </button>
                                            <button
                                                onClick={() => handleSharePlanWhatsApp(plan)}
                                                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                                            >
                                                <MessageCircle size={13} /> WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Recordatorio por WhatsApp */}
            <WhatsAppModal
                isOpen={isWhatsAppModalOpen}
                onClose={() => setIsWhatsAppModalOpen(false)}
                client={selectedClientForWhatsApp}
                template={whatsappTemplates.paymentReminder}
                onMarkPaid={(id) => markClientPaid(id)}
                onSaveAsDefaultTemplate={(newTemplate) => updateWhatsAppTemplates({ paymentReminder: newTemplate })}
            />

            {/* Modal de Compartir Plan por WhatsApp */}
            <WhatsAppPlanShareModal
                isOpen={isWhatsAppPlanModalOpen}
                onClose={() => {
                    setIsWhatsAppPlanModalOpen(false);
                    setSelectedPlanForWhatsApp(null);
                }}
                plan={selectedPlanForWhatsApp}
                template={whatsappTemplates.planShare}
                onSaveAsDefaultTemplate={(newTemplate) => updateWhatsAppTemplates({ planShare: newTemplate })}
            />

            {/* Modal Maestro de Configuración de Plantillas WhatsApp */}
            <WhatsAppSettingsModal
                isOpen={isWhatsAppSettingsOpen}
                onClose={() => setIsWhatsAppSettingsOpen(false)}
                templates={whatsappTemplates}
                onSave={(newTemplates) => updateWhatsAppTemplates(newTemplates)}
                onReset={() => resetWhatsAppTemplates()}
            />

            {/* Modal de Crear / Editar Plan */}
            <CreateEditPlanModal
                isOpen={isPlanModalOpen}
                onClose={() => {
                    setIsPlanModalOpen(false);
                    setEditingPlan(null);
                }}
                editingPlan={editingPlan}
                onSave={(planData) => {
                    if (editingPlan) {
                        updatePlan(editingPlan.id, planData);
                    } else {
                        addPlan(planData);
                    }
                }}
            />
        </main>
    );
};


