import { IGameUser, IRoom } from '../models';

export const nextStep = (room: IRoom, gameUser: IGameUser) => {
  room.step += 1;
  gameUser.correctAnswers = 0;
};
