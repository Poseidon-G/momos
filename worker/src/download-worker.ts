import { Worker, Job } from 'bullmq';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { downloadImage, getImageExtension } from './utils';
import { DownloadImageJob, JobResult } from './shared/types';
import os from 'os';
import { ResultPublisher } from './publisher/result-download-publisher';

class DownloadImageWorker {
  private worker: Worker;
  private resultPublisher: ResultPublisher;
  private active: number = 0;
  private isShuttingDown: boolean = false;

  constructor(
    private config: {
      redisHost: string;
      redisPort: number;
      imageQueueName?: string;
      downloadDir?: string;
      maxConcurrency?: number;
    }
  ) {
    const downloadDir = config.downloadDir || path.join(process.cwd(), 'downloads');
    fs.ensureDirSync(downloadDir);

    this.worker = new Worker(
      config.imageQueueName || 'image-downloads',
      this.processDownloadJob.bind(this),
      {
        connection: {
          host: config.redisHost,
          port: config.redisPort
        },
        concurrency: config.maxConcurrency || os.cpus().length
      }
    );

    this.resultPublisher = new ResultPublisher({
      redisHost: config.redisHost,
      redisPort: config.redisPort
    });

    this.setupWorkerEventHandlers();
  }

  private async processDownloadJob(job: Job): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('Worker is shutting down');
    }

    const { url, metadata, filename, id} = job.data as DownloadImageJob;
    
    if (!url) {
      throw new Error('Invalid job: URL is required');
    }

    const extension = await getImageExtension(url);
    const downloadDir = this.config.downloadDir || path.join(process.cwd(), 'downloads');
    const fileNameWithExt = filename.endsWith(extension) ? filename : `${filename}${extension}`;
    const filePath = path.join(downloadDir, fileNameWithExt);

    try {
       await downloadImage(url, filePath);

       if( !job.id) { 
        throw new Error('Job ID is missing');
       }

        await this.resultPublisher.publishDownloadResult({
          mediaId: id,
          filePath,
        });
    } catch (error) {
       await this.resultPublisher.publishDownloadResult({
          mediaId: id,
          errorMsg: error instanceof Error ? error.message : 'Unknown error'
        });
      console.error(`Download failed for ${url}:`, error);
      throw error;
    }
  }

  private setupWorkerEventHandlers() {
    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id ?? 'unknown'} failed:`, error);
    });

    this.worker.on('error', (error) => {
      console.error('Worker error:', error);
    });

    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  async shutdown() {
    this.isShuttingDown = true;
    console.log('Gracefully shutting down...');
    
    // Wait for active jobs to complete
    while (this.active > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await this.worker.close();
    console.log('Worker shut down successfully');
  }
}

export default DownloadImageWorker;