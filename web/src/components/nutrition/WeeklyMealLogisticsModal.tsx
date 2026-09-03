import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChefHat, Truck, Users, CheckCircle2, AlertCircle } from 'lucide-react';

interface WeeklyMealLogisticsModalProps {
  onClose: () => void;
}

export const WeeklyMealLogisticsModal: React.FC<WeeklyMealLogisticsModalProps> = ({ onClose }) => {
  const [activeDay, setActiveDay] = useState(0);
  
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Estado logístico mock (En la vida real vendría del backend / store)
  const [mealStatus, setMealStatus] = useState<Record<string, Record<string, string>>>({
    'Lunes': { almuerzo: 'batch', cena: 'batch' },
    'Martes': { almuerzo: 'batch', cena: 'batch' },
    'Miércoles': { almuerzo: 'batch', cena: 'delivery' },
    'Jueves': { almuerzo: 'batch', cena: 'batch' },
    'Viernes': { almuerzo: 'batch', cena: 'social' },
    'Sábado': { almuerzo: 'social', cena: 'social' },
    'Domingo': { almuerzo: 'social', cena: 'batch' },
  });

  const mealPlanMock: Record<string, { almuerzo: { a: string, b: string }, cena: { a: string, b: string } }> = {
    'Lunes': { 
      almuerzo: { a: 'Pechuga al horno con batatas', b: 'Ensalada César con Pollo' }, 
      cena: { a: 'Salmón rosado con espárragos', b: 'Wok de pollo y vegetales' } 
    },
    'Martes': { 
      almuerzo: { a: 'Ensalada de garbanzos y atún', b: 'Tarta de zapallitos' }, 
      cena: { a: 'Wok de carne magra y vegetales', b: 'Omelette de queso y tomate' } 
    },
    'Miércoles': { 
      almuerzo: { a: 'Wrap integral de pollo', b: 'Sándwich de pan negro con atún' }, 
      cena: { a: 'Merluza al limón con puré de calabaza', b: 'Pollo grille con ensalada' } 
    },
    'Jueves': { 
      almuerzo: { a: 'Arroz integral con lentejas', b: 'Fideos integrales con brócoli' }, 
      cena: { a: 'Tacos de lechuga con pavo', b: 'Tarta de espinaca' } 
    },
    'Viernes': { 
      almuerzo: { a: 'Milanesa al horno con ensalada', b: 'Tortilla de papas al horno' }, 
      cena: { a: 'Hamburguesa casera al plato', b: 'Pizza con masa de coliflor' } 
    },
    'Sábado': { 
      almuerzo: { a: 'Libre / Opciones sugeridas', b: 'Día libre' }, 
      cena: { a: 'Libre / Opciones sugeridas', b: 'Día libre' } 
    },
    'Domingo': { 
      almuerzo: { a: 'Asado magro (control de porción)', b: 'Pechuga grillada' }, 
      cena: { a: 'Omelette de espinaca', b: 'Sopa de verduras' } 
    },
  };

  const [activeOptions, setActiveOptions] = useState<Record<string, Record<string, 'a' | 'b'>>>({});

  const toggleOption = (day: string, meal: string) => {
    setActiveOptions(prev => {
      const current = prev[day]?.[meal] || 'a';
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [meal]: current === 'a' ? 'b' : 'a'
        }
      };
    });
  };

  const handleStatusChange = (day: string, meal: string, status: string) => {
    setMealStatus(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: status
      }
    }));
  };

  const getStatusButtonClass = (day: string, meal: string, type: string) => {
    const isSelected = mealStatus[day]?.[meal] === type;
    if (!isSelected) return 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700';
    
    switch (type) {
      case 'batch': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50';
      case 'delivery': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50';
      case 'social': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700/50';
      default: return '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 font-lato">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="bg-white dark:bg-slate-900 w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-900 p-5 sm:p-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-black font-montserrat uppercase tracking-tight mb-2">Logística Semanal</h2>
            <p className="text-sm text-indigo-100 leading-relaxed opacity-90 max-w-md">
              Mapeá tus almuerzos y cenas para reducir la fricción diaria. Evitá el "Síndrome de la Heladera Vacía".
            </p>
          </div>

          {/* Days Selector */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {days.map((day, idx) => (
              <button
                key={day}
                onClick={() => setActiveDay(idx)}
                className={`flex-1 min-w-[80px] py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${activeDay === idx ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {day.substring(0,3)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8">
            {/* Almuerzo Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Calendar size={16} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Almuerzo</h3>
                </div>
              </div>

              <div className="mb-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center justify-between gap-3">
                 <div className="flex items-start gap-3">
                   <span className="text-lg">🍽️</span>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Tu Plato</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {mealPlanMock[days[activeDay]]?.almuerzo[activeOptions[days[activeDay]]?.almuerzo || 'a']}
                      </p>
                   </div>
                 </div>
                 <button 
                   onClick={() => toggleOption(days[activeDay], 'almuerzo')}
                   className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                 >
                   Cambiar
                 </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => handleStatusChange(days[activeDay], 'almuerzo', 'batch')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${getStatusButtonClass(days[activeDay], 'almuerzo', 'batch')}`}
                >
                  <ChefHat size={20} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">Cocina</span>
                </button>
                <button 
                  onClick={() => handleStatusChange(days[activeDay], 'almuerzo', 'delivery')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${getStatusButtonClass(days[activeDay], 'almuerzo', 'delivery')}`}
                >
                  <Truck size={20} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">Delivery Sano</span>
                </button>
                <button 
                  onClick={() => handleStatusChange(days[activeDay], 'almuerzo', 'social')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${getStatusButtonClass(days[activeDay], 'almuerzo', 'social')}`}
                >
                  <Users size={20} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">Comida Social</span>
                </button>
              </div>

              {/* Dynamic Context Helper */}
              {mealStatus[days[activeDay]]?.almuerzo === 'social' && (
                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg flex items-start gap-3 border border-purple-100 dark:border-purple-800/50">
                  <AlertCircle size={16} className="text-purple-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                    <strong>Modo Piloto Activado:</strong> No te preocupes por gramos ni macros perfectos. Asegurá una porción de proteína (tamaño de la palma) y disfrutá el momento.
                  </p>
                </div>
              )}
            </section>

            {/* Cena Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Calendar size={16} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Cena</h3>
                </div>
              </div>

              <div className="mb-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center justify-between gap-3">
                 <div className="flex items-start gap-3">
                   <span className="text-lg">🍽️</span>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Tu Plato</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {mealPlanMock[days[activeDay]]?.cena[activeOptions[days[activeDay]]?.cena || 'a']}
                      </p>
                   </div>
                 </div>
                 <button 
                   onClick={() => toggleOption(days[activeDay], 'cena')}
                   className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                 >
                   Cambiar
                 </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => handleStatusChange(days[activeDay], 'cena', 'batch')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${getStatusButtonClass(days[activeDay], 'cena', 'batch')}`}
                >
                  <ChefHat size={20} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">Cocina</span>
                </button>
                <button 
                  onClick={() => handleStatusChange(days[activeDay], 'cena', 'delivery')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${getStatusButtonClass(days[activeDay], 'cena', 'delivery')}`}
                >
                  <Truck size={20} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">Delivery Sano</span>
                </button>
                <button 
                  onClick={() => handleStatusChange(days[activeDay], 'cena', 'social')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${getStatusButtonClass(days[activeDay], 'cena', 'social')}`}
                >
                  <Users size={20} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">Comida Social</span>
                </button>
              </div>

              {mealStatus[days[activeDay]]?.cena === 'delivery' && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg flex items-start gap-3 border border-amber-100 dark:border-amber-800/50">
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    <strong>Evitando Fatiga de Decisión:</strong> Te recomendamos la Ensalada Proteica de "Green Eats" o el Bowl de "SushiClub" (sin salsa teriyaki).
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase tracking-widest text-sm py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} /> Guardar Estrategia
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
