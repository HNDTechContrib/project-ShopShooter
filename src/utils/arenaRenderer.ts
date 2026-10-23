import { MapTheme, TeamId } from '../types';

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

/**
 * Procedural Top-Down Arena Renderer for ShopShooter
 * Renders distinct, detailed, and tactile environments for all map themes.
 */

// Helper to draw a beveled architectural slab with directional drop shadow
function drawBeveledBox(
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

/**
 * 1. RENDER PERIMETER & SURROUNDING OUTSIDE ENVIRONMENT
 * Renders the world beyond 0..worldW and 0..worldH to give tremendous scale and depth.
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
      // Outside borders
      ctx.fillRect(-pad, -pad, worldW + pad * 2, pad); // top
      ctx.fillRect(-pad, worldH, worldW + pad * 2, pad); // bottom
      ctx.fillRect(-pad, 0, pad, worldH); // left
      ctx.fillRect(worldW, 0, pad, worldH); // right

      // Distant building silhouettes with glowing cyber windows
      const now = Date.now();
      for (let bx = -pad; bx < worldW + pad; bx += 90) {
        // Top edge buildings
        const bH = 140 + Math.sin(bx * 0.05) * 60;
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(bx, -bH, 80, bH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, -bH, 80, bH);

        // Blinking rooftop aerial beacons
        const blink = Math.sin(now / 300 + bx) > 0.4;
        if (blink) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(bx + 40, -bH - 6, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bottom edge buildings
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

/**
 * 2. RENDER THEMED ARENA FLOOR
 * Highly detailed tactile surface materials with visible viewport clipping for 60 FPS.
 */
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
  // Viewport bounds with generous margin
  const minX = Math.max(0, camX - 100);
  const maxX = Math.min(worldW, camX + viewW + 100);
  const minY = Math.max(0, camY - 100);
  const maxY = Math.min(worldH, camY + viewH + 100);

  ctx.save();

  switch (theme) {
    case 'mall': {
      // SUPERMALL MEGASTORE: High-gloss polished marble tiles & central shopping promenade
      const baseFloor = isDark ? '#0f172a' : '#f8fafc';
      ctx.fillStyle = baseFloor;
      ctx.fillRect(0, 0, worldW, worldH);

      // Marble square tiles (80px x 80px)
      const tileSize = 80;
      const startX = Math.floor(minX / tileSize) * tileSize;
      const endX = Math.ceil(maxX / tileSize) * tileSize;
      const startY = Math.floor(minY / tileSize) * tileSize;
      const endY = Math.ceil(maxY / tileSize) * tileSize;

      for (let x = startX; x < endX; x += tileSize) {
        for (let y = startY; y < endY; y += tileSize) {
          const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          ctx.fillStyle = isAlt
            ? isDark ? '#111c33' : '#f1f5f9'
            : isDark ? '#0d1527' : '#ffffff';
          ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

          // Subtle marble sheen accent
          if ((x * 7 + y * 13) % 5 === 0) {
            ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.04)' : 'rgba(2, 132, 199, 0.04)';
            ctx.fillRect(x + 8, y + 8, tileSize - 16, tileSize - 16);
          }
        }
      }

      // Central Shopping Promenade (Y: 480 to 820)
      const promTop = 480;
      const promBottom = 820;
      if (maxY >= promTop && minY <= promBottom) {
        // High-gloss sapphire & brass border runners
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, promTop);
        ctx.lineTo(worldW, promTop);
        ctx.moveTo(0, promBottom);
        ctx.lineTo(worldW, promBottom);
        ctx.stroke();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, promTop + 6);
        ctx.lineTo(worldW, promTop + 6);
        ctx.moveTo(0, promBottom - 6);
        ctx.lineTo(worldW, promBottom - 6);
        ctx.stroke();
      }

      // Grand Center Rotunda & Brass Compass Medallion (1100, 650)
      const cx = 1100;
      const cy = 650;
      if (maxX >= cx - 240 && minX <= cx + 240 && maxY >= cy - 240 && minY <= cy + 240) {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.25)';
        // Outer decorative brass ring
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 140, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 110, 0, Math.PI * 2);
        ctx.stroke();

        // 8-Point Compass Star
        ctx.fillStyle = isDark ? '#1e293b' : '#e0f2fe';
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        for (let a = 0; a < 8; a++) {
          const ang = (Math.PI / 4) * a;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ang) * 90, cy + Math.sin(ang) * 90);
          ctx.stroke();
        }

        ctx.font = '900 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MEGASTORE ATRIUM', cx, cy);
        ctx.restore();
      }
      break;
    }

    case 'rooftop': {
      // SKY PLAZA & HELIPAD: Architectural concrete pavers & massive operational Helipad
      const baseFloor = isDark ? '#0f172a' : '#e2e8f0';
      ctx.fillStyle = baseFloor;
      ctx.fillRect(0, 0, worldW, worldH);

      // Concrete architectural paver grid (100px)
      const pSize = 100;
      const startX = Math.floor(minX / pSize) * pSize;
      const endX = Math.ceil(maxX / pSize) * pSize;
      const startY = Math.floor(minY / pSize) * pSize;
      const endY = Math.ceil(maxY / pSize) * pSize;

      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 2;
      for (let x = startX; x <= endX; x += pSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += pSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      // Massive Central Helipad Runway (1100, 650)
      const hx = 1100;
      const hy = 650;
      const hRadius = 150;
      if (maxX >= hx - hRadius - 30 && minX <= hx + hRadius + 30 && maxY >= hy - hRadius - 30 && minY <= hy + hRadius + 30) {
        ctx.save();
        // Helipad dark tarmac base
        ctx.fillStyle = isDark ? '#0a0e1a' : '#334155';
        ctx.beginPath();
        ctx.arc(hx, hy, hRadius, 0, Math.PI * 2);
        ctx.fill();

        // Thick Yellow Approach Circle
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Inner dashed white alignment circle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([14, 10]);
        ctx.beginPath();
        ctx.arc(hx, hy, hRadius * 0.75, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Huge Neon [ H ] Landing Letter
        ctx.font = '900 84px monospace';
        ctx.fillStyle = '#eab308';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 24;
        ctx.shadowColor = '#eab308';
        ctx.fillText('H', hx, hy);

        // Flashing Runway Strobe Beacons along perimeter (8 beacons)
        const now = Date.now();
        for (let b = 0; b < 8; b++) {
          const bAngle = (Math.PI / 4) * b;
          const bx = hx + Math.cos(bAngle) * (hRadius - 12);
          const by = hy + Math.sin(bAngle) * (hRadius - 12);
          const bFlash = Math.sin(now / 150 + b * 0.8) > 0.2;

          ctx.fillStyle = bFlash ? '#ef4444' : '#7f1d1d';
          ctx.shadowBlur = bFlash ? 16 : 0;
          ctx.shadowColor = '#ef4444';
          ctx.beginPath();
          ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Helipad Runway Identification Tag
        ctx.shadowBlur = 0;
        ctx.font = '900 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PAD 01 · MAX 12,000 KG', hx, hy + hRadius * 0.5);
        ctx.restore();
      }

      // Skywalk glass bridge corridors (x: 500 and x: 1580)
      [500, 1580].forEach((swX) => {
        if (maxX >= swX - 70 && minX <= swX + 70) {
          ctx.save();
          ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.2)';
          ctx.fillRect(swX - 60, 420, 120, 300);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(swX - 60, 420, 120, 300);

          // Diamond structural steel truss grid
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 1.5;
          for (let gy = 440; gy <= 700; gy += 40) {
            ctx.beginPath();
            ctx.moveTo(swX - 60, gy);
            ctx.lineTo(swX + 60, gy + 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(swX + 60, gy);
            ctx.lineTo(swX - 60, gy + 20);
            ctx.stroke();
          }
          ctx.restore();
        }
      });
      break;
    }

    case 'warehouse': {
      // SMART LOGISTICS HUB: Sealed industrial epoxy floor, yellow forklift highways, and staging lanes
      const baseFloor = isDark ? '#18181b' : '#f4f4f5';
      ctx.fillStyle = baseFloor;
      ctx.fillRect(0, 0, worldW, worldH);

      // Expansion joints (120px)
      const eSize = 120;
      const startX = Math.floor(minX / eSize) * eSize;
      const endX = Math.ceil(maxX / eSize) * eSize;
      const startY = Math.floor(minY / eSize) * eSize;
      const endY = Math.ceil(maxY / eSize) * eSize;

      ctx.strokeStyle = isDark ? '#27272a' : '#e4e4e7';
      ctx.lineWidth = 1.5;
      for (let x = startX; x <= endX; x += eSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += eSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      // Main Forklift Logistics Highway (X: 340 to 1860, Y: 600 to 700)
      if (maxY >= 580 && minY <= 720) {
        ctx.save();
        ctx.fillStyle = isDark ? '#27272a' : '#e4e4e7';
        ctx.fillRect(340, 600, worldW - 680, 100);

        // Yellow solid boundary lines
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(340, 600);
        ctx.lineTo(worldW - 340, 600);
        ctx.moveTo(340, 700);
        ctx.lineTo(worldW - 340, 700);
        ctx.stroke();

        // Yellow dashed center highway divider
        ctx.setLineDash([20, 15]);
        ctx.beginPath();
        ctx.moveTo(340, 650);
        ctx.lineTo(worldW - 340, 650);
        ctx.stroke();
        ctx.setLineDash([]);

        // Directional AGV Arrows along highway
        for (let ax = 480; ax < worldW - 400; ax += 280) {
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.moveTo(ax, 642);
          ctx.lineTo(ax - 20, 634);
          ctx.lineTo(ax - 20, 650);
          ctx.closePath();
          ctx.fill();

          ctx.font = '900 10px monospace';
          ctx.fillText('AGV LANE', ax + 25, 654);
        }
        ctx.restore();
      }

      // Cargo Staging Zones Hatching
      [[860, 420, 480, 120, 'STAGING ZONE A1'], [860, 740, 480, 120, 'STAGING ZONE B2']].forEach(([sx, sy, sw, sh, sLabel]) => {
        const xNum = sx as number;
        const yNum = sy as number;
        const wNum = sw as number;
        const hNum = sh as number;
        if (maxX >= xNum && minX <= xNum + wNum && maxY >= yNum && minY <= yNum + hNum) {
          ctx.save();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.strokeRect(xNum, yNum, wNum, hNum);
          ctx.setLineDash([]);

          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#d97706';
          ctx.textAlign = 'center';
          ctx.fillText(sLabel as string, xNum + wNum / 2, yNum + 20);
          ctx.restore();
        }
      });
      break;
    }

    case 'garden': {
      // BOTANICAL ATRIUM: Organic flagstone combat lanes, lush grass beds & central cyber lotus pond
      const baseFloor = isDark ? '#022c22' : '#f0fdf4';
      ctx.fillStyle = baseFloor;
      ctx.fillRect(0, 0, worldW, worldH);

      // Winding Flagstone pathways (irregular organic pavers)
      const fSize = 75;
      const startX = Math.floor(minX / fSize) * fSize;
      const endX = Math.ceil(maxX / fSize) * fSize;
      const startY = Math.floor(minY / fSize) * fSize;
      const endY = Math.ceil(maxY / fSize) * fSize;

      for (let x = startX; x < endX; x += fSize) {
        for (let y = startY; y < endY; y += fSize) {
          // Flagstone texture
          ctx.fillStyle = isDark ? '#064e3b' : '#dcfce7';
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, fSize - 4, fSize - 4, 10);
          ctx.fill();

          // Green vegetation grout line
          ctx.strokeStyle = isDark ? '#022c22' : '#86efac';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Central Cyber Lotus Reflecting Pond (1100, 650)
      const px = 1100;
      const py = 650;
      const pW = 320;
      const pH = 180;
      if (maxX >= px - pW / 2 && minX <= px + pW / 2 && maxY >= py - pH / 2 && minY <= py + pH / 2) {
        ctx.save();
        // Deep turquoise pond basin
        ctx.fillStyle = isDark ? '#042f2e' : '#ccfbf1';
        ctx.beginPath();
        ctx.ellipse(px, py, pW / 2, pH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Animated gentle concentric water ripples
        const rTime = Date.now() / 35;
        const rip1 = (rTime % 80);
        const rip2 = ((rTime + 40) % 80);

        ctx.strokeStyle = 'rgba(20, 184, 166, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py, rip1 * 1.8, rip1, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(px, py, rip2 * 1.8, rip2, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Lotus pads
        ctx.fillStyle = '#059669';
        [[-60, -25], [55, 30], [-70, 35], [60, -30]].forEach(([lx, ly]) => {
          ctx.beginPath();
          ctx.arc(px + lx, py + ly, 14, 0, Math.PI * 1.8);
          ctx.fill();
        });
        ctx.restore();
      }
      break;
    }

    case 'cavern': {
      // CRYSTAL PLAZA: Polished black obsidian with luminous golden crystal fissures
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, worldW, worldH);

      // Basalt slab grid (90px)
      const bSize = 90;
      const startX = Math.floor(minX / bSize) * bSize;
      const endX = Math.ceil(maxX / bSize) * bSize;
      const startY = Math.floor(minY / bSize) * bSize;
      const endY = Math.ceil(maxY / bSize) * bSize;

      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      for (let x = startX; x <= endX; x += bSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += bSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      // Glowing crystal geode veins across central lanes
      ctx.save();
      const cPulse = (Math.sin(Date.now() / 400) + 1) / 2;
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 + cPulse * 0.4})`;
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#f59e0b';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(400, 300);
      ctx.lineTo(800, 500);
      ctx.lineTo(1100, 450);
      ctx.lineTo(1400, 500);
      ctx.lineTo(1800, 300);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(400, 1000);
      ctx.lineTo(800, 800);
      ctx.lineTo(1100, 850);
      ctx.lineTo(1400, 800);
      ctx.lineTo(1800, 1000);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'lab': {
      // TECH INNOVATION LAB: Cleanroom raised airflow floor & pulsing data bus channels
      ctx.fillStyle = isDark ? '#091322' : '#f0f9ff';
      ctx.fillRect(0, 0, worldW, worldH);

      // Modular cleanroom tiles (60px) with central air vent perforation dot
      const tSize = 60;
      const startX = Math.floor(minX / tSize) * tSize;
      const endX = Math.ceil(maxX / tSize) * tSize;
      const startY = Math.floor(minY / tSize) * tSize;
      const endY = Math.ceil(maxY / tSize) * tSize;

      ctx.strokeStyle = isDark ? '#1e293b' : '#bae6fd';
      ctx.lineWidth = 1;
      for (let x = startX; x <= endX; x += tSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += tSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      // Glowing data bus channels
      ctx.save();
      const dataOffset = (Date.now() / 20) % 80;
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -dataOffset;

      ctx.beginPath();
      ctx.moveTo(320, 480);
      ctx.lineTo(worldW - 320, 480);
      ctx.moveTo(320, 820);
      ctx.lineTo(worldW - 320, 820);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      break;
    }

    case 'forest': {
      // ECO GARDEN MALL: Bamboo timber decking & permeable grass pavers
      ctx.fillStyle = isDark ? '#142018' : '#f5f5f4';
      ctx.fillRect(0, 0, worldW, worldH);

      // Decking planks (width: 140px, height: 28px)
      const pW = 140;
      const pH = 28;
      const startX = Math.floor(minX / pW) * pW;
      const endX = Math.ceil(maxX / pW) * pW;
      const startY = Math.floor(minY / pH) * pH;
      const endY = Math.ceil(maxY / pH) * pH;

      ctx.strokeStyle = isDark ? '#1c2e22' : '#d6d3d1';
      ctx.lineWidth = 1.5;
      for (let y = startY; y <= endY; y += pH) {
        ctx.beginPath();
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
        ctx.stroke();
      }
      for (let x = startX; x <= endX; x += pW) {
        for (let y = startY; y <= endY; y += pH) {
          const stagger = (Math.floor(y / pH) % 2) * (pW / 2);
          ctx.beginPath();
          ctx.moveTo(x + stagger, y);
          ctx.lineTo(x + stagger, y + pH);
          ctx.stroke();
        }
      }
      break;
    }
  }

  ctx.restore();
}

/**
 * 3. RENDER BASE ZONES
 * High-tech tactical base platforms with team laser tripwires, floor projection badges, and spawn pads.
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

/**
 * 4. RENDER ARCHITECTURAL THEMED OBSTACLE
 * Replaces generic white boxes with authentic 3D top-down buildings, machinery, racks, and domes.
 */
export function renderThemedObstacle(
  ctx: CanvasRenderingContext2D,
  obs: MapObstacleDef,
  theme: MapTheme,
  isDark: boolean
) {
  const { x, y, w, h, label, borderColor } = obs;

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

  // 2. Specific Top-Down Architectural Render by Map Theme
  switch (theme) {
    case 'mall': {
      // SHOPPING MALL STORE / BOUTIQUE
      // Exterior Wall & Bevel
      drawBeveledBox(ctx, x, y, w, h, 14, isDark ? '#1e293b' : '#f1f5f9', borderColor, 3.5);

      // Glass storefront interior display recess
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x + 10, y + 10, w - 20, h - 20, 8);
      ctx.fill();
      ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Display Tables & Merchandise Silhouettes
      const now = Date.now();
      const rgbHue = (now / 20) % 360;

      if (label.includes('PC') || label.includes('GAMING')) {
        // High-end PC Store with RGB Battle Stations
        const tableW = 44;
        const tableH = 22;
        // Table 1
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 24, y + 26, tableW, tableH);
        // RGB PC Rig glowing
        ctx.fillStyle = `hsl(${rgbHue}, 90%, 60%)`;
        ctx.fillRect(x + 28, y + 28, 12, 18);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 44, y + 30, 20, 14); // Ultrawide Monitor

        // Table 2
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + w - 68, y + 26, tableW, tableH);
        ctx.fillStyle = `hsl(${(rgbHue + 180) % 360}, 90%, 60%)`;
        ctx.fillRect(x + w - 64, y + 28, 12, 18);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + w - 48, y + 30, 20, 14);
      } else if (label.includes('SMARTPHONE')) {
        // Sleek Tech Store Tables with Rows of Devices
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 24, y + 28, w - 48, 18);
        for (let dx = x + 34; dx < x + w - 40; dx += 28) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(dx, y + 30, 14, 14);
        }
      } else {
        // Retail Gondola Display Shelves
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 20, y + 24, w - 40, 14);
        ctx.fillRect(x + 20, y + h - 38, w - 40, 14);
      }

      // Glowing Neon Storefront Marquee Badge at Center
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = borderColor;
      const bW = Math.min(w - 24, 210);
      const bH = 24;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.roundRect(x + (w - bW) / 2, y + (h - bH) / 2, bW, bH, 6);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '900 10.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h / 2);
      ctx.restore();
      break;
    }

    case 'rooftop': {
      // ROOFTOP INDUSTRIAL HVAC CHILLER / GENERATORS / DUCTING
      drawBeveledBox(ctx, x, y, w, h, 12, isDark ? '#1e293b' : '#cbd5e1', borderColor, 3.5);

      if (label.includes('CHILLER') || label.includes('HVAC')) {
        // Twin Industrial Chiller Fans spinning
        const fanRadius = Math.min(h * 0.35, 42);
        const f1x = x + w * 0.32;
        const f2x = x + w * 0.68;
        const fy = y + h * 0.5;
        const fanRot = Date.now() / 80;

        [f1x, f2x].forEach((fx) => {
          ctx.save();
          // Fan Well
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(fx, fy, fanRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Spinning Blades
          ctx.translate(fx, fy);
          ctx.rotate(fanRot);
          ctx.fillStyle = '#94a3b8';
          for (let b = 0; b < 4; b++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillRect(-4, -fanRadius * 0.85, 8, fanRadius * 0.85);
          }
          // Fan Hub
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Protective Wire Grille
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(fx, fy, fanRadius * 0.5, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else if (label.includes('GENERATOR')) {
        // Diesel Generator Cooling Louvers & High Voltage Lightning Decal
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 16, y + 16, w - 32, h - 32);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        for (let ly = y + 26; ly < y + h - 26; ly += 14) {
          ctx.beginPath();
          ctx.moveTo(x + 24, ly);
          ctx.lineTo(x + w - 24, ly);
          ctx.stroke();
        }
      } else {
        // Structural Steel Cross-bracing
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 8);
        ctx.lineTo(x + w - 8, y + h - 8);
        ctx.moveTo(x + w - 8, y + 8);
        ctx.lineTo(x + 8, y + h - 8);
        ctx.stroke();
      }

      // High-Visibility Warning Label Stencil
      ctx.save();
      const bW = Math.min(w - 20, 190);
      const bH = 22;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(x + (w - bW) / 2, y + h - bH - 8, bW, bH);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + (w - bW) / 2, y + h - bH - 8, bW, bH);

      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h - bH / 2 - 8);
      ctx.restore();
      break;
    }

    case 'warehouse': {
      // SMART LOGISTICS HUB: Cargo Racks with pallets or Shipping Containers
      if (label.includes('CONTAINER')) {
        // Corrugated Intermodal Shipping Container
        const isBlue = label.includes('03');
        const cColor = isBlue ? '#0369a1' : '#b91c1c';
        const cBorder = isBlue ? '#38bdf8' : '#f87171';
        drawBeveledBox(ctx, x, y, w, h, 6, cColor, cBorder, 3);

        // Corrugated roof ribs
        ctx.strokeStyle = isBlue ? '#0284c7' : '#991b1b';
        ctx.lineWidth = 2;
        for (let ry = y + 12; ry < y + h - 12; ry += 12) {
          ctx.beginPath();
          ctx.moveTo(x + 8, ry);
          ctx.lineTo(x + w - 8, ry);
          ctx.stroke();
        }

        // Corner casting brackets
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 3, y + 3, 10, 10);
        ctx.fillRect(x + w - 13, y + 3, 10, 10);
        ctx.fillRect(x + 3, y + h - 13, 10, 10);
        ctx.fillRect(x + w - 13, y + h - 13, 10, 10);
      } else {
        // Heavy Pallet Racking with Orange Steel Beams & Pallets of Boxes
        drawBeveledBox(ctx, x, y, w, h, 8, isDark ? '#1c1917' : '#e7e5e4', '#ea580c', 3);

        // Individual Pallet Bays
        const bays = 3;
        const bayW = (w - 20) / bays;
        for (let b = 0; b < bays; b++) {
          const bx = x + 10 + b * bayW;
          // Wooden pallet base
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bx + 4, y + 10, bayW - 8, h - 20);

          // Cardboard boxes sealed with tape
          ctx.fillStyle = '#d97706';
          ctx.fillRect(bx + 8, y + 14, bayW - 16, h - 28);
          ctx.strokeStyle = '#fef3c7';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 8, y + 14, bayW - 16, h - 28);
        }
      }

      // Industrial Stencil Barcode Label
      ctx.save();
      const bW = Math.min(w - 24, 200);
      const bH = 22;
      ctx.fillStyle = 'rgba(24, 24, 27, 0.95)';
      ctx.beginPath();
      ctx.roundRect(x + (w - bW) / 2, y + (h - bH) / 2, bW, bH, 5);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '900 10px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h / 2);
      ctx.restore();
      break;
    }

    case 'garden':
    case 'forest': {
      // BOTANICAL BIODOME / CEDAR GAZEBO
      drawBeveledBox(ctx, x, y, w, h, 14, isDark ? '#064e3b' : '#bbf7d0', '#059669', 3.5);

      if (label.includes('BIODOME') || label.includes('CONSERVATORY')) {
        // Geodesic Glass Dome Struts
        ctx.fillStyle = isDark ? 'rgba(6, 78, 59, 0.85)' : 'rgba(209, 250, 229, 0.85)';
        ctx.fillRect(x + 8, y + 8, w - 16, h - 16);

        // Geodesic diamond frame
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.8;
        for (let gx = x + 24; gx < x + w - 20; gx += 32) {
          ctx.beginPath();
          ctx.moveTo(gx, y + 8);
          ctx.lineTo(gx + 16, y + h - 8);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(gx + 16, y + 8);
          ctx.lineTo(gx, y + h - 8);
          ctx.stroke();
        }

        // Foliage visible beneath glass
        ctx.fillStyle = '#047857';
        [[-30, -15], [20, 10], [-10, 18], [40, -12]].forEach(([fx, fy]) => {
          ctx.beginPath();
          ctx.arc(x + w / 2 + fx, y + h / 2 + fy, 16, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Living Green Roof Gazebo
        ctx.fillStyle = '#047857';
        ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
      }

      // Eco botanical plate
      ctx.save();
      const bW = Math.min(w - 20, 210);
      const bH = 22;
      ctx.fillStyle = 'rgba(2, 44, 34, 0.95)';
      ctx.beginPath();
      ctx.roundRect(x + (w - bW) / 2, y + h - bH - 8, bW, bH, 6);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a7f3d0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h - bH / 2 - 8);
      ctx.restore();
      break;
    }

    case 'cavern': {
      // CRYSTAL PLAZA OBELISKS & MONUMENTS
      drawBeveledBox(ctx, x, y, w, h, 14, '#18181b', '#d97706', 3.5);

      // Gold-trimmed marble inlays
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);

      // Center Crystal Geode
      const cGlow = (Math.sin(Date.now() / 300) + 1) / 2;
      ctx.fillStyle = `rgba(245, 158, 11, ${0.7 + cGlow * 0.3})`;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.font = '900 10.5px monospace';
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h - 14);
      ctx.restore();
      break;
    }

    case 'lab': {
      // QUANTUM MAINFRAME & SERVER ENCLOSURES
      drawBeveledBox(ctx, x, y, w, h, 10, isDark ? '#0f172a' : '#f0f9ff', '#0284c7', 3.5);

      // Blinking server status LED arrays
      const now = Date.now();
      for (let sx = x + 18; sx < x + w - 16; sx += 22) {
        for (let sy = y + 18; sy < y + h - 26; sy += 16) {
          const ledOn = Math.sin(now / 120 + sx * 3 + sy * 5) > 0;
          ctx.fillStyle = ledOn ? '#38bdf8' : '#0369a1';
          ctx.fillRect(sx, sy, 8, 5);
        }
      }

      ctx.save();
      const bW = Math.min(w - 20, 190);
      const bH = 20;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(x + (w - bW) / 2, y + h - bH - 6, bW, bH);
      ctx.strokeStyle = '#0284c7';
      ctx.strokeRect(x + (w - bW) / 2, y + h - bH - 6, bW, bH);

      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h - bH / 2 - 6);
      ctx.restore();
      break;
    }
  }

  ctx.restore();
}
