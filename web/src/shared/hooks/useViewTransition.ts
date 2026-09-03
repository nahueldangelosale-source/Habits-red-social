import { useCallback } from 'react';

/**
 * Operación Kinetic Glass - Vector 1: Native View Transitions API
 * Intercepts routing/DOM changes and wraps them in a 60FPS spatial transition.
 * Falls back gracefully if the API is not supported.
 */
export function useViewTransition() {
  const transitionViewIfSupported = useCallback((updateCb: () => void | Promise<void>) => {
    // Escudo de accesibilidad (SRE Compliance)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!document.startViewTransition || prefersReducedMotion) {
      updateCb();
      return;
    }

    document.startViewTransition(updateCb);
  }, []);

  return { transitionViewIfSupported };
}
