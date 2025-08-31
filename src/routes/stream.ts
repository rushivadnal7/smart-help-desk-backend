import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';


export const router = Router();


// Minimal SSE: emits each new audit event every 2s polling (simple for demo)
router.get('/stream/tickets/:id', auth(), async (req, res) => {
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.flushHeaders?.();
const ticketId = req.params.id;
let last = new Date(0);
const itv = setInterval(async () => {
const logs = await AuditLog.find({ ticketId, timestamp: { $gt: last } }).sort({ timestamp: 1 }).lean();
if (logs.length) {
last = logs[logs.length - 1].timestamp as Date;
res.write(`event: audit\n`);
res.write(`data: ${JSON.stringify(logs)}\n\n`);
}
}, 2000);
req.on('close', () => clearInterval(itv));
});