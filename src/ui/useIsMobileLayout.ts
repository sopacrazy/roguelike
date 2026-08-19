import { useEffect, useState } from 'react';

// A width-only breakpoint misses phones held in landscape (wide but short).
// Using the smaller of width/height instead catches portrait AND landscape,
// and `(pointer: coarse)` catches real touch devices/emulation regardless of
// window size.
const SMALL_DIMENSION_THRESHOLD = 560;

function computeIsMobile(): boolean {
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const smallestSide = Math.min(window.innerWidth, window.innerHeight);
  return coarsePointer || smallestSide < SMALL_DIMENSION_THRESHOLD;
}

export function useIsMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState(computeIsMobile);

  useEffect(() => {
    const handler = () => setIsMobile(computeIsMobile());
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);

  return isMobile;
}
