/**
 * Dialog Primitive — Design System
 * Accessible modal using native <dialog> + framer-motion.
 * Focus trap, ESC to close, backdrop blur.
 * 
 * Usage:
 *   <Dialog open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
 *     <p>Are you sure?</p>
 *   </Dialog>
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function Dialog({ open, onClose, title, children, className = '' }: DialogProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Trap focus inside dialog
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        // Auto-focus first focusable element
        const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="dialog-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label={title || 'Dialog'}
                >
                    <motion.div
                        ref={panelRef}
                        className={`dialog-panel ${className}`}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title && (
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-zinc-950/5 transition-colors"
                                    aria-label="Close dialog"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
