import { WORLD_WIDTH, WORLD_HEIGHT, SimPlayer, SimBullet, SimBoss, CollectibleSkill, MapTheme } from '../../types/multiplayerTypes';
import { MAP_THEMES_CONFIG } from '../../config/mapThemesConfig';

interface RenderTacticalRadarParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  sim: {
    players: SimPlayer[];
    bullets: SimBullet[];
    boss: SimBoss | null;
    skills: CollectibleSkill[];
    cameraX: number;
    cameraY: number;
    currentTheme: MapTheme;
  };
  viewW: number;
  viewH: number;
  isLocalPlayer: (id: string) => boolean;
  isDark: boolean;
}

/**
 * Tactical Radar Minimap System
 * Renders real-time arena layout, obstacles, base zones, camera viewport,
 * collectible skills, boss, and live positions & names of all players and bots.
 */
export const renderTacticalRadar = ({
  ctx,
  width,
  height,
  sim,
  viewW,
  viewH,
  isLocalPlayer,
  isDark,
}: RenderTacticalRadarParams) => {
  if (!ctx || width <= 0 || height <= 0) return;

  const scaleX = width / WORLD_WIDTH;
  const scaleY = height / WORLD_HEIGHT;

  // 1. Clear background
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // High-tech dark tactical background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#040711');
  bgGrad.addColorStop(1, '#090e1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Tactical Radar Grid lines
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.lineWidth = 1;

  // Vertical grid (4 subdivisions)
  for (let i = 1; i < 4; i++) {
    const gx = (width / 4) * i;
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }

  // Horizontal grid (3 subdivisions)
  for (let j = 1; j < 3; j++) {
    const gy = (height / 3) * j;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }

  // Center crosshair mark on radar
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 8, height / 2);
  ctx.lineTo(width / 2 + 8, height / 2);
  ctx.moveTo(width / 2, height / 2 - 8);
  ctx.lineTo(width / 2, height / 2 + 8);
  ctx.stroke();

  // 3. Team Base Zones
  // Blue Base (Left, 0..380 X)
  const blueBaseW = 380 * scaleX;
  ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
  ctx.fillRect(0, 0, blueBaseW, height);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(0, 0, blueBaseW, height);
  ctx.setLineDash([]);

  // Red Base (Right, WORLD_WIDTH - 380..WORLD_WIDTH X)
  const redBaseX = (WORLD_WIDTH - 380) * scaleX;
  const redBaseW = 380 * scaleX;
  ctx.fillStyle = 'rgba(244, 63, 94, 0.16)';
  ctx.fillRect(redBaseX, 0, redBaseW, height);
  ctx.strokeStyle = 'rgba(251, 113, 133, 0.4)';
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(redBaseX, 0, redBaseW, height);
  ctx.setLineDash([]);

  // 4. Map Obstacles
  const themeConfig = MAP_THEMES_CONFIG[sim.currentTheme] || MAP_THEMES_CONFIG['mall'];
  if (themeConfig && themeConfig.obstacles) {
    ctx.fillStyle = isDark ? '#334155' : '#64748b';
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1;

    themeConfig.obstacles.forEach((obs) => {
      const ox = obs.x * scaleX;
      const oy = obs.y * scaleY;
      const ow = Math.max(2, obs.w * scaleX);
      const oh = Math.max(2, obs.h * scaleY);
      ctx.fillRect(ox, oy, ow, oh);
      ctx.strokeRect(ox, oy, ow, oh);
    });
  }

  // 5. Collectible In-Game Skills
  if (sim.skills) {
    sim.skills.forEach((skill) => {
      if (!skill.isAvailable) return;
      const sx = skill.x * scaleX;
      const sy = skill.y * scaleY;

      ctx.fillStyle = skill.color || '#facc15';
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  // 6. Central Boss (Mega Golden Deal Box)
  if (sim.boss && sim.boss.hp > 0) {
    const bx = sim.boss.x * scaleX;
    const by = sim.boss.y * scaleY;

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 7px sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('👑', bx, by + 2.5);
  }

  // 7. Camera Viewport Rectangle (shows current visible screen on the battlefield)
  const camRx = Math.max(0, sim.cameraX * scaleX);
  const camRy = Math.max(0, sim.cameraY * scaleY);
  const camRw = Math.min(width - camRx, viewW * scaleX);
  const camRh = Math.min(height - camRy, viewH * scaleY);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  ctx.strokeRect(camRx, camRy, camRw, camRh);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(camRx, camRy, camRw, camRh);

  // 8. Live Radar Sweep Effect (Rotating scanline)
  const now = Date.now();
  const sweepAngle = (now / 2000) * Math.PI * 2;
  const sweepCenterX = width / 2;
  const sweepCenterY = height / 2;
  const sweepLen = Math.max(width, height);

  ctx.save();
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sweepCenterX, sweepCenterY);
  ctx.lineTo(
    sweepCenterX + Math.cos(sweepAngle) * sweepLen,
    sweepCenterY + Math.sin(sweepAngle) * sweepLen
  );
  ctx.stroke();
  ctx.restore();

  // 9. Players and Bots Rendering
  if (sim.players && sim.players.length > 0) {
    sim.players.forEach((p) => {
      if (p.isRespawning) return;

      const px = p.x * scaleX;
      const py = p.y * scaleY;
      const isLocal = isLocalPlayer(p.id);
      const isBlue = p.team === 'blue';

      // Directional pointer line
      ctx.strokeStyle = isLocal ? '#34d399' : isBlue ? '#38bdf8' : '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(p.angle) * 7, py + Math.sin(p.angle) * 7);
      ctx.stroke();

      if (isLocal) {
        // Local Player: Bright pulsing Emerald/Cyan ping
        const pulse = 1 + Math.sin(now / 150) * 0.3;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 6.5 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Local player label
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText('(Kamu)', px, Math.max(9, py - 7));
      } else {
        // Remote Player or AI Bot
        const dotColor = isBlue ? '#0ea5e9' : '#e11d48';
        const ringColor = isBlue ? '#38bdf8' : '#fb7185';

        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Truncated compact name label
        const cleanName = (p.name || 'Bot').replace('(BOT)', '').trim();
        const shortName = cleanName.length > 7 ? cleanName.substring(0, 6) + '…' : cleanName;

        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = isBlue ? '#bae6fd' : '#fecdd3';
        ctx.textAlign = 'center';
        ctx.fillText(shortName, px, Math.max(8, py - 6));
      }
    });
  }

  // 10. Tech border outline
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, height);

  ctx.restore();
};
