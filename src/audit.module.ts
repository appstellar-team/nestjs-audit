import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AuditService } from './audit.service';

@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {
  static forRoot(): DynamicModule {
    const provider = AuditModule.createProvider();
    return {
      module: AuditModule,
      providers: [provider],
      exports: [provider],
    };
  }

  private static createProvider(): Provider {
    return {
      provide: AuditService,
      useFactory: async (): Promise<AuditService> => {
        const auditService = new AuditService();
        return auditService;
      },
    };
  }
}
