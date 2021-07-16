import { Response } from 'express';
import { GetRoomArgs } from '../controllers';
import { IRoom } from '../models';

export interface IContext {
  cookies: Record<string, string>;
  res: Response;
}

export interface JoinRoomArgs extends GetRoomArgs {
  isReconnect: boolean;
}

export interface GameUserUpdatePayload {
  gameUserUpdate: IRoom;
}

export interface GameUserUpdateVariables {
  shareId: string;
}

export interface GameUserKickedPayload {
  kickedGameUser: string;
}

export interface GameUserKickedVariables {
  id: string;
}

export interface RoomUpdatePayload {
  roomStage: IRoom;
}

export interface RoomUpdateVariables {
  shareId: string;
}

export interface GuessNameArgs {
  id: string;
  name: string;
}
