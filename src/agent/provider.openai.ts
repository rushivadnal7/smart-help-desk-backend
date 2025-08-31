// src/agent/provider.openai.ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function classify(text: string) {
  const resp = await client.chat.completions.create({
    model: "gpt-3.5-turbo",  // or free tier model
    messages: [{ role: "system", content: "Classify ticket into billing, tech, shipping, or other." },
               { role: "user", content: text }]
  });

  const content = resp.choices[0].message?.content?.toLowerCase() ?? "other";
  // simple parse
  let category: "billing" | "tech" | "shipping" | "other" = "other";
  if (content.includes("billing")) category = "billing";
  else if (content.includes("tech")) category = "tech";
  else if (content.includes("shipping")) category = "shipping";

  return {
    predictedCategory: category,
    confidence: 0.9, // you can parse if API returns probability
    modelInfo: { provider: "openai", model: "gpt-3.5-turbo", promptVersion: "1" }
  };
}

export async function draftReply(ticketTitle: string, articleTitles: string[]) {
  const articles = articleTitles.map((a, i) => `${i + 1}. ${a}`).join("\n");
  const resp = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Write a polite support draft reply for the customer." },
      { role: "user", content: `Ticket: ${ticketTitle}\nArticles:\n${articles}` }
    ]
  });

  return { draftReply: resp.choices[0].message?.content ?? "" };
}
