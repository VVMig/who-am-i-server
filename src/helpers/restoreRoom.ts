import { gameUserController } from '../controllers';
import { GameStage } from '../GameStage';
import { IRoom } from '../models';

export const restoreRoom = async (room: IRoom) => {
  room.question = null;
  room.answers = [];
  room.gameStage = GameStage.WAIT_STAGE;
  room.step = 0;

  for await (const participant of room.participants) {
    const gameUser = await gameUserController.getGameUser(null, {
      id: participant.id,
    });

    gameUser.guessName = null;
    gameUser.isFinish = false;
    gameUser.namingUser = null;
    gameUser.seterUser = null;
    gameUser.correctAnswers = 0;

    await gameUser.save();
  }

  await room.save();
};
