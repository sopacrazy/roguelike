import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class CombatSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Checked every frame while arrows are in flight (a single click's arrow
  // can travel across several frames before it reaches or misses a target).
  public updatePlayerArrows(player: Player, _time: number) {
    const scene = this.scene as any;
    const enemies: Enemy[] = scene.roomSystem?.activeEnemies || [];

    player.arrows = player.arrows.filter((arrow) => arrow.active);
    if (!player.arrows.length || !enemies.length) return;

    let hitAny = false;

    player.arrows.forEach((arrow) => {
      if (!arrow.active) return;

      for (const enemy of enemies) {
        if (!enemy.active || enemy.state === 'dead') continue;

        const dist = Phaser.Math.Distance.Between(arrow.x, arrow.y, enemy.x, enemy.y);
        const hitRadius = enemy.width / 2 + 6;
        if (dist <= hitRadius) {
          const dmg = player.getDamage();
          if (enemy.takeDamage(dmg, arrow.x, arrow.y)) {
            hitAny = true;

            // Lifesteal perk check
            if (player.stats.lifesteal > 0) {
              player.hp = Math.min(player.stats.maxHp, player.hp + player.stats.lifesteal);
            }
          }
          arrow.destroy();
          break;
        }
      }
    });

    if (hitAny) {
      this.scene.cameras.main.shake(80, 0.005);
    }
  }

  public checkEnemyPlayerOverlap(player: Player, enemy: Enemy, time: number) {
    if (!player.active || !enemy.active || enemy.state === 'dead' || player.isInvulnerable) return;

    // Contact damage (mainly for Slime and body contact). Must be gated by
    // actual proximity - without a distance check every slime in the room
    // damages the player on a timer regardless of where it is standing.
    if (enemy.enemyType === 'slime') {
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      const contactRange = (player.width + enemy.width) / 2 - 6;
      if (dist <= contactRange && time - enemy.lastAttackTime > 800) {
        enemy.lastAttackTime = time;
        player.takeDamage(enemy.damage, enemy.x, enemy.y);
      }
    }
  }
}
