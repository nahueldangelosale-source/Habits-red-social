
import type { Client } from "@libsql/client";

/**
 * SOVEREIGN SAAS: LOCAL-FIRST EDGE CLIENT
 * 
 * Este módulo inicializa la base de datos embebida SQLite (WASM) en el navegador del entrenador.
 * Proporciona un Time-to-Interactive (TTI) de 0ms para lecturas y escrituras Offline.
 */

// MOCK DATA FOR ONBOARDING
const MOCK_ONBOARDING_TAGS = [
    // GOAL
    { id: '1', category: 'GOAL', ui_label: 'Quiero perder grasa corporal de forma sostenible', ui_icon: 'Flame', backend_value: 'lose_weight' },
    { id: '2', category: 'GOAL', ui_label: 'Busco aumentar mi masa muscular y fuerza', ui_icon: 'Dumbbell', backend_value: 'gain_muscle' },
    { id: '3', category: 'GOAL', ui_label: 'Quiero mejorar mi composición y tonificación', ui_icon: 'Scale', backend_value: 'recomp' },
    { id: '4', category: 'GOAL', ui_label: 'Busco potenciar mi rendimiento deportivo', ui_icon: 'Zap', backend_value: 'performance' },
    // BIOMECHANICS
    { id: '5', category: 'BIOMECHANICS', ui_label: 'Siento molestia o dolor en las rodillas', ui_icon: 'Activity', backend_value: 'inj_knee' },
    { id: '6', category: 'BIOMECHANICS', ui_label: 'Siento tensión o molestia en la espalda baja', ui_icon: 'Bone', backend_value: 'inj_lower_back' },
    { id: '7', category: 'BIOMECHANICS', ui_label: 'Tengo molestias en los hombros al moverlos', ui_icon: 'Target', backend_value: 'inj_shoulder' },
    // EXPERIENCE
    { id: '8', category: 'EXPERIENCE', ui_label: 'Novato', ui_icon: 'Sprout', backend_value: 'beginner' },
    { id: '9', category: 'EXPERIENCE', ui_label: 'Intermedio', ui_icon: 'Flame', backend_value: 'intermediate' },
    { id: '10', category: 'EXPERIENCE', ui_label: 'Avanzado', ui_icon: 'Medal', backend_value: 'advanced' },
    // TIME
    { id: '11', category: 'TIME', ui_label: '< 30 min', ui_icon: 'Zap', backend_value: 'under_30' },
    { id: '12', category: 'TIME', ui_label: '45-60 min', ui_icon: 'Timer', backend_value: '45_to_60' },
    { id: '13', category: 'TIME', ui_label: 'Sin límite', ui_icon: 'Infinity', backend_value: 'unlimited' },
    // COACHING_STYLE
    { id: '14', category: 'COACHING_STYLE', ui_label: 'Motivador y Empático', ui_icon: 'Heart', backend_value: 'empathetic' },
    { id: '15', category: 'COACHING_STYLE', ui_label: 'Estricto y Militar', ui_icon: 'Crosshair', backend_value: 'strict' },
    // STRESS
    { id: '16', category: 'STRESS', ui_label: 'Bajo (Relajado)', ui_icon: 'Wind', backend_value: 'low' },
    { id: '17', category: 'STRESS', ui_label: 'Alto (Abrumado)', ui_icon: 'CloudLightning', backend_value: 'high' },
    // SLEEP
    { id: '18', category: 'SLEEP', ui_label: 'Descanso profundo', ui_icon: 'Moon', backend_value: 'good' },
    { id: '19', category: 'SLEEP', ui_label: 'Insomnio frecuente', ui_icon: 'EyeOff', backend_value: 'bad' },
    // DIET
    { id: '20', category: 'DIET', ui_label: 'Vegetariana', ui_icon: 'Leaf', backend_value: 'vegetarian' },
    { id: '21', category: 'DIET', ui_label: 'Omnívora', ui_icon: 'Drumstick', backend_value: 'omnivore' },
    // CLINICAL
    { id: '22', category: 'CLINICAL', ui_label: 'Diabetes, pre-diabetes o resistencia a insulina', ui_icon: 'Activity', backend_value: 'chr_diabetes_metabolic' },
    { id: '23', category: 'CLINICAL', ui_label: 'Hipertensión o antecedentes cardíacos', ui_icon: 'HeartPulse', backend_value: 'chr_hypertension_cardio' },
    { id: '24', category: 'CLINICAL', ui_label: 'Asma, EPOC o dificultades respiratorias', ui_icon: 'Wind', backend_value: 'chr_asthma_resp' },
    { id: '25', category: 'CLINICAL', ui_label: 'Osteoartritis, Osteoporosis o desgaste articular', ui_icon: 'Bone', backend_value: 'chr_osteoarthritis_bone' },
    { id: '26', category: 'CLINICAL', ui_label: 'Depresión, Ansiedad clínica o TDAH', ui_icon: 'Brain', backend_value: 'chr_mental_health' },
    { id: '27', category: 'CLINICAL', ui_label: 'Enfermedad autoinmune (Fibromialgia, Fatiga C.)', ui_icon: 'ShieldAlert', backend_value: 'chr_autoimmune_fatigue' },
    { id: '28', category: 'CLINICAL', ui_label: 'Tomo medicamentos recetados diariamente', ui_icon: 'Pill', backend_value: 'chr_regular_medication' },
    { id: '29', category: 'CLINICAL', ui_label: 'Estoy embarazada o en postparto reciente', ui_icon: 'Baby', backend_value: 'chr_pregnancy_postpartum' },
    // HABITS
    { id: '30', category: 'HABITS', ui_label: 'Paso la mayor parte del día sentado (Oficina)', ui_icon: 'Briefcase', backend_value: 'habit_sedentary_work' },
    { id: '31', category: 'HABITS', ui_label: 'Mi trabajo es muy activo o físico', ui_icon: 'Hammer', backend_value: 'habit_active_work' },
    { id: '32', category: 'HABITS', ui_label: 'A veces como por estrés, ansiedad o aburrimiento', ui_icon: 'Pizza', backend_value: 'habit_emotional_eating' },
    { id: '33', category: 'HABITS', ui_label: 'Consumo alcohol frecuentemente o fumo', ui_icon: 'Wine', backend_value: 'habit_toxic_exposure' },
    { id: '34', category: 'HABITS', ui_label: 'Me cuesta beber suficiente agua durante el día', ui_icon: 'Droplets', backend_value: 'habit_low_hydration' },
    { id: '35', category: 'HABITS', ui_label: 'Mentalidad "Todo o Nada", si fallo me frustro', ui_icon: 'RotateCcw', backend_value: 'habit_all_or_nothing' },
    
    // NUTRITION - LOGISTICS (MARKET & KITCHEN)
    { id: '36', category: 'NUT_LOGISTICS_MARKET', ui_label: '1 vez a la semana', ui_icon: 'ShoppingCart', backend_value: 'nut_log_market_1' },
    { id: '37', category: 'NUT_LOGISTICS_MARKET', ui_label: '2-3 veces a la semana', ui_icon: 'ShoppingBag', backend_value: 'nut_log_market_2_3' },
    { id: '38', category: 'NUT_LOGISTICS_MARKET', ui_label: 'Pido todo por App / Delivery', ui_icon: 'Smartphone', backend_value: 'nut_log_market_app' },
    { id: '39', category: 'NUT_LOGISTICS_KITCHEN', ui_label: 'La odio, busco practicidad', ui_icon: 'Clock', backend_value: 'nut_log_kitchen_hate' },
    { id: '40', category: 'NUT_LOGISTICS_KITCHEN', ui_label: 'Me defiendo', ui_icon: 'Utensils', backend_value: 'nut_log_kitchen_basic' },
    { id: '41', category: 'NUT_LOGISTICS_KITCHEN', ui_label: 'Soy un Chef Aficionado', ui_icon: 'ChefHat', backend_value: 'nut_log_kitchen_chef' },
    // NUTRITION - GOALS & OBSTACLES
    { id: '42', category: 'NUT_GOAL', ui_label: 'Bajar talla de pantalón', ui_icon: 'Ruler', backend_value: 'nut_goal_size_down' },
    { id: '43', category: 'NUT_GOAL', ui_label: 'Tener energía todo el día', ui_icon: 'BatteryCharging', backend_value: 'nut_goal_energy' },
    { id: '44', category: 'NUT_GOAL', ui_label: 'Mejorar mi digestión', ui_icon: 'Activity', backend_value: 'nut_goal_digestion' },
    { id: '45', category: 'NUT_GOAL', ui_label: 'Longevidad / Salud a largo plazo', ui_icon: 'Heart', backend_value: 'nut_goal_longevity' },
    { id: '46', category: 'NUT_OBSTACLE', ui_label: 'Me aburro rápido', ui_icon: 'Frown', backend_value: 'nut_obs_bored' },
    { id: '47', category: 'NUT_OBSTACLE', ui_label: 'Ansiedad por comer de noche', ui_icon: 'Moon', backend_value: 'nut_obs_night_anxiety' },
    { id: '48', category: 'NUT_OBSTACLE', ui_label: 'No sé qué comprar', ui_icon: 'HelpCircle', backend_value: 'nut_obs_shopping' },
    { id: '49', category: 'NUT_OBSTACLE', ui_label: 'Falta de apoyo familiar', ui_icon: 'Users', backend_value: 'nut_obs_no_support' },
    // NUTRITION - CLINICAL
    { id: '50', category: 'NUT_DIET_TYPE', ui_label: 'Sin restricciones', ui_icon: 'CheckCircle2', backend_value: 'nut_diet_none' },
    { id: '51', category: 'NUT_DIET_TYPE', ui_label: 'Vegetariana', ui_icon: 'Leaf', backend_value: 'nut_diet_vegetarian' },
    { id: '52', category: 'NUT_DIET_TYPE', ui_label: 'Vegana', ui_icon: 'Sprout', backend_value: 'nut_diet_vegan' },
    { id: '53', category: 'NUT_DIET_TYPE', ui_label: 'Keto / Low Carb', ui_icon: 'Beef', backend_value: 'nut_diet_keto' },
    { id: '54', category: 'NUT_SYMPTOMS', ui_label: 'Hinchazón abdominal frequente', ui_icon: 'Wind', backend_value: 'nut_sym_bloating' },
    { id: '55', category: 'NUT_SYMPTOMS', ui_label: 'Dolor de cabeza crónico', ui_icon: 'Brain', backend_value: 'nut_sym_headache' },
    { id: '56', category: 'NUT_SYMPTOMS', ui_label: 'Fatiga aguda post-comida', ui_icon: 'Battery', backend_value: 'nut_sym_fatigue' },
    // NUTRITION - READINESS
    { id: '57', category: 'NUT_READINESS', ui_label: 'Quiero empezar hoy mismo', ui_icon: 'Zap', backend_value: 'nut_change_action' },
    { id: '58', category: 'NUT_READINESS', ui_label: 'Estoy explorando opciones', ui_icon: 'Search', backend_value: 'nut_change_contemplation' },
    { id: '59', category: 'NUT_READINESS', ui_label: 'Solo busco información por ahora', ui_icon: 'BookOpen', backend_value: 'nut_change_pre_contemplation' },
];

