import React from 'react';
import { Play } from 'lucide-react';

interface SplashScreenProps {
  onPlay: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onPlay }) => {
  return (
    <div
      className="absolute inset-0 z-40 flex items-end justify-center bg-slate-950 bg-cover bg-center pb-12 sm:pb-20"
      style={{ backgroundImage: 'url(/spash.png)' }}
    >
      <button
        id="play-game-btn"
        onClick={onPlay}
        className="pixel-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-base sm:text-xl px-8 py-4 sm:px-10 sm:py-5 flex items-center gap-3 cursor-pointer animate-fade-in"
      >
        <Play className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" />
        JOGAR
      </button>
    </div>
  );
};
