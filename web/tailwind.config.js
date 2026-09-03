/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // MODO CLÍNICO (Nutrición y Entrenador)
                clinical: {
                    bg: '#F8FAFC',        // Gris quirúrgico ultra-tenue para fondos
                    surface: '#FFFFFF',   // Blanco puro para tarjetas y lienzos de enfoque
                    muted: '#94A3B8',     // Gris mate (Regla de la Ausencia para CRI < 50)
                    text: '#334155',      // Texto base (alto contraste sin llegar al negro puro)
                    accent: '#3B82F6',    // Azul sobrio para interacciones de validación (confianza)
                },
                // Alertas de Riesgo
                risk: {
                    high: '#EF4444',      // Rojo intenso para CRI > 75 (Alerta inmediata)
                },
                // MODO ADRENALINA (Entreno B2C)
                adrenaline: {
                    bg: '#0F0F11', // Almost Black
                    surface: '#18181B', // Zinc 900
                    text: '#F4F4F5', // Zinc 100
                    neon: '#CEFF00', // Volt / Electric Lime
                    alert: '#FF3B30', // Neon Red
                },
                // MODO LONGEVIDAD (Paciente Clínico B2C - OVS 1b)
                longevity: {
                    bg: '#F5F5DC',      // Marfil/Beige (Contención perimetral)
                    surface: '#FFFFFF', // Blanco puro (Autoridad)
                    accent: '#C9D3CA',  // Verde Salvia suave
                    text: '#1E293B',    // Pizarra Oscuro (Autoridad anclada)
                },
                // Legacy / Utility mappings
                primary: 'var(--text-primary)',
                'muted-foreground': 'var(--text-muted)',
                foreground: 'var(--text-primary)',
                background: 'var(--canvas)',
                surface: 'var(--surface)',
                border: 'var(--border)',
            },
            fontFamily: {
                sans: ['"Lato"', 'sans-serif'],        // Lectura densa, telemetría y biomecánica
                heading: ['"Montserrat"', 'sans-serif'], // Autoridad, nombres de atletas y CTAs
                display: ['"Montserrat"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            letterSpacing: {
                'widest': '0.15em', // For Uppercase Labels (LUXURY TOUCH)
            },
            boxShadow: {
                'clinical': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            },
            animation: {
                'breathe': 'breathe 12s ease-in-out infinite', // 60BPM Respiratory Cycle (Calming)
                'heartbeat': 'heartbeat 1.5s ease-in-out infinite', // Resting Heart Rate
                'flashbang': 'flashbang 0.2s ease-out forwards', // Dopamine Spike
            },
            keyframes: {
                breathe: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
                    '50%': { transform: 'scale(1.15)', opacity: '0.6' }, // Expands like lungs
                },
                heartbeat: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
                flashbang: {
                    '0%': { opacity: '0', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', backgroundColor: '#fff' },
                    '100%': { opacity: '0', transform: 'scale(1)' },
                }
            }
        },
    },
    plugins: [],
}
