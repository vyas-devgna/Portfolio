const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const progress = document.getElementById('scroll-progress');
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];

function closeMenu() {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = 'Menu';
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  if (!mobileMenu) return;
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  mobileMenu.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.querySelector('span').textContent = opening ? 'Close' : 'Menu';
  document.body.classList.toggle('menu-open', opening);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileMenu?.hidden) closeMenu();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    observer.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -8%', threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    if (entry.target.id === 'photography') loadPhotography();
  });
}, { rootMargin: '-42% 0px -48%', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

let scrollTicking = false;
function updateScroll() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`;
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) requestAnimationFrame(updateScroll);
  scrollTicking = true;
}, { passive: true });
updateScroll();

if (finePointer && !reducedMotion) {
  window.addEventListener('pointermove', (event) => {
    document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
  }, { passive: true });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--card-x', `${x * 100}%`);
      card.style.setProperty('--card-y', `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 2.4}deg) rotateY(${(x - 0.5) * 2.4}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

const fluidCanvas = document.getElementById('fluid-background');
if (fluidCanvas) {
  const gl = fluidCanvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
  if (gl) {
    const vertexSource = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fragmentSource = `
      precision mediump float;
      uniform vec2 resolution;
      uniform vec2 pointer;
      uniform float time;
      float wave(vec2 p){
        float a=sin(p.x*3.1+sin(p.y*2.4-time*.34));
        float b=cos(p.y*3.7+cos(p.x*2.2+time*.27));
        float c=sin((p.x+p.y)*2.8-time*.21);
        return (a+b+c)/3.;
      }
      void main(){
        vec2 uv=(gl_FragCoord.xy-.5*resolution.xy)/min(resolution.x,resolution.y);
        vec2 mouse=(pointer-.5)*vec2(resolution.x/resolution.y,1.);
        float pull=.08/(.18+length(uv-mouse));
        vec2 warped=uv+vec2(wave(uv+time*.018),wave(uv.yx-time*.015))*.16+(uv-mouse)*pull*.035;
        float flow=wave(warped*1.35);
        vec3 green=vec3(.24,.50,.06), violet=vec3(.28,.18,.52), amber=vec3(.46,.17,.06);
        vec3 color=mix(violet,green,smoothstep(-.7,.7,flow));
        color=mix(color,amber,smoothstep(.18,.95,wave(warped.yx+2.1))*.42);
        float alpha=.18*smoothstep(-.95,.85,flow)+.025;
        gl_FragColor=vec4(color,alpha);
      }`;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (vertex && fragment) {
      const program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'p');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const resolution = gl.getUniformLocation(program, 'resolution');
      const pointer = gl.getUniformLocation(program, 'pointer');
      const time = gl.getUniformLocation(program, 'time');
      const cursor = { x: .76, y: .18 };
      let frame = 0;
      let lastPaint = 0;

      const resize = () => {
        const scale = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1 : 1.35);
        fluidCanvas.width = Math.round(innerWidth * scale);
        fluidCanvas.height = Math.round(innerHeight * scale);
        gl.viewport(0, 0, fluidCanvas.width, fluidCanvas.height);
      };
      const paint = (now = 0) => {
        if (!reducedMotion && now - lastPaint < 32) {
          frame = requestAnimationFrame(paint);
          return;
        }
        lastPaint = now;
        gl.uniform2f(resolution, fluidCanvas.width, fluidCanvas.height);
        gl.uniform2f(pointer, cursor.x, cursor.y);
        gl.uniform1f(time, reducedMotion ? 0 : now / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if (!reducedMotion) frame = requestAnimationFrame(paint);
      };
      window.addEventListener('pointermove', (event) => {
        cursor.x = event.clientX / innerWidth;
        cursor.y = 1 - event.clientY / innerHeight;
      }, { passive: true });
      window.addEventListener('resize', resize, { passive: true });
      document.addEventListener('visibilitychange', () => {
        cancelAnimationFrame(frame);
        if (!document.hidden && !reducedMotion) frame = requestAnimationFrame(paint);
      });
      resize();
      paint();
    }
  }
}

