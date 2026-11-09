# NWS Legacy Corporate Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native) to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rebuild all four pages of the NWS site from a dark "cyberpunk/telemetry" style into a light, traditional enterprise-IT ("legacy business") design with new B2B/ERP content, bilingual TH/EN.

**Architecture:** Plain static HTML + one shared hand-written `styles.css` + one small `script.js` (menu toggle, TH/EN toggle, footer year, form → mailto). No Tailwind CDN, no Material Symbols, no `navigation.js` runtime rewriting — correct hrefs/srcs go directly in markup.

**Tech Stack:** HTML5, CSS3 (CSS variables, grid/flex), vanilla JS, Google Fonts (Roboto + Noto Sans Thai).

**Spec:** `docs/superpowers/specs/2026-11-09-nws-legacy-corporate-redesign-design.md`

## Global Constraints

- Palette: blue `#1B4E8B`, green `#1E7A4B`, bg `#FFFFFF`, alt `#F4F6F8`, text `#1A1D21`, muted `#4B5563`, border `#D9DEE4`, navy footer `#10243E`.
- Fonts: Roboto (Latin) + Noto Sans Thai (Thai), fallback Arial/Helvetica/sans-serif.
- Border radius ≤ 2px; no neon, no glassmorphism, no animation beyond hover color (respect `prefers-reduced-motion`).
- Bilingual TH/EN on every page; Thai is default (`<html lang="th" class="lang-th">`).
- All copy rewritten to new B2B/ERP story; ZERO leftover "telemetry/SECS-GEM/CAMSTAR/fab/live-stream" wording.
- Email `support@nwsthai.com`; address `29/55 Tara Ville, Khlong 5, Khlong Luang District, Pathum Thani Province`.
- URL paths stable: `/`, `/about/`, `/solutions/`, `/contact/`.
- Do NOT touch `worker/` or `CNAME`.

## Review Focus

1. Internal nav links on subpages must use correct relative/absolute paths and resolve (no `#` dead links).
2. TH/EN toggle must flip every string on every page and persist via `localStorage`.
3. Contact form must still open a `mailto:` to `support@nwsthai.com` with the entered fields.
4. No leftover dark-theme colors or telemetry copy anywhere in the source.
5. Images must be real files (generated) referenced by correct relative paths from `index.html` and `about|solutions|contact/index.html` (`../assets/...` from subpages).

---

### Task 1: Design system stylesheet

**Files:**
- Rewrite: `styles.css`
- Delete: `subpages.css`

**Interfaces:**
- Produces: `.container`, `.topbar`, `.site-header`, `.brand`, `.site-nav`, `.lang-toggle`, `.menu-toggle`, `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-outline`, `.hero`, `.eyebrow`, `.section`, `.section-alt`, `.cards`/`.card`, `.icon`, `.why-item`, `.stats`, `.site-footer`, `.form`/`.field`, `.navy` footer, responsive breakpoints.

- [ ] Step 1: Write `styles.css` with the full design system (variables, reset, typography, header/nav, topbar, buttons, hero, sections, cards, why-us, stats, footer, forms, mobile nav, `[data-lang]` show/hide rules).
- [ ] Step 2: Delete `subpages.css`.
- [ ] Step 3: Commit (`git add styles.css subpages.css && git commit -m "feat: legacy-corporate design system stylesheet"`).

### Task 2: Generate realistic imagery

**Files:**
- Create: `assets/hero-server-room.jpg`
- Create: `assets/about-it-team.jpg`
- Create: `assets/solutions-analytics.jpg`

- [ ] Step 1: Generate realistic enterprise server-room photo → `assets/hero-server-room.jpg` (professional, well-lit, no neon, no text).
- [ ] Step 2: Generate realistic corporate IT team photo → `assets/about-it-team.jpg`.
- [ ] Step 3: Generate realistic data-analytics/dashboard photo → `assets/solutions-analytics.jpg`.
- [ ] Step 4: Commit assets.

