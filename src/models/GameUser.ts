import { model, Schema, Document, Model } from 'mongoose';

import { IRoom } from './Room';

export interface IGameUser extends Document {
  displayName: string;
  color: string;
  room: IRoom;
  guessName: string;
}

const gameUserSchema: Schema<IGameUser> = new Schema({
  displayName: {
    type: String,
  },
  color: {
    type: String,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
  },
  guessName: {
    type: String,
  },
});

export const GameUser: Model<IGameUser> = model('GameUser', gameUserSchema);
