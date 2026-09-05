import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'es' | 'en';

// =============================================================================
// TRANSLATIONS - Centralized i18n Dictionary
// =============================================================================

export const translations = {
    es: {
        // Sidebar Groups
        groups: {
            core: 'Núcleo Operativo',
            clinical: 'Herramientas Clínicas',
            growth: 'Motor de Crecimiento',
            gamification: 'Gamificación',
            pro: 'Modos Profesionales',
            system: 'Sistema'
        },
        // Module Names
        modules: {
            dashboard: 'Inicio',
            roster: 'Watchtower',
            analytics: 'Bio-Síntesis',
            inbox: 'Inbox Contextual',
            lab: 'Laboratorio',
            prescription: 'Planificador de Comidas',
            voice: 'Dictado por Voz',
            import: 'Importación Mágica',
            revenue: 'Guardia de Ingresos',
            gatekeeper: 'Portero',
            gamification: 'Retos y Premios',
            arena: 'La Arena',
            nutrition: 'Nutrición Avanzada',
            nutricionista: 'Panel Nutricionista',
            trainer: 'Panel Entrenador',
            client: 'Simulador App',
            branding: 'Marca Blanca',
            blocks: 'Constructor de Bloques',
            smartlab: 'Smart Lab',
            menu: 'Escáner de Menú',
            injury: 'Radar de Lesiones',
            mindgym: 'Gimnasio Mental',
            professionals: 'Gestión de Staff',
            communication: 'Agente Comms',
            settings: 'Configuración'
        },
        // Dashboard
        dashboard: {
            title: 'Inicio',
            morningBrief: 'RESUMEN MATINAL',
            urgentClinical: 'Clínico Urgente',
            pendingCheckins: 'Check-ins Pendientes',
            generalMessages: 'Mensajes Generales',
            aiInsight: 'ANÁLISIS IA',
            revenuePulse: 'PULSO DE INGRESOS',
            activeClients: 'Clientes Activos',
            churnRisk: 'Riesgo de Baja',
            avgClient: 'Prom/Cliente',
            clientHealth: 'SALUD DEL CLIENTE',
            sortedByAttention: 'Ordenado por atención necesaria',
            paymentFailed: 'Pago Fallido',
            missedWorkouts: 'Entrenamientos Perdidos'
        },
        // Roster / Watchtower
        roster: {
            title: 'LISTADO DE PACIENTES',
            systemReady: 'Sistema Listo',
            anomaliesDetected: 'Anomalías Detectadas',
            status: 'ESTADO',
            clientName: 'NOMBRE DEL CLIENTE',
            adherence7d: 'ADHERENCIA (7D)',
            lastBiometric: 'ÚLTIMO BIOMÉTRICO',
            progress: 'PROGRESO',
            week: 'SEMANA'
        },
        // Bio-Synthesis / Analytics
        analytics: {
            title: 'BIO-SÍNTESIS',
            weightTrend: 'TENDENCIA DE PESO',
            glucoseLevels: 'NIVELES DE GLUCOSA',
            sleepQuality: 'CALIDAD DEL SUEÑO',
            trainingVolume: 'VOLUMEN DE ENTRENAMIENTO',
            aiAnalysis: 'ANÁLISIS IA'
        },
        // The Arena
        arena: {
            title: 'La Arena ⚔️',
            subtitle: 'Pon tus puntos donde está tu boca',
            active: 'En Curso',
            pending: 'Pendientes',
            history: 'Historial',
            newChallenge: 'Lanzar Nuevo Desafío',
            challengeTribe: 'Desafía a un miembro de tu tribu',
            noActiveWagers: 'No tienes apuestas activas',
            noPendingChallenges: 'No tienes desafíos pendientes',
            launchChallenge: 'Lanzar Desafío',
            chooseOpponent: 'Elige a tu oponente',
            challengeMetric: 'Métrica del desafío',
            pointsAtStake: 'Puntos en juego',
            ifWin: 'Si ganas recibes',
            cancel: 'Cancelar',
            launch: 'LANZAR DESAFÍO'
        },
        // Pending Duel Card
        pendingDuel: {
            newRequest: 'Nueva Solicitud de Duelo',
            challengesYouIn: 'te desafía en',
            stake: 'Apuesta',
            expiresIn: 'Expira en 24h',
            accept: 'ACEPTAR',
            ignore: 'IGNORAR'
        },
        // Active Challenge Card
        activeChallenge: {
            you: 'TÚ',
            leading: 'LIDERANDO',
            chasing: 'PERSIGUIENDO',
            potPoints: 'PTS POT',
            finished: 'Terminado'
        },
        // Gamification Hub
        gamification: {
            title: 'Retos y Premios',
            streakDays: 'días de racha',
            level: 'Nivel',
            points: 'Puntos',
            achievements: 'Logros'
        },
        // Common
        common: {
            pts: 'pts',
            loading: 'Cargando...',
            error: 'Error',
            save: 'Guardar',
            cancel: 'Cancelar',
            edit: 'Editar',
            delete: 'Eliminar',
            confirm: 'Confirmar',
            search: 'Buscar',
            filter: 'Filtrar',
            noData: 'Sin datos',
            today: 'Hoy',
            yesterday: 'Ayer',
            ago: 'hace'
        },
        // Meal Planner
        mealPlanner: {
            title: 'Planificador de Comidas',
            addMeal: 'Agregar Comida',
            breakfast: 'Desayuno',
            lunch: 'Almuerzo',
            dinner: 'Cena',
            snack: 'Merienda',
            kcal: 'kcal',
            protein: 'Proteína',
            carbs: 'Carbohidratos',
            fat: 'Grasas'
        },
        // Reality Switch
        realitySwitch: {
            clinical: 'CLÍNICO',
            ignite: 'IGNITE'
        }
    },
    en: {
        // Sidebar Groups
        groups: {
            core: 'OS Core',
            clinical: 'Clinical Tools',
            growth: 'Growth Engine',
            gamification: 'Gamification',
            pro: 'Professional Modes',
            system: 'System'
        },
        // Module Names
        modules: {
            dashboard: 'Dashboard',
            roster: 'Watchtower',
            analytics: 'Bio-Synthesis',
            inbox: 'Contextual Inbox',
            lab: 'Lab Canvas',
            prescription: 'Meal Planner',
            voice: 'Voice to Chart',
            import: 'Magic Import',
            revenue: 'Revenue Guard',
            gatekeeper: 'Gatekeeper',
            gamification: 'Game Hub',
            arena: 'The Arena',
            nutrition: 'Advanced Nutrition',
            nutricionista: 'Nutritionist Dash',
            trainer: 'Trainer Dash',
            client: 'App Simulator',
            branding: 'Whitelabel',
            blocks: 'Block Builder',
            smartlab: 'Smart Lab',
            menu: 'Menu Scanner',
            injury: 'Injury Radar',
            mindgym: 'Mind Gym',
            professionals: 'Staff Management',
            communication: 'Comms Agent',
            settings: 'Settings'
        },
        // Dashboard
        dashboard: {
            title: 'Dashboard',
            morningBrief: 'THE MORNING BRIEF',
            urgentClinical: 'Urgent Clinical',
            pendingCheckins: 'Pending Check-ins',
            generalMessages: 'General Messages',
            aiInsight: 'AI INSIGHT',
            revenuePulse: 'REVENUE PULSE',
            activeClients: 'Active Clients',
            churnRisk: 'Churn Risk',
            avgClient: 'Avg/Client',
            clientHealth: 'CLIENT HEALTH',
            sortedByAttention: 'Sorted by attention needed',
            paymentFailed: 'Payment Failed',
            missedWorkouts: 'Missed Workouts'
        },
        // Roster / Watchtower
        roster: {
            title: 'PATIENT ROSTER',
            systemReady: 'System Ready',
            anomaliesDetected: 'Anomalies Detected',
            status: 'STATUS',
            clientName: 'CLIENT NAME',
            adherence7d: 'ADHERENCE (7D)',
            lastBiometric: 'LAST BIOMETRIC',
            progress: 'PROGRESS',
            week: 'WEEK'
        },
        // Bio-Synthesis / Analytics
        analytics: {
            title: 'BIO-SYNTHESIS',
            weightTrend: 'WEIGHT TREND',
            glucoseLevels: 'GLUCOSE LEVELS',
            sleepQuality: 'SLEEP QUALITY',
            trainingVolume: 'TRAINING VOLUME',
            aiAnalysis: 'AI ANALYSIS'
        },
        // The Arena
        arena: {
            title: 'The Arena ⚔️',
            subtitle: 'Put your points where your mouth is',
            active: 'Active',
            pending: 'Pending',
            history: 'History',
            newChallenge: 'Launch New Challenge',
            challengeTribe: 'Challenge a tribe member',
            noActiveWagers: 'No active wagers',
            noPendingChallenges: 'No pending challenges',
            launchChallenge: 'Launch Challenge',
            chooseOpponent: 'Choose your opponent',
            challengeMetric: 'Challenge metric',
            pointsAtStake: 'Points at stake',
            ifWin: 'If you win you get',
            cancel: 'Cancel',
            launch: 'LAUNCH CHALLENGE'
        },
        // Pending Duel Card
        pendingDuel: {
            newRequest: 'New Duel Request',
            challengesYouIn: 'challenges you in',
            stake: 'Stake',
            expiresIn: 'Expires in 24h',
            accept: 'ACCEPT',
            ignore: 'IGNORE'
        },
        // Active Challenge Card
        activeChallenge: {
            you: 'YOU',
            leading: 'LEADING',
            chasing: 'CHASING',
            potPoints: 'PTS POT',
            finished: 'Finished'
        },
        // Gamification Hub
        gamification: {
            title: 'Game Hub',
            streakDays: 'day streak',
            level: 'Level',
            points: 'Points',
            achievements: 'Achievements'
        },
        // Common
        common: {
            pts: 'pts',
            loading: 'Loading...',
            error: 'Error',
            save: 'Save',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            confirm: 'Confirm',
            search: 'Search',
            filter: 'Filter',
            noData: 'No data',
            today: 'Today',
            yesterday: 'Yesterday',
            ago: 'ago'
        },
        // Meal Planner
        mealPlanner: {
            title: 'Meal Planner',
            addMeal: 'Add Meal',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack',
            kcal: 'kcal',
            protein: 'Protein',
            carbs: 'Carbs',
            fat: 'Fat'
        },
        // Reality Switch
        realitySwitch: {
            clinical: 'CLINICAL',
            ignite: 'IGNITE'
        }
    }
};

// =============================================================================
// CONTEXT
// =============================================================================

interface LanguageContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: typeof translations['es'];
    toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Lang>('es');

    const toggleLang = () => setLang(prev => prev === 'es' ? 'en' : 'es');

    const t = translations[lang];

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
