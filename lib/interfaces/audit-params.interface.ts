export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DELETE_ALL = 'DELETE_ALL',
  CREATE_OR_UPDATE = 'CREATE_OR_UPDATE',
}

export interface AuditParams {
  action?: Action;
  getUserId?: (req: any) => string;
  getResponseObjectId?: (req: any) => string;
  entity?: string;
}
