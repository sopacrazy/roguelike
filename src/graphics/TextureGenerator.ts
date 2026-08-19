import Phaser from 'phaser';

export class TextureGenerator {
  public static generateAll(scene: Phaser.Scene) {
    this.createFloorTile(scene);
    this.createFloorTileAlt(scene);
    this.createWallTiles(scene);
    this.createPillar(scene);
    this.createCrate(scene);
    this.createTorch(scene);
    this.createDoors(scene);
    this.createChest(scene);
    this.createPlayerTextures(scene);
    this.createSlimeTextures(scene);
    this.createSkeletonTextures(scene);
    this.createArcherTextures(scene);
    this.createBossTextures(scene);
    this.createProjectiles(scene);
    this.createParticles(scene);
  }

  private static createFloorTile(scene: Phaser.Scene) {
    if (scene.textures.exists('floor_tile')) return;
    const canvas = scene.textures.createCanvas('floor_tile', 32, 32);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Base stone color
    ctx.fillStyle = '#2a2838';
    ctx.fillRect(0, 0, 32, 32);

    // Stone flagstone seams
    ctx.strokeStyle = '#1b1924';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, 30, 30);

    // Inner bevel & texture noise
    ctx.fillStyle = '#343144';
    ctx.fillRect(2, 2, 28, 2);
    ctx.fillRect(2, 2, 2, 28);

    ctx.fillStyle = '#22202e';
    ctx.fillRect(2, 28, 28, 2);
    ctx.fillRect(28, 2, 2, 28);

    // Stone texture spots
    ctx.fillStyle = '#3b384d';
    ctx.fillRect(6, 8, 3, 2);
    ctx.fillRect(18, 14, 4, 3);
    ctx.fillRect(10, 22, 5, 2);
    ctx.fillRect(22, 6, 3, 3);

    // Crack line
    ctx.strokeStyle = '#1d1b26';
    ctx.beginPath();
    ctx.moveTo(12, 12);
    ctx.lineTo(15, 16);
    ctx.lineTo(13, 19);
    ctx.stroke();

