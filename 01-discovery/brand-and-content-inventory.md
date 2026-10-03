# Phase 1: Brand and Content Inventory — Kavaiya Technologies (KT INDIA)

Research date: 2026-10-03. Passive checks only (public pages, public files, response headers, public DNS). Nothing was submitted to the client's forms and no intrusive scans were run.
Companion file with social, local and competitor evidence: `social-local-competitors-raw.md`.

## 1. Crawl scope

| Item | Result | Source |
|---|---|---|
| Pages reachable | **Two**: `/` (single long page, ~187 KB HTML, 6,914 lines) and `/policies.html` | https://www.kavaiyatech.com/sitemap.xml |
| `sitemap.xml` | 2 URLs only (`/`, `/policies.html`) | same |
| `robots.txt` | `Allow: /`, `Disallow: /api/`, `Disallow: /kt-private/`, sitemap declared | https://www.kavaiyatech.com/robots.txt |
| Sub-pages (`/about`, `/services` …) | Do not exist. All nav items are `#anchors` on the home page (`#about #sectors #products #services #research #publications #join #contact`) | page source |
| Other files | `/favicon.ico` 404, `/sitemap_index.xml` 404, `/security.txt` 404, `/humans.txt` unreachable on 1 of 2 attempts | curl, 2026-10-03 |
| Downloadable | 1 PDF white paper: `assets/publications/KT-WP-2026-ARM-001.pdf` (439 KB) | page source |

Everything below comes from that one page unless a different source is named.

## 2. Company identity

- **Legal name:** Kavaiya Technologies India Private Limited. **Trading name:** KT INDIA. **Alternate name in schema:** "Kavaiya Technologies India".
- **Founded:** 2024 (site, JSON-LD `foundingDate`). **HQ:** A8-Shiv Residency, Zalak Canal Ring Road, Nadiad 387002, Gujarat.
- **Planned second site:** Dubai Silicon Oasis (IFZA Business Park, Building A2) — labelled "PLANNED" on the page.
- **Self-declared registrations (not independently verified):** CIN U62011GJ2024PTC148370, GSTIN 24AAKCK8001G1ZR, Startup India certificate DIPP191925, BHASKAR ID OI-0225-9146BB. "ISO application: in progress."
- **Tagline:** "Ecosystem driven by sense and statistics."  **Hero:** "One technology ecosystem for research."
- **Positioning:** research-driven, multidisciplinary technology ecosystem (10 "sectors") that also sells software, AI/ML and engineering services.
- **Philosophy / process language:** Science → Research → Engineering → Product → Impact; "Evidence before assumption"; "Don't choose a technology, start with the problem."

## 3. Services (8, all on the home page)

1. Custom software development (web, mobile, desktop, cross-platform, APIs)
2. ERP and point-of-sale (business management, workflow, inventory, POS, dashboards)
3. Smart contract development (smart contracts, dApps, private-network proofs of concept)
4. Graphics and UI/UX design (graphics, documents, templates, interfaces, branding)
5. PCB and electronic design (circuits, PCB, embedded, prototype)
6. AI/ML development (prototypes, analytics, intelligent software)
7. IP and protocol development (research, protocol concepts, architecture, documentation)
8. Research and technology consulting

Each service has a "REQUEST SERVICE" button. In `js/script.js` (function `requestService`, line ~2428) it only stores the service name in the browser's local storage, scrolls to `#contact` and shows a toast. **There is no business enquiry form** — the contact section offers an email link and WhatsApp. The only form on the site is the careers/internship application (`api/apply.php`).

## 4. The 10 "sectors" (descriptions as published)

Animation (active), Blockchain (R&D + services), Design (active), Discovery (core R&D), Education (developing; flagship "The Programming Institute"), Electronics (R&D + engineering), Games (active; titles "Game of Divine", "A Point of No Return"), Semiconductors (R&D/IP; DDR7-oriented protocol stack), Software (active), Telecom (R&D/IP; 6G).

## 5. Product, research and publications

- **ANNAVEDA** — planned Android (Google Play) lifestyle/nutrition app combining Ayurveda-inspired principles with ML; free + subscription model; target December 2026; "under development".
- **Research programmes listed:** R01 DDR7 protocol stack (restricted), R02 ANNAVEDA personalisation (public), R03 6G (confidential), R04 blockchain (public).
- **Publications:** one white paper, "Strategic Planning, Marketing, and Design of Scalable Embedded System Solutions for Multi-Domain Applications using ARM-Based Platforms" (KT-WP-2026-ARM-001, rev 1.0, July 2026). Authors named: Shriya Pujara, Sagar Kavaiya, Narendrakumar Chauhan, Purvang Dalal. The page itself states 0 research papers, 0 technical reports.
- **Careers:** rolling internships (3, 6, 9, 12 months) and rolling roles in 13 areas; full application form with résumé upload.

