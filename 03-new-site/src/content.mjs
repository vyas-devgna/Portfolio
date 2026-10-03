// All site copy lives here. Facts come from the live kavaiyatech.com (audited 2026-10-03).
// Anything not published by the client is a placeholder: {{ph:...}} renders as a visible marked note.

export const SITE = {
  url: 'https://www.kavaiyatech.com',
  brand: 'KT INDIA',
  name: 'Kavaiya Technologies',
  legalName: 'Kavaiya Technologies India Private Limited',
  tagline: 'Ecosystem driven by sense and statistics.',
  founded: '2024',
  email: 'contact@kavaiyatech.com',
  whatsapp: '+91 92270 02010',
  whatsappLink: 'https://wa.me/919227002010',
  phoneE164: '+919227002010',
  address: {
    street: 'A8-Shiv Residency, Zalak Canal Ring Road',
    city: 'Nadiad',
    region: 'Gujarat',
    postal: '387002',
    country: 'IN',
    countryName: 'India',
  },
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=A8-Shiv+Residency%2C+Zalak+Canal+Ring+Road%2C+Nadiad+387002%2C+Gujarat',
  cin: 'U62011GJ2024PTC148370',
  gstin: '24AAKCK8001G1ZR',
  startupIndia: 'DIPP191925',
  bhaskar: 'OI-0225-9146BB',
  linkedin: 'https://www.linkedin.com/company/105395125/',
  instagram: 'https://www.instagram.com/kavaiyatech/',
  // Formspree form endpoint. Replace FORM_ID after creating the form at formspree.io.
  formAction: 'https://formspree.io/f/FORM_ID',
};

export const PROCESS = [
  { n: '01', name: 'Discover', label: 'Research', text: 'Define the real problem, the users and the constraints before choosing a technology.' },
  { n: '02', name: 'Engineer', label: 'Build', text: 'Design and build across software, electronics and AI, using whichever combination fits.' },
  { n: '03', name: 'Validate', label: 'Evidence', text: 'Test against the requirement with data, not assumptions. Evidence before assumption.' },
  { n: '04', name: 'Deliver', label: 'Impact', text: 'Ship a working system, document it and support it as it is used.' },
];

