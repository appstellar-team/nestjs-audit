import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '../interceptors';
import { AuditParams } from '../interfaces';

/**
 * Decorator that intercepts a request for storing audit data.
 *
 * @param params audit parameters
 *
 */
export function Audit(params?: AuditParams) {
  return applyDecorators(
    SetMetadata('params', params),
    UseInterceptors(AuditInterceptor),
  );
}
