import { Router } from 'express';
import { z } from 'zod';
import * as svc from '../services/auth.service.js';


export const router = Router();


router.post('/register', async (req, res, next) => {
try {
const body = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), role: z.enum(['admin', 'agent', 'user']).optional() }).parse(req.body);
const out = await svc.register(body.name, body.email, body.password, (body.role as any) ?? 'user');
res.json(out);
} catch (e) { next(e); }
});


router.post('/login', async (req, res, next) => {
try {
const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
const out = await svc.login(body.email, body.password);
res.json(out);
} catch (e) { next(e); }
});