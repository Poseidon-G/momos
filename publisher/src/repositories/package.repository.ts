import { Package } from '../entities/package';
import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database/source';

export class PackageRepository extends BaseRepository<Package> {
    constructor() {
        super(AppDataSource, Package);
    }

    async findPackageWithUserInfo(packageId: number): Promise<Package | null> {
        return await this.repository.findOne({
            where: { id: packageId },
            relations: { user: true },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                user: {
                    id: true,
                    email: true
                }
            }
        });
    }

}