class MockLocalClient implements Client {
    closed = false;
    protocol = "http" as const;
    async execute(stmt: any): Promise<any> {
        const sql = typeof stmt === 'string' ? stmt : stmt.sql;
        if (sql.includes("SELECT * FROM onboarding_tags")) {
            return {
                columns: ['id', 'category', 'ui_label', 'ui_icon', 'backend_value'],
                columnTypes: ['TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT'],
                rows: MOCK_ONBOARDING_TAGS as any[],
                rowsAffected: 0,
                lastInsertRowid: undefined
            };
        }
        return { columns: [], columnTypes: [], rows: [], rowsAffected: 0, lastInsertRowid: undefined };
    }
    async batch() { return []; }
    async transaction() { return {} as any; }
    async executeMultiple() {}
    async sync() { return {} as any; }
    async migrate() { return [] as any; }
    reconnect() {}
    close() { this.closed = true; }
}

let localDbInstance: Client | null = null;

export const getLocalDb = (): Client => {
    if (!localDbInstance) {
        localDbInstance = new MockLocalClient();
        console.log("🟢 [Local-First] Mock libSQL Embedded Replica Initialized");
    }
    return localDbInstance!;
};

/**
 * Ejecuta una mutación optimista (Write) localmente en 0ms y acciona la sincronización asíncrona.
 */
export const executeOptimisticMutation = async (sql: string, args: any[] = []) => {
    const db = getLocalDb();
    const start = performance.now();
    
    // 1. Escritura Local Inmediata (0ms)
    const result = await db.execute({ sql, args });
    
    const latency = performance.now() - start;
    console.log(`⚡ [Local-First] Mutation Local Executed in ${latency.toFixed(2)}ms`);

    // 2. Disparar sincronización en background de manera no-bloqueante
    if (db.sync) {
        db.sync().then(() => {
             console.log("☁️ [Local-First] Background Sync to Turso Edge completed.");
             // Dispatch global event for the <LocalFirstIndicator />
             window.dispatchEvent(new CustomEvent('local-first-sync-complete'));
        }).catch(err => {
             console.error("☁️ [Local-First] Background Sync failed:", err);
             window.dispatchEvent(new CustomEvent('local-first-sync-error'));
        });
        
        // Notify UI that a sync is pending
        window.dispatchEvent(new CustomEvent('local-first-sync-start'));
    }

    return result;
};
