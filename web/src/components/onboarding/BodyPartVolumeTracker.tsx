import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { RoutineItem } from '../../stores/usePlanBuilderStore';

interface BodyPartVolumeTrackerProps {
  routine: RoutineItem[];
}

export const BodyPartVolumeTracker: React.FC<BodyPartVolumeTrackerProps> = ({ routine }) => {
  const { volumeByMuscle, radarData } = useMemo(() => {
    const acc: Record<string, number> = {};
    const zones: Record<string, number> = {
      'Tren Inferior': 0,
      'Pecho / Hombro': 0,
      'Espalda': 0,
      'Brazos': 0,
      'Core': 0
    };
    
    routine.forEach(item => {
      if (!item.exercise || !item.exercise.Musculo_Agonista) return;
      
      const muscle = item.exercise.Musculo_Agonista;
      const matches = item.sets.match(/\d+/g);
      const sets = matches ? Math.max(...matches.map(n => parseInt(n, 10))) : 0;
      
      if (!acc[muscle]) acc[muscle] = 0;
      acc[muscle] += sets;

      const upper = muscle.toUpperCase();
      if (upper.includes('CUÁDRICEPS') || upper.includes('ISQUIOS') || upper.includes('GLÚTEO') || upper.includes('PANTORRILLA') || upper.includes('PIERNA')) {
        zones['Tren Inferior'] += sets;
      } else if (upper.includes('PECTORAL') || upper.includes('HOMBRO') || upper.includes('DELTOIDE')) {
        zones['Pecho / Hombro'] += sets;
      } else if (upper.includes('DORSAL') || upper.includes('TRAPECIO') || upper.includes('LUMBAR')) {
        zones['Espalda'] += sets;
      } else if (upper.includes('BÍCEPS') || upper.includes('TRÍCEPS') || upper.includes('BRAZO')) {
        zones['Brazos'] += sets;
      } else if (upper.includes('ABDOMEN') || upper.includes('CORE') || upper.includes('OBLICUO')) {
        zones['Core'] += sets;
      }
    });

    const sortedVolume = Object.entries(acc)
      .filter(([_, vol]) => vol > 0)
      .sort((a, b) => b[1] - a[1]);

    // Calcular el porcentaje basado en un máximo ideal (ej. 25 series como 100%)
    const maxSets = 25;
    const radar = Object.entries(zones).map(([subject, vol]) => ({
      subject,
      A: Math.min(100, (vol / maxSets) * 100),
      fullMark: 100,
      realValue: vol
    }));

    return { volumeByMuscle: sortedVolume, radarData: radar };
  }, [routine]);

  if (volumeByMuscle.length === 0) return null;

  const getHeatmapColor = (sets: number) => {
    if (sets < 10) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (sets <= 20) return 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    return 'bg-rose-100 text-rose-700 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-indigo-500 w-5 h-5" />
        <h3 className="font-bold text-slate-800 font-montserrat">Balance de Carga y Fatiga SNC</h3>
      </div>
      
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Radar Chart Column */}
        <div className="flex-1 min-w-[300px] h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Volumen"
                dataKey="A"
                stroke="#6366f1"
                strokeWidth={2}
                fill="#6366f1"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap Column */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-wrap gap-3">
            {volumeByMuscle.map(([muscle, sets]) => (
              <motion.div 
                layout
                key={muscle} 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[100px] ${getHeatmapColor(sets)}`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{muscle}</span>
                <span className="text-xl font-black font-montserrat mt-1">{sets} <span className="text-[10px] font-bold">series</span></span>
              </motion.div>
            ))}
          </div>
          
          <p className="text-xs text-slate-400 mt-6 font-lato">
            El gráfico radial ilustra el balance de la rutina. Las tarjetas indican nivel de fatiga muscular. Verde (10-20) es hipertrofia óptima. Rojo (+20) indica riesgo de sobre-entrenamiento.
          </p>
        </div>
      </div>
    </div>
  );
};
