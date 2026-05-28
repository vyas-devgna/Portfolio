/* ═══════════════════════════════════════════════════════════
   SAKURA.JS — Zine Sketch Paper Flakes Canvas Animation
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('sakura-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let petals = [];
  let isRunning = false;
  let lastFrameTime = 0;
  const TARGET_INTERVAL = 1000 / 30; // Cap at ~30fps for extreme efficiency

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Cyberpunk Obsidian & Gold Accent Dust Colors */
  const COLORS = [
    'rgba(235, 229, 222, 0.45)', /* Muted Paper Flake */
    'rgba(108, 104, 99, 0.25)',  /* Muted Pencil Shaving */
    'rgba(255, 176, 0, 0.15)',   /* Cyber Gold Dust */
    'rgba(204, 0, 0, 0.12)',     /* Editorial Red Spec */
  ];

  function createPetal() {
    return {
      x: Math.random() * canvas.width,
      y: -15,
      size: 3 + Math.random() * 5,
      speedY: 0.25 + Math.random() * 0.45,
      speedX: -0.1 + Math.random() * 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      sway: Math.random() * 1.2,
      swaySpeed: 0.004 + Math.random() * 0.008,
      swayOffset: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.25 + Math.random() * 0.3,
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    // Draw clean hand-drawn irregular geometric pencil shaving flakes
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.5);
    ctx.lineTo(p.size * 0.4, -p.size * 0.2);
    ctx.lineTo(p.size * 0.5, p.size * 0.4);
    ctx.lineTo(-p.size * 0.3, p.size * 0.5);
    ctx.lineTo(-p.size * 0.5, -p.size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function update(timestamp) {
    if (!isRunning) return;

    const elapsed = timestamp - lastFrameTime;
    if (elapsed < TARGET_INTERVAL) {
      requestAnimationFrame(update);
      return;
    }
    lastFrameTime = timestamp - (elapsed % TARGET_INTERVAL);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Limit to 12 drift specs at a time
    if (petals.length < 12 && Math.random() < 0.035) {
      petals.push(createPetal());
    }

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.swayOffset) * p.sway * 0.15;
      p.swayOffset += p.swaySpeed;
      p.rotation += p.rotSpeed;

      if (p.y > canvas.height - 100) {
        p.opacity -= 0.008;
      }

      drawPetal(p);

      if (p.y > canvas.height + 15 || p.opacity <= 0) {
        petals.splice(i, 1);
      }
    }

    requestAnimationFrame(update);
  }

  function startAnimation() {
    if (isRunning) return;
    isRunning = true;
    lastFrameTime = 0;
    requestAnimationFrame(update);
  }

  function stopAnimation() {
    isRunning = false;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  startAnimation();
})();
