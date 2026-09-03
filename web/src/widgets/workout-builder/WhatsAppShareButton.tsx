import React from 'react';
import { MessageSquareShare } from 'lucide-react';
import { useWhatsAppShare } from '../../hooks/useWhatsAppShare';
import type { IWorkoutPlan } from '../../api/types';

interface WhatsAppShareButtonProps {
    planId: IWorkoutPlan['id'];
    clientId: IWorkoutPlan['client_id'];
    disabled?: boolean;
}

export const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({ planId, clientId, disabled }) => {
    const { shareToWhatsApp, isSharing } = useWhatsAppShare(planId);

    const handleShare = () => {
        if (!clientId) {
            alert("Este plan no tiene un cliente asociado aún.");
            return;
        }
        shareToWhatsApp();
    };

    return (
        <button
            onClick={handleShare}
            disabled={disabled || isSharing || !clientId}
            className={`
        inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
        ${(disabled || isSharing || !clientId)
                    ? 'bg-gray-100/5 text-gray-400 cursor-not-allowed border border-gray-100/10'
                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 font-bold shadow-neon-subtle'
                }
      `}
            title={!clientId ? "Requiere un cliente asignado" : "Enviar rutina por WhatsApp"}
        >
            <MessageSquareShare className={`w-4 h-4 ${isSharing ? 'animate-pulse' : ''}`} />
            {isSharing ? 'Enviando...' : 'Enviar por WhatsApp'}
        </button>
    );
};
