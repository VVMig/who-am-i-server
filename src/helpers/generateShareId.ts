/* eslint-disable @typescript-eslint/no-var-requires */
import randomstring from 'randomstring';

import { Room } from '../models';

export const generateShareId = async () => {
  let genedId = randomstring.generate({ length: 5 });
  let room = await Room.findOne({ shareId: genedId });

  while (room) {
    genedId = randomstring.generate({ length: 5 });
    room = await Room.findOne({ shareId: genedId });
  }

  return genedId;
};
