// Concept mark: K whose upper arm turns into the T's crossbar, with two signal nodes.
// Proposed to the client as a refreshed logo; the original PNG logo stays in src/logo-source.png.
export const markSvg = (cls = 'mark', id = 'g') => `<svg class="${cls}" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">
  <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="8" y1="8" x2="42" y2="42"><stop offset="0" stop-color="#c8f560"/><stop offset="1" stop-color="#6c8cff"/></linearGradient></defs>
  <g fill="none" stroke="url(#${id})" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">
    <path class="m1" pathLength="1" d="M11 9v30"/>
    <path class="m2" pathLength="1" d="M11 26 25 11h13"/>
    <path class="m3" pathLength="1" d="M11 26l12 13"/>
    <path class="m4" pathLength="1" d="M31.5 11v28"/>
  </g>
  <circle class="m5" cx="38" cy="11" r="3.6" fill="#c8f560"/>
  <circle class="m6" cx="23" cy="39" r="3.6" fill="#6c8cff"/>
</svg>`;
