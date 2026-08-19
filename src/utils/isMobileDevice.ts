// Shared between the React UI and the Phaser Player entity - both need the
// same "are we on mobile" answer (React to show/hide touch UI, Player to
// switch between mouse-aim and auto-aim). A width-only breakpoint misses
// phones held in landscape (wide but short), so this uses the smaller of
// width/height instead, which catches portrait AND landscape; `(pointer:
// coarse)` catches real touch devices/emulation regardless of window size.
const SMALL_DIMENSION_THRESHOLD = 560;

export function isMobileDevice(): boolean {
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const smallestSide = Math.min(window.innerWidth, window.innerHeight);
  return coarsePointer || smallestSide < SMALL_DIMENSION_THRESHOLD;
}
