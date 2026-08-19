import React from 'react';
import { Volume2, VolumeX, Shield, Swords, Sparkles, Target } from 'lucide-react';
import { SoundFX } from '../audio/SoundFX';

interface GameHUDProps {
  hp: number;
  maxHp: number;
  dashCdProgress: number; // 0 to 1
  attackCdProgress: number; // 0 to 1
  currentRoomName: string;
  enemiesLeft: number;
  bossHp: number | null;
  bossMaxHp: number | null;
  appliedUpgrades: string[];
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hp,
  maxHp,
  dashCdProgress,
  attackCdProgress,
  currentRoomName,
  enemiesLeft,
  bossHp,
  bossMaxHp,
  appliedUpgrades,
  isMuted,
  onToggleMute,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const isDashReady = dashCdProgress >= 0.99;
  const isAttackReady = attackCdProgress >= 0.99;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 select-none z-10">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Player HP Panel */}
        <div className="pixel-panel bg-slate-950 p-3 min-w-[220px]">
          <div className="flex items-center justify-between text-sm text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="inline-block w-2 h-2 bg-red-500"></span>
              HP
            </span>
            <span className="text-slate-200 text-lg">
              {Math.ceil(hp)} / {maxHp}
            </span>
          </div>
          <div className="w-full h-4 bg-black p-0.5 border-2 border-black outline outline-1 outline-slate-700">
            <div
              className={`h-full ${
                hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Boss HP Bar (Visible during boss fight) */}
        {bossHp !== null && bossMaxHp !== null && (
          <div className="pixel-panel flex-1 max-w-md mx-6 bg-slate-950 p-3 animate-fade-in">
            <div className="flex items-center justify-between text-sm text-red-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-red-500" />
                GUARDIÃO DA DUNGEON
              </span>
              <span className="text-slate-300 text-lg">
                {Math.ceil(bossHp)} / {bossMaxHp}
              </span>
            </div>
            <div className="w-full h-4 bg-black p-0.5 border-2 border-black outline outline-1 outline-red-900">
              <div
                className="h-full bg-red-600"
                style={{ width: `${Math.max(0, Math.min(100, (bossHp / bossMaxHp) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Room Info & Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Room / Enemy Tracker */}
          <div className="pixel-panel bg-slate-950 p-3 text-right">
            <div className="text-sm text-slate-400">{currentRoomName}</div>
            <div className="text-base mt-0.5 flex items-center justify-end gap-1.5">
              {enemiesLeft > 0 ? (
                <>
                  <span className="text-amber-400">INIMIGOS:</span>
                  <span className="pixel-panel text-red-400 text-lg px-1.5 bg-red-950">
                    {enemiesLeft}
                  </span>
                </>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  SALA LIMPA
                </span>
              )}
            </div>
          </div>

          {/* Sound Toggle Button */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleMute}
            className="pixel-btn pointer-events-auto bg-slate-900 text-slate-200 p-3 cursor-pointer"
            title={isMuted ? 'Ativar Som' : 'Desativar Som'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Bottom Controls & Skills Bar */}
      <div className="flex items-end justify-between w-full">
        {/* Applied Perks Indicator */}
        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
          {appliedUpgrades.map((title, i) => (
            <span
              key={i}
              className="pixel-panel bg-amber-950 text-amber-300 text-sm px-2.5 py-1"
            >
              {title}
            </span>
          ))}
        </div>

        {/* Skill Action Badges */}
        <div className="pixel-panel flex items-center gap-3 bg-slate-950 p-2.5">
          {/* Attack / Bow */}
          <div className="flex flex-col items-center">
            <div
              className={`pixel-panel w-14 h-14 flex flex-col items-center justify-center ${
                isAttackReady ? 'bg-slate-800 text-amber-300' : 'bg-slate-900 text-slate-500'
              }`}
            >
              <Target className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-pixel tracking-wider">ARCO</span>
            </div>
            <span className="text-sm text-slate-400 mt-1">MOUSE ESQ</span>
          </div>

          {/* Dash */}
          <div className="flex flex-col items-center">
            <div
              className={`pixel-panel relative w-14 h-14 flex flex-col items-center justify-center overflow-hidden ${
                isDashReady ? 'bg-slate-800 text-cyan-300' : 'bg-slate-900 text-slate-500'
              }`}
            >
              {!isDashReady && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-cyan-950"
                  style={{ height: `${(1 - dashCdProgress) * 100}%` }}
                />
              )}
              <Shield className="w-5 h-5 mb-0.5 relative z-10" />
              <span className="text-[9px] font-pixel tracking-wider relative z-10">DASH</span>
            </div>
            <span className="text-sm text-slate-400 mt-1">ESPAÇO</span>
          </div>
        </div>

        {/* Movement Help */}
        <div className="pixel-panel hidden sm:flex items-center gap-1.5 text-sm text-slate-400 bg-slate-950 px-3 py-2">
          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-200">WASD</span>
          <span>Mover</span>
          <span className="mx-1">•</span>
          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-200">Mouse</span>
          <span>Mirar</span>
        </div>
      </div>
    </div>
  );
};
