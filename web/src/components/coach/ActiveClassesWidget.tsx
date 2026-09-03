import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Plus, ChevronRight, ChevronDown, Sparkles, Rocket, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClassDetailModal } from './ClassDetailModal';
import { CreateClassGroupModal, type TargetAudience } from './CreateClassGroupModal';
import { useClassesStore, type ClassGroupDetail } from '../../stores/useClassesStore';

interface ActiveClassesWidgetProps {
  isClinical?: boolean;
}

export const ActiveClassesWidget: React.FC<ActiveClassesWidgetProps> = ({ isClinical }) => {
  const navigate = useNavigate();
  const { classes: classesList, addClass } = useClassesStore();
  const [selectedClass, setSelectedClass] = useState<ClassGroupDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const totalAtletas = classesList.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);

  const handleOpenDetail = (cls: ClassGroupDetail) => {
    setSelectedClass(cls);
    setIsDetailOpen(true);
  };

  const handleClassCreated = (newAudience: TargetAudience) => {
    addClass({
      name: newAudience.name.split('(')[0].trim(),
      discipline: newAudience.discipline || 'Disciplina Grupal',
      icon: newAudience.icon,
      schedule: newAudience.schedule || 'Horario a coordinar',
      count: newAudience.count,
      activeChallengeTitle: 'Reto en Preparación'
    });
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border shadow-sm font-lato transition-all duration-300 ${
      isClinical 
        ? 'bg-gradient-to-r from-white/95 via-purple-50/30 to-indigo-50/30 border-purple-200/80 shadow-[0_4px_20px_rgba(168,85,247,0.04)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.08)]' 
        : 'bg-zinc-900/90 border-zinc-800'
    }`}>
      {/* Specular Top Rim */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

      {/* Header - Clickable for Collapse Toggle */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`px-5 sm:px-6 py-4 flex justify-between items-center cursor-pointer select-none transition-colors ${
          isClinical 
            ? 'hover:bg-purple-50/40' 
            : 'bg-zinc-900/80 hover:bg-zinc-800/50'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-purple-500/20">
            <Users size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm sm:text-base font-black font-montserrat tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                Grupos & Clases Activos
              </h3>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/50 shadow-2xs">
                {classesList.length} Clases
              </span>
            </div>
            <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
              {isCollapsed ? `${totalAtletas} alumnos asignados • Toca para desplegar horarios` : 'Horarios, alumnos y retos en curso'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCreateOpen(true);
            }}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-montserrat font-black text-xs shadow-sm hover:shadow-md hover:from-indigo-600 hover:to-purple-700 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Crear Clase</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/gamification');
            }}
            className={`text-xs font-bold hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
              isClinical 
                ? 'text-indigo-600 hover:bg-indigo-50/80 font-bold' 
                : 'text-indigo-400 hover:bg-zinc-800'
            }`}
          >
            <span>Ver Grupos & Retos</span>
            <ChevronRight size={14} />
          </button>

          <div className="p-1 text-slate-400 dark:text-zinc-400">
            <ChevronDown 
              size={18} 
              className={`transform transition-transform duration-300 ${!isCollapsed ? 'rotate-180 text-purple-600' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* Collapsible 2x2 Grid of Active Classes */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`overflow-hidden border-t ${isClinical ? 'border-slate-100 bg-slate-50/30' : 'border-zinc-800 bg-zinc-950/30'}`}
          >
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classesList.map((cls) => (
                <motion.div
                  key={cls.id}
                  onClick={() => handleOpenDetail(cls)}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isClinical 
                      ? 'bg-white hover:bg-slate-50/70 border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md' 
                      : 'bg-zinc-900 hover:bg-zinc-800/90 border-zinc-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {cls.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className={`text-xs font-black font-montserrat truncate ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                          {cls.name}
                        </h4>
                      </div>
                      <p className={`text-[11px] truncate flex items-center gap-1 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                        <Clock size={11} className="shrink-0 text-slate-400" />
                        <span className="truncate">{cls.schedule}</span>
                      </p>
                      <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                        {cls.count}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} className={`shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${isClinical ? 'text-slate-600' : 'text-white'}`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ventana Chica / Modal de Detalle de Clase */}
      <ClassDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        classGroup={selectedClass}
        onLaunchChallenge={(classId) => {
          navigate('/gamification');
        }}
      />

      {/* Modal para Crear Nueva Clase */}
      <CreateClassGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onClassCreated={handleClassCreated}
      />
    </div>
  );
};
