import React, { useState, useEffect } from 'react';
import { Search, GitMerge, Archive, Zap, Filter, ChevronRight, Lock, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanBuilderStore, type WorkoutDay } from '../../stores/usePlanBuilderStore';
import { useTemplateLibraryStore } from '../../stores/useTemplateLibraryStore';
import { EXERCISES_DATABASE } from '../../data/exercisesData';
import { CustomExerciseWizard } from './CustomExerciseWizard';
import { DraggablePaletteItem } from './DraggablePaletteItem';
import { Plus } from 'lucide-react';

export const SmartVaultPanel: React.FC = () => {
  const { adaptTemplate } = usePlanBuilderStore();
  const folders = useTemplateLibraryStore(state => state.folders);
  const templates = React.useMemo(() => folders.flatMap(f => f.templates), [folders]);
  const blocks = templates.filter(t => t.type === 'BLOCK' || t.type === 'PROGRAM');
  const exercises = templates.filter(t => t.type === 'EXERCISE');
  
  const [activeTab, setActiveTab] = useState<'bloques' | 'ejercicios'>('bloques');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const createTemplate = useTemplateLibraryStore(state => state.createTemplate);
  
  const handleImportBlock = (days: WorkoutDay[]) => {
    // Generate new UUIDs for everything
    const clonedDays = JSON.parse(JSON.stringify(days));
    clonedDays.forEach((day: WorkoutDay) => {
      day.items.forEach((item: any) => {
      });
    });
    adaptTemplate(clonedDays);
  };

  const handleSaveCustomExercise = (exerciseData: any) => {
    const defaultFolderId = folders[0]?.id;
    if (!defaultFolderId) return;

    createTemplate(defaultFolderId, {
      type: 'EXERCISE',
      name: exerciseData.Nombre_Oficial,
      taxonomyId: exerciseData.ID_Ejercicio,
      tags: ['custom', exerciseData.Musculo_Agonista.toLowerCase()],
      phases: [],
      customExerciseData: exerciseData
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full">
      {/* Vault Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 font-montserrat">
            <Archive className="text-indigo-500 w-4 h-4" /> Biblioteca
          </h2>
          <p className="text-[10px] font-lato text-slate-500 mt-1">Arrastra e importa bloques o ejercicios.</p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('bloques')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all text-left ${activeTab === 'bloques' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            Bloques (Mesociclos)
          </button>
          <button 
            onClick={() => setActiveTab('ejercicios')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all text-left ${activeTab === 'ejercicios' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            Ejercicios Personalizados
          </button>
        </div>
      </div>

      <div className="p-4 min-h-[400px] relative bg-slate-50">
        <AnimatePresence mode="wait">
        
        {activeTab === 'bloques' && (
          <motion.div 
            key="bloques"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {blocks.length === 0 ? (
              <div className="text-center py-10 opacity-50 text-sm text-slate-500">No tienes bloques guardados en tu biblioteca.</div>
            ) : (
              blocks.map(b => (
                <div key={b.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer bg-white">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{b.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {b.tags.map(c => (
                        <span key={c} className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (b.phases && b.phases[0]) {
                        handleImportBlock(b.phases[0].days);
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <GitMerge size={12} /> Importar
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'ejercicios' && (
          <motion.div 
            key="ejercicios"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {exercises.length === 0 ? (
              <div className="text-center py-10 opacity-50 text-sm text-slate-500">No tienes ejercicios personalizados.</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {exercises.map(e => (
                  e.customExerciseData && <DraggablePaletteItem key={e.id} exercise={e.customExerciseData} />
                ))}
              </div>
            )}
            
            <button 
              onClick={() => setIsWizardOpen(true)}
              className="w-full mt-4 py-3 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-colors font-bold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Crear Ejercicio
            </button>
          </motion.div>
        )}

        </AnimatePresence>
      </div>

      <CustomExerciseWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSave={handleSaveCustomExercise} 
      />
    </div>
  );
};
