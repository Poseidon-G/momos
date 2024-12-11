import { IsString, IsNotEmpty, IsEnum, ValidateNested, ArrayNotEmpty, Min, MinLength } from 'class-validator';

export class LoginUserDto {

    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: string;
}


export class RegisterUserDto {
   
    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: string;
}