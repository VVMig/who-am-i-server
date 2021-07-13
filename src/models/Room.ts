import { model, Schema, Document, Model } from 'mongoose';
import { GameStage } from '../GameStage';

import { IGameUser } from './GameUser';

export interface IRoom extends Document {
  shareId: string;
  participants: IGameUser[];
  maxParticipants: number;
  gameStage: GameStage;
  nowNaming?: IGameUser;
  nameSeter?: IGameUser;
}

const roomSchema: Schema<IRoom> = new Schema({
  shareId: {
    type: String,
    unique: true,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'GameUser',
    },
  ],
  maxParticipants: {
    type: Number,
  },
  gameStage: {
    type: String,
    default: GameStage.WAIT_STAGE,
  },
  nowNaming: {
    type: Schema.Types.ObjectId,
    ref: 'GameUser',
  },
  nameSeter: {
    type: Schema.Types.ObjectId,
    ref: 'GameUser',
  },
});

export const Room: Model<IRoom> = model('Room', roomSchema);
