/**
 * Athlete B2C API Layer
 * Handles magic link redemption and authenticated feedback submission.
 */

import { API_BASE_URL } from './client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RedeemTokenResponse {
    access_token: string;
    token_type: string;
    client_id: string;
    tenant_id: string;
    expires_at: string;
}

export interface FeedbackPayload {
    feedback_type: 'COMPLETED' | 'TOO_HEAVY' | 'PAIN';
    notes?: string;
    entity_id?: string;
}

// ─── Token Redemption ────────────────────────────────────────────────────────

export async function redeemMagicToken(token: string): Promise<RedeemTokenResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth-b2c/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magic_token: token }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

// ─── Authenticated Feedback ──────────────────────────────────────────────────

export async function submitAthleteFeedback(payload: FeedbackPayload): Promise<void> {
    const jwt = localStorage.getItem('token');
    if (!jwt) throw new Error('No athlete JWT found — please use your magic link');

    const res = await fetch(`${API_BASE_URL}/api/v1/athlete/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }
}

// ─── Missed Messages (for B2B Coach) ─────────────────────────────────────────

export interface InboxMessage {
    id: string;
    sender_id?: string;
    sender_type: string;
    content: string;
    intent_category: string;
    created_at: string;
    is_read: boolean;
}

export async function fetchMissedMessages(): Promise<InboxMessage[]> {
    const jwt = localStorage.getItem('token');
    if (!jwt) throw new Error('No coach JWT found');

    const res = await fetch(`${API_BASE_URL}/api/v1/inbox/missed`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
    });

    if (res.status === 404) {
        return [];
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch missed messages: HTTP ${res.status}`);
    }

    return res.json();
}
