import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

router.post('/login', AuthController.login(authService));
router.post('/register', AuthController.register(authService));

export default router;