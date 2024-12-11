import { IUser } from '../../interfaces/user.interface';

declare global {
    namespace Express {
      interface Request {
        user?: IUser;
      }
    }
  }
export {}; // This is needed to prevent TS from merging this file with other files