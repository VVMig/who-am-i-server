import { CorsOptions } from 'cors';
import { uri } from '../uri';

export const corsConfigs: CorsOptions = {
  origin: uri,
  credentials: true,
};
