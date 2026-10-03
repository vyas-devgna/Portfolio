const potrace = require('potrace'); const fs = require('fs');
const opts = { turdSize: 40, alphaMax: 0.55, optCurve: true, optTolerance: 0.25, threshold: 128, blackOnWhite: true };
function trace(file) { return new Promise((res, rej) => potrace.trace(file, opts, (e, svg) => e ? rej(e) : res(svg))); }
(async () => {
  for (const f of ['mark', 'word', 'tag']) {
    const svg = await trace(f + '.png');
    const d = svg.match(/ d="([^"]+)"/)[1];
    // split into subpaths and compute rough bbox for each
    const subs = d.split(/(?=M)/).map(s => s.trim()).filter(Boolean);
    const info = subs.map(s => { const n = s.match(/-?\d+(\.\d+)?/g).map(Number); const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1); return { s, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; });
    fs.writeFileSync(f + '.json', JSON.stringify(info));
    console.log(f, subs.length, 'subpaths'); info.forEach((i, k) => console.log('  ', k, Math.round(i.x0), Math.round(i.y0), Math.round(i.x1), Math.round(i.y1), i.s.length));
  }
})();
