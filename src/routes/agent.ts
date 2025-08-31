import { Router } from "express";
import { auth, role } from "../middleware/auth.js";
import { triageTicket } from "../agent/triage.js";
import { v4 as uuid } from "uuid";

export const router = Router();

router.post("/triage", auth(), async (req, res, next) => {
  try {
    const { ticketId, idempotencyKey } = req.body as {
      ticketId: string;
      idempotencyKey?: string;
    };
    const traceId = uuid();
    await triageTicket(ticketId, traceId, idempotencyKey);
    res.status(202).json({ ok: true, traceId });
  } catch (e) {
    next(e);
  }
});

router.get("/suggestion/:ticketId", auth(), async (req, res, next) => {
  try {
    const { AgentSuggestion } = await import("../models/AgentSuggestion.js");

    const s = await AgentSuggestion.findOne({ ticketId: req.params.ticketId })
      .sort({ createdAt: -1 })
      .populate("articleIds", "title")
      .lean();

    res.json(s);
  } catch (e) {
    next(e);
  }
});

router.put(
  "/suggestion/:id",
  auth(),
  role("agent", "admin"),
  async (req, res, next) => {
    try {
      const { AgentSuggestion } = await import("../models/AgentSuggestion.js");

      const { draftReply, articleIds } = req.body;

      const updated = await AgentSuggestion.findByIdAndUpdate(
        req.params.id,
        {
          ...(draftReply && { draftReply }),
          ...(articleIds && { articleIds }),
        },
        { new: true }
      )
        .populate("articleIds", "title")
        .lean();

      if (!updated) {
        return res.status(404).json({ error: "Suggestion not found" });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);
