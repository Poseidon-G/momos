import { Router } from 'express';
import FileController from '../controllers/file.controller';
import { FileService } from '../services/file.service';

const router = Router();
const fileService = new FileService();

router.get('/:id',
    FileController.getFile(fileService)
);


export default router;