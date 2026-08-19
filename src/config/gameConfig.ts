export interface Upgrade {
  id: string;
  title: string;
  description: string;
  iconCoord: [col: number, row: number]; // cell in public/icons/rpg-icons.png
  color: string;
  effect: (player: any) => void;
}

export const GAME_CONFIG = {
  width: 1024,
  height: 640,
  tileSize: 32,
  player: {
    maxHp: 100,
    speed: 190,
    baseDamage: 25,
    attackCooldown: 380, // ms
    arrowSpeed: 520,
    arrowLifetime: 1200, // ms
    dashSpeed: 460,
    dashDuration: 180, // ms
    dashCooldown: 1800, // ms
  },
  enemies: {
    slime: {
      hp: 45,
      speed: 75,
      damage: 12,
      knockbackResistance: 0.2,
      exp: 10,
    },
    skeleton: {
      hp: 85,
      speed: 125,
      damage: 18,
      attackCooldown: 1200,
      attackRange: 40,
      knockbackResistance: 0.5,
      exp: 25,
    },
    archer: {
      hp: 55,
      speed: 110,
      damage: 15,
      shootCooldown: 2200,
      preferredDist: 220,
      arrowSpeed: 280,
      knockbackResistance: 0.3,
      exp: 20,
    },
    boss: {
      name: 'GUARDIÃO DA DUNGEON',
      hp: 400,
      speed: 90,
      chargeSpeed: 320,
      damage: 28,
      knockbackResistance: 0.95,
      exp: 200,
    },
  },
};

export const AVAILABLE_UPGRADES: Upgrade[] = [
  {
    id: 'dmg_boost',
    title: 'Fúria da Lâmina',
    description: 'Aumenta o dano dos ataques em +25%',
    iconCoord: [3, 5],
    color: 'from-amber-500 to-red-600',
    effect: (player) => {
      player.stats.damageMultiplier += 0.25;
    },
  },
  {
    id: 'hp_boost',
    title: 'Vitalidade Dracônica',
    description: 'Aumenta a Vida Máxima em +30 e restaura 50 HP',
    iconCoord: [6, 0],
    color: 'from-emerald-500 to-green-600',
    effect: (player) => {
      player.stats.maxHp += 30;
      player.hp = Math.min(player.stats.maxHp, player.hp + 50);
    },
  },
  {
    id: 'attack_speed',
    title: 'Agilidade do Vento',
    description: 'Velocidade de ataque aumentada em +25%',
    iconCoord: [8, 0],
    color: 'from-cyan-500 to-blue-600',
    effect: (player) => {
      player.stats.attackCooldown = Math.max(180, Math.floor(player.stats.attackCooldown * 0.75));
    },
  },
  {
    id: 'dash_mastery',
    title: 'Passo Espiritual',
    description: 'Reduz o tempo de recarga do Dash em 35%',
    iconCoord: [6, 2],
    color: 'from-purple-500 to-indigo-600',
    effect: (player) => {
      player.stats.dashCooldown = Math.max(800, Math.floor(player.stats.dashCooldown * 0.65));
    },
  },
  {
    id: 'move_speed',
    title: 'Botas de Mercúrio',
    description: 'Aumenta a velocidade de movimento em +20%',
    iconCoord: [2, 8],
    color: 'from-yellow-400 to-orange-500',
    effect: (player) => {
      player.stats.speed = Math.floor(player.stats.speed * 1.2);
    },
  },
  {
    id: 'lifesteal_minor',
    title: 'Gume Vampírico',
    description: 'Ataques recuperam 4 HP ao atingir inimigos',
    iconCoord: [0, 9],
    color: 'from-rose-500 to-pink-700',
    effect: (player) => {
      player.stats.lifesteal = (player.stats.lifesteal || 0) + 4;
    },
  },
];
