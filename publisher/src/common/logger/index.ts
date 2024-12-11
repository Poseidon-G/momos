// common/logger/index.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export class Logger {
  private logger: winston.Logger;

  constructor(context: string) {
    const consoleFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} ${level} [${context}] ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      })
    );

    const fileFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    );

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports: [
        // Console transport with colors
        new winston.transports.Console({
          format: consoleFormat
        }),
        // File transport using DailyRotateFile
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '10m',
          maxFiles: '7d',
          format: fileFormat
        })
      ]
    });
  }

  error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, { timestamp: new Date().toISOString(), ...meta });
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, { timestamp: new Date().toISOString(), ...meta });
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, { timestamp: new Date().toISOString(), ...meta });
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, { timestamp: new Date().toISOString(), ...meta });
  }
}