# START HERE: Kavaiya Technologies (KT INDIA) proposal package

Prepared 2026-10-03. The package lets the KT INDIA decision-maker understand three things in under 15 minutes:
1. what can be improved online;
2. a working better version;
3. why hiring you is low-risk.

## What's in the package

| Order | File | What it is | Client-facing? |
|---|---|---|---|
| 1 | `04-proposal/proposal.pdf` | **6-page designed summary**: cover, executive summary, key findings, new site, roadmap, pricing | Yes, attach this |
| 2 | `04-proposal/outreach-email.md` | Cover email + 2 follow-ups | Yes (send as email) |
| 3 | `04-proposal/executive-summary.md` | One-page summary (text version) | Yes |
| 4 | `04-proposal/full-proposal.md` | Problem, evidence, solution, scope, timeline, deliverables, assumptions, risks | Yes |
| 5 | `04-proposal/pricing-and-maintenance-plans.md` | Launch price + Essential / Growth / Premium plans | Yes |
| 6 | `04-proposal/30-60-90-day-roadmap.md` | Week-by-week plan tied to finding IDs | Yes |
| 7 | `04-proposal/why-me-and-next-steps.md` | Trust case, your bio, next steps | Yes |
| 8 | `02-audit/audit-report.md` + `findings.csv` | Full audit: 33 findings with evidence, severity and effort | Yes, on request |
| 9 | `03-new-site/` | The new website (built in `dist/`), README with deploy steps, BUILD-NOTES | Preview link only |
| 10 | `01-discovery/` | Brand/content inventory; social, local and competitor research | Internal |
| — | `PROGRESS.md`, `ASSUMPTIONS.md` | Working notes | Internal |

**Regenerate the PDF** after filling placeholders: edit `04-proposal/pdf-src/proposal.html`, then run `PLAYWRIGHT_PATH=<path> node 04-proposal/pdf-src/make-pdf.cjs` (any machine with Playwright).

## You must fill in or confirm before sending

**About you (all proposal files and the PDF):**
- [ ] `[YOUR NAME]`, `[YOUR BUSINESS NAME]`, `[ROLE]`, `[CITY]`, `[EMAIL]`, `[PHONE / WHATSAPP]`, `[LINKEDIN]`, `[PORTFOLIO URL]`, `[BOOKING LINK]`, `[DATE]`
- [ ] Bio and 3 portfolio projects in `why-me-and-next-steps.md`
- [ ] Recipient name `[NAME]` in the emails

**Commercials:**
- [ ] Launch price and 3 monthly prices (`[₹ ...]`) in `pricing-and-maintenance-plans.md`, `full-proposal.md`, `executive-summary.md` and `pdf-src/proposal.html`
- [ ] Bracketed defaults: hours per plan, response times, minimum term, notice period, payment split, business hours
- [ ] Optional add-on prices (case-study writing, GBP and listings)

**Preview of the new site:**
- [ ] Deploy `03-new-site/dist` to a **private or unlisted preview URL** (for example Netlify Drop) and put it in `[PREVIEW URL]`. Add an `X-Robots-Tag: noindex` header to the preview so it never competes with the real site, and share the link only with KT INDIA.
- [ ] Optionally connect a test Formspree ID so the form works in the demo (`03-new-site/src/content.mjs`).

**Facts to confirm with the client later** (already marked as placeholders on the site; see `03-new-site/PLACEHOLDERS.md`): case studies, testimonials, team, deliverables, pricing approach, hours, reply time, privacy-notice details, careers form choice, logo decision.

## Risks and caveats (read before sending)

1. **Public repository.** This package sits in your `vyas-devgna/Portfolio` repository on branch `claude/vibrant-heisenberg-kr9bpl`. If that repo is public, or the branch is merged into the branch GitHub Pages serves, the audit and a copy of a site carrying KT INDIA's brand become publicly visible on your portfolio domain. **Recommendation:** move the package to a private repository (or delete the branch after downloading) and do not merge it into your site's main branch.
2. **Unsolicited redesign.** Present the new site as a proposal preview, not a live replacement. It uses KT INDIA's real content and identifiers, so keep the preview private and remove it if they decline.
3. **Logo.** The site uses the refreshed KAVAIYATECH / KT INDIA logo you supplied, rebuilt as vector SVG. Confirm with KT INDIA that this is their approved logo before you present it as theirs. If they prefer their current logo, it is kept in `03-new-site/src/logo-source.png` and the swap is documented in the README.
4. **Measurement limits.** The live site returned HTTP 403 to headless Chrome from the audit network, so Lighthouse scores for the current site come from a faithful local mirror (lab data). Real-user data, the SSL certificate details, LinkedIn/Instagram metrics and the Google Business Profile are **Not verified**. Social and competitor follower and client counts were not used as facts.
5. **No guarantees.** All outcomes are written as goals. Do not promise rankings, traffic or a number of leads.
6. **Legal.** The privacy notice is a draft aligned to the DPDP Act 2023 and needs the client's legal review. Prices exclude GST.
7. **Form not live.** The contact form needs the client's Formspree ID. The success and error paths were tested only with a mocked endpoint.
8. **Not tested yet:** real iOS Safari and Firefox devices, a screen-reader walk-through, live security-header scan after deployment. These are on the launch checklist.

## Verification summary

- Every audit finding has evidence (URL, file, header, DNS record or tool output). Items without access are marked "Not verified".
- Counts are consistent across the audit, CSV, proposal, emails and PDF: 33 findings (0 critical, 7 high, 14 medium, 12 low); new site 18 pages, 16 indexable.
- New site: Lighthouse **97–100 on all four categories** on all 16 indexable pages (mobile) and 4 key pages (desktop). Results: 0 broken links, 0 HTML validation errors, 10 of 10 redirect tests passed. Reduced motion and keyboard and touch navigation were verified.
- No invented clients, testimonials, awards or metrics. The old site's unsupported "05 major clients" claim is not reused.
