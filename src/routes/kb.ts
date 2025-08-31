import { Router } from 'express';
import { z } from 'zod';
import { auth, role } from '../middleware/auth.js';
import { Article } from '../models/Article.js';
import { searchKB } from '../services/kb.service.js';


export const router = Router();


router.get('/', auth(false), async (req, res, next) => {
try {
const query = (req.query.query as string) || undefined;
const status = (req.query.status as 'draft' | 'published') || undefined;
const docs = await searchKB(query, status);
res.json(docs);
} catch (e) { next(e); }
});


router.post('/', auth(), role('admin'), async (req, res, next) => {
try {
const body = z.object({ title: z.string().min(3), body: z.string().min(3), tags: z.array(z.string()).default([]), status: z.enum(['draft', 'published']).default('draft') }).parse(req.body);
const doc = await Article.create(body);
res.status(201).json(doc);
} catch (e) { next(e); }
});


router.put('/:id', auth(), role('admin'), async (req, res, next) => {
try {
const id = req.params.id;
const body = z.object({ title: z.string().min(3).optional(), body: z.string().min(3).optional(), tags: z.array(z.string()).optional(), status: z.enum(['draft', 'published']).optional() }).parse(req.body);
const doc = await Article.findByIdAndUpdate(id, body, { new: true });
res.json(doc);
} catch (e) { next(e); }
});


router.delete('/:id', auth(), role('admin'), async (req, res, next) => {
try {
await Article.findByIdAndDelete(req.params.id);
res.status(204).send();
} catch (e) { next(e); }
});