import { faker } from '@faker-js/faker';
import { Action, AuditData, Outcome } from '../../interfaces';
import { ConsoleTransport } from '../../transports';
import { Logger } from '@nestjs/common';

describe('Console Transport', () => {
  const mockedAuditData: AuditData = {
    userId: faker.string.uuid(),
    action: Action.READ,
    objectId: faker.string.uuid(),
    entity: faker.string.alpha(),
    outcome: Outcome.SUCCESS,
    date: new Date(),
  };

  const loggerMock = jest.spyOn(Logger, 'log');

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should emit data without specifying logger', () => {
    const consoleTransport = new ConsoleTransport();
    consoleTransport.emit(mockedAuditData);

    expect(loggerMock).toHaveBeenCalledWith(JSON.stringify(mockedAuditData));
  });

  it('should emit data with specifying Logger', () => {
    const consoleTransport = new ConsoleTransport({
      logger: new Logger(),
    });
    consoleTransport.emit(mockedAuditData);

    expect(loggerMock).toHaveBeenCalledWith(JSON.stringify(mockedAuditData));
  });
});
