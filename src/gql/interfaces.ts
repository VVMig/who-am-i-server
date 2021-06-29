import { Response } from 'express';

export interface JoinRoomArgs {
  gameInformation: {
    room: {
      shareId: string;
    };
    gameUser: {
      id: string;
    };
  };
}

export interface IContext {
  cookies: Record<string, string>;
  res: Response;
}
