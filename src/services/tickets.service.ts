import { Ticket } from '../models/Ticket.js';
import { enqueue } from '../queue/inprocQueue.js';
import { newTraceId } from '../lib/trace.js';
import { AuditLog } from '../models/AuditLog.js';


export async function createTicket(data: { title: string; description: string; createdBy: string; category?: any }) {
const t = await Ticket.create({ ...data, status: 'open' });
const traceId = newTraceId();
await AuditLog.create({ ticketId: t._id, traceId, actor: 'user', action: 'TICKET_CREATED', meta: {}, timestamp: new Date() });
enqueue({ type: 'TRIAGE', ticketId: t._id.toString(), traceId });
return t;
}