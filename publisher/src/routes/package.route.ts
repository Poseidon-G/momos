import { Router } from 'express';
import PackageController from '../controllers/package.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { CreatePackageDto } from '../dto/package.dto';
import { PackageService } from '../services/package.service';

const router = Router();
const packageService = new PackageService();

router.post('/',
    AuthMiddleware.verify,
    ValidateMiddleware.validate(CreatePackageDto),
    PackageController.createPackage(packageService)
);

router.get('/:id',
    AuthMiddleware.verify,
    PackageController.getPackageDetail(packageService)
);

router.get('/',
    AuthMiddleware.verify,
    PackageController.getPackageList(packageService)
);


router.get('/:id/medias', 
    AuthMiddleware.verify,
    PackageController.getPackageMedias(packageService)
);

export default router;