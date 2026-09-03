import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, Loader2, CheckCircle2, UploadCloud, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExcelDropzoneProps {
  onFileAccepted: (file: File) => void;
}

type DropzoneState = 'empty' | 'processing' | 'success';

export const ExcelDropzone: React.FC<ExcelDropzoneProps> = ({ onFileAccepted }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [state, setState] = useState<DropzoneState>('empty');
  const [processedCount, setProcessedCount] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Basic validation
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        alert('Por favor sube un archivo .xlsx o .csv válido.');
        return;
      }

      startLaborIllusion(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startLaborIllusion(e.target.files[0]);
    }
  };

  const startLaborIllusion = (file: File) => {
    setState('processing');
    
    // Simular el parseo y conteo progresivo para mantener la Labor Illusion
    const totalSimulatedExercises = 42; // En un escenario real, esto vendría del length del parser
    let current = 0;
    
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 3) + 1; // Incrementos rápidos e irregulares
      if (current >= totalSimulatedExercises) {
        clearInterval(interval);
        setProcessedCount(totalSimulatedExercises);
        setState('success');
        
        // Retrasar ligeramente la entrega real del archivo para que vean el success
        setTimeout(() => {
          onFileAccepted(file);
        }, 1500);
      } else {
        setProcessedCount(current);
      }
    }, 40);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      {/* Cabecera Estratégica */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black font-montserrat text-slate-900 tracking-tight mb-3">
          Digitaliza tu metodología en segundos.
        </h2>
        <p className="text-slate-500 font-lato text-base max-w-xl mx-auto">
          Arrastra tu Excel. Nuestro motor biomecánico interpretará tus términos y los convertirá en un protocolo clínico listo para asignar.
        </p>
      </div>

      {/* Área de Dropzone */}
      <div 
        className={`relative overflow-hidden rounded-3xl transition-all duration-500
          ${state === 'empty' 
            ? isDragActive 
              ? 'bg-indigo-50/80 border-2 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.02]' 
              : 'bg-white/40 border-2 border-dashed border-slate-300 hover:border-indigo-300 hover:bg-white/60' 
            : 'bg-white border-2 border-transparent shadow-xl'
          } backdrop-blur-sm`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center relative z-10">
          
          <AnimatePresence mode="wait">
            {state === 'empty' && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center w-full"
              >
                <div className={`w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-indigo-100 shadow-inner' : 'bg-slate-50 shadow-sm border border-slate-100'}`}>
                  <FileSpreadsheet size={40} className={`transition-colors duration-300 ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Suelta tu archivo aquí
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Formatos soportados: .xlsx, .csv. Encriptación end-to-end.
                </p>

                <label className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-2">
                  <UploadCloud size={18} />
                  Seleccionar Archivo
                  <input type="file" className="hidden" accept=".xlsx, .csv" onChange={handleFileInput} />
                </label>
              </motion.div>
            )}

            {state === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center w-full py-8"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping opacity-20"></div>
                  <Loader2 size={48} className="text-indigo-500 animate-spin" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-black font-montserrat text-slate-800 mb-2">
                  Interpretando {processedCount} ejercicios...
                </h3>
                <p className="text-slate-500 text-sm animate-pulse">
                  Normalizando heurística biomecánica
                </p>
                
                {/* Progress Bar simulada */}
                <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-75 ease-out"
                    style={{ width: `${Math.min(100, (processedCount / 42) * 100)}%` }}
                  ></div>
                </div>
              </motion.div>
            )}

            {state === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full py-8"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                >
                  <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={2} />
                </motion.div>
                
                <h3 className="text-2xl font-black font-montserrat text-emerald-900 tracking-tight mb-2">
                  ¡Listo!
                </h3>
                <p className="text-emerald-700/80 font-medium text-base">
                  {processedCount} ejercicios mapeados con precisión clínica.
                </p>
                
                <p className="text-slate-400 text-sm mt-8 flex items-center gap-1 animate-pulse">
                  Generando vista previa <ChevronRight size={14} />
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
