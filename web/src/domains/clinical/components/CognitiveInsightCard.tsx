import React from 'react';
import type { PatientView } from '../interfaces/CognitiveContract';

interface InsightProps {
  biomarkerTitle: string; // Ej. "Respuesta de Cortisol Matutino"
  patientView: PatientView;
}

export const CognitiveInsightCard: React.FC<InsightProps> = ({ biomarkerTitle, patientView }) => {
  return (
    // Superficie de Autoridad: Blanco puro sobre el fondo Marfil de la App
    <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl mx-auto flex flex-col gap-6">
      
      {/* HEADER: Identificador Médico */}
      <div className="flex items-center gap-3">
        {/* Micro-Acento funcional en Salvia */}
        <div className="w-2 h-2 rounded-full bg-[#C9D3CA]"></div>
        <span className="font-heading font-semibold text-slate-600 text-xs uppercase tracking-widest">
          {biomarkerTitle}
        </span>
      </div>

      {/* A. REFLEJO EMPÁTICO (pedagogical_copy) */}
      <h2 className="font-heading text-[#1E293B] text-xl md:text-2xl font-medium leading-snug">
        {patientView.pedagogical_copy}
      </h2>

      {/* B. PÍLDORA CIENTÍFICA (education_pill) - Ley de Región Común */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h4 className="font-heading text-xs text-slate-500 font-bold mb-2 uppercase tracking-wide">
          La Ciencia Detrás
        </h4>
        <p className="font-sans text-slate-600 text-sm leading-relaxed">
          {patientView.education_pill}
        </p>
      </div>

      {/* C. HÁBITO ACCIONABLE (actionable_habit) - Ley del Punto Focal */}
      <div className="mt-2 pl-4 border-l-4 border-[#C9D3CA] flex flex-col gap-3">
        <h4 className="font-heading text-sm text-[#1E293B] font-bold">
          Tu Micro-Hábito de Hoy
        </h4>
        <p className="font-sans text-[#1E293B] text-base leading-normal">
          {patientView.actionable_habit}
        </p>
        
        {/* Resolución del Modelo de BJ Fogg: Cierre del Bucle */}
        <button className="self-start mt-2 px-5 py-2.5 bg-[#1E293B] text-white rounded-lg font-heading text-sm hover:bg-slate-800 transition-colors shadow-md">
          Marcar como Completado
        </button>
      </div>

    </div>
  );
};
