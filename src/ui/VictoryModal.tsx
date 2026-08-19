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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
      <div className="pixel-panel max-w-md w-full bg-[#1a1508] p-8 flex flex-col items-center text-center">
        {/* Trophy Icon */}
        <div className="pixel-panel w-16 h-16 bg-amber-950 flex items-center justify-center mb-5 text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className="font-pixel text-xl text-amber-400 pixel-text-outline mb-4 leading-relaxed">
          {/* Press Start 2P draws accented capitals in a mismatched, non-blocky
              style (a known quirk of the font) - dropping the accent in this
              all-caps bitmap title is period-authentic for retro pixel UIs. */}
          DUNGEON CONCLUIDA
        </h2>
        <p className="text-slate-300 text-lg mb-6">
          O Guardião da Dungeon foi derrotado! A masmorra foi purificada.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="pixel-panel bg-black/40 p-3.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Tempo
            </div>
            <div className="text-2xl text-slate-100">
              {mins}:{secs}
            </div>
          </div>

          <div className="pixel-panel bg-black/40 p-3.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-1">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              Inimigos
            </div>
            <div className="text-2xl text-slate-100">
              {enemiesDefeated}
            </div>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          id="play-again-btn"
          onClick={onPlayAgain}
          className="pixel-btn w-full py-3.5 px-6 bg-amber-500 text-slate-950 font-pixel text-xs tracking-wide flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          JOGAR NOVAMENTE
        </button>
      </div>
    </div>
  );
};
