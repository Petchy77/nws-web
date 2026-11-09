# New World Solutions — Legacy Corporate Redesign

Date: 2026-11-09
Status: Awaiting approval

## Intent & Why

The current site is a dark "cyberpunk / telemetry" build: near-black backgrounds, neon cyan
glows, glassmorphism, fake "live telemetry" chrome (e.g. "FAB TELEMETRY CLUSTER // LIVE STREAM
ACTIVE", "LATENCY: 1.2ms"), Space Grotesk / JetBrains Mono typefaces, and semiconductor-manufacturing
copy (CAMSTAR MES, SECS/GEM, wafer fab).

The owner wants a fundamentally different site: a **"legacy business" / traditional enterprise-IT
look** (mid-2010s Oracle or IBM) that reads as established, trustworthy, and straightforward — with a
**repositioned B2B story** (Intelligent ERP "Ora One", B2B Managed IT Service, AI/ML analytics) rather
than the current semiconductor story. Source of truth: `design 3.md` + the design prompt.

## Goals

- Homepage matches the spec's structure and copy exactly: header (logo + nav), hero (headline,
  subheadline, realistic image, square solid-blue CTA), 3-column services (Ora One / MSP / AI & ML),
  "Why Choose Us" (3 bullets + icons), footer (name, Pathum Thani address, nwsthai.com, copyright).
- A cohesive light, corporate, grid-based visual system applied to all four pages.
- Bilingual TH/EN toggle preserved (Thai default, matching current site and `llms.txt`).
- Remove all neon, glassmorphism, abstract 3D, and excessive animation; remove all fake telemetry jargon.
- Realistic enterprise imagery (server room / corporate IT team), not abstract AI art.
- SEO/meta files updated to match the new positioning and address.

## Non-goals

- Do **not** touch the Cloudflare Worker pre-launch gate (`worker/`) — that is infrastructure and
  out of scope.
- No CMS, no build step, no JS framework — plain static HTML/CSS/JS (the site is served as static
  files from R2 through the gate).
- Do **not** preserve the old semiconductor SECS/GEM content.

## Anti-goals (what makes this a failure even if it "works")

- Any lingering "trendy AI" aesthetic: glassmorphism, neon gradients, oversized 3D, motion bloat.
- Any leftover dark theme or "telemetry/live-stream" copy.
- Broken deployment path (must remain static, zero-build, same URL structure).

## Constraints

- Model cannot view images (no image input), so the palette is derived from the spec's "corporate
  blue and green matching the NWS logo" using standard corporate values; imagery is generated rather
  than hand-picked.
- Static site served from R2 via the Worker gate; must stay zero-build.
- Both Thai and English copy required on every page.
- Keep URL paths stable: `/`, `/about/`, `/solutions/`, `/contact/`.

## Approaches considered

1. **Keep Tailwind CDN, re-theme only** — rejected. Heavy, JS-dependent styling; hard to guarantee
   the "no trendy AI look"; the inline config is already a large mess duplicated across pages.
2. **Hand-written CSS (single shared stylesheet) + plain semantic HTML** — **chosen.** Full control
   over the exact legacy-corporate look, no runtime JS dependency for styling, faster, more
   maintainable, and truer to the "traditional enterprise" ethos.
3. **CSS framework (e.g. Bootstrap)** — rejected. Adds a dependency for little benefit on a 4-page
   static site.

## Design system (builder's calls)

- **Palette** (light, corporate blue + green):
  - Primary blue `#1B4E8B`, primary green `#1E7A4B`
  - Light blue tint `#EAF1F8`, light green tint `#E8F3EC`
  - Background `#FFFFFF`, alternate section `#F4F6F8`
  - Text `#1A1D21`, muted `#4B5563`, borders `#D9DEE4`
  - CTA buttons: solid blue or solid green, square (border-radius ≤ 2px).
- **Typography:** Roboto (Latin) + Noto Sans Thai (Thai) via Google Fonts, fallback
  Arial/Helvetica/sans-serif. Strong bold headings, clear hierarchy.
- **Layout:** 1200px max container, strict 12-column grid, 1px section dividers, high information
  density. Subtle 1–2px border shadows only; no rounded corners beyond 2px; no animation beyond
  simple hover color shifts (respects `prefers-reduced-motion`).
- **Header:** slim top utility bar (phone / email), white bar with logo left and nav right
  (Home, About Us, Core Services, Why Us, Contact) + TH/EN toggle. Sticky.
- **Hero:** light background, text left (headline + subheadline + "Explore Our Solutions" button),
  realistic server-room image right.
- **Services:** 3-column cards, each with icon, title, one-line description, "Learn more" → `/solutions/`.
- **Why Us:** 3 items with small classic icons (inline SVG), short bold titles + one-line detail.
- **Footer:** deep navy `#10243E` band (standard enterprise grounding; flags above in summary for veto),
  white text: company name, address, website, copyright + standard links.

## Page mapping (builder's calls)

- **Home `/`** — spec structure, plus a thin stats/trust strip (30+ years, etc.) between hero and
  services as a "legacy enterprise" touch.
- **About `/about/`** — company overview, 30+ yr heritage (semiconductor → B2B digital), mission &
  values, milestone timeline, "Why choose us" expanded, CTA → contact.
- **Solutions `/solutions/`** — deep-dive on the three services: Ora One (EMMY AI Assistant, Mart
  integration, low-tech error / human-incident prevention), B2B MSP (IT application support, OPEX
  model), AI & ML (shop-floor data analytics, predictive risk models), each with feature lists; CTA.
- **Contact `/contact/`** — contact form (mailto `support@nwsthai.com`), direct info (email, phone,
  Pathum Thani address), simple location block; CTA.

## Implementation details

- Rewrite `index.html`, `about/index.html`, `solutions/index.html`, `contact/index.html`.
- Rewrite `styles.css` as the single shared stylesheet; delete orphaned `subpages.css`.
- Rewrite `script.js` (mobile menu toggle, TH/EN toggle, footer year, form handlers).
- Delete `navigation.js` (hrefs/srcs correct in markup; no runtime rewriting needed).
- Add generated hero image (realistic server room) and supporting corporate imagery to `assets/`.
- Update `llms.txt` (new positioning + Pathum Thani address); add about/solutions/contact to
  `sitemap.xml`; refresh `robots.txt` for post-launch; leave `worker/`, `CNAME`, `README` (minor).
