import { Reflector } from '@nestjs/core';
import { AuditService } from '../../audit.service';
import { AuditInterceptor } from '../../interceptors';
import { of, throwError } from 'rxjs';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('Audit Interceptor', () => {
  let interceptor: AuditInterceptor;
  let auditService: AuditService;
  let reflector: Reflector;
  let context: ExecutionContext;

  const callHandlerFail = {
    handle: () => throwError(() => new Error('Error')),
  };
  const callHandlerSucceed = {
    handle: () => of('SuccessData'),
  };

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
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      switchToHttp: () => ({
        getRequest: jest.fn().mockReturnValue({}),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getHandler: jest.fn().mockReturnValue({}),
      getClass: jest.fn().mockReturnValue({}),
    };

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

  it('should throw error', async () => {
    const resultObservable = await interceptor.intercept(
      context,
      callHandlerFail,
    );

    resultObservable
      .subscribe({
        error() {
          expect(interceptor).toThrowError();
        },
      })
      .unsubscribe();

    expect(auditService.log).toHaveBeenCalledTimes(0);
  });

  it('should log failed audit', async () => {
    auditService.logErrors = true;

    const resultObservable = await interceptor.intercept(
      context,
      callHandlerFail,
    );

    resultObservable
      .subscribe({
        error() {
          expect(interceptor).toThrowError('Error');
        },
      })
      .unsubscribe();

    expect(auditService.log).toHaveBeenCalledTimes(1);
  });

  it('should log successful audit', async () => {
    const resultObservable = await interceptor.intercept(
      context,
      callHandlerSucceed,
    );

    // resultObservable
    //   .subscribe({
    //     next() {},
    //   })
    //   .unsubscribe();

    expect(auditService.log).toHaveBeenCalledTimes(1);
  });
});
