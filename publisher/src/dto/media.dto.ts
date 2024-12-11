import { IsString, IsNotEmpty, IsEnum, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { MediaStatus, MediaType } from '../shared/types';

export class CreateMediaDto {
    @IsString()
    filename?: string;
    
    @IsString()
    @IsNotEmpty()
    url!: string;

    @IsEnum(MediaType)
    mediaType!: MediaType;

}

export class UpdateMediaDto {
    @IsString()
    filename?: string;

    @IsString()
    newUrl?: string;

    @IsEnum(MediaStatus)
    status!: MediaStatus;

    @IsString()
    errorMessage?: string;
}