# Phase 2: Audit Report — kavaiyatech.com (KT INDIA)

Audit date: 2026-10-03. Passive checks only. Every finding has an ID that maps to `findings.csv` (columns: id, area, finding, evidence, severity, effort, recommended fix).
Severity: Critical / High / Medium / Low. Effort: S (hours) / M (days) / L (weeks). **No Critical findings were found.**

## 1. Summary for the decision-maker

The current site is a carefully hand-built, fast-on-desktop, honest and well-structured single page. It already has a valid canonical, Open Graph tags, JSON-LD for the organisation and services, a privacy page, an accessible skip link and a reduced-motion mode. Lighthouse on a faithful local copy scores **Best Practices 100, SEO 100, Accessibility 95** and **Performance 100 on desktop**.

The opportunity is not "fix errors", it is **turn a research-lab brochure into a lead-generating business site**:

| # | Biggest opportunity | Finding |
|---|---|---|
| 1 | The whole company is one URL. Search engines see 2 pages, so no service can rank on its own. | F30, F31 |
| 2 | There is no way to enquire except email or WhatsApp. "Request service" buttons only scroll down. | F21 |
| 3 | No proof is published (no case study, testimonial or client name), yet the page says "05 major clients". | F22, F16 |
| 4 | Mobile performance (lab) is 69 because of heavy scripts and animation, not images. | F18 |
| 5 | The brand is hard to find: no verified Google Business Profile, no analytics, only two social links, no third-party listings. | F15, F24-F27 |

Quick wins (security headers, caching, DMARC, favicon, share image, contrast) can be done in a day (F01-F17).

## 2. Evidence and method

| Check | Method | Date |
|---|---|---|
| Crawl, source, text, assets | curl + HTML/JS/CSS read of `/` and `/policies.html`; `robots.txt`; `sitemap.xml` | 2026-10-03 |
| Headers, redirects, 404 | curl HEAD/GET, http→https, apex vs www, unknown URL | same |
| DNS / email auth | public DNS-over-HTTPS queries for TXT, MX, NS, CAA, `_dmarc`, two DKIM selectors | same |
| Lighthouse 13.5 | Run on a **local mirror** of the live files served with gzip and no cache headers (same as live), mobile and desktop presets | same |
| Social, local, competitors | WebSearch/WebFetch, public pages only | same |

**Important caveats**
- Lighthouse could not be run against the live URL: the live site returned HTTP 403 to headless-Chrome user-agents from this environment (plain curl got 200). Whether this is a WAF bot rule or the audit network's IP is **Not verified** (F14). Scores below are therefore *lab results on the mirrored files*; real-user data (CrUX), server latency and CDN behaviour are **Not verified**.
- The SSL certificate could not be inspected (the audit network re-signs traffic). HTTPS works and http→https returns 301; certificate expiry and chain are **Not verified**.
- The careers form back end (`api/apply.php`) was not tested because that would mean submitting a form.
- LinkedIn, Instagram and Google Business Profile could not be viewed; they are **Not verified** (access needed listed in section 12).

## 3. Lighthouse results (local mirror)

| Category | Mobile | Desktop |
|---|---|---|
| Performance | **69** | **100** |
| Accessibility | 95 | 95 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

Mobile metrics: FCP 1.2 s, LCP 2.6 s, **TBT 1,370 ms**, CLS 0, Speed Index 4.2 s, TTI 5.1 s. Total transfer 244 KiB (HTML 29 KiB gz, CSS 22 KiB gz, scripts about 88 KiB gz, logo 53 KiB). Weight is fine; **main-thread work is the issue**: 20 long tasks, 103 non-composited animations, 140 KB CSS, 252 KB (raw) phone-number library and 87 KB script.js running at load, and a 6,900-line HTML document including a 527-option country list. LCP element render delay is 1.3 s (the h1 waiting on blocking CSS and scripts).

## 4. Findings, ordered from quick fixes to strategic issues

### A. Quick fixes (S effort)

