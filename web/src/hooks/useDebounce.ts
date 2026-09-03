import { useState, useEffect } from 'react';

/**
 * Hook personalizado para aplicar un retraso (debounce) a un valor que cambia rápidamente.
 * @param value El valor a retrasar.
 * @param delay El tiempo de retraso en milisegundos.
 * @returns El valor retrasado.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
