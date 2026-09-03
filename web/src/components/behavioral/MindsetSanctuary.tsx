import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { ShieldAlert } from 'lucide-react';

interface MindsetSanctuaryProps {
  onSaveStreak: () => void;
  onRegisterFail: () => void;
}

const abisalBackgroundVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.6,
      ease: [0.4, 0.0, 0.2, 1],
      when: 'beforeChildren',
      staggerChildren: 0.2
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.5,
      when: 'afterChildren'
    }
  }
};

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.4, 0.0, 0.2, 1] 
    }
  },
  exit: { 
    scale: 0,
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeIn' 
    }
  }
};

const textVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.5,
      ease: [0.4, 0.0, 0.2, 1]
    }
  },
  exit: { 
    y: 10,
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

export const MindsetSanctuary: React.FC<MindsetSanctuaryProps> = ({ onSaveStreak, onRegisterFail }) => {
  const [breathingPhase, setBreathingPhase] = useState<'Inhala (4s)' | 'Retén (7s)' | 'Exhala (8s)'>('Inhala (4s)');
  const [isExiting, setIsExiting] = useState(false);
  
  const startTimeRef = useRef(Date.now());
  const hasResolvedRef = useRef(false);
  const track = useAnalyticsStore(state => state.track);

  useEffect(() => {
    track('SANCTUARY_ENTERED');
    
    let cycle = 0;
    const interval = setInterval(() => {
      cycle++;
      if (cycle % 3 === 1) setBreathingPhase('Retén (7s)');
      else if (cycle % 3 === 2) setBreathingPhase('Exhala (8s)');
      else setBreathingPhase('Inhala (4s)');
    }, 4000); 
    
    return () => {
      clearInterval(interval);
      if (!hasResolvedRef.current) {
        track('HARD_KILL', {
          timeSpent: (Date.now() - startTimeRef.current) / 1000
        });
      }
    };
  }, [track]);

  const handleSaveStreak = () => {
    hasResolvedRef.current = true;
    track('POST_FRICTION_REVERSAL', { status: 'SUCCESS' });
    setIsExiting(true);
    
    // Defer the parent callback to allow AnimatePresence to run the exit animations
    setTimeout(() => {
      onSaveStreak();
    }, 800); 
  };

  const handleFail = () => {
    hasResolvedRef.current = true;
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    track('BAIL_OUT_TIME', { second: timeSpent });
    setIsExiting(true);
    
    setTimeout(() => {
      onRegisterFail();
    }, 800);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 px-6"
          variants={abisalBackgroundVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Breathing Circle */}
          <motion.div 
            className="w-48 h-48 rounded-full border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)] mb-12"
            variants={circleVariants}
            animate={{
              scale: breathingPhase === 'Inhala (4s)' ? 1.2 : breathingPhase === 'Retén (7s)' ? 1.2 : 0.8,
              transition: { duration: breathingPhase === 'Inhala (4s)' ? 4 : breathingPhase === 'Retén (7s)' ? 7 : 8 }
            }}
          >
            <div className="w-32 h-32 rounded-full border border-indigo-400/50 flex items-center justify-center">
              <span className="text-indigo-200 font-bold tracking-wider font-lato">{breathingPhase}</span>
            </div>
          </motion.div>

          {/* Texts */}
          <motion.div className="text-center max-w-sm mb-12" variants={textVariants}>
            <div className="flex justify-center mb-4">
              <ShieldAlert className="text-emerald-500/80" size={32} />
            </div>
            <h2 className="text-2xl font-black font-montserrat text-white tracking-tight mb-4">
              Pausa Cognitiva.
            </h2>
            <p className="text-slate-400 font-lato text-sm leading-relaxed tracking-wider">
              No estás fallando, estás recalibrando. Tómate un momento de respiración antes de confirmar esta decisión.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div className="flex flex-col gap-4 w-full max-w-xs" variants={textVariants}>
            <button 
              onClick={handleSaveStreak}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-colors shadow-lg shadow-emerald-900/20 tracking-wider text-sm"
            >
              SALVAR RACHA (Superar Fricción)
            </button>
            <button 
              onClick={handleFail}
              className="w-full bg-transparent hover:bg-slate-900 text-slate-500 font-bold py-4 rounded-xl transition-colors border border-slate-800 tracking-wider text-sm"
            >
              Saltar Hábito
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
