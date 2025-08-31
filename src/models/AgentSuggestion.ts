import { Schema, model, Types } from 'mongoose';


const agentSuggestionSchema = new Schema(
{
ticketId: { type: Types.ObjectId, ref: 'Ticket', required: true, index: true },
predictedCategory: { type: String, enum: ['billing', 'tech', 'shipping', 'other'], required: true },
articleIds: [{ type: Types.ObjectId, ref: 'Article' }],
draftReply: { type: String, required: true },
confidence: { type: Number, required: true },
autoClosed: { type: Boolean, default: false },
modelInfo: { provider: String, model: String, promptVersion: String, latencyMs: Number }
},
{ timestamps: { createdAt: true, updatedAt: false } }
);


export const AgentSuggestion = model('AgentSuggestion', agentSuggestionSchema);