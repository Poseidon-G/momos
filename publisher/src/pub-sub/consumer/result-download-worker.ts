import { Worker, Job } from 'bullmq';
import { MediaService } from '../../services/media.service';
import { Logger } from '../../common/logger';
import { MediaStatus } from '../../shared/types';
import { DownloadJobResult } from '../../shared/types';
import { PackageService } from '../../services/package.service';
import Config from '../../config';

export class ResultDownloadWorker {
  private worker: Worker;
  private mediaService: MediaService;
  private packageService: PackageService;
  private logger: Logger;
  private workerName: string;

  constructor(
    private config: {
      redisHost: string;
      redisPort: number;
      queueName?: string;
      maxConcurrency?: number;
      workerName?: string;
    }
  ) {
    this.workerName = config.workerName || 'result-download-worker';
    this.mediaService = new MediaService();
    this.packageService = new PackageService();
    this.logger = new Logger(`ResultDownloadWorker:${this.workerName}`);

    this.worker = new Worker(
      config.queueName || 'download-results',
      this.processResult.bind(this),
      {
        connection: {
          host: config.redisHost,
          port: config.redisPort
        },
        concurrency: config.maxConcurrency || 10,
        name: this.workerName
      }
    );

    this.setupWorkerEventHandlers();
  }

  private async processResult(job: Job<DownloadJobResult>): Promise<void> {
    const { mediaId, filePath, errorMsg } = job.data;

    try {
      if (errorMsg) {
        this.logger.error(`[${this.workerName}] Download failed for media ${mediaId}`, { errorMsg });
        await this.mediaService.updateMediaByWorker(mediaId, {
          status: MediaStatus.FAILED,
          errorMessage: errorMsg
        });
        return;
      }

      await this.mediaService.updateMediaByWorker(mediaId, {
        status: MediaStatus.DOWNLOADED,
        newUrl: `${Config.FILE_SERVER_URI}/files/${mediaId}`,
        filename: filePath
      });
      
      await this.packageService.checkMarkedMediaAndPackageCompletion(mediaId);

      this.logger.info(`[${this.workerName}] Download completed for media ${mediaId}`, { filePath });
    } catch (error) {
      console.log("Error in processResult", error);
      this.logger.error(`[${this.workerName}] Failed to process result for media ${mediaId}`, { error });
      throw error;
    }
  }

  private setupWorkerEventHandlers(): void {
    this.worker.on('completed', (job) => {
      this.logger.info(`[${this.workerName}] Result processing completed for job ${job.id}`);
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(`[${this.workerName}] Result processing failed for job ${job?.id}`, { error });
    });

    this.worker.on('error', (error) => {
      this.logger.error(`[${this.workerName}] Worker error occurred`, { error });
    });

    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  public async shutdown(): Promise<void> {
    await this.worker.close();
    this.logger.info(`[${this.workerName}] Worker shutdown completed`);
  }
}