import { PackageRepository } from "../repositories/package.repository";
import { MediaRepository } from "../repositories/media.repository";
import { IPackage } from "../interfaces/package.interface";
import { IMedia } from "../interfaces/media.interface";
import { CreatePackageDto } from "../dto/package.dto";
import { PackageStatus, MediaStatus, MediaType } from "../shared/types";
import { DownloadPublisher } from "../pub-sub/publisher/job-publisher";
import { generateUniqueFileName } from "../utils/media.util";
import { determineMediaType } from "../utils/media.util";
import { IUser } from "../interfaces/user.interface";
import CustomError from "../constants/errors";
import Redis from "ioredis";
import { PaginatedResponse, PaginationUtils } from "../utils";
import Config from "../config";

export class PackageService {
    private packageRepository = new PackageRepository();
    private mediaRepository = new MediaRepository();
    private downloadPublisher: DownloadPublisher;
    private redis: Redis;

    constructor() {
        this.downloadPublisher = new DownloadPublisher({
            host: Config.REDIS_HOST,
            port: Config.REDIS_PORT
        }); // Adjust the Redis connection details as needed
        this.redis = new Redis({
            host: Config.REDIS_HOST,
            port: Config.REDIS_PORT
        }); // Adjust the Redis connection details as needed
    }

    async createPackageFromUser(rawData: CreatePackageDto, user: IUser): Promise<IPackage> {
        let newPackage: IPackage = {} as IPackage;
        try {
            // Create package and media entries first
            newPackage = await this.packageRepository.create({
                title: rawData.title,
                description: rawData.description,
                user: user,
                status: PackageStatus.PENDING,
            });

            // Create all media entries in parallel
            const mediaList = await Promise.all(
                rawData.media.map(media => {
                    const mediaType = media.mediaType || determineMediaType(media.url);
                    if (!mediaType) {
                        throw CustomError.ValidationFailed
                    }
                    return this.mediaRepository.create({
                        originalUrl: media.url,
                        mediaType: mediaType,
                        status: MediaStatus.PENDING,
                        package: newPackage,
                    })
                }
                )
            );

            try {
                // Separate media by type
                const imageJobs = mediaList
                    .filter(media => media.mediaType === MediaType.IMAGE)
                    .map(media => ({
                        id: media.id,
                        url: media.originalUrl,
                        filename: generateUniqueFileName(media.originalUrl, MediaType.IMAGE)
                    }));

                const videoJobs = mediaList
                    .filter(media => media.mediaType === MediaType.VIDEO)
                    .map(media => ({
                        id: media.id,
                        url: media.originalUrl,
                        filename: generateUniqueFileName(media.originalUrl, MediaType.VIDEO),
                    }));

                // Publish jobs in parallel
                await Promise.all([
                    imageJobs.length > 0 && this.downloadPublisher.publishBatchImageDownloadJobs(imageJobs),
                    videoJobs.length > 0 && this.downloadPublisher.publishBatchVideoDownloadJobs(videoJobs)
                ].filter(Boolean));

                //Set total media pending count
                await this.redis.multi()
                    .set(`package:${newPackage.id}:media:pending`, mediaList.length)
                    .exec();

                return newPackage;
            } catch (error) {
                // Update package and media status to failed if job publishing fails
                await this.packageRepository.update(newPackage.id, { status: PackageStatus.FAILED });
                await Promise.all(
                    mediaList.map(media =>
                        this.mediaRepository.update(media.id, { status: MediaStatus.FAILED })
                    )
                );
                throw error;
            }
        } catch (error) {
            await this.packageRepository.update(newPackage.id, { status: PackageStatus.FAILED });
            throw error;
        }
    }

    async getPackageDetailForUser(packageId: number, user: IUser): Promise<IPackage> {
        const [packageInfo, mediaList] = await Promise.all([
            this.packageRepository.findPackageWithUserInfo(packageId),
            this.mediaRepository.findListMediaWithPackageId(packageId, { skip: 0, limit: 10 })
        ]);

        if (!packageInfo) {
            throw CustomError.NotFound
        }

        if (packageInfo.user.id !== user.id) {
            throw CustomError.ForbiddenRequest
        }

        return {
            ...packageInfo,
            media: mediaList
        }

    }

    async getListOfPackagesForUser(
        user: IUser,
        page: number = 1,
        size: number = 10
    ): Promise<PaginatedResponse<IPackage>> {
        const limit = size;
        const skip = (page - 1) * limit;

        const [packages, total] = await this.packageRepository.findWithOptions({
            filters: [{ field: 'user.id', value: user.id, operator: 'eq' }],
            sort: [{ field: 'createdAt', order: 'DESC' }],
            skip,
            limit
        })

        return PaginationUtils.createPaginatedResponse(
            packages,
            total,
            { page, limit, skip }
        );
    }

    async getPackageMediasForUser(
        packageId: number,
        user: IUser,
        page: number = 1,
        size: number = 10
    ): Promise<PaginatedResponse<IMedia>> {
        const limit = size;
        const skip = (page - 1) * limit;

        // Check if package belongs to user
        const packageInfo = await this.packageRepository.findPackageWithUserInfo(packageId);

        if (!packageInfo) {
            throw CustomError.NotFound
        }

        if (packageInfo.user.id !== user.id) {
            throw CustomError.ForbiddenRequest
        }

        const [mediaList, total] = await this.mediaRepository.findWithOptions({
            filters: [{ field: 'package.id', value: packageId, operator: 'eq' }],
            sort: [{ field: 'id', order: 'ASC' }],
            skip,
            limit
        });

        return PaginationUtils.createPaginatedResponse(
            mediaList,
            total,
            { page, limit, skip }
        );
    }


    private async markMediaJobOfPackageExecuted(packageId: number): Promise<void> {
        // Decrement pending media count
        await this.redis.decr(`package:${packageId}:media:pending`);
    }


    private async checkPackageCompletion(packageId: number): Promise<void> {
        const pendingMediaCount = await this.redis.get(`package:${packageId}:media:pending`);
        if (pendingMediaCount === '0') {
            await this.packageRepository.update(packageId, { status: PackageStatus.COMPLETED });
        }
    }

    async checkMarkedMediaAndPackageCompletion(mediaId: number): Promise<void> {
        const mediaInfo = await this.mediaRepository.findMediaWithPackageInfo(mediaId);

        if (!mediaInfo) {
            throw new Error(`Media with id ${mediaId} not found`);
        }
        const packageId = mediaInfo.package.id;

        await this.markMediaJobOfPackageExecuted(packageId);
        await this.checkPackageCompletion(packageId);
    }

}