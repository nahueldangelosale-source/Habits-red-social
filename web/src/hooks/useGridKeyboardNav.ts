import { useEffect, useState, RefObject } from 'react';

interface UseGridKeyboardNavProps {
    rows: number;
    cols: number;
    containerRef: RefObject<HTMLElement | null>;
}

export const useGridKeyboardNav = ({ rows, cols, containerRef }: UseGridKeyboardNavProps) => {
    const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!focusedCell) return;

            let newRow = focusedCell.row;
            let newCol = focusedCell.col;

            switch (e.key) {
                case 'ArrowUp':
                    newRow = Math.max(0, focusedCell.row - 1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    newRow = Math.min(rows - 1, focusedCell.row + 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    newCol = Math.max(0, focusedCell.col - 1);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    newCol = Math.min(cols - 1, focusedCell.col + 1);
                    e.preventDefault();
                    break;
                default:
                    return;
            }

            setFocusedCell({ row: newRow, col: newCol });
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (container) {
                container.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [focusedCell, rows, cols, containerRef]);

    return { focusedCell, setFocusedCell };
};
