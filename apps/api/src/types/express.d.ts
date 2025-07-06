import { JwtPayload } from '@clerk/clerk-sdk-node';

declare global {
  namespace Express {
    export interface Request {
      auth: JwtPayload;
    }
  }
}
