import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ═══════════════════════════════════════════════════════════════
// TIPOS CORE — Módulo de Finanzas del Entrenador
// ═══════════════════════════════════════════════════════════════

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'FAILED';
export type PlanTier = 'BASIC' | 'PREMIUM' | 'PRO' | 'CUSTOM';
export type PlanCategory = 'RECURRING' | 'PACK' | 'ONE_OFF' | 'ADVISORY';
export type BillingFrequency = 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'ANNUAL' | 'ONE_TIME' | 'PER_SESSION';

export interface CommercialPlan {
  id: string;
  name: string;
  category: PlanCategory;
  tier: PlanTier;
  price: number;
  currency: string;
  frequency: BillingFrequency;
  durationText: string;
  description: string;
  badge?: string;
  features: string[];
  activeSubscribersCount: number;
  isActive: boolean;
}

export interface WhatsAppTemplates {
  paymentReminder: string;
  planShare: string;
  paymentThanks: string;
}

export interface FinanceClient {
  id: string;
  name: string;
  plan: string;
  tier: PlanTier;
  monthlyAmount: number;
  status: PaymentStatus;
  lastPaymentDate: string | null;
  daysOverdue: number;
  enrolledDate: string;
  email?: string;
}

export interface MonthlyRevenue {
  month: string;       // "Ene", "Feb", etc.
  monthFull: string;   // "Enero 2026"
  revenue: number;
  clientCount: number;
}

export interface FinanceAlert {
  id: string;
  type: 'OVERDUE' | 'FAILED' | 'CHURN_RISK' | 'MILESTONE';
  clientId: string;
  clientName: string;
  message: string;
  amount: number;
  timestamp: string;
  dismissed: boolean;
}

export interface FinanceMetrics {
  mrr: number;
  mrrGrowthPct: number;
  activeSubscriptions: number;
  retentionRate: number;
  churnRate: number;
  averageTicket: number;
  projectedCLTV: number;
  totalOverdue: number;
  overdueCount: number;
}

// ═══════════════════════════════════════════════════════════════
// DATOS SEED REALISTAS — Entrenador boutique argentino
// ═══════════════════════════════════════════════════════════════

export const SEED_CLIENTS: FinanceClient[] = [];
export const SEED_REVENUE_HISTORY: MonthlyRevenue[] = [];

