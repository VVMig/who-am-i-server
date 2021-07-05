import {
  roomController,
  gameUserController,
  maxParticipantsLimit,
  minParticipantsLimit,
  defaultParticipantsValue,
  CreateRoomArgs,
} from '../controllers';
import { IContext, JoinRoomArgs } from './interfaces';
import { setGameAuthCookie } from '../helpers';
import { PubSub, UserInputError } from 'apollo-server';
import { CookiesType } from '../CookiesType';
import { PubSubEnum } from './PubSubEnum';

const pubsub = new PubSub();

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
    async isRoomExist(_, __, { cookies, res }: IContext) {
      if (!cookies[CookiesType.GameAuth]) {
        return false;
      }

      const { roomShareId } = JSON.parse(cookies[CookiesType.GameAuth]);

      try {
        await roomController.getRoom(_, { shareId: roomShareId });
      } catch (error) {
        res.clearCookie(CookiesType.GameAuth);
        return false;
      }

      return true;
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
    async joinRoom(_, { shareId }: JoinRoomArgs, { res }: IContext) {
      const room = await roomController.getRoom(_, { shareId });

      if (room.participants.length >= maxParticipantsLimit) {
        throw new UserInputError('Room is full');
      }

      const gameUser = await gameUserController.createGameUser(_, { shareId });

      room.participants.push(gameUser);

      await room.save();

      setGameAuthCookie(res, gameUser.id, room.shareId);

      pubsub.publish(PubSubEnum.NEW_USER, {
        newGameUser: gameUser,
      });

      return room;
    },
    async reconnectRoom(_, __, { cookies, res }: IContext) {
      if (!cookies[CookiesType.GameAuth]) {
        throw new UserInputError('You do not have any game session');
      }

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

      const room = await roomController.getRoom(_, { shareId: roomShareId });
      const gameUser = await gameUserController.getGameUser(_, {
        id: gameUserId,
      });

      if (!room || !gameUser) {
        throw new UserInputError('Wrong data');
      }

      if (
        !room.participants.find((participant) => participant.id === gameUser.id)
      ) {
        res.clearCookie(CookiesType.GameAuth);

        throw new UserInputError('You are not a member of this room');
      }

      return room;
    },
    async leaveRoom(_, __, { res, cookies }: IContext) {
      if (!cookies[CookiesType.GameAuth]) {
        throw new UserInputError('You have already left this room');
      }

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

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

      res.clearCookie(CookiesType.GameAuth);

      return 'Successfully exited';
    },
  },
  Subscription: {
    newGameUser: {
      subscribe: () => pubsub.asyncIterator(PubSubEnum.NEW_USER),
    },
  },
};
