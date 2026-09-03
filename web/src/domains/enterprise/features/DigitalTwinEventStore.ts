import { z } from 'zod';
import { logger } from '../../../shared/lib/telemetry';

// --- CQRS & EVENT SOURCING SCHEMAS ---

export const RetentionEventSchema = z.object({
  eventId: z.string().uuid(),
  memberId: z.string(),
  gymId: z.string(),
  eventType: z.enum([
    'MEMBER_JOINED',
    'MEMBER_ATTENDED_CLASS',
    'MEMBER_MISSED_WORKOUT',
    'MEMBER_AT_RISK',
    'MEMBER_CHURNED'
  ]),
  payload: z.any(),
  timestamp: z.number()
});

export type IRetentionEvent = z.infer<typeof RetentionEventSchema>;

/**
 * Event Store Mock: Registers immutable events for the Gym Domain
 */
export class DigitalTwinEventStore {
  private events: IRetentionEvent[] = [];

  public appendEvent(event: Omit<IRetentionEvent, 'eventId' | 'timestamp'>) {
    const fullEvent: IRetentionEvent = {
        ...event,
        eventId: crypto.randomUUID(),
        timestamp: Date.now()
    };
    
    // Strict Zod Validation (Zero Trust CQRS)
    RetentionEventSchema.parse(fullEvent);
    this.events.push(fullEvent);
    
    logger.log('info', `[Enterprise CQRS] Event appended: ${fullEvent.eventType}`, { gymId: event.gymId, memberId: event.memberId });
  }

  public getEventsForMember(memberId: string): IRetentionEvent[] {
    return this.events.filter(e => e.memberId === memberId).sort((a, b) => a.timestamp - b.timestamp);
  }
}
