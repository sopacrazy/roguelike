import React from 'react';
import { Upgrade } from '../config/gameConfig';
import { Sparkles, Check } from 'lucide-react';

interface UpgradeModalProps {
  upgrades: Upgrade[];
  onSelect: (upgrade: Upgrade) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ upgrades, onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="max-w-2xl w-full bg-slate-950 border-2 border-amber-600/80 rounded-2xl p-6 shadow-[0_0_40px_rgba(217,119,6,0.3)] flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 text-amber-400 font-bold tracking-widest text-lg sm:text-xl uppercase mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Tesouro da Dungeon</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-slate-400 text-sm mb-6 text-center">
          Escolha uma bênção para fortalecer seu guerreiro pelo restante da jornada:
        </p>

        {/* Upgrade Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-4">
          {upgrades.map((upg) => (
            <button
              key={upg.id}
              onClick={() => onSelect(upg)}
              className="group relative flex flex-col items-center text-center p-5 rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-amber-500 hover:from-slate-800 hover:to-slate-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
                {upg.icon}
              </div>

              {/* Title */}
              <h4 className="text-slate-100 font-bold text-base mb-1.5 group-hover:text-amber-300 transition-colors">
                {upg.title}
              </h4>

              {/* Description */}
              <p className="text-slate-400 text-xs leading-relaxed flex-1">
                {upg.description}
              </p>

              {/* Select Pill */}
              <div className="mt-4 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold group-hover:bg-amber-600 group-hover:text-amber-950 group-hover:border-amber-400 transition-colors flex items-center gap-1">
                <Check className="w-3 h-3" />
                Escolher
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
