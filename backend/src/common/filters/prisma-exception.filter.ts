import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Traduce errores conocidos de Prisma a respuestas HTTP consistentes,
 * en vez de dejar escapar mensajes internos de la base de datos.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const target =
          (exception.meta?.target as string[] | undefined)?.join(', ') ??
          'campo único';
        const err = new ConflictException(
          `Ya existe un registro con el mismo valor en: ${target}`,
        );
        return response.status(err.getStatus()).json(err.getResponse());
      }
      case 'P2025': {
        const err = new NotFoundException('El registro solicitado no existe');
        return response.status(err.getStatus()).json(err.getResponse());
      }
      case 'P2003': {
        const err = new ConflictException(
          'La operación viola una relación con otro registro existente',
        );
        return response.status(err.getStatus()).json(err.getResponse());
      }
      default: {
        response.status(500).json({
          statusCode: 500,
          message: 'Error interno de base de datos',
        });
      }
    }
  }
}
