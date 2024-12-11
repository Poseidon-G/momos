import DownloadImageWorker from './download-worker';
import DownloadVideoWorker from './video-worker';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

async function main() {
    const config = {
        redisHost: process.env.REDIS_HOST || 'localhost',
        redisPort: parseInt(process.env.REDIS_PORT || '6379'),
        imageQueueName: process.env.IMAGE_QUEUE_NAME || 'image-downloads',
        videoQueueName: process.env.VIDEO_QUEUE_NAME || 'video-downloads',
        downloadDir: process.env.DOWNLOAD_DIR || path.join(process.cwd(), 'downloads'),
        maxConcurrency: parseInt(process.env.MAX_CONCURRENCY || String(require('os').cpus().length)),
    };

    try {
        console.log('Starting download worker with config:', config);
        
        const imageWorker = new DownloadImageWorker(config);
        const videoWorker = new DownloadVideoWorker(config);

        // Handle process signals
        const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'];
        signals.forEach(signal => {
            process.on(signal, async () => {
                console.log(`Received ${signal}, initiating graceful shutdown...`);
                await imageWorker.shutdown();
                await videoWorker.shutdown();
                process.exit(0);
            });
        });

        // Handle uncaught errors
        process.on('uncaughtException', async (error) => {
            console.error('Uncaught exception:', error);
            await imageWorker.shutdown();
            await videoWorker.shutdown();
            process.exit(1);
        });

        process.on('unhandledRejection', async (error) => {
            console.error('Unhandled rejection:', error);
            await imageWorker.shutdown();
            await videoWorker.shutdown();
            process.exit(1);
        });

        console.log('Worker started successfully');

    } catch (error) {
        console.error('Failed to start worker:', error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});