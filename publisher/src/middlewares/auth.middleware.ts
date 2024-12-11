import { Request, Response, NextFunction } from 'express';
import CustomError from '../constants/errors';
import { Logger } from '../common/logger';
import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/auth.util';

export class AuthMiddleware {
    private static userRepository = new UserRepository();
    private static logger = new Logger('AuthMiddleware');

    static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                throw CustomError.UnAuthorizedRequest;
            }

            const [type, credentials] = authHeader.split(' ');

            if (type !== 'Basic' || !credentials) {
                throw CustomError.UnAuthorizedRequest;
            }

            const decodedCredentials = Buffer.from(credentials, 'base64').toString();
            const [email, password] = decodedCredentials.split(':');

            console.log("email", email);
            console.log("password", password);
            if (!email || !password) {
                throw CustomError.UnAuthorizedRequest;
            }

            const user = await AuthMiddleware.userRepository.findByEmail(email);
            
            if (!user) {
                throw CustomError.UnAuthorizedRequest;
            }

            const passwordMatch = await comparePassword(password, user.password);
            if (!passwordMatch) {
                throw CustomError.UnAuthorizedRequest;
            }

            req.user = user;
            next();
        } catch (error) {
            console.log("Error", error);
            AuthMiddleware.logger.error('Failed to authenticate user', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            next(error);
        }
    }
}