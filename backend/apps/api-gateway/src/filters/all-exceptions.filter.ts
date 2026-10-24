import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || exception.message;
        error = resObj.error || error;
      } else {
        message = exception.message;
      }
    } else if (typeof exception === 'object' && exception !== null) {
      const errObj = exception as Record<string, any>;

      // Check if error came from microservice (RpcException or standard serialized error)
      if (errObj.status && typeof errObj.status === 'number') {
        status = errObj.status;
      } else if (errObj.statusCode && typeof errObj.statusCode === 'number') {
        status = errObj.statusCode;
      }

      if (errObj.message) {
        message = errObj.message;
      }
      if (errObj.error) {
        error = errObj.error;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Error: ${JSON.stringify(exception)}`,
        (exception as Error)?.stack,
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - ${status}: ${JSON.stringify(message)}`);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
