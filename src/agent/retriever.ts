import { Article } from "../models/Article.js";

export async function retrieveTopArticles(query: string, limit = 3) {
  const regex = new RegExp(query.split(/\s+/).join("|"), "i");

  let docs = await Article.find({
    $or: [{ title: regex }, { body: regex }, { tags: regex }],
    status: "published",
  })
    .limit(limit)
    .lean();

  // fallback: if no match, return top published articles
  if (docs.length === 0) {
    docs = await Article.find({ status: "published" }).limit(limit).lean();
  }

  return docs;
}
