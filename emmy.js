/* EMMY — AI assistant widget for nwsthai.com
 * Talks to the nws-emmy Cloudflare Worker (see /worker-emmy).
 * The widget stays hidden until EMMY_ENDPOINT is set.
 */
(function () {
  "use strict";

  // Set to the deployed Worker URL, e.g. "https://nws-emmy.<subdomain>.workers.dev/api/chat"
  var EMMY_ENDPOINT = "";
  // Local testing: allow ?emmy=<url> override on localhost only.
  try {
    var q = new URLSearchParams(location.search).get("emmy");
    if (q && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) EMMY_ENDPOINT = q;
  } catch (e) {}
  if (!EMMY_ENDPOINT) return;

  var T = {
    th: {
      open: "ถาม EMMY",
      title: "EMMY",
      sub: "ผู้ช่วย AI ของ NWS",
      hello: "สวัสดีค่ะ เอ็มมี่เองค่ะ 👋 ถามเรื่องบริการของ NWS ได้เลย ทั้ง Ora One, Managed IT, AI หรือการติดต่อทีมงานค่ะ",
      chips: ["Ora One คืออะไร", "รับทำแอป AI แบบไหนบ้าง", "ขอคำปรึกษาฟรีได้ไหม"],
      ph: "พิมพ์คำถาม…",
      send: "ส่ง",
      note: "EMMY เป็น AI อาจตอบคลาดเคลื่อนได้ โปรดยืนยันกับทีมงาน",
      err: "ขออภัยค่ะ ตอนนี้เอ็มมี่ตอบไม่ได้ ติดต่อทีมงานได้ที่ support@nwsthai.com หรือโทร 098 317 9733 ค่ะ",
      busy: "มีคำถามเข้ามาเยอะ รอสักครู่แล้วลองใหม่นะคะ",
      close: "ปิด",
    },
    en: {
      open: "Ask EMMY",
      title: "EMMY",
      sub: "NWS AI assistant",
      hello: "Hi, I'm EMMY 👋 Ask me anything about NWS: Ora One, Managed IT, AI services, or how to reach our team.",
      chips: ["What is Ora One?", "What AI apps do you build?", "Can I get a free consultation?"],
      ph: "Type your question…",
      send: "Send",
      note: "EMMY is an AI and may make mistakes. Please confirm details with our team.",
      err: "Sorry, I can't answer right now. Please contact support@nwsthai.com or call +66 98 317 9733.",
      busy: "I'm getting a lot of questions. Please try again in a moment.",
      close: "Close",
    },
  };

  var root = document.documentElement;
  function lang() { return root.classList.contains("lang-en") ? "en" : "th"; }

  var history = [];
  var busy = false;

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  var wrap = document.createElement("div");
  wrap.className = "emmy";
  wrap.innerHTML =
    '<button type="button" class="emmy-fab" aria-expanded="false"><span class="emmy-orb"></span><span class="emmy-fab-label"></span><span class="emmy-live"></span></button>' +
    '<section class="emmy-panel" role="dialog" aria-modal="false" hidden>' +
    '  <header class="emmy-head"><span class="emmy-orb lg"></span><div><b class="emmy-title"></b><small class="emmy-sub"></small></div>' +
    '    <button type="button" class="emmy-close">' + ICON_X + "</button></header>" +
    '  <div class="emmy-log" aria-live="polite"></div>' +
    '  <div class="emmy-chips"></div>' +
    '  <form class="emmy-form"><input class="emmy-input" maxlength="1000" autocomplete="off"><button class="emmy-send" type="submit">' + ICON_SEND + "</button></form>" +
    '  <p class="emmy-note"></p>' +
    "</section>";
  document.body.appendChild(wrap);

  var fab = wrap.querySelector(".emmy-fab");
  var panel = wrap.querySelector(".emmy-panel");
  var log = wrap.querySelector(".emmy-log");
  var chips = wrap.querySelector(".emmy-chips");
  var form = wrap.querySelector(".emmy-form");
  var input = wrap.querySelector(".emmy-input");

  function applyLang() {
    var t = T[lang()];
    wrap.querySelector(".emmy-fab-label").textContent = t.open;
    wrap.querySelector(".emmy-title").textContent = t.title;
    wrap.querySelector(".emmy-sub").textContent = t.sub;
    wrap.querySelector(".emmy-note").textContent = t.note;
    wrap.querySelector(".emmy-close").setAttribute("aria-label", t.close);
    wrap.querySelector(".emmy-send").setAttribute("aria-label", t.send);
    panel.setAttribute("aria-label", t.title + " — " + t.sub);
    input.placeholder = t.ph;
    if (!history.length) renderIntro();
  }

  function renderIntro() {
    var t = T[lang()];
    log.innerHTML = "";
    addMsg("bot", t.hello);
    chips.innerHTML = "";
    t.chips.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = c;
      b.addEventListener("click", function () { ask(c); });
      chips.appendChild(b);
    });
    chips.hidden = false;
  }

  function addMsg(who, text) {
    var d = document.createElement("div");
    d.className = "emmy-msg " + who;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function setOpen(open) {
    panel.hidden = !open;
    fab.hidden = open;
    fab.setAttribute("aria-expanded", String(open));
    if (open) setTimeout(function () { input.focus(); }, 50);
  }

  function ask(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    chips.hidden = true;
    addMsg("user", text);
    history.push({ role: "user", content: text });
    input.value = "";
    var typing = addMsg("bot typing", "");
    typing.innerHTML = "<i></i><i></i><i></i>";

    fetch(EMMY_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-12), lang: lang() }),
    })
      .then(function (r) {
        if (r.status === 429) throw new Error("busy");
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      })
      .then(function (data) {
        typing.remove();
        var reply = (data && data.reply) || T[lang()].err;
        addMsg("bot", reply);
        history.push({ role: "assistant", content: reply });
      })
      .catch(function (e) {
        typing.remove();
        history.pop();
        addMsg("bot err", e && e.message === "busy" ? T[lang()].busy : T[lang()].err);
      })
      .finally(function () { busy = false; });
  }

  fab.addEventListener("click", function () { setOpen(true); });
  wrap.querySelector(".emmy-close").addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) setOpen(false); });
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });

  new MutationObserver(applyLang).observe(root, { attributes: true, attributeFilter: ["class"] });
  applyLang();
})();
