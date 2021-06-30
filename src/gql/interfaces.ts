import { Response } from 'express';
import { GetRoomArgs } from '../controllers';

export interface IContext {
  cookies: Record<string, string>;
  res: Response;
}

export interface JoinRoomArgs extends GetRoomArgs {
  isReconnect: boolean;
}
