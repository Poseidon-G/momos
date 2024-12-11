import { Request, Response, NextFunction } from 'express';
import { PackageService } from '../services/package.service';
import { CreatePackageDto } from '../dto/package.dto';
import { IPackage } from '../interfaces/package.interface';
import CustomError from '../constants/errors';

const createPackage = (packageService: PackageService) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const packageData: CreatePackageDto = req.body;
        const user = req.user;
        if (!user) {
            throw CustomError.UnAuthorizedRequest;
        }

        const pkg: IPackage = await packageService.createPackageFromUser(packageData, user);
        res.status(201).json({
            message: 'Package created successfully',
            data: pkg
        })

    } catch (error) {
        next(error);
    }
}

const getPackageDetail = (packageService: PackageService) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const packageId = parseInt(req.params.id, 10);
        const user = req.user;
        if (!user) {
            throw CustomError.UnAuthorizedRequest;
        }

        const pkg = await packageService.getPackageDetailForUser(packageId, user);

        res.status(200).json({
            message: 'Package details fetched successfully',
            data: pkg
        })
    } catch (error) {
        next(error);
    }
}

const getPackageList = (packageService: PackageService) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        const page = parseInt(req.query.page as string, 10) || 1;
        const size = parseInt(req.query.size as string, 10) || 10;
        if (!user) {
            throw CustomError.UnAuthorizedRequest;
        }

        const pkgList = await packageService.getListOfPackagesForUser(user, page, size);

        res.status(200).json({
            message: 'Package list fetched successfully',
            data: pkgList
        })
    }
    catch (error) {
        next(error);
    }

}

const getPackageMedias = (packageService: PackageService) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const packageId = parseInt(req.params.id, 10);
        const user = req.user;
        if (!user) {
            throw CustomError.UnAuthorizedRequest;
        }
        const page = parseInt(req.query.page as string, 10) || 1;
        const size = parseInt(req.query.size as string, 10) || 10;

        const paginateMedias = await packageService.getPackageMediasForUser(packageId, user, page, size);

        res.status(200).json({
            message: 'Package medias fetched successfully',
            data: paginateMedias
        })
    } catch (error) {
        next(error);
    }
}

export default {
    createPackage,
    getPackageDetail,
    getPackageList,
    getPackageMedias
};