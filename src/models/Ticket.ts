import { Schema, model, Types, Document } from "mongoose";

// Define the TypeScript interface for a Ticket document
export interface ITicket extends Document {
  title: string;
  description: string;
  category: "billing" | "tech" | "shipping" | "other";
  status: "open" | "triaged" | "waiting_human" | "resolved" | "closed";
  createdBy: Types.ObjectId;
  assignee?: Types.ObjectId | null;
  agentSuggestionId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["billing", "tech", "shipping", "other"],
      default: "other",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "triaged", "waiting_human", "resolved", "closed"],
      default: "open",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    agentSuggestionId: { type: Schema.Types.ObjectId, ref: "AgentSuggestion", default: null },
  },
  { timestamps: true }
);

// Create and export the model
export const Ticket = model<ITicket>("Ticket", ticketSchema);
