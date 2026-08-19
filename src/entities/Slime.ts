import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { GAME_CONFIG } from '../config/gameConfig';

export class Slime extends Enemy {
  private hopTimer: number = 0;
  private isHopping: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const cfg = GAME_CONFIG.enemies.slime;
    super(scene, x, y, 'slime_1', cfg.hp, cfg.damage, cfg.speed, cfg.knockbackResistance);
    this.enemyType = 'slime';
    this.setSize(20, 18);
    this.setOffset(4, 8);
  }

  protected handleBehavior(time: number, delta: number) {
    if (!this.playerRef || !this.playerRef.active || this.playerRef.hp <= 0) {
      this.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);

    // Slime moves in rhythmic bouncing hops towards player
    this.hopTimer += delta;
    if (this.hopTimer > 400) {
      this.hopTimer = 0;
      this.isHopping = !this.isHopping;

      if (this.isHopping && dist < 420) {
        this.setTexture('slime_2');
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
        this.setVelocity(Math.cos(angle) * this.moveSpeed * 1.5, Math.sin(angle) * this.moveSpeed * 1.5);
        this.setFlipX(Math.cos(angle) < 0);
      } else {
        this.setTexture('slime_1');
        this.setVelocity(this.body?.velocity.x ? this.body.velocity.x * 0.4 : 0, this.body?.velocity.y ? this.body.velocity.y * 0.4 : 0);
      }
    }
  }
}
