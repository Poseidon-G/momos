import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Logger } from '../common/logger';
import CustomError from '../constants/errors';

export class ValidateMiddleware {
  private static logger = new Logger('ValidateMiddleware');

  static validate<T extends object>(dto: new () => T) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dtoInstance = plainToClass(dto, req.body);
        
        const errors: ValidationError[] = await validate(dtoInstance, {
          whitelist: true,
          forbidNonWhitelisted: true
        });

        if (errors.length > 0) {
          const validationErrors = this.formatErrorsRecursive(errors);
          
          this.logger.warn('Validation failed', { 
            path: req.path, 
            errors: validationErrors 
          });

          throw {
            ...CustomError.ValidationFailed,
            details: validationErrors
          };
        }

        req.body = dtoInstance;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private static formatErrorsRecursive(errors: ValidationError[]): Record<string, any> {
    return errors.reduce((acc, error) => {
      // Handle constraints (direct validation errors)
      if (error.constraints) {
        acc[error.property] = Object.values(error.constraints);
      }

      // Handle nested errors
      if (error.children && error.children.length > 0) {
        // For array properties
        if (Array.isArray(error.value)) {
          acc[error.property] = error.children.map((child, index) => ({
            index,
            errors: this.formatErrorsRecursive([child])
          }));
        } else {
          // For nested objects
          acc[error.property] = this.formatErrorsRecursive(error.children);
        }
      }

      return acc;
    }, {} as Record<string, any>);
  }
}