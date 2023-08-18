export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DELETE_ALL = 'DELETE_ALL',
  CREATE_OR_UPDATE = 'CREATE_OR_UPDATE',
}

/**
 * Parameters passed to Audit decorator to specify information regarding the audit data.
 *
 */
export interface AuditParams {
  /**
   * HTTP action that is performed. Defaults to the http request method.
   * Pass an `Action` value to override.
   *
   * @default req.method
   *
   */
  action?: Action;
  /**
   * A callback function that returns the user id who is performing the request based on a given input.
   *
   */
  getUserId?: (req: any) => string;
  /**
   * A callback function that returns the object id in which the request is performed based on a given input.
   *
   */
  getResponseObjectId?: (req: any) => string;
  /**
   * Specifies the name of the entity in which the request is performed.
   *
   */
  entity?: string;
}
