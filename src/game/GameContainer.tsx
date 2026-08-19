import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { DungeonScene } from '../scenes/DungeonScene';
import { GameHUD } from '../ui/GameHUD';
import { UpgradeModal } from '../ui/UpgradeModal';
import { GameOverModal } from '../ui/GameOverModal';
import { VictoryModal } from '../ui/VictoryModal';
import { AVAILABLE_UPGRADES, Upgrade } from '../config/gameConfig';
import { SoundFX } from '../audio/SoundFX';

export const GameContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<DungeonScene | null>(null);

  // React states
  const [hp, setHp] = useState<number>(100);
  const [maxHp, setMaxHp] = useState<number>(100);
  const [dashCdProgress, setDashCdProgress] = useState<number>(1);
  const [attackCdProgress, setAttackCdProgress] = useState<number>(1);
  const [currentRoomName, setCurrentRoomName] = useState<string>('Sala Inicial');
  const [enemiesLeft, setEnemiesLeft] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number | null>(null);
  const [bossMaxHp, setBossMaxHp] = useState<number | null>(null);
  const [appliedUpgrades, setAppliedUpgrades] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [upgradeChoices, setUpgradeChoices] = useState<Upgrade[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [enemiesDefeated, setEnemiesDefeated] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth || 1024,
      height: containerRef.current.clientHeight || 640,
      backgroundColor: '#09080e',
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [DungeonScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on(Phaser.Core.Events.READY, () => {
      const scene = game.scene.getScene('DungeonScene') as DungeonScene;
      sceneRef.current = scene;

      scene.onHudUpdate = (data) => {
        setHp(data.hp);
        setMaxHp(data.maxHp);
        setDashCdProgress(data.dashCdProgress);
        setAttackCdProgress(data.attackCdProgress);
        setCurrentRoomName(data.currentRoomName);
        setEnemiesLeft(data.enemiesLeft);
        setBossHp(data.bossHp);
        setBossMaxHp(data.bossMaxHp);
      };

      scene.onOpenUpgradeChest = () => {
        // Pick 3 random distinct upgrades
        const shuffled = [...AVAILABLE_UPGRADES].sort(() => 0.5 - Math.random());
        const picked = shuffled.slice(0, 3);
        setUpgradeChoices(picked);
        setShowUpgradeModal(true);
        scene.scene.pause();
      };

      scene.onGameOver = () => {
        setEnemiesDefeated(scene.totalEnemiesDefeated);
        setIsGameOver(true);
        scene.scene.pause();
      };

      scene.onBossDefeated = () => {
        setEnemiesDefeated(scene.totalEnemiesDefeated);
        const elapsed = (scene.time.now - scene.gameStartTime) / 1000;
        setElapsedTime(elapsed);
        setIsVictory(true);
        scene.scene.pause();
      };
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleSelectUpgrade = (upgrade: Upgrade) => {
    const scene = sceneRef.current;
    if (scene && scene.player) {
      upgrade.effect(scene.player);
      scene.player.appliedUpgrades.push(upgrade.title);
      setAppliedUpgrades([...scene.player.appliedUpgrades]);
      SoundFX.playVictory();
      scene.scene.resume();
    }
    setShowUpgradeModal(false);
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setIsVictory(false);
    setShowUpgradeModal(false);
    setAppliedUpgrades([]);
    setBossHp(null);
    setBossMaxHp(null);

    const scene = sceneRef.current;
    if (scene) {
      scene.scene.restart();
    }
  };

  const handleToggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    SoundFX.setMuted(newMute);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Game Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex-1 max-w-full max-h-screen overflow-hidden cursor-crosshair"
      />

      {/* React HUD Overlay */}
      <GameHUD
        hp={hp}
        maxHp={maxHp}
        dashCdProgress={dashCdProgress}
        attackCdProgress={attackCdProgress}
        currentRoomName={currentRoomName}
        enemiesLeft={enemiesLeft}
        bossHp={bossHp}
        bossMaxHp={bossMaxHp}
        appliedUpgrades={appliedUpgrades}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Upgrade Selection Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          upgrades={upgradeChoices}
          onSelect={handleSelectUpgrade}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          onRestart={handleRestart}
          enemiesDefeated={enemiesDefeated}
        />
      )}

      {/* Victory Modal */}
      {isVictory && (
        <VictoryModal
          onPlayAgain={handleRestart}
          enemiesDefeated={enemiesDefeated}
          timeSeconds={elapsedTime}
        />
      )}
    </div>
  );
};
