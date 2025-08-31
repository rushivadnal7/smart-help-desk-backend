import { Router } from 'express';
import { auth, role } from '../middleware/auth.js';
import { getConfig, updateConfig } from '../services/config.service.js';


export const router = Router();


router.get('/', auth(), async (_req, res, next) => {
try { res.json(await getConfig()); } catch (e) { next(e); }
});


router.put('/', auth(), role('admin'), async (req, res, next) => {
try { res.json(await updateConfig(req.body)); } catch (e) { next(e); }
});