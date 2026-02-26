import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Determine status code and message
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal server error";
        let errorDetails: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === "string") {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === "object") {
                message =
                    (exceptionResponse as any).message || exception.message;
                errorDetails = exceptionResponse;
            } else {
                message = exception.message;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            errorDetails = {
                name: exception.name,
                stack:
                    process.env.NODE_ENV === "development"
                        ? exception.stack
                        : undefined,
            };
        }

        // Log the error
        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${message}`,
            exception instanceof Error ? exception.stack : "Unknown error"
        );

        // Prepare error response
        const errorResponse = {
            success: false,
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            ...(errorDetails && { details: errorDetails }),
        };

        // Send response
        response.status(status).json(errorResponse);
    }
}

