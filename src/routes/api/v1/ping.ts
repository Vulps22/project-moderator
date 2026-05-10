import { ApiRoute } from '@vulps22/dynamic-endpoint-router';
import { msMiddleware } from '../../../middleware/msAuth';

export const route: ApiRoute = {
  middleware: msMiddleware,
  async get(_req, res): Promise<void> {
    res.status(200).json({ message: 'OK' });
  },
};
