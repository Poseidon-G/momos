import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import CustomError from '../constants/errors';
import { LoginUserDto, RegisterUserDto } from '../dto/user.dto';

const login = (authService: AuthService) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const body : LoginUserDto = req.body;
        const user = await authService.login(body);

        res.status(200).json({
            message: 'Login successful',
            data: user
        });
    } catch (error) {
        next(error);
    }
}

const register = (authService: AuthService) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const body: RegisterUserDto = req.body;
        const user = await authService.register(body);

        res.status(201).json({
            message: 'User registered successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
}

export default {
    login,
    register
};
