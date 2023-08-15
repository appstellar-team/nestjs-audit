import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';
import { AuditParams, Outcome } from '../interfaces';

@Injectable()
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
        if (this.audit.logErrors)
          this.audit.log({ params, outcome: Outcome.FAILURE, err }, req);
        throw err;
      }),
      tap(() => {
        this.audit.log({ params, outcome: Outcome.SUCCESS }, req);
      }),
    );
  }
}
