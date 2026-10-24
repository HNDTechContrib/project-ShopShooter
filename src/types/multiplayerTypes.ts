import { MapTheme, TeamId, CharacterCustomization, InGameSkillType, CollectibleSkill } from './index';
export type { MapTheme, CollectibleSkill };


export const WORLD_WIDTH = 2200;
export const WORLD_HEIGHT = 1300;

export interface SimPlayer {
  id: string;
  name: string;
  team: TeamId;
  x: number;
  y: number;
  angle: number;
  hp: number;
  maxHp: number;
  score: number;
  kills: number;
  deaths: number;
  isBot: boolean;
  isShielded: boolean;
  shieldTimer?: number;
  isRespawning: boolean;
  respawnTimer: number;
  color: string;
  customization?: CharacterCustomization;
  activeSkill?: {
    type: InGameSkillType;
    timeLeft: number;
  };
}

export interface SimBullet {
  id: string;
  shooterId: string;
  team: TeamId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  life: number;
}

export interface SimDamageText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

export interface SimBoss {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  size: number;
}

export interface MapObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  borderColor: string;
  type?: string;
  subLabel?: string;
  accentColor?: string;
}

export interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export interface MapDecorationItem {
  id: string;
  type:
    | 'showcase'
    | 'promo_billboard'
    | 'escalator'
    | 'kiosk'
    | 'helipad'
    | 'neon_sign'
    | 'antenna_tower'
    | 'chiller_fan'
    | 'skyline_light'
    | 'crate_stack'
    | 'conveyor'
    | 'forklift_dock'
    | 'barcode_scanner'
    | 'cyber_fountain'
    | 'biophilic_tree'
    | 'planter_box'
    | 'glass_skywalk'
    | 'crystal'
    | 'magma_fissure'
    | 'lava_pool'
    | 'lab_tube'
    | 'circuit_node'
    | 'holo_console'
    | 'mushroom'
    | 'neon_tree'
    | 'foliage_bush'
    | 'lichen_pool';
  x: number;
  y: number;
  size: number;
  color: string;
  secondaryColor?: string;
  rotation?: number;
  label?: string;
  pulsePhase?: number;
}
