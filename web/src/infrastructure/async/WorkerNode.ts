import { globalQueue } from './QueueManager';
import type { AsyncTaskPayload } from './QueueManager';
import { logger } from '../../shared/lib/telemetry';

/**
 * WorkerNode Simulator
 * SRE Vector 5: Dedicated thread/process for heavy GenAI/GraphRAG operations
 */
export class WorkerNode {
  /**
   * Simulates picking up a job from the queue and processing it.
   */
  public async processJob(jobId: string, processorConfig: { maxRetries: number; backoffMultiplier: number }) {
    const jobRecord = globalQueue.getJob(jobId);
    if (!jobRecord) return;

    globalQueue._markProcessing(jobId);
    logger.log('info', `[WorkerNode] Processing job ${jobId} of type ${jobRecord.payload.jobType}`);

    try {
      await this.executeHeavyWorkload(jobRecord.payload);
      globalQueue._markCompleted(jobId);
      logger.log('info', `[WorkerNode] Job ${jobId} completed successfully.`);
    } catch (error: any) {
      // Exponential Backoff applied by QueueManager simulator
      globalQueue._handleFailure(jobId, error, processorConfig.maxRetries);
      
      const jobState = globalQueue.getJob(jobId);
      if (jobState && jobState.meta.status !== 'DLQ') {
          const delay = Math.pow(processorConfig.backoffMultiplier, jobState.meta.attempts) * 1000;
          logger.log('info', `[WorkerNode] Retrying job ${jobId} in ${delay}ms...`);
          setTimeout(() => this.processJob(jobId, processorConfig), delay);
      }
    }
  }

  private async executeHeavyWorkload(_payload: AsyncTaskPayload): Promise<void> {
    // Simulacro de carga (LLM Inference, DTG Parsing, etc.)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Random failure injection to test DLQ/Backoff
        if (Math.random() < 0.3) {
           reject(new Error("LLM Provider Timeout / Rate Limit Exceeded"));
        } else {
           resolve();
        }
      }, 2000);
    });
  }
}