const projectStage = document.getElementById('project-stage');
if (projectStage && !reducedMotion) {
  const sticky = projectStage.querySelector('.project-sticky');
  const cards = [...projectStage.querySelectorAll('.project-card')];
  const layout = [
    [-34,-27,-7], [0,-34,2], [34,-27,7],
    [-35,26,6], [0,34,-2], [35,25,-7]
  ];
  let ticking = false;

  const renderStack = () => {
    if (innerWidth <= 1050) {
      cards.forEach((card) => { card.style.transform = ''; card.style.zIndex = ''; });
      sticky.style.removeProperty('--stack-center');
      ticking = false;
      return;
    }
    const rect = projectStage.getBoundingClientRect();
    const range = projectStage.offsetHeight - sticky.offsetHeight;
    const progress = clamp(-rect.top / range);
    const spread = smoothstep(clamp((progress - .04) / .72));
    const center = smoothstep(clamp((progress - .34) / .3));
    sticky.style.setProperty('--stack-center', center.toFixed(3));
    cards.forEach((card, index) => {
      const [endX, endY, endRotation] = layout[index];
      const startX = (index - (cards.length - 1) / 2) * 2;
      const startY = index * -.45;
      const startRotation = (index - (cards.length - 1) / 2) * 1.2;
      const x = (startX + (endX - startX) * spread) * sticky.clientWidth / 100;
      const y = (startY + (endY - startY) * spread) * sticky.clientHeight / 100;
      const rotation = startRotation + (endRotation - startRotation) * spread;
      const scale = .78 + spread * .14;
      card.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) rotate(${rotation}deg) scale(${scale})`;
      card.style.zIndex = String(index + 2);
    });
    ticking = false;
  };

  const requestStack = () => {
    if (!ticking) requestAnimationFrame(renderStack);
    ticking = true;
  };
  window.addEventListener('scroll', requestStack, { passive: true });
  window.addEventListener('resize', requestStack, { passive: true });
  renderStack();
}

const canvas = document.getElementById('system-map');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const pointer = { x: -1000, y: -1000, down: false };
  const shockwaves = [];
  let nodes = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let frozen = reducedMotion;

  const seedNodes = () => {
    const count = width < 520 ? 92 : 150;
    const radius = Math.max(width, height) * .48;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    nodes = Array.from({ length: count }, (_, index) => {
      const distance = Math.sqrt((index + .5) / count) * radius;
      const angle = index * goldenAngle;
      return {
        distance, angle,
        x: width / 2 + Math.cos(angle) * distance,
        y: height / 2 + Math.sin(angle) * distance,
        vx: 0, vy: 0, excitation: 0
      };
    });
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    seedNodes();
  };

  const addPulse = (x = width / 2, y = height / 2) => {
    shockwaves.push({ x, y, radius: 8, strength: 1 });
    if (frozen) drawSwarm(performance.now());
  };

  function drawSwarm(time = 0) {
    ctx.clearRect(0, 0, width, height);
    shockwaves.forEach((wave) => { wave.radius += 11; wave.strength *= .93; });
    while (shockwaves[0] && (shockwaves[0].radius > Math.max(width, height) || shockwaves[0].strength < .02)) shockwaves.shift();

    nodes.forEach((node) => {
      const angle = node.angle + (frozen ? 0 : time * .000045 * (1 + 80 / (node.distance + 80)));
      const targetX = width / 2 + Math.cos(angle) * node.distance;
      const targetY = height / 2 + Math.sin(angle) * node.distance;
      node.vx += (targetX - node.x) * .018;
      node.vy += (targetY - node.y) * .018;
      const dx = node.x - pointer.x;
      const dy = node.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 105 && distance > 0) {
        const force = (1 - distance / 105) * (pointer.down ? -.55 : 1.25);
        node.vx += dx / distance * force;
        node.vy += dy / distance * force;
        node.excitation = Math.max(node.excitation, 1 - distance / 105);
      }
      shockwaves.forEach((wave) => {
        const sx = node.x - wave.x;
        const sy = node.y - wave.y;
        const sd = Math.hypot(sx, sy);
        const edge = Math.abs(sd - wave.radius);
        if (edge < 22 && sd > 0) {
          const force = (1 - edge / 22) * wave.strength * 8;
          node.vx += sx / sd * force;
          node.vy += sy / sd * force;
          node.excitation = 1;
        }
      });
      node.vx *= .9;
      node.vy *= .9;
      node.x += node.vx;
      node.y += node.vy;
      node.excitation *= .94;
    });

    ctx.lineWidth = .6;
    nodes.forEach((node, index) => {
      for (let next = index + 1; next < Math.min(nodes.length, index + 11); next += 1) {
        const other = nodes[next];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance > 76) continue;
        ctx.strokeStyle = `rgba(184,255,61,${(1 - distance / 76) * .14})`;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    });
    nodes.forEach((node) => {
      ctx.fillStyle = node.excitation > .2 ? '#b8ff3d' : 'rgba(242,240,233,.56)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.1 + node.excitation * 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!frozen) frame = requestAnimationFrame(drawSwarm);
  }

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });
  canvas.addEventListener('pointerdown', (event) => { pointer.down = true; addPulse(pointer.x, pointer.y); event.preventDefault(); });
  window.addEventListener('pointerup', () => { pointer.down = false; });
  canvas.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; pointer.down = false; });
  document.getElementById('swarm-pulse')?.addEventListener('click', () => addPulse());
  document.getElementById('swarm-freeze')?.addEventListener('click', (event) => {
    frozen = !frozen;
    event.currentTarget.setAttribute('aria-pressed', String(frozen));
    event.currentTarget.textContent = frozen ? 'Resume' : 'Freeze';
    cancelAnimationFrame(frame);
    if (!frozen) frame = requestAnimationFrame(drawSwarm);
  });
  new ResizeObserver(() => { resizeCanvas(); if (frozen) drawSwarm(); }).observe(canvas);
  resizeCanvas();
  drawSwarm();
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame);
    if (!document.hidden && !frozen) frame = requestAnimationFrame(drawSwarm);
  });
}

const lightbox = document.getElementById('photo-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxIndex = document.getElementById('lightbox-index');
let photoItems = [];
let activePhoto = 0;
let photographyLoaded = false;

function showPhoto(index) {
  if (!photoItems.length) return;
  activePhoto = (index + photoItems.length) % photoItems.length;
  const photo = photoItems[activePhoto];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.caption || `Photograph by Devgna Vyas, frame ${activePhoto + 1}`;
  lightboxCaption.textContent = photo.caption || 'Untitled photograph';
  lightboxIndex.textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${String(photoItems.length).padStart(2, '0')}`;
}

function openPhoto(index) {
  if (!lightbox) return;
  showPhoto(index);
  lightbox.showModal();
}

document.getElementById('lightbox-close')?.addEventListener('click', () => lightbox?.close());
document.getElementById('lightbox-prev')?.addEventListener('click', () => showPhoto(activePhoto - 1));
document.getElementById('lightbox-next')?.addEventListener('click', () => showPhoto(activePhoto + 1));
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
window.addEventListener('keydown', (event) => {
  if (!lightbox?.open) return;
  if (event.key === 'ArrowRight') showPhoto(activePhoto + 1);
  if (event.key === 'ArrowLeft') showPhoto(activePhoto - 1);
});

function enableDrag(track) {
  let startX = 0;
  let startScroll = 0;
  let moved = false;
  let dragging = false;
  track.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startScroll = track.scrollLeft;
    moved = false;
    dragging = true;
    track.classList.add('dragging');
  });
  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const delta = event.clientX - startX;
    moved ||= Math.abs(delta) > 6;
    track.scrollLeft = startScroll - delta;
  });
  window.addEventListener('pointerup', () => {
    dragging = false;
    track.classList.remove('dragging');
  });
  track.addEventListener('click', (event) => {
    if (moved) event.preventDefault();
    moved = false;
  }, true);
}

