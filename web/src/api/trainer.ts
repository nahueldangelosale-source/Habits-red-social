/**
 * Trainer API Service
 * Maneja las peticiones del dashboard de Personal Trainer
 */

import { api } from '../api/client';


// =============================================================================
// DOMAIN TYPES (Frontend - camelCase)
// =============================================================================

export interface AthleteClinicalProfile {
    biometrics?: {
        weight?: number;
        height?: number;
        age?: number;
        gender?: string;
    };
    training?: {
        experience_level?: string;
        days_per_week?: number;
        equipment?: string[];
    };
    healthData?: {
        currentDiet?: string;
        activityLevel?: string | number;
    };
    goal_tags?: string[];
    medical_tags?: string[];
    habit_stress_level?: number;
    habit_sleep_quality?: number;
    habit_work_type?: string;
    notes?: string;
    ai_reasoning?: {
        summary?: string;
    };
}

const parseClinicalProfile = (rawInput: any): AthleteClinicalProfile => {
    let raw = rawInput;
    if (typeof raw === 'string') {
        try {
            raw = JSON.parse(raw);
        } catch (e) {
            return {};
        }
    }
    if (!raw || typeof raw !== 'object') return {};

    return {
        biometrics: {
            weight: Number(raw.biometrics?.weight || raw.weight) || undefined,
            height: Number(raw.biometrics?.height || raw.height) || undefined,
            age: Number(raw.biometrics?.age || raw.age) || undefined,
            gender: raw.biometrics?.gender || raw.gender || undefined,
        },
        training: {
            experience_level: raw.training?.experience_level || raw.experience_level || undefined,
            days_per_week: Number(raw.training?.days_per_week || raw.days_per_week) || undefined,
            equipment: Array.isArray(raw.training?.equipment) ? raw.training.equipment : 
                      (Array.isArray(raw.equipment) ? raw.equipment : []),
        },
        healthData: {
            currentDiet: raw.healthData?.currentDiet || raw.currentDiet || undefined,
            activityLevel: raw.healthData?.activityLevel || raw.activityLevel || undefined,
        },
        goal_tags: Array.isArray(raw.goal_tags) ? raw.goal_tags : 
                  (Array.isArray(raw.goalTags) ? raw.goalTags : []),
        medical_tags: Array.isArray(raw.medical_tags) ? raw.medical_tags : 
                     (Array.isArray(raw.medicalTags) ? raw.medicalTags : []),
        habit_stress_level: Number(raw.habit_stress_level || raw.stressLevel) || undefined,
        habit_sleep_quality: Number(raw.habit_sleep_quality || raw.sleepQuality) || undefined,
        habit_work_type: raw.habit_work_type || raw.workType || undefined,
        notes: raw.notes || undefined,
        ai_reasoning: {
            summary: raw.ai_reasoning?.summary || undefined
        }
    };
};


export interface TrainerKPIs {
    activeClients: number;
    videosPending: number;
    retentionRate: number;
    monthlyRevenue: number;
}

export interface InjuryRiskClient {
    clientId: string;
    clientName: string;
    exercise: string;
    loadIncrease: number;
    currentLoad: number;
    previousLoad: number;
    riskLevel: 'critical' | 'high' | 'medium';
}

export interface VideoReviewItem {
    id: string;
    clientId: string;
    clientName: string;
    exercise: string;
    videoUrl: string;
    thumbnailUrl: string;
    uploadedAt: string;
    duration: string;
}

export interface ChurnRiskClient {
    clientId: string;
    clientName: string;
    daysSinceLastActivity: number;
    lastActivityType: string;
    subscriptionEndDate: string | null;
}

export interface ClientSummary {
    id: string;
    name: string;
    photoUrl: string | null;
    estimated1RM: {
        squat: number;
        deadlift: number;
        bench: number;
    };
    lastSessionVolume: number;
    painAreas: string[];
    lastWorkout: string | null;
    streak: number;
    isActive: boolean;
    acwrStatus?: string;
    acwrColor?: string;
    acwrValue?: number;
    riskLevel?: 'RED' | 'ORANGE' | 'GREEN';
    criticalTags?: string[];
}

export interface PendingWager {
    id: string;
    clientId: string;
    clientName: string;
    description: string;
    vitalPoints: number;
    deadline: string;
    evidenceUrl?: string;
}

export interface DelinquentClient {
    id: string;
    name: string;
    amountDue: number;
    daysLate: number;
}

export interface TrainerDashboardData {
    tenantName: string;
    kpis: TrainerKPIs;
    injuryRisks: InjuryRiskClient[];
    videoQueue: VideoReviewItem[];
    churnRisks: ChurnRiskClient[];
    clients: ClientSummary[];
    pendingWagers: PendingWager[]; // Note: Backend doesn't support this yet
    delinquentClients: DelinquentClient[];
}

