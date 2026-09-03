import React, { useState } from 'react';
import { Settings2, Calculator, Activity, Target, Zap, Info } from 'lucide-react';
import { BMR_FORMULAS, PAL_MULTIPLIERS, GOAL_MACRO_MATRIX } from '../../../data/nutritionEngine';
import type { BodyCompositionGoal, BMRFormula } from '../../../data/nutritionEngine';

export const NutritionMetabolicConfig = () => {
  const [selectedFormula, setSelectedFormula] = useState<BMRFormula>('MIFFLIN_ST_JEOR');
  const [selectedActivity, setSelectedActivity] = useState<number>(PAL_MULTIPLIERS.MODERATELY_ACTIVE);
  const [selectedGoal, setSelectedGoal] = useState<BodyCompositionGoal>('RECOMPOSITION');

  // Mock Athlete Data for visualization
  const athlete = { weight: 85, height: 180, age: 30, isMale: true, bodyFat: 18 };
  
  // Calculate BMR
  const calculateBMR = () => {
    if (selectedFormula === 'MIFFLIN_ST_JEOR') {
      const bmr = (10 * athlete.weight) + (6.25 * athlete.height) - (5 * athlete.age) + (athlete.isMale ? 5 : -161);
      return bmr;
    } else if (selectedFormula === 'HARRIS_BENEDICT') {
      if (athlete.isMale) {
        return 88.362 + (13.397 * athlete.weight) + (4.799 * athlete.height) - (5.677 * athlete.age);
      } else {
        return 447.593 + (9.247 * athlete.weight) + (3.098 * athlete.height) - (4.330 * athlete.age);
      }
    } else {
      // KATCH_MCARDLE
      const ffm = athlete.weight * (1 - athlete.bodyFat / 100);
      return 370 + (21.6 * ffm);
    }
  };

  const bmr = calculateBMR();
  const tdee = bmr * selectedActivity;
  
  const goalConfig = GOAL_MACRO_MATRIX[selectedGoal];
  const targetKcal = tdee * (1 + goalConfig.energyShiftMin); // Tomamos el shift mínimo
  
  return (
    <div className="w-full max-w-7xl mx-auto mb-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden font-sans">
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Motor Termodinámico NaaS</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Configuración metabólica global del paciente</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
           <Settings2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controles de Configuración */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" /> Ecuación TMB
            </label>
            <div className="relative">
              <select 
                value={selectedFormula}
                onChange={(e) => setSelectedFormula(e.target.value as BMRFormula)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                {Object.values(BMR_FORMULAS).map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium flex items-start gap-1 mt-1 leading-tight">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              {BMR_FORMULAS[selectedFormula].description}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Factor Actividad
            </label>
            <div className="relative">
              <select 
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(Number(e.target.value))}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value={PAL_MULTIPLIERS.SEDENTARY}>Sedentario (1.2)</option>
                <option value={PAL_MULTIPLIERS.LIGHTLY_ACTIVE}>Ligero (1.375)</option>
                <option value={PAL_MULTIPLIERS.MODERATELY_ACTIVE}>Moderado (1.55)</option>
                <option value={PAL_MULTIPLIERS.VERY_ACTIVE}>Activo (1.725)</option>
                <option value={PAL_MULTIPLIERS.EXTREMELY_ACTIVE}>Atleta/Pesado (1.9)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Objetivo Biológico
            </label>
            <div className="relative">
              <select 
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value as BodyCompositionGoal)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              >
                <option value="HYPERTROPHY">Hipertrofia</option>
                <option value="RECOMPOSITION">Recomposición Corporal</option>
                <option value="FAT_LOSS">Pérdida de Grasa</option>
                <option value="PERFORMANCE">Rendimiento</option>
                <option value="LONGEVITY">Longevidad</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium flex items-start gap-1 mt-1 leading-tight">
              Shift Termodinámico: <strong className="text-slate-600">{goalConfig.energyShiftMin > 0 ? '+' : ''}{goalConfig.energyShiftMin * 100}%</strong> al GET.
            </p>
          </div>
          
        </div>

        {/* Dashboard de Resultados */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Zap className="w-24 h-24" />
          </div>
          
          <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
            Target Diario Sugerido
          </h4>
          
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-black tracking-tighter text-white">{Math.round(targetKcal)}</span>
            <span className="text-sm font-bold text-slate-400 mb-1">kcal/día</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tasa Basal (TMB)</span>
              <span className="text-lg font-bold text-indigo-300">{Math.round(bmr)} <span className="text-xs text-slate-500">kcal</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Gasto Total (GET)</span>
              <span className="text-lg font-bold text-emerald-300">{Math.round(tdee)} <span className="text-xs text-slate-500">kcal</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Proteína</span>
              <span className="text-sm font-bold text-amber-200">{goalConfig.proteinMin} - {goalConfig.proteinMax} <span className="text-[10px] text-slate-400">g/kg {goalConfig.proteinBase}</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Grasas</span>
              <span className="text-sm font-bold text-rose-300">{goalConfig.fatMin} - {goalConfig.fatMax} <span className="text-[10px] text-slate-400">{goalConfig.fatBase === 'PERCENT_GET' ? '% GET' : 'g/kg'}</span></span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
