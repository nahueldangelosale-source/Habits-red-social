import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// Simulación de datos precargados
const MOCK_QUEUE = [
  { id: '1', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', ejercicio: 'Squat Biomecánica', carga: 120, anomalia_ia: 'Valgo de Rodilla (85% Confianza)' },
  { id: '2', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', ejercicio: 'Deadlift', carga: 140, anomalia_ia: 'Curvatura Lumbar Detectada' },
  { id: '3', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', ejercicio: 'Bench Press', carga: 90, anomalia_ia: 'Ninguna' },
];

export const ValidationCard: React.FC<{
  videoUrl: string;
  atletaData: any;
  onApprove: () => void;
  onCorrect: () => void;
  isTop: boolean;
}> = ({ videoUrl, atletaData, onApprove, onCorrect, isTop }) => {
  const x = useMotionValue(0);
  
  // Mapeo de opacidad de las "estelas" de color según la dirección del swipe
  const opacityApprove = useTransform(x, [0, 150], [0, 0.8]); // Azul sobrio
  const opacityCorrect = useTransform(x, [0, -150], [0, 0.8]); // Gris oscuro o Rojo alerta

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    if (swipe > 100) {
      onApprove();
    } else if (swipe < -100) {
      onCorrect();
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing origin-bottom"
      style={{ x, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      // Spring Physics: Alta rigidez (stiffness) y amortiguación precisa (damping) 
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: 1, y: isTop ? 0 : 20 }}
      exit={{ x: x.get() > 0 ? 300 : -300, opacity: 0, rotate: x.get() > 0 ? 15 : -15, transition: { duration: 0.2 } }}
    >
      {/* Pre-fetched Video Héroe */}
      <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />

      {/* Glassmorphism Inverso: Gradiente negro translúcido desde abajo */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent p-6 flex flex-col justify-end pointer-events-none">
        <h3 className="font-heading font-bold text-white text-2xl tracking-tight mb-2">
          {atletaData.ejercicio}
        </h3>
        {/* Tipografía Lato para la lectura de la anomalía sin obstruir el video */}
        <p className="font-sans text-white/80 text-sm leading-relaxed">
          <strong className="text-white">Carga:</strong> {atletaData.carga}kg <br/>
          <strong className={atletaData.anomalia_ia !== 'Ninguna' ? 'text-risk-high' : 'text-clinical-accent'}>
            Anomalía:
          </strong> {atletaData.anomalia_ia}
        </p>
      </div>

      {/* Estelas de color retroalimentando la decisión */}
      <motion.div className="absolute inset-0 bg-clinical-accent pointer-events-none" style={{ opacity: opacityApprove }} />
      <motion.div className="absolute inset-0 bg-clinical-text pointer-events-none" style={{ opacity: opacityCorrect }} />
      
      {/* Etiquetas UI Dinámicas */}
      <motion.div className="absolute top-8 left-8 border-4 border-clinical-accent text-clinical-accent px-4 py-2 rounded-lg font-heading font-black text-xl tracking-widest uppercase transform -rotate-12 pointer-events-none" style={{ opacity: opacityApprove }}>
        APROBAR
      </motion.div>
      <motion.div className="absolute top-8 right-8 border-4 border-clinical-text text-clinical-text px-4 py-2 rounded-lg font-heading font-black text-xl tracking-widest uppercase transform rotate-12 pointer-events-none" style={{ opacity: opacityCorrect }}>
        CORREGIR
      </motion.div>
    </motion.div>
  );
};

export const ValidationTinderDeck: React.FC = () => {
  const [cards, setCards] = useState(MOCK_QUEUE);

  const handleNext = () => {
    setCards((prev) => prev.slice(1));
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-clinical-muted">
        <div className="text-6xl mb-4">🙌</div>
        <h2 className="font-heading font-bold text-2xl text-clinical-text">Inbox Zero</h2>
        <p className="font-sans text-sm">Todos los videos han sido procesados.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm aspect-[9/16] flex items-center justify-center">
      <AnimatePresence>
        {cards.map((card, index) => {
          // Renderizamos solo la de arriba y la siguiente (Pre-fetching visual)
          if (index > 1) return null;
          const isTop = index === 0;
          return (
            <ValidationCard
              key={card.id}
              videoUrl={card.videoUrl}
              atletaData={card}
              isTop={isTop}
              onApprove={handleNext}
              onCorrect={handleNext}
            />
          );
        }).reverse()}
      </AnimatePresence>
    </div>
  );
};
