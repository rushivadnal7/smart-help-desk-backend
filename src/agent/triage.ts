import { v4 as uuid } from 'uuid';
import { Ticket } from '../models/Ticket.js';
import { Config } from '../models/Config.js';
import { AgentSuggestion } from '../models/AgentSuggestion.js';
import { AuditLog } from '../models/AuditLog.js';
import { classify, draftReply } from './provider.stub.js';
import { retrieveTopArticles } from './retriever.js';


export async function triageTicket(ticketId: string, traceId = uuid(), idempotencyKey?: string) {
const ticket = await Ticket.findById(ticketId);
if (!ticket) throw new Error('Ticket not found');


await AuditLog.create({ ticketId, traceId, actor: 'system', action: 'TRIAGE_START', meta: { idempotencyKey }, timestamp: new Date() });


// CLASSIFY
const classification = await classify(`${ticket.title} ${ticket.description}`);
await AuditLog.create({ ticketId, traceId, actor: 'system', action: 'AGENT_CLASSIFIED', meta: classification, timestamp: new Date() });


// RETRIEVE KB
const arts = await retrieveTopArticles(ticket.description || ticket.title);
await AuditLog.create({ ticketId, traceId, actor: 'system', action: 'KB_RETRIEVED', meta: { articleIds: arts.map(a => a._id) }, timestamp: new Date() });


// DRAFT
const draft = await draftReply(ticket.title, arts.map(a => a.title));
await AuditLog.create({ ticketId, traceId, actor: 'system', action: 'DRAFT_GENERATED', meta: {}, timestamp: new Date() });


// DECIDE
const config = await Config.findOne() || await Config.create({});
const threshold = config.confidenceThreshold ?? 0.78;
const autoClose = (config.autoCloseEnabled ?? true) && classification.confidence >= threshold;


const suggestion = await AgentSuggestion.create({
ticketId: ticket._id,
predictedCategory: classification.predictedCategory,
articleIds: arts.map(a => a._id),
draftReply: draft.draftReply,
confidence: classification.confidence,
autoClosed: autoClose,
modelInfo: classification.modelInfo
});

console.log('classification', classification)
console.log('retrieve kb', arts)
console.log('draft', draft)
// console.log('draft', )


ticket.category = classification.predictedCategory as any;
ticket.agentSuggestionId = suggestion._id;
ticket.status = autoClose ? 'resolved' : 'waiting_human';
await ticket.save();


await AuditLog.create({ ticketId, traceId, actor: 'system', action: autoClose ? 'AUTO_CLOSED' : 'ASSIGNED_TO_HUMAN', meta: { suggestionId: suggestion._id }, timestamp: new Date() });
await AuditLog.create({ ticketId, traceId, actor: 'system', action: 'TRIAGE_END', meta: {}, timestamp: new Date() });
}