import {
  roomController,
  gameUserController,
  maxParticipantsLimit,
  minParticipantsLimit,
  defaultParticipantsValue,
  CreateRoomArgs,
  GetGameUserArgs,
} from '../controllers';
import {
  GameUserKickedPayload,
  GameUserKickedVariables,
  GameUserUpdatePayload,
  GameUserUpdateVariables,
  GuessNameArgs,
  IContext,
  JoinRoomArgs,
  RoomUpdatePayload,
  RoomUpdateVariables,
} from './interfaces';
import { nextNamingStep, setGameAuthCookie } from '../helpers';
import {
  ForbiddenError,
  PubSub,
  UserInputError,
  withFilter,
} from 'apollo-server';
import { CookiesType } from '../CookiesType';
import { PubSubEnum } from './PubSubEnum';
import { GameStage } from '../GameStage';

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

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

      try {
        await roomController.getRoom(_, { shareId: roomShareId });
        await gameUserController.getGameUser(_, { id: gameUserId });
      } catch (error) {
        res.clearCookie(CookiesType.GameAuth);
        return false;
      }

      return true;
    },
  },
  Mutation: {
    async nameStageNext(_, __, { cookies }: IContext) {
      if (!cookies[CookiesType.GameAuth]) {
        throw new UserInputError('You do not have any game session');
      }

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

      const room = await roomController.getRoom(_, { shareId: roomShareId });
      const adminUser = await gameUserController.getGameUser(_, {
        id: gameUserId,
      });

      if (!adminUser.isAdmin) {
        throw new ForbiddenError('You do not have permission to start game');
      }

      if (room.participants.length !== room.maxParticipants) {
        throw new UserInputError('Wait all players');
      }

      room.gameStage = GameStage.PLAY_STAGE;

      await nextNamingStep(room);

      await room.save();

      pubsub.publish(PubSubEnum.ROOM_STAGE, {
        roomStage: room,
      });

      return room;
    },
    async guessName(_, { id, name }: GuessNameArgs, { cookies }: IContext) {
      if (!cookies[CookiesType.GameAuth]) {
        throw new UserInputError('You do not have any game session');
      }

      console.log(id, name);

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

      const room = await roomController.getRoom(_, { shareId: roomShareId });
      const gameUser = await gameUserController.getGameUser(_, {
        id: gameUserId,
      });
      const namingUser = await gameUserController.getGameUser(_, {
        id,
      });

      if (
        room.nameSeter.id !== gameUser.id ||
        room.nowNaming.id !== namingUser.id
      ) {
        throw new UserInputError('It is not your turn for naming');
      }

      namingUser.guessName = name;

      await namingUser.save();

      const namingUserIndex = room.participants.findIndex(
        (participant) => participant.id === namingUser.id
      );

      room.participants[namingUserIndex].guessName = name;

      await nextNamingStep(room);
      await namingUser.save();

      pubsub.publish(PubSubEnum.USER_UPDATE, {
        gameUserUpdate: room,
      });

      return room;
    },
    async waitStageNext(_, __, { cookies }: IContext) {
      if (!cookies[CookiesType.GameAuth]) {
        throw new UserInputError('You do not have any game session');
      }

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

      const room = await roomController.getRoom(_, { shareId: roomShareId });
      const adminUser = await gameUserController.getGameUser(_, {
        id: gameUserId,
      });

      if (!adminUser.isAdmin) {
        throw new ForbiddenError('You do not have permission to start game');
      }

      if (room.participants.length !== room.maxParticipants) {
        throw new UserInputError('Wait all players');
      }

      room.gameStage = GameStage.NAME_STAGE;

      await nextNamingStep(room);

      await room.save();

      pubsub.publish(PubSubEnum.ROOM_STAGE, {
        roomStage: room,
      });

      return room;
    },
    async kickPlayer(_, { id }: GetGameUserArgs, { cookies }: IContext) {
      if (!cookies[CookiesType.GameAuth]) {
        throw new UserInputError('You do not have any game session');
      }

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

      const room = await roomController.getRoom(_, { shareId: roomShareId });
      const adminUser = await gameUserController.getGameUser(_, {
        id: gameUserId,
      });

      if (!adminUser.isAdmin) {
        throw new ForbiddenError('You do not have permission to kick players');
      }

      const kickCandidate = await gameUserController.getGameUser(_, { id });

      await gameUserController.removeGameUser(_, { id });

      room.participants = room.participants.filter(
        (participant) => participant.id !== kickCandidate.id
      );

      await room.save();

      pubsub.publish(PubSubEnum.USER_KICKED, {
        kickedGameUser: id,
      });

      pubsub.publish(PubSubEnum.USER_UPDATE, {
        gameUserUpdate: room,
      });

      return room;
    },
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

      pubsub.publish(PubSubEnum.USER_UPDATE, {
        gameUserUpdate: room,
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
        res.clearCookie(CookiesType.GameAuth);
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
        res.clearCookie(CookiesType.GameAuth);
        throw new UserInputError('Wrong data');
      }

      room.participants = room.participants.filter(
        (participant) => participant.id !== gameUser.id
      );

      if (!room.participants.length) {
        await roomController.removeRoom(_, { shareId: room.shareId });
      } else {
        const newAdmin = await gameUserController.getGameUser(_, {
          id: room.participants[0].id,
        });
        newAdmin.isAdmin = true;
        await newAdmin.save();
        room.participants[0].isAdmin = true;
        await room.save();
      }

      await gameUserController.removeGameUser(_, { id: gameUser.id });

      pubsub.publish(PubSubEnum.USER_UPDATE, {
        gameUserUpdate: room,
      });

      res.clearCookie(CookiesType.GameAuth);

      return 'Successfully exited';
    },
  },
  Subscription: {
    gameUserUpdate: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubEnum.USER_UPDATE),
        (
          { gameUserUpdate }: GameUserUpdatePayload,
          { shareId }: GameUserUpdateVariables
        ) => {
          return gameUserUpdate.shareId === shareId;
        }
      ),
    },
    kickedGameUser: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubEnum.USER_KICKED),
        (
          { kickedGameUser }: GameUserKickedPayload,
          { id }: GameUserKickedVariables
        ) => {
          return kickedGameUser === id;
        }
      ),
    },
    roomStage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubEnum.ROOM_STAGE),
        (
          { roomStage }: RoomUpdatePayload,
          { shareId }: RoomUpdateVariables
        ) => {
          return roomStage.shareId === shareId;
        }
      ),
    },
  },
};
