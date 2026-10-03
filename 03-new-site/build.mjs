// Zero-dependency static site generator for the KT INDIA site.
// Usage: node build.mjs   ->   writes ./dist (upload dist/ to any static host)
import { mkdirSync, rmSync, writeFileSync, cpSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, PROCESS, SERVICES, SECTORS, PROGRAMMES, PAPER, CAREERS } from './src/content.mjs';
import { markSvg } from './src/mark.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const BUILD_DATE = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
const placeholders = [];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const svc = (slug) => SERVICES.find((s) => s.slug === slug);
const abs = (path) => SITE.url + path;
const ORG_ID = SITE.url + '/#organization';

// ---------- shared fragments ----------
const NAV = [
  ['/services/', 'Services'],
  ['/work/', 'Work &amp; research'],
  ['/about/', 'About'],
  ['/careers/', 'Careers'],
];

const arrow = '<svg class="ico" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function header(path) {
  const links = NAV.map(([href, label]) => {
    const current = path === href || (href !== '/' && path.startsWith(href));
    return `<li><a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a></li>`;
  }).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="/" aria-label="KT INDIA home">${markSvg('mark brand-mark', 'gh')}<span class="brand-text"><strong>KT INDIA</strong><span>Kavaiya Technologies</span></span></a>
    <button class="menu-btn" type="button" popovertarget="site-nav" aria-label="Menu"><span></span><span></span><span></span></button>
    <nav class="site-nav" id="site-nav" popover aria-label="Main">
      <ul class="nav">${links}<li class="nav-cta"><a class="btn btn-sm" href="/contact/"${path === '/contact/' ? ' aria-current="page"' : ''}>Start a project</a></li></ul>
      <button class="menu-close" type="button" popovertarget="site-nav" popovertargetaction="hide" aria-label="Close menu">×</button>
    </nav>
  </div>
</header>`;
}

// Animated ecosystem orbit: 10 sector nodes (codes used on the original site), spokes, packets.
const SECTOR_CODES = ['AN', 'BC', 'DS', 'DX', 'ED', 'EL', 'GM', 'SC', 'SW', 'TC'];
function orbit(cls = '') {
  const spokes = SECTOR_CODES.map((_, i) => {
    const a = (i * 36 * Math.PI) / 180;
    return `<line x1="200" y1="200" x2="${(200 + 180 * Math.sin(a)).toFixed(1)}" y2="${(200 - 180 * Math.cos(a)).toFixed(1)}"/>`;
  }).join('');
  return `<div class="orbit ${cls}" aria-hidden="true">
  <div class="orbit-glow"></div>
  <div class="orbit-ring r1">
    <svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="180" class="ring"/><g class="spokes">${spokes}</g></svg>
    ${SECTOR_CODES.map((c, i) => `<span class="node n${i}"><span>${c}</span></span>`).join('')}
  </div>
  <div class="orbit-ring r2"><svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="112" class="ring ring-2"/><circle cx="200" cy="88" r="5" class="pkt"/><circle cx="312" cy="200" r="4" class="pkt pkt-b"/><circle cx="121" cy="279" r="4" class="pkt"/></svg></div>
  <div class="orbit-core">${markSvg('mark core-mark', 'gc' + cls.replace(/\W/g, ''))}</div>
</div>`;
}

// Line icons for services (24px grid, stroke-based).
const ICONS = {
  'custom-software-development': '<path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  'erp-point-of-sale': '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M13 17h8M17 13v8"/>',
  'ai-ml-development': '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 7l3.5 3.5M7 17l3.5-3.5M13.5 10.5 17 7M13.5 13.5 17 17"/>',
  'pcb-electronic-design': '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><circle cx="12" cy="12" r="2"/>',
  'smart-contract-development': '<rect x="2" y="8" width="8" height="8" rx="1.5"/><rect x="14" y="8" width="8" height="8" rx="1.5"/><path d="M10 12h4M6 8V5h12v3M6 16v3h12v-3"/>',
  'ui-ux-graphic-design': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/><circle cx="6" cy="6.5" r=".6"/>',
  'ip-protocol-development': '<path d="M2 12h3l2-6 3 12 3-9 2 5 2-2h5"/>',
  'research-technology-consulting': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5.5 5.5M8 10.5h5M10.5 8v5"/>',
};
const icon = (slug) => `<svg class="svc-ico" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[slug]}</svg>`;

function footer() {
  const a = SITE.address;
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <p class="footer-brand"><strong>KT INDIA</strong><br>${SITE.legalName}</p>
      <p class="muted">${SITE.tagline}</p>
    </div>
    <div>
      <h2 class="footer-h">Services</h2>
      <ul class="footer-list">${SERVICES.map((s) => `<li><a href="/services/${s.slug}/">${s.name}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="footer-h">Company</h2>
      <ul class="footer-list">
        <li><a href="/about/">About</a></li><li><a href="/work/">Work &amp; research</a></li><li><a href="/careers/">Careers</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy/">Privacy</a></li><li><a href="/terms/">Terms</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Contact</h2>
      <address class="footer-address">
        <a href="mailto:${SITE.email}">${SITE.email}</a><br>
        <a href="${SITE.whatsappLink}" rel="noopener">WhatsApp ${SITE.whatsapp}</a><br>
        ${a.street},<br>${a.city} ${a.postal}, ${a.region}, ${a.countryName}
      </address>
      <p class="footer-social"><a href="${SITE.linkedin}" rel="noopener">LinkedIn</a> · <a href="${SITE.instagram}" rel="noopener">Instagram</a></p>
    </div>
  </div>
  <div class="wrap footer-legal">
    <p>© <span>${new Date(BUILD_DATE).getFullYear()}</span> ${SITE.legalName} · CIN ${SITE.cin} · GSTIN ${SITE.gstin} · Startup India recognised (${SITE.startupIndia})</p>
  </div>
</footer>`;
}

function orgNode() {
  const a = SITE.address;
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: SITE.brand,
    legalName: SITE.legalName,
    alternateName: ['Kavaiya Technologies', 'Kavaiya Technologies India'],
    url: SITE.url + '/',
    logo: abs('/img/logo-512.png'),
    image: abs('/img/og-default.png'),
    slogan: SITE.tagline,
    foundingDate: SITE.founded,
    email: SITE.email,
    telephone: SITE.phoneE164,
    taxID: SITE.gstin,
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'CIN', value: SITE.cin },
      { '@type': 'PropertyValue', propertyID: 'Startup India Certificate', value: SITE.startupIndia },
    ],
    address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postal, addressCountry: a.country },
    areaServed: { '@type': 'Country', name: 'India' },
    sameAs: [SITE.linkedin, SITE.instagram],
    contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: SITE.email, telephone: SITE.phoneE164, availableLanguage: ['en'] },
  };
}

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

function crumbsHtml(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
    .map(([name, path], i) => (i === items.length - 1 ? `<li><span aria-current="page">${name}</span></li>` : `<li><a href="${path}">${name}</a></li>`))
    .join('')}</ol></nav>`;
}

function layout({ path, title, description, body, schema = [], noindex = false, ogType = 'website' }) {
  const url = abs(path);
  const fullTitle = title.includes('KT INDIA') ? title : `${title} | KT INDIA`;
  const graph = { '@context': 'https://schema.org', '@graph': [orgNode(), { '@type': 'WebPage', '@id': url + '#webpage', url, name: fullTitle, description, isPartOf: { '@id': SITE.url + '/#website' }, about: { '@id': ORG_ID }, inLanguage: 'en-IN' }, ...schema] };
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#0b0f1a">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="KT INDIA">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${abs('/img/og-default.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="KT INDIA, Kavaiya Technologies: software, AI and electronics engineering from Nadiad, Gujarat">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs('/img/og-default.png')}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/img/logo-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/css/site.css">
<script src="/js/site.js" defer></script>
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;
}

// ---------- reusable sections ----------
const serviceCard = (s) => `<li class="card svc-card rv">
  <p class="card-top">${icon(s.slug)}<span class="code">${s.code} · ${s.group}</span></p>
  <h3><a class="stretch" href="/services/${s.slug}/">${s.name}</a></h3>
  <p>${s.short}</p>
  <span class="more" aria-hidden="true">View service ${arrow}</span>
</li>`;

const processSteps = () => `<ol class="steps rv">${PROCESS.map(
  (p) => `<li><span class="step-n">${p.n}</span><h3>${p.name} <span class="muted">/ ${p.label}</span></h3><p>${p.text}</p></li>`
).join('')}</ol>`;

const ctaBand = (heading = 'Start with the problem, not the technology.', text = 'Tell us what you want to build, improve or investigate. We will tell you which combination of software, electronics, AI and design fits, and what it involves.') => `<section class="band band-dark cta-band" aria-labelledby="cta-h">
  <div class="wrap cta-row">
    <div><h2 id="cta-h">${heading}</h2><p>${text}</p></div>
    <p class="cta-actions"><a class="btn" href="/contact/">Start a project ${arrow}</a> <a class="btn btn-ghost" href="${SITE.whatsappLink}" rel="noopener">WhatsApp us</a></p>
  </div>
</section>`;

const factsStrip = () => `<div class="wrap"><dl class="facts-strip">
  <div><dt>Founded</dt><dd><span class="num">${SITE.founded}</span> Nadiad, Gujarat</dd></div>
  <div><dt>Services</dt><dd><span class="num">${SERVICES.length}</span> one team</dd></div>
  <div><dt>Technology sectors</dt><dd><span class="num">${SECTORS.length}</span> connected</dd></div>
  <div><dt>Startup India</dt><dd><span class="num">✓</span> recognised · <span class="mono">${SITE.startupIndia}</span></dd></div>
</dl></div>`;

const testimonialPlaceholder = () => `<figure class="quote quote-ph">
  <blockquote><p>{{ph:Client testimonial, quoted with written permission. Two or three sentences on the problem, what KT INDIA delivered and the result.}}</p></blockquote>
  <figcaption>{{ph:Name, role, organisation}}</figcaption>
</figure>`;

// ---------- pages ----------
const pages = [];
const add = (p) => pages.push(p);

