import { Logger } from '@nestjs/common';
import { AuditData, ConsoleTransportOptions, Transports } from '../interfaces';

export default class ConsoleTransport implements Transports {
  options: ConsoleTransportOptions | undefined;
  name = 'console';

  constructor(options?: ConsoleTransportOptions) {
    this.options = options;
  }

  emit(data: AuditData): void {
    this.options?.logger && typeof this.options.logger.log === 'function'
      ? this.options.logger.log(JSON.stringify(data))
      : Logger.log(JSON.stringify(data));
  }
}
