import { MapTheme } from '../../types';
import { renderTechObstacle } from './renderTechObstacles';
import { renderNatureObstacle } from './renderNatureObstacles';

export interface MapObstacleDef {
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

export function drawBeveledBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number = 2
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
  ctx.restore();
}

export function renderThemedObstacle(
  ctx: CanvasRenderingContext2D,
  obs: MapObstacleDef,
  theme: MapTheme,
  isDark: boolean
) {
  const { x, y, w, h } = obs;

  ctx.save();

  // 1. Realistic Directional Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.restore();

  // 2. Delegate to Tech or Nature obstacle renderer
  if (!renderTechObstacle(ctx, obs, theme, isDark)) {
    renderNatureObstacle(ctx, obs, theme, isDark);
  }

  ctx.restore();
}
