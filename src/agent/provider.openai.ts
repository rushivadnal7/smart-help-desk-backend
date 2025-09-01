// src/agent/provider.openai.ts
import OpenAI from "openai";
import { Article } from "../models/Article";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function classify(text: string) {
  const resp = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Classify ticket into billing, tech, shipping, or other." },
      { role: "user", content: text },
    ],
  });

  const content = resp.choices[0].message?.content?.toLowerCase() ?? "other";
  let category: "billing" | "tech" | "shipping" | "other" = "other";
  if (content.includes("billing")) category = "billing";
  else if (content.includes("tech")) category = "tech";
  else if (content.includes("shipping")) category = "shipping";

  return {
    predictedCategory: category,
    confidence: 0.9,
    modelInfo: { provider: "openai", model: "gpt-3.5-turbo", promptVersion: "1" },
  };
}

export async function draftReply(ticketTitle: string, articleIds: string[]) {
  // 1. Fetch article details
  const articles = await Article.find({ _id: { $in: articleIds }, status: "published" })
    .select("title body")
    .lean();

  const formattedArticles = articles
    .map((a, i) => `${i + 1}. ${a.title}\n${a.body}`)
    .join("\n\n");

  // 2. Generate AI draft reply
  const resp = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful support agent. Use ONLY the provided articles to create a detailed, step-by-step draft reply for the customer. Do not invent solutions.",
      },
      {
        role: "user",
        content: `Ticket: ${ticketTitle}\n\nRelevant Articles:\n${formattedArticles}`,
      },
    ],
  });

  // 3. Return old + new data (no breaking changes)
  return {
    draftReply: resp.choices[0].message?.content ?? "",
    usedArticles: articles.map(a => ({ id: a._id, title: a.title })), // new
    fullArticles: articles, // new (includes body if frontend ever needs it)
  };
}
