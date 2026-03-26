const fs = require('fs');
const js = fs.readFileSync('c:/Users/Dev/Documents/ctf/Portfolio/js/main.js', 'utf8');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div id="lightbox" class="lightbox">
      <button class="lightbox-close" id="lightbox-close"></button>
      <img id="lightbox-img" src="" alt="" />
      <p id="lightbox-caption" class="lightbox-caption"></p>
  </div>
  <div class="gallery-wrapper">
    <button class="gallery-nav-prev"></button>
    <div id="photo-gallery" class="media-gallery" data-autoscroll="true"></div>
    <div class="gallery-progress-bar"></div>
  </div>
  <p id="photo-empty"></p>
</body>
</html>
`, {
  url: "http://localhost/",
  runScripts: "dangerously"
});

// Mock environment
dom.window.matchMedia = () => ({ matches: false });
dom.window.__APP_VERSION__ = '1';
dom.window.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) {
    this.cb([{ target: el, isIntersecting: true, intersectionRatio: 1 }]);
  }
  unobserve() {}
};

// Mock fetch
const sampleData = [{ type: 'image', src: 'img1.jpg', caption: 'Test' }];
dom.window.fetch = (url) => {
  if (url.includes('photography.json')) return Promise.resolve({ ok: true, json: () => Promise.resolve(sampleData) });
  if (url.includes('animals.json')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  if (url.includes('sketches.json')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  if (url.includes('writing.json')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  if (url.includes('.pdf')) return Promise.resolve({ ok: true });
  return Promise.resolve({ ok: false });
};

// Execute main.js
try {
  dom.window.eval(js);
} catch (e) {
  console.log("Evaluation Error:", e);
  process.exit(1);
}

// Wait for fetch promises to resolve and loadGallery to build DOM
setTimeout(() => {
  const g = dom.window.document.getElementById('photo-gallery');
  console.log("Gallery children attached:", g.children.length);
  
  if (g.children.length === 0) {
    console.log("ERROR: No children were attached to the gallery!");
    process.exit(1);
  }

  const item = g.children[0];
  console.log("Clicking item 0...");
  
  // Simulate click
  const clickEvent = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
  item.dispatchEvent(clickEvent);
  
  const lightbox = dom.window.document.getElementById('lightbox');
  console.log("Lightbox classes after click:", lightbox.className);
  if (lightbox.classList.contains('open')) {
    console.log("SUCCESS: Lightbox opened!");
  } else {
    console.log("FAILURE: Lightbox did not open!");
  }
}, 500);
