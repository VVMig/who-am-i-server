import { model, Schema, Document, Model } from 'mongoose';
import { GameStage } from '../GameStage';

import { IGameUser } from './GameUser';

export interface IAnswer {
  id: string;
  value: boolean;
  isGuessed?: boolean;
}

export interface IQuestion {
  from: string;
  value: string;
}

export interface IRoom extends Document {
  shareId: string;
  participants: IGameUser[];
  maxParticipants: number;
  gameStage: GameStage;
  question: IQuestion;
  answers: IAnswer[];
  step: number;
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
  question: {
    from: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  step: {
    type: Number,
    default: 0,
  },
  answers: [
    {
      isGuessed: {
        type: Boolean,
      },
      value: {
        type: Boolean,
      },
      id: {
        type: String,
      },
    },
  ],
});

export const Room: Model<IRoom> = model('Room', roomSchema);
