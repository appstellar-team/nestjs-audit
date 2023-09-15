import { Logger } from '@nestjs/common';
import { SNSTransport } from '../../transports';
import { faker } from '@faker-js/faker';
import { Action, AuditData, Outcome } from '../../interfaces';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';

describe('SNS Transport', () => {
  const mockedAuditData: AuditData = {
    userId: faker.string.uuid(),
    action: Action.READ,
    objectId: faker.string.uuid(),
    entity: faker.string.alpha(),
    outcome: Outcome.SUCCESS,
    date: new Date(),
  };

  const loggerMock = jest.spyOn(Logger, 'error');
  const snsMock = mockClient(SNSClient);

  const transport = new SNSTransport({
    client: new SNSClient(),
    snsTopicArn: faker.string.alphanumeric(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    snsMock.reset();
  });

  it('should fail to emit data', async () => {
    snsMock.on(PublishCommand).rejects();

    await transport.emit(mockedAuditData);

    expect(loggerMock).toHaveBeenCalledWith(
      'Error sending message to topic. Please check if the provided arguments are correct',
    );
  });

  it('should emit data successfully', async () => {
    snsMock.on(PublishCommand).resolves({
      MessageId: faker.string.alphanumeric(),
    });
    await transport.emit(mockedAuditData);

    expect(loggerMock).not.toHaveBeenCalled();
  });
});
