import { logger } from '../../shared/lib/telemetry';

export interface AsyncTaskPayload {
  tenantId: string;
  coachId?: string;
  jobType: 'DIET_GENERATION' | 'ROUTINE_GENERATION' | 'SWARM_REASONING' | 'MEMBER_JOURNEY_TICK' | 'SWARM_EVALUATION_JUDGE';
  data: any;
}

export interface JobMeta {
  jobId: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DLQ';
  attempts: number;
}

/**
 * QueueManager Simulator (BullMQ / Redis Facade)
 * SRE Vector 5: Async offloading to protect the Event Loop
 */
export class QueueManager {
  private queue = new Map<string, { payload: AsyncTaskPayload; meta: JobMeta }>();
  private dlq = new Map<string, { payload: AsyncTaskPayload; meta: JobMeta; error: any }>();
  public auditQueue = new Map<string, { originalJobId: string; status: string; payload: any }>();

  public async enqueue(payload: AsyncTaskPayload): Promise<string> {
    const jobId = `job_${crypto.randomUUID()}`;
    
    this.queue.set(jobId, {
      payload,
      meta: { jobId, status: 'QUEUED', attempts: 0 }
    });

    logger.log('info', `[QueueManager] Job ${jobId} enqueued for ${payload.jobType}`, { tenantId: payload.tenantId });
    
    // In production: await redis.xadd(...) or bull.add()
    return jobId;
  }

  // Audit Queue Draining
  private routeToAudit(jobId: string, status: 'COMPLETED' | 'DLQ', payload: AsyncTaskPayload) {
    // SRE Safeguard: Prevent infinite evaluation loops
    if (payload.jobType === 'SWARM_EVALUATION_JUDGE') return;

    const shouldAudit = status === 'DLQ' || Math.random() <= 0.05; // 100% DLQ, 5% COMPLETED
    if (shouldAudit) {
      this.auditQueue.set(`audit_${jobId}`, {
        originalJobId: jobId,
        status,
        payload
      });
      logger.log('info', `[QueueManager] Job ${jobId} (${status}) routed to AuditQueue for Cognitive Court`);
    }
  }

  public getJob(jobId: string) {
    return this.queue.get(jobId);
  }

  // Exposed for WorkerNode interaction
  public _markProcessing(jobId: string) {
      const job = this.queue.get(jobId);
      if(job) job.meta.status = 'PROCESSING';
  }

  public _markCompleted(jobId: string) {
    const job = this.queue.get(jobId);
    if(job) {
      job.meta.status = 'COMPLETED';
      this.routeToAudit(jobId, 'COMPLETED', job.payload);
    }
  }

  public _handleFailure(jobId: string, error: any, maxRetries: number = 3) {
    const job = this.queue.get(jobId);
    if (!job) return;

    job.meta.attempts += 1;
    if (job.meta.attempts >= maxRetries) {
      job.meta.status = 'DLQ';
      this.dlq.set(jobId, { ...job, error });
      this.queue.delete(jobId);
      logger.log('error', `[QueueManager] Job ${jobId} DEAD LETTERED (DLQ) after ${maxRetries} attempts`, { error: error.message });
      this.routeToAudit(jobId, 'DLQ', job.payload);
    } else {
      job.meta.status = 'FAILED';
      logger.log('warn', `[QueueManager] Job ${jobId} failed. Attempt ${job.meta.attempts}/${maxRetries}. Exponential Backoff triggered.`);
      // En production, scheduler retrasaría la re-ejecución
    }
  }
}

// Singleton for simulation purposes
export const globalQueue = new QueueManager();
