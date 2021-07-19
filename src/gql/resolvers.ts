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
  AnswerSendArgs,
  GameUserKickedPayload,
  GameUserKickedVariables,
  GameUserUpdatePayload,
  GameUserUpdateVariables,
  GuessNameArgs,
  IContext,
  JoinRoomArgs,
  QuastionSendArgs,
  RoomUpdatePayload,
  RoomUpdateVariables,
} from './interfaces';
import {
  isQuestionCorrect,
  generateGuessQueue,
  nextStep,
  setGameAuthCookie,
} from '../helpers';
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
const correctAnswersForNextStep = 3;

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
    async sendAnswer(_, { answer }: AnswerSendArgs, { cookies }: IContext) {
      if (!cookies[CookiesType.GameAuth]) {
        throw new UserInputError('You do not have any game session');
      }

      if (!answer) {
        throw new UserInputError('You can not send empty answer');
      }

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

      const room = await roomController.getRoom(_, { shareId: roomShareId });

      const participants = room.participants;

      const gameUser = await gameUserController.getGameUser(_, {
        id: gameUserId,
      });
      const questionUser = await gameUserController.getGameUser(_, {
        id: room.question.from,
      });
      const questionUserIndex = participants.findIndex(
        (participant) => participant.id === questionUser.id
      );

      if (`${gameUser.id}` === `${room.question.from}`) {
        throw new UserInputError('You can not answer on your question');
      }

      room.answers.push({
        id: gameUser.id,
        value: answer,
      });

      if (room.answers.length === participants.length - 1) {
        if (isQuestionCorrect(room.answers)) {
          questionUser.correctAnswers += 1;

          if (questionUser.correctAnswers === correctAnswersForNextStep) {
            nextStep(room, questionUser);
          }
        } else {
          nextStep(room, questionUser);
        }

        room.answers = [];
        room.question = null;
        room.participants[questionUserIndex] = questionUser;
      }

      pubsub.publish(PubSubEnum.USER_UPDATE, {
        gameUserUpdate: room,
      });

      await room.save();
    },
    async sendQuestion(
      _,
      { question }: QuastionSendArgs,
      { cookies }: IContext
    ) {
      if (!cookies[CookiesType.GameAuth]) {
        throw new UserInputError('You do not have any game session');
      }

      if (!question.trim()) {
        throw new UserInputError('You can not send empty question');
      }

      const { roomShareId, gameUserId } = JSON.parse(
        cookies[CookiesType.GameAuth]
      );

      const room = await roomController.getRoom(_, { shareId: roomShareId });
      const participants = room.participants;
      const gameUser = await gameUserController.getGameUser(_, {
        id: gameUserId,
      });
      const gameUserIndex = participants.findIndex(
        (participant) => participant.id === gameUser.id
      );

      if (room.step % participants.length !== gameUserIndex) {
        throw new UserInputError('Now is not your turn to ask a question');
      }

      room.question = {
        from: gameUser.id,
        question,
      };

      await room.save();

      pubsub.publish(PubSubEnum.USER_UPDATE, {
        gameUserUpdate: room,
      });

      return room;
    },
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

      if (gameUser.namingUser.id !== namingUser.id) {
        throw new UserInputError(
          'You do not have permission to name this user'
        );
      }

      namingUser.guessName = name;

      await namingUser.save();

      const namingUserIndex = room.participants.findIndex(
        (participant) => participant.id === namingUser.id
      );

      room.participants[namingUserIndex].guessName = name;

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

      await generateGuessQueue(room);
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
