/**
 * HYBRID CORE - Theme Context Provider
 * Two distinct UI states:
 * - CLINICAL: Apple-style, clean, airy (Nutrition/Admin)
 * - ADRENALINE: High-performance dark mode (Workout)
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeMode = 'CLINICAL' | 'ADRENALINE';

interface ThemeContextType {
    mode: ThemeMode;
    toggleMode: () => void;
    setMode: (mode: ThemeMode) => void;
    branding: BrandingData | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// CSS Variables for each mode
const clinicalVars = {
    '--canvas': '#09090b',
    '--surface': '#111111',
    '--surface-hover': '#1A1A1A',
    '--surface-elevated': '#161618',
    '--border': '#2A2A2A',
    '--border-subtle': '#1A1A1A',
    '--border-focus': '#88B04B',
    '--text-primary': '#FFFFFF',
    '--text-muted': '#8E8E93',
    '--text-faint': '#48484A',
    '--accent': '#88B04B',
    '--accent-glow': 'rgba(136, 176, 75, 0.2)',
    '--signal-emerald': '#34C759',
    '--signal-amber': '#FF9500',
    '--signal-red': '#FF3B30',
    '--nav-bg': 'rgba(0, 0, 0, 0.8)',
    '--card-shadow': '0 10px 40px rgba(0,0,0,0.5)',
    '--card-radius': '24px',
};

const adrenalineVars = {
    '--canvas': '#09090b',
    '--surface': '#0A0A0A',
    '--surface-hover': '#1A1A1A',
    '--surface-elevated': '#111111',
    '--border': '#2A2A2A',
    '--border-subtle': '#1A1A1A',
    '--border-focus': '#6366f1',
    '--text-primary': '#FFFFFF',
    '--text-muted': '#888888',
    '--text-faint': '#555555',
    '--accent': '#6366f1',
    '--accent-glow': 'rgba(206, 255, 0, 0.4)',
    '--signal-emerald': '#6366f1',
    '--signal-amber': '#FF9500',
    '--signal-red': '#FF3B30',
    '--nav-bg': 'rgba(0, 0, 0, 0.9)',
    '--card-shadow': '0 0 30px rgba(206, 255, 0, 0.1)',
    '--card-radius': '8px',
};

export interface BrandingData {
    logo_url: string | null;
    primary_color: string;
    payment_status: 'active' | 'past_due';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>('CLINICAL');
    const [branding, setBranding] = useState<BrandingData | null>(null);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
    };

    const toggleMode = () => {
        setModeState(prev => prev === 'CLINICAL' ? 'ADRENALINE' : 'CLINICAL');
    };

    // Fetch branding on mount
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // Use the tenant configuration endpoint
                const res = await fetch('/api/v1/tenants/branding');

                const contentType = res.headers.get("content-type");
                if (!res.ok || !contentType || !contentType.includes("application/json")) {
                    console.warn("ThemeContext: Backend branding response is not valid JSON or failed:", res.status);
                    return;
                }

                const data = await res.json();
                setBranding(data);
            } catch (err) {
                console.error("ThemeContext: Backend branding fetch failed", err);
            }
        };
        fetchBranding();
    }, []);

    // Apply CSS variables to document root
    useEffect(() => {
        const vars = { ...(mode === 'CLINICAL' ? clinicalVars : adrenalineVars) };
        const root = document.documentElement;

        // --- GLASS WALL & SAFE MODE (Phase 25) ---
        // If past_due, override the primary color with AUREA default
        if (branding?.payment_status === 'past_due') {
            vars['--accent'] = '#6366f1'; // Default AUREA Cyan/Volt
            vars['--border-focus'] = '#6366f1';
            vars['--accent-glow'] = 'rgba(206, 255, 0, 0.4)';
        } else if (branding?.primary_color) {
            // Apply custom corporate color if active
            vars['--accent'] = branding.primary_color;
            vars['--border-focus'] = branding.primary_color;
        }

        Object.entries(vars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Add mode class to body for additional styling hooks
        document.body.classList.remove('mode-clinical', 'mode-adrenaline');
        document.body.classList.add(mode === 'CLINICAL' ? 'mode-clinical' : 'mode-adrenaline');

        // Toggle 'dark' class on html for Tailwind dark mode
        if (mode === 'ADRENALINE') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }, [mode, branding]);

    return (
        <ThemeContext.Provider value={{ mode, toggleMode, setMode, branding }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