export interface PatientCreateInput {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    height_cm?: number;
    goal?: string;
    extra_data?: Record<string, any>;
}

// =============================================================================
// API TYPES (Backend - snake_case)
// =============================================================================

interface ApiTrainerKPIs {
    active_clients: number;
    videos_pending: number;
    retention_rate: number;
    monthly_revenue: number;
}

interface ApiInjuryRiskClient {
    client_id: string;
    client_name: string;
    exercise: string;
    load_increase: number;
    current_load: number;
    previous_load: number;
    risk_level: 'critical' | 'high' | 'medium';
}

interface ApiVideoReviewItem {
    id: string;
    client_id: string;
    client_name: string;
    exercise: string;
    video_url: string;
    thumbnail_url: string;
    uploaded_at: string;
    duration: string;
}

interface ApiChurnRiskClient {
    client_id: string;
    client_name: string;
    days_since_last_activity: number;
    last_activity_type: string;
    subscription_end_date: string | null;
}

interface ApiClientSummary {
    id: string;
    name: string;
    photo_url: string | null;
    estimated_1rm: {
        squat: number;
        deadlift: number;
        bench: number;
    };
    last_session_volume: number;
    pain_areas: string[];
    last_workout: string | null;
    streak: number;
    is_active: boolean;
    acwr_status?: string;
    acwr_color?: string;
    acwr_value?: number;
    risk_level?: 'RED' | 'ORANGE' | 'GREEN';
    critical_tags?: string[];
}

interface ApiDelinquentClient {
    id: string;
    name: string;
    amount_due: number;
    days_late: number;
}

interface ApiTrainerDashboardData {
    tenant_name: string;
    kpis: ApiTrainerKPIs;
    injury_risks: ApiInjuryRiskClient[];
    video_queue: ApiVideoReviewItem[];
    churn_risks: ApiChurnRiskClient[];
    clients: ApiClientSummary[];
    delinquent_clients: ApiDelinquentClient[];
}

