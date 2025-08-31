export async function classify(text: string) {
const rules: Record<string, RegExp> = {
billing: /(refund|invoice|payment|charge|card)/i,
tech: /(error|bug|stack|500|login|auth|crash)/i,
shipping: /(delivery|shipment|tracking|package|courier)/i
};
const counts = Object.entries(rules).map(([k, r]) => [k, (text.match(r) || []).length] as const);
counts.sort((a, b) => b[1] - a[1]);
const top = counts[0];
const predicted = top && top[1] > 0 ? (top[0] as 'billing' | 'tech' | 'shipping') : 'other';
const hits = top ? top[1] : 0;
const confidence = Math.min(1, 0.5 + 0.25 * hits);
return { predictedCategory: predicted as 'billing' | 'tech' | 'shipping' | 'other', confidence, modelInfo: { provider: 'stub', model: 'heuristic-v1', promptVersion: '1' } };
}


export async function draftReply(ticketTitle: string, articleTitles: string[]) {
const numbered = articleTitles.map((t, i) => `${i + 1}) ${t}`).join('\n ');
const body = `Hi there,\n\nThanks for reaching out about "${ticketTitle}". Based on our knowledge base:\n ${numbered}\n\nHere’s what to do next: please review the above articles and follow the steps. If this doesn't solve it, reply to this ticket and a human agent will assist you.\n\n— Smart Helpdesk`;
return { draftReply: body };
}