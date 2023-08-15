import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditConfig } from './interfaces';

@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {
  static forRoot(config: AuditConfig): DynamicModule {
    const provider = AuditModule.createProvider(config);
    return {
      module: AuditModule,
      providers: [provider],
      exports: [provider],
    };
  }

  private static createProvider(config: AuditConfig): Provider {
    return {
      provide: AuditService,
      useFactory: async (): Promise<AuditService> => {
        const auditService = new AuditService();
        config.transports.forEach((transport) => {
          auditService.addTransport(transport.name, transport?.options);
        });

        if (config.logErrors) auditService.logErrors = config.logErrors;
        if (config.getUserId) auditService.setUserIdCallback(config.getUserId);

        return auditService;
      },
    };
  }
}
