// Applies a saved colour-theme choice before first paint (no flash). System preference is the default.
(function () { try { var t = localStorage.getItem('kt-theme'); if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t); } catch (e) {} })();
