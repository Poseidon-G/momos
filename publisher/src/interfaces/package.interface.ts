import { IUser } from './user.interface';
import { IMedia } from './media.interface';
import { PackageStatus } from '../shared/types';

export interface IPackage {
    id: number;
    user: IUser;  
    title: string;
    description: string;
    status: PackageStatus;
    createdAt: Date;
    updatedAt: Date;
    media: IMedia[];
  }
  
  