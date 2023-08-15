import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '../interceptors';
import { AuditParams } from '../interfaces';

export function Audit(params?: AuditParams) {
  return applyDecorators(
    SetMetadata('params', params),
    UseInterceptors(AuditInterceptor),
  );
}
