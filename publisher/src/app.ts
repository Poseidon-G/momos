// app.ts
import express, { Request, Response, NextFunction } from 'express';
import { IDownloadPublisher, DownloadPublisher } from './pub-sub/publisher/job-publisher';
import { ResultDownloadWorker } from './pub-sub/consumer/result-download-worker';
import { HttpFilter } from './common/http-exception/http-exception.filter';
import { initializeDatabase } from './database/source';
import router from './routes';
import { Logger } from './common/logger';
import cors from 'cors';

class PublisherApp {
  private app: express.Application;
  private publisher!: IDownloadPublisher;
  private resultWorker!: ResultDownloadWorker;
  private httpFilter = new HttpFilter();
  private logger = new Logger('PublisherApp');

  constructor(
    private config: {
      redisHost: string;
      redisPort: number;
      port?: number;
      workerName?: string;
    }
  ) {
    this.app = express();
    this.setupMiddleware();
    this.setupDatabase();
    this.setupPublisher();
    this.setupWorker();
    this.setupRoutes();
    this.setupErrorHandler();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(this.httpFilter.responseMiddleware.bind(this.httpFilter));
  }

  private async setupDatabase(): Promise<void> {
    try {
      await initializeDatabase();
      this.logger.info('Database initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database', { error });
      process.exit(1);
    }
  }

  private setupPublisher(): void {
    this.publisher = new DownloadPublisher({
      host: this.config.redisHost,
      port: this.config.redisPort
    });
  }

  private setupWorker(): void {
    this.resultWorker = new ResultDownloadWorker({
      redisHost: this.config.redisHost,
      redisPort: this.config.redisPort,
      workerName: this.config.workerName || 'default-result-worker',
      maxConcurrency: 5
    });
  }

  private setupRoutes(): void {
    this.app.use('/api/v1', router);
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });
  }

  private setupErrorHandler(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      this.httpFilter.handleError(err, req, res);
    });
  }

  public async start(): Promise<void> {
    const port = this.config.port || 3000;
    this.app.listen(port, () => {
      this.logger.info(`Server started on port ${port}`);
    });

    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  private async shutdown(): Promise<void> {
    this.logger.info('Shutting down application...');
    await this.resultWorker.shutdown();
    process.exit(0);
  }
}

export default PublisherApp;