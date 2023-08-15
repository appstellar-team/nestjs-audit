import { Schema, connect, model } from 'mongoose';
import { AuditData, MongooseTransportOptions } from '../interfaces';
import { Logger } from '@nestjs/common';

export default class MongooseTransport {
  options: MongooseTransportOptions;
  name = 'mongoose';

  // Create a Schema corresponding to the document interface.
  auditSchema = new Schema<AuditData>({
    userId: String,
    action: { type: String, required: true },
    objectId: String,
    entity: String,
    outcome: { type: String, required: true },
    error: String,
    date: { type: Date, required: true },
  });

  // Create a Model
  Audit = model<AuditData>('Audit', this.auditSchema);

  constructor(options: MongooseTransportOptions) {
    this.options = options;
  }

  async emit(data: AuditData): Promise<void> {
    try {
      // Connect to MongoDB
      await connect(this.options.connectionString);
      await this.insertDocument(data);
    } catch (err) {
      Logger.error(err);
    }
  }

  async insertDocument(data: AuditData): Promise<void> {
    const audit = new this.Audit({
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
