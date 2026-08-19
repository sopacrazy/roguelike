import Phaser from 'phaser';
import { Slime } from '../entities/Slime';
import { Skeleton } from '../entities/Skeleton';
import { Archer } from '../entities/Archer';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import { SoundFX } from '../audio/SoundFX';

export interface RoomDoor {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'up' | 'down' | 'left' | 'right';
  targetRoomId: string;
  sprite?: Phaser.Physics.Arcade.Sprite;
}

export interface RoomData {
  id: string;
  name: string;
  stageNumber: number; // shown in the HUD as "ESTÁGIO N"
  x: number; // tile X
  y: number; // tile Y
  w: number; // tile Width
  h: number; // tile Height
  cleared: boolean;
  active: boolean;
  type: 'start' | 'combat' | 'treasure' | 'boss';
  doors: RoomDoor[];
  // Base pattern of one wave (positions + types). For rooms fought in waves,
  // this same pattern is recycled every wave rather than defining dozens of
  // spawn points by hand.
  enemySpawns: Array<{ type: 'slime' | 'skeleton' | 'archer' | 'boss'; x: number; y: number }>;
  // Total enemies to clear across the whole room fight. Defaults to
  // enemySpawns.length (a single wave, no replenishing) when omitted.
  totalEnemies?: number;
  // Ceiling on how many enemies can be alive on screen at once. The 5s
  // timer only tops this back up when it drops below the ceiling (e.g. from
  // kills), it never stacks past it. Defaults to enemySpawns.length when omitted.
  maxConcurrentEnemies?: number;
  // Runtime counter: how many enemies have been spawned so far, across all waves.
  enemiesSpawnedCount: number;
  chest?: { x: number; y: number; opened: boolean; sprite?: Phaser.Physics.Arcade.Sprite };
}

