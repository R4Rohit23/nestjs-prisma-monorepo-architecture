import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly code?: string,
  ) {
    super(
      {
        message,
        code,
        statusCode: status,
      },
      status,
    );
  }
}

export class ValidationException extends CustomException {
  constructor(message: string, code?: string) {
    super(message, HttpStatus.BAD_REQUEST, code);
  }
}

export class NotFoundException extends CustomException {
  constructor(message: string, code?: string) {
    super(message, HttpStatus.NOT_FOUND, code);
  }
}

export class UnauthorizedException extends CustomException {
  constructor(message: string, code?: string) {
    super(message, HttpStatus.UNAUTHORIZED, code);
  }
}

export class ForbiddenException extends CustomException {
  constructor(message: string, code?: string) {
    super(message, HttpStatus.FORBIDDEN, code);
  }
}

export class ConflictException extends CustomException {
  constructor(message: string, code?: string) {
    super(message, HttpStatus.CONFLICT, code);
  }
}
