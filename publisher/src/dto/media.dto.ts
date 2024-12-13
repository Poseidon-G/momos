import { IsString, IsNotEmpty, IsEnum, ValidateNested, ArrayNotEmpty, IsOptional } from 'class-validator';
import { MediaStatus, MediaType } from '../shared/types';

export class CreateMediaDto {
    @IsString()
    @IsOptional()
    filename?: string;
    
    @IsString()
    @IsNotEmpty()
    url!: string;

    @IsEnum(MediaType)
    @IsOptional()
    mediaType?: MediaType;

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