export class RoomSystem {
  private scene: Phaser.Scene;
  public rooms: Map<string, RoomData> = new Map();
  public currentRoom: RoomData | null = null;
  public activeEnemies: Enemy[] = [];
  public doorGroup: Phaser.Physics.Arcade.StaticGroup;
  public chestGroup: Phaser.Physics.Arcade.StaticGroup;
  private playerRef: any = null;
  private waveTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.doorGroup = scene.physics.add.staticGroup();
    this.chestGroup = scene.physics.add.staticGroup();
    this.initRooms();
  }

  private initRooms() {
    // Room 1: Sala Inicial (Top Center)
    // Coords in tiles (32px per tile)
    const room1: RoomData = {
      id: 'room_1',
      name: 'Sala Inicial',
      stageNumber: 1,
      x: 10,
      y: 2,
      w: 14,
      h: 12,
      cleared: true,
      active: false,
      type: 'start',
      doors: [
        { x: 17 * 32, y: 14 * 32, width: 64, height: 32, direction: 'down', targetRoomId: 'room_2' },
      ],
      enemySpawns: [],
      enemiesSpawnedCount: 0,
    };

    // Room 2: Sala com Inimigos (Below Room 1)
    const room2: RoomData = {
      id: 'room_2',
      name: 'Corredor dos Guardas',
      stageNumber: 2,
      x: 10,
      y: 16,
      w: 14,
      h: 14,
      cleared: false,
      active: false,
      type: 'combat',
      doors: [
        { x: 17 * 32, y: 16 * 32, width: 64, height: 32, direction: 'up', targetRoomId: 'room_1' },
        { x: 17 * 32, y: 30 * 32, width: 64, height: 32, direction: 'down', targetRoomId: 'room_3' },
      ],
      enemySpawns: [
        { type: 'slime', x: 14 * 32, y: 21 * 32 },
        { type: 'slime', x: 20 * 32, y: 21 * 32 },
        { type: 'skeleton', x: 17 * 32, y: 25 * 32 },
      ],
      totalEnemies: 30,
      maxConcurrentEnemies: 3,
      enemiesSpawnedCount: 0,
    };

    // Room 3: Sala Grande (Central Crossroads)
    const room3: RoomData = {
      id: 'room_3',
      name: 'Grande Salão de Pedra',
      stageNumber: 3,
      x: 7,
      y: 32,
      w: 20,
      h: 18,
      cleared: false,
      active: false,
      type: 'combat',
      doors: [
        { x: 17 * 32, y: 32 * 32, width: 64, height: 32, direction: 'up', targetRoomId: 'room_2' },
        { x: 7 * 32, y: 41 * 32, width: 32, height: 64, direction: 'left', targetRoomId: 'room_4' },
        { x: 27 * 32, y: 41 * 32, width: 32, height: 64, direction: 'right', targetRoomId: 'room_5' },
      ],
      enemySpawns: [
        { type: 'slime', x: 11 * 32, y: 37 * 32 },
        { type: 'slime', x: 23 * 32, y: 37 * 32 },
        { type: 'skeleton', x: 13 * 32, y: 44 * 32 },
        { type: 'skeleton', x: 21 * 32, y: 44 * 32 },
        { type: 'archer', x: 17 * 32, y: 41 * 32 },
      ],
      totalEnemies: 50,
      maxConcurrentEnemies: 5,
      enemiesSpawnedCount: 0,
    };

    // Room 4: Sala do Tesouro (West of Room 3)
    const room4: RoomData = {
      id: 'room_4',
      name: 'Câmara do Tesouro',
      stageNumber: 4,
      x: -6,
      y: 35,
      w: 12,
      h: 12,
      cleared: true,
      active: false,
      type: 'treasure',
      doors: [
        { x: 6 * 32, y: 41 * 32, width: 32, height: 64, direction: 'right', targetRoomId: 'room_3' },
      ],
      enemySpawns: [],
      enemiesSpawnedCount: 0,
      chest: {
        x: 0 * 32,
        y: 40 * 32,
        opened: false,
      },
    };

    // Room 5: Sala de Combate 2 (East of Room 3)
    const room5: RoomData = {
      id: 'room_5',
      name: 'Armaria Maldita',
      stageNumber: 5,
      x: 28,
      y: 35,
      w: 16,
      h: 14,
      cleared: false,
      active: false,
      type: 'combat',
      doors: [
        { x: 28 * 32, y: 41 * 32, width: 32, height: 64, direction: 'left', targetRoomId: 'room_3' },
        { x: 36 * 32, y: 49 * 32, width: 64, height: 32, direction: 'down', targetRoomId: 'room_6' },
      ],
      enemySpawns: [
        { type: 'slime', x: 32 * 32, y: 39 * 32 },
        { type: 'slime', x: 40 * 32, y: 39 * 32 },
        { type: 'skeleton', x: 34 * 32, y: 45 * 32 },
        { type: 'archer', x: 39 * 32, y: 42 * 32 },
        { type: 'archer', x: 31 * 32, y: 45 * 32 },
      ],
      totalEnemies: 50,
      maxConcurrentEnemies: 5,
      enemiesSpawnedCount: 0,
    };

    // Room 6: Sala do Boss (South of Room 5)
    const room6: RoomData = {
      id: 'room_6',
      name: 'Santuário do Guardião',
      stageNumber: 6,
      x: 26,
      y: 51,
      w: 20,
      h: 18,
      cleared: false,
      active: false,
      type: 'boss',
      doors: [
        { x: 36 * 32, y: 51 * 32, width: 64, height: 32, direction: 'up', targetRoomId: 'room_5' },
      ],
      enemySpawns: [
        { type: 'boss', x: 36 * 32, y: 60 * 32 },
      ],
      enemiesSpawnedCount: 0,
    };

    this.rooms.set(room1.id, room1);
    this.rooms.set(room2.id, room2);
    this.rooms.set(room3.id, room3);
    this.rooms.set(room4.id, room4);
    this.rooms.set(room5.id, room5);
    this.rooms.set(room6.id, room6);
  }

  public setupDoorsAndChests() {
    this.doorGroup.clear(true, true);
    this.chestGroup.clear(true, true);

    this.rooms.forEach((room) => {
      // Build door sprites
      room.doors.forEach((door) => {
        // Doors always start open: a room only locks its own doors once the
        // player physically enters it (see lockAndActivateRoom). Locking them
        // up front based on `cleared` would seal the entrance shut before the
        // player could ever walk in and trigger the encounter.
        const sprite = this.doorGroup.create(door.x, door.y, 'door_open') as Phaser.Physics.Arcade.Sprite;
        sprite.setDepth(6);
        sprite.refreshBody();
        sprite.disableBody(true, false);
        door.sprite = sprite;
      });

      // Build chest if treasure room
      if (room.chest) {
        const chestSprite = this.chestGroup.create(room.chest.x, room.chest.y, room.chest.opened ? 'chest_opened' : 'chest_closed') as Phaser.Physics.Arcade.Sprite;
        chestSprite.setDepth(6);
        chestSprite.refreshBody();
        room.chest.sprite = chestSprite;
      }
    });
  }

  public checkPlayerRoom(playerX: number, playerY: number, player: any) {
    this.playerRef = player;
    const tileX = Math.floor(playerX / 32);
    const tileY = Math.floor(playerY / 32);

    for (const [_, room] of this.rooms) {
      if (
        tileX >= room.x &&
        tileX <= room.x + room.w &&
        tileY >= room.y &&
        tileY <= room.y + room.h
      ) {
        if (this.currentRoom !== room) {
          this.onEnterRoom(room, player);
        }
        break;
      }
    }
  }

  private onEnterRoom(room: RoomData, player: any) {
    this.currentRoom = room;
    const scene = this.scene as any;

    if (scene.onRoomChanged) {
      scene.onRoomChanged(room);
    }

    if (!room.cleared && !room.active) {
      this.lockAndActivateRoom(room, player);
    }
  }

  private lockAndActivateRoom(room: RoomData, player: any) {
    room.active = true;
    this.playerRef = player;

    // Lock doors
    SoundFX.playDoorLock();
    room.doors.forEach((door) => {
      if (door.sprite) {
        door.sprite.setTexture('door_locked');
        door.sprite.enableBody(false, 0, 0, true, true);
        door.sprite.refreshBody();
      }
    });

    // Spawn puff & first wave of enemies
    this.scene.time.delayedCall(400, () => {
      this.spawnWave(room);

      // Every 5s, top the room back up to its concurrent-enemy ceiling
      // (only replenishing what's been killed since - never stacking past
      // it) until the room's full enemy count has been spawned. The timer
      // self-destructs once that's done (spawnWave becomes a no-op after
      // that anyway, but there's no reason to keep ticking).
      const totalEnemies = room.totalEnemies ?? room.enemySpawns.length;
      if (room.enemiesSpawnedCount < totalEnemies) {
        this.waveTimer = this.scene.time.addEvent({
          delay: 5000,
          loop: true,
          callback: () => {
            this.spawnWave(room);
            if (room.enemiesSpawnedCount >= totalEnemies) {
              this.waveTimer?.remove();
              this.waveTimer = null;
            }
          },
        });
      }
    });
  }

  // Tops the room's active enemies back up to its concurrent-enemy ceiling,
  // recycling the base enemySpawns pattern as needed to reach totalEnemies.
  // Never spawns past the ceiling even if this is called again before
  // earlier spawns have died - it only fills the gap left by kills.
  private spawnWave(room: RoomData) {
    const totalEnemies = room.totalEnemies ?? room.enemySpawns.length;
    const maxConcurrent = room.maxConcurrentEnemies ?? room.enemySpawns.length;
    const remainingToSpawn = totalEnemies - room.enemiesSpawnedCount;
    const slotsAvailable = maxConcurrent - this.activeEnemies.length;
    const countThisWave = Math.max(0, Math.min(slotsAvailable, remainingToSpawn));

    for (let i = 0; i < countThisWave; i++) {
      const spawn = room.enemySpawns[room.enemiesSpawnedCount % room.enemySpawns.length];
      room.enemiesSpawnedCount++;

      // Spawn puff animation
      const smoke = this.scene.add.sprite(spawn.x, spawn.y, 'particle_smoke');
      smoke.setScale(0.5);
      smoke.setDepth(15);
      this.scene.tweens.add({
        targets: smoke,
        scale: 2.2,
        alpha: 0,
        duration: 350,
        onComplete: () => smoke.destroy(),
      });

      let enemy: Enemy | null = null;
      if (spawn.type === 'slime') {
        enemy = new Slime(this.scene, spawn.x, spawn.y);
      } else if (spawn.type === 'skeleton') {
        enemy = new Skeleton(this.scene, spawn.x, spawn.y);
      } else if (spawn.type === 'archer') {
        enemy = new Archer(this.scene, spawn.x, spawn.y);
      } else if (spawn.type === 'boss') {
        enemy = new Boss(this.scene, spawn.x, spawn.y);
      }

      if (enemy && this.playerRef) {
        enemy.setPlayer(this.playerRef);
        this.activeEnemies.push(enemy);
      }
    }

    this.emitEnemiesUpdated(room);
  }

  private emitEnemiesUpdated(room: RoomData) {
    const scene = this.scene as any;
    if (scene.onEnemiesUpdated) {
      const total = room.totalEnemies ?? room.enemySpawns.length;
      const defeatedSoFar = room.enemiesSpawnedCount - this.activeEnemies.length;
      scene.onEnemiesUpdated({
        active: this.activeEnemies.length,
        remainingInRoom: total - defeatedSoFar,
        totalInRoom: total,
      });
    }
  }

  public handleEnemyDeath(enemy: Enemy) {
    this.activeEnemies = this.activeEnemies.filter((e) => e !== enemy && e.active && e.state !== 'dead');

    const room = this.currentRoom;
    if (!room || room.cleared) return;

    this.emitEnemiesUpdated(room);

    // The room only opens once every wave has been spawned (the 5s timer in
    // lockAndActivateRoom handles that) AND nothing from any wave is left alive.
    const totalEnemies = room.totalEnemies ?? room.enemySpawns.length;
    if (this.activeEnemies.length === 0 && room.enemiesSpawnedCount >= totalEnemies) {
      this.unlockAndClearRoom(room);
    }
  }

  private unlockAndClearRoom(room: RoomData) {
    room.cleared = true;
    room.active = false;

    if (this.waveTimer) {
      this.waveTimer.remove();
      this.waveTimer = null;
    }

    SoundFX.playDoorUnlock();

    // Unlock doors
    room.doors.forEach((door) => {
      if (door.sprite) {
        door.sprite.setTexture('door_open');
        door.sprite.disableBody(true, false);
      }
    });

    const scene = this.scene as any;
    if (scene.onRoomCleared) {
      scene.onRoomCleared(room);
    }
  }

  public openChest(chestSprite: Phaser.Physics.Arcade.Sprite) {
    if (!this.currentRoom || !this.currentRoom.chest || this.currentRoom.chest.opened) {
      return;
    }

    this.currentRoom.chest.opened = true;
    chestSprite.setTexture('chest_opened');
    SoundFX.playChestOpen();

    // Sparkle burst around chest
    for (let i = 0; i < 10; i++) {
      const spark = this.scene.add.sprite(chestSprite.x + Phaser.Math.Between(-15, 15), chestSprite.y + Phaser.Math.Between(-10, 10), 'particle_gold');
      spark.setDepth(15);
      spark.setScale(1.5);
      this.scene.tweens.add({
        targets: spark,
        y: spark.y - 30,
        alpha: 0,
        duration: 500,
        onComplete: () => spark.destroy(),
      });
    }

    const scene = this.scene as any;
    if (scene.onOpenUpgradeChest) {
      scene.onOpenUpgradeChest();
    }
  }
}
