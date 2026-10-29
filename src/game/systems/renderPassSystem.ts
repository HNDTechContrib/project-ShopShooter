import { MAP_THEMES_CONFIG } from '../../config/mapThemesConfig';
import { 
  renderArenaPerimeter, 
  renderArenaFloor, 
  renderArenaBaseZones, 
  renderThemedObstacle 
} from '../../utils/arenaRenderer';
import { renderTankModel } from '../rendering/renderTankModel';
import { WORLD_WIDTH, WORLD_HEIGHT, SimPlayer, SimBullet, SimBoss, CollectibleSkill, MapTheme } from '../../types/multiplayerTypes';

interface RenderPassParams {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  sim: {
    players: SimPlayer[];
    bullets: SimBullet[];
    boss: SimBoss | null;
    damageTexts: SimDamageText[];
    skills: CollectibleSkill[];
    ambientParticles: any[];
    shoppingParticles: any[];
    cameraX: number;
    cameraY: number;
    currentTheme: MapTheme;
  };
  isDark: boolean;
  isLocalPlayer: (id: string) => boolean;
}

interface SimDamageText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

export const renderPassSystem = ({
  ctx,
  canvas,
  sim,
  isDark,
  isLocalPlayer,
}: RenderPassParams) => {
  const themeConfig = MAP_THEMES_CONFIG[sim.currentTheme] || MAP_THEMES_CONFIG['mall'];

  const displayWidth = canvas.clientWidth > 0 ? canvas.clientWidth : 1200;
  const displayHeight = canvas.clientHeight > 0 ? canvas.clientHeight : 800;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(-sim.cameraX, -sim.cameraY);

  // 1. Perimeter & Floor & Base Zones
  renderArenaPerimeter(ctx, sim.currentTheme, sim.cameraX, sim.cameraY, canvas.width, canvas.height, WORLD_WIDTH, WORLD_HEIGHT, isDark);
  renderArenaFloor(ctx, sim.currentTheme, sim.cameraX, sim.cameraY, canvas.width, canvas.height, WORLD_WIDTH, WORLD_HEIGHT, isDark);
  renderArenaBaseZones(ctx, sim.cameraX, sim.cameraY, canvas.width, canvas.height, WORLD_WIDTH, WORLD_HEIGHT, sim.currentTheme);

  // 2. Decorations
  themeConfig.decorations.forEach((dec) => {
    ctx.save();
    if (dec.type === 'showcase') {
      ctx.shadowBlur = 18;
      ctx.shadowColor = dec.color;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(dec.x - dec.size, dec.y - dec.size * 0.6, dec.size * 2, dec.size * 1.2, 8);
      ctx.fill();
      ctx.strokeStyle = dec.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = dec.secondaryColor || '#38bdf8';
      ctx.fillRect(dec.x - dec.size * 0.6, dec.y - dec.size * 0.3, dec.size * 1.2, dec.size * 0.6);
      if (dec.label) {
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(dec.label, dec.x, dec.y + dec.size + 14);
      }
    } else if (dec.type === 'helipad') {
      ctx.shadowBlur = 25;
      ctx.shadowColor = dec.color;
      ctx.strokeStyle = dec.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(dec.x, dec.y, dec.size * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = dec.secondaryColor || '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '900 48px monospace';
      ctx.fillStyle = dec.secondaryColor || '#facc15';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', dec.x, dec.y);
    } else if (dec.type === 'crate_stack') {
      ctx.fillStyle = '#292524';
      ctx.fillRect(dec.x - dec.size, dec.y - dec.size, dec.size * 2, dec.size * 2);
      ctx.strokeStyle = dec.color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(dec.x - dec.size, dec.y - dec.size, dec.size * 2, dec.size * 2);
    } else if (dec.type === 'cyber_fountain') {
      ctx.fillStyle = '#06281e';
      ctx.beginPath();
      ctx.arc(dec.x, dec.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = dec.secondaryColor || '#34d399';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪷', dec.x, dec.y);
    }
    ctx.restore();
  });

  // 3. Particles
  sim.ambientParticles.forEach((part) => {
    ctx.save();
    ctx.globalAlpha = part.alpha;
    ctx.fillStyle = part.color;
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  sim.shoppingParticles.forEach((part) => {
    ctx.save();
    ctx.globalAlpha = part.alpha;
    ctx.translate(part.x, part.y);
    ctx.rotate(part.rotation);
    ctx.scale(part.scale, part.scale);
    ctx.fillStyle = part.color;
    ctx.fillRect(-6, -6, 12, 12);
    ctx.restore();
  });

  // 4. Skills
  sim.skills.forEach((skill) => {
    ctx.save();
    if (skill.isAvailable) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = skill.color;
      ctx.strokeStyle = skill.color;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.arc(skill.x, skill.y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(skill.icon, skill.x, skill.y + 6);
    } else {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.beginPath();
      ctx.arc(skill.x, skill.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  });

  // 5. Obstacles
  themeConfig.obstacles.forEach((obs) => {
    renderThemedObstacle(ctx, obs, sim.currentTheme, isDark);
  });

  // 6. Boss
  if (sim.boss && sim.boss.hp > 0) {
    const b = sim.boss;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(b.x - 36, b.y - 44, 72, 8);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(b.x - 36, b.y - 44, (b.hp / b.maxHp) * 72, 8);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size, 18);
    ctx.fill();
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑', b.x, b.y + 8);
  }

  // 7. Bullets
  sim.bullets.forEach((bullet) => {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = bullet.color;
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 8. Players
  sim.players.forEach((p) => {
    if (p.isRespawning) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    renderTankModel(ctx, {
      customization: p.customization,
      team: p.team,
      fallbackColor: p.color,
      isShielded: p.isShielded || p.activeSkill?.type === 'shield',
      scale: 1.0,
      showTrail: p.activeSkill?.type === 'speed',
      showTeamBadge: true,
      isMoving: false,
    });

    ctx.restore();

    ctx.save();
    // Name label
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = isLocalPlayer(p.id) ? '#38bdf8' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#000000';
    ctx.fillText(p.name, p.x, p.y - 32);

    // HP Bar background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(p.x - 22, p.y - 25, 44, 5);
    // HP Fill
    ctx.fillStyle = p.team === 'blue' ? '#38bdf8' : '#f43f5e';
    ctx.fillRect(p.x - 22, p.y - 25, Math.max(0, (p.hp / p.maxHp) * 44), 5);
    // HP Bar border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(p.x - 22, p.y - 25, 44, 5);
    ctx.restore();
  });

  // 9. Floating Damage Texts
  for (let dtIdx = sim.damageTexts.length - 1; dtIdx >= 0; dtIdx--) {
    const dText = sim.damageTexts[dtIdx];
    dText.y -= 0.8;
    dText.alpha -= 0.02;

    ctx.save();
    ctx.globalAlpha = Math.max(0, dText.alpha);
    ctx.font = '900 13px monospace';
    ctx.fillStyle = dText.color;
    ctx.textAlign = 'center';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#000000';
    ctx.fillText(dText.text, dText.x, dText.y);
    ctx.restore();

    if (dText.alpha <= 0) {
      sim.damageTexts.splice(dtIdx, 1);
    }
  }

  ctx.restore();
};
