import { Article } from '../models/Article.js';


export async function searchKB(query?: string, status?: 'draft' | 'published') {
const q: any = {};
if (status) q.status = status;
if (query) {
const r = new RegExp(query, 'i');
q.$or = [{ title: r }, { body: r }, { tags: r }];
}
return Article.find(q).sort({ updatedAt: -1 }).lean();
}