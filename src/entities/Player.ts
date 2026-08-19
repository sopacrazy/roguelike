import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SoundFX } from '../audio/SoundFX';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public hp: number;
  public stats = {
    maxHp: GAME_CONFIG.player.maxHp,
    speed: GAME_CONFIG.player.speed,
    baseDamage: GAME_CONFIG.player.baseDamage,
    damageMultiplier: 1.0,
    attackCooldown: GAME_CONFIG.player.attackCooldown,
    arrowSpeed: GAME_CONFIG.player.arrowSpeed,
    arrowLifetime: GAME_CONFIG.player.arrowLifetime,
    dashSpeed: GAME_CONFIG.player.dashSpeed,
    dashDuration: GAME_CONFIG.player.dashDuration,
    dashCooldown: GAME_CONFIG.player.dashCooldown,
    lifesteal: 0,
  };

  public isAttacking: boolean = false;
  public isDashing: boolean = false;
  public isInvulnerable: boolean = false;
  public lastAttackTime: number = 0;
  public lastDashTime: number = 0;
  public aimAngle: number = 0;
  public appliedUpgrades: string[] = [];
  public arrows: Phaser.Physics.Arcade.Sprite[] = [];

  private bowSprite: Phaser.GameObjects.Sprite;

  private keys: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private walkAnimTimer: number = 0;
  private walkFrame: number = 0;
  private ghostTrailTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = this.stats.maxHp;

    this.setCollideWorldBounds(true);
    this.setSize(18, 22);
    this.setOffset(7, 8);
    this.setDepth(10);

    // Bow overlay: rotates independently of the body sprite so it always
    // points at the mouse cursor, matching the aim direction the arrows fire on.
    this.bowSprite = scene.add.sprite(x, y, 'player_bow');
    this.bowSprite.setDepth(11);

    const kb = scene.input.keyboard;
    if (kb) {
      this.keys = {
        w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      };
    } else {
      this.keys = {} as any;
    }
  }

  public update(time: number, delta: number, pointer: Phaser.Input.Pointer) {
    if (!this.active || this.hp <= 0) return;

    // Calculate aim angle to mouse cursor
    const worldPoint = pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
    this.aimAngle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);

    // Flip sprite towards cursor
    this.setFlipX(Math.cos(this.aimAngle) < 0);

    // Keep the bow glued to the player, always pointed at the cursor
    const bowOffset = 12;
    this.bowSprite.setPosition(
      this.x + Math.cos(this.aimAngle) * bowOffset,
      this.y + Math.sin(this.aimAngle) * bowOffset
    );
    this.bowSprite.setRotation(this.aimAngle);
    // Render the bow behind the body when aiming up (away from camera) and
    // in front when aiming down, so it doesn't float over the character's back.
    this.bowSprite.setDepth(Math.sin(this.aimAngle) < 0 ? this.depth - 1 : this.depth + 1);

    // Handle Dash
    if (Phaser.Input.Keyboard.JustDown(this.keys.space) || (pointer.rightButtonDown && pointer.rightButtonDown())) {
      this.tryDash(time);
    }

    if (this.isDashing) {
      // Spawn ghost trail during dash
      this.ghostTrailTimer += delta;
      if (this.ghostTrailTimer > 35) {
        this.ghostTrailTimer = 0;
        this.spawnGhostTrail();
      }
      return;
    }

    // Standard 8-direction movement
    let moveX = 0;
    let moveY = 0;

    if (this.keys.w?.isDown || this.keys.up?.isDown) moveY -= 1;
    if (this.keys.s?.isDown || this.keys.down?.isDown) moveY += 1;
    if (this.keys.a?.isDown || this.keys.left?.isDown) moveX -= 1;
    if (this.keys.d?.isDown || this.keys.right?.isDown) moveX += 1;

    const moving = moveX !== 0 || moveY !== 0;

    if (moving) {
      const dir = new Phaser.Math.Vector2(moveX, moveY).normalize();
      this.setVelocity(dir.x * this.stats.speed, dir.y * this.stats.speed);

      // Walk cycle animation
      this.walkAnimTimer += delta;
      if (this.walkAnimTimer > 150) {
        this.walkAnimTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
        this.setTexture(this.walkFrame === 0 ? 'player_walk_1' : 'player_walk_2');
      }
    } else {
      this.setVelocity(0, 0);
      this.setTexture('player_idle');
    }

    // Auto attack if left mouse button held down
    if (pointer.isDown && pointer.leftButtonDown()) {
      this.tryAttack(time);
    }
  }

  public tryAttack(time: number): boolean {
    if (this.isDashing || time - this.lastAttackTime < this.stats.attackCooldown) {
      return false;
    }

    this.lastAttackTime = time;
    this.isAttacking = true;

    SoundFX.playArrowShoot();

    // Nock & release: arrow spawns at the bow tip, flying toward the cursor.
    // Hit detection against enemies happens every frame in
    // CombatSystem.updatePlayerArrows while the arrow is in flight.
    const spawnDist = 18;
    const arrowX = this.x + Math.cos(this.aimAngle) * spawnDist;
    const arrowY = this.y + Math.sin(this.aimAngle) * spawnDist;

    const arrow = this.scene.physics.add.sprite(arrowX, arrowY, 'arrow');
    arrow.setRotation(this.aimAngle);
    arrow.setTint(0x7dd3fc);
    arrow.setDepth(11);
    arrow.setSize(12, 6);
    arrow.setVelocity(
      Math.cos(this.aimAngle) * this.stats.arrowSpeed,
      Math.sin(this.aimAngle) * this.stats.arrowSpeed
    );
    this.arrows.push(arrow);

    const dungeonScene = this.scene as any;
    if (dungeonScene.wallsGroup) {
      this.scene.physics.add.collider(arrow, dungeonScene.wallsGroup, () => arrow.destroy());
    }
    if (dungeonScene.obstaclesGroup) {
      this.scene.physics.add.collider(arrow, dungeonScene.obstaclesGroup, () => arrow.destroy());
    }

    this.scene.time.delayedCall(this.stats.arrowLifetime, () => {
      if (arrow.active) arrow.destroy();
    });

    this.scene.time.delayedCall(140, () => {
      this.isAttacking = false;
    });

    return true;
  }

  public tryDash(time: number): boolean {
    if (this.isDashing || time - this.lastDashTime < this.stats.dashCooldown) {
      return false;
    }

    this.lastDashTime = time;
    this.isDashing = true;
    this.isInvulnerable = true;

    SoundFX.playDash();

    // Dash in direction of movement, or aim direction if standing still
    let dashAngle = this.aimAngle;
    const vel = this.body ? this.body.velocity : null;
    if (vel && (vel.x !== 0 || vel.y !== 0)) {
      dashAngle = Math.atan2(vel.y, vel.x);
    }

    const dashVector = new Phaser.Math.Vector2(
      Math.cos(dashAngle) * this.stats.dashSpeed,
      Math.sin(dashAngle) * this.stats.dashSpeed
    );

    this.setVelocity(dashVector.x, dashVector.y);

    // Dust burst
    this.spawnDashDust();

    this.scene.time.delayedCall(this.stats.dashDuration, () => {
      this.isDashing = false;
      this.isInvulnerable = false;
      this.setVelocity(0, 0);
    });

    return true;
  }

  private spawnGhostTrail() {
    const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key);
    ghost.setFlipX(this.flipX);
    ghost.setTint(0x38bdf8);
    ghost.setAlpha(0.6);
    ghost.setDepth(this.depth - 1);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scale: 0.9,
      duration: 200,
      ease: 'Linear',
      onComplete: () => ghost.destroy(),
    });
  }

  private spawnDashDust() {
    for (let i = 0; i < 4; i++) {
      const dust = this.scene.add.sprite(this.x + Phaser.Math.Between(-8, 8), this.y + 10, 'particle_smoke');
      dust.setAlpha(0.7);
      dust.setScale(0.8);
      this.scene.tweens.add({
        targets: dust,
        y: dust.y - 10,
        alpha: 0,
        scale: 1.4,
        duration: 250,
        onComplete: () => dust.destroy(),
      });
    }
  }

  public takeDamage(amount: number, sourceX?: number, sourceY?: number): boolean {
    if (this.isInvulnerable || this.hp <= 0) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.isInvulnerable = true;

    SoundFX.playPlayerHurt();

    // Camera shake
    this.scene.cameras.main.shake(120, 0.008);

    // Knockback
    if (sourceX !== undefined && sourceY !== undefined) {
      const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);
      this.setVelocity(Math.cos(angle) * 220, Math.sin(angle) * 220);
    }

    // Red damage flash + invulnerability blink
    this.setTint(0xff2222);

    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      yoyo: true,
      repeat: 3,
      duration: 80,
      onComplete: () => {
        this.clearTint();
        this.setAlpha(1);
        this.isInvulnerable = false;
      },
    });

    // Check death
    if (this.hp <= 0) {
      this.onDeath();
    }

    return true;
  }

  private onDeath() {
    SoundFX.playGameOver();
    this.setVelocity(0, 0);
    this.setTint(0x64748b);
    this.bowSprite.setVisible(false);
    const scene = this.scene as any;
    if (scene.onGameOver) {
      scene.onGameOver();
    }
  }

  public getDamage(): number {
    return Math.round(this.stats.baseDamage * this.stats.damageMultiplier);
  }

  public getDashCooldownProgress(time: number): number {
    const elapsed = time - this.lastDashTime;
    return Math.min(1, elapsed / this.stats.dashCooldown);
  }

  public getAttackCooldownProgress(time: number): number {
    const elapsed = time - this.lastAttackTime;
    return Math.min(1, elapsed / this.stats.attackCooldown);
  }
}
