import { Reflector } from '@nestjs/core';
import { AuditService } from '../../audit.service';
import { AuditInterceptor } from '../../interceptors';
import { of, throwError } from 'rxjs';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('Audit Interceptor', () => {
  let interceptor: AuditInterceptor;
  let auditService: AuditService;
  let reflector: Reflector;
  let context: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
            logErrors: false,
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    context = {
      switchToHttp: () => ({
        getRequest: jest.fn().mockReturnValue({}),
      }),
      getHandler: jest.fn().mockReturnValue({}),
      getClass: jest.fn().mockReturnValue({}),
    } as unknown as ExecutionContext;

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    auditService = module.get<AuditService>(AuditService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should not call audit.log but throw error for failed audit', async () => {
    const callHandler = {
      handle: () => throwError(() => new Error('Error')),
    } as CallHandler;
    const resultObservable = await interceptor.intercept(context, callHandler);

    resultObservable
      .subscribe(() => expect(callHandler.handle).toThrowError('Error'))
      .unsubscribe();

    expect(auditService.log).toHaveBeenCalledTimes(0);
  });

  it('should call audit.log and throw error for failed audit', async () => {
    const callHandler = {
      handle: () => throwError(() => new Error('Error')),
    } as CallHandler;
    auditService.logErrors = true;

    const resultObservable = await interceptor.intercept(context, callHandler);

    resultObservable
      .subscribe(() => expect(callHandler.handle).toThrowError('Error'))
      .unsubscribe();

    expect(auditService.log).toHaveBeenCalledTimes(1);
  });

  it('should call audit.log for successful audit', async () => {
    const callHandler = {
      handle: () => of('success'),
    } as CallHandler;
    const resultObservable = await interceptor.intercept(context, callHandler);

    resultObservable
      .subscribe(() => expect(callHandler.handle).not.toThrow())
      .unsubscribe();

    expect(auditService.log).toHaveBeenCalledTimes(1);
  });
});
