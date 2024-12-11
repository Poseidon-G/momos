import { Media } from '../entities/media';
import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database/source';

export class MediaRepository extends BaseRepository<Media> {
    constructor() {
        super(AppDataSource, Media);
    }

    async findMediaWithPackageInfo(mediaId: number): Promise<Media | null> {
        return await this.repository.findOne({
            where: { id: mediaId },
            relations: { package: true },
            select: {
                id: true,
                status: true,
                package: {
                    id: true
                }
            }
        });
    }

    async findListMediaWithPackageId(packageId: number, { skip, limit }: { skip: number; limit: number }): Promise<Media[]> {
        return await this.repository.find({
            where: { package: { id: packageId } },
            order: { id: 'ASC' },
            skip,
            take: limit
        });
    }
    
}
