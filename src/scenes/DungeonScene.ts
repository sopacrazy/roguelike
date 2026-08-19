import Phaser from 'phaser';
import { TextureGenerator } from '../graphics/TextureGenerator';
import { Player } from '../entities/Player';
import { RoomSystem, RoomData } from '../systems/RoomSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { SoundFX } from '../audio/SoundFX';

export class DungeonScene extends Phaser.Scene {
  public player!: Player;
  public roomSystem!: RoomSystem;
  public combatSystem!: CombatSystem;
  public wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  public obstaclesGroup!: Phaser.Physics.Arcade.StaticGroup;
  public torches: Phaser.GameObjects.Sprite[] = [];
  public torchesAnimTimer: number = 0;

  // React callbacks
  public onHudUpdate?: (data: {
    hp: number;
    maxHp: number;
    dashCdProgress: number;
    attackCdProgress: number;
    currentRoomName: string;
    currentStageNumber: number;
    enemiesRemainingInRoom: number;
    enemiesTotalInRoom: number;
    bossHp: number | null;
    bossMaxHp: number | null;
  }) => void;

  public onOpenUpgradeChest?: () => void;
  public onGameOver?: () => void;
  public onBossDefeated?: () => void;
  public onRoomCleared?: (room: RoomData) => void;
  public onRoomChanged?: (room: RoomData) => void;
  public onEnemiesUpdated?: (data: { active: number; remainingInRoom: number; totalInRoom: number }) => void;

  public totalEnemiesDefeated: number = 0;
  public gameStartTime: number = 0;
  public isGameWon: boolean = false;
  public isGameOver: boolean = false;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  public create() {
    this.totalEnemiesDefeated = 0;
    this.gameStartTime = this.time.now;
    this.isGameWon = false;
    this.isGameOver = false;

    // Phaser reuses this Scene instance across scene.restart() calls (only
    // the lifecycle methods re-run, not the constructor), so class-level
    // arrays populated during create() must be reset here. Otherwise
    // addDecorations() below keeps pushing onto last run's torches array,
    // which still holds sprites Phaser already destroyed on scene shutdown -
    // animating one of those in update() throws and freezes the whole loop.
    this.torches = [];
    this.torchesAnimTimer = 0;

    // Background music starts once here and just loops through restarts
    // (startMusic() no-ops if it's already playing)
    SoundFX.startMusic();

    // Generate all procedural pixel art textures
    TextureGenerator.generateAll(this);

    // Create groups
    this.wallsGroup = this.physics.add.staticGroup();
    this.obstaclesGroup = this.physics.add.staticGroup();

    // Systems
    this.roomSystem = new RoomSystem(this);
    this.combatSystem = new CombatSystem(this);

    // The physics world defaults its bounds to the canvas size, which is far
    // smaller than the dungeon (rooms extend into negative X and well past
    // canvas height/width). With collideWorldBounds on the player/enemies,
    // that invisible box blocks movement once you're deep in a room. Expand
    // it to actually cover every room before anything collidable is created.
    this.setWorldBoundsFromRooms();

    // Build the dungeon map geometry
    this.buildDungeonMap();

    // Spawn Player in Room 1 (Sala Inicial)
    this.player = new Player(this, 17 * 32, 8 * 32);

    // Setup room doors and chest entities
    this.roomSystem.setupDoorsAndChests();

    // Setup Physics Collisions
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.player, this.obstaclesGroup);
    this.physics.add.collider(this.player, this.roomSystem.doorGroup);

    // Chest overlap
    this.physics.add.overlap(this.player, this.roomSystem.chestGroup, (_, chestObj) => {
      const chestSprite = chestObj as Phaser.Physics.Arcade.Sprite;
      this.roomSystem.openChest(chestSprite);
    });

    // Camera setup
    const worldBounds = this.physics.world.bounds;
    this.cameras.main.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBackgroundColor('#0d0c14');

