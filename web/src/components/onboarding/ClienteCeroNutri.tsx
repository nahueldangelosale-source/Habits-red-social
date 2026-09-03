import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ShieldAlert, Activity, Coffee, Target, CheckCircle2, Monitor, Footprints, Dumbbell, AlertTriangle, ArrowRight, HeartPulse, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ClienteCeroNutri() {
  const navigate = useNavigate();
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Data State
  const [biometrics, setBiometrics] = useState({ gender: '', age: 30, weight: 75, height: 170, waist: 85, activityLevel: 'sedentary' });
  const [medications, setMedications] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [gastro, setGastro] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState({ shiftWorker: 'No', dietType: 'Omnívoro', aversions: '' });
  const [primaryGoal, setPrimaryGoal] = useState('');

  const nextBlock = () => setCurrentBlockIndex(s => Math.min(s + 1, 4));
  const prevBlock = () => setCurrentBlockIndex(s => Math.max(s - 1, 0));

  const toggleArray = (arr: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    if (arr.includes(val)) setter(arr.filter(i => i !== val));
    else setter([...arr, val]);
  };

  // Realtime Computations
  const computed = useMemo(() => {
    let baseTmb = 10 * biometrics.weight + 6.25 * biometrics.height - 5 * biometrics.age;
    let tmb = biometrics.gender === 'M' ? baseTmb + 5 : biometrics.gender === 'F' ? baseTmb - 161 : baseTmb;
    let palValue = biometrics.activityLevel === 'sedentary' ? 1.2 : biometrics.activityLevel === 'light' ? 1.55 : 1.9;
    let der = Math.round(tmb * palValue);
    let metRisk = (biometrics.gender === 'M' && biometrics.waist > 90) || (biometrics.gender === 'F' && biometrics.waist > 85);
    
    return { tmb: Math.round(tmb), der, metRisk };
  }, [biometrics]);

  // Fake loading effect on change
  useEffect(() => {
    setIsCalculating(true);
    const t = setTimeout(() => setIsCalculating(false), 500);
    return () => clearTimeout(t);
  }, [biometrics, medications, allergies, gastro, primaryGoal]);

  const archetypes = [
    { id: 'Longevidad', title: 'Longevidad y Prevención', desc: 'Salud metabólica general y aging saludable.', icon: HeartPulse },
    { id: 'Hipertrofia', title: 'Fuerza y Masa Muscular', desc: 'Priorizar el anabolismo y rendimiento físico.', icon: Activity },
    { id: 'Grasa', title: 'Pérdida de Grasa', desc: 'Déficit calórico estratégico y retención muscular.', icon: Target },
    { id: 'Salud', title: 'Recuperación Clínica', desc: 'Abordar síntomas digestivos, inflamación o fatiga.', icon: ShieldAlert }
  ];

  const handleFinish = async () => {
    try {
        setIsCalculating(true);
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const token = localStorage.getItem('auth_token');
        
        // Formar el payload para el motor DietQA
        const payload = {
            patient: {
                id: '00000000-0000-0000-0000-000000000000',
                name: 'Cliente Cero',
                email: 'cliente@cero.com'
            },
            biometrics: {
                weight: biometrics.weight,
                height: biometrics.height,
                age: biometrics.age,
                gender: biometrics.gender === 'M' ? 'male' : 'female',
                activity_level: biometrics.activityLevel
            },
            archetype: primaryGoal === 'Grasa' ? 'fat_loss' : primaryGoal === 'Hipertrofia' ? 'muscle_gain' : primaryGoal === 'Salud' ? 'therapeutic' : 'general',
            clinical_hard_stops: [...allergies, ...medications],
            gut_health: gastro.length > 0 ? 'dysbiosis' : 'optimal',
            medication_glp1: medications.includes('GLP-1 (Ozempic/Wegovy)')
        };

        const response = await fetch(`${BASE_URL}/api/v1/dietqa/generate-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            toast.success('Perfil Metabólico procesado y encriptado exitosamente.');
            setTimeout(() => {
                navigate('/nutricionista');
            }, 1500);
        } else {
            toast.error('Error al generar el plan clínico.');
        }
    } catch (error) {
        console.error('API Error:', error);
        toast.error('Error de conexión con el motor nutricional.');
    } finally {
        setIsCalculating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* ÁREA IZQUIERDA: CONTENIDO PRINCIPAL WIZARD */}
      <div className="flex-1 max-w-4xl mx-auto flex flex-col pt-16 px-12 relative z-10 h-screen overflow-y-auto pb-32">
        
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Alta Nutricional Clínica</h1>
          <p className="text-slate-600 text-lg">Define los "Hard-Stops" biométricos para que el motor DietQA opere con 100% de seguridad médica.</p>
        </header>

        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            
            {/* BLOQUE 0: BIOMETRÍA */}
            {currentBlockIndex === 0 && (
              <motion.div key="block0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-3 shadow-sm">1</span>
                  Biometría y Termodinámica
                </h2>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-2 gap-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div className="h-full bg-emerald-500" animate={{ width: `${Math.min((computed.der / 4000) * 100, 100)}%` }} transition={{ type: "spring", stiffness: 50 }} />
                  </div>
                  
                  {/* Género */}
                  <div className="col-span-2 flex space-x-4 mb-2">
                    {['M', 'F'].map((g) => (
                      <button key={g} onClick={() => setBiometrics({...biometrics, gender: g})}
                        className={`px-8 py-4 rounded-xl border-2 transition-all duration-200 flex-1 font-medium text-lg ${biometrics.gender === g ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        {g === 'M' ? 'Masculino Biológico' : 'Femenino Biológico'}
                      </button>
                    ))}
                  </div>

                  {/* Sliders */}
                  {[
                    { label: 'Peso Corporal', key: 'weight', min: 40, max: 150, unit: 'kg' },
                    { label: 'Cintura (Riesgo MetS)', key: 'waist', min: 50, max: 150, unit: 'cm' },
                    { label: 'Estatura', key: 'height', min: 140, max: 220, unit: 'cm' },
                    { label: 'Edad', key: 'age', min: 16, max: 90, unit: 'años' },
                  ].map((s) => (
                    <div key={s.key} className="space-y-5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 font-medium text-sm">{s.label}</span>
                        <span className="text-3xl font-bold text-slate-800">{(biometrics as any)[s.key]} <span className="text-lg text-slate-400 font-medium">{s.unit}</span></span>
                      </div>
                      <input type="range" min={s.min} max={s.max} value={(biometrics as any)[s.key]}
                        onChange={(e) => setBiometrics({ ...biometrics, [s.key]: parseInt(e.target.value) })}
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
                        <button key={pal.id} onClick={() => setBiometrics({ ...biometrics, activityLevel: pal.id })}
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

            {/* BLOQUE 1: RESTRICCIONES MÉDICAS */}
            {currentBlockIndex === 1 && (
              <motion.div key="block1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-3 shadow-sm">2</span>
                  Restricciones Médicas y Alergias (Hard Stops)
                </h2>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-500 mb-4">1. Sensibilizadores y Farmacología</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Insulina', 'Metformina', 'GLP-1 (Ozempic/Wegovy)', 'T4 (Levotiroxina)'].map(item => (
                        <button key={item} onClick={() => toggleArray(medications, setMedications, item)}
                          className={`px-4 py-4 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${medications.includes(item) ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-500 mb-4">2. Alergias e Intolerancias Absolutas</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Celiaquía (Gluten)', 'Alergia Lácteos', 'Frutos Secos', 'Mariscos'].map(item => (
                        <button key={item} onClick={() => toggleArray(allergies, setAllergies, item)}
                          className={`px-4 py-4 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${allergies.includes(item) ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-500 mb-4">3. Cuadro Gastrointestinal</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['SIBO Activo', 'Intestino Irritable', 'Enf. Crohn', 'Refluje/Gastritis'].map(item => (
                        <button key={item} onClick={() => toggleArray(gastro, setGastro, item)}
                          className={`px-4 py-4 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${gastro.includes(item) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* BLOQUE 2: LIFESTYLE */}
            {currentBlockIndex === 2 && (
              <motion.div key="block2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-3 shadow-sm">3</span>
                  Cronobiología y Ética Logística
                </h2>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-500 mb-4">Trabajo por turnos / Nocturno</label>
                    <div className="flex gap-4">
                      {['No (Horario regular)', 'Sí (Turno rotativo o nocturno)'].map(val => (
                        <button key={val} onClick={() => setLifestyle({...lifestyle, shiftWorker: val})}
                          className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold ${lifestyle.shiftWorker === val ? 'bg-sky-50 border-sky-500 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-500 mb-4">Inclinación Ética / Dieta</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Omnívoro', 'Vegetariano', 'Vegano', 'Pescetariano'].map(val => (
                        <button key={val} onClick={() => setLifestyle({...lifestyle, dietType: val})}
                          className={`py-4 rounded-xl border-2 transition-all font-bold text-sm ${lifestyle.dietType === val ? 'bg-sky-50 border-sky-500 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-500 mb-4">Aversiones Severas</label>
                    <textarea 
                      placeholder="Ej. Detesto el brócoli, odio el pescado. (Solo ingresar exclusiones reales)"
                      value={lifestyle.aversions}
                      onChange={e => setLifestyle({...lifestyle, aversions: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 min-h-[120px]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* BLOQUE 3: ARQUETIPO OBJETIVO */}
            {currentBlockIndex === 3 && (
              <motion.div key="block3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-3 shadow-sm">4</span>
                  Asignación de Arquetipo Clínico
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  {archetypes.map((arq) => (
                    <button key={arq.id} onClick={() => setPrimaryGoal(arq.id)}
                      className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 relative ${primaryGoal === arq.id ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-4 ring-emerald-500/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-3 rounded-lg ${primaryGoal === arq.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <arq.icon className="w-6 h-6" />
                        </div>
                        {primaryGoal === arq.id && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                      </div>
                      <div className={`text-xl font-bold mb-2 ${primaryGoal === arq.id ? 'text-emerald-900' : 'text-slate-800'}`}>{arq.title}</div>
                      <div className={`text-sm leading-relaxed ${primaryGoal === arq.id ? 'text-emerald-700' : 'text-slate-500'}`}>{arq.desc}</div>
                    </button>
                  ))}
                </div>

                {primaryGoal && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="pt-8">
                    <button onClick={handleFinish} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl text-lg flex items-center justify-center shadow-xl hover:shadow-2xl transition-all">
                      Confirmar y Generar Expediente <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* FOOTER NAVEGACIÓN */}
        <footer className="fixed bottom-0 left-0 w-[calc(100vw-400px)] bg-slate-50/90 backdrop-blur-lg py-5 px-8 md:px-12 flex justify-between items-center border-t border-slate-200 z-40">
          <div className="flex items-center text-sm font-bold text-slate-400">
            Paso {currentBlockIndex + 1} de 4
          </div>
          <div className="flex items-center space-x-3">
            {currentBlockIndex > 0 && (
              <button onClick={prevBlock} className="px-5 py-3 font-medium text-slate-500 hover:text-slate-800 transition-colors">Volver</button>
            )}
            {currentBlockIndex < 3 && (
              <button onClick={nextBlock} className="px-8 py-3.5 rounded-xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center shadow-lg hover:shadow-xl">
                Siguiente <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* ÁREA DERECHA: RADAR METABÓLICO CLÍNICO */}
      <div className="w-[400px] bg-white border-l border-slate-200 p-8 flex flex-col relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] h-screen overflow-y-auto">
        <div className="sticky top-0">
          <div className="mb-8">
            <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />Asistente Clínico IA
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">Procesamiento determinista de restricciones absolutas en tiempo real.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden shadow-inner">
            <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${isCalculating ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            
            <div className="flex items-center space-x-3 mb-6">
              {isCalculating ? (
                <div className="w-5 h-5 rounded-full border-2 border-amber-200 border-t-amber-500 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /></div>
              )}
              <span className={`text-sm font-bold uppercase tracking-wide ${isCalculating ? 'text-amber-600' : 'text-emerald-700'}`}>
                {isCalculating ? 'Evaluando...' : 'Telemetría Base'}
              </span>
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-200 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm text-sm">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Cuerpo</span>
                    <span className="text-sm font-semibold text-slate-700 block">{biometrics.weight}kg • {biometrics.height}cm</span>
                    <span className="text-[11px] text-slate-500 font-mono">Cintura: {biometrics.waist}cm</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Perfil Base</span>
                    <span className="text-sm font-semibold text-slate-700 block">{biometrics.age} años • {biometrics.gender || '?'}</span>
                    <span className="text-[11px] text-slate-500 capitalize">PAL: {biometrics.activityLevel}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Termodinámica Calculada</span>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-slate-800">{computed.der} <span className="text-xs text-slate-500 font-normal">kcal/día</span></span>
                    <span className="text-xs text-slate-400">TMB: {computed.tmb}</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-3">
                  <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Alerta: Síndrome Metabólico</span>
                  <span className={`text-xs font-extrabold px-2.5 py-1.5 rounded border inline-block tracking-wide transition-all duration-300 ${
                    computed.metRisk && biometrics.gender !== ''
                      ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm animate-pulse' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    {computed.metRisk && biometrics.gender !== '' ? '⚠️ RIESGO DETECTADO (>LÍMITE)' : '✅ CONTROL METABÓLICO ÓPTIMO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hard Stops Visualizer */}
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Firewall Activo</h4>
            
            <AnimatePresence>
              {medications.length > 0 && (
                <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex flex-col gap-1">
                  <div className="flex items-center"><ShieldAlert className="w-4 h-4 mr-2" /> <span>Bloqueo Farmacológico</span></div>
                  <span className="text-rose-600 font-normal ml-6">{medications.join(', ')}</span>
                </motion.div>
              )}
              {allergies.length > 0 && (
                <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold flex flex-col gap-1 mt-2">
                  <div className="flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> <span>Exclusión Absoluta (Alergias)</span></div>
                  <span className="text-amber-600 font-normal ml-6">{allergies.join(', ')}</span>
                </motion.div>
              )}
              {gastro.length > 0 && (
                <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 text-xs font-semibold flex flex-col gap-1 mt-2">
                  <div className="flex items-center"><Activity className="w-4 h-4 mr-2" /> <span>Escudo Intestinal (Low-FODMAP)</span></div>
                  <span className="text-indigo-600 font-normal ml-6">{gastro.join(', ')}</span>
                </motion.div>
              )}
              {medications.length === 0 && allergies.length === 0 && gastro.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2 border-2 border-dashed border-slate-200 rounded-lg text-center">
                  Ningún bloqueo detectado aún
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
