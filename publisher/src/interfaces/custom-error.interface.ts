export interface CustomErrorInterface {
    statusCode: number;
    errorCode: string;
    message: string;
    locale?: {
      [key: string]: string;
    };
    details?: any;
    stack?: string;
  }
  