import {
  CallHandler,
  ExecutionContext,
  Inject,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';
import { AuditParams } from '../interfaces';

export class AuditInterceptor implements NestInterceptor {
  constructor(
    @Inject(AuditService) private audit: AuditService,
    @Inject(Reflector.name) private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const params = this.reflector.getAllAndOverride<AuditParams>('params', [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      catchError((err) => {
        throw err;
      }),
      tap(() => {
        this.audit.log();
      }),
    );
  }
}
