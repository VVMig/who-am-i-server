import {
  roomController,
  gameUserController,
  maxParticipantsLimit,
  minParticipantsLimit,
  defaultParticipantsValue,
} from '../controllers';
import { CreateRoomArgs } from '../controllers/interfaces';
import { IContext } from './interfaces';

export const resolvers = {
  Query: {
    getGameUser: gameUserController.getGameUser,
    getRoom: roomController.getRoom,
    async getRangeParticipants() {
      return {
        min: minParticipantsLimit,
        max: maxParticipantsLimit,
        defaultValue: defaultParticipantsValue,
      };
    },
  },
  Mutation: {
    async createRoom(
      _,
      { maxParticipants }: CreateRoomArgs,
      { res }: IContext
    ) {
      const room = await roomController.createRoom(_, { maxParticipants });
      const gameUser = await gameUserController.createGameUser(_, {
        shareId: room.shareId,
      });

      res.cookie(
        'gameAuth',
        JSON.stringify({
          gameUserId: gameUser.id,
          roomShareId: room.shareId,
        })
      );

      return room;
    },
    createGameUser: gameUserController.createGameUser,
  },
};
