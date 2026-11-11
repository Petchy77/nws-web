/* EMMY — assistant widget for nwsthai.com
 *
 * 1. Answers from the built-in FAQ first (free, never goes off-topic).
 * 2. If no FAQ entry matches and EMMY_ENDPOINT is set, asks the AI Worker (/worker-emmy).
 * 3. Visitors who want to talk to the team get a short form that hands off to support@nwsthai.com.
 */
(function () {
  "use strict";

  // AI Worker URL, e.g. "https://nws-emmy.<subdomain>.workers.dev/api/chat". Empty = FAQ only.
  var EMMY_ENDPOINT = "";
  var CONTACT_EMAIL = "support@nwsthai.com";
  try {
    var q = new URLSearchParams(location.search).get("emmy");
    if (q && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) EMMY_ENDPOINT = q;
  } catch (e) {}

  /* ------------------------------------------------------------------ */
  /* FAQ — edit here. `k` = keywords (Thai matched as substrings,        */
  /* English as whole words). `contact: true` also shows the handoff.    */
  /* ------------------------------------------------------------------ */
  var FAQ = [
    {
      id: "hello",
      k: { th: ["สวัสดี", "หวัดดี", "ดีค่ะ", "ดีครับ"], en: ["hi", "hello", "hey", "good morning", "good afternoon"] },
      a: {
        th: "สวัสดีค่ะ 😊 มีอะไรให้เอ็มมี่ช่วยเกี่ยวกับบริการของ NWS ไหมคะ",
        en: "Hello! 😊 How can I help you with NWS services today?",
      },
      weak: true,
    },
    {
      id: "ora-one",
      k: { th: ["ora one", "oraone", "ออร่า", "erp", "ใบแจ้งหนี้", "ใบเสนอราคาในระบบ", "สต็อก", "สินค้าคงคลัง", "ระบบบัญชี"], en: ["ora one", "oraone", "erp", "inventory", "invoicing", "accounting"] },
      a: {
        th: "Ora One คือระบบ Intelligent ERP สำหรับธุรกิจ B2B ค่ะ ครอบคลุมใบเสนอราคา ใบแจ้งหนี้ ลูกค้า สินค้าคงคลัง จัดซื้อ บัญชีและภาษี และรายงาน มีผู้ช่วย EMMY AI ช่วยแนะนำและทำงานซ้ำอัตโนมัติ พร้อม Mart Integration และแดชบอร์ดแบบเรียลไทม์ค่ะ",
        en: "Ora One is our Intelligent ERP for B2B businesses. It covers quotations, invoices, customers, inventory, purchasing, accounting & tax, and reports, with the EMMY AI Assistant, Mart Integration, and a real-time dashboard.",
      },
      link: { href: "https://www.oraonethai.com/", th: "ดูเว็บไซต์ Ora One", en: "Visit the Ora One website" },
    },
    {
      id: "ora-support",
      k: { th: ["ใช้งาน ora", "ใช้ไม่ได้", "เข้าไม่ได้", "ซัพพอร์ต", "ล็อกอิน", "เข้าระบบ", "ลืมรหัส", "บั๊ก", "error", "แจ้งปัญหา"], en: ["support", "login", "log in", "password", "error", "bug", "not working"] },
      boost: 2,
      a: {
        th: "ถ้าใช้งาน Ora One แล้วติดปัญหา ติดต่อทีมซัพพอร์ตได้ที่ support@oraonethai.com ค่ะ แจ้งชื่อบริษัทและอาการที่พบ ทีมงานจะช่วยตรวจสอบให้ค่ะ",
        en: "For help using Ora One, please email our app support team at support@oraonethai.com with your company name and a short description of the issue.",
      },
      link: { href: "mailto:support@oraonethai.com", th: "อีเมล support@oraonethai.com", en: "Email support@oraonethai.com" },
    },
    {
      id: "msp",
      k: { th: ["managed it", "msp", "ไอทีเอาท์ซอร์ส", "เอาท์ซอร์ส", "outsource", "ดูแลระบบ", "ทีมไอที", "mes", "emap", "field service", "วิศวกร", "project manager", "tester"], en: ["managed it", "msp", "outsourcing", "outsource", "it support", "it team", "mes", "emap", "field service", "engineer", "project manager", "tester"] },
      a: {
        th: "B2B Managed IT Service (MSP) ของเราคือทีมผู้เชี่ยวชาญที่มีประสบการณ์สูงและเข้าใจงานหน้างานการผลิตค่ะ มีทั้ง AI/ML Developer, IT Architect, EMAP Expert, MES Specialist, Software Tester, Project Manager และ Field Service Engineer พร้อมดูแล IT 24/7 ค่ะ",
        en: "Our B2B Managed IT Service (MSP) provides highly experienced specialists who understand shop-floor operations: AI/ML developers, IT architects, EMAP experts, MES specialists, software testers, project managers, and field service engineers, with 24/7 IT support.",
      },
      link: { href: "/solutions/#msp", th: "ดูรายละเอียด MSP", en: "See MSP details" },
    },
    {
      id: "ai-ml",
      k: { th: ["machine learning", "แมชชีนเลิร์นนิง", "วิเคราะห์ข้อมูล", "คาดการณ์", "พยากรณ์", "ตรวจคุณภาพ", "กล้อง", "ตรวจจับ", "ตำหนิ", "visual inspection", "computer vision"], en: ["machine learning", "ml", "analytics", "predictive", "prediction", "forecast", "visual inspection", "computer vision", "camera", "defect", "inspection"] },
      a: {
        th: "AI & Machine Learning Solutions ของเราช่วยวิเคราะห์ข้อมูลหน้างานเชิงลึก ตรวจคุณภาพด้วยกล้อง AI แบบเรียลไทม์บนไลน์ผลิต และสร้างโมเดลคาดการณ์ความเสี่ยง เพื่อให้ตัดสินใจได้แม่นยำและวัดผลได้จริงค่ะ",
        en: "Our AI & Machine Learning Solutions cover shop-floor data analytics, real-time AI visual inspection on production lines, and predictive risk models, for accurate decisions with measurable results.",
      },
      link: { href: "/solutions/#ai", th: "ดู AI & Machine Learning", en: "See AI & Machine Learning" },
    },
    {
      id: "ai-apps",
      k: { th: ["แอป ai", "แอพ ai", "แชทบอท", "chatbot", "บอท", "ผู้ช่วย ai", "สั่งงานด้วยเสียง", "เสียง", "อวตาร", "อ่านเอกสาร", "ocr", "automation", "อัตโนมัติ", "line oa", "พัฒนา ai", "ทำ ai"], en: ["ai app", "ai apps", "ai application", "chatbot", "bot", "voice", "avatar", "document ai", "ocr", "automation", "line oa", "custom ai", "build ai"] },
      a: {
        th: "เรารับพัฒนาแอปพลิเคชัน AI ตามโจทย์ค่ะ เช่น แชทบอทและผู้ช่วยสั่งงานด้วยเสียง ผู้ช่วยความรู้ที่ตอบจากเอกสารในองค์กร AI อ่านใบแจ้งหนี้และใบสั่งซื้อ และระบบอัตโนมัติที่เชื่อมกับ ERP, LINE หรือแอปมือถือ ดูแลตั้งแต่ออกแบบ พัฒนา จนถึงหลังใช้งานจริงค่ะ",
        en: "We build custom AI applications: chatbots and voice assistants, knowledge assistants that answer from your company documents, document AI for invoices and purchase orders, and workflow automation connected to your ERP, LINE, or mobile apps, from design through ongoing support.",
      },
      link: { href: "/solutions/#ai-services", th: "ดู Custom AI Applications", en: "See Custom AI Applications" },
    },
    {
      id: "price",
      k: { th: ["ราคา", "เท่าไหร่", "เท่าไร", "ค่าใช้จ่าย", "งบ", "แพ็กเกจ", "แพคเกจ", "opex", "ค่าบริการ"], en: ["price", "pricing", "cost", "how much", "budget", "package", "opex", "fee", "quote", "quotation"] },
      a: {
        th: "ราคาขึ้นอยู่กับขอบเขตงานของแต่ละองค์กรค่ะ เรามีรูปแบบ OPEX ที่ยืดหยุ่น ช่วยลดภาระการลงทุนก้อนแรก และให้คำปรึกษาเบื้องต้นฟรีค่ะ ฝากข้อมูลไว้ให้ทีมงานติดต่อกลับพร้อมใบเสนอราคาได้เลยค่ะ",
        en: "Pricing depends on each organization's scope. We offer a flexible OPEX model to reduce upfront investment, and the first consultation is free. Leave your details and our team will get back to you with a quote.",
      },
      contact: true,
      boost: 2,
    },
    {
      id: "consult",
      k: { th: ["ปรึกษา", "ติดต่อกลับ", "นัด", "คุยกับทีม", "คุยกับเจ้าหน้าที่", "เซลส์", "ฝ่ายขาย", "สนใจ", "ขอข้อมูลเพิ่ม", "เดโม", "demo"], en: ["consult", "consultation", "call me", "call back", "meeting", "talk to", "sales", "interested", "demo", "contact me"] },
      a: {
        th: "ยินดีเลยค่ะ ทีมผู้เชี่ยวชาญของเราให้คำปรึกษาเบื้องต้นฟรีค่ะ กรอกข้อมูลสั้น ๆ ด้านล่าง แล้วเอ็มมี่จะส่งต่อให้ทีมงานติดต่อกลับค่ะ",
        en: "Happy to help! Our experts offer a free initial consultation. Fill in the short form below and I'll pass it to the team.",
      },
      contact: true,
      boost: 2,
    },
    {
      id: "contact-info",
      k: { th: ["ติดต่อ", "เบอร์", "โทร", "อีเมล", "อีเมล์", "ที่อยู่", "อยู่ที่ไหน", "แผนที่", "เวลาทำการ", "เปิดกี่โมง", "ปิดกี่โมง", "วันหยุด"], en: ["contact", "phone", "call", "email", "address", "location", "where", "office", "hours", "open"] },
      a: {
        th: "ติดต่อ NWS ได้ที่\n📧 support@nwsthai.com\n📞 098 317 9733\n📍 29/55 ธาราวิลล์ คลอง 5 อ.คลองหลวง จ.ปทุมธานี\n🕘 จันทร์–ศุกร์ 9:00–18:00 น.\nหรือฝากข้อมูลให้ทีมงานติดต่อกลับก็ได้ค่ะ",
        en: "You can reach NWS at\n📧 support@nwsthai.com\n📞 +66 (0) 98 317 9733\n📍 29/55 Tara Ville, Khlong 5, Khlong Luang, Pathum Thani\n🕘 Mon–Fri, 9:00–18:00 (GMT+7)\nOr leave your details and we'll get back to you.",
      },
      contact: true,
      boost: 1,
    },
    {
      id: "about",
      k: { th: ["nws คือ", "บริษัท", "เกี่ยวกับ", "ประวัติ", "ก่อตั้ง", "ประสบการณ์", "นิว เวิลด์", "นิวเวิลด์", "ทำอะไร"], en: ["about", "company", "history", "founded", "experience", "who are you", "new world solutions", "what do you do"] },
      a: {
        th: "บริษัท นิว เวิลด์ โซลูชั่นส์ จำกัด (NWS) เป็นพาร์ทเนอร์เทคโนโลยีสำหรับธุรกิจ B2B ค่ะ เริ่มต้นปี 1991 จากงานวิศวกรรมเซมิคอนดักเตอร์ มีประสบการณ์กว่า 30 ปี ปัจจุบันให้บริการ Ora One (Intelligent ERP), B2B Managed IT, AI & Machine Learning และพัฒนาแอปพลิเคชัน AI ค่ะ",
        en: "New World Solutions Co., Ltd. (NWS) is a technology partner for B2B businesses. We started in 1991 in semiconductor engineering and bring 30+ years of experience. Today we offer Ora One (Intelligent ERP), B2B Managed IT, AI & Machine Learning, and custom AI applications.",
      },
      link: { href: "/about/", th: "อ่านเกี่ยวกับเรา", en: "About us" },
    },
    {
      id: "services",
      k: { th: ["บริการ", "มีอะไรบ้าง", "ทำอะไรได้", "โซลูชัน"], en: ["services", "solutions", "what can you do", "offer"] },
      a: {
        th: "NWS มีบริการหลัก 4 กลุ่มค่ะ\n• Ora One — ระบบ Intelligent ERP\n• B2B Managed IT Service (MSP)\n• AI & Machine Learning Solutions\n• พัฒนาแอปพลิเคชัน AI ตามโจทย์\nสนใจเรื่องไหน ถามต่อได้เลยค่ะ",
        en: "NWS offers four main services:\n• Ora One, our Intelligent ERP\n• B2B Managed IT Service (MSP)\n• AI & Machine Learning Solutions\n• Custom AI Applications\nAsk me about any of them!",
      },
      link: { href: "/solutions/", th: "ดูบริการทั้งหมด", en: "See all services" },
      weak: true,
    },
    {
      id: "jobs",
      k: { th: ["สมัครงาน", "รับสมัคร", "ตำแหน่งว่าง", "ฝึกงาน", "งานว่าง"], en: ["job", "jobs", "career", "careers", "hiring", "internship", "vacancy"] },
      a: {
        th: "ขณะนี้เว็บไซต์ยังไม่มีประกาศรับสมัครงานค่ะ ส่งประวัติและตำแหน่งที่สนใจมาที่ support@nwsthai.com ได้เลยค่ะ",
        en: "We don't have job postings on the website right now. Feel free to send your CV and the role you're interested in to support@nwsthai.com.",
      },
      link: { href: "mailto:support@nwsthai.com", th: "อีเมล support@nwsthai.com", en: "Email support@nwsthai.com" },
      boost: 2,
    },
  ];

  var T = {
    th: {
      open: "ถาม EMMY",
      sub: "ผู้ช่วยของ NWS",
      hello: "สวัสดีค่ะ เอ็มมี่เองค่ะ 👋 ถามเรื่องบริการของ NWS ได้เลยค่ะ หรือกด “ติดต่อทีมงาน” เพื่อให้เจ้าหน้าที่ติดต่อกลับค่ะ",
      chips: ["บริการมีอะไรบ้าง", "Ora One คืออะไร", "รับทำแอป AI ไหม", "ราคาเท่าไหร่"],
      contactChip: "📧 ติดต่อทีมงาน",
      ph: "พิมพ์คำถาม…",
      send: "ส่ง",
      close: "ปิด",
      note: "EMMY ตอบจากข้อมูลบนเว็บ NWS โปรดยืนยันรายละเอียดกับทีมงาน",
      unknown: "ขอโทษค่ะ เรื่องนี้เอ็มมี่ยังไม่มีข้อมูล ฝากคำถามไว้ให้ทีมงานติดต่อกลับได้เลยค่ะ",
      f: { title: "ให้ทีมงานติดต่อกลับ", name: "ชื่อ *", contact: "อีเมลหรือเบอร์โทร *", company: "บริษัท", msg: "ต้องการให้ช่วยเรื่องอะไร", submit: "ส่งให้ทีมงาน", cancel: "ยกเลิก", req: "กรุณากรอกชื่อและอีเมลหรือเบอร์โทรค่ะ" },
      sent: "เปิดแอปอีเมลพร้อมข้อความให้แล้วค่ะ กด “ส่ง” ในแอปอีเมลได้เลย ทีมงานจะติดต่อกลับภายในวันทำการค่ะ 🙏\nถ้าแอปอีเมลไม่เปิด ส่งมาที่ support@nwsthai.com หรือโทร 098 317 9733 ได้ค่ะ",
      subject: "ติดต่อจาก EMMY (nwsthai.com)",
    },
    en: {
      open: "Ask EMMY",
      sub: "NWS assistant",
      hello: "Hi, I'm EMMY 👋 Ask me about NWS services, or tap “Contact our team” to have someone get back to you.",
      chips: ["What services do you offer?", "What is Ora One?", "Do you build AI apps?", "How much does it cost?"],
      contactChip: "📧 Contact our team",
      ph: "Type your question…",
      send: "Send",
      close: "Close",
      note: "EMMY answers from information on the NWS website. Please confirm details with our team.",
      unknown: "Sorry, I don't have that information yet. Leave your question and our team will get back to you.",
      f: { title: "Have our team contact you", name: "Name *", contact: "Email or phone *", company: "Company", msg: "How can we help?", submit: "Send to our team", cancel: "Cancel", req: "Please enter your name and an email or phone number." },
      sent: "Your email app is open with the message ready. Just press “Send” and our team will reply within one business day. 🙏\nIf it didn't open, email support@nwsthai.com or call +66 98 317 9733.",
      subject: "Enquiry via EMMY (nwsthai.com)",
    },
  };

  /* ------------------------------------------------------------------ */

  var root = document.documentElement;
  function lang() { return root.classList.contains("lang-en") ? "en" : "th"; }

  var history = []; // {role, content} for the AI + email transcript
  var busy = false;

  function norm(s) { return " " + String(s || "").toLowerCase().replace(/[!?.,:;"'()“”‘’]/g, " ").replace(/\s+/g, " ") + " "; }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function matchFaq(text) {
    var t = norm(text), best = null, bestScore = 0;
    FAQ.forEach(function (item) {
      var score = 0;
      var seen = {};
      item.k.th.concat(item.k.en).forEach(function (kw) {
        kw = kw.toLowerCase();
        if (seen[kw]) return;
        seen[kw] = 1;
        var hit = /[฀-๿]/.test(kw) ? t.indexOf(kw) !== -1 : new RegExp("[^a-z0-9]" + escapeRe(kw) + "[^a-z0-9]").test(t);
        if (hit) score += kw.length > 6 ? 2 : 1;
      });
      if (score && item.boost) score += item.boost;
      if (item.weak && score) score = 0.5; // greetings / generic: only win when nothing else matches
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return best;
  }

  /* ---- DOM ---- */
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  var wrap = document.createElement("div");
  wrap.className = "emmy";
  wrap.innerHTML =
    '<button type="button" class="emmy-fab" aria-expanded="false"><span class="emmy-orb"></span><span class="emmy-fab-label"></span><span class="emmy-live"></span></button>' +
    '<section class="emmy-panel" role="dialog" hidden>' +
    '<header class="emmy-head"><span class="emmy-orb lg"></span><div><b>EMMY</b><small class="emmy-sub"></small></div>' +
    '<button type="button" class="emmy-close">' + ICON_X + "</button></header>" +
    '<div class="emmy-log" aria-live="polite"></div>' +
    '<div class="emmy-chips"></div>' +
    '<form class="emmy-form"><input class="emmy-input" maxlength="500" autocomplete="off"><button class="emmy-send" type="submit">' + ICON_SEND + "</button></form>" +
    '<p class="emmy-note"></p>' +
    "</section>";
  document.body.appendChild(wrap);

  var fab = wrap.querySelector(".emmy-fab");
  var panel = wrap.querySelector(".emmy-panel");
  var log = wrap.querySelector(".emmy-log");
  var chips = wrap.querySelector(".emmy-chips");
  var form = wrap.querySelector(".emmy-form");
  var input = wrap.querySelector(".emmy-input");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function scroll() { log.scrollTop = log.scrollHeight; }

  function addMsg(who, text, opts) {
    opts = opts || {};
    var d = el("div", "emmy-msg " + who, text);
    if (opts.link) {
      var a = el("a", "emmy-link", opts.link[lang()]);
      a.href = opts.link.href;
      if (/^https?:/.test(opts.link.href) && opts.link.href.indexOf(location.host) === -1) { a.target = "_blank"; a.rel = "noopener"; }
      d.appendChild(a);
    }
    if (opts.contact) {
      var b = el("button", "emmy-cta", T[lang()].contactChip);
      b.type = "button";
      b.addEventListener("click", function () { b.disabled = true; showLeadForm(); });
      d.appendChild(b);
    }
    log.appendChild(d);
    scroll();
    return d;
  }

  function renderChips() {
    var t = T[lang()];
    chips.innerHTML = "";
    t.chips.forEach(function (c) {
      var b = el("button", null, c);
      b.type = "button";
      b.addEventListener("click", function () { ask(c); });
      chips.appendChild(b);
    });
    var cb = el("button", "contact", t.contactChip);
    cb.type = "button";
    cb.addEventListener("click", function () { showLeadForm(); });
    chips.appendChild(cb);
  }

  function applyLang() {
    var t = T[lang()];
    wrap.querySelector(".emmy-fab-label").textContent = t.open;
    wrap.querySelector(".emmy-sub").textContent = t.sub;
    wrap.querySelector(".emmy-note").textContent = t.note;
    wrap.querySelector(".emmy-close").setAttribute("aria-label", t.close);
    wrap.querySelector(".emmy-send").setAttribute("aria-label", t.send);
    panel.setAttribute("aria-label", "EMMY — " + t.sub);
    input.placeholder = t.ph;
    renderChips();
    if (!history.length) { log.innerHTML = ""; addMsg("bot", t.hello); }
  }

  function setOpen(open) {
    panel.hidden = !open;
    fab.hidden = open;
    fab.setAttribute("aria-expanded", String(open));
    if (open) setTimeout(function () { input.focus(); }, 50);
  }

  function reply(text, opts) {
    addMsg("bot", text, opts);
    history.push({ role: "assistant", content: text });
  }

  /* ---- Ask: FAQ first, then AI, then handoff ---- */
  function ask(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    var t = T[lang()];
    chips.classList.add("compact");
    addMsg("user", text);
    history.push({ role: "user", content: text });
    input.value = "";

    var hit = matchFaq(text);
    if (hit && !(hit.weak && EMMY_ENDPOINT && text.length > 25)) {
      busy = true;
      var typing = typingDots();
      setTimeout(function () {
        typing.remove();
        reply(hit.a[lang()], { link: hit.link, contact: hit.contact });
        busy = false;
      }, 450);
      return;
    }

    if (!EMMY_ENDPOINT) { reply(t.unknown, { contact: true }); return; }

    busy = true;
    var dots = typingDots();
    fetch(EMMY_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-10), lang: lang() }),
    })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (data) {
        dots.remove();
        var txt = String((data && data.reply) || "");
        var wantsContact = txt.indexOf("[[CONTACT]]") !== -1;
        txt = txt.replace(/\[\[CONTACT\]\]/g, "").trim();
        if (!txt) throw new Error("empty");
        reply(txt, { contact: wantsContact });
      })
      .catch(function () {
        dots.remove();
        reply(t.unknown, { contact: true });
      })
      .finally(function () { busy = false; });
  }

  function typingDots() {
    var d = el("div", "emmy-msg bot typing");
    d.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(d);
    scroll();
    return d;
  }

  /* ---- Lead handoff → email ---- */
  function showLeadForm() {
    var t = T[lang()], f = t.f;
    if (log.querySelector(".emmy-lead:not(.done)")) { log.querySelector(".emmy-lead:not(.done) input").focus(); return; }
    var lastQ = "";
    for (var i = history.length - 1; i >= 0; i--) if (history[i].role === "user") { lastQ = history[i].content; break; }

    var box = el("form", "emmy-lead");
    box.noValidate = true;
    box.innerHTML =
      "<b></b>" +
      '<input name="name" maxlength="100" autocomplete="name">' +
      '<input name="contact" maxlength="120" autocomplete="email">' +
      '<input name="company" maxlength="120" autocomplete="organization">' +
      '<textarea name="msg" rows="3" maxlength="800"></textarea>' +
      '<p class="emmy-err" hidden></p>' +
      '<div class="emmy-lead-actions"><button type="button" class="ghost"></button><button type="submit"></button></div>';
    box.querySelector("b").textContent = f.title;
    box.name.placeholder = f.name;
    box.contact.placeholder = f.contact;
    box.company.placeholder = f.company;
    box.msg.placeholder = f.msg;
    box.msg.value = lastQ;
    box.querySelector(".ghost").textContent = f.cancel;
    box.querySelector('[type="submit"]').textContent = f.submit;
    log.appendChild(box);
    scroll();
    box.name.focus();

    box.querySelector(".ghost").addEventListener("click", function () { box.remove(); });
    box.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = box.name.value.trim(), contact = box.contact.value.trim();
      var err = box.querySelector(".emmy-err");
      if (!name || !contact) { err.textContent = f.req; err.hidden = false; return; }
      err.hidden = true;
      var transcript = history.slice(-8).map(function (m) { return (m.role === "user" ? "Visitor: " : "EMMY: ") + m.content; }).join("\n");
      var body =
        "Name / ชื่อ: " + name + "\n" +
        "Contact / ติดต่อ: " + contact + "\n" +
        "Company / บริษัท: " + (box.company.value.trim() || "-") + "\n\n" +
        "Message / ข้อความ:\n" + (box.msg.value.trim() || "-") + "\n\n" +
        "--- Chat with EMMY ---\n" + transcript + "\n\nPage: " + location.href;
      var href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(t.subject + " — " + name) + "&body=" + encodeURIComponent(body);
      box.classList.add("done");
      Array.prototype.forEach.call(box.elements, function (x) { x.disabled = true; });
      window.location.href = href;
      reply(t.sent);
    });
  }

  fab.addEventListener("click", function () { setOpen(true); });
  wrap.querySelector(".emmy-close").addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) setOpen(false); });
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });

  new MutationObserver(applyLang).observe(root, { attributes: true, attributeFilter: ["class"] });
  applyLang();
})();