export const SEED_COMMERCIAL_PLANS: CommercialPlan[] = [
  {
    id: 'plan-pro-monthly',
    name: 'Plan Pro Élite (Mensual)',
    category: 'RECURRING',
    tier: 'PRO',
    price: 45000,
    currency: 'ARS',
    frequency: 'MONTHLY',
    durationText: 'Mensual recurrente',
    description: 'Acompañamiento integral de entrenamiento con corrección de técnica y ajuste continuo de cargas.',
    badge: 'Más Elegido ⭐',
    features: [
      'Acceso completo a la App móvil de entrenamientos',
      'Rutina personalizada por ciclos con videos de técnica en HD',
      'Pauta nutricional y equivalencias con Smart Swap',
      'Corrección semanal de técnica por video',
      'Ajuste inteligente de cargas y RPE',
      'Chat prioritario y soporte directo por WhatsApp'
    ],
    activeSubscribersCount: 5,
    isActive: true
  },
  {
    id: 'plan-premium-monthly',
    name: 'Plan Premium (Mensual)',
    category: 'RECURRING',
    tier: 'PREMIUM',
    price: 38000,
    currency: 'ARS',
    frequency: 'MONTHLY',
    durationText: 'Mensual recurrente',
    description: 'Entrenamiento personalizado y nutrición para atletas constantes que buscan resultados medibles.',
    badge: 'Recomendado 🔥',
    features: [
      'Acceso a la App móvil de entrenamientos',
      'Rutina personalizada por ciclos adaptada al gimnasio o casa',
      'Pauta nutricional por fases con Smart Swap',
      'Seguimiento diario de hábitos y descanso',
      'Soporte y feedback quincenal'
    ],
    activeSubscribersCount: 2,
    isActive: true
  },
  {
    id: 'plan-basic-monthly',
    name: 'Plan Basic (Mensual)',
    category: 'RECURRING',
    tier: 'BASIC',
    price: 28000,
    currency: 'ARS',
    frequency: 'MONTHLY',
    durationText: 'Mensual recurrente',
    description: 'Rutina en la App para quienes ya tienen experiencia y solo necesitan la planificación.',
    features: [
      'Acceso a la App móvil para registrar series y pesos',
      'Rutina estructurada por grupos musculares',
      'Seguimiento de marcas y progresión personal',
      'Videos guiados de ejecución biomecánica'
    ],
    activeSubscribersCount: 3,
    isActive: true
  },
  {
    id: 'pack-transform-6m',
    name: 'Pack Transformación 6 Meses',
    category: 'PACK',
    tier: 'PRO',
    price: 200000,
    currency: 'ARS',
    frequency: 'SEMESTER',
    durationText: 'Pack 6 Meses (Pago adelantado)',
    description: 'Programa semestral intensivo con ahorro del 25%. Máximo compromiso y transformación garantizada.',
    badge: 'Ahorro 25% 💎',
    features: [
      'Todo lo incluido en el Plan Pro Élite por 6 meses',
      'Equivale a $33.300/mes (Ahorrás $70.000)',
      '2 Evaluaciones antropométricas ISAK presenciales/online',
      'Planificación de mesociclos periódicos',
      'Congelamiento de 15 días por vacaciones'
    ],
    activeSubscribersCount: 2,
    isActive: true
  },
  {
    id: 'pack-quarterly-3m',
    name: 'Pack Trimestral (3 Meses)',
    category: 'PACK',
    tier: 'PREMIUM',
    price: 110000,
    currency: 'ARS',
    frequency: 'QUARTERLY',
    durationText: 'Pack 3 Meses (Pago adelantado)',
    description: 'Plan trimestral para consolidar hábitos y progreso físico con descuento especial.',
    badge: 'Ahorro 15% 🏷️',
    features: [
      'Todo lo incluido en el Plan Premium por 90 días',
      'Equivale a $36.600/mes (Ahorrás $24.000)',
      'Reajuste de rutina al finalizar el 1° mesociclo',
      'Pauta nutricional y recetario incluido'
    ],
    activeSubscribersCount: 1,
    isActive: true
  },
  {
    id: 'rutina-suelta-4s',
    name: 'Rutina Personalizada Suelta (4-6 Semanas)',
    category: 'ONE_OFF',
    tier: 'CUSTOM',
    price: 25000,
    currency: 'ARS',
    frequency: 'ONE_TIME',
    durationText: 'Pago Único (Acceso 45 días)',
    description: 'Plan de entrenamiento a medida entregado en la App sin suscripción mensual ni cobro recurrente.',
    badge: 'Pago Único ⚡',
    features: [
      'Rutina personalizada según equipamiento del alumno',
      'Acceso por 45 días a la App para registrar entrenamientos',
      'Videos guiados de técnica para todos los ejercicios',
      'Sin cuotas mensuales obligatorias'
    ],
    activeSubscribersCount: 4,
    isActive: true
  },
  {
    id: 'asesoria-isak-1a1',
    name: 'Asesoría 1 a 1 / Evaluación Antropométrica',
    category: 'ADVISORY',
    tier: 'CUSTOM',
    price: 18000,
    currency: 'ARS',
    frequency: 'PER_SESSION',
    durationText: 'Por Sesión (60 min)',
    description: 'Consulta presencial o por videollamada para valoración física, antropometría ISAK y diseño de objetivos.',
    badge: 'Presencial / Online 🩺',
    features: [
      'Sesión de 60 minutos 1 a 1 con el profesional',
      'Medición antropométrica ISAK (% grasa y masa muscular)',
      'Informe postural y biomecánico en PDF descargable',
      'Definición de metas y estrategia de entrenamiento',
      'Turno agendable directamente en el Calendario'
    ],
    activeSubscribersCount: 6,
    isActive: true
  }
];

