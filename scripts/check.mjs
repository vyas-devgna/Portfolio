// Static sanity check for the GitHub Pages site: unique IDs, live anchors, existing local assets.
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('index.html contains duplicate IDs');

const idSet = new Set(ids);
for (const required of ['main', 'home', 'work', 'research', 'about', 'photography', 'contact', 'swarm', 'packets', 'gallery', 'lightbox', 'palette', 'swarm-pulse', 'swarm-freeze']) {
  if (!idSet.has(required)) throw new Error(`Missing #${required}`);
}
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!idSet.has(target)) throw new Error(`Missing anchor target: #${target}`);
}

const refs = [...html.matchAll(/\b(?:src|href|data-preview)="([^"]+)"/g)].map((m) => m[1])
  .filter((v) => !/^(?:#|https?:|mailto:|data:|art-)/.test(v));
const gallery = JSON.parse(await readFile(resolve(root, 'gallery.json'), 'utf8'));
for (const items of Object.values(gallery)) for (const p of items) {
  if (!(p.w > 0 && p.h > 0)) throw new Error(`Missing dimensions for ${p.src}`);
  refs.push(p.src, p.thumb);
}
const unique = [...new Set(refs)];
await Promise.all(unique.map((p) => access(resolve(root, p))));
console.log(`Static check passed: ${ids.length} IDs, ${unique.length} local assets.`);
