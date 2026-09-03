import React, { createContext, useContext, useState, useEffect } from 'react';

export type EntropyState = 'low_free_energy' | 'cognitive_flexibility';
export type VAKProfile = 'visual' | 'auditory' | 'kinesthetic';

interface EntropyVAKContextProps {
    entropy: EntropyState;
    vakProfile: VAKProfile;
    setEntropy: (state: EntropyState) => void;
    setVakProfile: (profile: VAKProfile) => void;
    triggerVibration: () => void;
    triggerSound: () => void;
}

const EntropyVAKContext = createContext<EntropyVAKContextProps | undefined>(undefined);

export function EntropyVAKProvider({ children }: { children: React.ReactNode }) {
    const [entropy, setEntropy] = useState<EntropyState>('low_free_energy');
    const [vakProfile, setVakProfile] = useState<VAKProfile>('kinesthetic'); // Default to Kinesthetic to test navigator.vibrate

    // Haptic Feedback Logic
    const triggerVibration = () => {
        if (vakProfile === 'kinesthetic' && 'vibrate' in navigator) {
            navigator.vibrate([30, 20, 30]); // Subtle double-tap
        }
    };

    // Auditory Feedback Logic
    const triggerSound = () => {
        if (vakProfile === 'auditory') {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            }
        }
    };

    // Inject CSS Custom Properties for Entropy State
    useEffect(() => {
        const root = document.documentElement;
        if (entropy === 'low_free_energy') {
            root.style.setProperty('--entropy-padding', '2.5rem'); // p-10 equivalent
            root.style.setProperty('--entropy-duration', '0.8s');
            root.style.setProperty('--entropy-ease', 'cubic-bezier(0.4, 0, 0.2, 1)');
        } else {
            root.style.setProperty('--entropy-padding', '1rem'); // p-4 equivalent
            root.style.setProperty('--entropy-duration', '0.2s');
            root.style.setProperty('--entropy-ease', 'linear');
        }
    }, [entropy]);

    return (
        <EntropyVAKContext.Provider value={{ entropy, vakProfile, setEntropy, setVakProfile, triggerSound, triggerVibration }}>
            {/* Global Wrapper handling the Entropy Styles dynamically */}
            <div
                className="w-full h-full min-h-screen transition-all"
                style={{
                    padding: 'var(--entropy-padding)',
                    transitionDuration: 'var(--entropy-duration)',
                    transitionTimingFunction: 'var(--entropy-ease)'
                }}
            >
                {children}
            </div>
        </EntropyVAKContext.Provider>
    );
}

export function useEntropyVAK() {
    const context = useContext(EntropyVAKContext);
    if (context === undefined) {
        throw new Error('useEntropyVAK must be used within an EntropyVAKProvider');
    }
    return context;
}
