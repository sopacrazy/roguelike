import React, { useEffect, useState } from 'react';
import { useIsMobileLayout } from './useIsMobileLayout';

function computeIsPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

// Locking orientation on the web only actually works in narrow conditions
// (fullscreen + certain Android browsers, or an installed PWA that honors
// manifest.json's "orientation": "landscape"). This full-screen prompt is
// the part that works everywhere - it blocks play until the phone is
// physically turned sideways, which the game's HUD/touch controls need.
export const OrientationGate: React.FC = () => {
  const isMobile = useIsMobileLayout();
  const [isPortrait, setIsPortrait] = useState(computeIsPortrait);

  useEffect(() => {
    const handler = () => setIsPortrait(computeIsPortrait());
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const orientation = (screen as any).orientation;
    if (orientation?.lock) {
      orientation.lock('landscape').catch(() => {});
    }
  }, [isMobile]);

  if (!isMobile || !isPortrait) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-slate-950 p-8 text-center">
      <div className="text-6xl animate-rotate-hint">📱</div>
      <p className="font-pixel text-amber-400 text-sm leading-relaxed pixel-text-outline">
        GIRE O CELULAR
      </p>
      <p className="text-slate-400 text-lg max-w-xs">
        Este jogo precisa da tela na horizontal para funcionar.
      </p>
    </div>
  );
};