function generateAlerts(clients: FinanceClient[]): FinanceAlert[] {
  const alerts: FinanceAlert[] = [];
  clients.forEach(c => {
    if (c.status === 'OVERDUE') {
      alerts.push({
        id: `alert-${c.id}-overdue`,
        type: 'OVERDUE',
        clientId: c.id,
        clientName: c.name,
        message: `${c.name} tiene ${c.daysOverdue} días de mora. Cuota pendiente: $${c.monthlyAmount.toLocaleString('es-AR')}`,
        amount: c.monthlyAmount,
        timestamp: new Date().toISOString(),
        dismissed: false,
      });
    }
    if (c.status === 'FAILED') {
      alerts.push({
        id: `alert-${c.id}-failed`,
        type: 'FAILED',
        clientId: c.id,
        clientName: c.name,
        message: `Pago rechazado de ${c.name}. Monto: $${c.monthlyAmount.toLocaleString('es-AR')}. Reintentar cobro.`,
        amount: c.monthlyAmount,
        timestamp: new Date().toISOString(),
        dismissed: false,
      });
    }
    if (c.status === 'PENDING' && c.daysOverdue > 0) {
      alerts.push({
        id: `alert-${c.id}-pending`,
        type: 'OVERDUE',
        clientId: c.id,
        clientName: c.name,
        message: `Cuota de ${c.name} por vencer o pendiente (${c.daysOverdue} días). Monto: $${c.monthlyAmount.toLocaleString('es-AR')}`,
        amount: c.monthlyAmount,
        timestamp: new Date().toISOString(),
        dismissed: false,
      });
    }
  });
  return alerts;
}

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplates = {
  paymentReminder: `Hola {nombre}! ¿Cómo estás? Te escribo del equipo de entrenamiento para enviarte el recordatorio de la cuota mensual de tu {plan} (${'{monto}'}). ¡A seguir entrenando con todo! 💪 Link de pago seguro: {link}`,
  planShare: `¡Hola! Te comparto la información de nuestro *{nombre_plan}* (${'{precio}'}{duracion}):\n\n{descripcion}\n\n*Incluye:*\n{beneficios}\n\nPodés inscribirte directamente en este link seguro: {link} 💪`,
  paymentThanks: `¡Muchas gracias {nombre}! Recibimos tu pago de ${'{monto}'} correspondiente a tu {plan}. ¡A seguir dando el máximo en cada entrenamiento! 🔥`
};

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

interface FinanceState {
  clients: FinanceClient[];
  revenueHistory: MonthlyRevenue[];
  alerts: FinanceAlert[];
  plans: CommercialPlan[];
  whatsappTemplates: WhatsAppTemplates;
}

interface FinanceActions {
  // Queries
  getMetrics: () => FinanceMetrics;
  getOverdueClients: () => FinanceClient[];
  getClientsByTier: () => Record<PlanTier, number>;

  // Actions
  markClientPaid: (clientId: string) => void;
  sendPaymentReminder: (clientId: string) => void;
  dismissAlert: (alertId: string) => void;
  addClient: (client: Omit<FinanceClient, 'id'>) => void;
  updateClientAmount: (clientId: string, newAmount: number) => void;
  refreshAlerts: () => void;

  // Commercial Plans Actions
  addPlan: (plan: Omit<CommercialPlan, 'id' | 'activeSubscribersCount'>) => void;
  updatePlan: (id: string, updates: Partial<CommercialPlan>) => void;
  deletePlan: (id: string) => void;
  togglePlanActive: (id: string) => void;

  // WhatsApp Templates Actions
  updateWhatsAppTemplates: (templates: Partial<WhatsAppTemplates>) => void;
  resetWhatsAppTemplates: () => void;

  // Cloud Sync
  setPlansFromServer: (plans: CommercialPlan[]) => void;
  setClientsFromServer: (clients: FinanceClient[]) => void;
}

