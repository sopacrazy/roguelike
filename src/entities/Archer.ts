import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { GAME_CONFIG } from '../config/gameConfig';
import { SoundFX } from '../audio/SoundFX';

export class Archer extends Enemy {
  private walkTimer: number = 0;
  private walkFrame: number = 0;
  private shootCooldown: number = GAME_CONFIG.enemies.archer.shootCooldown;
  private preferredDist: number = GAME_CONFIG.enemies.archer.preferredDist;
  private isAiming: boolean = false;
  private aimLine: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const cfg = GAME_CONFIG.enemies.archer;
    super(scene, x, y, 'archer_idle', cfg.hp, cfg.damage, cfg.speed, cfg.knockbackResistance);
    this.enemyType = 'archer';
    this.setSize(18, 24);
    this.setOffset(7, 6);

    this.aimLine = scene.add.graphics();
    this.aimLine.setDepth(8);
  }

  protected handleBehavior(time: number, delta: number) {
    if (!this.playerRef || !this.playerRef.active || this.playerRef.hp <= 0) {
      this.setVelocity(0, 0);
      if (this.aimLine) this.aimLine.clear();
      return;
    }

    if (this.isAiming) {
      this.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
    this.setFlipX(Math.cos(angleToPlayer) < 0);

    // Kiting logic: If too close, retreat; if too far, approach
    if (dist < 130) {
      // Retreat
      const retreatAngle = angleToPlayer + Math.PI;
      this.setVelocity(Math.cos(retreatAngle) * this.moveSpeed, Math.sin(retreatAngle) * this.moveSpeed);
      this.animateWalk(delta);
    } else if (dist > this.preferredDist + 40 && dist < 450) {
      // Move closer
      this.setVelocity(Math.cos(angleToPlayer) * this.moveSpeed, Math.sin(angleToPlayer) * this.moveSpeed);
      this.animateWalk(delta);
    } else if (dist <= 450) {
      // In comfortable shooting range
      this.setVelocity(0, 0);
      this.setTexture('archer_idle');

      if (time - this.lastAttackTime > this.shootCooldown) {
        this.startAimingAndShoot(time);
      }
    } else {
      this.setVelocity(0, 0);
      this.setTexture('archer_idle');
    }
  }

  private animateWalk(delta: number) {
    this.walkTimer += delta;
    if (this.walkTimer > 180) {
      this.walkTimer = 0;
      this.walkFrame = (this.walkFrame + 1) % 2;
      this.setTexture(this.walkFrame === 0 ? 'archer_walk_1' : 'archer_walk_2');
    }
  }

  private startAimingAndShoot(time: number) {
    if (!this.playerRef || !this.playerRef.active) return;

    this.lastAttackTime = time;
    this.isAiming = true;
    this.setVelocity(0, 0);

    const targetX = this.playerRef.x;
    const targetY = this.playerRef.y;
    const fireAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    // Draw aiming laser line
    if (this.aimLine) {
      this.aimLine.clear();
      this.aimLine.lineStyle(1.5, 0xef4444, 0.6);
      this.aimLine.lineBetween(
        this.x,
        this.y,
        this.x + Math.cos(fireAngle) * 320,
        this.y + Math.sin(fireAngle) * 320
      );
    }

    this.scene.time.delayedCall(450, () => {
      if (this.aimLine) this.aimLine.clear();
      if (!this.active || this.state === 'dead') return;

      this.fireArrow(fireAngle);
      this.isAiming = false;
    });
  }

  private fireArrow(angle: number) {
    SoundFX.playArrowShoot();

    const arrow = this.scene.physics.add.sprite(
      this.x + Math.cos(angle) * 16,
      this.y + Math.sin(angle) * 16,
      'arrow'
    );
    arrow.setRotation(angle);
    arrow.setDepth(11);
    arrow.setSize(12, 6);

    const speed = GAME_CONFIG.enemies.archer.arrowSpeed;
    arrow.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Add collision with player
    const combatScene = this.scene as any;
    if (combatScene && combatScene.player) {
      const collider = this.scene.physics.add.overlap(arrow, combatScene.player, () => {
        if (combatScene.player.takeDamage(this.damage, arrow.x, arrow.y)) {
          arrow.destroy();
        }
      });

      // Also destroy on wall / timeout
      this.scene.time.delayedCall(2500, () => {
        if (arrow.active) arrow.destroy();
      });

      // Wall collision
      if (combatScene.wallsGroup) {
        this.scene.physics.add.collider(arrow, combatScene.wallsGroup, () => {
          arrow.destroy();
        });
      }
    }
  }

  public destroy(fromScene?: boolean) {
    if (this.aimLine) {
      this.aimLine.destroy();
      this.aimLine = null;
    }
    super.destroy(fromScene);
  }
}
