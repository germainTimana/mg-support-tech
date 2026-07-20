import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export interface ErrorDetail {
  code: string;
  message: string;
  field?: string;
}

export class DomainException extends HttpException {
  public readonly errorCode: string;
  public readonly details?: ErrorDetail[];

  constructor(
    status: HttpStatus,
    errorCode: string,
    message: string,
    details?: ErrorDetail[],
  ) {
    super(
      {
        statusCode: status,
        error: errorCode,
        message,
        details,
      },
      status,
    );
    this.errorCode = errorCode;
    this.details = details;
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(message = 'Recurso no encontrado', details?: ErrorDetail[]) {
    super(HttpStatus.NOT_FOUND, 'NOT_FOUND', message, details);
  }
}

export class BadRequestDomainException extends DomainException {
  constructor(message = 'Solicitud inválida', details?: ErrorDetail[]) {
    super(HttpStatus.BAD_REQUEST, 'BAD_REQUEST', message, details);
  }
}

export class ForbiddenDomainException extends DomainException {
  constructor(message = 'No tiene permisos para realizar esta acción', details?: ErrorDetail[]) {
    super(HttpStatus.FORBIDDEN, 'FORBIDDEN', message, details);
  }
}

export class ConflictDomainException extends DomainException {
  constructor(message = 'Conflicto con el estado actual del recurso', details?: ErrorDetail[]) {
    super(HttpStatus.CONFLICT, 'CONFLICT', message, details);
  }
}
