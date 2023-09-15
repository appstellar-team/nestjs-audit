import { Schema, connect, model } from 'mongoose';
import {
  AuditData,
  MongooseTransportOptions,
  TransportMethods,
  Transport,
} from '../interfaces';
import { Logger } from '@nestjs/common';

export default class MongooseTransport implements Transport {
  options: MongooseTransportOptions;
  name = TransportMethods.MONGOOSE;

  constructor(options: MongooseTransportOptions) {
    this.options = options;
  }

  async emit(data: AuditData): Promise<void> {
    try {
      // Connect to MongoDB
      await connect(this.options.connectionString);
      await this.insertDocument(data);
    } catch {
      Logger.error(
        'Error connecting or inserting into database. Please check if the provided connectionString is correct',
      );
    }
  }

  private async insertDocument(data: AuditData): Promise<void> {
    const audit = new Audit({
      userId: data.userId,
      action: data.action,
      objectId: data.objectId,
      entity: data.entity,
      outcome: data.outcome,
      error: data.error,
      date: data.date,
    });
    await audit.save();
  }
}

// Create a Schema corresponding to the document interface.
const auditSchema = new Schema<AuditData>({
  userId: String,
  action: { type: String, required: true },
  objectId: String,
  entity: String,
  outcome: { type: String, required: true },
  error: String,
  date: { type: Date, required: true },
});

// Create a Model
const Audit = model<AuditData>('Audit', auditSchema);
