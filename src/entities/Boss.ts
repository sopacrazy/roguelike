import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { GAME_CONFIG } from '../config/gameConfig';
import { SoundFX } from '../audio/SoundFX';

export type BossAttack = 'idle' | 'melee' | 'charge' | 'spin' | 'radial';

export class Boss extends Enemy {
  public currentAttack: BossAttack = 'idle';
  public isActing: boolean = false;
  private attackTimer: number = 0;
  private actionCooldown: number = 2400; // ms between attacks
  private telegraphGfx: Phaser.GameObjects.Graphics | null = null;
  private walkTimer: number = 0;
  private walkFrame: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const cfg = GAME_CONFIG.enemies.boss;
    super(scene, x, y, 'boss_idle', cfg.hp, cfg.damage, cfg.speed, cfg.knockbackResistance);
    this.enemyType = 'boss';
    this.setSize(38, 48);
    this.setOffset(13, 12);
    this.setScale(1.2);

    this.telegraphGfx = scene.add.graphics();
    this.telegraphGfx.setDepth(7);
  }

  public updateEnemy(time: number, delta: number) {
    if (!this.active || this.state === 'dead') {
      if (this.telegraphGfx) this.telegraphGfx.clear();
      return;
    }

    // Boss has custom full-width top HUD, no mini overhead bar needed
    if (this.hpBar) this.hpBar.clear();

    this.handleBehavior(time, delta);
  }

  protected handleBehavior(time: number, delta: number) {
    if (!this.playerRef || !this.playerRef.active || this.playerRef.hp <= 0) {
      this.setVelocity(0, 0);
      if (this.telegraphGfx) this.telegraphGfx.clear();
      return;
    }

    // Enrage speed up if low HP
    const isEnraged = this.hp < this.maxHp * 0.4;
    this.moveSpeed = isEnraged ? 120 : 85;
    this.actionCooldown = isEnraged ? 1800 : 2500;

    if (this.isActing) {
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
    this.setFlipX(Math.cos(angleToPlayer) < 0);

    // Attack selection loop
    this.attackTimer += delta;
    if (this.attackTimer >= this.actionCooldown) {
      this.attackTimer = 0;
      this.chooseAndPerformAttack(dist, angleToPlayer, isEnraged);
      return;
    }

    // Move toward player between attacks
    if (dist > 45) {
      this.setVelocity(Math.cos(angleToPlayer) * this.moveSpeed, Math.sin(angleToPlayer) * this.moveSpeed);
      this.walkTimer += delta;
      if (this.walkTimer > 200) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
        this.setTexture(this.walkFrame === 0 ? 'boss_walk_1' : 'boss_walk_2');
      }
    } else {
      this.setVelocity(0, 0);
      this.setTexture('boss_idle');
    }
  }

  private chooseAndPerformAttack(dist: number, angleToPlayer: number, isEnraged: boolean) {
    const attacks: BossAttack[] = ['charge', 'radial', 'spin'];
    if (dist < 80) {
      attacks.unshift('melee', 'spin');
    }

    const chosen = attacks[Phaser.Math.Between(0, attacks.length - 1)];

    switch (chosen) {
      case 'melee':
        this.executeMeleeCleave();
        break;
      case 'charge':
        this.executeChargeAttack(angleToPlayer);
        break;
      case 'spin':
        this.executeSpinAttack();
        break;
      case 'radial':
        this.executeRadialProjectiles(isEnraged ? 14 : 9);
        break;
    }
  }

  // 1. Melee Cleave
  private executeMeleeCleave() {
    this.isActing = true;
    this.currentAttack = 'melee';
    this.setVelocity(0, 0);

    this.setTint(0xf87171);

    // Telegraph forward cone/circle
    if (this.telegraphGfx && this.playerRef) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
      this.telegraphGfx.clear();
      this.telegraphGfx.fillStyle(0xef4444, 0.35);
      this.telegraphGfx.fillCircle(this.x + Math.cos(angle) * 35, this.y + Math.sin(angle) * 35, 45);
    }

    this.scene.time.delayedCall(450, () => {
      if (this.telegraphGfx) this.telegraphGfx.clear();
      if (!this.active || this.state === 'dead') return;

      this.clearTint();
      SoundFX.playBossSlam();
      this.scene.cameras.main.shake(150, 0.012);

      // Check hit
      if (this.playerRef && this.playerRef.active) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
        if (dist < 85) {
          this.playerRef.takeDamage(this.damage, this.x, this.y);
        }
      }

      this.scene.time.delayedCall(300, () => {
        this.isActing = false;
        this.currentAttack = 'idle';
      });
    });
  }

  // 2. Charge / Dash across the room
  private executeChargeAttack(angleToPlayer: number) {
    this.isActing = true;
    this.currentAttack = 'charge';
    this.setVelocity(0, 0);

    // Telegraph charge trajectory line
    if (this.telegraphGfx) {
      this.telegraphGfx.clear();
      this.telegraphGfx.lineStyle(16, 0xef4444, 0.4);
      this.telegraphGfx.lineBetween(
        this.x,
        this.y,
        this.x + Math.cos(angleToPlayer) * 350,
        this.y + Math.sin(angleToPlayer) * 350
      );
    }

    this.setTint(0xfbbf24);

    this.scene.time.delayedCall(600, () => {
      if (this.telegraphGfx) this.telegraphGfx.clear();
      if (!this.active || this.state === 'dead') return;

      this.clearTint();
      SoundFX.playDash();

      const chargeSpeed = GAME_CONFIG.enemies.boss.chargeSpeed;
      this.setVelocity(Math.cos(angleToPlayer) * chargeSpeed, Math.sin(angleToPlayer) * chargeSpeed);

      // Check collision during charge with player
      const checkOverlap = this.scene.time.addEvent({
        delay: 50,
        repeat: 10,
        callback: () => {
          if (this.playerRef && this.playerRef.active) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
            if (dist < 50) {
              this.playerRef.takeDamage(this.damage * 1.2, this.x, this.y);
            }
          }
        },
      });

      this.scene.time.delayedCall(550, () => {
        checkOverlap.remove();
        this.setVelocity(0, 0);
        this.isActing = false;
        this.currentAttack = 'idle';
      });
    });
  }

  // 3. Circular Whirlwind Attack
  private executeSpinAttack() {
    this.isActing = true;
    this.currentAttack = 'spin';
    this.setVelocity(0, 0);

    // Telegraph circular red zone around boss
    if (this.telegraphGfx) {
      this.telegraphGfx.clear();
      this.telegraphGfx.fillStyle(0xd97706, 0.4);
      this.telegraphGfx.fillCircle(this.x, this.y, 90);
    }

    this.setTint(0xf97316);

    this.scene.time.delayedCall(500, () => {
      if (this.telegraphGfx) this.telegraphGfx.clear();
      if (!this.active || this.state === 'dead') return;

      this.clearTint();
      SoundFX.playSlash();
      SoundFX.playBossSlam();

      // Spin visual tween
      this.scene.tweens.add({
        targets: this,
        angle: 360,
        duration: 350,
        onComplete: () => {
          this.setAngle(0);
        },
      });

      // Spawn spin slash wave
      const wave = this.scene.add.circle(this.x, this.y, 10, 0xf97316, 0.6);
      wave.setDepth(12);
      this.scene.tweens.add({
        targets: wave,
        radius: 95,
        alpha: 0,
        duration: 350,
        onComplete: () => wave.destroy(),
      });

      if (this.playerRef && this.playerRef.active) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
        if (dist < 95) {
          this.playerRef.takeDamage(this.damage, this.x, this.y);
        }
      }

      this.scene.time.delayedCall(400, () => {
        this.isActing = false;
        this.currentAttack = 'idle';
      });
    });
  }

  // 4. Radial Projectile Barrage (All Directions)
  private executeRadialProjectiles(count: number = 10) {
    this.isActing = true;
    this.currentAttack = 'radial';
    this.setVelocity(0, 0);

    this.setTint(0x818cf8);
    SoundFX.playBossCast();

    this.scene.time.delayedCall(450, () => {
      if (!this.active || this.state === 'dead') return;

      this.clearTint();
      SoundFX.playBossCast();

      const step = (Math.PI * 2) / count;
      const speed = 190;

      for (let i = 0; i < count; i++) {
        const angle = i * step;
        const orb = this.scene.physics.add.sprite(
          this.x + Math.cos(angle) * 20,
          this.y + Math.sin(angle) * 20,
          'boss_orb'
        );
        orb.setDepth(12);
        orb.setSize(12, 12);
        orb.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        const combatScene = this.scene as any;
        if (combatScene && combatScene.player) {
          this.scene.physics.add.overlap(orb, combatScene.player, () => {
            if (combatScene.player.takeDamage(16, orb.x, orb.y)) {
              orb.destroy();
            }
          });
        }

        if (combatScene && combatScene.wallsGroup) {
          this.scene.physics.add.collider(orb, combatScene.wallsGroup, () => {
            orb.destroy();
          });
        }

        this.scene.time.delayedCall(3000, () => {
          if (orb.active) orb.destroy();
        });
      }

      this.scene.time.delayedCall(350, () => {
        this.isActing = false;
        this.currentAttack = 'idle';
      });
    });
  }

  public die() {
    if (this.state === 'dead') return;
    this.state = 'dead';
    this.setVelocity(0, 0);
    if (this.telegraphGfx) {
      this.telegraphGfx.destroy();
      this.telegraphGfx = null;
    }

    SoundFX.playBossSlam();
    SoundFX.playVictory();

    this.scene.cameras.main.shake(500, 0.02);

    // Multi-stage explosion
    for (let i = 0; i < 15; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        if (!this.scene) return;
        const spark = this.scene.add.sprite(
          this.x + Phaser.Math.Between(-30, 30),
          this.y + Phaser.Math.Between(-30, 30),
          'particle_gold'
        );
        spark.setDepth(20);
        spark.setScale(2);
        this.scene.tweens.add({
          targets: spark,
          scale: 0.2,
          alpha: 0,
          duration: 400,
          onComplete: () => spark.destroy(),
        });
      });
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => {
        const scene = this.scene as any;
        if (scene.onBossDefeated) {
          scene.onBossDefeated();
        }
        this.destroy();
      },
    });
  }

  public destroy(fromScene?: boolean) {
    if (this.telegraphGfx) {
      this.telegraphGfx.destroy();
      this.telegraphGfx = null;
    }
    super.destroy(fromScene);
  }
}