    canvas.refresh();
  }

  private static createFloorTileAlt(scene: Phaser.Scene) {
    if (scene.textures.exists('floor_tile_alt')) return;
    const canvas = scene.textures.createCanvas('floor_tile_alt', 32, 32);
    if (!canvas) return;
    const ctx = canvas.getContext();

    ctx.fillStyle = '#282635';
    ctx.fillRect(0, 0, 32, 32);

    // Flagstone grid (4 smaller pavers)
    ctx.strokeStyle = '#1a1823';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, 14, 14);
    ctx.strokeRect(17, 1, 14, 14);
    ctx.strokeRect(1, 17, 14, 14);
    ctx.strokeRect(17, 17, 14, 14);

    // Highlights
    ctx.fillStyle = '#323042';
    ctx.fillRect(2, 2, 12, 2);
    ctx.fillRect(18, 2, 12, 2);
    ctx.fillRect(2, 18, 12, 2);
    ctx.fillRect(18, 18, 12, 2);

    canvas.refresh();
  }

  private static createWallTiles(scene: Phaser.Scene) {
    if (scene.textures.exists('wall_top')) return;

    // Wall top (32x32)
    const canvasTop = scene.textures.createCanvas('wall_top', 32, 32);
    if (canvasTop) {
      const ctx = canvasTop.getContext();
      ctx.fillStyle = '#14131c';
      ctx.fillRect(0, 0, 32, 32);

      // Stone brick pattern
      ctx.fillStyle = '#1e1c29';
      ctx.fillRect(1, 1, 30, 14);
      ctx.fillRect(1, 17, 14, 14);
      ctx.fillRect(17, 17, 14, 14);

      // Brick top highlights
      ctx.fillStyle = '#2c293c';
      ctx.fillRect(2, 2, 28, 2);
      ctx.fillRect(2, 18, 12, 2);
      ctx.fillRect(18, 18, 12, 2);

      // Deep shadows
      ctx.fillStyle = '#0c0b12';
      ctx.fillRect(0, 30, 32, 2);

      canvasTop.refresh();
    }

    // Wall face with 3D brick facade
    const canvasFace = scene.textures.createCanvas('wall_face', 32, 32);
    if (canvasFace) {
      const ctx = canvasFace.getContext();
      ctx.fillStyle = '#181622';
      ctx.fillRect(0, 0, 32, 32);

      // Bricks
      ctx.fillStyle = '#222030';
      ctx.fillRect(1, 1, 14, 13);
      ctx.fillRect(17, 1, 14, 13);
      ctx.fillRect(1, 16, 30, 14);

      // Brick details
      ctx.fillStyle = '#2f2c42';
      ctx.fillRect(2, 2, 12, 2);
      ctx.fillRect(18, 2, 12, 2);
      ctx.fillRect(2, 17, 28, 2);

      // Shadow at bottom
      ctx.fillStyle = '#0a090f';
      ctx.fillRect(0, 29, 32, 3);

      canvasFace.refresh();
    }
  }

  private static createPillar(scene: Phaser.Scene) {
    if (scene.textures.exists('pillar')) return;
    const canvas = scene.textures.createCanvas('pillar', 32, 48);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Base & Capital
    ctx.fillStyle = '#16141f';
    ctx.fillRect(2, 40, 28, 8);
    ctx.fillRect(4, 2, 24, 6);

    ctx.fillStyle = '#343144';
    ctx.fillRect(3, 41, 26, 2);
    ctx.fillRect(5, 3, 22, 2);

    // Shaft
    ctx.fillStyle = '#242232';
    ctx.fillRect(6, 8, 20, 32);

    // Fluting / vertical grooves
    ctx.fillStyle = '#191824';
    ctx.fillRect(9, 8, 2, 32);
    ctx.fillRect(15, 8, 2, 32);
    ctx.fillRect(21, 8, 2, 32);

    // Highlight
    ctx.fillStyle = '#3e3b52';
    ctx.fillRect(7, 8, 2, 32);
    ctx.fillRect(13, 8, 2, 32);
    ctx.fillRect(19, 8, 2, 32);

    canvas.refresh();
  }

  private static createCrate(scene: Phaser.Scene) {
    if (scene.textures.exists('crate')) return;
    const canvas = scene.textures.createCanvas('crate', 28, 28);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Wood body
    ctx.fillStyle = '#6b4724';
    ctx.fillRect(1, 1, 26, 26);

    // Wood planks
    ctx.fillStyle = '#84572c';
    ctx.fillRect(3, 3, 22, 22);

    // Cross beam
    ctx.fillStyle = '#53361a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(3, 3);
    ctx.lineTo(25, 25);
    ctx.moveTo(25, 3);
    ctx.lineTo(3, 25);
    ctx.stroke();

    // Iron corner brackets
    ctx.fillStyle = '#333842';
    ctx.fillRect(1, 1, 6, 6);
    ctx.fillRect(21, 1, 6, 6);
    ctx.fillRect(1, 21, 6, 6);
    ctx.fillRect(21, 21, 6, 6);

    // Rivets
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(3, 3, 2, 2);
    ctx.fillRect(23, 3, 2, 2);
    ctx.fillRect(3, 23, 2, 2);
    ctx.fillRect(23, 23, 2, 2);

    canvas.refresh();
  }

  private static createTorch(scene: Phaser.Scene) {
    if (scene.textures.exists('torch_1')) return;

    const frames = [
      { name: 'torch_1', flameH: 7, flameColor: '#f97316', coreColor: '#fef08a' },
      { name: 'torch_2', flameH: 9, flameColor: '#ea580c', coreColor: '#fffbeb' },
      { name: 'torch_3', flameH: 6, flameColor: '#fb923c', coreColor: '#fef9c3' },
    ];

    frames.forEach((f) => {
      const canvas = scene.textures.createCanvas(f.name, 16, 24);
      if (!canvas) return;
      const ctx = canvas.getContext();

      // Sconce / bracket
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(6, 12, 4, 10);
      ctx.fillRect(4, 14, 8, 3);

      // Metal ring
      ctx.fillStyle = '#44403c';
      ctx.fillRect(5, 11, 6, 3);

      // Flame glow
      ctx.fillStyle = f.flameColor;
      ctx.beginPath();
      ctx.ellipse(8, 9, 5, f.flameH / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flame core
      ctx.fillStyle = f.coreColor;
      ctx.beginPath();
      ctx.ellipse(8, 10, 2.5, f.flameH / 3, 0, 0, Math.PI * 2);
      ctx.fill();

      canvas.refresh();
    });
  }

  private static createDoors(scene: Phaser.Scene) {
    if (scene.textures.exists('door_locked')) return;

    // Door Locked
    const canvasLocked = scene.textures.createCanvas('door_locked', 64, 48);
    if (canvasLocked) {
      const ctx = canvasLocked.getContext();

      // Archway stone frame
      ctx.fillStyle = '#1c1924';
      ctx.fillRect(0, 0, 64, 48);

      // Iron Portcullis / heavy iron reinforced wood
      ctx.fillStyle = '#451a1a';
      ctx.fillRect(6, 6, 52, 42);

      // Iron bars / studs
      ctx.fillStyle = '#262626';
      ctx.fillRect(10, 6, 4, 42);
      ctx.fillRect(20, 6, 4, 42);
      ctx.fillRect(30, 6, 4, 42);
      ctx.fillRect(40, 6, 4, 42);
      ctx.fillRect(50, 6, 4, 42);

      ctx.fillRect(6, 14, 52, 4);
      ctx.fillRect(6, 28, 52, 4);

      // Glowing Red Lock / Rune in center
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(32, 24, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(30, 22, 4, 4);

      // Chain icon
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 18, 12, 12);

      canvasLocked.refresh();
    }

    // Door Open
    const canvasOpen = scene.textures.createCanvas('door_open', 64, 48);
    if (canvasOpen) {
      const ctx = canvasOpen.getContext();

      // Archway stone frame
      ctx.fillStyle = '#1c1924';
      ctx.fillRect(0, 0, 64, 48);

      // Dark open corridor / pathway
      ctx.fillStyle = '#09080d';
      ctx.fillRect(6, 6, 52, 42);

      // Soft inviting torchlight gradient on threshold floor
      ctx.fillStyle = '#2e2b3c';
      ctx.fillRect(8, 36, 48, 12);

      ctx.fillStyle = '#433d59';
      ctx.fillRect(12, 40, 40, 4);

      canvasOpen.refresh();
    }
  }

  private static createChest(scene: Phaser.Scene) {
    if (scene.textures.exists('chest_closed')) return;

    // Closed Chest
    const canvasClosed = scene.textures.createCanvas('chest_closed', 32, 32);
    if (canvasClosed) {
      const ctx = canvasClosed.getContext();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gold/Oak Chest Body
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(4, 12, 24, 16);

      // Gold Trim
      ctx.fillStyle = '#eab308';
      ctx.fillRect(3, 10, 26, 4);
      ctx.fillRect(4, 26, 24, 2);
      ctx.fillRect(4, 12, 3, 14);
      ctx.fillRect(25, 12, 3, 14);
      ctx.fillRect(14, 12, 4, 14);

      // Lock
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(14, 15, 4, 5);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(15, 17, 2, 2);

      canvasClosed.refresh();
    }

    // Opened Chest (Glowing)
    const canvasOpened = scene.textures.createCanvas('chest_opened', 32, 32);
    if (canvasOpened) {
      const ctx = canvasOpened.getContext();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Open lid tilted back
      ctx.fillStyle = '#713f12';
      ctx.fillRect(4, 2, 24, 8);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(3, 2, 26, 2);

      // Chest bottom
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(4, 14, 24, 14);

      // Gold trim
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(4, 26, 24, 2);
      ctx.fillRect(4, 14, 3, 12);
      ctx.fillRect(25, 14, 3, 12);

      // Glowing Interior Gold Treasure
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(7, 10, 18, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(10, 11, 12, 4);

      canvasOpened.refresh();
    }
  }

  private static createPlayerTextures(scene: Phaser.Scene) {
    // Player Ranger Sprites (32x32)
    const frames = [
      { name: 'player_idle', legOffset: 0 },
      { name: 'player_walk_1', legOffset: -2 },
      { name: 'player_walk_2', legOffset: 2 },
    ];

    frames.forEach((f) => {
      if (scene.textures.exists(f.name)) return;
      const canvas = scene.textures.createCanvas(f.name, 32, 32);
      if (!canvas) return;
      const ctx = canvas.getContext();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(16, 29, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Leather Boots
      ctx.fillStyle = '#451a03';
      ctx.fillRect(11 + f.legOffset, 22, 4, 7);
      ctx.fillRect(17 - f.legOffset, 22, 4, 7);

      // Quiver of arrows on the back
      ctx.fillStyle = '#92400e';
      ctx.fillRect(7, 10, 4, 12);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(6, 6, 2, 4);
      ctx.fillRect(8, 5, 2, 5);

      // Green Ranger Tunic
      ctx.fillStyle = '#166534';
      ctx.fillRect(10, 13, 12, 10);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(12, 14, 8, 8);

      // Belt with Buckle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(10, 21, 12, 2);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(14, 20, 4, 3);

      // Emerald Hood
      ctx.fillStyle = '#14532d';
      ctx.fillRect(9, 3, 14, 11);
      ctx.fillStyle = '#166534';
      ctx.fillRect(10, 4, 12, 9);

      // Cyan-glow eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(13, 8, 2, 2);
      ctx.fillRect(17, 8, 2, 2);

      // Arm on right (the bow itself is a separate overlay sprite - see
      // Player.ts bowSprite - that rotates independently to track the mouse cursor)
      ctx.fillStyle = '#166534';
      ctx.fillRect(21, 15, 3, 5);

      canvas.refresh();
    });
  }

  private static createSlimeTextures(scene: Phaser.Scene) {
    const frames = [
      { name: 'slime_1', scaleY: 1, scaleX: 1, eyeOffset: 0 },
      { name: 'slime_2', scaleY: 0.8, scaleX: 1.15, eyeOffset: 1 },
    ];

    frames.forEach((f) => {
      if (scene.textures.exists(f.name)) return;
      const canvas = scene.textures.createCanvas(f.name, 28, 28);
      if (!canvas) return;
      const ctx = canvas.getContext();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(14, 25, 11 * f.scaleX, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slime Body (Toxic Emerald Green)
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(14, 18 + f.eyeOffset, 11 * f.scaleX, 9 * f.scaleY, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(14, 17 + f.eyeOffset, 9 * f.scaleX, 7 * f.scaleY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight gloss
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.ellipse(10, 13 + f.eyeOffset, 3, 2, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#052e16';
      ctx.fillRect(9, 15 + f.eyeOffset, 3, 4);
      ctx.fillRect(16, 15 + f.eyeOffset, 3, 4);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9, 15 + f.eyeOffset, 1, 2);
      ctx.fillRect(16, 15 + f.eyeOffset, 1, 2);

      canvas.refresh();
    });
  }

  private static createSkeletonTextures(scene: Phaser.Scene) {
    const frames = [
      { name: 'skeleton_idle', legOffset: 0 },
      { name: 'skeleton_walk_1', legOffset: -2 },
      { name: 'skeleton_walk_2', legOffset: 2 },
    ];

    frames.forEach((f) => {
      if (scene.textures.exists(f.name)) return;
      const canvas = scene.textures.createCanvas(f.name, 32, 32);
      if (!canvas) return;
      const ctx = canvas.getContext();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 29, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bone Legs
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(12 + f.legOffset, 22, 2, 7);
      ctx.fillRect(18 - f.legOffset, 22, 2, 7);

      // Ribcage
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(12, 13, 8, 8);
      ctx.fillStyle = '#334155';
      ctx.fillRect(14, 15, 4, 1);
      ctx.fillRect(14, 18, 4, 1);

      // Skull
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(11, 4, 10, 9);
      // Eye sockets (Red glowing embers)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(13, 7, 2, 3);
      ctx.fillRect(17, 7, 2, 3);
      // Teeth
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(13, 11, 6, 2);

      // Rusted Blade in hand
      ctx.fillStyle = '#713f12';
      ctx.fillRect(22, 14, 2, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(22, 5, 2, 9);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(22, 8, 1, 3);

      canvas.refresh();
    });
  }

  private static createArcherTextures(scene: Phaser.Scene) {
    const frames = [
      { name: 'archer_idle', legOffset: 0 },
      { name: 'archer_walk_1', legOffset: -2 },
      { name: 'archer_walk_2', legOffset: 2 },
    ];

    frames.forEach((f) => {
      if (scene.textures.exists(f.name)) return;
      const canvas = scene.textures.createCanvas(f.name, 32, 32);
      if (!canvas) return;
      const ctx = canvas.getContext();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 29, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(12 + f.legOffset, 22, 3, 7);
      ctx.fillRect(17 - f.legOffset, 22, 3, 7);

      // Hooded Cloak / Robe
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(10, 12, 12, 10);
      ctx.fillStyle = '#172554';
      ctx.fillRect(8, 13, 3, 9);

      // Hood & Face Shadow
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(10, 4, 12, 9);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(12, 7, 8, 5);
      // Glowing Cyan Archer Eyes
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(13, 8, 2, 2);
      ctx.fillRect(17, 8, 2, 2);

      // Wooden Bow
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 16, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Bowstring
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, 8);
      ctx.lineTo(24, 24);
      ctx.stroke();

      canvas.refresh();
    });
  }

  private static createBossTextures(scene: Phaser.Scene) {
    // Large Boss (64x64) - Guardião da Dungeon
    const frames = [
      { name: 'boss_idle', armOffset: 0, breath: 0 },
      { name: 'boss_walk_1', armOffset: -3, breath: -1 },
      { name: 'boss_walk_2', armOffset: 3, breath: 1 },
    ];

    frames.forEach((f) => {
      if (scene.textures.exists(f.name)) return;
      const canvas = scene.textures.createCanvas(f.name, 64, 64);
      if (!canvas) return;
      const ctx = canvas.getContext();

      // Large Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(32, 58, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Massive Armored Legs
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(20, 44, 8, 14);
      ctx.fillRect(36, 44, 8, 14);
      ctx.fillStyle = '#4338ca';
      ctx.fillRect(20, 52, 8, 4);
      ctx.fillRect(36, 52, 8, 4);

      // Huge Obsidian Breastplate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(16, 22 + f.breath, 32, 22);
      ctx.fillStyle = '#312e81';
      ctx.fillRect(18, 24 + f.breath, 28, 18);

      // Glowing Core Rune on chest
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(28, 28 + f.breath, 8, 8);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(30, 30 + f.breath, 4, 4);

      // Spiked Pauldrons (Shoulders)
      ctx.fillStyle = '#4338ca';
      ctx.fillRect(10, 20 + f.breath, 10, 12);
      ctx.fillRect(44, 20 + f.breath, 10, 12);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(8, 16 + f.breath, 4, 6);
      ctx.fillRect(52, 16 + f.breath, 4, 6);

      // Horned Helm & Dark Visor
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(22, 8 + f.breath, 20, 16);
      // Horns
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(18, 6 + f.breath, 4, 8);
      ctx.fillRect(42, 6 + f.breath, 4, 8);
      ctx.fillRect(16, 2 + f.breath, 4, 6);
      ctx.fillRect(44, 2 + f.breath, 4, 6);

      // Fierce Red Glowing Eyes
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(25, 14 + f.breath, 5, 3);
      ctx.fillRect(34, 14 + f.breath, 5, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(26, 14 + f.breath, 2, 2);
      ctx.fillRect(35, 14 + f.breath, 2, 2);

      // Giant Battle Cleaver / Axe
      ctx.save();
      ctx.translate(50, 32 + f.armOffset);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -22, 4, 40); // handle
      // Massive Iron Axe Blade
      ctx.fillStyle = '#64748b';
      ctx.fillRect(2, -26, 14, 22);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(14, -26, 3, 22); // sharpened edge
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(4, -18, 8, 4); // glowing rune
      ctx.restore();

      canvas.refresh();
    });
  }

  private static createProjectiles(scene: Phaser.Scene) {
    // Arrow
    if (!scene.textures.exists('arrow')) {
      const canvas = scene.textures.createCanvas('arrow', 18, 6);
      if (canvas) {
        const ctx = canvas.getContext();
        // Wooden shaft
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, 2, 10, 2);
        // Steel arrowhead
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(14, 1, 4, 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(12, 1, 2, 4);
        // White fletching
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 4, 6);

        canvas.refresh();
      }
    }

    // Boss Magic Orb (Radial Attack)
    if (!scene.textures.exists('boss_orb')) {
      const canvas = scene.textures.createCanvas('boss_orb', 16, 16);
      if (canvas) {
        const ctx = canvas.getContext();
        // Outer dark fire aura
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(8, 8, 7, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(8, 8, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }
  }

  private static createParticles(scene: Phaser.Scene) {
    // Spark Particle
    if (!scene.textures.exists('particle_spark')) {
      const canvas = scene.textures.createCanvas('particle_spark', 6, 6);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(1, 1, 4, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(2, 2, 2, 2);
        canvas.refresh();
      }
    }

    // Blood / Hit Particle
    if (!scene.textures.exists('particle_blood')) {
      const canvas = scene.textures.createCanvas('particle_blood', 6, 6);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(1, 1, 4, 4);
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(2, 2, 2, 2);
        canvas.refresh();
      }
    }

    // Smoke / Dust Particle
    if (!scene.textures.exists('particle_smoke')) {
      const canvas = scene.textures.createCanvas('particle_smoke', 8, 8);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.beginPath();
        ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        canvas.refresh();
      }
    }

    // Gold Sparkle Particle
    if (!scene.textures.exists('particle_gold')) {
      const canvas = scene.textures.createCanvas('particle_gold', 8, 8);
      if (canvas) {
        const ctx = canvas.getContext();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(4, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(3, 3, 2, 2);
        canvas.refresh();
      }
    }
  }

}
