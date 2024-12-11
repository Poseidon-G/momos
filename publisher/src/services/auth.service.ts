import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../interfaces/user.interface";
import CustomError from "../constants/errors";
import { hashPassword, comparePassword } from "../utils/auth.util";
import { LoginUserDto, RegisterUserDto } from "../dto/user.dto";
import * as bcrypt from 'bcrypt';

export class AuthService {
    private userRepository = new UserRepository();

    async login(body: LoginUserDto): Promise<IUser> {
        const { email, password } = body;

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw CustomError.UserNotFound;
        }

        const passwordMatch = await comparePassword(password, user.password);
        if (!passwordMatch) {
            throw CustomError.UserPasswordNotMatch;
        }


        return user;
    }

    async register(body: RegisterUserDto): Promise<IUser> {
        const { email, password } = body;
        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw CustomError.UserAlreadyExistsWithThisEmail;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await this.userRepository.create({
            email,
            password: hashedPassword
        });

        return newUser;
    }
}