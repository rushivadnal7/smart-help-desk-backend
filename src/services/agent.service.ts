import { triageTicket } from '../agent/triage.js';
export async function requestTriage(ticketId: string, traceId: string, idempotencyKey?: string) {
await triageTicket(ticketId, traceId, idempotencyKey);
}