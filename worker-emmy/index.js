// EMMY — website AI assistant for nwsthai.com
// Cloudflare Worker that proxies chat requests to OpenRouter (OpenAI-compatible API).
// The API key lives only here (secret OPENROUTER_API_KEY), never in the browser.

const ALLOWED_ORIGINS = [
  "https://nwsthai.com",
  "https://www.nwsthai.com",
  "http://localhost:4173",
];
const MAX_MESSAGES = 12; // conversation turns kept per request
const MAX_CHARS = 1000; // per user message
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5"; // override with EMMY_MODEL var

const KNOWLEDGE = `
# New World Solutions Co., Ltd. (NWS) — บริษัท นิว เวิลด์ โซลูชั่นส์ จำกัด
Website: https://nwsthai.com/
B2B technology partner: Intelligent ERP, Managed IT, and AI — backed by 30+ years of expertise in semiconductor and high-tech manufacturing.

## History
- 1991 Founded: semiconductor hardware and test engineering.
- 2000s: industrial automation and systems integration.
- 2010s: enterprise ERP and IT services for B2B.
- Today: Ora One, B2B Managed IT, AI & Machine Learning, and custom AI applications.
Mission: elevate B2B business management into the digital era with practical technology. Values: reliability (reduce human error), results (measurable ROI).

## Services
1. Ora One — Intelligent ERP (https://www.oraonethai.com/)
   End-to-end B2B ERP: quotations, invoices, customers, inventory, purchasing, accounting & tax, reports, real-time dashboard.
   Features EMMY AI Assistant (guides users, automates routine tasks), Mart Integration (commerce + inventory data), low-tech error prevention, real-time visibility.
   App support: support@oraonethai.com
2. B2B Managed IT Service (MSP)
   Highly experienced specialists across disciplines, deep understanding of shop-floor operations, coordinate with production units for flawless execution and zero customer incidents.
   Roles: AI & ML Developer, IT Architect, EMAP Expert (wafer die-level map data), MES Specialist, Software Tester, Project Manager, Field Service Engineer. 24/7 managed IT support.
3. AI & Machine Learning Solutions
   Shop-floor data analytics, AI visual inspection (real-time part/defect detection on production lines), predictive risk models, measurable results.
4. Custom AI Applications
   AI apps staff and customers use daily: conversational & voice AI (chatbots, voice assistants, avatars), knowledge assistant over company documents, document AI (invoices, POs, contracts), workflow automation & integration with ERP, LINE, mobile apps. Concept → development → integration → support.

## Why NWS
Deep industry expertise (30+ years semiconductor & high-tech), practical AI with tangible results, customized OPEX pricing model to reduce upfront CAPEX. Free initial consultation.

## Contact
Email: support@nwsthai.com
Phone: +66 (0) 98 317 9733
Address: 29/55 Tara Ville, Khlong 5, Khlong Luang District, Pathum Thani, Thailand
Business hours: Monday–Friday 9:00–18:00 (GMT+7)
Contact form: https://nwsthai.com/contact/
`;

const SYSTEM = `You are EMMY (เอ็มมี่), the friendly AI assistant on the New World Solutions (NWS) website.

How to respond:
- Reply in the same language the visitor writes in (Thai or English). In Thai, speak politely as a woman (use ค่ะ/คะ).
- Keep answers short: 2–5 sentences or a few bullets. Plain text with simple line breaks; no markdown headings or tables.
- Only use the company information below. If something is not covered (pricing, timelines, specific client names, technical guarantees), say you don't have that detail and invite the visitor to contact the team for a free consultation.
- Never invent prices, client names, certifications, or statistics.
- When a visitor shows interest in a project, suggest the contact page or email support@nwsthai.com, and offer to note what they need.
- Politely decline topics unrelated to NWS and its services, and steer back to how NWS can help.

Company information:
${KNOWLEDGE}`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true }, 200, cors);
    if (url.pathname !== "/api/chat" || request.method !== "POST") {
      return json({ error: "not_found" }, 404, cors);
    }
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "forbidden_origin" }, 403, cors);
    if (!env.OPENROUTER_API_KEY) return json({ error: "not_configured" }, 503, cors);

    // Optional per-IP rate limit (Cloudflare Rate Limiting binding, see wrangler.toml).
    if (env.RATE_LIMITER) {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return json({ error: "rate_limited" }, 429, cors);
    }

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad_json" }, 400, cors); }

    const messages = sanitize(body && body.messages);
    if (!messages) return json({ error: "bad_messages" }, 400, cors);

    const lang = body.lang === "en" ? "en" : "th";
    const system = SYSTEM + `\nThe visitor is currently viewing the site in ${lang === "en" ? "English" : "Thai"}.`;
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://nwsthai.com/",
        "X-Title": "NWS EMMY",
      },
      body: JSON.stringify({
        model: env.EMMY_MODEL || DEFAULT_MODEL,
        max_tokens: 600,
        temperature: 0.4,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (!upstream.ok) {
      console.log("openrouter error", upstream.status, await upstream.text());
      return json({ error: "upstream_error" }, 502, cors);
    }
    const data = await upstream.json();
    const reply = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "").trim();
    if (!reply) return json({ error: "empty_reply" }, 502, cors);
    return json({ reply }, 200, cors);
  },
};

function sanitize(input) {
  if (!Array.isArray(input) || input.length === 0) return null;
  const out = [];
  for (const m of input.slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    const content = m.content.trim().slice(0, MAX_CHARS);
    if (!content) continue;
    out.push({ role: m.role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user") return null;
  return out;
}

function corsHeaders(origin) {
  const h = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (ALLOWED_ORIGINS.includes(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...headers, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
