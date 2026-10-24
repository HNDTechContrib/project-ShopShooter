import { MapTheme } from '../../types';
import { renderMallFloor, renderWarehouseFloor } from './renderUrbanFloors';
import { renderRooftopFloor } from './renderRooftopFloor';
import { renderGardenFloor, renderCavernFloor, renderLabFloor, renderForestFloor } from './renderNatureLabFloors';

export function renderArenaFloor(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  camX: number,
  camY: number,
  viewW: number,
  viewH: number,
  worldW: number,
  worldH: number,
  isDark: boolean
) {
  const minX = Math.max(0, camX - 100);
  const maxX = Math.min(worldW, camX + viewW + 100);
  const minY = Math.max(0, camY - 100);
  const maxY = Math.min(worldH, camY + viewH + 100);

  ctx.save();

  switch (theme) {
    case 'mall':
      renderMallFloor(ctx, minX, maxX, minY, maxY, worldW, worldH, isDark);
      break;
    case 'rooftop':
      renderRooftopFloor(ctx, minX, maxX, minY, maxY, worldW, worldH, isDark);
      break;
    case 'warehouse':
      renderWarehouseFloor(ctx, minX, maxX, minY, maxY, worldW, worldH, isDark);
      break;
    case 'garden':
      renderGardenFloor(ctx, minX, maxX, minY, maxY, worldW, worldH, isDark);
      break;
    case 'cavern':
      renderCavernFloor(ctx, minX, maxX, minY, maxY, worldW, worldH);
      break;
    case 'lab':
      renderLabFloor(ctx, minX, maxX, minY, maxY, worldW, worldH, isDark);
      break;
    case 'forest':
      renderForestFloor(ctx, minX, maxX, minY, maxY, worldW, worldH, isDark);
      break;
  }

  ctx.restore();
}