export const SERVICES = [
  {
    slug: 'custom-software-development',
    code: 'SW-01',
    group: 'Software',
    name: 'Custom software development',
    short: 'Web, mobile, desktop and cross-platform software designed around your requirement.',
    title: 'Custom Software Development in Gujarat',
    meta: 'Custom web, mobile, desktop and cross-platform software from KT INDIA, Nadiad, Gujarat. Built around your requirement, from first prototype to production.',
    intro: [
      'Off-the-shelf software makes you change how you work. Custom software starts from how your organisation actually works and builds the tool around it.',
      'KT INDIA designs and develops web applications, mobile apps, desktop software and cross-platform products, along with the APIs that connect them to the systems you already use.',
    ],
    includes: ['Web applications', 'Mobile apps', 'Desktop software', 'Cross-platform apps', 'APIs and integrations', 'Prototypes and MVPs'],
    fit: [
      'Your process does not fit an off-the-shelf product.',
      'You need two systems to talk to each other.',
      'You want a working prototype before committing to a full build.',
    ],
    related: ['erp-point-of-sale', 'ai-ml-development', 'ui-ux-graphic-design'],
  },
  {
    slug: 'erp-point-of-sale',
    code: 'SW-02',
    group: 'Software',
    name: 'ERP and point-of-sale systems',
    short: 'Business-management, workflow, inventory and point-of-sale systems built for how you operate.',
    title: 'ERP & Point-of-Sale Software Development in Gujarat',
    meta: 'Customised ERP, inventory, workflow and point-of-sale (POS) systems with dashboards, built by KT INDIA in Nadiad, Gujarat.',
    intro: [
      'Growing businesses usually outgrow spreadsheets and generic billing software at the same time. A customised ERP and point-of-sale system puts stock, sales, workflow and reporting in one place.',
      'KT INDIA builds business-management and point-of-sale systems with the dashboards and database design to match, so the numbers you need are visible without manual reconciliation.',
    ],
    includes: ['ERP modules', 'Point of sale and billing', 'Inventory management', 'Workflow automation', 'Dashboards and reporting', 'Database design'],
    fit: [
      'Sales, stock and accounts live in different tools.',
      'Your counter billing does not match your back-office records.',
      'You need reports that today take hours to assemble.',
    ],
    related: ['custom-software-development', 'ai-ml-development', 'ui-ux-graphic-design'],
  },
  {
    slug: 'ai-ml-development',
    code: 'AI-01',
    group: 'Intelligence',
    name: 'AI and machine learning development',
    short: 'Machine-learning prototypes, analytics and intelligent software integrated into real products.',
    title: 'AI & Machine Learning Development in Gujarat',
    meta: 'AI/ML prototypes, analytics and intelligent software from KT INDIA, Nadiad. Practical machine learning integrated into products and workflows.',
    intro: [
      'Useful AI starts with a clear question and the right data, not with a model. KT INDIA scopes the problem first, then builds machine-learning prototypes, analytics and intelligent features that fit into your software.',
      'The team applies the same approach in its own product work: the ANNAVEDA personalisation engine is an in-house ML and recommendation-system research programme.',
    ],
    includes: ['ML prototypes', 'Data analysis and analytics', 'Recommendation systems', 'Intelligent software features', 'AI integration into existing products'],
    fit: [
      'You have data but no clear way to use it.',
      'You want to test whether an AI feature is worth building.',
      'You need ML added to an existing product.',
    ],
    related: ['custom-software-development', 'research-technology-consulting', 'erp-point-of-sale'],
  },
  {
    slug: 'pcb-electronic-design',
    code: 'EL-01',
    group: 'Electronics',
    name: 'PCB and electronic design',
    short: 'Circuit design, PCB development, embedded systems and customised electronics engineering.',
    title: 'PCB Design & Embedded Electronics in Gujarat',
    meta: 'Electronic circuit design, PCB development, embedded systems and prototypes from KT INDIA, Nadiad, Gujarat.',
    intro: [
      'Hardware decisions made early are expensive to change later. KT INDIA takes electronic products from circuit design through PCB development, embedded firmware and prototype.',
      'The team has published a technical white paper on scalable embedded systems using ARM-based platforms, covering platform selection, firmware architecture and safety qualification.',
    ],
    includes: ['Circuit design', 'PCB development', 'Embedded systems', 'Protocols and standards', 'Prototypes', 'Customised electronic products'],
    fit: [
      'You need a custom board rather than an off-the-shelf module.',
      'You have a prototype that needs to become a product.',
      'Your product needs hardware and software designed together.',
    ],
    related: ['ip-protocol-development', 'custom-software-development', 'research-technology-consulting'],
  },
  {
    slug: 'smart-contract-development',
    code: 'BC-01',
    group: 'Blockchain',
    name: 'Smart contract development',
    short: 'Smart contracts, blockchain applications and private-network proofs of concept.',
    title: 'Smart Contract & Blockchain Development in Gujarat',
    meta: 'Smart contracts, decentralised applications and private blockchain proofs of concept from KT INDIA, Nadiad, Gujarat.',
    intro: [
      'Blockchain is useful when several parties need to trust a shared record without trusting each other. KT INDIA helps decide whether that applies to you, then builds it.',
      'Work covers smart contracts, decentralised applications, private blockchain networks and utility-oriented digital ecosystems, starting with a proof of concept.',
    ],
    includes: ['Smart contracts', 'Decentralised applications (dApps)', 'Private blockchain networks', 'Proofs of concept', 'Utility-oriented digital ecosystems'],
    fit: [
      'Several organisations need one trusted record.',
      'You want to test a blockchain idea before investing in it.',
      'You need a private network rather than a public chain.',
    ],
    related: ['custom-software-development', 'research-technology-consulting', 'ip-protocol-development'],
  },
  {
    slug: 'ui-ux-graphic-design',
    code: 'DS-01',
    group: 'Design',
    name: 'Graphics and UI/UX design',
    short: 'Interfaces, graphics, templates, icons and reusable visual systems.',
    title: 'UI/UX & Graphic Design in Gujarat',
    meta: 'UI/UX design, graphics, professional documents, templates, icons and brand assets from KT INDIA, Nadiad, Gujarat.',
    intro: [
      'Good software still fails if people cannot use it. KT INDIA designs interfaces and the visual systems around them: graphics, professional documents, templates, icons and brand assets.',
      'Because design sits in the same team as engineering, interfaces are designed to be built, and built the way they were designed.',
    ],
    includes: ['UI/UX design', 'Graphics', 'Professional documents and templates', 'Icons', 'Brand assets', 'Design systems'],
    fit: [
      'Your product works but is hard to use.',
      'You need a consistent look across documents and screens.',
      'You are starting a product and want the interface right first.',
    ],
    related: ['custom-software-development', 'erp-point-of-sale', 'ai-ml-development'],
  },
  {
    slug: 'ip-protocol-development',
    code: 'IP-01',
    group: 'R&D',
    name: 'IP and protocol development',
    short: 'Technical research, proprietary protocol concepts, architecture and documentation.',
    title: 'IP & Protocol Development',
    meta: 'Technical research, protocol concepts, system architecture and IP-oriented documentation from KT INDIA, Nadiad, Gujarat.',
    intro: [
      'Some problems need new technology, not just new software. KT INDIA carries out technical research, develops proprietary protocol concepts and architecture, and documents the work so it can be protected and built on.',
      'Current in-house programmes include a DDR7-oriented memory protocol stack and 6G applicability research.',
    ],
    includes: ['Technical research', 'Protocol concepts', 'System architecture', 'Technical documentation', 'IP-oriented work'],
    fit: [
      'You are developing technology you may want to protect.',
      'You need an architecture before you can build.',
      'You need technical documentation written to a high standard.',
    ],
    related: ['research-technology-consulting', 'pcb-electronic-design', 'smart-contract-development'],
  },
  {
    slug: 'research-technology-consulting',
    code: 'RD-01',
    group: 'R&D',
    name: 'Research and technology consulting',
    short: 'Problem definition, technical investigation, architecture, prototypes and R&D collaboration.',
    title: 'Research & Technology Consulting',
    meta: 'Problem definition, technical investigation, architecture, prototypes and R&D collaboration with KT INDIA, Nadiad, Gujarat.',
    intro: [
      'Not sure which technology you need? That is the right place to start. KT INDIA helps define the problem, investigates the options and recommends the combination that fits.',
      'The team also welcomes research collaboration with universities, laboratories, researchers and technology organisations.',
    ],
    includes: ['Problem definition', 'Technical investigation', 'Architecture', 'Prototypes', 'R&D collaboration'],
    fit: [
      'You know the problem but not the solution.',
      'You need an independent technical view before investing.',
      'You are a lab or university looking for an engineering partner.',
    ],
    related: ['ip-protocol-development', 'ai-ml-development', 'custom-software-development'],
  },
];

