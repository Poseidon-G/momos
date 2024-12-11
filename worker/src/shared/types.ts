export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum  PackageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
  
export enum MediaStatus {
  PENDING = 'pending',
  DOWNLOADED = 'downloaded',
  FAILED = 'failed',
}


export interface DownloadJobResult {
  mediaId: number;
  filePath?: string;
  errorMsg?: string;
}


export interface DownloadImageJob {
    id: number;
    url: string;
    filename: string;
    metadata?: {
      source?: string;
      timestamp?: string;
      priority?: number;
    };
    status?: 'pending' | 'downloading' | 'completed' | 'failed';
  }
  
export interface DownloadVideoJob {
    id: number;
    url: string;
    filename: string;
    metadata?: {
      source?: string;
      timestamp?: string;
      priority?: number;
    };
    status?: 'pending' | 'downloading' | 'completed' | 'failed';
  }

  export interface JobResult {
    jobId: string;
    fileName: string;
    filePath: string;
    downloadedAt: string;
    metadata?: Record<string, any>;
  }
  
  export interface QueueMetrics {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }