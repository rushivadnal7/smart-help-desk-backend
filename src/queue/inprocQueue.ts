type Job = { type: 'TRIAGE'; ticketId: string; traceId: string; idempotencyKey?: string };
const q: Job[] = [];
let running = false;


export function enqueue(job: Job) { q.push(job); tick(); }


async function tick() {
if (running) return;
running = true;
while (q.length) {
const job = q.shift()!;
try { await processJob(job); }
catch (e) { console.error('Queue job failed', e); }
}
running = false;
}


async function processJob(job: Job) {
if (job.type === 'TRIAGE') {
const { triageTicket } = await import('../agent/triage');
await triageTicket(job.ticketId, job.traceId, job.idempotencyKey);
}
}