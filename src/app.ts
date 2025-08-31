import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import { router as authRoutes } from './routes/auth.js';
import { router as kbRoutes } from './routes/kb.js';
import { router as ticketRoutes } from './routes/tickets.js';
import { router as agentRoutes } from './routes/agent.js';
import { router as configRoutes } from './routes/config.js';
import { router as auditRoutes } from './routes/audit.js';
import { router as streamRoutes } from './routes/stream.js';
import { errorHandler } from './middleware/error.js';


const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(pinoHttp());
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));


app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/readyz', (_req, res) => res.json({ ok: true }));


app.use('/api/auth', authRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/config', configRoutes);
app.use('/api', auditRoutes);
app.use('/api', streamRoutes);


app.use(errorHandler);
export default app;