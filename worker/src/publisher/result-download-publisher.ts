// result-publisher.ts
import { Queue } from 'bullmq';
import { DownloadJobResult } from '../shared/types';

export class ResultPublisher {
  private queue: Queue;

  constructor(
    private config: {
      redisHost: string;
      redisPort: number;
      queueName?: string;
    }
  ) {
    this.queue = new Queue(config.queueName || 'download-results', {
      connection: {
        host: config.redisHost,
        port: config.redisPort
      }
    });
    
  }

  async publishDownloadResult(result: DownloadJobResult): Promise<void> {
    try {
      const { mediaId, filePath, errorMsg } = result;
      
      await this.queue.add(
        'update-media',
        {
          mediaId,
          filePath,
          errorMsg
        },
        {
          removeOnComplete: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          }
        }
      );

     console.log(`Published download result for media ${mediaId}`);
    } catch (error) {
      console.log(`Failed to publish download result for media ${result.mediaId}`);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}