| ID | Area | Finding | Sev |
|---|---|---|---|
| F01 | Security | No HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy headers | Medium |
| F02 | Performance | No Cache-Control/Expires on assets (163 KiB re-fetched on repeat visits) | Medium |
| F03 | Performance | 1080×1080 PNG logo (53 KB) used at 38 px and as favicon | Low |
| F04 | Brand | No `favicon.ico` (404), no apple-touch-icon, no manifest | Low |
| F05 | Social previews | Share card is the square logo with `summary` card; no 1200×630 image | Low |
| F06 | Performance | JS/CSS not minified (~7 KiB / ~6 KiB gz) | Low |
| F07 | Accessibility | Contrast failure on publication preview text | Medium |
| F08 | Accessibility | Heading level skipped in hero (h1 → h3) | Low |
| F09 | Security | `robots.txt` advertises `/kt-private/` | Low |
| F10 | Email/Domain | No DMARC; DKIM unconfirmed; no CAA. (SPF present and strict.) | Medium |
| F11 | Technical SEO | Apex domain returns 200 instead of redirecting to www | Low |
| F12 | UX | Default Apache 404 page instead of a branded one | Low |
| F13 | Functionality | `api/assistant/status` returns 404 (dead assistant scripts) | Low |
| F14 | Performance/Access | 403 to Chrome-like user-agents from the audit network (cause Not verified) | Medium |
| F15 | Analytics | No analytics or tag manager; Search Console status Not verified | Medium |
| F16 | Content | Stats band says "02 digital/YouTube channels", "03 countries" while Dubai is "planned" | Medium |
| F17 | Brand | Name varies: KT INDIA / KT India / Kavaiya Technologies India | Low |

### B. Medium-level work (M effort)

| ID | Area | Finding | Sev |
|---|---|---|---|
| F18 | Performance | Mobile lab score 69, TBT 1,370 ms | **High** |
| F19 | Performance | Render-blocking 140 KB CSS (~305 ms) | Low |
| F20 | Privacy/Security | Privacy notice lacks DPDP Act 2023 reference, grievance contact, retention period; form back end untested | Medium |
| F21 | Conversion | No enquiry form; "Request service" only scrolls | **High** |
| F22 | Trust | No testimonials, case studies, client names; "05 major clients" unsupported | **High** |
| F23 | Messaging | Offer unclear to a buyer; ALL-CAPS and jargon; no pricing guidance/FAQ | Medium |
| F24 | Social | Only LinkedIn + Instagram, both Not verified; no Facebook/X/YouTube/GitHub | Medium |
| F25 | Local | GBP Not verified; no LocalBusiness schema or map; address looks residential; "24 hours" | Medium |
| F26 | Discovery | No directories or reviews found; NAP cannot be cross-checked | Medium |
| F27 | Discovery | Brand queries don't find the company; name collisions (Kavya/Kaivalya/KT) | Medium |
| F28 | Technical SEO | Schema good but Services are #fragments; no LocalBusiness/FAQ/Article | Low |
| F31 | Technical SEO | No keyword-targeted landing pages for what buyers search | **High** |

### C. Strategic (L effort)

| ID | Area | Finding | Sev |
|---|---|---|---|
| F29 | Maintainability | Content lives in 6.9k-line HTML + 4.2k-line JS + 8.4k-line CSS; no CMS | Medium |
| F30 | Technical SEO | One-page architecture; 2-URL sitemap; ~39,000 px-tall on mobile | **High** |
| F32 | Competitors | Peers have 165–847 indexable URLs, case studies, testimonials, more channels | **High** |
| F33 | Strategy | Breadth (10 sectors) may dilute the message to service buyers; two audiences need two paths | **High** |

Counts: 7 High, 14 Medium, 12 Low, 0 Critical.

## 5. Detail by audit area

### 5.1 Performance and Core Web Vitals
Strengths: gzip on, CLS 0, small transfer (244 KiB), no web fonts, no third-party scripts, `decoding=async` and lazy loading on repeated logos, `width/height` set (no layout shift). Weaknesses: F02, F03, F06, F18, F19. No CrUX field data was available (Not verified).

### 5.2 Technical SEO
Strengths: unique `<title>` ("Software, AI & Engineering Company in Gujarat | KT INDIA"), meta description, canonical, `robots` meta with `max-image-preview:large`, `lang="en"`, OG and Twitter tags, JSON-LD (Organization with legal identifiers, 8 Services, WebSite, WebPage), sitemap and robots declared, 301 from http to https. Weaknesses: only one indexable content URL (F30, F31), apex 200 (F11), schema limited to what exists (F28), default 404 (F12). Broken-link check: all in-page `#anchors` and `policies.html#…` targets exist; sampled external links respond (UN SDG pages 200, GeoNames 200, wa.me 302); the white-paper PDF returned 200 on first fetch (a later re-check was cut by the audit proxy). The two social links could not be checked (see F24). No redirect chains or duplicate content seen.

