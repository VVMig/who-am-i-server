import {
  roomController,
  gameUserController,
  maxParticipantsLimit,
  minParticipantsLimit,
  defaultParticipantsValue,
  CreateRoomArgs,
  GetRoomArgs,
} from '../controllers';
import { IContext } from './interfaces';
import { setGameAuthCookie } from '../helpers';
import { UserInputError } from 'apollo-server';

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
        isAdmin: true,
      });

      room.participants.push(gameUser);

      await room.save();

      setGameAuthCookie(res, gameUser.id, room.shareId);

      return room;
    },
    createGameUser: gameUserController.createGameUser,
    async joinRoom(_, { shareId }: GetRoomArgs, { res }: IContext) {
      const room = await roomController.getRoom(_, { shareId });

      if (room.participants.length >= maxParticipantsLimit) {
        throw new UserInputError('Room is full');
      }

      const gameUser = await gameUserController.createGameUser(_, { shareId });

      room.participants.push(gameUser);

      await room.save();

      setGameAuthCookie(res, gameUser.id, room.shareId);

      return room;
    },
    async leaveRoom(_, __, { res, cookies }: IContext) {
      if (!cookies['gameAuth']) {
        throw new UserInputError('You have already left this room');
      }

      const { roomShareId, gameUserId } = JSON.parse(cookies['gameAuth']);

      const room = await roomController.getRoom(_, { shareId: roomShareId });
      const gameUser = await gameUserController.getGameUser(_, {
        id: gameUserId,
      });

      if (!room || !gameUser) {
        throw new UserInputError('Wrong data');
      }

      room.participants = room.participants.filter(
        (participant) => participant.id !== gameUser.id
      );

      if (!room.participants.length) {
        await roomController.removeRoom(_, { shareId: room.shareId });
      } else {
        await room.save();
      }

      await gameUserController.removeGameUser(_, { id: gameUser.id });

      res.clearCookie('gameAuth');

      return 'Successfully exited';
    },
  },
};
