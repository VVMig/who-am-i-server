import { UserInputError } from 'apollo-server';
import { generateGuessQueue, generateShareId } from '../helpers';
import { Room } from '../models';
import { CreateRoomArgs, GetRoomArgs } from './interfaces';

export const maxParticipantsLimit = 8;
export const minParticipantsLimit = 2;
export const defaultParticipantsValue = Math.round(
  (maxParticipantsLimit + minParticipantsLimit) / 2
);

export const roomController = {
  async getRoom(_, { shareId }: GetRoomArgs) {
    const room = await Room.findOne({ shareId }).populate({
      path: 'participants',
      model: 'GameUser',
      populate: [
        {
          path: 'namingUser',
          model: 'GameUser',
        },
        {
          path: 'seterUser',
          model: 'GameUser',
        },
      ],
    });

    if (!room) {
      throw new UserInputError('Room not found');
    }

    return room;
  },
  async createRoom(
    _,
    { maxParticipants = defaultParticipantsValue }: CreateRoomArgs
  ) {
    const maxParticipantsNum = maxParticipants;

    if (
      maxParticipantsNum < minParticipantsLimit ||
      maxParticipantsNum > maxParticipantsLimit
    ) {
      throw new UserInputError(
        'The number of participants must not exceed 8 and cannot be less than 2'
      );
    }

    const shareId = await generateShareId();

    const room = await Room.create({
      shareId,
      maxParticipants: maxParticipants,
    });

    return room;
  },
  async removeRoom(_, { shareId }: GetRoomArgs) {
    await Room.deleteOne({ shareId });
  },
};
