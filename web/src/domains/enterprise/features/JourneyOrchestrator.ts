import { DigitalTwinEventStore } from './DigitalTwinEventStore';
import { globalQueue } from '../../../infrastructure/async/QueueManager';
import { logger } from '../../../shared/lib/telemetry';

// Refactored to use the central Async Message Queue
export class SmartScheduler {
  eventStore: DigitalTwinEventStore;

  constructor(eventStore: DigitalTwinEventStore) {
    this.eventStore = eventStore;
  }

  public async scheduleFollowUp(memberId: string, gymId: string, dayMark: number): Promise<void> {
    logger.log('info', `[SmartScheduler] Dispatching async task to check retention on day ${dayMark}`, { memberId, gymId });
    
    // Non-blocking Queue Dispatch
    await globalQueue.enqueue({
      tenantId: gymId,
      jobType: 'MEMBER_JOURNEY_TICK',
      data: { memberId, dayMark }
    });
  }
}

export class OnboardingManager {
  private scheduler: SmartScheduler;
  private eventStore: DigitalTwinEventStore;
  
  constructor(eventStore: DigitalTwinEventStore) {
    this.eventStore = eventStore;
    this.scheduler = new SmartScheduler(eventStore);
  }

  /**
   * Triggers the 100-Day "Member Journey" async pipeline
   */
  public async initiateJourney(memberId: string, gymId: string): Promise<void> {
    logger.log('info', `[OnboardingManager] Initiating 100-Day Member Journey`, { memberId, gymId });
    
    // 1. Immutable Event
    this.eventStore.appendEvent({
      memberId,
      gymId,
      eventType: 'MEMBER_JOINED',
      payload: { journeyStarted: true }
    });

    // 2. Schedule Async Touchpoints
    await this.scheduler.scheduleFollowUp(memberId, gymId, 7);
    await this.scheduler.scheduleFollowUp(memberId, gymId, 15);
    await this.scheduler.scheduleFollowUp(memberId, gymId, 30);
    await this.scheduler.scheduleFollowUp(memberId, gymId, 100);
  }
}
