import type { ActionCardData } from './types';

export const executeAction = (card: ActionCardData, onActionTriggered: (id: string, type?: string, payload?: any) => void) => {
  const { type, payload } = card.action_execution;

  switch (type) {
    case 'EXTERNAL_DEEP_LINK':
      if (payload.url) {
        window.open(payload.url, '_blank', 'noopener,noreferrer');
        onActionTriggered(card.id, type, payload); // Notifica al componente para mutación optimista
      }
      break;
    
    case 'INTERNAL_CHAT':
      console.log(`Abriendo canal de chat interno: ${payload.channel_id}`);
      onActionTriggered(card.id, type, payload);
      break;

    default:
      console.warn(`Tipo de acción no soportado: ${type}`);
  }
};
