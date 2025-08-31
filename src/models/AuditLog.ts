import { Schema, model, Types } from 'mongoose';


const auditLogSchema = new Schema(
{
ticketId: { type: Types.ObjectId, ref: 'Ticket', required: true, index: true },
traceId: { type: String, required: true, index: true },
actor: { type: String, enum: ['system', 'agent', 'user'], required: true },
action: { type: String, required: true },
meta: { type: Object, default: {} },
timestamp: { type: Date, default: () => new Date(), index: true }
},
{ versionKey: false }
);


export const AuditLog = model('AuditLog', auditLogSchema);