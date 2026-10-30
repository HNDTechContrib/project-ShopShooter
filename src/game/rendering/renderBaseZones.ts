import { MapTheme } from '../../types';

/**
 * Tactical team base command zones with team laser boundaries, floor projection badges, and spawn pods.
 */
export function renderArenaBaseZones(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  viewW: number,
  viewH: number,
  worldW: number,
  worldH: number,
  theme: MapTheme
) {
  const baseW = 320;

  // Blue Base (Left side: 0 to 320)
  ctx.save();
  ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.fillRect(0, 0, baseW, worldH);

  // Border pylon tripwire
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 8]);
  ctx.beginPath();
  ctx.moveTo(baseW, 0);
  ctx.lineTo(baseW, worldH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Base Insignia
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
  ctx.textAlign = 'center';
  ctx.fillText('TIM BIRU · BASE', baseW / 2, worldH / 2);

  // Blue Spawn Pods (3 distinct pads)
  [380, 650, 920].forEach((sy) => {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(160, sy, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(6, 182, 212, 0.06)';
    ctx.fill();
  });
  ctx.restore();

  // Red Base (Right side: worldW - 320 to worldW)
  ctx.save();
  ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
  ctx.fillRect(worldW - baseW, 0, baseW, worldH);

  // Border pylon tripwire
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 8]);
  ctx.beginPath();
  ctx.moveTo(worldW - baseW, 0);
  ctx.lineTo(worldW - baseW, worldH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Base Insignia
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.textAlign = 'center';
  ctx.fillText('TIM MERAH · BASE', worldW - baseW / 2, worldH / 2);

  // Red Spawn Pods
  [380, 650, 920].forEach((sy) => {
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(worldW - 160, sy, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.06)';
    ctx.fill();
  });
  ctx.restore();
}
