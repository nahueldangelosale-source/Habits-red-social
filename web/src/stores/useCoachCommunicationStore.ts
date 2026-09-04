import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { usePlanBuilderStore, type RoutineExercise } from './usePlanBuilderStore';

export interface InboxItem {
  id: string;
  athleteId: string;
  athleteName: string;
  athleteAvatar: string;
  issue: string;
  detailText: string;
  time: string;
  timestamp: number;
  type: 'URGENT' | 'BIOMECHANICS' | 'NUTRITION' | 'PAYMENT';
  status: 'PENDING' | 'RESOLVED';
  videoUrl?: string;
  exerciseName?: string;
  currentWeightKg?: number;
  declaredRpe?: number;
  coachFeedback?: string;
  resolvedAt?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'coach' | 'me';
  time: string;
  timestamp: number;
  mediaType?: 'text' | 'video_check' | 'routine_update' | 'validation_badge';
  mediaUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface CoachCommunicationState {
  inboxItems: InboxItem[];
  messages: ChatMessage[];
  broadcastChannel: BroadcastChannel | null;

  // Actions
  sendAthleteMessage: (
    text: string, 
    mediaType?: 'text' | 'video_check',
    topicType?: 'cargas' | 'video' | 'nutricion' | 'dolor' | 'nivel' | 'fatiga' | 'foto'
  ) => void;

  coachValidateBiomechanics: (
    inboxId: string, 
    decision: 'APPROVED' | 'ADJUSTED', 
    feedbackText: string, 
    loadDeltaKg?: number
  ) => void;

  coachReplyMessage: (inboxId: string, replyText: string) => void;
  markAsRead: (messageId: string) => void;
  initBroadcastSync: () => () => void;
}

const INITIAL_INBOX_ITEMS: InboxItem[] = [];
const INITIAL_MESSAGES: ChatMessage[] = [];

export const useCoachCommunicationStore = create<CoachCommunicationState>()(
  devtools(
    persist(
      (set, get) => ({
        inboxItems: INITIAL_INBOX_ITEMS,
        messages: INITIAL_MESSAGES,
        broadcastChannel: null,

        sendAthleteMessage: (text, mediaType = 'text', topicType) => {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            text,
            sender: 'me',
            time: timeStr,
            timestamp: Date.now(),
            mediaType,
            status: 'sent'
          };

          let newInboxItem: InboxItem | null = null;

          if (mediaType === 'video_check' || topicType === 'video') {
            newInboxItem = {
              id: `inbox-${Date.now()}`,
              athleteId: 'athlete-nahuel',
              athleteName: 'Nahuel (Tú)',
              athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              issue: 'Video de Técnica: Sentadilla Trasera (100 kg)',
              detailText: 'Video de levantamiento enviado por el atleta para validación biomecánica y rango de movimiento.',
              time: 'Ahora',
              timestamp: Date.now(),
              type: 'BIOMECHANICS',
              status: 'PENDING',
              exerciseName: 'Sentadilla Trasera con Barra',
              currentWeightKg: 100,
              declaredRpe: 8.5,
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-doing-barbell-squats-41484-large.mp4'
            };
          } else if (topicType === 'cargas') {
            newInboxItem = {
              id: `inbox-${Date.now()}`,
              athleteId: 'athlete-nahuel',
              athleteName: 'Nahuel (Tú)',
              athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              issue: 'Ajuste de Cargas y Sobrecarga Progresiva',
              detailText: text,
              time: 'Ahora',
              timestamp: Date.now(),
              type: 'BIOMECHANICS',
              status: 'PENDING'
            };
          } else if (topicType === 'dolor') {
            newInboxItem = {
              id: `inbox-${Date.now()}`,
              athleteId: 'athlete-nahuel',
              athleteName: 'Nahuel (Tú)',
              athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              issue: 'Alerta de Molestia Articular (Firewall Activo)',
              detailText: text,
              time: 'Ahora',
              timestamp: Date.now(),
              type: 'URGENT',
              status: 'PENDING'
            };
          } else if (topicType === 'nutricion') {
            newInboxItem = {
              id: `inbox-${Date.now()}`,
              athleteId: 'athlete-nahuel',
              athleteName: 'Nahuel (Tú)',
              athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              issue: 'Consulta de Intercambio Nutricional (Smart Swap)',
              detailText: text,
              time: 'Ahora',
              timestamp: Date.now(),
              type: 'NUTRITION',
              status: 'PENDING'
            };
          } else if (topicType === 'nivel') {
            newInboxItem = {
              id: `inbox-${Date.now()}`,
              athleteId: 'athlete-nahuel',
              athleteName: 'Nahuel (Tú)',
              athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              issue: 'Solicitud de Incremento de Intensidad y Nivel',
              detailText: text,
              time: 'Ahora',
              timestamp: Date.now(),
              type: 'BIOMECHANICS',
              status: 'PENDING'
            };
          } else if (topicType === 'fatiga') {
            newInboxItem = {
              id: `inbox-${Date.now()}`,
              athleteId: 'athlete-nahuel',
              athleteName: 'Nahuel (Tú)',
              athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              issue: 'Reporte de Fatiga Alta / Readiness Bajo',
              detailText: text,
              time: 'Ahora',
              timestamp: Date.now(),
              type: 'BIOMECHANICS',
              status: 'PENDING'
            };
          } else if (topicType === 'foto') {
            newInboxItem = {
              id: `inbox-${Date.now()}`,
              athleteId: 'athlete-nahuel',
              athleteName: 'Nahuel (Tú)',
              athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              issue: 'Foto de Control y Registro Antropométrico',
              detailText: text,
              time: 'Ahora',
              timestamp: Date.now(),
              type: 'BIOMECHANICS',
              status: 'PENDING'
            };
          }

          set((state) => ({
            messages: [...state.messages, newMsg],
            inboxItems: newInboxItem ? [newInboxItem, ...state.inboxItems] : state.inboxItems
          }));

          // Simular respuesta pedagógica del Coach Leandro tras 1.2s para enriquecer la experiencia 1 a 1
          if (topicType) {
            setTimeout(() => {
              const coachTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              let coachResponse = '';

              if (topicType === 'cargas') {
                coachResponse = '¡Excelente registro! Si te sentiste con RPE < 8, subimos +2.5 kg en la primera serie de la próxima sesión. Mantén el foco en la velocidad de barra.';
              } else if (topicType === 'video') {
                coachResponse = 'Recibí tu video. Lo estoy analizando en mi cabina biomecánica para darte feedback detallado de la trayectoria de barra y cadera.';
              } else if (topicType === 'nutricion') {
                coachResponse = 'Perfecto, el Smart Swap queda aprobado. La equivalencia mantiene tus gramos de carbohidratos netos y fibra sin alterar tu balance calórico diario.';
              } else if (topicType === 'dolor') {
                coachResponse = '⚠️ Alerta de molestia recibida. Activamos el firewall: evita llegar al fallo en ese rango y realizaremos el ejercicio alternativo que te dejé en tu rutina.';
              } else if (topicType === 'nivel') {
                coachResponse = '¡Gran progreso! Si la rutina actual te resulta fácil, aumentaremos 1 serie efectiva y ajustaremos la densidad de trabajo para la próxima semana.';
              } else if (topicType === 'fatiga') {
                coachResponse = 'Tomado en cuenta. Con Readiness bajo, hoy prioriza 20 min de movilidad suave, caminata e hidratación en lugar de levantar pesado.';
              } else if (topicType === 'foto') {
                coachResponse = 'Foto de control guardada en tu ficha confidencial. Se observa excelente recomposición y adherencia al plan de nutrición.';
              }

              if (coachResponse) {
                const autoCoachMsg: ChatMessage = {
                  id: `msg-coach-${Date.now()}`,
                  text: coachResponse,
                  sender: 'coach',
                  time: coachTime,
                  timestamp: Date.now(),
                  status: 'delivered'
                };

                set((state) => ({
                  messages: [...state.messages, autoCoachMsg]
                }));
              }
            }, 1200);
          }

          // Notify other browser tabs
          try {
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              const channel = new BroadcastChannel('bienestar-comms-channel');
              channel.postMessage({ type: 'NEW_MESSAGE', payload: newMsg, inboxItem: newInboxItem });
              channel.close();
            }
          } catch (e) {
            // Ignore channel error
          }
        },

        coachValidateBiomechanics: (inboxId, decision, feedbackText, loadDeltaKg = 0) => {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const isApproved = decision === 'APPROVED';
          const replyText = isApproved
            ? `✅ Coach Leandro Usea: ¡Técnica de Sentadilla validada con éxito! ${feedbackText || 'Excelente profundidad y estabilidad de rodillas.'} (+25 XP acreditados a tu cuenta 🏆)`
            : `⚠️ Coach Leandro Usea: Revisé tu video. ${feedbackText || `Ajusté la carga ${loadDeltaKg} kg para priorizar el rango de movimiento completo sin compensaciones.`}`;

          const coachMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            text: replyText,
            sender: 'coach',
            time: timeStr,
            timestamp: Date.now(),
            mediaType: 'validation_badge',
            status: 'delivered'
          };

          set((state) => ({
            messages: [...state.messages, coachMsg],
            inboxItems: state.inboxItems.map((item) =>
              item.id === inboxId
                ? {
                    ...item,
                    status: 'RESOLVED',
                    coachFeedback: feedbackText,
                    resolvedAt: timeStr
                  }
                : item
            )
          }));

          // If load delta exists, adjust athlete routine weight in usePlanBuilderStore
          if (loadDeltaKg !== 0) {
            try {
              const planStore = usePlanBuilderStore.getState();
              const activeDay = planStore.days[0];
              if (activeDay) {
                const exerciseItem = activeDay.items.find(
                  (i) => i.type === 'EXERCISE' && i.exercise.name.toLowerCase().includes('sentadilla')
                ) as RoutineExercise | undefined;

                if (exerciseItem) {
                  const currentWeightNum = parseFloat(exerciseItem.weight) || 100;
                  const newWeight = Math.max(20, currentWeightNum + loadDeltaKg);
                  planStore.updateItem(activeDay.id, exerciseItem.id, {
                    weight: `${newWeight}`
                  });
                }
              }
            } catch (e) {
              console.warn('Could not auto-adjust plan builder load', e);
            }
          }

          // Award XP to athlete
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('xp:award', {
                detail: { source: 'biomechanics_validated', amount: 25 }
              })
            );
          }

          // Broadcast to other tabs
          try {
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              const channel = new BroadcastChannel('bienestar-comms-channel');
              channel.postMessage({ type: 'VALIDATION_RESOLVED', inboxId, coachMsg });
              channel.close();
            }
          } catch (e) {
            // Ignore channel error
          }
        },

        coachReplyMessage: (inboxId, replyText) => {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const coachMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            text: `💬 Coach Leandro Usea: ${replyText}`,
            sender: 'coach',
            time: timeStr,
            timestamp: Date.now(),
            status: 'delivered'
          };

          set((state) => ({
            messages: [...state.messages, coachMsg],
            inboxItems: state.inboxItems.map((item) =>
              item.id === inboxId
                ? {
                    ...item,
                    status: 'RESOLVED',
                    coachFeedback: replyText,
                    resolvedAt: timeStr
                  }
                : item
            )
          }));

          try {
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              const channel = new BroadcastChannel('bienestar-comms-channel');
              channel.postMessage({ type: 'COACH_REPLY', inboxId, coachMsg });
              channel.close();
            }
          } catch (e) {
            // Ignore channel error
          }
        },

        markAsRead: (messageId) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === messageId ? { ...m, status: 'read' } : m
            )
          }));
        },

        initBroadcastSync: () => {
          if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
            return () => {};
          }

          const channel = new BroadcastChannel('bienestar-comms-channel');
          channel.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'NEW_MESSAGE') {
              set((state) => {
                const alreadyExists = state.messages.some((m) => m.id === data.payload.id);
                if (alreadyExists) return state;
                return {
                  messages: [...state.messages, data.payload],
                  inboxItems: data.inboxItem
                    ? [data.inboxItem, ...state.inboxItems.filter((i) => i.id !== data.inboxItem.id)]
                    : state.inboxItems
                };
              });
            } else if (data.type === 'VALIDATION_RESOLVED' || data.type === 'COACH_REPLY') {
              set((state) => ({
                messages: state.messages.some((m) => m.id === data.coachMsg.id)
                  ? state.messages
                  : [...state.messages, data.coachMsg],
                inboxItems: state.inboxItems.map((item) =>
                  item.id === data.inboxId ? { ...item, status: 'RESOLVED' } : item
                )
              }));
            }
          };

          return () => {
            channel.close();
          };
        }
      }),
      {
        name: 'bienestar-coach-communication-v2'
      }
    )
  )
);

// Purgar storage anterior con mock data '3' para que todo empiece en 0
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('bienestar-coach-communication-store');
  } catch {
    // Ignore storage restrictions
  }
}
