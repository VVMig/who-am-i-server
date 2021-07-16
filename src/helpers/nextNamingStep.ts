import { IRoom } from '../models';

export const nextNamingStep = async (room: IRoom) => {
  if (!room.nowNaming) {
    room.nowNaming = room.participants[0];
    room.nameSeter = room.participants[1];

    await room.save();

    return;
  }

  const nowNamingIndex = room.participants.findIndex(
    (participant) => participant.id === room.nowNaming.id
  );
  const gameUserLastIndex = room.participants.length - 1;

  if (nowNamingIndex > -1) {
    if (nowNamingIndex === gameUserLastIndex) {
      room.nowNaming = undefined;
      room.nameSeter = undefined;
    } else if (nowNamingIndex === gameUserLastIndex - 1) {
      room.nowNaming = room.participants[gameUserLastIndex];
      room.nameSeter = room.participants[0];
    } else {
      room.nowNaming = room.participants[nowNamingIndex + 1];
      room.nameSeter = room.participants[nowNamingIndex + 2];
    }
  } else {
    room.nowNaming = room.participants[0];
    room.nameSeter = room.participants[1];
  }

  await room.save();
};