export const SECTORS = [
  { name: 'Animation', status: 'Active', text: 'Original characters, short films and visual stories for communication, education and IP.' },
  { name: 'Blockchain', status: 'R&D + services', text: 'Smart contracts, blockchain applications and private networks.' },
  { name: 'Design', status: 'Active', text: 'Templates, graphics, icons, interfaces and reusable design systems.' },
  { name: 'Discovery', status: 'Core R&D', text: 'Research across AI/ML, healthcare, transportation, wireless, computing and the SDGs.' },
  { name: 'Education', status: 'Developing', text: 'Product-oriented learning in programming, ML, statistics and management.' },
  { name: 'Electronics', status: 'R&D + engineering', text: 'Circuit design, PCB, embedded systems and customised electronic products.' },
  { name: 'Games', status: 'Active', text: 'Narrative-driven interactive experiences built on original worlds.' },
  { name: 'Semiconductors', status: 'R&D / IP', text: 'Memory protocols, RTL, verification and memory architecture.' },
  { name: 'Software', status: 'Active', text: 'Web, mobile, desktop and cross-platform software, including ERP and POS.' },
  { name: 'Telecom', status: 'R&D / IP', text: '6G applicability, intelligent wireless systems and future network architecture.' },
];

export const PROGRAMMES = [
  { id: 'R01', area: 'Semiconductors', name: 'DDR7-oriented protocol stack', text: 'Advanced memory protocol, digital architecture and verification research.', access: 'Restricted' },
  { id: 'R02', area: 'Healthcare + AI', name: 'ANNAVEDA personalisation engine', text: 'ML and recommendation-system research supporting ANNAVEDA.', access: 'Public' },
  { id: 'R03', area: 'Telecom', name: '6G applicability and product research', text: 'Future wireless applicability and product-oriented R&D.', access: 'Confidential' },
  { id: 'R04', area: 'Blockchain', name: 'Smart contract and distributed application R&D', text: 'Private blockchain, smart-contract and digital ecosystem evaluation.', access: 'Public' },
];

export const PAPER = {
  id: 'KT-WP-2026-ARM-001',
  rev: '1.0',
  date: 'July 2026',
  title: 'Strategic Planning, Marketing, and Design of Scalable Embedded System Solutions for Multi-Domain Applications using ARM-Based Platforms',
  summary: 'A structured framework spanning ARM platform selection, firmware architecture, safety qualification and commercial deployment.',
  authors: ['Shriya Pujara', 'Sagar Kavaiya', 'Narendrakumar Chauhan', 'Purvang Dalal'],
  file: '/files/KT-WP-2026-ARM-001.pdf',
  sizeLabel: 'PDF, 429 KB',
  keywords: ['ARM Cortex', 'Embedded systems', 'Edge AI', 'RTOS', 'Semiconductors'],
};

export const CAREERS = {
  durations: [
    { months: '3', name: 'Foundation', text: 'Industry exposure and supervised project work.' },
    { months: '6', name: 'Project development', text: 'Defined engineering or development assignments.' },
    { months: '9', name: 'Advanced development', text: 'Deeper project ownership and advanced technical work.' },
    { months: '12', name: 'R&D / product track', text: 'Long-term alignment with research or product programmes.' },
  ],
  steps: ['Application review', 'Portfolio / work review', 'Technical assessment', 'Technical interaction', 'Project fit', 'Final offer'],
  areas: ['Software development', 'AI / machine learning', 'Research and development', 'Embedded systems', 'PCB / electronics', 'Semiconductor / VLSI', 'Telecom / wireless', 'Blockchain', 'UI/UX design', 'Graphic design', 'Animation', 'Education / content', 'Project management'],
};
