import { roomController } from '../controllers';
import { gameUserController } from '../controllers/gameUserController';

export const resolvers = {
  Query: {
    getGameUser: gameUserController.getGameUser,
    getRoom: roomController.getRoom,
  },
  Mutation: {
    createRoom: roomController.createRoom,
    createGameUser: gameUserController.createGameUser,
  },
};
