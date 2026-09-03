/**
 * Utility functions for color manipulation and UI safety.
 * Employs mathematically secure contrast ratios (YIQ) for WCAG compliance.
 */

export function getContrastYIQ(hexColor: string): '#09090b' | '#FFFFFF' {
    // 1. Sanitize the hex string
    hexColor = hexColor.replace('#', '');

    // Fallback if invalid hex is provided
    if (hexColor.length !== 6 && hexColor.length !== 3) {
        return '#09090b'; // Default black text for unknown background
    }

    // Convert 3-char hex to 6-char (e.g. F00 to FF0000)
    if (hexColor.length === 3) {
        hexColor = hexColor.split('').map(char => char + char).join('');
    }

    // 2. Parse RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // 3. Apply the YIQ formula
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // 4. Return black for light backgrounds, white for dark backgrounds
    return yiq >= 128 ? '#09090b' : '#FFFFFF';
}
