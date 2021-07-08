import { UserInputError } from 'apollo-server';
import faker from 'faker';
import { isValidObjectId } from 'mongoose';

import { GameUser } from '../models';
import { GetGameUserArgs, CreateGameUserArgs } from './interfaces';
import { roomController } from './roomController';

export const gameUserController = {
  async createGameUser(_, { shareId, isAdmin }: CreateGameUserArgs) {
    const room = await roomController.getRoom(null, { shareId });

    const gameUser = await GameUser.create({
      displayName: faker.name.firstName(),
      room,
      color: faker.internet.color(),
      isAdmin: isAdmin || false,
    });

    await gameUser.save();

    return gameUser;
  },
  async getGameUser(_, { id }: GetGameUserArgs) {
    if (!isValidObjectId(id)) {
      throw new UserInputError('Wrong user id');
    }

    const gameUser = await GameUser.findById(id).populate('room');

    if (!gameUser) {
      throw new UserInputError('Game user not found');
    }

    return gameUser;
  },
  async removeGameUser(_, { id }: GetGameUserArgs) {
    await GameUser.findByIdAndDelete(id);
  },
};
