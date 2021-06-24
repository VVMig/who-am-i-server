import { model, Schema, Document, Model } from 'mongoose';

import { IGameUser } from './GameUser';

export interface IRoom extends Document {
  shareId: string;
  participants: IGameUser[];
  maxParticipants: number;
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
});

export const Room: Model<IRoom> = model('Room', roomSchema);
