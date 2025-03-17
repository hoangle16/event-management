import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

export interface GraphQLContext {
  req: Request & { user?: JwtPayload };
}