async function loadPhotography() {
  if (photographyLoaded) return;
  photographyLoaded = true;
  const track = document.getElementById('photo-track');
  const count = document.getElementById('photo-count');
  const caption = document.getElementById('photo-caption');
  if (!track) return;

  try {
    const response = await fetch('photography.json', { cache: 'force-cache' });
    if (!response.ok) throw new Error('Photo index unavailable');
    photoItems = (await response.json()).filter((item) => item?.type === 'image' && item?.src);
    if (!photoItems.length) throw new Error('No photographs found');
    count.textContent = String(photoItems.length).padStart(2, '0');
    caption.textContent = photoItems[0].caption || 'A small archive of places, light and things I noticed.';

    photoItems.forEach((photo, index) => {
      const button = document.createElement('button');
      const image = document.createElement('img');
      button.className = 'photo-frame';
      button.type = 'button';
      button.setAttribute('aria-label', photo.caption ? `Open photograph: ${photo.caption}` : `Open photograph ${index + 1}`);
      image.src = photo.src;
      image.alt = photo.caption || `Photograph by Devgna Vyas, frame ${index + 1}`;
      image.loading = index < 3 ? 'eager' : 'lazy';
      image.decoding = 'async';
      button.append(image);
      button.addEventListener('mouseenter', () => { caption.textContent = photo.caption || `Frame ${String(index + 1).padStart(2, '0')}`; });
      button.addEventListener('focus', () => { caption.textContent = photo.caption || `Frame ${String(index + 1).padStart(2, '0')}`; });
      button.addEventListener('click', () => openPhoto(index));
      track.append(button);
    });
    enableDrag(track);
  } catch {
    caption.textContent = 'The photography archive is unavailable right now.';
    count.textContent = '—';
  }
}

document.getElementById('year').textContent = String(new Date().getFullYear());

if (location.hash) {
  const scrollToHash = () => {
    const target = document.querySelector(location.hash);
    if (!target) return;
    const behavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    target.scrollIntoView();
    document.documentElement.style.scrollBehavior = behavior;
  };
  scrollToHash();
  window.addEventListener('load', scrollToHash, { once: true });
  setTimeout(scrollToHash, 500);
}
