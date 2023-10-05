import { Logger } from '@nestjs/common';
import { MongooseTransport } from '../../transports';
import { faker } from '@faker-js/faker';
import { Action, AuditData, Outcome } from '../../interfaces';
import mongoose from 'mongoose';

describe('Mongoose Transport', () => {
  const mockedAuditData: AuditData = {
    userId: faker.string.uuid(),
    action: Action.READ,
    objectId: faker.string.uuid(),
    entity: faker.string.alpha(),
    outcome: Outcome.SUCCESS,
    date: new Date(),
  };

  const loggerSpy = jest.spyOn(Logger, 'error');

  const transport = new MongooseTransport({
    connectionString: faker.string.alphanumeric(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should fail to emit data', async () => {
    jest.spyOn(mongoose, 'connect').mockImplementationOnce(() => {
      return Promise.reject();
    });

    await transport.emit(mockedAuditData);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Error connecting or inserting into database. Please check if the provided connectionString is correct',
    );
  });

  it('should emit data successfully', async () => {
    jest.spyOn(mongoose, 'connect').mockImplementationOnce(() => {
      return Promise.resolve(mongoose);
    });

    jest
      .spyOn(mongoose.model('Audit').prototype, 'save')
      .mockImplementationOnce(() => {
        return Promise.resolve(mockedAuditData);
      });

    await transport.emit(mockedAuditData);

    expect(loggerSpy).not.toHaveBeenCalled();
  });
});
