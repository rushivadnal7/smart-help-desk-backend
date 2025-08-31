import { Router } from "express";
import { z } from "zod";
import { auth, role } from "../middleware/auth.js";
import { Ticket } from "../models/Ticket.js";
import { createTicket } from "../services/tickets.service.js";
import { AgentSuggestion } from "../models/AgentSuggestion.js";
import { AuditLog } from "../models/AuditLog.js";

export const router = Router();

router.post("/", auth(), async (req: any, res, next) => {
  try {
    const body = z
      .object({
        title: z.string().min(3),
        description: z.string().min(3),
        category: z.enum(["billing", "tech", "shipping", "other"]).optional(),
      })
      .parse(req.body);
    const t = await createTicket({ ...body, createdBy: req.user!._id });
    res.status(201).json(t);
  } catch (e) {
    next(e);
  }
});

router.get("/", auth(), async (req: any, res, next) => {
  try {
    const status = (req.query.status as any) || undefined;
    const mine = req.query.mine === "true";
    const q: any = {};
    if (status) q.status = status;
    if (mine) q.createdBy = req.user!._id;
    const docs = await Ticket.find(q).sort({ updatedAt: -1 }).lean();
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", auth(), async (req, res, next) => {
  try {
    const t = await Ticket.findById(req.params.id).lean();
    if (!t) return res.status(404).json({ error: "Not found" });
    const suggestion = t.agentSuggestionId
      ? await AgentSuggestion.findById(t.agentSuggestionId).lean()
      : null;
    const audit = await AuditLog.find({ ticketId: t._id })
      .sort({ timestamp: 1 })
      .lean();
    res.json({ ticket: t, agentSuggestion: suggestion, audit });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/:id/reply",
  auth(),
  role("agent", "admin"),
  async (req, res, next) => { 
    try {
      const body = z
        .object({
          message: z.string().min(1),
          close: z.boolean().optional(),
          reopen: z.boolean().optional(),
        })
        .parse(req.body);
      const t = await Ticket.findById(req.params.id);
      if (!t) return res.status(404).json({ error: "Not found" });
      if (body.reopen) t.status = "open";
      if (body.close) t.status = "closed";
      await t.save();
      await AuditLog.create({
        ticketId: t._id,
        traceId: `manual-${t._id}`,
        actor: "agent",
        action: "REPLY_SENT",
        meta: { message: body.message },
        timestamp: new Date(),
      });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/:id/assign",
  auth(),
  role("agent", "admin"),
  async (req, res, next) => {
    try {
      const body = z.object({ assigneeId: z.string() }).parse(req.body);
      const t = await Ticket.findByIdAndUpdate(
        req.params.id,
        { assignee: body.assigneeId },
        { new: true }
      );
      res.json(t);
    } catch (e) {
      next(e);
    }
  }
);
