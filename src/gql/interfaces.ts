import { Response } from 'express';

export interface IContext {
  cookies: Record<string, string>;
  res: Response;
}
