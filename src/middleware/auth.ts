import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../lib/jwt.js';


export interface AuthUser { _id: string; role: 'admin' | 'agent' | 'user'; name: string; email: string }


export function auth(required = true) {
return (req: Request & { user?: AuthUser }, res: Response, next: NextFunction) => {
const header = req.headers.authorization;
if (!header) {
if (required) return res.status(401).json({ error: 'Missing Authorization' });
return next();
}
const token = header.replace('Bearer ', '');
try {
const user = verifyJwt<AuthUser>(token);
req.user = user;
next();
} catch {
return res.status(401).json({ error: 'Invalid token' });
}
};
}


export function role(...roles: Array<'admin' | 'agent' | 'user'>) {
return (req: Request & { user?: AuthUser }, res: Response, next: NextFunction) => {
if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
next();
};
}