import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { DownloadImageJob, DownloadVideoJob } from '../../shared/types';
import { generateUniqueFileName } from '../../utils/media.util';
import Logger from '../../logger';


interface IDownloadPublisher {
  publishImageDownloadJob(job: DownloadImageJob): Promise<{ jobId: string, status: string | undefined }>;
  publishBatchImageDownloadJobs(jobs: DownloadImageJob[]): Promise<{ jobId: string, status: string | undefined }[]>;
  publishVideoDownloadJob(job: DownloadVideoJob): Promise<{ jobId: string, status: string | undefined }>;
  publishBatchVideoDownloadJobs(jobs: DownloadVideoJob[]): Promise<{ jobId: string, status: string | undefined }[]>;
  shutdown(): Promise<void>;
}


class DownloadPublisher implements IDownloadPublisher {
  private redis: Redis;
  private imageDownloadsQueue: Queue;
  private videoDownloadsQueue: Queue;
  private logger = Logger;

  constructor(redisConnection: { host: string, port: number }) {
    this.redis = new Redis(redisConnection);
    this.imageDownloadsQueue = new Queue('image-downloads', { 
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    });
    this.videoDownloadsQueue = new Queue('video-downloads', { 
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    });
  }


  private validateJob(job: DownloadImageJob): void {
    if(!job.id) {
      throw new Error('Invalid job: Missing ID');
    }

    if (!job?.url) {
      throw new Error('Invalid job: Missing URL');
    }
    if (!job?.filename) {
      throw new Error('Invalid job: Missing filename');
    }
    try {
      new URL(job.url);
    } catch {
      throw new Error('Invalid job: Malformed URL');
    }
  }

  async publishImageDownloadJob(job: DownloadImageJob): Promise<{ jobId: string, status: string | undefined }> {
    try {
      this.validateJob(job);

      const jobResponse = await this.imageDownloadsQueue.add('download-image', job);

      this.logger.info('Job published successfully', {
        jobId: jobResponse.id,
        url: job.url,
        filename: job.filename
      });

      if(!jobResponse.id) {
        throw new Error('Failed to publish job');
      }

      return {
        jobId: jobResponse.id,
        status: await jobResponse.getState()
      };

    } catch (error) {
      this.logger.error('Failed to publish download job', {
        error: error instanceof Error ? error.message : 'Unknown error',
        jobData: job,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async publishBatchImageDownloadJobs(jobs: DownloadImageJob[]): Promise<{ jobId: string, status: string | undefined }[]> {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new Error('Invalid input: jobs must be a non-empty array');
    }

    const BATCH_SIZE = 100;
    const results: { jobId: string, status: string | undefined }[] = [];

    try {
      // Validate all jobs first
      jobs.forEach(this.validateJob);

      // Process in batches
      for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(job => 
          this.imageDownloadsQueue.add('download-image', job, {
            jobId: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          })
        );

        const batchResponses = await Promise.all(batchPromises);

        // Validate and collect responses
        for (const jobResponse of batchResponses) {
          if (!jobResponse.id) {
            throw new Error(`Failed to publish job in batch`);
          }

          results.push({
            jobId: jobResponse.id,
            status: await jobResponse.getState()
          });
        }

        this.logger.info('Batch progress', {
          completedJobs: results.length,
          totalJobs: jobs.length,
          currentBatch: Math.floor(i / BATCH_SIZE) + 1,
          totalBatches: Math.ceil(jobs.length / BATCH_SIZE)
        });
      }

      this.logger.info('All batch jobs published successfully', {
        totalJobs: results.length
      });

      return results;

    } catch (error) {
      this.logger.error('Failed to publish batch download jobs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        jobsProcessed: results.length,
        totalJobs: jobs.length,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // If some jobs were processed successfully, return partial results
      if (results.length > 0) {
        this.logger.warn('Returning partial results', {
          successfulJobs: results.length,
          failedJobs: jobs.length - results.length
        });
        return results;
      }
      
      throw error;
    }
  }

  async publishVideoDownloadJob(job: DownloadVideoJob): Promise<{ jobId: string, status: string | undefined }> {
    try {
      this.validateJob(job);

      const jobResponse = await this.videoDownloadsQueue.add('download-video', job);

      this.logger.info('Job video published successfully', {
        jobId: jobResponse.id,
        url: job.url,
        filename: job.filename
      });

      if(!jobResponse.id) {
        throw new Error('Failed to publish video job');
      }

      return {
        jobId: jobResponse.id,
        status: await jobResponse.getState()
      };

    } catch (error) {
      this.logger.error('Failed to publish video download job', {
        error: error instanceof Error ? error.message : 'Unknown error',
        jobData: job,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async publishBatchVideoDownloadJobs(jobs: DownloadVideoJob[]): Promise<{ jobId: string, status: string | undefined }[]> {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new Error('Invalid input: jobs must be a non-empty array');
    }

    const BATCH_SIZE = 100;
    const results: { jobId: string, status: string | undefined }[] = [];

    try {
      // Validate all jobs first
      jobs.forEach(this.validateJob);

      // Process in batches
      for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(job => 
          this.videoDownloadsQueue.add('download-video', job, {
            jobId: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          })
        );

        const batchResponses = await Promise.all(batchPromises);

        // Validate and collect responses
        for (const jobResponse of batchResponses) {
          if (!jobResponse.id) {
            throw new Error(`Failed to publish job in batch`);
          }

          results.push({
            jobId: jobResponse.id,
            status: await jobResponse.getState()
          });
        }

        this.logger.info('Batch progress', {
          completedJobs: results.length,
          totalJobs: jobs.length,
          currentBatch: Math.floor(i / BATCH_SIZE) + 1,
          totalBatches: Math.ceil(jobs.length / BATCH_SIZE)
        });
      }

      this.logger.info('All batch jobs published successfully', {
        totalJobs: results.length
      });

      return results;

    } catch (error) {
      this.logger.error('Failed to publish batch download jobs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        jobsProcessed: results.length,
        totalJobs: jobs.length,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // If some jobs were processed successfully, return partial results
      if (results.length > 0) {
        this.logger.warn('Returning partial results', {
          successfulJobs: results.length,
          failedJobs: jobs.length - results.length
        });
        return results;
      }
      
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    await this.imageDownloadsQueue.close();
    await this.imageDownloadsQueue.disconnect();
  }
}


export { IDownloadPublisher, DownloadPublisher };