import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/file.service';
import CustomError from '../constants/errors';

const getFile = (fileService: FileService) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const fileId = parseInt(req.params.id, 10);

        const file = await fileService.getFile(fileId);
        if (!file) {
            throw CustomError.NotFound;
        }

        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${fileId}`);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        const fileStream = fileService.createReadStream(file.filePath);

        (await fileStream).pipe(res);
    } catch (error) {
        next(error);
    }
}


export default {
    getFile
};