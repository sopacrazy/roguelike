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
  x: number; // tile X
  y: number; // tile Y
  w: number; // tile Width
  h: number; // tile Height
  cleared: boolean;
  active: boolean;
  type: 'start' | 'combat' | 'treasure' | 'boss';
  doors: RoomDoor[];
  enemySpawns: Array<{ type: 'slime' | 'skeleton' | 'archer' | 'boss'; x: number; y: number }>;
  chest?: { x: number; y: number; opened: boolean; sprite?: Phaser.Physics.Arcade.Sprite };
}

export class RoomSystem {
  private scene: Phaser.Scene;
  public rooms: Map<string, RoomData> = new Map();
  public currentRoom: RoomData | null = null;
  public activeEnemies: Enemy[] = [];
  public doorGroup: Phaser.Physics.Arcade.StaticGroup;
  public chestGroup: Phaser.Physics.Arcade.StaticGroup;

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
    };

    // Room 2: Sala com Inimigos (Below Room 1)
    const room2: RoomData = {
      id: 'room_2',
      name: 'Corredor dos Guardas',
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
    };

    // Room 3: Sala Grande (Central Crossroads)
    const room3: RoomData = {
      id: 'room_3',
      name: 'Grande Salão de Pedra',
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
    };

    // Room 4: Sala do Tesouro (West of Room 3)
    const room4: RoomData = {
      id: 'room_4',
      name: 'Câmara do Tesouro',
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
    };

    // Room 6: Sala do Boss (South of Room 5)
    const room6: RoomData = {
      id: 'room_6',
      name: 'Santuário do Guardião',
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

    // Lock doors
    SoundFX.playDoorLock();
    room.doors.forEach((door) => {
      if (door.sprite) {
        door.sprite.setTexture('door_locked');
        door.sprite.enableBody(false, 0, 0, true, true);
        door.sprite.refreshBody();
      }
    });

    // Spawn puff & Enemies
    this.scene.time.delayedCall(400, () => {
      this.spawnEnemiesForRoom(room, player);
    });
  }

  private spawnEnemiesForRoom(room: RoomData, player: any) {
    this.activeEnemies = [];

    room.enemySpawns.forEach((spawn) => {
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

      if (enemy) {
        enemy.setPlayer(player);
        this.activeEnemies.push(enemy);
      }
    });

    const scene = this.scene as any;
    if (scene.onEnemiesUpdated) {
      scene.onEnemiesUpdated(this.activeEnemies.length);
    }
  }

  public handleEnemyDeath(enemy: Enemy) {
    this.activeEnemies = this.activeEnemies.filter((e) => e !== enemy && e.active && e.state !== 'dead');

    const scene = this.scene as any;
    if (scene.onEnemiesUpdated) {
      scene.onEnemiesUpdated(this.activeEnemies.length);
    }

    if (this.activeEnemies.length === 0 && this.currentRoom && !this.currentRoom.cleared) {
      this.unlockAndClearRoom(this.currentRoom);
    }
  }

  private unlockAndClearRoom(room: RoomData) {
    room.cleared = true;
    room.active = false;

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