## 6. Proof, testimonials, portfolio

- **Testimonials:** none. **Case studies / client work:** none. **Client logos:** none.
- The About stats band says "**05 MAJOR CLIENTS**", "03 countries in current/planned footprint", "02 digital/YouTube channels" with no names, links or evidence anywhere on the page. Treated as **unverified claims** (see audit F16 and F22).
- Honest R&D disclosure: restricted and confidential programmes are labelled, and product availability is described as "subject to validation". This is a trust positive.

## 7. Contact details

| Channel | Value |
|---|---|
| Email | contact@kavaiyatech.com (domain mail hosted on StackMail per MX) |
| WhatsApp / phone | +91 9227002010 (labelled "Business WhatsApp") |
| Address | A8-Shiv Residency, Zalak Canal Ring Road, Nadiad - 387002, Gujarat |
| Hours | "24 hours" (footer and policies page) |
| Forms | careers only |
| Social links on site | LinkedIn https://www.linkedin.com/company/105395125/ , Instagram https://www.instagram.com/kavaiyatech/ |

## 8. Brand identity

- **Logo:** `assets/logo.png`, 1080×1080 px, 53 KB PNG, used as header logo (38 px), 4 other places, favicon and og:image.
- **Alt text:** "KT India Logo" (consistent, but differs in case from the "KT INDIA" wordmark).
- **Colour (CSS custom properties, `css/style.css`):** dark theme background `#050713` / `#090d1b` / `#0d1324`; text `#f6f9ff`, secondary `#b2bdd0`, muted `#7d899f`; accents cyan `#2fd2ff`, blue `#5a96ff`, violet `#8a5cff`, magenta `#d416ff`. Light theme: bg `#f8faff`, text `#11192a`, with darker cyan `#006a88` and violet `#6940bd`. `<meta theme-color>` `#050713`. A ☀ theme toggle exists.
- **Fonts:** a single `font-family` declaration, no web fonts loaded (no Google Fonts or @font-face seen), so the system font stack is used.
- **Tone:** technical, confident, research-lab voice; ALL-CAPS headings and labels throughout; dense jargon ("sense and statistics", "ecosystem online", "operating system").
- **Visual language:** dark "mission-control" UI, neon gradients, animated consoles, sector explorer modals.

## 9. Tech stack and hosting clues

| Clue | Evidence |
|---|---|
| Hand-coded static front end: `index.html` + `css/style.css` (8,442 lines) + `js/script.js` (4,223 lines) | page source |
| No CMS, no framework detected (no WordPress: `/wp-json/` 404, `/wp-login.php` 403; no React/Vue bundles) | curl |
| Vendor lib `js/vendor/libphonenumber-max.js` (252 KB raw, 64 KB gzip) for phone validation | page source |
| Country/phone/ISD `<select>` with 527 `<option>`s inlined in HTML; city lists lazy-loaded from `assets/data/cities-XX.json` (GeoNames) | page source |
| Back-end PHP endpoint `api/apply.php` (careers form, POST multipart, honeypot field `company_website`). Not tested (would be submitting a form). | `js/script.js:3856` |
| Chat assistant scripts (`js/assistant*.js`, `css/assistant.css`) calling `api/assistant/status` and `api/assistant/chat`. The live `status` endpoint returns **404**. | GET 2026-10-03 |
| Hosting: Apache origin behind a CDN ("x-provided-by: StackCDN", `x-via: IAD1/ORD1`); DNS `ns1-4.serverbyt.in` (StackDNS); mail MX `mx.stackmail.com` | response headers, public DNS |
| Compression: gzip enabled for HTML/CSS/JS (yes). No `Cache-Control` / `Expires` on any asset (see audit). | headers |
| Analytics: no GA/GTM/Plausible tags found in HTML. | page source |
| Structured data: JSON-LD `@graph` with Organization, 8 Service offers (as `#fragment` URLs), WebSite, WebPage. | page source |

## 10. Social and external profiles (summary — detail and sources in `social-local-competitors-raw.md`)

| Platform | Result |
|---|---|
| LinkedIn | Linked from site. **Not verified** (sign-in wall for logged-out fetch). |
| Instagram | Linked from site. **Not verified** (HTTP 429). |
| Facebook, X, YouTube, GitHub | Not linked from site, none found by search. (Site stat claims "02 digital/YouTube channels".) |
| Google Business Profile | **Not verified**; needs a browser Maps search or GBP manager access. |
| Clutch, GoodFirms, IndiaMART, JustDial, Crunchbase, Zauba/Tofler | None found. |
| Reviews | None found. |

## 11. What would confirm the "Not verified" items

Access to the client's LinkedIn and Instagram admin or analytics, Google Business Profile manager, Google Search Console, any analytics account, and the DKIM selector used by StackMail.
