import React from 'react';
import { ZeroClientWizardPT } from '../components/onboarding/ZeroClientWizardPT';

export const TestB2B2C: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white font-montserrat tracking-tight mb-2">
          Simulador B2B2C (Atleta Final)
        </h1>
        <p className="text-slate-400 font-lato text-sm sm:text-base">
          Esta es la vista móvil que recibirá el cliente tras realizar el pago.
        </p>
      </div>
      
      {/* Mobile Simulator Frame (iPhone 14/15 Pro Max approx) */}
      <div className="w-full max-w-[27rem] h-[53rem] bg-slate-50 rounded-[3rem] shadow-2xl border-[var(--spacing-xs)] border-slate-800 overflow-hidden relative flex flex-col ring-4 ring-black/10">
        
        {/* Dynamic Island / Status Bar Fake */}
        <div className="absolute top-0 left-0 w-full h-7 bg-transparent z-50 flex justify-center">
          <div className="w-1/3 h-5 bg-slate-800 rounded-b-xl"></div>
        </div>

        {/* Wizard Universal Inyectado en Modo B2C */}
        <div className="flex-1 overflow-hidden relative mt-4">
          <ZeroClientWizardPT mode="B2C" />
        </div>
        
      </div>
      
      <p className="mt-8 text-slate-500 font-lato text-xs text-center">
        *El wizard está restringido al ancho del dispositivo. Todo el flujo es idéntico a la versión del Entrenador, <br/>pero adaptado y con cierre asíncrono.*
      </p>
    </div>
  );
};
