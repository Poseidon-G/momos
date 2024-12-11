import PublisherApp from './app';
import Config from './config';

async function main() {
    const config = {
        redisHost: Config.REDIS_HOST,
        redisPort: Config.REDIS_PORT,
        port: Config.APP_PORT,
    };

    try {
        console.log('Starting publisher service with config:', config);
        
        const app = new PublisherApp(config);

        // Handle process signals for graceful shutdown
        const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'];
        signals.forEach(signal => {
            process.on(signal, async () => {
                console.log(`Received ${signal}, initiating graceful shutdown...`);
                await app['publisher'].shutdown();
                process.exit(0);
            });
        });

        // Handle uncaught errors
        process.on('uncaughtException', async (error) => {
            console.error('Uncaught exception:', error);
            await app['publisher'].shutdown();
            process.exit(1);
        });

        process.on('unhandledRejection', async (error) => {
            console.error('Unhandled rejection:', error);
            await app['publisher'].shutdown();
            process.exit(1);
        });

        // Start the app
        app.start();
        console.log('Publisher service started successfully');

    } catch (error) {
        console.error('Failed to start publisher service:', error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});