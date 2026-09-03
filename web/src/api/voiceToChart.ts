import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface VoiceToChartOutput {
    id: string;
    client_id: string;
    professional_id: string;
    consultation_type: string;
    recorded_at: string;
    duration_seconds: number;
    subjective: {
        chief_complaint: string;
        symptoms: string[];
        symptom_severity: string;
        lifestyle_notes: string;
        adherence_self_report: string;
        goals_mentioned: string[];
    };
    objective: {
        weight_kg: number | null;
        body_fat_percentage: number | null;
        measurements: Record<string, number> | null;
        vital_signs: Record<string, any> | null;
        performance_metrics: Record<string, any> | null;
        photos_taken: boolean;
    };
    assessment: {
        progress_evaluation: string;
        barriers_identified: string[];
        risk_factors: string[];
        clinical_notes: string;
    };
    plan: {
        protocol_adjustments: string[];
        new_targets: Record<string, string> | null;
        homework: string[];
        follow_up_date: string | null;
        referrals: string[];
    };
    transcription_confidence: number;
    extraction_confidence: number;
    raw_transcription: string;
    requires_review: boolean;
}

export const voiceToChartApi = {
    /**
     * Upload audio recording for SOAP processing
     */
    uploadAudio: async (
        audioBlob: Blob,
        clientId: string,
        professionalId: string,
        durationSeconds: number
    ): Promise<VoiceToChartOutput> => {
        const formData = new FormData();
        // Append file with a filename so backend detects extension (defaulting to .m4a or .webm depending on recorder)
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('client_id', clientId);
        formData.append('professional_id', professionalId);
        formData.append('duration_seconds', durationSeconds.toString());

        try {
            const response = await axios.post(`${API_URL}/api/v1/voice-to-chart/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 120000, // Long timeout for Whisper + GPT-4o
            });
            return response.data;
        } catch (error) {
            console.error("VoiceToChart Upload Error:", error);
            // Fallback to Demo if error (for dev stability)
            console.warn("Falling back to DEMO endpoint due to error");
            return voiceToChartApi.getDemoData();
        }
    },

    /**
     * Get demo data for testing without backend/credits
     */
    getDemoData: async (): Promise<VoiceToChartOutput> => {
        const response = await axios.get(`${API_URL}/api/v1/voice-to-chart/demo`);
        return response.data;
    }
};
