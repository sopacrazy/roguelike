import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { GAME_CONFIG } from '../config/gameConfig';

export class Skeleton extends Enemy {
  private walkTimer: number = 0;
  private walkFrame: number = 0;
  private attackWindup: boolean = false;
  private attackCooldown: number = GAME_CONFIG.enemies.skeleton.attackCooldown;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const cfg = GAME_CONFIG.enemies.skeleton;
    super(scene, x, y, 'skeleton_idle', cfg.hp, cfg.damage, cfg.speed, cfg.knockbackResistance);
    this.enemyType = 'skeleton';
    this.setSize(18, 24);
    this.setOffset(7, 6);
  }

  protected handleBehavior(time: number, delta: number) {
    if (!this.playerRef || !this.playerRef.active || this.playerRef.hp <= 0) {
      this.setVelocity(0, 0);
      return;
    }

    if (this.attackWindup) {
      return; // currently striking
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);

    if (dist < 38) {
      // In melee range - attempt attack
      if (time - this.lastAttackTime > this.attackCooldown) {
        this.performAttack(time);
        return;
      }
    }

    if (dist < 420) {
      this.state = 'chase';
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
      this.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
      this.setFlipX(Math.cos(angle) < 0);

      // Walk animation
      this.walkTimer += delta;
      if (this.walkTimer > 180) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
        this.setTexture(this.walkFrame === 0 ? 'skeleton_walk_1' : 'skeleton_walk_2');
      }
    } else {
      this.state = 'idle';
      this.setVelocity(0, 0);
      this.setTexture('skeleton_idle');
    }
  }

  private performAttack(time: number) {
    this.lastAttackTime = time;
    this.attackWindup = true;
    this.setVelocity(0, 0);

    // Red warning flash before swing
    this.setTint(0xff6666);

    this.scene.time.delayedCall(250, () => {
      if (!this.active || this.state === 'dead') return;
      this.clearTint();

      // Swing hitbox
      if (this.playerRef && this.playerRef.active) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
        if (dist <= 48) {
          this.playerRef.takeDamage(this.damage, this.x, this.y);
        }
      }

      this.attackWindup = false;
    });
  }
}
