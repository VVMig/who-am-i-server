import { Response } from 'express';
import { CookiesType } from '../CookiesType';

const cookieMaxAge = 24 * 3600 * 1000;

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
    }),
    {
      maxAge: cookieMaxAge,
      sameSite: 'none',
      secure: true,
    }
  );
};