### 5.3 On-page content and messaging
The research-lab voice is distinctive and honest (restricted/confidential programmes are marked, availability is "subject to validation"). For a service buyer, however, the first screen does not say who the service is for, what to buy, or how to start (F21, F22, F23). There is no blog, FAQ, pricing guidance or process-with-deliverables for any service.

### 5.4 UX/UI and accessibility (WCAG 2.2 AA)
Strengths: skip link, landmarks (header/nav/main/footer), `prefers-reduced-motion` and `:focus-visible` rules, labelled form fields, visible light/dark toggle, 10 `aria-label`s, 0 images missing alt, target-size and button-name audits pass. Gaps: F07 contrast, F08 heading order, ALL-CAPS body text hurts readability, a very long mobile page (F30). A full manual keyboard and screen-reader test was **not** performed (Not verified).

### 5.5 Security and hygiene
HTTPS with 301 from http; no mixed content or console errors in Lighthouse. Gaps: F01, F09, F10, F13, F20. No outdated library versions could be confirmed for libphonenumber (version string not checked: Not verified). No cookies are set; the policy says local storage is used only for theme. A honeypot field exists on the careers form; server-side protections are untested.

### 5.6 Brand identity consistency
Palette and tone are coherent on the site (dark navy with cyan/violet/magenta gradients, system font stack, one logo). Naming varies (F17). Social profiles could not be viewed, so cross-channel consistency is **Not verified**.

### 5.7 Social media
See F24. Only LinkedIn and Instagram are linked; neither could be fetched logged-out. Cadence, engagement and consistency: Not verified. Needs admin or logged-in access.

### 5.8 Local and discovery presence
See F25-F27. Name, address and phone are consistent within the site and JSON-LD, but no third-party source repeats them.

### 5.9 Analytics, tracking, email/domain
F10, F15. DNS provider: StackDNS. SPF: `v=spf1 include:spf.stackmail.com a mx -all` (good). DMARC: none. CAA: none. DKIM: selectors `default` and `google` not present; the real selector is unknown (Not verified). Favicon and share previews: F04, F05.

### 5.10 Competitor comparison (evidence from their own sites; counts of clients/followers Not verified)

| | KT INDIA | Groovy Web (Nadiad) | Novumlogic (Vadodara) | Vedx (Vadodara) |
|---|---|---|---|---|
| Sitemap URLs | 2 | ~847 | ~165 | 3 |
| Case studies | none | yes | yes | not assessed |
| Testimonials | none | yes | minimal | yes |
| Blog | none (1 white paper) | yes | yes | yes |
| Schema | Org, Service, WebSite | rich | none detected | WebSite/Article |
| Social channels linked | 2 | 6 | 5 | 4 |
| Directory listings found | none | G2, Manifest, TechBehemoths | Clutch ref | DesignRush |

KT INDIA's genuine advantages: transparent legal identifiers, a real white paper, a distinctive R&D positioning and a faster, lighter page than most agencies. The peers are larger and sell different things (mostly app/SaaS development), so this is context, not a like-for-like ranking. Sources: `01-discovery/social-local-competitors-raw.md`.

## 6. Recommended order of work

1. Week 1: F01-F17 (headers, caching, DMARC, favicon/share image, contrast, analytics + Search Console, 404, naming, stats wording).
2. Weeks 2-4: F18 (mobile performance), F21 (enquiry form), F20 (privacy notice), F22 (first 2 proof items with client permission).
3. Month 2: F30/F31 (multi-page structure and service pages), F28, F25/F26 (GBP and listings), F24 (social plan).
4. Month 3+: F29, F32, F33 (content engine, positioning, review collection).

## 7. Assumptions behind this report
See `/ASSUMPTIONS.md`.

## 8. Access needed to close "Not verified" items
Google Search Console, Google Business Profile manager, LinkedIn and Instagram admin or analytics, StackMail DKIM selector, CDN/WAF rules (for the 403 behaviour), the `api/apply.php` source, and any analytics account.
