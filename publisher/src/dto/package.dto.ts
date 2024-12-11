import { IsString, IsNotEmpty, IsEnum, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { CreateMediaDto } from './media.dto';
import { Type } from 'class-transformer';


export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => CreateMediaDto)
  media!: CreateMediaDto[];
}

