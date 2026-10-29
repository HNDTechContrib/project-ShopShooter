import { TeamId, CharacterClass } from '../../types';
import { MAP_THEMES_CONFIG, MapObstacle } from '../../config/mapThemesConfig';
import { WORLD_WIDTH, WORLD_HEIGHT, SimPlayer, MapTheme } from '../../types/multiplayerTypes';

export const resolveBoxCollision = (entity: { x: number; y: number }, radius: number, box: MapObstacle) => {
  const closestX = Math.max(box.x, Math.min(entity.x, box.x + box.w));
  const closestY = Math.max(box.y, Math.min(entity.y, box.y + box.h));
  const dx = entity.x - closestX;
  const dy = entity.y - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq < radius * radius) {
    const dist = Math.sqrt(distSq);
    if (dist === 0) {
      entity.x = box.x - radius - 2;
      return true;
    }
    const overlap = radius - dist;
    entity.x += (dx / dist) * (overlap + 2.0);
    entity.y += (dy / dist) * (overlap + 2.0);
    return true;
  }
  return false;
};

interface UpdatePlayerMovementParams {
  simPlayers: SimPlayer[];
  currentTheme: MapTheme;
  dt: number;
  isLocalPlayer: (id: string) => boolean;
  getCharacterStats: (charClass?: CharacterClass) => { maxHp: number; speedMultiplier: number; damageMultiplier: number };
  keysPressed: Record<string, boolean>;
  mobileMoveVector: { x: number; y: number };
  myPlayerId: string;
  wsRef: React.RefObject<WebSocket | null>;
  shootLaser: (playerId: string) => void;
}

export const updatePlayerMovementSystem = ({
  simPlayers,
  currentTheme,
  dt,
  isLocalPlayer,
  getCharacterStats,
  keysPressed,
  mobileMoveVector,
  myPlayerId,
  wsRef,
  shootLaser,
}: UpdatePlayerMovementParams) => {
  const themeConfig = MAP_THEMES_CONFIG[currentTheme] || MAP_THEMES_CONFIG['mall'];

  // 1. Move Local Player
  const myP = simPlayers.find((p) => isLocalPlayer(p.id));
  if (myP && !myP.isRespawning) {
    const myStats = getCharacterStats(myP.customization?.characterClass);
    const isSpeedSkill = myP.activeSkill?.type === 'speed';
    const speed = (isSpeedSkill ? 11.5 : 7.5) * myStats.speedMultiplier;

    const isUp = keysPressed['w'] || keysPressed['keyw'] || keysPressed['arrowup'];
    const isDown = keysPressed['s'] || keysPressed['keys'] || keysPressed['arrowdown'];
    const isLeft = keysPressed['a'] || keysPressed['keya'] || keysPressed['arrowleft'];
    const isRight = keysPressed['d'] || keysPressed['keyd'] || keysPressed['arrowright'];

    let kx = 0;
    let ky = 0;
    if (isUp) ky -= 1;
    if (isDown) ky += 1;
    if (isLeft) kx -= 1;
    if (isRight) kx += 1;

    const kLen = Math.hypot(kx, ky);
    if (kLen > 0) {
      kx /= kLen;
      ky /= kLen;
    }

    const jx = mobileMoveVector.x;
    const jy = mobileMoveVector.y;

    let moveX = kx + jx;
    let moveY = ky + jy;
    const totalLen = Math.hypot(moveX, moveY);
    if (totalLen > 1.0) {
      moveX /= totalLen;
      moveY /= totalLen;
    }

    const dx = moveX * speed;
    const dy = moveY * speed;

    myP.x = Math.max(45, Math.min(WORLD_WIDTH - 45, myP.x + dx));
    myP.y = Math.max(45, Math.min(WORLD_HEIGHT - 45, myP.y + dy));

    themeConfig.obstacles.forEach((obs) => {
      resolveBoxCollision(myP, 26, obs);
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'player-update',
        updates: {
          x: myP.x,
          y: myP.y,
          angle: myP.angle,
          hp: myP.hp,
          score: myP.score,
          kills: myP.kills,
          deaths: myP.deaths,
        }
      }));
    }
  }

  // 2. Update AI Bots
  simPlayers.forEach((bot) => {
    if (!bot.isBot || bot.isRespawning) return;

    let targetX = 1100;
    let targetY = 640;
    let minDist = 999999;

    simPlayers.forEach((other) => {
      if (other.team !== bot.team && !other.isRespawning) {
        const d = Math.hypot(other.x - bot.x, other.y - bot.y);
        if (d < minDist) {
          minDist = d;
          targetX = other.x;
          targetY = other.y;
        }
      }
    });

    let angleTo = Math.atan2(targetY - bot.y, targetX - bot.x);
    bot.angle = angleTo;

    const botStats = getCharacterStats(bot.customization?.characterClass);
    const isSpeedSkill = bot.activeSkill?.type === 'speed';
    let moveSpeed = (isSpeedSkill ? 6.5 : 4.4) * (botStats?.speedMultiplier || 1.0);

    if (minDist < 260) {
      moveSpeed = -1.5;
    }

    bot.x += Math.cos(angleTo) * moveSpeed;
    bot.y += Math.sin(angleTo) * moveSpeed;

    themeConfig.obstacles.forEach((obs) => {
      resolveBoxCollision(bot, 26, obs);
    });

    bot.x = Math.max(60, Math.min(WORLD_WIDTH - 60, bot.x));
    bot.y = Math.max(60, Math.min(WORLD_HEIGHT - 60, bot.y));

    if (minDist < 650 && Math.random() < 0.04) {
      shootLaser(bot.id);
    }
  });

  // 3. Bot-to-Bot & Player Mutual Separation
  for (let i = 0; i < simPlayers.length; i++) {
    for (let j = i + 1; j < simPlayers.length; j++) {
      const p1 = simPlayers[i];
      const p2 = simPlayers[j];
      if (p1.isRespawning || p2.isRespawning) continue;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = 46;

      if (dist < minDist) {
        const overlap = (minDist - (dist || 0.1)) / 2;
        const nx = (dx || 0.1) / (dist || 0.1);
        const ny = (dy || 0.1) / (dist || 0.1);
        p1.x -= nx * (overlap + 1.0);
        p1.y -= ny * (overlap + 1.0);
        p2.x += nx * (overlap + 1.0);
        p2.y += ny * (overlap + 1.0);
      }
    }
  }
};
