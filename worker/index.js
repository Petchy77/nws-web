const SESSION_COOKIE = "nws_prelaunch_session";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const COMPANY_EMAIL = /^[^\s@]+@nwsthai\.com$/i;

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};

async function handleRequest(request, env) {
  const url = new URL(request.url);

  // Keep one canonical origin so the access cookie and redirects work the same
  // whether visitors type the apex domain or the www variant.
  if (url.hostname.toLowerCase() === "www.nwsthai.com") {
    url.hostname = "nwsthai.com";
    return Response.redirect(url.toString(), 308);
  }

  if (url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }

  if (url.pathname === "/__nws-access/logout") {
    return redirectTo("/", clearSessionCookie());
  }

  if (url.pathname === "/__nws-access/login" && request.method === "POST") {
    return login(request, env);
  }

  if (url.pathname === "/__nws-access/login") {
    return redirectTo("/");
  }

  const isAuthenticated = await hasValidSession(request, env.GATE_PASSWORD);
  if (!isAuthenticated) {
    return loginPage("", url.pathname + url.search);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: secureHeaders() });
  }

  return serveAsset(url.pathname, request.method, env);
}

async function login(request, env) {
  if (!env.GATE_PASSWORD) {
    return new Response("Gate configuration is unavailable.", {
      status: 500,
      headers: secureHeaders(),
    });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return loginPage("ส่งข้อมูลเข้าสู่ระบบไม่ถูกต้อง", "/", 400);
  }

  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const returnTo = safeReturnTo(String(form.get("returnTo") || "/"));

  const validEmail = COMPANY_EMAIL.test(email);
  const validPassword = await safeEqual(password, env.GATE_PASSWORD);
  if (!validEmail || !validPassword) {
    return loginPage("อีเมลบริษัทหรือรหัสผ่านไม่ถูกต้อง", returnTo, 401);
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const value = `v1.${expiresAt}`;
  const signature = await sign(value, env.GATE_PASSWORD);

  return redirectTo(returnTo, sessionCookie(`${value}.${signature}`));
}

async function hasValidSession(request, password) {
  if (!password) return false;

  const session = getCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (!session) return false;

  const parts = session.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;

  const expiresAt = Number(parts[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = await sign(`${parts[0]}.${parts[1]}`, password);
  return safeEqual(parts[2], expected);
}

async function serveAsset(pathname, method, env) {
  if (!env.SITE_BUCKET) {
    return new Response("Website storage is not configured.", {
      status: 500,
      headers: secureHeaders(),
    });
  }

  const key = toObjectKey(pathname);
  if (!key) {
    return new Response("Bad request", { status: 400, headers: secureHeaders() });
  }

  const object = await env.SITE_BUCKET.get(key);
  if (!object) {
    return new Response("Not found", { status: 404, headers: secureHeaders() });
  }

  const headers = secureHeaders();
  object.writeHttpMetadata(headers);
  headers.set("content-type", headers.get("content-type") || contentType(key));
  headers.set("cache-control", "private, no-store, max-age=0");
  headers.set("etag", object.httpEtag);

  return new Response(method === "HEAD" ? null : object.body, {
    status: 200,
    headers,
  });
}

function toObjectKey(pathname) {
  let path;
  try {
    path = decodeURIComponent(pathname).replace(/^\/+/, "");
  } catch {
    return null;
  }

  if (!path) return "index.html";
  if (path.includes("..") || path.includes("\\")) return null;
  if (path.endsWith("/")) return `${path}index.html`;
  if (!path.includes(".")) return `${path}/index.html`;
  return path;
}

function contentType(path) {
  const extension = path.split(".").pop().toLowerCase();
  const types = {
    css: "text/css; charset=utf-8",
    gif: "image/gif",
    html: "text/html; charset=utf-8",
    ico: "image/x-icon",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "text/javascript; charset=utf-8",
    json: "application/json; charset=utf-8",
    png: "image/png",
    svg: "image/svg+xml",
    txt: "text/plain; charset=utf-8",
    webp: "image/webp",
    xml: "application/xml; charset=utf-8",
  };
  return types[extension] || "application/octet-stream";
}

function loginPage(error, returnTo, status = 200) {
  const errorMarkup = error
    ? `<p class="error" role="alert">${escapeHtml(error)}</p>`
    : "";

  const headers = secureHeaders();
  headers.set("content-type", "text/html; charset=utf-8");

  return new Response(
    `<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <title>Pre-launch access · New World Solutions</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { align-items:center; background:radial-gradient(circle at 15% 12%,rgba(0,220,230,.15),transparent 27rem),radial-gradient(circle at 86% 86%,rgba(37,99,235,.14),transparent 28rem),#071426; color:#e7f8fb; display:flex; font-family:Arial,sans-serif; justify-content:center; margin:0; min-height:100dvh; padding:24px; }
      main { background:linear-gradient(145deg,rgba(17,36,62,.96),rgba(7,18,35,.98)); border:1px solid rgba(72,174,199,.35); box-shadow:0 28px 72px rgba(0,0,0,.46); max-width:500px; padding:40px; position:relative; width:100%; }
      main::before { background:#00dce6; content:""; height:2px; left:0; position:absolute; top:0; width:96px; }
      .brand { align-items:center; display:flex; font-size:.82rem; font-weight:700; gap:11px; letter-spacing:.02em; margin-bottom:34px; }
      .mark { align-items:center; background:#00dce6; color:#062132; display:flex; font-size:1.1rem; height:38px; justify-content:center; width:38px; }
      .label { color:#00dce6; font:600 .67rem ui-monospace,monospace; letter-spacing:.1em; margin:0 0 10px; }
      h1 { font-size:clamp(1.7rem,5vw,2.35rem); letter-spacing:-.045em; line-height:1.1; margin:0; }
      .copy { color:#9cb8c3; line-height:1.65; margin:14px 0 28px; }
      form { display:grid; gap:16px; }
      label { color:#bfd7df; display:grid; font:.67rem ui-monospace,monospace; gap:7px; letter-spacing:.07em; }
      input { background:rgba(4,14,29,.7); border:1px solid rgba(108,169,184,.4); border-radius:0; color:#f4fcff; font:1rem Arial,sans-serif; min-height:48px; outline:0; padding:0 14px; }
      input:focus { border-color:#00dce6; box-shadow:0 0 0 3px rgba(0,220,230,.16); }
      button { background:#00dce6; border:1px solid #00dce6; color:#062132; cursor:pointer; font:700 .75rem ui-monospace,monospace; min-height:48px; padding:0 18px; }
      button:hover { background:#82f7ff; border-color:#82f7ff; }
      .error { color:#ffaaa3; font-size:.9rem; line-height:1.45; margin:0; }
      footer { border-top:1px solid rgba(108,169,184,.18); color:#7d9fae; font:.63rem ui-monospace,monospace; letter-spacing:.03em; line-height:1.55; margin-top:26px; padding-top:16px; }
      @media (max-width:460px) { main { padding:28px 22px; } }
    </style>
  </head>
  <body>
    <main>
      <div class="brand"><span class="mark">N</span><span>NEW WORLD SOLUTIONS</span></div>
      <p class="label">ACCESS RESTRICTED · PRE-LAUNCH</p>
      <h1>เว็บไซต์อยู่ระหว่างเตรียมเปิดใช้งาน</h1>
      <p class="copy">หน้านี้เปิดให้ทีมงาน New World Solutions ใช้ตรวจสอบก่อนเปิดให้บริการสาธารณะ</p>
      <form method="post" action="/__nws-access/login" novalidate>
        <input type="hidden" name="returnTo" value="${escapeHtml(safeReturnTo(returnTo))}">
        <label>อีเมลบริษัท<input name="email" type="email" inputmode="email" autocomplete="username" placeholder="name@nwsthai.com" required></label>
        <label>รหัสผ่านชั่วคราว<input name="password" type="password" autocomplete="current-password" required></label>
        ${errorMarkup}
        <button type="submit">เข้าสู่พื้นที่ทดสอบ</button>
      </form>
      <footer>ALLOWED EMAIL DOMAIN: @nwsthai.com · SESSION EXPIRES AFTER 8 HOURS</footer>
    </main>
  </body>
</html>`,
    { status, headers }
  );
}

function sessionCookie(value) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function redirectTo(path, cookie) {
  const headers = secureHeaders();
  headers.set("location", safeReturnTo(path));
  if (cookie) headers.append("set-cookie", cookie);
  return new Response(null, { status: 303, headers });
}

function secureHeaders() {
  return new Headers({
    "cache-control": "no-store, max-age=0",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-robots-tag": "noindex, nofollow, noarchive",
  });
}

function getCookie(header, name) {
  if (!header) return null;
  const encodedName = `${name}=`;
  for (const part of header.split(";")) {
    const value = part.trim();
    if (value.startsWith(encodedName)) return value.slice(encodedName.length);
  }
  return null;
}

function safeReturnTo(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /%2f|%5c/i.test(value) ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return "/";
  }

  try {
    const parsed = new URL(value, "https://nws-gate.invalid");
    return parsed.origin === "https://nws-gate.invalid"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : "/";
  } catch {
    return "/";
  }
}

async function safeEqual(left, right) {
  const encoder = new TextEncoder();
  const leftHash = new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(String(left)))
  );
  const rightHash = new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(String(right)))
  );

  let result = String(left).length === String(right).length ? 0 : 1;
  for (let index = 0; index < leftHash.length; index += 1) {
    result |= leftHash[index] ^ rightHash[index];
  }
  return result === 0;
}

async function sign(value, password) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
