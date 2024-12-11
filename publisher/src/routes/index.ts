import { Router } from 'express';
import fileRouter from './file.route';
import packageRouter from './package.route';
import authRouter from './auth.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/packages', packageRouter);
router.use('/files', fileRouter);

export default router;