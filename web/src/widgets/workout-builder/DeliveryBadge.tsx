import React from 'react';
import { CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import type { IWorkoutPlan } from '../../api/types';

interface DeliveryBadgeProps {
    status: IWorkoutPlan['delivery_status'];
}

export const DeliveryBadge: React.FC<DeliveryBadgeProps> = ({ status }) => {
    if (!status) return null;

    switch (status) {
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    En proceso
                </span>
            );
        case 'sent':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                    <Send className="w-3.5 h-3.5" />
                    Enviado
                </span>
            );
        case 'read':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Visto
                </span>
            );
        case 'failed':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                    <XCircle className="w-3.5 h-3.5" />
                    Falló Delivery
                </span>
            );
        default:
            return null;
    }
};