    // Initial room trigger
    this.roomSystem.checkPlayerRoom(this.player.x, this.player.y, this.player);
  }

  private setWorldBoundsFromRooms() {
    const tile = 32;
    const margin = 3; // tiles, so the ring of walls/decorations around the outermost rooms stays inside bounds
    let minTx = Infinity;
    let minTy = Infinity;
    let maxTx = -Infinity;
    let maxTy = -Infinity;

    this.roomSystem.rooms.forEach((room) => {
      minTx = Math.min(minTx, room.x);
      minTy = Math.min(minTy, room.y);
      maxTx = Math.max(maxTx, room.x + room.w);
      maxTy = Math.max(maxTy, room.y + room.h);
    });

    const x = (minTx - margin) * tile;
    const y = (minTy - margin) * tile;
    const width = (maxTx - minTx + margin * 2) * tile;
    const height = (maxTy - minTy + margin * 2) * tile;

    this.physics.world.setBounds(x, y, width, height);
  }

  private buildDungeonMap() {
    // Map tile bounds: X from -10 to 50, Y from 0 to 75
    // 1. Draw floor for each room and corridors
    this.roomSystem.rooms.forEach((room) => {
      for (let tx = room.x; tx < room.x + room.w; tx++) {
        for (let ty = room.y; ty < room.y + room.h; ty++) {
          const isAlt = (tx + ty) % 5 === 0;
          const floor = this.add.image(tx * 32 + 16, ty * 32 + 16, isAlt ? 'floor_tile_alt' : 'floor_tile');
          floor.setDepth(1);
        }
      }

      // Build surrounding walls for room
      this.buildRoomWalls(room);
    });

    // 2. Build corridors connecting rooms
    this.buildCorridor(16, 14, 2, 3); // Room 1 -> Room 2
    this.buildCorridor(16, 30, 2, 3); // Room 2 -> Room 3
    this.buildCorridor(6, 40, 2, 2); // Room 4 -> Room 3
    this.buildCorridor(27, 40, 2, 2); // Room 3 -> Room 5
    this.buildCorridor(35, 49, 2, 3); // Room 5 -> Room 6

    // 3. Add decorative props, pillars, crates, and torches
    this.addDecorations();
  }

  private buildRoomWalls(room: RoomData) {
    const rx = room.x;
    const ry = room.y;
    const rw = room.w;
    const rh = room.h;

    // Top and Bottom walls
    for (let x = rx - 1; x <= rx + rw; x++) {
      // Compare tile CENTERS to the door's center (doors are 64px/2 tiles
      // wide, centered on d.x/d.y). Comparing against the tile's corner
      // instead left an extra tile gap on one side of every door - a hole
      // in the wall you could walk through even while the door was locked.
      const tileCenter = x * 32 + 16;
      const hasTopDoor = room.doors.some((d) => d.direction === 'up' && Math.abs(d.x - tileCenter) < 32);
      const hasBottomDoor = room.doors.some((d) => d.direction === 'down' && Math.abs(d.x - tileCenter) < 32);

      if (!hasTopDoor) {
        this.createWallTile(x, ry - 1);
      }
      if (!hasBottomDoor) {
        this.createWallTile(x, ry + rh);
      }
    }

    // Left and Right walls
    for (let y = ry; y < ry + rh; y++) {
      const tileCenter = y * 32 + 16;
      const hasLeftDoor = room.doors.some((d) => d.direction === 'left' && Math.abs(d.y - tileCenter) < 32);
      const hasRightDoor = room.doors.some((d) => d.direction === 'right' && Math.abs(d.y - tileCenter) < 32);

      if (!hasLeftDoor) {
        this.createWallTile(rx - 1, y);
      }
      if (!hasRightDoor) {
        this.createWallTile(rx + rw, y);
      }
    }
  }

  private buildCorridor(startX: number, startY: number, width: number, height: number) {
    for (let tx = startX; tx < startX + width; tx++) {
      for (let ty = startY; ty < startY + height; ty++) {
        const floor = this.add.image(tx * 32 + 16, ty * 32 + 16, 'floor_tile');
        floor.setDepth(1);
      }
    }
  }

  private createWallTile(tx: number, ty: number) {
    const wall = this.wallsGroup.create(tx * 32 + 16, ty * 32 + 16, 'wall_top') as Phaser.Physics.Arcade.Sprite;
    wall.setDepth(4);
    wall.refreshBody();
  }

  private addDecorations() {
    // Pillars in Room 3 (Grande Salão)
    const pillarCoords = [
      { x: 10, y: 36 },
      { x: 23, y: 36 },
      { x: 10, y: 46 },
      { x: 23, y: 46 },
      { x: 30, y: 55 }, // Boss room pillars
      { x: 42, y: 55 },
      { x: 30, y: 64 },
      { x: 42, y: 64 },
    ];

    pillarCoords.forEach((p) => {
      const pillar = this.obstaclesGroup.create(p.x * 32 + 16, p.y * 32 + 16, 'pillar') as Phaser.Physics.Arcade.Sprite;
      pillar.setDepth(8);
      pillar.setSize(20, 24);
      pillar.setOffset(6, 20);
      pillar.refreshBody();
    });

    // Crates in corners
    const crateCoords = [
      { x: 11, y: 3 },
      { x: 12, y: 3 },
      { x: 11, y: 4 },
      { x: 22, y: 3 },
      { x: -5, y: 36 },
      { x: -4, y: 36 },
      { x: 29, y: 36 },
    ];

    crateCoords.forEach((c) => {
      const crate = this.obstaclesGroup.create(c.x * 32 + 16, c.y * 32 + 16, 'crate') as Phaser.Physics.Arcade.Sprite;
      crate.setDepth(5);
      crate.setSize(24, 24);
      crate.setOffset(2, 2);
      crate.refreshBody();
    });

    // Torches on walls
    const torchCoords = [
      { x: 13, y: 2 },
      { x: 20, y: 2 },
      { x: 13, y: 16 },
      { x: 20, y: 16 },
      { x: 11, y: 32 },
      { x: 22, y: 32 },
      { x: -3, y: 35 },
      { x: 1, y: 35 },
      { x: 32, y: 35 },
      { x: 40, y: 35 },
      { x: 30, y: 51 },
      { x: 42, y: 51 },
    ];

    torchCoords.forEach((t) => {
      const torch = this.add.sprite(t.x * 32 + 16, t.y * 32 + 16, 'torch_1');
      torch.setDepth(6);
      this.torches.push(torch);
    });
  }

  public update(time: number, delta: number) {
    if (!this.player) return;

    const pointer = this.input.activePointer;

    // Update Player
    this.player.update(time, delta, pointer);

    // Update Room System
    this.roomSystem.checkPlayerRoom(this.player.x, this.player.y, this.player);
    this.roomSystem.updateDoorDepths(this.player, this.player.depth);

    // Check in-flight arrows against enemies every frame (an arrow can
    // travel across several frames before it connects or expires)
    this.combatSystem.updatePlayerArrows(this.player, time);

    // Update Active Enemies
    let bossObj: any = null;
    this.roomSystem.activeEnemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.updateEnemy(time, delta);
        this.combatSystem.checkEnemyPlayerOverlap(this.player, enemy, time);
        if (enemy.enemyType === 'boss') {
          bossObj = enemy;
        }
      }
    });

    // Animate Torches
    this.torchesAnimTimer += delta;
    if (this.torchesAnimTimer > 160) {
      this.torchesAnimTimer = 0;
      const torchKeys = ['torch_1', 'torch_2', 'torch_3'];
      this.torches.forEach((torch) => {
        const randKey = torchKeys[Phaser.Math.Between(0, torchKeys.length - 1)];
        torch.setTexture(randKey);
      });
    }

    // Emit HUD Updates
    if (this.onHudUpdate) {
      const room = this.roomSystem.currentRoom;
      const totalInRoom = room ? room.totalEnemies ?? room.enemySpawns.length : 0;
      const defeatedInRoom = room ? room.enemiesSpawnedCount - this.roomSystem.activeEnemies.length : 0;

      this.onHudUpdate({
        hp: this.player.hp,
        maxHp: this.player.stats.maxHp,
        dashCdProgress: this.player.getDashCooldownProgress(time),
        attackCdProgress: this.player.getAttackCooldownProgress(time),
        currentRoomName: this.roomSystem.currentRoom ? this.roomSystem.currentRoom.name : 'Dungeon',
        currentStageNumber: room ? room.stageNumber : 1,
        enemiesRemainingInRoom: room && !room.cleared ? totalInRoom - defeatedInRoom : 0,
        enemiesTotalInRoom: totalInRoom,
        bossHp: bossObj ? bossObj.hp : null,
        bossMaxHp: bossObj ? bossObj.maxHp : null,
      });
    }
  }

  public onEnemyKilled(enemy: any) {
    this.totalEnemiesDefeated += 1;
    this.roomSystem.handleEnemyDeath(enemy);
  }
}
