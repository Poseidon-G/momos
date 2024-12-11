import { DataSource } from 'typeorm';
import { User } from '../entities/user';
import { Package } from '../entities/package';
import { Media } from '../entities/media';
import { Logger } from '../common/logger';
import Config from '../config';

const logger = new Logger('Database');

export const AppDataSource = new DataSource({
    type: 'postgres', // Database type (e.g., postgres, mysql, sqlite)
    host: Config.DB_HOST,
    port: Config.DB_PORT,
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_DATABASE,
    synchronize: true, // Automatically sync schema (use only in development)
    logging: true, // Enable logging for debugging
    entities: [User, Package, Media],
});

export const initializeDatabase = async (): Promise<DataSource> => {
    try {
        const connection = await AppDataSource.initialize();
        logger.info('Database connection established');
        return connection;
    } catch (error) {
        logger.error('Database connection failed', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};