// Home
add({
  path: '/',
  title: 'KT INDIA | Software, AI & Electronics Engineering in Nadiad, Gujarat',
  description: 'Kavaiya Technologies (KT INDIA) builds custom software, ERP and POS systems, AI/ML, smart contracts and PCB/embedded electronics from Nadiad, Gujarat.',
  schema: [{ '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: 'KT INDIA', alternateName: 'Kavaiya Technologies', publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' }],
  body: `<section class="hero" aria-labelledby="hero-h">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">Kavaiya Technologies · Nadiad, Gujarat · Est. ${SITE.founded}</p>
      <h1 id="hero-h">Software, AI and electronics, <span class="grad">engineered around your problem.</span></h1>
      <p class="lede">KT INDIA designs custom software, ERP and point-of-sale systems, machine learning, smart contracts and PCB and embedded electronics. One multidisciplinary team takes your requirement from first question to working product.</p>
      <p class="hero-actions"><a class="btn" href="/contact/">Start a project ${arrow}</a> <a class="btn btn-ghost" href="/services/">Explore services</a></p>
    </div>
    ${orbit('orbit-hero')}
  </div>
  ${factsStrip()}
</section>

<section class="band" aria-labelledby="svc-h">
  <div class="wrap">
    <div class="section-head rv"><p class="eyebrow">What we do</p><h2 id="svc-h">Eight services, one team</h2><p class="lede-sm">A project can combine several of these. You do not need to know which ones before you talk to us.</p></div>
    <ul class="grid grid-4 cards">${SERVICES.map(serviceCard).join('')}</ul>
  </div>
</section>

<section class="band band-alt" aria-labelledby="how-h">
  <div class="wrap">
    <div class="section-head rv"><p class="eyebrow">How we work</p><h2 id="how-h">Evidence before assumption</h2><p class="lede-sm">Every project, internal or for a client, follows the same four stages.</p></div>
    ${processSteps()}
  </div>
</section>

<section class="band" aria-labelledby="work-h">
  <div class="wrap">
    <div class="section-head rv"><p class="eyebrow">Work and research</p><h2 id="work-h">What we are building</h2></div>
    <div class="grid grid-3">
      <article class="card feature rv">
        <p class="code">Product · In development</p>
        <h3>ANNAVEDA</h3>
        <p>A planned lifestyle and nutrition app that combines Ayurveda-inspired principles with machine learning to suggest personalised dietary guidance. Target launch: December 2026 on Google Play.</p>
        <p><a href="/work/#annaveda">About ANNAVEDA ${arrow}</a></p>
      </article>
      <article class="card feature rv">
        <p class="code">White paper · ${PAPER.id}</p>
        <h3>Scalable embedded systems on ARM platforms</h3>
        <p>${PAPER.summary} Published ${PAPER.date}.</p>
        <p><a href="/work/#publications">Read the summary ${arrow}</a></p>
      </article>
      <article class="card feature card-ph rv">
        <p class="code">Case study</p>
        <h3>{{ph:Client project title}}</h3>
        <p>{{ph:Case study pending client permission: the problem, what was built, and a measurable result.}}</p>
        <p><a href="/work/#case-studies">See case studies ${arrow}</a></p>
      </article>
    </div>
    ${testimonialPlaceholder()}
  </div>
</section>

<section class="band band-alt" aria-labelledby="eco-h">
  <div class="wrap two-col">
    <div>
      <p class="eyebrow">The KT ecosystem</p>
      <h2 id="eco-h">Ten technology sectors behind every project</h2>
      <p>KT INDIA is organised as a connected ecosystem rather than separate departments. Research and education generate knowledge, engineering turns it into systems and products, and design and services put it in front of users.</p>
      <p>For clients, that means one point of contact for work that crosses software, hardware and AI.</p>
      <p><a href="/about/#sectors">Explore the ten sectors ${arrow}</a></p>
    </div>
    <ul class="sector-list rv">${SECTORS.map((s, i) => `<li><span class="mono">${String(i + 1).padStart(2, '0')}</span> ${s.name} <span class="tag">${s.status}</span></li>`).join('')}</ul>
  </div>
</section>
${ctaBand()}`,
});

