import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import type { Archetype, ClinicalHardStop } from '../../stores/useOnboardingStore';
import { ArrowRight, Bot, Zap, ShieldAlert, HeartPulse, Activity, PlusCircle, CheckCircle2, Lock, Unlock, Monitor, Footprints, Dumbbell, ActivitySquare, ChefHat, Flame, Leaf, ArrowRightCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, apiRequest } from '../../api/client';
import toast from 'react-hot-toast';

// ─── Tipos del Plan (espejo del backend) ───
interface RecipeDTO {
  id: string; name: string; meal_type: string; prep_time: number;
  calories: number; protein: number; carbs: number; fats: number;
  substitutions: { original: string; replacement: string }[];
}
interface DayPlan {
  label: string; total_calories: number; target_calories: number; meals: RecipeDTO[];
}
interface ClinicalFlags {
  metabolic_syndrome_risk: boolean; low_fodmap_active: boolean;
  glp1_safety_mode: boolean; blocked_ingredients: string[];
}
interface PlanResponse {
  patient_name: string; patient_id: string; tmb: number;
  daily_energy_requirement: number; archetype_label: string;
  clinical_flags: ClinicalFlags; plan: DayPlan[]; llm_narrative: string;
}

// ─── Constantes ───
const archetypes = [
  { id: 'ARQ_09_LONGEVITY_VITALITY', label: 'Longevidad y Prevención', icon: HeartPulse, desc: 'Enfocado en vivir más y mejor, fortaleciendo el metabolismo y previniendo enfermedades.' },
  { id: 'ARQ_07_TIME_CRUNCH_2X', label: 'Entrenamiento Rápido', icon: Zap, desc: 'Para personas con muy poco tiempo. Sesiones cortas (menos de 30 min) pero de alto impacto.' },
  { id: 'ARQ_03_PPL', label: 'Fuerza y Masa Muscular', icon: Activity, desc: 'Diseñado para quienes buscan construir músculo de forma estructurada y progresiva.' },
  { id: 'ARQ_01_WELLNESS', label: 'Bienestar y Adherencia', icon: Bot, desc: 'Inicio muy suave. El objetivo es crear el hábito del ejercicio sin estrés ni dolor extremo.' },
  { id: 'ARQ_CUSTOM', label: 'Crear Perfil Personalizado', icon: PlusCircle, desc: 'Construir un plan totalmente desde cero, definiendo nuevas reglas para este paciente.' },
] as const;

const hardStops = [
  { id: 'CERO_LACTEOS', label: 'Cero Lácteos' },
  { id: 'SIN_GLUTEN', label: 'Sin Gluten' },
  { id: 'VEGANO', label: 'Vegano' },
  { id: 'KETO', label: 'Dieta Keto' },
  { id: 'HIPERTENSION', label: 'Hipertensión' },
] as const;

const LABOR_STEPS = [
  { text: 'Calculando Tasa Metabólica Basal (Mifflin-St Jeor)...', duration: 600 },
  { text: 'Evaluando riesgo de Síndrome Metabólico...', duration: 500 },
  { text: 'Aplicando Escudos Clínicos (Low-FODMAP / GLP-1)...', duration: 700 },
  { text: 'Filtrando recetas incompatibles en el grafo...', duration: 600 },
  { text: 'Ejecutando sustituciones ALTERNATIVE_TO...', duration: 500 },
  { text: 'Optimizando Plan Asimétrico (Día A / Día B)...', duration: 400 },
];

