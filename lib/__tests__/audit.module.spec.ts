import { Test } from '@nestjs/testing';
import { AuditModule } from '../audit.module';
import { AuditService } from '../audit.service';
import { TransportMethods } from '../interfaces';
import { faker } from '@faker-js/faker';

describe('Audit Module', () => {
  afterAll(() => {
    jest.resetModules();
  });

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
          getUserId: () => faker.string.uuid(),
          logErrors: true,
        }),
      ],
    }).compile();

    const auditService = module.get<AuditService>(AuditService);

    expect(auditService).toBeTruthy();
    expect(auditService.logErrors).toBeTruthy();
  });
});
