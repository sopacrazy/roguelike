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
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              HP
            </span>
            <span className="font-mono text-slate-200">
              {Math.ceil(hp)} / {maxHp}
            </span>
          </div>
          <div className="w-full h-4 bg-slate-900 rounded-lg overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-md transition-all duration-150 ${
                hpPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : hpPercent > 25
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Boss HP Bar (Visible during boss fight) */}
        {bossHp !== null && bossMaxHp !== null && (
          <div className="flex-1 max-w-md mx-6 bg-slate-950/90 backdrop-blur-md border-2 border-red-900/80 rounded-xl p-3 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-red-400 mb-1.5">
              <span className="flex items-center gap-1.5 uppercase">
                <Swords className="w-3.5 h-3.5 text-red-500" />
                Guardião da Dungeon
              </span>
              <span className="font-mono text-slate-300">
                {Math.ceil(bossHp)} / {bossMaxHp}
              </span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-lg overflow-hidden p-0.5 border border-red-800/80">
              <div
                className="h-full rounded-md bg-gradient-to-r from-red-700 via-rose-600 to-amber-500 transition-all duration-150 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                style={{ width: `${Math.max(0, Math.min(100, (bossHp / bossMaxHp) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Room Info & Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Room / Enemy Tracker */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-right">
            <div className="text-xs font-medium text-slate-400">{currentRoomName}</div>
            <div className="text-sm font-bold mt-0.5 flex items-center justify-end gap-1.5">
              {enemiesLeft > 0 ? (
                <>
                  <span className="text-amber-400">INIMIGOS:</span>
                  <span className="text-red-400 font-mono text-base px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800/50">
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
            className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 p-3 rounded-xl border border-slate-700 transition-colors shadow-lg"
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
              className="bg-amber-950/70 border border-amber-600/50 text-amber-300 text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-md"
            >
              {title}
            </span>
          ))}
        </div>

        {/* Skill Action Badges */}
        <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl">
          {/* Attack / Bow */}
          <div className="flex flex-col items-center">
            <div
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border transition-all ${
                isAttackReady
                  ? 'bg-slate-800/90 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/90 border-slate-700 text-slate-500'
              }`}
            >
              <Target className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-wider">ARCO</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">MOUSE ESQ</span>
          </div>

          {/* Dash */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-14 h-14 rounded-xl flex flex-col items-center justify-center border overflow-hidden transition-all ${
                isDashReady
                  ? 'bg-slate-800/90 border-cyan-500/80 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/90 border-slate-700 text-slate-500'
              }`}
            >
              {!isDashReady && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-cyan-950/70 transition-all duration-75"
                  style={{ height: `${(1 - dashCdProgress) * 100}%` }}
                />
              )}
              <Shield className="w-5 h-5 mb-0.5 relative z-10" />
              <span className="text-[10px] font-bold tracking-wider relative z-10">DASH</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">ESPAÇO</span>
          </div>
        </div>

        {/* Movement Help */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-xl">
          <span className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">WASD</span>
          <span>Mover</span>
          <span className="mx-1">•</span>
          <span className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Mouse</span>
          <span>Mirar</span>
        </div>
      </div>
    </div>
  );
};
