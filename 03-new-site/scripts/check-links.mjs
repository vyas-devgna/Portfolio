// Crawls the local preview and checks every internal link, asset and #fragment.
// Usage: node scripts/serve.mjs & node scripts/check-links.mjs [base]
const BASE = process.argv[2] || 'http://localhost:8080';
const seen = new Map(); const queue = ['/']; const problems = []; const pagesHtml = new Map();
const extract = (html) => [...html.matchAll(/(?:href|src|srcset|content)="([^"]+)"/g)].map((m) => m[1].split(' ')[0]);
while (queue.length) {
  const path = queue.shift(); if (seen.has(path)) continue;
  const res = await fetch(BASE + path, { redirect: 'manual' });
  seen.set(path, res.status);
  if (res.status >= 400) { problems.push(`${res.status} ${path}`); continue; }
  if (!(res.headers.get('content-type') || '').includes('text/html')) continue;
  const html = await res.text(); pagesHtml.set(path, html);
  for (let u of extract(html)) {
    if (u.startsWith('https://www.kavaiyatech.com')) u = u.slice('https://www.kavaiyatech.com'.length) || '/';
    if (!u.startsWith('/') || u.startsWith('//')) continue;
    const [p, frag] = u.split('#'); const clean = p.split('?')[0] || path;
    if (!seen.has(clean) && !queue.includes(clean)) queue.push(clean);
    if (frag) queue.push('#' + clean + '#' + frag);
  }
}
for (const key of seen.keys()) if (key.startsWith('#')) seen.delete(key);
// fragment check
const fr = [...new Set(queue)];
let fragments = 0;
for (const html of pagesHtml.values()) for (const m of html.matchAll(/href="(\/[^"#]*)#([^"]+)"/g)) {
  fragments++; const target = pagesHtml.get(m[1].split('?')[0]);
  if (target && !target.includes(`id="${m[2]}"`)) problems.push(`missing #${m[2]} on ${m[1]}`);
}
console.log(`Checked ${seen.size} URLs, ${fragments} fragment links.`);
for (const [p, s] of seen) if (s !== 200) console.log(`  ${s} ${p}`);
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'No broken internal links or fragments.');
process.exit(problems.length ? 1 : 0);
