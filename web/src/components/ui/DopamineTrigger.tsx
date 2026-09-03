import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface DopamineTriggerProps {
    children: React.ReactNode;
    onTrigger?: () => void;
    onClick?: () => void; // Backward compatibility
    className?: string;
}

export const DopamineTrigger: React.FC<DopamineTriggerProps> = ({ children, onTrigger, onClick, className }) => {
    const controls = useAnimation();
    const [flash, setFlash] = useState(false);

    const handlePress = async () => {
        // 1. Haptic Feedback (if available on mobile)
        if (navigator.vibrate) navigator.vibrate(50);

        // 2. The Flashbang Visual
        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        // 3. The Physical Recoil Animation
        await controls.start({
            scale: [1, 0.9, 1.05, 1],
            rotate: [0, -2, 2, 0], // The "Crunch" feel
            transition: { duration: 0.3 }
        });

        const action = onTrigger || onClick;
        if (action) action();
    };

    return (
        <div className="relative inline-block w-full">
            {/* The Flash Overlay */}
            {flash && (
                <div className="absolute inset-0 bg-white mix-blend-overlay rounded-xl z-50 animate-flashbang pointer-events-none" />
            )}

            <motion.button
                animate={controls}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePress}
                className={className}
            >
                {children}
            </motion.button>
        </div>
    );
};
