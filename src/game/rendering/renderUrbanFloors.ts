export function renderMallFloor(
  ctx: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  worldW: number,
  worldH: number,
  isDark: boolean
) {
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
}

export function renderWarehouseFloor(
  ctx: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  worldW: number,
  worldH: number,
  isDark: boolean
) {
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

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(340, 600);
    ctx.lineTo(worldW - 340, 600);
    ctx.moveTo(340, 700);
    ctx.lineTo(worldW - 340, 700);
    ctx.stroke();

    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(340, 650);
    ctx.lineTo(worldW - 340, 650);
    ctx.stroke();
    ctx.setLineDash([]);

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
}
