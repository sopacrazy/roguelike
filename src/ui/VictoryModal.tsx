import React from 'react';
import { Trophy, RotateCcw, Clock, Swords } from 'lucide-react';

interface VictoryModalProps {
  onPlayAgain: () => void;
  enemiesDefeated: number;
  timeSeconds: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  onPlayAgain,
  enemiesDefeated,
  timeSeconds,
}) => {
  const mins = Math.floor(timeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(timeSeconds % 60)
    .toString()
    .padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="max-w-md w-full bg-slate-950 border-2 border-amber-500 rounded-2xl p-8 shadow-[0_0_60px_rgba(245,158,11,0.4)] flex flex-col items-center text-center">
        {/* Trophy Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-600 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-amber-400 mb-2 font-mono">
          DUNGEON CONCLUÍDA
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          O Guardião da Dungeon foi derrotado! A masmorra foi purificada.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Tempo
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono">
              {mins}:{secs}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              Inimigos
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono">
              {enemiesDefeated}
            </div>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          id="play-again-btn"
          onClick={onPlayAgain}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          JOGAR NOVAMENTE
        </button>
      </div>
    </div>
  );
};
