/* ═══════════════════════════════════════════════════════════
   SAKURA.JS — Cherry blossom canvas, always visible
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
  const TARGET_INTERVAL = 1000 / 30; // Cap at ~30fps

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = [
    'rgba(232,180,184,0.55)',
    'rgba(244,143,177,0.45)',
    'rgba(240,98,146,0.35)',
    'rgba(252,228,236,0.5)',
    'rgba(248,187,208,0.5)',
  ];

  function createPetal() {
    return {
      x: Math.random() * canvas.width,
      y: -15,
      size: 5 + Math.random() * 6,
      speedY: 0.3 + Math.random() * 0.5,
      speedX: -0.15 + Math.random() * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      sway: Math.random() * 1.5,
      swaySpeed: 0.005 + Math.random() * 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.3 + Math.random() * 0.35,
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.5);
    ctx.bezierCurveTo(
      p.size * 0.5, -p.size * 0.5,
      p.size * 0.5, p.size * 0.3,
      0, p.size * 0.5
    );
    ctx.bezierCurveTo(
      -p.size * 0.5, p.size * 0.3,
      -p.size * 0.5, -p.size * 0.5,
      0, -p.size * 0.5
    );
    ctx.fill();
    ctx.restore();
  }

  function update(timestamp) {
    if (!isRunning) return;

    // Frame-rate limiting
    const elapsed = timestamp - lastFrameTime;
    if (elapsed < TARGET_INTERVAL) {
      requestAnimationFrame(update);
      return;
    }
    lastFrameTime = timestamp - (elapsed % TARGET_INTERVAL);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Max ~18 petals, spawn slowly
    if (petals.length < 18 && Math.random() < 0.04) {
      petals.push(createPetal());
    }

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.swayOffset) * p.sway * 0.2;
      p.swayOffset += p.swaySpeed;
      p.rotation += p.rotSpeed;

      if (p.y > canvas.height - 120) {
        p.opacity -= 0.005;
      }

      drawPetal(p);

      if (p.y > canvas.height + 20 || p.opacity <= 0) {
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

  // Only pause when tab is hidden — sakura stays visible on all sections
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  // Auto-start — always running while page is visible
  startAnimation();
})();
