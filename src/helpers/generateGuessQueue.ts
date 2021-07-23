import { gameUserController } from '../controllers';
import { IRoom } from '../models';

export const generateGuessQueue = async (room: IRoom) => {
  for await (const participant of room.participants) {
    const participants = room.participants;
    const gameUserIndex = participants.findIndex(
      (findParticipant) => findParticipant.id === participant.id
    );

    const gameUser = await gameUserController.getGameUser(null, {
      id: participant._id,
    });

    const nextGameUserIndex = gameUserIndex + 1;
    const prevGameUserIndex = gameUserIndex - 1;

    if (gameUserIndex === 0) {
      gameUser.namingUser = participants[room.participants.length - 1];
      gameUser.seterUser = participants[nextGameUserIndex];
    } else if (gameUserIndex === participants.length - 1) {
      gameUser.namingUser = participants[prevGameUserIndex];
      gameUser.seterUser = participants[0];
    } else {
      gameUser.namingUser = participants[prevGameUserIndex];
      gameUser.seterUser = participants[nextGameUserIndex];
    }

    participant.namingUser = gameUser.namingUser;
    participant.seterUser = gameUser.seterUser;

    await gameUser.save();
  }
};
