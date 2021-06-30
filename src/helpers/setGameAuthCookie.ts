import { Response } from 'express';
import { CookiesType } from '../CookiesType';

export const setGameAuthCookie = (
  res: Response,
  gameUserId: string,
  roomShareId: string
) => {
  res.cookie(
    CookiesType.GameAuth,
    JSON.stringify({
      gameUserId,
      roomShareId,
    })
  );
};
