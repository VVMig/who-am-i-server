import { IRoom } from '../models';

export const checkGameFinish = (room: IRoom) => {
  return (
    room.participants.filter((participant) => participant.isFinish).length ===
    room.participants.length
  );
};
