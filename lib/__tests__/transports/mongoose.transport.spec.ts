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

  const loggerMock = jest.spyOn(Logger, 'error');

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should fail to emit data', async () => {
    const transport = new MongooseTransport({
      connectionString: faker.string.alpha(),
    });
    await transport.emit(mockedAuditData);

    expect(loggerMock).toHaveBeenCalledWith(
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

    const transport = new MongooseTransport({
      connectionString: faker.string.alpha(),
    });
    await transport.emit(mockedAuditData);

    expect(loggerMock).not.toHaveBeenCalled();
  });
});
