import { Request, Response, NextFunction } from 'express';

export function bearerAuth(req: Request, res: Response, next: NextFunction): void {
  console.log(`[DEBUG MS/auth] bearerAuth — ${req.method} ${req.path} from ${req.ip}`);
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[DEBUG MS/auth] Rejected: missing or malformed Authorization header`);
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const expected = process.env.MS_PE_API_SECRET;
  console.log(`[DEBUG MS/auth] Token received — length=${token.length} prefix="${token.substring(0, 4)}..." expected_length=${expected?.length}`);

  if (token !== expected) {
    console.log(`[DEBUG MS/auth] Rejected: token mismatch`);
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  console.log(`[DEBUG MS/auth] Authorised — passing to handler`);
  next();
}
