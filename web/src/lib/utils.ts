import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to conditionally append and merge Tailwind CSS classes
 * cleanly without conflicts. Foundational for the Vanguard Ignite design system.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
