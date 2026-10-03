// Local preview that mimics Netlify/Cloudflare Pages: applies dist/_headers and dist/_redirects,
// serves clean URLs, gzip, and dist/404.html. Usage: node scripts/serve.mjs [port]
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.argv[2] || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

function parseHeaders() {
  const rules = []; let cur = null;
  for (const line of readFileSync(join(DIST, '_headers'), 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) { cur = { pattern: line.trim(), headers: {} }; rules.push(cur); }
    else { const i = line.indexOf(':'); cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  }
  return rules;
}
const headerRules = parseHeaders();
const redirects = readFileSync(join(DIST, '_redirects'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/));
const match = (pattern, p) => (pattern.endsWith('*') ? p.startsWith(pattern.slice(0, -1)) : p === pattern);

http.createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  const r = redirects.find(([from]) => from === path);
  if (r) { res.writeHead(Number(r[2] || 301), { Location: r[1] }); return res.end(); }
  let file = join(DIST, path);
  if (!file.startsWith(DIST)) { res.writeHead(400); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith('/')) { res.writeHead(301, { Location: path + '/' }); return res.end(); }
    file = join(file, 'index.html');
  }
  let status = 200;
  if (!existsSync(file) || path.includes('/_') || path.includes('.htaccess')) { file = join(DIST, '404.html'); status = 404; }
  const headers = { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' };
  for (const rule of headerRules) if (match(rule.pattern, path)) Object.assign(headers, rule.headers);
  let body = readFileSync(file);
  if (/text|javascript|xml|json/.test(headers['Content-Type']) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = zlib.gzipSync(body); headers['Content-Encoding'] = 'gzip'; }
  res.writeHead(status, headers); res.end(body);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
