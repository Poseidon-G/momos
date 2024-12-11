import dotenv from 'dotenv';
dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10');
const DB_HOST = process.env.DB_HOST || 'postgres';
const DB_PORT = parseInt(process.env.DB_PORT || '5435');
const DB_USERNAME = process.env.DB_USERNAME || 'redis';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_DATABASE = process.env.DB_DATABASE || 'imgcrawler';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6399');

const FILE_SERVER_URI = process.env.FILE_SERVER_URI || 'http://localhost:8001';

const APP_PORT = parseInt(process.env.APP_PORT || '8000');
export default {
    SALT_ROUNDS,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE,
    REDIS_HOST,
    REDIS_PORT,
    APP_PORT,
    FILE_SERVER_URI
}