export const useFinanceStore = create<FinanceState & FinanceActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        clients: SEED_CLIENTS,
        revenueHistory: SEED_REVENUE_HISTORY,
        alerts: generateAlerts(SEED_CLIENTS),
        plans: SEED_COMMERCIAL_PLANS,
        whatsappTemplates: DEFAULT_WHATSAPP_TEMPLATES,

        // ─── QUERIES ──────────────────────────────────────────
        getMetrics: () => {
          const { clients, revenueHistory } = get();
          const paidClients = clients.filter(c => c.status === 'PAID');
          const activeClients = clients.filter(c => c.status !== 'FAILED');
          const mrr = paidClients.reduce((sum, c) => sum + c.monthlyAmount, 0);
          const overdueClients = clients.filter(c => c.status === 'OVERDUE' || c.status === 'FAILED');
          const totalOverdue = overdueClients.reduce((sum, c) => sum + c.monthlyAmount, 0);
          const avgTicket = activeClients.length > 0 
            ? Math.round(activeClients.reduce((sum, c) => sum + c.monthlyAmount, 0) / activeClients.length) 
            : 0;
          
          const retentionRate = clients.length > 0 
            ? Math.round((paidClients.length / clients.length) * 100) 
            : 0;
          
          // MRR Growth from last 2 months
          const lastTwo = revenueHistory.slice(-2);
          const mrrGrowthPct = lastTwo.length === 2 && lastTwo[0].revenue > 0
            ? Math.round(((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) * 100 * 10) / 10
            : 0;

          // CLTV = Average Ticket × Average Lifespan (months)
          const avgLifespan = 8; // Estimated for boutique fitness
          const projectedCLTV = avgTicket * avgLifespan;

          return {
            mrr,
            mrrGrowthPct,
            activeSubscriptions: activeClients.length,
            retentionRate,
            churnRate: 100 - retentionRate,
            averageTicket: avgTicket,
            projectedCLTV,
            totalOverdue,
            overdueCount: overdueClients.length,
          };
        },

        getOverdueClients: () => {
          return get().clients.filter(c => c.status === 'OVERDUE' || c.status === 'FAILED' || (c.status === 'PENDING' && c.daysOverdue > 3));
        },

        getClientsByTier: () => {
          const clients = get().clients;
          return {
            BASIC: clients.filter(c => c.tier === 'BASIC').length,
            PREMIUM: clients.filter(c => c.tier === 'PREMIUM').length,
            PRO: clients.filter(c => c.tier === 'PRO').length,
            CUSTOM: clients.filter(c => c.tier === 'CUSTOM').length,
          };
        },

        // ─── ACTIONS ──────────────────────────────────────────
        markClientPaid: (clientId: string) => {
          set((state) => {
            const client = state.clients.find(c => c.id === clientId);
            if (client) {
              client.status = 'PAID';
              client.lastPaymentDate = new Date().toISOString().split('T')[0];
              client.daysOverdue = 0;
            }
          });
          // Refresh alerts after status change
          get().refreshAlerts();
        },

        sendPaymentReminder: (clientId: string) => {
          const client = get().clients.find(c => c.id === clientId);
          if (client) {
            // Telemetry event
            console.log('telemetry_event', {
              event: 'payment_reminder_sent',
              clientId,
              clientName: client.name,
              amount: client.monthlyAmount,
              daysOverdue: client.daysOverdue,
              timestamp: new Date().toISOString()
            });
          }
        },

        dismissAlert: (alertId: string) => {
          set((state) => {
            const alert = state.alerts.find(a => a.id === alertId);
            if (alert) alert.dismissed = true;
          });
        },

        addClient: (clientInput) => {
          set((state) => {
            state.clients.push({
              ...clientInput,
              id: `fc-${Date.now()}`,
            });
          });
        },

        updateClientAmount: (clientId: string, newAmount: number) => {
          set((state) => {
            const client = state.clients.find(c => c.id === clientId);
            if (client) client.monthlyAmount = newAmount;
          });
        },

        refreshAlerts: () => {
          set((state) => {
            state.alerts = generateAlerts(state.clients);
          });
        },

        // ─── COMMERCIAL PLANS ACTIONS ──────────────────────────
        addPlan: (planInput) => {
          set((state) => {
            state.plans.push({
              ...planInput,
              id: `plan-${Date.now()}`,
              activeSubscribersCount: 0,
            });
          });
        },

        updatePlan: (id, updates) => {
          set((state) => {
            const plan = state.plans.find(p => p.id === id);
            if (plan) {
              Object.assign(plan, updates);
            }
          });
        },

        deletePlan: (id) => {
          set((state) => {
            state.plans = state.plans.filter(p => p.id !== id);
          });
        },

        togglePlanActive: (id) => {
          set((state) => {
            const plan = state.plans.find(p => p.id === id);
            if (plan) {
              plan.isActive = !plan.isActive;
            }
          });
        },

        // ─── WHATSAPP TEMPLATES ACTIONS ────────────────────────
        updateWhatsAppTemplates: (templates) => {
          set((state) => {
            state.whatsappTemplates = {
              ...state.whatsappTemplates,
              ...templates,
            };
          });
        },

        resetWhatsAppTemplates: () => {
          set((state) => {
            state.whatsappTemplates = DEFAULT_WHATSAPP_TEMPLATES;
          });
        },

        // ─── CLOUD SYNC ACTIONS ────────────────────────────────
        setPlansFromServer: (serverPlans) => {
          set((state) => {
            state.plans = serverPlans;
          });
        },

        setClientsFromServer: (serverClients) => {
          set((state) => {
            state.clients = serverClients;
          });
          get().refreshAlerts();
        },
      })),
      {
        name: 'bienestar-finance-v5',
        version: 4,
        migrate: (persistedState: any) => {
          if (!persistedState || !persistedState.clients || persistedState.clients.length === 0) {
            return {
              clients: SEED_CLIENTS,
              revenueHistory: SEED_REVENUE_HISTORY,
              alerts: generateAlerts(SEED_CLIENTS),
              plans: SEED_COMMERCIAL_PLANS,
              whatsappTemplates: DEFAULT_WHATSAPP_TEMPLATES,
            };
          }
          return {
            ...persistedState,
            plans: persistedState.plans && persistedState.plans.length > 0 ? persistedState.plans : SEED_COMMERCIAL_PLANS,
            whatsappTemplates: persistedState.whatsappTemplates || DEFAULT_WHATSAPP_TEMPLATES,
          };
        },
      }
    ),
    { name: 'FinanceStore' }
  )
);
