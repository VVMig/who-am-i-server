import { Response } from 'express';

export const setGameAuthCookie = (
  res: Response,
  gameUserId: string,
  roomShareId: string
) => {
  res.cookie(
    'gameAuth',
    JSON.stringify({
      gameUserId,
      roomShareId,
    })
  );
};
