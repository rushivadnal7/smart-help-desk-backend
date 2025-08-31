import { Schema, model, Types } from 'mongoose';


const ticketSchema = new Schema(
{
title: { type: String, required: true },
description: { type: String, required: true },
category: { type: String, enum: ['billing', 'tech', 'shipping', 'other'], default: 'other', index: true },
status: { type: String, enum: ['open', 'triaged', 'waiting_human', 'resolved', 'closed'], default: 'open', index: true },
createdBy: { type: Types.ObjectId, ref: 'User', required: true, index: true },
assignee: { type: Types.ObjectId, ref: 'User', default: null },
agentSuggestionId: { type: Types.ObjectId, ref: 'AgentSuggestion', default: null }
},
{ timestamps: true }
);


export const Ticket = model('Ticket', ticketSchema);