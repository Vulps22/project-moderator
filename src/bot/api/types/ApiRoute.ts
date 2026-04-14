import { Request, Response } from 'express';

export interface ApiRoute {
  get?:    (req: Request, res: Response) => Promise<void> | void;
  post?:   (req: Request, res: Response) => Promise<void> | void;
  put?:    (req: Request, res: Response) => Promise<void> | void;
  patch?:  (req: Request, res: Response) => Promise<void> | void;
  delete?: (req: Request, res: Response) => Promise<void> | void;
}
