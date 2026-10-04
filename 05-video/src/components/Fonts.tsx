import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Loads the same self-hosted fonts the website uses before any frame renders.
export const useSiteFonts = () => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Archivo', `url(${staticFile('fonts/archivo-var.woff2')}) format("woff2")`, { weight: '100 900', stretch: '62% 125%' }),
      new FontFace('IBM Plex Sans', `url(${staticFile('fonts/plex-sans-400.woff2')}) format("woff2")`, { weight: '400' }),
      new FontFace('IBM Plex Sans', `url(${staticFile('fonts/plex-sans-600.woff2')}) format("woff2")`, { weight: '600' }),
      new FontFace('IBM Plex Mono', `url(${staticFile('fonts/plex-mono-500.woff2')}) format("woff2")`, { weight: '500' }),
    ];
    Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff))))
      .then(() => continueRender(handle))
      .catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
};
