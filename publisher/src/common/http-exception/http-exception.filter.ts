import { NextFunction, Request, Response } from "express";
import { CustomErrorInterface } from "../../interfaces/custom-error.interface";
import CustomError from "../../constants/errors";
import Logger from "../../logger";
import { randomUUID } from "crypto";

interface BaseResponse {
  statusCode: number;
  requestId: string;
  timestamp: string;
}

interface SuccessResponse<T> extends BaseResponse {
  data: T;
}

interface ErrorResponse extends BaseResponse {
  errorCode: string;
  message: string;
  details?: any;
  stack?: string;
}

export class HttpFilter {
  private readonly logger: typeof Logger;
  private readonly ENV = process.env.NODE_ENV || 'development';

  constructor() {
    this.logger = Logger;
  }

  public responseMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id']?.toString() || randomUUID();
    const self = this;

    const originalJson = res.json;
    res.json = function(body: any) {
      const baseResponse = {
        statusCode: res.statusCode,
        requestId,
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.url
      };

      const response = res.statusCode >= 400 
        ? self.formatErrorResponse(body, baseResponse)
        : self.formatSuccessResponse(body, baseResponse);

      return originalJson.call(this, response);
    };

    next();
  }

  private formatSuccessResponse<T>(data: T, baseResponse: Partial<BaseResponse>): SuccessResponse<T> {
    return {
      ...baseResponse,
      data
    } as SuccessResponse<T>;
  }

  private formatErrorResponse(error: CustomErrorInterface, baseResponse: Partial<BaseResponse>): ErrorResponse {
    return {
      ...baseResponse,
      errorCode: error.errorCode,
      message: error.message,
      details: error.details,
      stack: this.ENV === 'development' ? error.stack : undefined
    } as ErrorResponse;
  }

  public handleError(error: Error | CustomErrorInterface, req: Request, res: Response): void {
    const requestId = req.headers['x-request-id']?.toString() || randomUUID();
    const language = this.getPreferredLanguage(req);

    try {
      const errorResponse = this.processError(error, language);
      this.logError(error, req, requestId, errorResponse.statusCode);
      
      res.status(errorResponse.statusCode).json(errorResponse);
    } catch (unexpectedError) {
      this.logger.error('Error in error handler', {
        requestId,
        error: unexpectedError,
        originalError: error
      });
      
      const fallbackError = CustomError.InternalSystemError;
      res.status(fallbackError.statusCode).json(fallbackError);
    }
  }

  private processError(error: Error | CustomErrorInterface, language: string): CustomErrorInterface {
    return this.isCustomError(error)
      ? error
      : CustomError.InternalSystemError;
  }

  private logError(error: Error | CustomErrorInterface, req: Request, requestId: string, statusCode: number): void {
    const logContext = {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    statusCode >= 500
      ? this.logger.error('Internal Server Error', { ...logContext, error, stack: error instanceof Error ? error.stack : undefined })
      : this.logger.warn('Client Error', { ...logContext, error });
  }

  private getPreferredLanguage(req: Request): string {
    return req.headers['accept-language']?.toString().split(',')[0] || 'en';
  }

  private isCustomError(error: unknown): error is CustomErrorInterface {
    return Boolean(
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      'errorCode' in error
    );
  }
}