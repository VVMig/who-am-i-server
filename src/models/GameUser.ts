import { model, Schema, Document, Model } from 'mongoose';

import { IRoom } from './Room';

export interface IGameUser extends Document {
  displayName: string;
  color: string;
  room: IRoom;
  guessName: string;
  isAdmin: boolean;
  isFinal: boolean;
  namingUser: IGameUser;
  seterUser: IGameUser;
  correctAnswers: number;
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
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isFinish: {
    type: Boolean,
    default: false,
  },
  namingUser: {
    type: Schema.Types.ObjectId,
    ref: 'GameUser',
  },
  seterUser: {
    type: Schema.Types.ObjectId,
    ref: 'GameUser',
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
});

export const GameUser: Model<IGameUser> = model('GameUser', gameUserSchema);