export const ZeroClientWizard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentBlockIndex, nextBlock, prevBlock, 
    biometrics, setBiometrics, 
    archetype, setArchetype,
    clinicalHardStops, toggleClinicalHardStop,
    gutHealth, setGutHealth,
    medicationGLP1, setMedicationGLP1,
    mealSchedule, setMealSchedule,
    identity, setIdentity,
    isCalculating, setIsCalculating,
    loadDummyPatient,
    tenantId, setTenantId
  } = useOnboardingStore();
  const GLOBAL_POOL_TENANT_ID = 'global-pool-00000000-0000-0000-0000-000000000000';

  const [searchParams] = useSearchParams();

  // ─── HITO B: INTERCEPTOR B2C (SLUG TO TENANT_ID) ───
  useEffect(() => {
    const gymSlug = searchParams.get('gym');
    
    if (!gymSlug && tenantId) return; // Mantiene la atribución si el usuario recarga
    
    if (!gymSlug) {
      setTenantId(GLOBAL_POOL_TENANT_ID);
      return;
    }

    const resolveSlug = async () => {
      try {
        const data = await api.get<{tenant_id: string}>(`http://localhost:8000/api/v1/tenants/resolve/${gymSlug}`);
        setTenantId(data.tenant_id);
      } catch (err) {
        console.warn('No se pudo resolver el gimnasio, cayendo al Global Pool', err);
        setTenantId(GLOBAL_POOL_TENANT_ID);
      }
    };
    resolveSlug();
  }, [searchParams, tenantId, setTenantId]);

  // ─── Estados de la "Ceremonia de Desbloqueo" y Registro PLG ───
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [planResult, setPlanResult] = useState<PlanResponse | null>(null);
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('Dra. Karen Nutricionista');
  const [regEmail, setRegEmail] = useState('demo@aurea.com');
  const [regPassword, setRegPassword] = useState('');

  // ─── FASE 1: BLOQUEO MAGNÉTICO (Red Team) ───
  useEffect(() => {
    if (medicationGLP1 && mealSchedule === 'fasting') {
      setMealSchedule('3meals');
    }
  }, [medicationGLP1, mealSchedule, setMealSchedule]);

  // ─── 4. TELEMETRÍA REACTIVA (Cálculos en tiempo real) ───
  const metabolicCalculations = useMemo(() => {
    const w = biometrics.weight || 0;
    const h = biometrics.height || 0;
    const a = biometrics.age || 0;
    const baseTmb = 10 * w + 6.25 * h - 5 * a;
    const finalTmb = biometrics.gender === 'male' ? baseTmb + 5 : baseTmb - 161;
    const pal = biometrics.activityLevel === 'sedentary' ? 1.2 : biometrics.activityLevel === 'light' ? 1.55 : 1.9;
    const der = Math.round(finalTmb * pal);
    const metRisk = (biometrics.waist || 0) > (biometrics.gender === 'male' ? 90 : 85);
    return {
      tmb: Math.max(0, Math.round(finalTmb)),
      der: Math.max(0, der),
      metRisk
    };
  }, [biometrics]);

  // Smart Defaults
  const handleGenderSelect = (g: 'male' | 'female') => {
    if (!biometrics.gender) {
      if (g === 'male') {
        setBiometrics({ gender: g, weight: 75, height: 175, waist: 90, activityLevel: 'light' });
      } else {
        setBiometrics({ gender: g, weight: 65, height: 165, waist: 75, activityLevel: 'light' });
      }
    } else {
      setBiometrics({ gender: g });
    }
  };

  // Ecosistema de labor local efímero para telemetría
  const [laborText, setLaborText] = useState('Esperando el ingreso de biometría base...');
  useEffect(() => {
    if (!biometrics.gender) {
      setLaborText('Esperando el ingreso de biometría base...');
      return;
    }
    setIsCalculating(true);
    const msgs = [
      'Recalibrando Mifflin-St Jeor...',
      'Analizando colisiones metabólicas...',
      'Filtros de grafo de recetas activos...',
      'Evaluando circunferencia abdominal...'
    ];
    setLaborText(msgs[Math.floor(Math.random() * msgs.length)]);
    const timer = setTimeout(() => {
      setIsCalculating(false);
      setLaborText(`Calibrado: ${metabolicCalculations.der} kcal/día.`);
    }, 450);
    return () => clearTimeout(timer);
  }, [biometrics, metabolicCalculations.der, setIsCalculating]);

  // ─── Fallback local (si backend no responde) ───
  const computeLocalPlan = useCallback((): PlanResponse => {
    const b = biometrics;
    const baseTmb = 10 * (b.weight||0) + 6.25 * (b.height||0) - 5 * (b.age||0);
    const finalTmb = b.gender === 'male' ? baseTmb + 5 : baseTmb - 161;
    const pal = b.activityLevel === 'sedentary' ? 1.2 : b.activityLevel === 'light' ? 1.55 : 1.9;
    const der = Math.round(finalTmb * pal);
    const metRisk = (b.waist || 0) > (b.gender === 'male' ? 90 : 85);
    const lowFodmap = gutHealth !== 'perfect';
    const archLabel = archetypes.find(a => a.id === archetype)?.label || 'Personalizado';

    const schedLabels: Record<string, string> = {
      '3meals': '3 Comidas al día',
      '5meals': '5 Ingestas al día (con Colaciones)',
      'fasting': 'Ayuno Intermitente 16:8'
    };
    const schedLabel = schedLabels[mealSchedule] || '3 Comidas al día';

    const narrative = [
      `Plan nutricional generado para ${identity.name || 'Paciente'}.`,
      `Arquetipo: ${archLabel}.`,
      `Distribución temporal: ${schedLabel}.`,
      `Requerimiento diario estimado: ${der} kcal (TMB: ${Math.round(finalTmb)} x PAL ${pal}).`,
      metRisk ? 'Riesgo de Síndrome Metabólico detectado — se priorizan carbohidratos complejos.' : '',
      lowFodmap ? 'Protocolo Low-FODMAP activado — vegetales fermentables sustituidos automáticamente.' : '',
      medicationGLP1 ? 'Modo seguro GLP-1 — ayunos prolongados bloqueados.' : '',
    ].filter(Boolean).join(' ');

    let dayAMeals = [
      { id: 'REC_001', name: 'Avena con Banana y Arándanos', meal_type: 'Desayuno', prep_time: 8, calories: 350, protein: 12, carbs: 55, fats: 8, substitutions: [] },
      { id: 'REC_005', name: 'Pollo al Ajo Asado', meal_type: 'Almuerzo', prep_time: 30, calories: 450, protein: 40, carbs: 10, fats: 15, substitutions: lowFodmap ? [{ original: 'Ajo', replacement: 'Aceite de Oliva Infusionado' }] : [] },
      { id: 'REC_010', name: 'Salmón con Ghee y Limón', meal_type: 'Cena', prep_time: 20, calories: 500, protein: 35, carbs: 2, fats: 38, substitutions: clinicalHardStops.includes('CERO_LACTEOS') ? [{ original: 'Mantequilla', replacement: 'Ghee' }] : [] },
      { id: 'REC_015', name: 'Batido Proteico de Banana', meal_type: 'Snack', prep_time: 5, calories: 200, protein: 20, carbs: 25, fats: 4, substitutions: [] },
      { id: 'REC_017', name: 'Frutos Secos Mix', meal_type: 'Snack 2', prep_time: 2, calories: 150, protein: 5, carbs: 8, fats: 12, substitutions: [] }
    ];

    let dayBMeals = [
      { id: 'REC_002', name: 'Huevos Revueltos con Espinaca', meal_type: 'Desayuno', prep_time: 10, calories: 280, protein: 20, carbs: 5, fats: 18, substitutions: [] },
      { id: 'REC_006', name: 'Bowl de Quinoa y Tofu', meal_type: 'Almuerzo', prep_time: 15, calories: 400, protein: 25, carbs: 45, fats: 12, substitutions: [] },
      { id: 'REC_011', name: 'Tofu Salteado con Verduras', meal_type: 'Cena', prep_time: 18, calories: 320, protein: 22, carbs: 28, fats: 14, substitutions: [] },
      { id: 'REC_016', name: 'Palta con Limón y Sal', meal_type: 'Snack', prep_time: 3, calories: 160, protein: 2, carbs: 8, fats: 14, substitutions: [] },
      { id: 'REC_018', name: 'Yogurt de Coco con Semillas', meal_type: 'Snack 2', prep_time: 4, calories: 140, protein: 4, carbs: 12, fats: 9, substitutions: [] }
    ];

    if (mealSchedule === 'fasting') {
      // Intermittent Fasting: omit breakfast and second snack
      dayAMeals = dayAMeals.filter(m => m.meal_type !== 'Desayuno' && m.meal_type !== 'Snack 2');
      dayBMeals = dayBMeals.filter(m => m.meal_type !== 'Desayuno' && m.meal_type !== 'Snack 2');
    } else if (mealSchedule === '3meals') {
      // 3 Meals: Breakfast, Lunch, Dinner. No snacks.
      dayAMeals = dayAMeals.filter(m => m.meal_type !== 'Snack' && m.meal_type !== 'Snack 2');
      dayBMeals = dayBMeals.filter(m => m.meal_type !== 'Snack' && m.meal_type !== 'Snack 2');
    } else {
      // 5 Meals: Keep all
    }

    return {
      patient_name: identity.name || 'Nahuelito', patient_id: `PAC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      tmb: Math.max(0, Math.round(finalTmb * 10) / 10), daily_energy_requirement: Math.max(0, der),
      archetype_label: archLabel,
      clinical_flags: { metabolic_syndrome_risk: metRisk, low_fodmap_active: lowFodmap, glp1_safety_mode: medicationGLP1, blocked_ingredients: [] },
      plan: [
        { label: 'Día A — Entrenamiento', target_calories: Math.round(der * 1.1), total_calories: Math.round(dayAMeals.reduce((acc, m) => acc + m.calories, 0)),
          meals: dayAMeals },
        { label: 'Día B — Descanso', target_calories: Math.round(der * 0.85), total_calories: Math.round(dayBMeals.reduce((acc, m) => acc + m.calories, 0)),
          meals: dayBMeals },
      ],
      llm_narrative: narrative,
    };
  }, [biometrics, archetype, clinicalHardStops, gutHealth, medicationGLP1, mealSchedule, identity.name]);

  // ─── Ceremonia de Desbloqueo (Labor Illusion + API Call) ───
  const handleFinish = async () => {
    if (!identity.name) {
      toast.error('Debes asignar un nombre al paciente para desencriptar el plan.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    // 1. Lanzar la secuencia visual (Labor Illusion)
    let step = 0;
    const advanceStep = () => {
      step++;
      if (step < LABOR_STEPS.length) {
        setProcessingStep(step);
        setTimeout(advanceStep, LABOR_STEPS[step].duration);
      }
    };
    setTimeout(advanceStep, LABOR_STEPS[0].duration);

    // 2. Mientras tanto, llamar al backend (o calcular local)
    let result: PlanResponse;
    try {
      // 2a. Save patient in database (Phase 24 direct funnel)
      const patientPayload = {
        first_name: identity.name?.split(' ')[0] || 'Desconocido',
        last_name: identity.name?.split(' ').slice(1).join(' ') || '',
        email: identity.email || `${Math.random().toString(36).substring(7)}@demo.com`,
        phone: identity.phone || '',
        age: biometrics.age,
        weight_kg: biometrics.weight,
        height_cm: biometrics.height,
        waist_cm: biometrics.waist,
        gender: biometrics.gender,
        activity_level: biometrics.activityLevel,
        archetype: archetype,
        clinical_hard_stops: clinicalHardStops,
        gut_health: gutHealth,
        medication_glp1: medicationGLP1,
        meal_schedule: mealSchedule,
        tenant_id: tenantId || GLOBAL_POOL_TENANT_ID
      };

      await api.post('/api/v1/patients/clinical', patientPayload);

      // 2b. Generate DietQA Plan Preview
      const planPayload = {
        biometrics: {
          weight: biometrics.weight || 75,
          height: biometrics.height || 170,
          age: biometrics.age || 30,
          waist: biometrics.waist || 85,
          gender: biometrics.gender || 'male',
          activity_level: biometrics.activityLevel || 'sedentary',
        },
        archetype: archetype || 'ARQ_01_WELLNESS',
        clinical_hard_stops: clinicalHardStops,
        gut_health: gutHealth,
        medication_glp1: medicationGLP1,
        meal_schedule: mealSchedule,
        patient: { name: identity.name, phone: identity.phone || '', email: identity.email || '' },
        tenant_id: tenantId // Añadimos el tenant_id resuelto
      };
      
      const res = await apiRequest<PlanResponse>('/api/v1/dietqa/generate-plan', {
        method: 'POST',
        headers: { 'X-Tenant-ID': tenantId || GLOBAL_POOL_TENANT_ID },
        body: JSON.stringify(planPayload)
      });
      result = res;
    } catch (e: any) {
      if (e?.response?.status === 409) {
        toast.error('Este correo ya está registrado. Inicia sesión para continuar.', { duration: 5000 });
        setIsProcessing(false);
        return;
      }
      console.warn("Backend fail", e);
      result = computeLocalPlan();
    }

    // 3. Esperar a que la ceremonia visual termine
    const totalLaborTime = LABOR_STEPS.reduce((sum, s) => sum + s.duration, 0);
    await new Promise(r => setTimeout(r, totalLaborTime));

    // 4. Revelar el plan
    setPlanResult(result);
    setIsProcessing(false);
  };

  // ─── Ir al Panel Clínico (Embudo PLG) ───
  const handleGoToDashboard = () => {
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('token', 'demo_b2b_token_123');
    localStorage.setItem('user', JSON.stringify({ email: regEmail, full_name: regName, role: 'nutritionist' }));
    
    // 🛡️ EPHEMERAL HYDRATION (Data Tainting Shield bypass)
    // Guardamos el resultado generado in-memory para que el dashboard lo inyecte
    if (planResult) {
        localStorage.setItem('ephemeral_patient_demo', JSON.stringify(planResult));
    }
    
    toast.success(`Cuenta de consultorio creada con éxito. Panel calibrado.`, { duration: 4500, icon: '🚀' });
    setTimeout(() => { window.location.href = '/nutricionista'; }, 800);
  };

  // ─── 2. GATILLO ZEIGARNIK (Blurred Plan Pre-Render) ───
  const isBlurredPreview = currentBlockIndex === 3 && !planResult;
  const displayPlan = planResult || (isBlurredPreview ? computeLocalPlan() : null);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-50 text-slate-800 flex font-sans z-[9999] overflow-hidden">

      {/* ═══ OVERLAY: Ceremonia de Procesamiento (Labor Illusion) ═══ */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            key="processing-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-slate-900 flex flex-col items-center justify-center"
          >
            <div className="relative w-24 h-24 mb-10">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="w-96 h-1.5 bg-slate-800 rounded-full mb-8 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((processingStep + 1) / LABOR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={processingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="text-emerald-300 text-lg font-medium tracking-wide text-center max-w-md"
              >
                {LABOR_STEPS[processingStep]?.text}
              </motion.p>
            </AnimatePresence>

            <p className="text-slate-600 text-sm mt-6 font-mono">
              Motor DietQA v1.0 — Paso {processingStep + 1} de {LABOR_STEPS.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CAPA: Visualización de Plan Asimétrico (Con Desenfoque para Zeigarnik o Limpio para Resultados) ═══ */}
      <AnimatePresence>
        {displayPlan && !isProcessing && (
          <motion.div
            key="plan-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`fixed inset-0 z-[99998] bg-slate-50 overflow-y-auto transition-all duration-700 ${
              isBlurredPreview ? 'blur-[8px] opacity-40 select-none pointer-events-none' : ''
            }`}
          >
            <div className="max-w-5xl mx-auto py-12 px-8">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
                  {isBlurredPreview ? '🔒 Protocolo Encriptado' : 'Protocolo Desbloqueado'}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-1">
                Plan para {displayPlan.patient_name}
              </h1>
              <p className="text-slate-500 text-lg">ID: {displayPlan.patient_id} — Arquetipo: {displayPlan.archetype_label}</p>

              <div className="grid grid-cols-4 gap-4 mt-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">TMB</span>
                  <span className="text-3xl font-bold text-slate-900">{Math.round(displayPlan.tmb)}</span>
                  <span className="text-sm text-slate-400 ml-1">kcal</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Gasto Diario</span>
                  <span className="text-3xl font-bold text-emerald-600">{Math.round(displayPlan.daily_energy_requirement)}</span>
                  <span className="text-sm text-slate-400 ml-1">kcal</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Riesgo MetS</span>
                  <span className={`text-xl font-bold ${displayPlan.clinical_flags.metabolic_syndrome_risk ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {displayPlan.clinical_flags.metabolic_syndrome_risk ? 'Detectado' : 'Normal'}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Escudos</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {displayPlan.clinical_flags.low_fodmap_active && <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">FODMAP</span>}
                    {displayPlan.clinical_flags.glp1_safety_mode && <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">GLP-1</span>}
                    {!displayPlan.clinical_flags.low_fodmap_active && !displayPlan.clinical_flags.glp1_safety_mode && <span className="text-sm text-slate-400">Ninguno</span>}
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-6">
                {displayPlan.plan.map((day, dayIdx) => (
                  <div key={dayIdx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className={`px-6 py-4 ${dayIdx === 0 ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-slate-50 border-b border-slate-100'}`}>
                      <h3 className={`text-lg font-bold ${dayIdx === 0 ? 'text-emerald-800' : 'text-slate-700'}`}>{day.label}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-slate-500">Objetivo: <strong>{Math.round(day.target_calories)}</strong> kcal</span>
                        <span className="text-sm text-slate-500">Actual: <strong>{Math.round(day.total_calories)}</strong> kcal</span>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {day.meals.map((meal, mealIdx) => (
                        <div key={mealIdx} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600">
                              <ChefHat className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-800 block">{meal.name}</span>
                              <span className="text-[11px] text-slate-400">{meal.meal_type} — {meal.prep_time} min</span>
                              {meal.substitutions.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {meal.substitutions.map((sub, si) => (
                                    <span key={si} className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                      {sub.original} → {sub.replacement}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-800 block">{meal.calories} kcal</span>
                            <span className="text-[10px] text-slate-400">P{meal.protein} C{meal.carbs} G{meal.fats}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Narrativa Clínica — Motor DietQA</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {displayPlan.llm_narrative}
                </p>
              </div>

              {!isBlurredPreview && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={handleGoToDashboard}
                    className="px-10 py-5 rounded-2xl text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center shadow-xl shadow-emerald-600/20 hover:shadow-emerald-500/30"
                  >
                    Ir al Panel Clínico
                    <ArrowRightCircle className="w-6 h-6 ml-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ OVERLAY: Gatillo Zeigarnik (Bloque 4 / Desbloqueo) ═══ */}
      {isBlurredPreview && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/65 backdrop-blur-[2px] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg relative z-10"
          >
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-900/10">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-2 flex items-center gap-2">
              🔒 Protocolo Desencriptado
            </h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              El plan nutricional asimétrico ha sido calibrado por el motor de grafos. Asigna la identidad de tu paciente para revelar las métricas completas y recetas.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nombre del Paciente</label>
                <input 
                  type="text" 
                  placeholder="Ej. Ana Gómez" 
                  value={identity.name}
                  onChange={(e) => setIdentity({ name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email del Paciente (Para envío de plan)</label>
                <input 
                  type="email" 
                  placeholder="paciente@correo.com" 
                  value={identity.email || ''}
                  onChange={(e) => setIdentity({ email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">WhatsApp / Teléfono (Opcional)</label>
                <input 
                  type="tel" 
                  placeholder="+54 9 11..." 
                  value={identity.phone}
                  onChange={(e) => setIdentity({ phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800" 
                />
              </div>
            </div>
            <button 
              onClick={handleFinish} 
              disabled={!identity.name || !identity.email || isProcessing}
              className={`mt-8 w-full py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
                identity.name && identity.email
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:scale-[1.02]' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Unlock className="w-4 h-4" /> Desbloquear Protocolo
            </button>
          </motion.div>
        </div>
      )}

      {/* ═══ OVERLAY: Registro/Captación PLG (Intercepción de Cuenta al final) ═══ */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            key="register-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg text-slate-800"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <Flame className="w-6 h-6" />
              </div>
              
              <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-2">🚀 Plan de {planResult?.patient_name} Calibrado</h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                El plan ha sido auto-guardado en tu base de datos clínica. Crea tu cuenta gratuita de **AUREA Pro Suite** para acceder al panel de mando de pacientes y compartírselo.
              </p>
              
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nombre del Profesional</label>
                  <input 
                    type="text" 
                    required 
                    value={regName} 
                    onChange={(e) => setRegName(e.target.value)} 
                    placeholder="Ej. Dra. Karen Nutricionista" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email del Consultorio</label>
                  <input 
                    type="email" 
                    required 
                    value={regEmail} 
                    onChange={(e) => setRegEmail(e.target.value)} 
                    placeholder="ejemplo@consultorio.com" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Contraseña Segura</label>
                  <input 
                    type="password" 
                    required 
                    value={regPassword} 
                    onChange={(e) => setRegPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800" 
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterModal(false)}
                    className="px-5 py-3 rounded-xl text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm flex-1 border border-slate-200 hover:bg-slate-50"
                  >
                    Volver
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-3 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex-[2] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    Registrar y Entrar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Área Izquierda: Contenido Principal (Wizard Steps) ═══ */}
      {!displayPlan && (
        <div className="flex-1 max-w-4xl mx-auto flex flex-col pt-16 px-12 relative z-10 h-screen overflow-y-auto pb-32">
          
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Protocolo "Primer Paciente"</h1>
            <p className="text-slate-600 text-lg">Carga a tu primer paciente para que nuestra IA ajuste todo el consultorio a tu estilo de trabajo.</p>
          </header>

          <div className="relative flex-1">
            <AnimatePresence mode="wait">
              
              {/* BLOQUE 1: BIOMETRÍA AVANZADA */}
              {currentBlockIndex === 0 && (
                <motion.div key="block1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-3 shadow-sm">1</span>
                    Biometría y Gasto Energético
                  </h2>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-2 gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                      <motion.div className="h-full bg-emerald-500" animate={{ width: `${Math.min((metabolicCalculations.der / 4000) * 100, 100)}%` }} transition={{ type: "spring", stiffness: 50 }} />
                    </div>
                    {/* Género */}
                    <div className="col-span-2 flex space-x-4 mb-2">
                      {['male', 'female'].map((g) => (
                        <button key={g} onClick={() => handleGenderSelect(g as 'male' | 'female')}
                          className={`px-8 py-4 rounded-xl border-2 transition-all duration-200 flex-1 font-medium text-lg ${biometrics.gender === g ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                          {g === 'male' ? 'Hombre' : 'Mujer'}
                        </button>
                      ))}
                    </div>
                    {/* Sliders */}
                    {[
                      { label: 'Peso Corporal', key: 'weight', min: 40, max: 150, unit: 'kg', val: biometrics.weight || 75 },
                      { label: 'Circunferencia Abdominal', key: 'waist', min: 50, max: 150, unit: 'cm', val: biometrics.waist || 85 },
                      { label: 'Estatura', key: 'height', min: 140, max: 220, unit: 'cm', val: biometrics.height || 170 },
                      { label: 'Edad', key: 'age', min: 16, max: 90, unit: 'años', val: biometrics.age || 30 },
                    ].map((s) => (
                      <div key={s.key} className="space-y-5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-500 font-medium text-sm">{s.label}</span>
                          <span className="text-3xl font-bold text-slate-800">{s.val} <span className="text-lg text-slate-400 font-medium">{s.unit}</span></span>
                        </div>
                        <input type="range" min={s.min} max={s.max} value={s.val}
                          onChange={(e) => setBiometrics({ [s.key]: parseInt(e.target.value) } as any)}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                      </div>
                    ))}
                    {/* PAL */}
                    <div className="col-span-2 pt-4 border-t border-slate-100">
                      <span className="text-slate-500 font-medium mb-4 block">Nivel de Actividad Física (PAL)</span>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'sedentary', label: 'Sedentario', sub: 'Oficina / Auto', icon: Monitor },
                          { id: 'light', label: 'Ligero', sub: 'Caminante / 3x sem', icon: Footprints },
                          { id: 'active', label: 'Intenso', sub: 'Atleta / 5x sem', icon: Dumbbell },
                        ].map((pal) => (
                          <button key={pal.id} onClick={() => setBiometrics({ activityLevel: pal.id as any })}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${biometrics.activityLevel === pal.id ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                            <pal.icon className={`w-6 h-6 mb-2 ${biometrics.activityLevel === pal.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="font-bold text-sm">{pal.label}</span>
                            <span className="text-[10px] mt-1 opacity-80">{pal.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* BLOQUE 2: ARQUETIPOS */}
              {currentBlockIndex === 1 && (
                <motion.div key="block2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-3 shadow-sm">2</span>
                    Perfil y Objetivos (Arquetipo)
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {archetypes.map((arq) => (
                      <button key={arq.id} onClick={() => setArchetype(arq.id)}
                        className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 relative ${archetype === arq.id ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-4 ring-emerald-500/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className={`p-3 rounded-lg ${archetype === arq.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <arq.icon className="w-6 h-6" />
                          </div>
                          {archetype === arq.id && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                        </div>
                        <div className={`text-xl font-bold mb-2 ${archetype === arq.id ? 'text-emerald-900' : 'text-slate-800'}`}>{arq.label}</div>
                        <div className={`text-sm leading-relaxed ${archetype === arq.id ? 'text-emerald-700' : 'text-slate-500'}`}>{arq.desc}</div>
                      </button>
                    ))}
                  </div>
                  {archetype === 'ARQ_CUSTOM' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 mt-6 bg-slate-800 rounded-xl border border-slate-700 flex items-start space-x-4 shadow-lg">
                      <PlusCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">Modo Manual Activado</h4>
                        <p className="text-slate-300 leading-relaxed">Al seleccionar este arquetipo, el motor paramétrico se apaga temporalmente. La plataforma te pedirá configurar las reglas manualmente.</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* BLOQUE 3: CORTAFUEGOS CLÍNICO */}
              {currentBlockIndex === 2 && (
                <motion.div key="block3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8 pb-10">
                  <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold mr-3 shadow-sm">3</span>
                    Evaluación Clínica y Restricciones
                  </h2>
                  <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex items-start space-x-4 mb-6">
                      <ShieldAlert className="w-6 h-6 text-rose-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-slate-900 font-bold block mb-1 text-lg">Alergias y Exclusiones</span>
                        <p className="text-slate-500 text-sm">El motor de IA bloqueará cualquier sugerencia de menú que cruce estos límites.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {hardStops.map((stop) => (
                        <button key={stop.id} onClick={() => toggleClinicalHardStop(stop.id)}
                          className={`px-5 py-3 rounded-lg font-semibold border-2 transition-all ${clinicalHardStops.includes(stop.id) ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {stop.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-slate-900 font-bold block mb-4 text-lg">Estado Gastrointestinal Actual</span>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'perfect', label: '🟢 Perfecta', sub: 'Sin molestias' },
                        { id: 'bloated', label: '🟡 Hinchazón', sub: 'Gases post-comida' },
                        { id: 'irregular', label: '🔴 Irregular', sub: 'SIBO / Tránsito Lento' },
                      ].map((gut) => (
                        <button key={gut.id} onClick={() => setGutHealth(gut.id as any)}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${gutHealth === gut.id ? 'bg-slate-800 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                          <span className="font-bold text-sm">{gut.label}</span>
                          <span className={`text-[10px] mt-1 ${gutHealth === gut.id ? 'text-slate-300' : 'text-slate-400'}`}>{gut.sub}</span>
                        </button>
                      ))}
                    </div>
                    {(gutHealth === 'bloated' || gutHealth === 'irregular') && (
                      <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center">
                        <ActivitySquare className="w-4 h-4 mr-2" />Protocolo Low-FODMAP activado. Reduciendo vegetales fermentables.
                      </motion.div>
                    )}
                  </div>
                  {/* Conveniencia de Horarios y Frecuencia de Ingestas */}
                  <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-slate-900 font-bold block mb-2 text-lg">Conveniencia de Horarios y Frecuencia</span>
                    <p className="text-slate-500 text-sm mb-4">Alinea la distribución de nutrientes con el estilo de vida y tiempos de tu paciente.</p>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: '3meals', label: '⏰ 3 Comidas', sub: 'Desayuno, Almuerzo, Cena' },
                          { id: '5meals', label: '🍎 5 Ingestas', sub: 'Incluye Colaciones' },
                          { id: 'fasting', label: '⏳ Ayuno 16:8', sub: 'Omite Desayuno' },
                        ].map((sched) => (
                          <button key={sched.id} onClick={() => setMealSchedule(sched.id as any)}
                            type="button"
                            disabled={sched.id === 'fasting' && medicationGLP1}
                            className={`group p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all relative ${
                              sched.id === 'fasting' && medicationGLP1 
                                ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                                : mealSchedule === sched.id 
                                  ? 'bg-slate-800 border-slate-900 text-white shadow-sm ring-2 ring-slate-800/10' 
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}>
                            {sched.id === 'fasting' && medicationGLP1 && (
                              <div className="absolute top-2 right-2 text-slate-400">
                                <Lock className="w-4 h-4" />
                                <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-tight border border-slate-700">
                                  <span className="font-bold text-emerald-400 block mb-0.5">Bloqueo Clínico Activo</span>
                                  La interacción con sensibilizadores de insulina hace que los ayunos prolongados sean riesgosos. Tu seguridad es primero.
                                </div>
                              </div>
                            )}
                            <span className="font-bold text-sm">{sched.label}</span>
                            <span className={`text-[10px] mt-1 text-center leading-tight ${mealSchedule === sched.id ? 'text-slate-300' : 'text-slate-400'}`}>{sched.sub}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-slate-900 font-bold block text-lg">Fármacos Alteradores Metabólicos</span>
                      <p className="text-slate-500 text-sm mt-1">¿Paciente bajo tratamiento con Insulina o GLP-1 (Ozempic/Wegovy)?</p>
                    </div>
                    <button onClick={() => setMedicationGLP1(!medicationGLP1)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${medicationGLP1 ? 'bg-rose-500' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${medicationGLP1 ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {medicationGLP1 && (
                    <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center">
                      <ShieldAlert className="w-4 h-4 mr-2" />Riesgo de hipoglucemia monitoreado. Bloqueando ayunos prolongados.
                    </motion.div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer de navegación */}
          <footer className="fixed bottom-0 left-0 w-[calc(100vw-400px)] bg-slate-50/90 backdrop-blur-lg py-5 px-8 md:px-12 flex justify-between items-center border-t border-slate-200 z-40">
            <div className="flex items-center">
              <button onClick={loadDummyPatient} className="px-4 py-2.5 rounded-lg font-medium text-sm text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">Cargar Auto-Demo</button>
            </div>
            <div className="flex items-center space-x-3">
              {currentBlockIndex > 0 && (
                <button onClick={prevBlock} className="px-5 py-3 font-medium text-slate-500 hover:text-slate-800 transition-colors">Volver</button>
              )}
              <button onClick={nextBlock} className="px-8 py-3.5 rounded-xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center shadow-lg hover:shadow-xl">
                Siguiente <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ═══ Área Derecha: Metabolic Radar (Asistente Analítico) ═══ */}
      {!displayPlan && (
        <div className="w-[400px] bg-white border-l border-slate-200 p-8 flex flex-col relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] h-screen overflow-y-auto">
          <div className="sticky top-0">
            <div className="mb-8">
              <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2" />Asistente Clínico IA
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">Analiza tus selecciones en tiempo real para calcular las métricas base.</p>
            </div>
            
            {/* METABOLIC RADAR CARD */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden shadow-inner">
              <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${isCalculating ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              <div className="flex items-center space-x-3 mb-4">
                {isCalculating ? (
                  <div className="w-5 h-5 rounded-full border-2 border-amber-200 border-t-amber-500 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /></div>
                )}
                <span className={`text-sm font-bold uppercase tracking-wide ${isCalculating ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {isCalculating ? 'Calculando Variables...' : 'Métricas Analizadas'}
                </span>
              </div>
              
              <p className="text-slate-700 font-semibold leading-relaxed mb-6 text-sm">
                {!biometrics.gender 
                  ? 'Esperando el ingreso de biometría base...' 
                  : `Estimación reactiva: Gasto Diario de ${metabolicCalculations.der} kcal (TMB: ${metabolicCalculations.tmb} kcal).`}
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <div className="text-xs uppercase font-bold text-slate-400 tracking-wider flex justify-between items-center">
                  <span>Resumen del Paciente</span>
                  <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-mono">LIVE TELEMETRY</span>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm text-sm">
                  {identity.name && (
                    <div className="border-b border-slate-100 pb-3 mb-3">
                      <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Paciente Asignado</span>
                      <span className="text-sm font-bold text-slate-900 flex items-center"><Unlock className="w-3 h-3 text-emerald-500 mr-2" />{identity.name}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Cuerpo</span>
                      <span className="text-sm font-semibold text-slate-700 block">{biometrics.weight || 0}kg • {biometrics.height || 0}cm</span>
                      <span className="text-[11px] text-slate-500 font-mono">Cintura: {biometrics.waist || 0}cm</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Perfil Base</span>
                      <span className="text-sm font-semibold text-slate-700 block capitalize">{biometrics.age || 0} años • {biometrics.gender === 'male' ? 'H' : biometrics.gender === 'female' ? 'M' : '?'}</span>
                      <span className="text-[11px] text-slate-500 capitalize">PAL: {biometrics.activityLevel || 'sedentary'}</span>
                    </div>
                  </div>
                  
                  {/* DYNAMIC METS SEMAPHORE */}
                  <div className="border-t border-slate-100 pt-3">
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Semáforo de Riesgo MetS</span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded border inline-block tracking-wide transition-all duration-300 ${
                      metabolicCalculations.metRisk 
                        ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm animate-pulse' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      {metabolicCalculations.metRisk ? '⚠️ SÍNDROME METABÓLICO DETECTADO' : '✅ CONTROL METABÓLICO ÓPTIMO'}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Objetivo Algorítmico</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-100">
                      {archetypes.find(a => a.id === archetype)?.label || "Pendiente de selección"}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-2">Salud y Restricciones</span>
                    <div className="space-y-2">
                      {clinicalHardStops.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {clinicalHardStops.map(stop => (
                            <span key={stop} className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-1 rounded">{hardStops.find(h => h.id === stop)?.label}</span>
                          ))}
                        </div>
                      )}
                      {gutHealth !== 'perfect' && (
                        <div className="flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 w-fit">
                          <ActivitySquare className="w-3 h-3 mr-1" />Tránsito Digestivo Comprometido
                        </div>
                      )}
                      {medicationGLP1 && (
                        <div className="flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100 w-fit">
                          <ShieldAlert className="w-3 h-3 mr-1" /> Ozempic / GLP-1 Active
                        </div>
                      )}
                      {clinicalHardStops.length === 0 && gutHealth === 'perfect' && !medicationGLP1 && (
                        <span className="text-xs text-slate-400 font-medium">Sin advertencias clínicas.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
