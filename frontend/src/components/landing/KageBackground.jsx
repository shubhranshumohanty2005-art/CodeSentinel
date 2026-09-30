import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   KageBackground — Loads the authored Kage temple HTML document as a
   background-only iframe. Hides all page UI (nav, copy, footer) and
   isolates only the WebGL canvas (#gl), grain, and vignette layers.
   ═══════════════════════════════════════════════════════════════════════════ */

const BACKGROUND_STYLE = `
  html[data-bg], html[data-bg] body {
    width: 100% !important; height: 100% !important;
    min-height: 100% !important; overflow: hidden !important;
  }
  html[data-bg] body * {
    visibility: hidden !important;
    pointer-events: none !important;
  }
  html[data-bg] #gl,
  html[data-bg] #gl *,
  html[data-bg] #grain,
  html[data-bg] #vignette {
    visibility: visible !important;
  }
  html[data-bg] #gl {
    position: fixed !important; inset: 0 !important;
    width: 100vw !important; height: 100vh !important;
    max-width: none !important; max-height: none !important;
    margin: 0 !important; transform: none !important;
  }
  /* Hide preloader */
  html[data-bg] #pre { display: none !important; }
`;

export default function KageBackground() {
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const onLoad = () => {
      const doc = frame.contentDocument;
      if (!doc?.head) return;

      // Add background presentation attribute
      doc.documentElement.setAttribute('data-bg', '');

      // Inject background-only CSS
      const style = doc.createElement('style');
      style.id = 'kage-bg-style';
      style.textContent = BACKGROUND_STYLE;
      doc.head.appendChild(style);

      // Trigger resize so the WebGL canvas fills the frame
      frame.contentWindow?.requestAnimationFrame(() => {
        frame.contentWindow?.dispatchEvent(new Event('resize'));
      });

      setReady(true);
    };

    frame.addEventListener('load', onLoad);
    return () => frame.removeEventListener('load', onLoad);
  }, []);

  return (
    <iframe
      ref={frameRef}
      title="Kage Sanctuary"
      src="/landing-pages/kage.html"
      sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
      loading="eager"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
        zIndex: 0,
        background: '#05070a',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }}
    />
  );
}
