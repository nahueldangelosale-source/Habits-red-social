import React from 'react';
import type { LibraryItem } from '../../stores/useTemplateLibraryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Dumbbell, Award, ArrowRight, Flame, 
  Clock, ChefHat, FileText, Download, ExternalLink, 
  Edit3, UserPlus, Salad, BookOpen, Layers, CheckCircle2
} from 'lucide-react';

interface TemplatePreviewProps {
  isOpen?: boolean;
  template: LibraryItem;
  folderId?: string;
  onClose: () => void;
  onAssign: () => void;
  onEditTemplate?: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  isOpen = true,
  template, 
  onClose, 
  onAssign, 
  onEditTemplate 
}) => {
  if (!isOpen || !template) return null;

  const isNutrition = template.type === 'MEAL_PLAN' || template.category === 'NUTRITION';
  const isRecipe = template.type === 'RECIPE' || template.category === 'RECIPES';
  const isDocument = template.type === 'DOCUMENT' || template.category === 'DOCUMENTS';
  const isWorkout = !isNutrition && !isRecipe && !isDocument;

  // Calculos para entrenamiento
  const totalPhases = template.phases?.length || 0;
  const totalDays = (template.phases || []).reduce((acc, phase) => acc + (phase.days?.length || 0), 0);
  const totalExercises = (template.phases || []).reduce((acc, phase) => {
    return acc + (phase.days || []).reduce((dAcc, day) => {
      return dAcc + (day.items || []).reduce((iAcc, item) => {
        if (item.type === 'BLOCK') {
          return iAcc + (item.items?.length || 0);
        }
        return iAcc + 1;
      }, 0);
    }, 0);
  }, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 md:p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-white/95 dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-2xl rounded-3xl max-h-[90vh] flex flex-col justify-between text-slate-900 dark:text-white overflow-hidden relative"
        >
          {/* Top Specular Rim */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

          {/* Header */}
          <div className="p-5 md:p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">{template.icon || (isNutrition ? '🥗' : isRecipe ? '🍳' : isDocument ? '📄' : '🏋️')}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/40">
                  {isNutrition ? 'Plan Nutricional' : isRecipe ? 'Recetario' : isDocument ? 'Documento / Guía' : 'Plan de Entrenamiento'}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1.5 leading-snug">
                {template.name}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
            
            {/* 1. SECCIÓN ENTRENAMIENTO */}
            {isWorkout && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl text-center">
                    <Calendar size={18} className="text-indigo-600 dark:text-indigo-400 mx-auto mb-1.5" />
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Fases</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-100">{totalPhases}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl text-center">
                    <Dumbbell size={18} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Sesiones</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-100">{totalDays}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl text-center">
                    <Award size={18} className="text-amber-500 mx-auto mb-1.5" />
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Ejercicios</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-100">{totalExercises}</span>
                  </div>
                </div>

                {template.internalNotes && (
                  <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl text-xs text-indigo-900 dark:text-indigo-300">
                    <p className="font-bold mb-0.5">Nota Metodológica:</p>
                    <p className="text-[11px] leading-relaxed opacity-90">{template.internalNotes}</p>
                  </div>
                )}

                {/* Structure Outline */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3">
                    Estructura del Programa
                  </h4>
                  <div className="space-y-3">
                    {(template.phases || []).map((phase, idx) => (
                      <div key={phase.id} className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {idx + 1}. {phase.name}
                          </span>
                          <span className="text-[10px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-zinc-400">
                            {phase.days?.length || 0} Días
                          </span>
                        </div>
                        {phase.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                            "{phase.notes}"
                          </p>
                        )}
                        <div className="space-y-1.5 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800">
                          {(phase.days || []).map((day) => (
                            <div key={day.id} className="flex justify-between items-center text-xs py-0.5">
                              <span className="font-medium text-slate-700 dark:text-zinc-300">• {day.name}</span>
                              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                                {day.items?.length || 0} ejercicios
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 2. SECCIÓN NUTRICIÓN */}
            {isNutrition && (
              <>
                {/* Macro Target Summary */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl text-center">
                    <Flame size={16} className="text-amber-500 mx-auto mb-1" />
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Calorías</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {template.nutritionData?.kcal || 2000} <span className="text-[10px] font-normal">kcal</span>
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="block text-xs font-black text-indigo-600 mb-1">PRO</span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Proteína</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {template.nutritionData?.protein || 160}g
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="block text-xs font-black text-emerald-600 mb-1">CARB</span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Carbos</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {template.nutritionData?.carbs || 200}g
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="block text-xs font-black text-amber-600 mb-1">FAT</span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Grasas</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {template.nutritionData?.fats || 60}g
                    </span>
                  </div>
                </div>

                {template.internalNotes && (
                  <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300">
                    <p className="font-bold mb-0.5">Enfoque Nutricional:</p>
                    <p className="text-[11px] leading-relaxed opacity-90">{template.internalNotes}</p>
                  </div>
                )}

                {/* Comidas / Ingestas */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3">
                    Distribución de Ingestas Diarias
                  </h4>
                  <div className="space-y-2.5">
                    {(template.nutritionData?.meals || [
                      { name: 'Desayuno Proteico', items: '3 Huevos revueltos + 60g Avena con arándanos + Café solo', kcal: 450 },
                      { name: 'Almuerzo Equilibrado', items: '180g Pechuga de pollo + 150g Arroz basmati + Ensalada verde', kcal: 620 },
                      { name: 'Merienda / Pre-Entreno', items: '200g Yogur griego + 1 scoop Proteína + 1 Plátano', kcal: 380 },
                      { name: 'Cena Ligera', items: '200g Salmón / Merluza + 250g Vegetales asados', kcal: 550 }
                    ]).map((meal, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                            {meal.name}
                          </span>
                          {meal.kcal && (
                            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                              {meal.kcal} kcal
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-300 pl-6 leading-relaxed">
                          {meal.items}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 3. SECCIÓN RECETARIOS */}
            {isRecipe && (
              <>
                {/* Recipe Metrics */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl text-center">
                    <Clock size={16} className="text-indigo-600 mx-auto mb-1" />
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Tiempo</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      {template.recipeData?.prepTimeMin || 10} min
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl text-center">
                    <ChefHat size={16} className="text-amber-500 mx-auto mb-1" />
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Porciones</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      {template.recipeData?.servings || 1}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl text-center">
                    <Flame size={16} className="text-rose-500 mx-auto mb-1" />
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Calorías</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      {template.recipeData?.kcal || 390} kcal
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="block text-xs font-black text-emerald-600 mb-1">PRO</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Proteína</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      {template.recipeData?.protein || 35}g
                    </span>
                  </div>
                </div>

                {/* Ingredientes & Instrucciones */}
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl space-y-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-white">Ingredientes:</h5>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-zinc-300">
                      {(template.recipeData?.ingredients || [
                        '60g Harina de avena integral',
                        '1 Scoop (30g) Proteína Whey de vainilla',
                        '120ml Claras de huevo pasteurizadas',
                        '1/2 Cucharadita de polvo de hornear',
                        'Frutos rojos para el topping'
                      ]).map((ing, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl space-y-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-white">Instrucciones de Preparación:</h5>
                    <ol className="space-y-2 text-[11px] text-slate-600 dark:text-zinc-300">
                      {(template.recipeData?.instructions || [
                        'Mezclar todos los ingredientes en una licuadora hasta obtener una masa homogénea.',
                        'Calentar una sartén antiadherente a fuego medio con unas gotas de aceite de coco.',
                        'Cocinar 2 minutos por lado hasta dorar.',
                        'Servir con los frutos rojos por encima.'
                      ]).map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-indigo-600 shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </>
            )}

            {/* 4. SECCIÓN DOCUMENTOS */}
            {isDocument && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                      {template.documentData?.fileType === 'LINK' ? '🔗' : '📄'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white">{template.name}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        Tipo: {template.documentData?.fileType || 'PDF'} • Tamaño: {template.documentData?.sizeMb || 2.4} MB
                      </p>
                    </div>
                  </div>
                  {template.documentData?.url && (
                    <a
                      href={template.documentData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-indigo-500 transition-colors"
                    >
                      <Download size={14} /> Abrir
                    </a>
                  )}
                </div>

                {template.internalNotes && (
                  <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-slate-700 dark:text-zinc-300">Descripción del Documento:</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {template.internalNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Action Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center justify-end gap-3 shrink-0">
            {onEditTemplate && (
              <button
                type="button"
                onClick={onEditTemplate}
                id="btn-edit-template"
                className="px-4 py-2.5 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Edit3 size={14} />
                <span>Editar Plantilla</span>
              </button>
            )}

            <button
              type="button"
              onClick={onAssign}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <UserPlus size={14} />
              <span>Asignar Directamente</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
