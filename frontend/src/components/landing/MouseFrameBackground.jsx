import { useRef, useEffect, useCallback, useState } from 'react';

const TOTAL_FRAMES = 300;
const FRAME_PATH = '/scroll-frames/ezgif-frame-';

/**
 * Generates the image path for a given frame index (0-based).
 * Frames are numbered 001–300.
 */
const getFrameSrc = (index) => {
  const num = String(index + 1).padStart(3, '0');
  return `${FRAME_PATH}${num}.jpg`;
};

/**
 * MouseFrameBackground
 * 
 * Renders a full-screen <canvas> that scrubs through 300 pre-extracted
 * JPG frames based on the mouse Y position. Moving the mouse from the
 * top of the viewport to the bottom maps linearly to frame 0 → 299.
 * 
 * Smoothly interpolates the current frame toward the target using
 * requestAnimationFrame for a buttery-smooth feel.
 */
export default function MouseFrameBackground() {
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const rafRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Preload all frames
  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const images = new Array(TOTAL_FRAMES);

    const onLoad = () => {
      loadedCount++;
      if (!cancelled) {
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          setLoaded(true);
        }
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = onLoad;
      img.onerror = onLoad; // count errors as loaded to avoid hanging
      images[i] = img;
    }

    framesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  // Draw a frame on the canvas with cover-fit logic
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = framesRef.current[frameIndex];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover-fit: scale image to cover the entire canvas
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  // Animation loop: smoothly interpolate toward the target frame
  useEffect(() => {
    const animate = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;

      // Lerp toward target
      const next = current + (target - current) * 0.1;
      const frameIndex = Math.round(next);

      if (Math.abs(next - current) > 0.01) {
        currentFrameRef.current = next;
      } else {
        currentFrameRef.current = target;
      }

      drawFrame(Math.min(Math.max(frameIndex, 0), TOTAL_FRAMES - 1));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame]);

  // Track page scroll position (scrolling down the page drives the animation)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate progress (0 at top, 1 at bottom of the page)
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      
      targetFrameRef.current = Math.floor(progress * (TOTAL_FRAMES - 1));
    };

    // Set initial frame based on current scroll
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Resize canvas to match viewport
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-navy-900/40" />

      {/* Loading indicator */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-navy-900/80 z-10">
          <div className="text-center">
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-white/40 text-sm">Loading visual experience… {loadProgress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
