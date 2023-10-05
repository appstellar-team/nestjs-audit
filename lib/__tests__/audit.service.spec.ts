import { faker } from '@faker-js/faker';
import { AuditService } from '../audit.service';
import {
  Action,
  AuditLogger,
  AuditParams,
  Outcome,
  TransportMethods,
} from '../interfaces';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuditModule } from '../audit.module';

describe('Audit Service', () => {
  let auditService: AuditService;

  const mockAuditParams: AuditParams = {
    action: Action.READ,
    getUserId: () => faker.string.uuid(),
    getResponseObjectId: () => faker.string.uuid(),
    entity: faker.string.alpha(),
  };

  const mockAuditLogger: AuditLogger = {
    params: mockAuditParams,
    outcome: Outcome.SUCCESS,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AuditModule],
    }).compile();

    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should set logErrors to true', () => {
    auditService.logErrors = true;
    expect(auditService.logErrors).toBeTruthy();
  });

  it('should return value of action', () => {
    expect(auditService.getAction()).toBeUndefined();
  });

  it('should set a value to action', () => {
    auditService.setAction(Action.READ);
    expect(auditService.getAction()).toBeDefined();
    expect(auditService.getAction()).toBe(Action.READ);
  });

  it('should return user id callback', () => {
    expect(auditService.getUserIdCallback()).toBeUndefined();
  });

  it('should set user id callback', () => {
    auditService.setUserIdCallback(() => faker.string.uuid());
    expect(auditService.getUserIdCallback()).toBeDefined();
  });

  it('should return response object id callback', () => {
    expect(auditService.getResponseObjectIdCallback()).toBeUndefined();
  });

  it('should set response object id callback', () => {
    auditService.setResponseObjectIdCallback(() => faker.string.uuid());
    expect(auditService.getResponseObjectIdCallback()).toBeDefined();
  });

  it('should return name of entity changed', () => {
    expect(auditService.getEntityName()).toBeUndefined();
  });

  it('should set the name of entity', () => {
    const entityName = faker.string.alpha();
    auditService.setEntityName(entityName);
    expect(auditService.getEntityName()).toBeDefined();
    expect(auditService.getEntityName()).toBe(entityName);
  });

  it('should return list of transport methods', () => {
    expect(auditService.getTransports().length).toBe(0);
  });

  it('should add transport to list of transports successfully', async () => {
    auditService.addTransport(TransportMethods.CONSOLE);
    expect(auditService.getTransports().length).toBeGreaterThan(0);
  });

  it('should keep audit logs', async () => {
    const loggerMock = jest.spyOn(Logger, 'log');
    await auditService.log(mockAuditLogger, { method: 'GET' });

    expect(auditService.getAction()).toBe(Action.READ);
    expect(auditService.getTransports().length).toBeGreaterThan(0);
    expect(loggerMock).toHaveBeenCalledWith('Auditing complete!');
  });
});
