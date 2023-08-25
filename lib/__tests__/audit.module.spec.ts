import { Test } from '@nestjs/testing';
import { AuditModule } from '../audit.module';
import { AuditService } from '../audit.service';
import { TransportMethods } from '../interfaces';

describe('Audit Module', () => {
  it('should import audit module succesfully', async () => {
    const module = await Test.createTestingModule({
      imports: [AuditModule],
    }).compile();

    const auditService = module.get<AuditService>(AuditService);

    expect(auditService).toBeTruthy();
    expect(auditService.logErrors).toBeFalsy();
  });

  it('should import audit module with forRoot configs succesfully', async () => {
    const module = await Test.createTestingModule({
      imports: [
        AuditModule.forRoot({
          transports: [{ name: TransportMethods.CONSOLE }],
          getUserId: () => 'user-id',
          logErrors: true,
        }),
      ],
    }).compile();

    const auditService = module.get<AuditService>(AuditService);

    expect(auditService).toBeTruthy();
    expect(auditService.logErrors).toBeTruthy();
  });
});
