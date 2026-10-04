// Commit the generated gallery so photography remains readable and crawlable
// without JavaScript. gallery.json stays the single source for both views.
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const albums = JSON.parse(await readFile(new URL('gallery.json', root), 'utf8'));
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const shots = albums.landscapes.map((photo, i) => `<a class="shot" href="${escape(photo.src)}" style="--ar:${photo.w}/${photo.h}"><span class="print"><span class="pic"><img src="${escape(photo.thumb)}" alt="${escape(photo.caption || 'Photograph by Devgna Vyas')}" width="${photo.w}" height="${photo.h}" loading="lazy" decoding="async" /></span></span><span class="plaque"><b>No. ${String(i + 1).padStart(2, '0')}</b><span>${escape(photo.caption || 'Untitled')}</span></span></a>`).join('\n');
const gallery = `<!-- gallery:start -->\n<div class="gallery" id="gallery" role="tabpanel" aria-labelledby="album-places" tabindex="0">\n${shots}\n</div>\n<!-- gallery:end -->`;
const path = new URL('index.html', root);
const original = await readFile(path, 'utf8');
const updated = original.replace(/<!-- gallery:start -->[\s\S]*?<!-- gallery:end -->/, gallery);
if (updated === original && !original.includes('<!-- gallery:start -->')) throw new Error('Missing gallery markers');
if (process.argv.includes('--check')) {
  if (original !== updated) throw new Error('Gallery is stale. Run node scripts/render-gallery.mjs and commit index.html.');
  console.log(`Gallery matches ${albums.landscapes.length} source photographs.`);
} else await writeFile(path, updated);
