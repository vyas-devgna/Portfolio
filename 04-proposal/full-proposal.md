# Proposal: rebuild and ongoing care for kavaiyatech.com

**For:** Kavaiya Technologies India Private Limited (KT INDIA), Nadiad, Gujarat
**From:** [YOUR NAME], [YOUR BUSINESS NAME] · [EMAIL] · [PHONE]
**Date:** [DATE] · **Valid until:** [DATE + 30 DAYS]

---

## 1. The problem

KT INDIA has a distinctive story: ten technology sectors, real R&D programmes, a published white paper and ANNAVEDA in development. The current website tells that story with care. It is not yet built to **win and handle client work**:

- It is a single page, so search engines index two URLs and none of the eight services can rank for its own search terms.
- There is no enquiry form, so a visitor who clicks "Request service" ends up at an email link.
- No proof is shown (case studies, testimonials or client names), so buyers have nothing to check.
- On phones it is slow to respond because of heavy scripts, even though the page itself is light.
- Discovery and measurement are missing: no analytics, an unverified Google profile, no directories and no DMARC.

## 2. Evidence

All findings come from passive checks on 3 October 2026 (public pages, response headers, public DNS and Lighthouse). The full report is in `02-audit/audit-report.md`, and all 33 findings with evidence are in `02-audit/findings.csv`.

| ID | Finding | Evidence | Severity |
|---|---|---|---|
| F30 | One-page site; sitemap lists 2 URLs; about 39,000 px tall on mobile | `sitemap.xml`; Lighthouse element positions | High |
| F31 | No keyword-targeted service pages | Single title/description theme | High |
| F21 | No enquiry form; "Request service" only scrolls | `js/script.js` function `requestService` | High |
| F22 | No testimonials or case studies; "05 major clients" unsupported | Full page text | High |
| F18 | Mobile performance 69, Total Blocking Time 1,370 ms | Lighthouse 13.5 on a mirror of the live files | High |
| F32 | Regional peers have 165–847 indexable pages, case studies and reviews | Their sitemaps and homepages | High |
| F33 | Ten sectors may dilute the message to service buyers | Page structure | High |
| F01 | No security headers (HSTS, CSP, etc.) | Response headers | Medium |
| F10 | No DMARC record; DKIM unconfirmed | Public DNS | Medium |
| F15 | No analytics or tag manager | Page source | Medium |
| F20 | Privacy notice does not cover the DPDP Act 2023, a grievance contact or retention periods | `policies.html` | Medium |

What is already good (and is kept): the canonical URL, Open Graph tags, organisation and service structured data, honest R&D disclaimers, transparent company identifiers, the skip link, reduced-motion support and a light page weight.

## 3. The solution

### 3.1 New website (built and ready)
A replacement site is already built in `03-new-site/` and can be previewed before any commitment.
- **18 pages:** Home, Services, 8 service pages, Work & research, About, Careers, Contact, Privacy, Terms, Thank-you and 404.
- **Conversion:** enquiry form with spam protection (honeypot plus provider filtering), a service pre-selected from each service page, WhatsApp and email on every page, and a clear "Start a project" path.
- **Proof-ready:** case-study, testimonial and team sections with clear placeholders. Nothing is invented; your approved content goes in.
- **Search:** unique titles and descriptions, structured data (Organization, ProfessionalService, Service, FAQ, Breadcrumbs, TechArticle), sitemap and robots.txt. 301 redirects keep old links and the white-paper URL working.
- **Speed and security:** no frameworks, no third-party scripts and no cookies; strict security headers; caching. Lighthouse scores 97–100 on mobile and desktop in local tests.
- **Design:** a refreshed identity with a concept logo mark (the original logo stays available), purposeful motion that switches off for visitors who prefer reduced motion, and a full-screen mobile menu that works by touch, mouse and keyboard.
- **Deploy anywhere:** Netlify, Vercel, Cloudflare Pages or your current Apache host. Step-by-step instructions are included.