export const trainerApi = {
    /**
     * Obtiene los datos principales del dashboard
     */
    getDashboard: async (): Promise<TrainerDashboardData> => {
        try {
            // FASE 6: The Shield is Active (apiRequest)
            // Querying new PostgreSQL live endpoints via the unified client
            const [metrics, triageResponse] = await Promise.all([
                api.get<any>('/api/v1/dashboard/metrics').catch(() => null),
                api.get<any>('/api/v1/dashboard/triage').catch(() => null)
            ]);

            if (!metrics || !triageResponse) {
                throw new Error("Backend unavailable or unauthorized. No mock fallback available.");
            }

            return {
                tenantName: metrics.tenant_name || "Bienestar B2B",
                kpis: {
                    activeClients: metrics.kpis.active_clients,
                    videosPending: metrics.kpis.videos_pending_review,
                    retentionRate: metrics.kpis.retention_rate,
                    monthlyRevenue: metrics.revenue.mrr
                },
                // The new dashboard API is highly aggregated for performance.
                // Detailed arrays will be loaded lazily in their respective tabs/views.
                injuryRisks: [],
                videoQueue: [],
                churnRisks: [],
                clients: (triageResponse.items && triageResponse.items.length > 0) ? triageResponse.items.map((c: any) => ({
                    id: c.client_id,
                    name: c.name,
                    photoUrl: null,
                    estimated1RM: { squat: 0, deadlift: 0, bench: 0 },
                    lastSessionVolume: 0,
                    painAreas: [],
                    lastWorkout: null,
                    streak: 0,
                    isActive: true,
                    acwrStatus: "SWEET_SPOT",
                    acwrColor: "emerald",
                    acwrValue: 1.0,
                    riskLevel: c.risk_level,
                    criticalTags: c.critical_tags || []
                })) : [],
                pendingWagers: [],
                delinquentClients: []
            };
        } catch (error) {
            console.error("API Error in Dashboard", error);
            throw error;
        }
    },

    /**
     * Crea un nuevo atleta (Hito A - Fase 7)
     */
    createPatient: (data: PatientCreateInput) => {
        return api.post<any>('/api/v1/patients', data);
    },

    /**
     * Aprueba un video de técnica
     */
    approveVideo: (videoId: string, feedback: string) => {
        return api.post(`/api/v1/trainer/video-review/${videoId}/approve`, { feedback });
    },

    /**
     * Rechaza un video y solicita re-grabación
     */
    rejectVideo: (videoId: string) => {
        return api.post(`/api/v1/trainer/video-review/${videoId}/reject`);
    },

    /**
     * Aprueba gestión y quita morosidad del cliente (Zero-Trust FinOps)
     */
    resolveDelinquency: (clientId: string) => {
        return api.post(`/api/v1/trainer/resolve-delinquency/${clientId}`);
    },

    /**
     * Obtiene el detalle completo de un atleta
     */
    getAthleteDetail: async (athleteId: string): Promise<AthleteDetail> => {
        try {
            let data;
            try {
                data = await api.get<any>(`/api/v1/trainer/athletes/${athleteId}`);
            } catch (e) {
                // MOCK FALLBACK FOR UI TESTING
                console.warn("Backend 404 for athlete, returning mock detail data.");
                if (athleteId === 'ephemeral-demo') {
                    data = {
                        id: 'ephemeral-demo',
                        first_name: 'Nahuel',
                        last_name: 'Dangelo',
                        photo_url: null,
                        active_program_name: 'Hipertrofia Push/Pull/Legs',
                        onboarding_data: { notes: "Atleta intermedio, buscando recomposición." },
                        injuries: []
                    };
                } else if (athleteId === 'mock-2') {
                    data = {
                        id: 'mock-2',
                        first_name: 'Nicolas',
                        last_name: 'Moroni',
                        photo_url: null,
                        active_program_name: 'Fuerza 5x5',
                        onboarding_data: { notes: "Problemas en rodilla derecha." },
                        injuries: [{ exercise: 'Rodilla Derecha', risk_level: 'Yellow' }]
                    };
                } else {
                    data = {
                        id: athleteId,
                        first_name: 'Atleta',
                        last_name: 'Mock',
                        photo_url: null,
                        active_program_name: 'General Fitness',
                        onboarding_data: { notes: "Perfil de prueba." },
                        injuries: []
                    };
                }
            }

            return {
                id: data.id,
                name: `${data.first_name || 'Desconocido'} ${data.last_name || ''}`,
                photoUrl: data.photo_url || null,
                bio: data.onboarding_data?.ai_reasoning?.summary || data.onboarding_data?.notes || "Sin biografía disponible",
                injuries: (data.onboarding_data?.medical_tags || data.injuries || []).map((i: any) => ({
                    clientId: data.id,
                    clientName: `${data.first_name} ${data.last_name}`,
                    exercise: typeof i === 'string' ? i : (i.exercise || 'General'),
                    loadIncrease: i.load_increase || 0,
                    currentLoad: i.current_load || 0,
                    previousLoad: i.previous_load || 0,
                    risk_level: i.risk_level || (typeof i === 'string' ? 'Yellow' : 'Green')
                })),
                trainingProgram: data.active_program_name || "Sin plan asignado",
                performanceStats: data.performance_stats || {
                    "Bench Press": 0,
                    "Squat": 0,
                    "Deadlift": 0,
                    "Total Volume": data.sessions?.reduce((acc: number, s: any) => acc + (s.volume || 0), 0) || 0
                },
                lastSessions: (data.sessions || data.last_sessions || []).map((s: any) => ({
                    date: s.date || s.started_at,
                    volume: s.volume || 0,
                    intensity: s.rpe ? `${s.rpe}/10` : 'N/A'
                })),
                videoHistory: (data.videos || data.video_history || []).map((v: any) => ({
                    id: v.id,
                    clientId: data.id,
                    clientName: `${data.first_name} ${data.last_name}`,
                    exercise: v.exercise || 'Desconocido',
                    videoUrl: v.url || v.video_url,
                    thumbnailUrl: v.thumbnail_url || '',
                    uploadedAt: v.created_at || v.uploaded_at,
                    duration: v.duration || '0:00'
                })),
                onboardingData: parseClinicalProfile(data.onboarding_data),
                acwrData: data.acwr_data,
                nutrition: data.nutrition,
                updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
                active_routine: data.active_routine || data.routine || data.mutated_routine
            };
        } catch (error) {
            console.error("API Error in Athlete Detail", error);
            throw error;
        }
    }
};

export interface AthleteDetail {
    id: string;
    name: string;
    photoUrl: string | null;
    bio: string;
    injuries: InjuryRiskClient[];
    trainingProgram: string;
    performanceStats: Record<string, number>;
    lastSessions: Array<{ date: string; volume: number; intensity: string }>;
    videoHistory: VideoReviewItem[];
    onboardingData?: AthleteClinicalProfile;
    acwrData?: {
        acute_load: number;
        chronic_load: number;
        acwr: number;
        risk_status: string;
        risk_color: string;
    };
    nutrition?: {
        id: string;
        macros: Record<string, number>;
        recipes: any[];
    };
    updatedAt?: string;
    active_routine?: any;
}
