import { Worker, Job } from 'bullmq';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { downloadVideo, getVideoExtension } from './utils';
import { DownloadImageJob, JobResult } from './shared/types';
import os from 'os';
import { ResultPublisher } from './publisher/result-download-publisher';

class DownloadVideoWorker {
    private worker: Worker;
    private active: number = 0;
    private isShuttingDown: boolean = false;
    private workerName: string;
    private resultPublisher: ResultPublisher;

    constructor(
        private config: {
            redisHost: string;
            redisPort: number;
            videoQueueName?: string;
            downloadDir?: string;
            maxConcurrency?: number;
            workerName?: string; // Add workerName to the config
        }
    ) {
        this.workerName = config.workerName || 'video-worker';
        const downloadDir = config.downloadDir || path.join(process.cwd(), 'downloads');
        fs.ensureDirSync(downloadDir);

        this.worker = new Worker(
            config.videoQueueName || 'video-downloads',
            this.processDownloadJob.bind(this),
            {
                connection: {
                    host: config.redisHost,
                    port: config.redisPort
                },
                concurrency: config.maxConcurrency || os.cpus().length,
                name: this.workerName // Set the worker name
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
            throw new Error(`[${this.workerName}] Worker is shutting down`);
        }

        const { url, metadata, filename, id } = job.data as DownloadImageJob;

        if (!url) {
            throw new Error(`[${this.workerName}] Invalid job: URL is required`);
        }

        const extension = await getVideoExtension(url);
        const downloadDir = this.config.downloadDir || path.join(process.cwd(), 'downloads');
        const fileNameWithExt = filename.endsWith(extension) ? filename : `${filename}${extension}`;
        const filePath = path.join(downloadDir, fileNameWithExt);

        try {
            console.log(`[${this.workerName}] Received job ${job.id} to download ${url}`);
            await downloadVideo(url, filePath);

            if (!job.id) {
                throw new Error(`[${this.workerName}] Job ID is missing`);
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

            console.error(`[${this.workerName}] Download failed for ${url}:`, error);
            throw error;
        }
    }

    private startHealthCheck() {
        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            console.log(`[${this.workerName}]`, {
                activeJobs: this.active,
                memoryUsage: {
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                    rss: Math.round(memoryUsage.rss / 1024 / 1024)
                }
            });
        }, 60000);
    }

    private setupWorkerEventHandlers() {
        this.worker.on('completed', (job) => {
            console.log(`[${this.workerName}] Job ${job.id} completed successfully`);
        });

        this.worker.on('failed', (job, error) => {
            console.error(`[${this.workerName}] Job ${job?.id ?? 'unknown'} failed:`, error);
        });

        this.worker.on('error', (error) => {
            console.error(`[${this.workerName}] Worker error:`, error);
        });

        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    async shutdown() {
        this.isShuttingDown = true;
        console.log(`[${this.workerName}] Gracefully shutting down...`);

        // Wait for active jobs to complete
        while (this.active > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await this.worker.close();
        console.log(`[${this.workerName}] Worker shut down successfully`);
    }
}

export default DownloadVideoWorker;