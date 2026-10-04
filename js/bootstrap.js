/* Core controls work everywhere; optional scroll motion loads on capable desktops.
   Touch devices, reduced motion, and data-saving readers use the native experience. */
(async () => {
  const enhance = matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches
    && !matchMedia('(prefers-reduced-motion: reduce)').matches
    && !navigator.connection?.saveData;
  const load = (src) => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    const timeout = setTimeout(resolve, 4000);
    script.onload = script.onerror = () => { clearTimeout(timeout); resolve(); };
    document.head.append(script);
  });
  if (enhance) {
    await load('/js/vendor/gsap.min.js');
    await load('/js/vendor/ScrollTrigger.min.js');
  }
  await import('./main.js');
})();
