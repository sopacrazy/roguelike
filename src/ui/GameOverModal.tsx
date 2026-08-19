import React from 'react';
import { Skull, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
  enemiesDefeated: number;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart, enemiesDefeated }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="max-w-md w-full bg-slate-950 border-2 border-red-900 rounded-2xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.35)] flex flex-col items-center text-center">
        {/* Skull Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center mb-4 text-red-500 shadow-inner">
          <Skull className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold tracking-wider text-red-500 mb-2 font-mono">
          VOCÊ MORREU
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Sua jornada terminou nas profundezas da dungeon medieval.
        </p>

        {/* Stats */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mb-6 flex justify-around text-xs">
          <div>
            <div className="text-slate-500">Inimigos Derrotados</div>
            <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">{enemiesDefeated}</div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          id="restart-game-btn"
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-red-700/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          TENTAR NOVAMENTE
        </button>
      </div>
    </div>
  );
};