### 3.2 Launch fixes outside the website
DMARC record, DKIM confirmation and a CAA record; Google Search Console and Bing Webmaster; privacy-friendly analytics with enquiry goals; Google Business Profile check and set-up; consistent name, address and phone on key directories.

### 3.3 Ongoing care
A monthly plan (Essential, Growth or Premium) that covers updates, backups, monitoring, content changes, SEO and reporting. See `pricing-and-maintenance-plans.md`.

## 4. Scope

**In scope (launch project)**
- Final content edits to the new site with your supplied text, case studies, testimonials and team details.
- Logo decision (concept mark or original) and any colour adjustment.
- Form connection (Formspree or your chosen provider) and test submissions.
- Deployment to your chosen host, domain and HTTPS set-up, and redirects check.
- DMARC/CAA records, Search Console, analytics set-up, and Google Business Profile check.
- One round of revisions after review, then a second minor round.
- A short handover guide (how to request changes, how to read the monthly report).

**Out of scope (can be quoted separately)**
- Writing case studies from scratch without your input (interviews can be added).
- Photography or video production.
- Paid advertising management.
- Changes to the careers back end (`api/apply.php`) beyond reconnecting it as-is.
- ANNAVEDA app or product development.
- Legal review of the privacy notice (a draft is provided; your legal adviser must approve it).

## 5. Timeline

| Week | Work | Your input needed |
|---|---|---|
| 0 | Kick-off call, preview walkthrough, access handover | Host, DNS and Google account access |
| 1 | Quick fixes on the current site (headers, DMARC, analytics, Search Console) | DNS access |
| 1–2 | Content collection and edits to the new site; logo decision | Case studies, testimonials, team, prices or ranges, hours |
| 2 | Review round 1 | Feedback within 3 working days |
| 3 | Revisions, form and analytics testing, legal review of the privacy notice | Legal sign-off |
| 3–4 | Launch, redirect checks, sitemap submission, post-launch monitoring | Go-live approval |
| 4+ | Monthly care plan begins | — |

Dates move with content availability; the build itself is already done.

## 6. Deliverables

1. Live new website on www.kavaiyatech.com.
2. Source files and build script in a repository you own, plus deploy instructions.
3. Audit report and findings list (already provided).
4. DNS email-security records published.
5. Analytics and Search Console access in your name.
6. Handover guide and the first monthly report 30 days after launch.

## 7. Assumptions

- You provide access to the domain DNS, hosting and Google accounts, or add me as a user.
- Case studies, testimonials and client names are supplied by you with the client's written permission.
- Content and feedback arrive within the timeline above; delays move the launch date, not the price.
- The site stays static. A CMS can be added later if the team wants to edit pages themselves.
- Prices exclude third-party costs (hosting, domain, paid form plan, if needed) and applicable GST.

## 8. Risks and how they are handled

| Risk | Mitigation |
|---|---|
| Ranking dip during the move from one page to many | 301 redirects for every old URL and anchor, same domain, sitemap submitted on day one, and close monitoring in Search Console for 30 days |
| Content (case studies, testimonials) is not ready | Launch with clearly worded sections hidden or marked "coming soon"; add proof as it is approved |
| Form spam | Honeypot plus provider spam filtering; Turnstile/hCaptcha can be added if needed |
| Old careers form stops working if hosting changes | Keep the current host for `api/apply.php`, or switch to email applications (already on the new careers page) |
| New logo not approved | The original logo is kept and can be swapped in within an hour |
| The current site's firewall blocks testing tools | Check the CDN rule with your host so Google and monitoring tools are not blocked |

## 9. Investment

| Item | Price |
|---|---|
| Launch project (sections 3.1–3.2 and section 4) | [₹ ______] |
| Monthly care: Essential / Growth / Premium | [₹ ____] / [₹ ____] / [₹ ____] per month |

Payment: [e.g. 50% at kick-off, 50% at launch]. Care plans are billed monthly in advance, with [minimum term, e.g. 3 months].

## 10. Acceptance

Name: ____________________  Signature: ____________________  Date: __________
