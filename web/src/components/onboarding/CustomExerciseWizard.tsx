import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Save, Dumbbell, Activity, Info, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CustomExerciseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exerciseData: any) => void;
}

export const CustomExerciseWizard: React.FC<CustomExerciseWizardProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    muscle: '',
    equipment: '',
    axialLoad: 'NO',
    impact: 'Medio'
  });

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleSave = () => {
    // Generar la estructura técnica que requiere la IA a partir de las respuestas amigables
    const technicalData = {
      ID_Ejercicio: `CUSTOM_${uuidv4().substring(0, 8).toUpperCase()}`,
      Nombre_Oficial: formData.name,
      Alias_Buscador: formData.alias,
      Patron_Movimiento: 'Personalizado', // Valor por defecto
      Lateralidad: 'Bilateral', // Valor por defecto
      Carga_Axial: formData.axialLoad,
      Musculo_Agonista: formData.muscle || 'Varios',
      Musculos_Sinergistas: '',
      Equipamiento_Requerido: formData.equipment || 'Peso Corporal',
      Nivel_Habilidad: '3', // Nivel medio por defecto
      Nivel_Impacto_Articular: formData.impact
    };
    
    onSave(technicalData);
    onClose();
    // Reset state for next time
    setTimeout(() => {
      setStep(1);
      setFormData({
        name: '', alias: '', muscle: '', equipment: '', axialLoad: 'NO', impact: 'Medio'
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-tight">Crear Ejercicio</h2>
              <p className="text-xs font-medium text-slate-500">Paso {step} de 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 flex">
          <div className={`h-full bg-indigo-500 transition-all duration-300 ease-out`} style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Body */}
        <div className="p-6 relative min-h-[320px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">¿Cómo se llama tu ejercicio?</h3>
                  <p className="text-sm text-slate-500 mb-6">Elige un nombre claro para que sea fácil encontrarlo luego.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Nombre Principal</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ej: Curl de Bíceps Inclinado"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        Otros nombres (Opcional)
                        <Info className="w-3 h-3 text-slate-400" />
                      </label>
                      <input 
                        type="text" 
                        value={formData.alias}
                        onChange={e => setFormData({...formData, alias: e.target.value})}
                        placeholder="Ej: Incline Bicep Curl, Curl inclinado"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">¿Qué entrena principalmente?</h3>
                  <p className="text-sm text-slate-500 mb-6">Esta información ayuda a organizar tu biblioteca.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Músculo Objetivo</label>
                      <select 
                        value={formData.muscle}
                        onChange={e => setFormData({...formData, muscle: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                      >
                        <option value="">Selecciona un músculo...</option>
                        <option value="Pectoral">Pectoral</option>
                        <option value="Dorsal">Dorsal / Espalda</option>
                        <option value="Cuádriceps">Cuádriceps</option>
                        <option value="Isquiosurales">Isquiosurales</option>
                        <option value="Glúteo">Glúteo</option>
                        <option value="Hombros">Hombros</option>
                        <option value="Bíceps">Bíceps</option>
                        <option value="Tríceps">Tríceps</option>
                        <option value="Core">Core / Abdomen</option>
                        <option value="Varios">Varios / Full Body</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Equipamiento Necesario</label>
                      <select 
                        value={formData.equipment}
                        onChange={e => setFormData({...formData, equipment: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                      >
                        <option value="">Selecciona el equipo...</option>
                        <option value="Peso Corporal">Ninguno (Peso Corporal)</option>
                        <option value="Mancuernas">Mancuernas</option>
                        <option value="Barra Olímpica">Barra Libre</option>
                        <option value="Máquina">Máquina</option>
                        <option value="Polea">Polea / Cables</option>
                        <option value="Kettlebell">Kettlebell</option>
                        <option value="Banda Elástica">Banda Elástica</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Detalles Adicionales</h3>
                  <p className="text-sm text-slate-500 mb-6">Si no estás seguro, puedes dejar los valores por defecto.</p>
                  
                  <div className="space-y-5">
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <label className="block text-sm font-bold text-orange-900 mb-1">¿Genera compresión en la columna?</label>
                        <p className="text-xs text-orange-700/80 mb-3">Ej: La sentadilla con barra comprime la columna (Axial = Sí). La prensa de piernas no (Axial = No).</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setFormData({...formData, axialLoad: 'SÍ'})}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${formData.axialLoad === 'SÍ' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-orange-600 border border-orange-200'}`}
                          >
                            SÍ
                          </button>
                          <button 
                            onClick={() => setFormData({...formData, axialLoad: 'NO'})}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${formData.axialLoad === 'NO' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" /> Nivel de Impacto Articular
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Bajo', 'Medio', 'Alto'].map(level => (
                          <button
                            key={level}
                            onClick={() => setFormData({...formData, impact: level})}
                            className={`py-2 rounded-xl text-sm font-bold transition-all border ${formData.impact === level ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {step > 1 ? (
            <button 
              onClick={handlePrev}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
            >
              Atrás
            </button>
          ) : <div />}
          
          {step < 3 ? (
            <button 
              onClick={handleNext}
              disabled={step === 1 && !formData.name.trim()}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Guardar Ejercicio
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
