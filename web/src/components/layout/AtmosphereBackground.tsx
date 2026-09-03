import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export const AtmosphereBackground: React.FC = () => {
    const { mode } = useTheme();

    // DEBUG: Overlay
    // console.log("Atmosphere Mode:", mode);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-1000">
            {mode === 'CLINICAL' ? (
                // CLINICAL ATMOSPHERE (Deep Void)
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-[#09090b]"
                >
                    {/* Subtle Dark Sage Pulse */}
                    <motion.div
                        animate={{
                            opacity: [0.05, 0.1, 0.05],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(136,176,75,0.05)_0%,transparent_100%)]"
                    />
                </motion.div>
            ) : (
                // ADRENALINE ATMOSPHERE (Deep Void + Volt)
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-[#09090b]"
                >
                    {/* Subtle Volt Pulse */}
                    <motion.div
                        animate={{
                            opacity: [0.05, 0.08, 0.05],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(206,255,0,0.05)_0%,transparent_70%)]"
                    />
                </motion.div>
            )}
        </div>
    );
};
