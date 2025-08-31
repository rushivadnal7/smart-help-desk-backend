import { v4 as uuid } from "uuid";
import { Ticket } from "../models/Ticket.js";
import { Config } from "../models/Config.js";
import { AgentSuggestion } from "../models/AgentSuggestion.js";
import { AuditLog } from "../models/AuditLog.js";
import { classify, draftReply } from "./provider.stub.js";
import { retrieveTopArticles } from "./retriever.js";

export async function triageTicket(
  ticketId: string,
  traceId = uuid(),
  idempotencyKey?: string
) {
  const now = new Date();

  try {
    // STEP 1: Fetch Ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new Error("Ticket not found");

    await AuditLog.create({
      ticketId,
      traceId,
      actor: "system",
      action: "TRIAGE_START",
      meta: { idempotencyKey },
      timestamp: now,
    });

    // STEP 2: CLASSIFY
    const classification = await classify(
      `${ticket.title} ${ticket.description}`
    );
    await AuditLog.create({
      ticketId,
      traceId,
      actor: "system",
      action: "AGENT_CLASSIFIED",
      meta: classification,
      timestamp: new Date(),
    });

    // STEP 3: RETRIEVE KB ARTICLES
    const articles = await retrieveTopArticles(
      ticket.description || ticket.title
    );
    await AuditLog.create({
      ticketId,
      traceId,
      actor: "system",
      action: "KB_RETRIEVED",
      meta: { articleIds: articles.map((a) => a._id) },
      timestamp: new Date(),
    });

    // STEP 4: GENERATE DRAFT REPLY
    const draft = await draftReply(
      ticket.title,
      articles.map((a) => a.title)
    );
    await AuditLog.create({
      ticketId,
      traceId,
      actor: "system",
      action: "DRAFT_GENERATED",
      meta: { draftReply: draft.draftReply },
      timestamp: new Date(),
    });

    // STEP 5: DECISION (Auto-close or human)
    const config = (await Config.findOne()) || (await Config.create({}));
    const threshold = config.confidenceThreshold ?? 0.78;
    const autoClose =
      (config.autoCloseEnabled ?? true) &&
      classification.confidence >= threshold;

    // STEP 6: SAVE AGENT SUGGESTION
    const suggestion = await AgentSuggestion.create({
      ticketId: ticket._id,
      predictedCategory: classification.predictedCategory,
      articleIds: articles.map((a) => a._id),
      draftReply: draft.draftReply,
      confidence: classification.confidence,
      autoClosed: autoClose,
      modelInfo: classification.modelInfo,
    });

    // Logging in dev mode
    if (process.env.NODE_ENV !== "production") {
      console.log("classification →", classification);
      console.log("retrieved articles →", articles);
      console.log("draft reply →", draft);
    }

    // STEP 7: Update Ticket
    ticket.category = classification.predictedCategory as any;
    ticket.agentSuggestionId = suggestion._id;
    ticket.status = autoClose ? "resolved" : "waiting_human";
    await ticket.save();

    // STEP 8: Log Final Decision
    await AuditLog.create({
      ticketId,
      traceId,
      actor: "system",
      action: autoClose ? "AUTO_CLOSED" : "ASSIGNED_TO_HUMAN",
      meta: { suggestionId: suggestion._id },
      timestamp: new Date(),
    });

    await AuditLog.create({
      ticketId,
      traceId,
      actor: "system",
      action: "TRIAGE_END",
      meta: {},
      timestamp: new Date(),
    });

    return {
      ticket,
      suggestion,
      classification,
      articles,
      draft,
      autoClose,
    };
  } catch (error: any) {
    console.error("❌ Triage failed:", error);

    await AuditLog.create({
      ticketId,
      traceId,
      actor: "system",
      action: "TRIAGE_FAILED",
      meta: { error: error.message },
      timestamp: new Date(),
    });

    throw error;
  }
}