// Services index
add({
  path: '/services/',
  title: 'Software, AI & Engineering Services',
  description: 'Custom software, ERP and POS, AI/ML, PCB and embedded electronics, smart contracts, UI/UX design, IP and research consulting from KT INDIA, Nadiad, Gujarat.',
  schema: [
    breadcrumb([['Home', '/'], ['Services', '/services/']]),
    {
      '@type': 'FAQPage',
      mainEntity: [
        ['Do I need to know which technology I need?', 'No. Start with the problem. KT INDIA evaluates which combination of software, electronics, AI/ML, design or blockchain fits, and explains why.'],
        ['Can one project combine several services?', 'Yes. A requirement can move across software, electronics, AI/ML, design, blockchain, research and product engineering within one team.'],
        ['Where is KT INDIA based?', 'The head office is in Nadiad, Gujarat, India.'],
        ['How do I start?', 'Send a short description of your problem through the contact form, by email to contact@kavaiyatech.com or on WhatsApp.'],
      ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ],
  body: `<section class="page-hero">
  <div class="wrap">
    ${crumbsHtml([['Home', '/'], ['Services', '/services/']])}
    <p class="eyebrow">Services</p>
    <h1>Software, AI and engineering services</h1>
    <p class="lede">Our service model lets a requirement move across several KT INDIA capabilities instead of forcing it into one technology category. A single project may combine software, electronics, AI/ML, design and research.</p>
  </div>
</section>
<section class="band" aria-labelledby="all-h">
  <div class="wrap">
    <h2 id="all-h" class="sr-only">All services</h2>
    <ul class="grid grid-2 cards">${SERVICES.map(serviceCard).join('')}</ul>
  </div>
</section>
<section class="band band-alt" aria-labelledby="how-h">
  <div class="wrap">
    <div class="section-head rv"><p class="eyebrow">Process</p><h2 id="how-h">How a project runs</h2></div>
    ${processSteps()}
  </div>
</section>
<section class="band" aria-labelledby="faq-h">
  <div class="wrap narrow">
    <h2 id="faq-h">Common questions</h2>
    <div class="faq">
      <details><summary>Do I need to know which technology I need?</summary><p>No. Start with the problem. We evaluate which combination of software, electronics, AI/ML, design or blockchain fits, and explain why.</p></details>
      <details><summary>Can one project combine several services?</summary><p>Yes. A requirement can move across software, electronics, AI/ML, design, blockchain, research and product engineering within one team.</p></details>
      <details><summary>Where are you based?</summary><p>Our head office is in Nadiad, Gujarat, India.</p></details>
      <details><summary>How do I start?</summary><p>Send a short description of your problem through the <a href="/contact/">contact form</a>, by email to <a href="mailto:${SITE.email}">${SITE.email}</a> or on <a href="${SITE.whatsappLink}" rel="noopener">WhatsApp</a>.</p></details>
      <details><summary>What does a project cost and how long does it take?</summary><p>{{ph:Client to confirm: typical engagement types, starting price range or how quotes are prepared, and typical timelines.}}</p></details>
    </div>
  </div>
</section>
${ctaBand()}`,
});

// Service detail pages
for (const s of SERVICES) {
  const path = `/services/${s.slug}/`;
  add({
    path,
    title: s.title,
    description: s.meta,
    schema: [
      breadcrumb([['Home', '/'], ['Services', '/services/'], [s.name, path]]),
      { '@type': 'Service', '@id': abs(path) + '#service', name: s.name, serviceType: s.name, description: s.short, url: abs(path), provider: { '@id': ORG_ID }, areaServed: { '@type': 'Country', name: 'India' } },
    ],
    body: `<section class="page-hero">
  <div class="wrap">
    ${crumbsHtml([['Home', '/'], ['Services', '/services/'], [s.name, path]])}
    <p class="eyebrow">${s.code} · ${s.group}</p>
    <h1>${s.name}</h1>
    <p class="lede">${s.short}</p>
    <p class="hero-actions"><a class="btn" href="/contact/?service=${s.slug}">Discuss your project ${arrow}</a></p>
    <div class="svc-glyph" aria-hidden="true">${icon(s.slug)}</div>
  </div>
</section>
<section class="band">
  <div class="wrap two-col">
    <div class="prose">${s.intro.map((p) => `<p>${p}</p>`).join('')}
      <h2>A good fit when</h2>
      <ul class="ticks">${s.fit.map((f) => `<li>${f}</li>`).join('')}</ul>
    </div>
    <aside class="card spec" aria-labelledby="inc-${s.slug}">
      <h2 id="inc-${s.slug}" class="spec-h">What this covers</h2>
      <ul class="chips">${s.includes.map((i) => `<li>${i}</li>`).join('')}</ul>
      <p class="muted small">Every project is scoped to the requirement. {{ph:Client to confirm typical deliverables, e.g. documentation, source code handover, support period.}}</p>
    </aside>
  </div>
</section>
<section class="band band-alt" aria-labelledby="how-h">
  <div class="wrap">
    <div class="section-head rv"><p class="eyebrow">Process</p><h2 id="how-h">How the work runs</h2></div>
    ${processSteps()}
  </div>
</section>
<section class="band" aria-labelledby="proof-h">
  <div class="wrap">
    <h2 id="proof-h">Related work</h2>
    <div class="grid grid-2">
      <article class="card card-ph"><p class="code">Case study</p><h3>{{ph:${s.name} project for a client}}</h3><p>{{ph:Pending client permission: problem, approach, result.}}</p></article>
      ${testimonialPlaceholder()}
    </div>
    <h2 class="mt">Related services</h2>
    <ul class="grid grid-3 cards">${s.related.map((r) => serviceCard(svc(r))).join('')}</ul>
  </div>
</section>
${ctaBand(`Need ${s.name.toLowerCase()}?`, 'Describe the requirement in a few lines. We will reply with questions, an approach and next steps.')}`,
  });
}

// Work & research
add({
  path: '/work/',
  title: 'Work, Products & Research',
  description: 'KT INDIA case studies, the ANNAVEDA product in development, current R&D programmes and the public white paper on ARM-based embedded systems.',
  schema: [
    breadcrumb([['Home', '/'], ['Work & research', '/work/']]),
    { '@type': 'TechArticle', '@id': abs('/work/#publications'), headline: PAPER.title, abstract: PAPER.summary, datePublished: '2026-07', author: PAPER.authors.map((n) => ({ '@type': 'Person', name: n })), publisher: { '@id': ORG_ID }, identifier: PAPER.id, url: abs(PAPER.file), keywords: PAPER.keywords.join(', ') },
  ],
  body: `<section class="page-hero">
  <div class="wrap">
    ${crumbsHtml([['Home', '/'], ['Work & research', '/work/']])}
    <p class="eyebrow">Work and research</p>
    <h1>From a question to working technology</h1>
    <p class="lede">Client projects, our own product and the research programmes that feed both.</p>
  </div>
</section>
<section class="band" id="case-studies" aria-labelledby="cs-h">
  <div class="wrap">
    <h2 id="cs-h">Case studies</h2>
    <p class="lede-sm">{{ph:Add two or three client case studies, each approved in writing by the client. Suggested structure: client and sector, problem, approach, technologies, result with a number where possible.}}</p>
    <div class="grid grid-3">
      ${[1, 2, 3].map((n) => `<article class="card card-ph"><p class="code">Case study 0${n}</p><h3>{{ph:Project title ${n}}}</h3><p>{{ph:Client, problem, approach, result}}</p></article>`).join('')}
    </div>
    ${testimonialPlaceholder()}
  </div>
</section>
<section class="band band-alt" id="annaveda" aria-labelledby="an-h">
  <div class="wrap two-col">
    <div>
      <p class="eyebrow">Product · In development</p>
      <h2 id="an-h">ANNAVEDA: personalised nutrition through Ayurveda and intelligence</h2>
      <p>ANNAVEDA is a planned lifestyle health application that will suggest dietary guidance based on Ayurveda-inspired principles and individual wellness data. Its machine-learning layer is intended to learn patterns related to dosha imbalance and support personalised recommendations.</p>
      <p class="muted small">ANNAVEDA is under development. Public functionality, recommendations and availability remain subject to validation, regulatory considerations and final release decisions.</p>
      <p><a href="/contact/?service=annaveda">Get ANNAVEDA updates ${arrow}</a></p>
    </div>
    <div class="an-side">
    <div class="layers" aria-hidden="true">
      <svg viewBox="0 0 240 240"><circle class="ly ly1" cx="120" cy="120" r="104"/><circle class="ly ly2" cx="120" cy="120" r="76"/><circle class="ly ly3" cx="120" cy="120" r="48"/><circle class="ly-core" cx="120" cy="120" r="20"/></svg>
      <span class="ly-l l1">Ayurveda</span><span class="ly-l l2">Data</span><span class="ly-l l3">ML</span>
    </div>
    <dl class="card facts">
      <div><dt>Model</dt><dd>Free + subscription</dd></div>
      <div><dt>Platform</dt><dd>Google Play</dd></div>
      <div><dt>Data approach</dt><dd>API-based dataset</dd></div>
      <div><dt>Target</dt><dd>December 2026</dd></div>
      <div><dt>Layers</dt><dd>Ayurveda knowledge · personal data · machine learning</dd></div>
    </dl>
    </div>
  </div>
</section>
<section class="band" id="research" aria-labelledby="rd-h">
  <div class="wrap">
    <div class="section-head rv"><p class="eyebrow">Research and development</p><h2 id="rd-h">Programmes in motion</h2><p class="lede-sm">Research at KT INDIA is meant to move beyond theory: selected outcomes become prototypes, IP, products, services and publications.</p></div>
    <ul class="grid grid-2 cards">${PROGRAMMES.map((p) => `<li class="card"><p class="code">${p.id} · ${p.area} · <span class="tag">${p.access}</span></p><h3>${p.name}</h3><p>${p.text}</p></li>`).join('')}</ul>
    <p class="mt"><a href="/services/research-technology-consulting/">Propose a research collaboration ${arrow}</a></p>
  </div>
</section>
<section class="band band-alt" id="publications" aria-labelledby="pub-h">
  <div class="wrap two-col">
    <div>
      <p class="eyebrow">Publications</p>
      <h2 id="pub-h" class="pub-title">${PAPER.title}</h2>
      <p>${PAPER.summary}</p>
      <p class="muted small">Authors: ${PAPER.authors.join(', ')}. Published ${PAPER.date}. Technical white paper, public.</p>
      <p><a class="btn btn-dark" href="${PAPER.file}">Download the white paper <span class="small">(${PAPER.sizeLabel})</span></a></p>
    </div>
    <div class="paper" aria-hidden="true">
      <p class="paper-id">${PAPER.id} · REV ${PAPER.rev}</p>
      <p class="paper-title">Scalable embedded system solutions using ARM-based platforms</p>
      <p class="paper-meta">KT INDIA · Technical white paper · ${PAPER.date}</p>
      <p class="paper-kw">${PAPER.keywords.join(' · ')}</p>
    </div>
  </div>
</section>
${ctaBand()}`,
});

// About
add({
  path: '/about/',
  title: 'About Kavaiya Technologies',
  description: 'Kavaiya Technologies India Private Limited (KT INDIA) is a research-driven technology company founded in 2024 in Nadiad, Gujarat, working across ten technology sectors.',
  schema: [breadcrumb([['Home', '/'], ['About', '/about/']]), { '@type': 'AboutPage', '@id': abs('/about/') + '#about', url: abs('/about/'), about: { '@id': ORG_ID } }],
  body: `<section class="page-hero">
  <div class="wrap">
    ${crumbsHtml([['Home', '/'], ['About', '/about/']])}
    <p class="eyebrow">About KT INDIA</p>
    <h1>A multidisciplinary technology company built for research, innovation and impact</h1>
    <p class="lede">Kavaiya Technologies India Private Limited, operating as KT INDIA, was established in ${SITE.founded} with its head office in Nadiad, Gujarat. We integrate science, engineering, AI and machine learning, software, electronics, semiconductors, blockchain, design and education to develop practical solutions for industry, research and society.</p>
  </div>
</section>
<section class="band">
  <div class="wrap"><div class="grid grid-2">
    <article class="card"><p class="code">Vision</p><h2 class="h3">Technology for mankind</h2><p>To build KT INDIA into a globally respected technology ecosystem that serves mankind through responsible innovation, research, engineering excellence and meaningful technology products.</p></article>
    <article class="card"><p class="code">Mission</p><h2 class="h3">Research → engineering → impact</h2><p>To integrate AI/ML, science, engineering, design, management, data and multidisciplinary knowledge into products, services, research and intellectual property that create measurable value.</p></article>
  </div></div>
</section>
<section class="band band-alt" aria-labelledby="phil-h">
  <div class="wrap">
    <div class="section-head rv"><p class="eyebrow">Operating philosophy</p><h2 id="phil-h">Ecosystem driven by sense and statistics</h2><p class="lede-sm">Evidence, engineering fundamentals and multidisciplinary thinking guide how ideas become technology. Research, engineering, design, management and commercial thinking work together, not as isolated functions.</p></div>
    <ol class="flow">${['Science · Understand', 'Research · Discover', 'Engineering · Build', 'Product · Deploy', 'Impact · Serve'].map((x) => `<li>${x}</li>`).join('')}</ol>
  </div>
</section>
<section class="band" id="sectors" aria-labelledby="sec-h">
  <div class="wrap">
    <div class="sectors-intro"><div class="section-head rv"><p class="eyebrow">The KT ecosystem</p><h2 id="sec-h">Ten connected sectors</h2><p class="lede-sm">Discovery and Education create and share knowledge. Engineering sectors turn it into systems, products and IP. Design, Animation and Services connect technology with users and organisations.</p></div>${orbit('orbit-about')}</div>
    <ul class="grid grid-2 cards">${SECTORS.map((s, i) => `<li class="card sector rv"><p class="code">${String(i + 1).padStart(2, '0')} · <span class="tag">${s.status}</span></p><h3>${s.name}</h3><p>${s.text}</p></li>`).join('')}</ul>
    <p class="muted small mt">Our sector work is aligned with the <a href="https://sdgs.un.org/goals" rel="noopener">UN Sustainable Development Goals</a> 4, 9, 12 and 17.</p>
  </div>
</section>
<section class="band band-alt" aria-labelledby="team-h">
  <div class="wrap">
    <h2 id="team-h">Leadership and team</h2>
    <div class="grid grid-3">${[1, 2, 3].map((n) => `<article class="card card-ph"><h3>{{ph:Name ${n}}}</h3><p>{{ph:Role and a two-line bio. Add a photo (square, at least 400 px).}}</p></article>`).join('')}</div>
  </div>
</section>
<section class="band" aria-labelledby="where-h">
  <div class="wrap two-col">
    <div>
      <h2 id="where-h">Where we are</h2>
      <p><strong>Head office: Nadiad, Gujarat, India.</strong><br>${SITE.address.street}, ${SITE.address.city} ${SITE.address.postal}. Corporate and R&amp;D operations.</p>
      <p><strong>Planned: Dubai, UAE.</strong><br>IFZA Business Park, Building A2, Dubai Silicon Oasis. Planned semiconductor sector expansion.</p>
      <p><a href="${SITE.mapsLink}" rel="noopener">Open the head office in Google Maps ${arrow}</a></p>
    </div>
    <dl class="card facts">
      <div><dt>Legal name</dt><dd>${SITE.legalName}</dd></div>
      <div><dt>CIN</dt><dd class="mono">${SITE.cin}</dd></div>
      <div><dt>GSTIN</dt><dd class="mono">${SITE.gstin}</dd></div>
      <div><dt>Startup India</dt><dd>Recognised startup, certificate <span class="mono">${SITE.startupIndia}</span></dd></div>
      <div><dt>BHASKAR ID</dt><dd class="mono">${SITE.bhaskar}</dd></div>
      <div><dt>ISO</dt><dd>Application in progress</dd></div>
    </dl>
  </div>
</section>
${ctaBand()}`,
});

// Careers
add({
  path: '/careers/',
  title: 'Careers & Internships',
  description: 'Rolling internships (3 to 12 months) and selected roles at KT INDIA, Nadiad, across software, AI/ML, electronics, VLSI, telecom, blockchain, design and research.',
  schema: [breadcrumb([['Home', '/'], ['Careers', '/careers/']])],
  body: `<section class="page-hero">
  <div class="wrap">
    ${crumbsHtml([['Home', '/'], ['Careers', '/careers/']])}
    <p class="eyebrow">Careers · Internships · Research</p>
    <h1>Learn, build and contribute with KT INDIA</h1>
    <p class="lede">We accept rolling applications for internships and selected professional opportunities across the technology ecosystem. Selection is based on fundamentals, demonstrated ability, project fit, learning capability and the needs of active programmes.</p>
  </div>
</section>
<section class="band" aria-labelledby="dur-h">
  <div class="wrap">
    <h2 id="dur-h">Internship durations</h2>
    <p class="lede-sm">State a preferred duration. Final duration, project and responsibility are decided after evaluation.</p>
    <ul class="grid grid-4 cards">${CAREERS.durations.map((d) => `<li class="card"><p class="big">${d.months}<span> months</span></p><h3>${d.name}</h3><p>${d.text}</p></li>`).join('')}</ul>
  </div>
</section>
<section class="band band-alt" aria-labelledby="sel-h">
  <div class="wrap two-col">
    <div><h2 id="sel-h">How we select</h2><ol class="numbered">${CAREERS.steps.map((s) => `<li>${s}</li>`).join('')}</ol></div>
    <div><h2>Where you can contribute</h2><ul class="chips">${CAREERS.areas.map((a) => `<li>${a}</li>`).join('')}</ul>
    <p class="muted small">A rolling application does not imply an immediate vacancy. We contact candidates when a profile matches a relevant opportunity.</p></div>
  </div>
</section>
<section class="band" aria-labelledby="apply-h">
  <div class="wrap narrow">
    <h2 id="apply-h">Apply</h2>
    <p>Email your CV and a short note with your preferred role, preferred duration, availability date and links to your work (GitHub, portfolio, publications).</p>
    <p><a class="btn btn-dark" href="mailto:${SITE.email}?subject=Career%20application">Email your application</a></p>
    <p class="muted small">{{ph:Client to decide: keep email applications, or reconnect the existing careers form (api/apply.php) if the site stays on the current PHP hosting.}} See the <a href="/terms/#applications">recruitment notice</a> and <a href="/privacy/">privacy notice</a>.</p>
  </div>
</section>`,
});

// Contact
const serviceOptions = [...SERVICES.map((s) => [s.slug, s.name]), ['research-collaboration', 'Research collaboration'], ['annaveda', 'ANNAVEDA updates'], ['not-sure', 'Not sure yet']];
add({
  path: '/contact/',
  title: 'Contact KT INDIA',
  description: 'Start a software, AI or engineering project with KT INDIA, Nadiad, Gujarat. Contact form, email contact@kavaiyatech.com or WhatsApp.',
  schema: [breadcrumb([['Home', '/'], ['Contact', '/contact/']]), { '@type': 'ContactPage', '@id': abs('/contact/') + '#contact', url: abs('/contact/'), about: { '@id': ORG_ID } }],
  body: `<section class="page-hero">
  <div class="wrap">
    ${crumbsHtml([['Home', '/'], ['Contact', '/contact/']])}
    <p class="eyebrow">Contact</p>
    <h1>Tell us about the problem</h1>
    <p class="lede">A few lines are enough. We reply with questions, a suggested approach and next steps. {{ph:Client to confirm reply time, e.g. "within one working day".}}</p>
  </div>
</section>
<section class="band">
  <div class="wrap contact-grid">
    <form class="form card" id="contact-form" action="${SITE.formAction}" method="POST" accept-charset="UTF-8">
      <input type="hidden" name="_subject" value="New enquiry from kavaiyatech.com">
      <input type="hidden" name="_next" value="${abs('/thank-you/')}">
      <div class="hp" aria-hidden="true"><label for="f-gotcha">Leave this field empty</label><input type="text" id="f-gotcha" name="_gotcha" tabindex="-1" autocomplete="off"></div>
      <div class="field-row">
        <div class="field"><label for="f-name">Name <span class="req">(required)</span></label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
        <div class="field"><label for="f-email">Email <span class="req">(required)</span></label><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="160"></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="f-phone">Phone or WhatsApp <span class="opt">(optional)</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="30"></div>
        <div class="field"><label for="f-org">Organisation <span class="opt">(optional)</span></label><input id="f-org" name="organisation" type="text" autocomplete="organization" maxlength="120"></div>
      </div>
      <div class="field"><label for="f-service">What is it about?</label>
        <select id="f-service" name="service">${serviceOptions.map(([v, l]) => `<option value="${v}"${v === 'not-sure' ? ' selected' : ''}>${l}</option>`).join('')}</select>
      </div>
      <div class="field"><label for="f-msg">Your problem or idea <span class="req">(required)</span></label><textarea id="f-msg" name="message" rows="6" required minlength="10" maxlength="5000" aria-describedby="f-msg-hint"></textarea><p class="hint" id="f-msg-hint">What do you want to build, improve or investigate? Any deadline or budget range helps.</p></div>
      <div class="field check"><input id="f-consent" name="consent" type="checkbox" value="yes" required><label for="f-consent">I agree that KT INDIA may use these details to reply to my enquiry, as described in the <a href="/privacy/">privacy notice</a>.</label></div>
      <p><button class="btn btn-dark" type="submit">Send enquiry</button></p>
      <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
    </form>
    <aside class="contact-side">
      <div class="card">
        <h2 class="h3">Direct</h2>
        <ul class="plain">
          <li><span class="code">Email</span><br><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li><span class="code">Business WhatsApp</span><br><a href="${SITE.whatsappLink}" rel="noopener">${SITE.whatsapp}</a></li>
          <li><span class="code">Hours</span><br>{{ph:Client to confirm public business hours}}</li>
        </ul>
      </div>
      <div class="card">
        <h2 class="h3">Head office</h2>
        <address>${SITE.address.street}<br>${SITE.address.city} ${SITE.address.postal}<br>${SITE.address.region}, ${SITE.address.countryName}</address>
        <p><a href="${SITE.mapsLink}" rel="noopener">Open in Google Maps ${arrow}</a></p>
      </div>
      <div class="card">
        <h2 class="h3">Research and careers</h2>
        <p>Universities, laboratories and researchers: choose "Research collaboration" in the form. Applicants: see <a href="/careers/">Careers</a>.</p>
      </div>
    </aside>
  </div>
</section>`,
});

// Thank you
add({
  path: '/thank-you/',
  title: 'Thank you',
  description: 'Your enquiry has been sent to KT INDIA.',
  noindex: true,
  body: `<section class="page-hero"><div class="wrap narrow">
  <p class="eyebrow">Message sent</p>
  <h1>Thank you. Your enquiry is with us.</h1>
  <p class="lede">We will reply to the email address you gave. If it is urgent, message us on <a href="${SITE.whatsappLink}" rel="noopener">WhatsApp</a>.</p>
  <p class="hero-actions"><a class="btn" href="/services/">Back to services</a> <a class="btn btn-ghost" href="/">Home</a></p>
</div></section>`,
});

// Privacy
add({
  path: '/privacy/',
  title: 'Privacy Notice',
  description: 'How Kavaiya Technologies India Private Limited (KT INDIA) collects, uses and protects personal data submitted through this website.',
  schema: [breadcrumb([['Home', '/'], ['Privacy', '/privacy/']])],
  body: `<section class="page-hero"><div class="wrap narrow">
  ${crumbsHtml([['Home', '/'], ['Privacy', '/privacy/']])}
  <h1>Privacy notice</h1>
  <p class="muted">Last updated: {{ph:date of publication}}. {{ph:Draft for review by the company's legal adviser before publication.}}</p>
</div></section>
<section class="band"><div class="wrap narrow prose">
  <h2 id="who">Who we are</h2>
  <p>${SITE.legalName} ("KT INDIA", "we"), CIN ${SITE.cin}, ${SITE.address.street}, ${SITE.address.city} ${SITE.address.postal}, ${SITE.address.region}, India, decides how personal data submitted through this website is used. We follow the Digital Personal Data Protection Act, 2023 and the rules made under it.</p>
  <h2 id="what">What we collect</h2>
  <ul>
    <li><strong>Enquiries:</strong> name, email, optional phone and organisation, the topic and your message.</li>
    <li><strong>Job and internship applications</strong> sent by email: the details and documents you choose to send.</li>
    <li><strong>Technical data:</strong> our hosting provider may keep standard server logs (IP address, browser, pages requested) for security. {{ph:Client to confirm hosting provider and log retention.}}</li>
  </ul>
  <p>Please send only what is relevant. Do not send passwords, bank details or identity documents unless we ask through a verified company channel.</p>
  <h2 id="why">Why we use it</h2>
  <p>To reply to your enquiry, to discuss and deliver a project you ask about, to assess applications and to keep the website secure. We do not sell personal data and do not use it for advertising.</p>
  <h2 id="processors">Who processes it for us</h2>
  <p>Contact-form submissions are delivered to us through Formspree (Formspree, Inc., United States), which also filters spam. {{ph:Client to confirm the form provider and any analytics tool used.}} WhatsApp, LinkedIn and Instagram have their own privacy notices that apply when you use them.</p>
  <h2 id="retention">How long we keep it</h2>
  <p>{{ph:Client to confirm, e.g. enquiries 24 months after the last contact; applications 12 months; then deleted.}}</p>
  <h2 id="storage">Cookies and local storage</h2>
  <p>This website does not set cookies and does not use analytics or advertising trackers. {{ph:Update this section if analytics is added.}}</p>
  <h2 id="rights">Your rights</h2>
  <p>You can ask to access, correct or erase your personal data, withdraw consent, or nominate someone to act for you. Email <a href="mailto:${SITE.email}">${SITE.email}</a> with enough detail to identify your request. We may need to verify your identity.</p>
  <h2 id="grievance">Grievance contact</h2>
  <p>{{ph:Name and designation of the grievance officer}}, <a href="mailto:${SITE.email}">${SITE.email}</a>. If you are not satisfied with our response, you may approach the Data Protection Board of India.</p>
</div></section>`,
});

// Terms
add({
  path: '/terms/',
  title: 'Website Terms, Disclaimer & Recruitment Notice',
  description: 'Website terms, disclaimer and recruitment notice for kavaiyatech.com, operated by Kavaiya Technologies India Private Limited.',
  schema: [breadcrumb([['Home', '/'], ['Terms', '/terms/']])],
  body: `<section class="page-hero"><div class="wrap narrow">
  ${crumbsHtml([['Home', '/'], ['Terms', '/terms/']])}
  <h1>Website terms, disclaimer and recruitment notice</h1>
</div></section>
<section class="band"><div class="wrap narrow prose">
  <h2 id="terms">Website terms</h2>
  <p>Use this website for lawful enquiries, to learn about KT INDIA and to submit accurate applications. Do not attempt to disrupt the website, gain unauthorised access, impersonate others or upload malicious files.</p>
  <p>Website content describes the company's activities and interests. An enquiry or application does not create a service contract, employment relationship or commitment to collaborate. Project scope, prices, timelines, deliverables and commercial terms must be agreed separately in writing.</p>
  <p>Respect intellectual property rights in website text, branding, designs and publications. Any licence accompanying a publication governs its permitted use.</p>
  <h2 id="disclaimer">Disclaimer</h2>
  <p>Website information is provided for general information and may change as projects and research develop. Research concepts, prototypes, proposed products and future programmes should not be treated as confirmed commercial availability, certification or guaranteed results. Confirm specifications, suitability and availability with the company before relying on them for a purchase or project decision.</p>
  <p>External links are provided for convenience; their content is controlled by their operators. Nothing in these notices excludes rights or obligations that cannot be excluded under applicable law.</p>
  <h2 id="applications">Recruitment notice</h2>
  <p>Submitting a profile expresses interest in an opportunity and does not guarantee an interview, internship, employment or selection. Availability, eligibility, duration and offer terms are subject to evaluation and written confirmation. An acknowledgement confirms receipt, not selection. For corrections or withdrawal, email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
  <h2 id="company">Company</h2>
  <p>${SITE.legalName} · CIN ${SITE.cin} · GSTIN ${SITE.gstin} · <a href="mailto:${SITE.email}">${SITE.email}</a></p>
</div></section>`,
});

// 404
add({
  path: '/404.html',
  file: '404.html',
  title: 'Page not found',
  description: 'The page you were looking for is not on kavaiyatech.com.',
  noindex: true,
  body: `<section class="page-hero"><div class="wrap narrow">
  <p class="eyebrow">Error 404</p>
  <h1>This page does not exist, or it moved.</h1>
  <p class="lede">The site was reorganised into separate pages. These are the most useful places to start:</p>
  <ul class="grid grid-2 cards">
    <li class="card"><h2 class="h3"><a class="stretch" href="/services/">Services</a></h2><p>Software, AI, electronics, blockchain, design and research.</p></li>
    <li class="card"><h2 class="h3"><a class="stretch" href="/work/">Work and research</a></h2><p>ANNAVEDA, R&amp;D programmes and the white paper.</p></li>
    <li class="card"><h2 class="h3"><a class="stretch" href="/careers/">Careers</a></h2><p>Internships and rolling roles.</p></li>
    <li class="card"><h2 class="h3"><a class="stretch" href="/contact/">Contact</a></h2><p>Start a project or ask a question.</p></li>
  </ul>
</div></section>`,
});

// ---------- placeholders ----------
function renderPlaceholders(html, path) {
  return html.replace(/\{\{ph:([\s\S]*?)\}\}/g, (_, text) => {
    placeholders.push([path, text.trim()]);
    return `<mark class="ph">[${text.trim()}]</mark>`;
  });
}

// ---------- write ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'src/static'), DIST, { recursive: true });

for (const p of pages) {
  let html = layout(p);
  const headEnd = html.indexOf('</head>');
  if (/\{\{ph:/.test(html.slice(0, headEnd))) throw new Error(`Placeholder inside <head> on ${p.path}`);
  html = renderPlaceholders(html, p.path);
  // Escape stray ampersands in markup (JSON-LD script content is left untouched).
  html = html.split(/(<script type="application\/ld\+json">[\s\S]*?<\/script>)/).map((part, i) => (i % 2 ? part : part.replace(/&(?!#?\w+;)/g, '&amp;'))).join('');
  const out = p.file ? join(DIST, p.file) : join(DIST, p.path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const indexable = pages.filter((p) => !p.noindex);
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
    .map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${BUILD_DATE}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`
);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /thank-you/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

// Placeholder report for the client hand-over
const report = ['# Placeholders to fill (generated by build.mjs)', '', '| Page | Placeholder |', '|---|---|', ...placeholders.map(([p, t]) => `| ${p} | ${t.replace(/\|/g, '/')} |`), ''];
writeFileSync(join(ROOT, 'PLACEHOLDERS.md'), report.join('\n'));

if (SITE.formAction.includes('FORM_ID')) console.warn('NOTE: contact form endpoint is still the FORM_ID placeholder (see README).');
console.log(`Built ${pages.length} pages, ${indexable.length} in sitemap, ${placeholders.length} placeholders -> dist/`);
