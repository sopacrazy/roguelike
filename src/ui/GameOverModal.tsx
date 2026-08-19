import React from 'react';
import { Skull, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
  enemiesDefeated: number;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart, enemiesDefeated }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
      <div className="pixel-panel max-w-md w-full bg-[#1a0e0e] p-8 flex flex-col items-center text-center">
        {/* Skull Icon */}
        <div className="pixel-panel w-16 h-16 bg-red-950 flex items-center justify-center mb-5 text-red-500">
          <Skull className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className="font-pixel text-2xl text-red-500 pixel-text-outline mb-4 leading-relaxed">
          {/* Press Start 2P draws accented capitals in a mismatched, non-blocky
              style (a known quirk of the font) - dropping the accent in this
              all-caps bitmap title is period-authentic for retro pixel UIs. */}
          VOCE MORREU
        </h2>
        <p className="text-slate-400 text-lg mb-6">
          Sua jornada terminou nas profundezas da dungeon medieval.
        </p>

        {/* Stats */}
        <div className="pixel-panel w-full bg-black/40 p-3.5 mb-6 flex justify-around">
          <div>
            <div className="text-slate-500 text-sm">Inimigos Derrotados</div>
            <div className="text-2xl text-slate-200 mt-0.5">{enemiesDefeated}</div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          id="restart-game-btn"
          onClick={onRestart}
          className="pixel-btn w-full py-3.5 px-6 bg-red-700 text-white font-pixel text-xs tracking-wide flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          TENTAR NOVAMENTE
        </button>
      </div>
    </div>
  );
};
