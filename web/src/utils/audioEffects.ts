/**
 * Motor de Audio Sintetizado para Microinteracciones y Refuerzo Dopaminérgico
 * 
 * Implementado con Web Audio API pura (sin dependencias externas ni archivos de audio pesados).
 * Diseñado con principios de neuroestética y gamificación para gratificación inmediata y retención.
 */

let globalAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        globalAudioCtx = new AudioCtxClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (e) {
    console.warn('[AudioEffects] AudioContext no soportado o bloqueado por el navegador', e);
    return null;
  }
};

/**
 * 🔔 Chime Dopaminérgico de Hábito/Tarea Completada
 * Arpegio armónico ascendente dulce (F#5 -> A#5 -> C#6) con caída exponencial suave.
 * Estimula el circuito de recompensa dopaminérgico al consolidar hábitos y completar tareas.
 */
export const playDopamineChime = (volume: number = 0.18): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { freq: 739.99, time: 0.00, duration: 0.35 }, // F#5
      { freq: 932.33, time: 0.08, duration: 0.40 }, // A#5
      { freq: 1108.73, time: 0.16, duration: 0.65 } // C#6
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Envolvente ADSR suave
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.linearRampToValueAtTime(volume, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (e) {
    console.warn('[AudioEffects] Error ejecutando playDopamineChime', e);
  }
};

/**
 * 💧 Pop sutil al agregar una tarea o interactuar con el sistema
 */
export const playSubtlePop = (volume: number = 0.12): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.04);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {
    console.warn('[AudioEffects] Error ejecutando playSubtlePop', e);
  }
};

/**
 * 🔁 Acorde Celebratorio al Replicar Semana o Agendar Bloque Múltiple
 */
export const playCelebrationChord = (volume: number = 0.15): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Acorde mayor luminoso de celebración (E5, G#5, B5, E6)
    const chord = [659.25, 830.61, 987.77, 1318.51];

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.0001, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(volume, now + i * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.85);
    });
  } catch (e) {
    console.warn('[AudioEffects] Error ejecutando playCelebrationChord', e);
  }
};
