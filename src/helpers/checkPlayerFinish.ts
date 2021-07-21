import { IRoom } from '../models';

export const checkPlayerFinish = (room: IRoom) => {
  return (
    room.answers.filter((answer) => answer.isGuessed).length ===
    room.participants.length - 1
  );
};
