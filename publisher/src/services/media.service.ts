import { MediaRepository } from "../repositories/media.repository";
import { PackageRepository } from "../repositories/package.repository";
import { IMedia } from "../interfaces/media.interface";
import { UpdateMediaDto } from "../dto/media.dto";
import { MediaStatus, PackageStatus } from "../shared/types";
import { Logger } from "../common/logger";

class MediaService {
    private mediaRepository = new MediaRepository();
    private logger = new Logger('MediaService');

    async updateMediaByWorker(mediaId: number, rawData: UpdateMediaDto): Promise<IMedia | null> {
        try {
            const media = await this.mediaRepository.findById(mediaId);
            if (!media) {
                throw new Error(`Media with id ${mediaId} not found`);
            }

            // Update media
            const updatedMedia = await this.mediaRepository.update(mediaId, {
                ...media,
                ...rawData,
                updatedAt: new Date()
            });

            this.logger.info(`Media ${mediaId} updated by worker`, { mediaId, rawData });

            return updatedMedia;

        } catch (error) {
            this.logger.error(`Failed to update media ${mediaId}`, {
                mediaId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
}

export { MediaService };