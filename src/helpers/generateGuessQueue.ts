import { gameUserController } from '../controllers';
import { IRoom } from '../models';

export const generateGuessQueue = async (room: IRoom) => {
  for await (const participant of room.participants) {
    const gameUserIndex = room.participants.findIndex(
      (findParticipant) => findParticipant.id === participant.id
    );

    const gameUser = await gameUserController.getGameUser(null, {
      id: participant._id,
    });

    if (gameUserIndex === 0) {
      gameUser.namingUser = room.participants[room.participants.length - 1];
      gameUser.seterUser = room.participants[gameUserIndex + 1];
    } else if (gameUserIndex === room.participants.length - 1) {
      gameUser.namingUser = room.participants[gameUserIndex - 1];
      gameUser.seterUser = room.participants[0];
    } else {
      gameUser.namingUser = room.participants[gameUserIndex - 1];
      gameUser.seterUser = room.participants[gameUserIndex + 1];
    }

    participant.namingUser = gameUser.namingUser;
    participant.seterUser = gameUser.seterUser;

    await gameUser.save();
  }
};
