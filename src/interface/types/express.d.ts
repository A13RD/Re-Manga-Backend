import { AuthTokenPayload } from '../../domain/user';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};