### Task 3: Homepage

**Files:**
- Rewrite: `index.html`

**Interfaces:**
- Consumes: classes from Task 1; images from Task 2; `script.js` hooks (`.lang-toggle`, `.menu-toggle`, `#year`, `[data-lang]`).

- [ ] Step 1: Write `index.html` — header (logo + nav: Home/About Us/Core Services/Why Us/Contact + TH/EN), topbar (email/phone), hero (headline "Elevating B2B Business Management into the Digital Era.", subheadline "Combining 30+ years of deep expertise with cutting-edge AI and Intelligent ERP to maximize operational efficiency.", `hero-server-room.jpg`, button "Explore Our Solutions"), stats strip, 3-column services (Ora One / B2B MSP / AI & ML), Why Us (3 bullets), footer (name, Pathum Thani address, nwsthai.com, copyright).
- [ ] Step 2: Verify via browser preview (screenshot, light theme, no neon, correct copy).
- [ ] Step 3: Commit.

### Task 4: Shared behavior script

**Files:**
- Rewrite: `script.js`
- Delete: `navigation.js`

- [ ] Step 1: Write `script.js` — mobile menu toggle (aria-expanded), TH/EN toggle (flip `<html>` class + `lang`, persist `localStorage`), `#year` fill, contact/consultation form `mailto:` submit handler.
- [ ] Step 2: Delete `navigation.js`.
- [ ] Step 3: Commit.

### Task 5: About page

**Files:**
- Rewrite: `about/index.html`

- [ ] Step 1: Write `about/index.html` — hero (company overview), 30+ yr heritage, mission/values, milestone timeline, expanded "Why choose us", CTA → `/contact/`.
- [ ] Step 2: Verify via browser preview.
- [ ] Step 3: Commit.

### Task 6: Solutions page

**Files:**
- Rewrite: `solutions/index.html`

- [ ] Step 1: Write `solutions/index.html` — hero, three service deep-dives: Ora One (EMMY AI Assistant + Mart integration, low-tech-error/human-incident prevention), B2B MSP (IT application support, OPEX model), AI & ML (shop-floor analytics, predictive risk models), each with feature lists; CTA.
- [ ] Step 2: Verify via browser preview.
- [ ] Step 3: Commit.

### Task 7: Contact page

**Files:**
- Rewrite: `contact/index.html`

- [ ] Step 1: Write `contact/index.html` — hero, contact form (name, company, email, phone, subject, message → mailto `support@nwsthai.com`), direct info (email/phone/Pathum Thani address), CTA.
- [ ] Step 2: Verify via browser preview.
- [ ] Step 3: Commit.

### Task 8: SEO / meta / docs

**Files:**
- Modify: `llms.txt` (new positioning + Pathum Thani address)
- Modify: `sitemap.xml` (add `/about/`, `/solutions/`, `/contact/`)
- Modify: `robots.txt` (allow, post-launch)
- Modify: `README.md` (deployment note)

- [ ] Step 1: Apply all four file updates.
- [ ] Step 2: Commit.

### Task 9: Full verification pass

- [ ] Step 1: Serve locally (`python3 -m http.server 4173`) and preview all four pages in the browser; screenshot each.
- [ ] Step 2: Grep source for forbidden words (`telemetry`, `SECS/GEM`, `CAMSTAR`, `LATENCY`, `dark`, `neon`, `cyber`, `electric-cyan`, `FAB`); must return zero matches.
- [ ] Step 3: Verify every internal link resolves and TH/EN toggle + form work on all pages.
- [ ] Step 4: Fix anything found; commit.

### Task 10: Deploy

- [ ] Step 1: `git push origin main`.
- [ ] Step 2: Confirm GitHub Pages build succeeds (`gh api repos/Petchy77/nws-web/pages/builds --paginate | head`), then fetch `https://nwsthai.com/` and confirm the new light design is live.
