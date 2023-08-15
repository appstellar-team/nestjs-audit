import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditService {
  log(): void {
    console.log('Auditing...');
  }
}
