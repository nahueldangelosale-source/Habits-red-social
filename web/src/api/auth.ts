/**
 * Auth Service - Development Auto-Login
 * Handles JWT token acquisition for development mode
 * 
 * WARNING: This uses a dev-only endpoint. Do not use in production.
 */

import { API_BASE_URL } from './client';

// Token storage
let currentToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

// Dev user emails
export const DEV_USERS = {
    ADMIN: 'admin@bienestar.app',
    NUTRITIONIST: 'nutricionista@bienestar.app',
    TRAINER: 'entrenador@bienestar.app',
    DEFAULT: 'dev@bienestar.app',
} as const;

export type DevUserEmail = typeof DEV_USERS[keyof typeof DEV_USERS];

/**
 * Response from /auth/dev-login
 */
interface TokenResponse {
    access_token: string;
    token_type: string;
}

/**
 * Login as a dev user and get JWT token
 * This is a headless login - no UI required
 */
export async function loginDevUser(
    email: DevUserEmail = DEV_USERS.NUTRITIONIST
): Promise<string> {
    // If we already have a token, return it
    if (currentToken) {
        return currentToken;
    }

    // If a login is already in progress, wait for it
    if (tokenPromise) {
        return tokenPromise;
    }

    // Start login process
    tokenPromise = (async () => {
        try {
            console.log(`🔐 Dev Auto-Login: Authenticating as ${email}...`);

            const response = await fetch(`${API_BASE_URL}/auth/dev-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Login failed: ${response.status}`);
            }

            const data: TokenResponse = await response.json();
            currentToken = data.access_token;

            console.log('✅ Dev Auto-Login: Token acquired successfully');
            return currentToken;
        } catch (error) {
            console.error('❌ Dev Auto-Login failed:', error);
            throw error;
        } finally {
            tokenPromise = null;
        }
    })();

    return tokenPromise;
}

/**
 * Get the current token (or null if not logged in)
 */
export function getToken(): string | null {
    return currentToken;
}

/**
 * Clear the current token (logout)
 */
export function clearToken(): void {
    currentToken = null;
    console.log('🔓 Dev Auto-Login: Token cleared');
}

/**
 * Check if we have a valid token
 */
export function isAuthenticated(): boolean {
    return currentToken !== null;
}

/**
 * Ensure we're authenticated before making API calls
 * Call this at app startup or before protected API calls
 */
export async function ensureAuthenticated(
    email: DevUserEmail = DEV_USERS.NUTRITIONIST
): Promise<void> {
    if (!currentToken) {
        await loginDevUser(email);
    }
}
