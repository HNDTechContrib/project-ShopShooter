import { MapTheme } from '../../types';

/**
 * Renders the perimeter environment beyond 0..worldW and 0..worldH to provide scale and depth.
 */
export function renderArenaPerimeter(
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
  const pad = 350;
  ctx.save();

  switch (theme) {
    case 'rooftop': {
      // Deep cyberpunk city nightscape below rooftop
      ctx.fillStyle = '#050711';
      ctx.fillRect(-pad, -pad, worldW + pad * 2, pad); // top
      ctx.fillRect(-pad, worldH, worldW + pad * 2, pad); // bottom
      ctx.fillRect(-pad, 0, pad, worldH); // left
      ctx.fillRect(worldW, 0, pad, worldH); // right

      // Distant building silhouettes with glowing cyber windows
      const now = Date.now();
      for (let bx = -pad; bx < worldW + pad; bx += 90) {
        const bH = 140 + Math.sin(bx * 0.05) * 60;
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(bx, -bH, 80, bH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, -bH, 80, bH);

        const blink = Math.sin(now / 300 + bx) > 0.4;
        if (blink) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(bx + 40, -bH - 6, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        const bH2 = 130 + Math.cos(bx * 0.06) * 50;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(bx, worldH, 80, bH2);
      }

      // Parapet safety wall around the roof edge
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, worldW, worldH);

      // Hazard striping along perimeter inside
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 12]);
      ctx.strokeRect(10, 10, worldW - 20, worldH - 20);
      ctx.setLineDash([]);
      break;
    }

    case 'mall': {
      // Multi-story atrium void with polished chrome railings
      ctx.fillStyle = isDark ? '#090d16' : '#e2e8f0';
      ctx.fillRect(-pad, -pad, worldW + pad * 2, pad);
      ctx.fillRect(-pad, worldH, worldW + pad * 2, pad);
      ctx.fillRect(-pad, 0, pad, worldH);
      ctx.fillRect(worldW, 0, pad, worldH);

      // Glass balustrade boundary with chrome posts
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, worldW, worldH);

      // Frosted glass rail shadow
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.25)';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, worldW - 16, worldH - 16);
      break;
    }

    case 'warehouse': {
      // Corrugated steel exterior walls and loading dock staging
      ctx.fillStyle = isDark ? '#0c0a09' : '#d6d3d1';
      ctx.fillRect(-pad, -pad, worldW + pad * 2, pad);
      ctx.fillRect(-pad, worldH, worldW + pad * 2, pad);
      ctx.fillRect(-pad, 0, pad, worldH);
      ctx.fillRect(worldW, 0, pad, worldH);

      // Heavy industrial boundary wall
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 7;
      ctx.strokeRect(0, 0, worldW, worldH);

      // Diagonal safety hazard pattern along border
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 16]);
      ctx.strokeRect(8, 8, worldW - 16, worldH - 16);
      ctx.setLineDash([]);
      break;
    }

    case 'garden':
    case 'forest': {
      // Lush botanical forest & conservatory perimeter
      ctx.fillStyle = isDark ? '#03140c' : '#dcfce7';
      ctx.fillRect(-pad, -pad, worldW + pad * 2, pad);
      ctx.fillRect(-pad, worldH, worldW + pad * 2, pad);
      ctx.fillRect(-pad, 0, pad, worldH);
      ctx.fillRect(worldW, 0, pad, worldH);

      // Perimeter tree silhouettes
      for (let tx = -pad; tx < worldW + pad; tx += 65) {
        ctx.fillStyle = isDark ? '#064e3b' : '#86efac';
        ctx.beginPath();
        ctx.arc(tx, -40, 36, 0, Math.PI * 2);
        ctx.arc(tx, worldH + 40, 36, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, worldW, worldH);
      break;
    }

    case 'cavern': {
      // Obsidian rock walls with glowing quartz veins
      ctx.fillStyle = '#070509';
      ctx.fillRect(-pad, -pad, worldW + pad * 2, pad);
      ctx.fillRect(-pad, worldH, worldW + pad * 2, pad);
      ctx.fillRect(-pad, 0, pad, worldH);
      ctx.fillRect(worldW, 0, pad, worldH);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, worldW, worldH);
      break;
    }

    case 'lab': {
      // Cleanroom airlock barrier
      ctx.fillStyle = isDark ? '#050c18' : '#e0f2fe';
      ctx.fillRect(-pad, -pad, worldW + pad * 2, pad);
      ctx.fillRect(-pad, worldH, worldW + pad * 2, pad);
      ctx.fillRect(-pad, 0, pad, worldH);
      ctx.fillRect(worldW, 0, pad, worldH);

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, worldW, worldH);
      break;
    }
  }

  ctx.restore();
}
