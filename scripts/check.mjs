import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

if (new Set(ids).size !== ids.length) throw new Error('index.html contains duplicate IDs');

const idSet = new Set(ids);
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!idSet.has(target)) throw new Error(`Missing anchor target: #${target}`);
}

const localReferences = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((value) => !/^(?:#|https?:|mailto:|data:)/.test(value));

const photos = JSON.parse(await readFile(resolve(root, 'photography.json'), 'utf8'));
localReferences.push(...photos.filter((item) => item.type === 'image').map((item) => item.src));

await Promise.all([...new Set(localReferences)].map((path) => access(resolve(root, path))));
console.log(`Static check passed: ${ids.length} IDs, ${new Set(localReferences).size} local assets.`);
