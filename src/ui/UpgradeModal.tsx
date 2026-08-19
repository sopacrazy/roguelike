import React from 'react';
import { Upgrade } from '../config/gameConfig';
import { Sparkles, Check } from 'lucide-react';
import { PixelIcon } from './PixelIcon';

interface UpgradeModalProps {
  upgrades: Upgrade[];
  onSelect: (upgrade: Upgrade) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ upgrades, onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
      <div className="pixel-panel max-w-2xl w-full bg-[#150f05] p-6 flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 text-amber-400 font-pixel text-sm sm:text-base mb-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>TESOURO DA DUNGEON</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-slate-400 text-lg mb-6 text-center">
          Escolha uma bênção para fortalecer seu guerreiro pelo restante da jornada:
        </p>

        {/* Upgrade Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-4">
          {upgrades.map((upg) => (
            <button
              key={upg.id}
              onClick={() => onSelect(upg)}
              className="pixel-btn group relative flex flex-col items-center text-center p-5 bg-slate-900 hover:bg-slate-800 cursor-pointer"
            >
              {/* Icon */}
              <div className="pixel-panel w-14 h-14 bg-slate-800 flex items-center justify-center mb-3">
                <PixelIcon col={upg.iconCoord[0]} row={upg.iconCoord[1]} size={32} />
              </div>

              {/* Title */}
              <h4 className="text-slate-100 text-lg mb-1.5 group-hover:text-amber-300 transition-colors">
                {upg.title}
              </h4>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed flex-1">
                {upg.description}
              </p>

              {/* Select Pill */}
              <div className="pixel-panel mt-4 px-3 py-1 bg-slate-800 text-slate-300 text-sm group-hover:bg-amber-600 group-hover:text-amber-950 transition-colors flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Escolher
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
