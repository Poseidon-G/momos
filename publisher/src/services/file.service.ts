// file.service.ts
import { createReadStream, existsSync, statSync } from 'fs';
import { extname } from 'path';
import { Logger } from '../common/logger';
import CustomError from '../constants/errors';
import { MediaRepository } from '../repositories/media.repository';

export class FileService {
    private readonly logger = new Logger('FileService');
    private mediaRepository = new MediaRepository();
    private readonly ALLOWED_EXTENSIONS = [
        '.jpg', '.jpeg', '.png', '.gif', // Images
        '.mp4', '.webm', '.mov' // Videos
    ];

    private readonly MIME_TYPES: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime'
    };

    async getFile(mediaId: number): Promise<{ contentType: string, contentLength: number, mineType: string, filePath: string }> {
        try {

            const media = await this.mediaRepository.findById(mediaId);

            if (!media) {
                throw CustomError.NotFound;
            }

            const filePath = media.filename;

            if (!filePath) {
                throw CustomError.NotFound;
            }

            if (!existsSync(filePath)) {
                throw CustomError.NotFound;
            }

            const extension = extname(filePath).toLowerCase();
            if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
                throw CustomError.BadRequest;
            }

            const stat = statSync(filePath);
            const contentType = this.MIME_TYPES[extension] || 'application/octet-stream';

            return {
                filePath,
                contentType,
                mineType: extension,
                contentLength: stat.size
            };
        } catch (error) {
            this.logger.error('Failed to get file', {
                mediaId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    async createReadStream(filePath: string) {
        try {
            return createReadStream(filePath);
        } catch (error) {
            this.logger.error('Failed to create read stream', {
                filePath,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    async checkFileExists(filePath: string): Promise<boolean> {
        try {
            return existsSync(filePath);
        } catch (error) {
            this.logger.error('Failed to check file existence', { 
                filePath,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }
}