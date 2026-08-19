import Phaser from 'phaser';
import { Player } from './Player';
import { SoundFX } from '../audio/SoundFX';

export type EnemyState = 'idle' | 'chase' | 'attack' | 'dead';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public maxHp: number;
  public hp: number;
  public damage: number;
  public moveSpeed: number;
  public knockbackResist: number;
  public state: EnemyState = 'idle';
  public isInvulnerable: boolean = false;
  public lastAttackTime: number = 0;
  public enemyType: string = 'enemy';

  protected playerRef: Player | null = null;
  protected hpBar: Phaser.GameObjects.Graphics | null = null;
  private animTimer: number = 0;
  private animFrame: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    hp: number,
    damage: number,
    speed: number,
    knockbackResist: number = 0.3
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHp = hp;
    this.hp = hp;
    this.damage = damage;
    this.moveSpeed = speed;
    this.knockbackResist = knockbackResist;

    this.setCollideWorldBounds(true);
    this.setDepth(9);

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(14);
  }

  public setPlayer(player: Player) {
    this.playerRef = player;
  }

  public updateEnemy(time: number, delta: number) {
    if (!this.active || this.state === 'dead') {
      if (this.hpBar) this.hpBar.clear();
      return;
    }

    this.updateHpBar();
    this.handleBehavior(time, delta);
  }

  protected handleBehavior(time: number, delta: number) {
    // Default chase player behavior
    if (!this.playerRef || !this.playerRef.active || this.playerRef.hp <= 0) {
      this.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);

    if (dist < 450) {
      this.state = 'chase';
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
      this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
      this.setFlipX(Math.cos(angle) < 0);
    } else {
      this.state = 'idle';
      this.setVelocity(0, 0);
    }
  }

  public takeDamage(amount: number, sourceX: number, sourceY: number): boolean {
    if (!this.active || this.state === 'dead' || this.isInvulnerable) return false;

    this.hp -= amount;
    this.isInvulnerable = true;

    SoundFX.playHit();

    // Damage number popup
    this.showDamageNumber(amount);

    // Hit sparks / blood particles
    this.spawnHitParticles();

    // Knockback
    const kbForce = Math.max(0, 220 * (1 - this.knockbackResist));
    if (kbForce > 0) {
      const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);
      this.setVelocity(Math.cos(angle) * kbForce, Math.sin(angle) * kbForce);
    }

    // Flash white / red
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) {
        this.setTint(0xff3333);
      }
    });

    this.scene.time.delayedCall(160, () => {
      if (this.active) {
        this.clearTint();
        this.isInvulnerable = false;
      }
    });

    if (this.hp <= 0) {
      this.die();
    }

    return true;
  }

  protected showDamageNumber(amount: number) {
    const text = this.scene.add.text(
      this.x + Phaser.Math.Between(-8, 8),
      this.y - 18,
      `-${amount}`,
      {
        fontSize: '13px',
        color: '#ffedd5',
        stroke: '#991b1b',
        strokeThickness: 3,
        fontStyle: 'bold',
        fontFamily: 'monospace',
      }
    );
    text.setDepth(20);
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 24,
      alpha: 0,
      scale: 1.2,
      duration: 550,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  protected spawnHitParticles() {
    for (let i = 0; i < 4; i++) {
      const spark = this.scene.add.sprite(
        this.x + Phaser.Math.Between(-6, 6),
        this.y + Phaser.Math.Between(-6, 6),
        'particle_spark'
      );
      spark.setDepth(15);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(12, 28);
      this.scene.tweens.add({
        targets: spark,
        x: spark.x + Math.cos(angle) * dist,
        y: spark.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 250,
        onComplete: () => spark.destroy(),
      });
    }
  }

  public die() {
    if (this.state === 'dead') return;
    this.state = 'dead';
    this.setVelocity(0, 0);

    SoundFX.playEnemyDeath();

    if (this.hpBar) {
      this.hpBar.destroy();
      this.hpBar = null;
    }

    // Death explosion of dust and sparks
    for (let i = 0; i < 6; i++) {
      const smoke = this.scene.add.sprite(
        this.x + Phaser.Math.Between(-10, 10),
        this.y + Phaser.Math.Between(-10, 10),
        'particle_smoke'
      );
      smoke.setDepth(15);
      this.scene.tweens.add({
        targets: smoke,
        alpha: 0,
        scale: 1.5,
        y: smoke.y - 12,
        duration: 350,
        onComplete: () => smoke.destroy(),
      });
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 200,
      onComplete: () => {
        this.destroy();
      },
    });

    // Notify scene of enemy death
    const scene = this.scene as any;
    if (scene.onEnemyKilled) {
      scene.onEnemyKilled(this);
    }
  }

  protected updateHpBar() {
    if (!this.hpBar || !this.active || this.hp >= this.maxHp) {
      if (this.hpBar) this.hpBar.clear();
      return;
    }

    this.hpBar.clear();
    const barWidth = 24;
    const barHeight = 4;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.height / 2 - 8;

    // Background
    this.hpBar.fillStyle(0x0f172a, 0.85);
    this.hpBar.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Health Fill
    const pct = Math.max(0, this.hp / this.maxHp);
    const color = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xf59e0b : 0xef4444;
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(barX, barY, barWidth * pct, barHeight);
  }

  public destroy(fromScene?: boolean) {
    if (this.hpBar) {
      this.hpBar.destroy();
      this.hpBar = null;
    }
    super.destroy(fromScene);
  }
}
