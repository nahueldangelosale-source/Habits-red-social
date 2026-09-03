import { useState, useEffect, useCallback } from 'react';
import type { IWorkoutPlan } from '../api/types';

const DRAFT_PREFIX = 'workout_builder_draft_';

export function useWorkoutDraft(planId: string, serverData?: IWorkoutPlan) {
    const draftKey = `${DRAFT_PREFIX}${planId}`;

    const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
    const [draftData, setDraftData] = useState<IWorkoutPlan | null>(null);

    // Check for existing drafts on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(draftKey);
            if (stored) {
                const parsed = JSON.parse(stored);

                // Simple reconciliation check
                // Ideally we compare timestamps: `parsed.updatedAt > serverData.updatedAt`
                // But for this scenario, if a draft exists and it differs wildly from server, we flag it.
                // We assume if it's there, it's unsaved due to a previous 500.
                setDraftData(parsed);
                setHasUnsavedDraft(true);
            }
        } catch (e) {
            console.warn("Error reading draft from localStorage", e);
        }
    }, [draftKey]);

    const saveDraft = useCallback((plan: IWorkoutPlan) => {
        try {
            localStorage.setItem(draftKey, JSON.stringify(plan));
        } catch (e) {
            console.warn("Failed to save draft to localStorage", e);
        }
    }, [draftKey]);

    const discardDraft = useCallback(() => {
        localStorage.removeItem(draftKey);
        setHasUnsavedDraft(false);
        setDraftData(null);
    }, [draftKey]);

    return {
        hasUnsavedDraft,
        draftData,
        saveDraft,
        discardDraft
    };
}
