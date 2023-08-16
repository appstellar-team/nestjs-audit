import { Action } from './interfaces';

const MethodToAction: Record<string, Action> = {
  POST: Action.CREATE,
  GET: Action.READ,
  PUT: Action.UPDATE,
  PATCH: Action.UPDATE,
  DELETE: Action.DELETE,
};

export default MethodToAction;
