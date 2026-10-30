export function renderRooftopFloor(
  ctx: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  worldW: number,
  worldH: number,
  isDark: boolean
) {
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
    ctx.fillStyle = isDark ? '#0a0e1a' : '#334155';
    ctx.beginPath();
    ctx.arc(hx, hy, hRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.arc(hx, hy, hRadius * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '900 84px monospace';
    ctx.fillStyle = '#eab308';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#eab308';
    ctx.fillText('H', hx, hy);

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
}
