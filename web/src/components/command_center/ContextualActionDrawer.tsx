import React, { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    athleteId: string | null;
    athleteName: string;
    semaphoreStatus: 'RED' | 'YELLOW' | 'GREEN';
    primaryRiskFactor: string;
    contextMetadata: {
        days_inactive?: number;
        acwr?: number;
        pain_level?: number;
        suggested_template?: string;
    };
}

export const ContextualActionDrawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    athleteId,
    athleteName,
    semaphoreStatus,
    primaryRiskFactor,
    contextMetadata
}) => {
    const { mutate } = useSWRConfig();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && contextMetadata.suggested_template) {
            setMessage(contextMetadata.suggested_template);
        }
    }, [isOpen, contextMetadata]);

    if (!isOpen) return null;

    const handleSnooze = async (hours: number) => {
        if (!athleteId) return;

        // Optimistic UI Update for the dashboard
        mutate(
            '/api/v1/command-center/dashboard',
            (currentData: any) => {
                if (!currentData) return currentData;
                return {
                    ...currentData,
                    athletes: currentData.athletes.filter((a: any) => a.athlete_id !== athleteId)
                };
            },
            false // don't revalidate immediately
        );
        onClose();

        try {
            const response = await fetch(`/api/v1/command-center/patients/${athleteId}/snooze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hours })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to snooze');
            }

            toast.success(`Alerta silenciada por ${hours}h`);
            // Trigger actual revalidation to get new ETag
            mutate('/api/v1/command-center/dashboard');
        } catch (error: any) {
            // SWR Rollback on Error
            toast.error(error.message || 'Error al silenciar la alerta');
            // Revalidate to restore the critical RED card
            mutate('/api/v1/command-center/dashboard');
        }
    };

    const handleSendMessage = async () => {
        if (!athleteId) return;
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/v1/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_id: athleteId,
                    content: message,
                    is_system_generated: false
                })
            });

            if (!response.ok) throw new Error('Error al enviar el mensaje');
            
            toast.success('Mensaje enviado al Inbox del atleta');
            
            // Auto-snooze for 24h as action was taken
            await handleSnooze(24);
            
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                    <div className="pointer-events-auto relative w-screen max-w-md">
                        <div className="flex h-full flex-col bg-white shadow-xl">
                            {/* Header */}
                            <div className="bg-gray-50 px-4 py-6 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold font-montserrat text-gray-900" id="slide-over-title">
                                        Gestión de Alerta
                                    </h2>
                                    <button type="button" onClick={onClose} className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        <span className="sr-only">Close panel</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Body */}
                            <div className="relative flex-1 px-4 py-6 sm:px-6 overflow-y-auto font-lato">
                                
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">{athleteName}</h3>
                                    <div className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                        semaphoreStatus === 'RED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {primaryRiskFactor.replace(/_/g, ' ')}
                                    </div>
                                </div>

                                <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 font-montserrat">Telemetría Crítica</h4>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                                        {contextMetadata.acwr !== undefined && (
                                            <div>
                                                <dt className="text-xs font-medium text-gray-500">ACWR</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{contextMetadata.acwr.toFixed(2)}</dd>
                                            </div>
                                        )}
                                        {contextMetadata.pain_level !== undefined && (
                                            <div>
                                                <dt className="text-xs font-medium text-gray-500">Dolor Reportado</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{contextMetadata.pain_level}/10</dd>
                                            </div>
                                        )}
                                        {contextMetadata.days_inactive !== undefined && (
                                            <div>
                                                <dt className="text-xs font-medium text-gray-500">Días Inactivo</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{contextMetadata.days_inactive}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-sm font-medium leading-6 text-gray-900 font-montserrat">
                                        Mensaje Sugerido (Zero Friction)
                                    </label>
                                    <div className="mt-2">
                                        <textarea
                                            id="message"
                                            rows={4}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Este texto fue pre-configurado de forma determinista para garantizar un tono protector y empático.
                                    </p>
                                </div>
                                
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={handleSendMessage}
                                    className="w-full rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex justify-center items-center font-montserrat disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar al Inbox (App)'}
                                </button>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex flex-col gap-2 border-t border-gray-200 px-4 py-4 sm:px-6">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-montserrat text-center mb-2">
                                    Acciones de Silencio (Snooze)
                                </h4>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSnooze(48)}
                                        className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 font-lato"
                                    >
                                        Silenciar 48h
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSnooze(72)}
                                        disabled={semaphoreStatus === 'RED'} // UI Disable for RED, backend validates anyway
                                        className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-lato"
                                        title={semaphoreStatus === 'RED' ? 'No disponible para alertas críticas' : ''}
                                    >
                                        Silenciar 72h
                                    </button>
                                </div>
                                {semaphoreStatus === 'YELLOW' && (
                                    <button
                                        type="button"
                                        onClick={() => handleSnooze(168)}
                                        className="mt-2 w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 font-lato"
                                    >
                                        Pausar 1 Semana (Solo Amarillo)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
