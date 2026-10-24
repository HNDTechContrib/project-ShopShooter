export function renderGardenFloor(
  ctx: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  worldW: number,
  worldH: number,
  isDark: boolean
) {
  const baseFloor = isDark ? '#022c22' : '#f0fdf4';
  ctx.fillStyle = baseFloor;
  ctx.fillRect(0, 0, worldW, worldH);

  const fSize = 75;
  const startX = Math.floor(minX / fSize) * fSize;
  const endX = Math.ceil(maxX / fSize) * fSize;
  const startY = Math.floor(minY / fSize) * fSize;
  const endY = Math.ceil(maxY / fSize) * fSize;

  for (let x = startX; x < endX; x += fSize) {
    for (let y = startY; y < endY; y += fSize) {
      ctx.fillStyle = isDark ? '#064e3b' : '#dcfce7';
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, fSize - 4, fSize - 4, 10);
      ctx.fill();

      ctx.strokeStyle = isDark ? '#022c22' : '#86efac';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  const px = 1100;
  const py = 650;
  const pW = 320;
  const pH = 180;
  if (maxX >= px - pW / 2 && minX <= px + pW / 2 && maxY >= py - pH / 2 && minY <= py + pH / 2) {
    ctx.save();
    ctx.fillStyle = isDark ? '#042f2e' : '#ccfbf1';
    ctx.beginPath();
    ctx.ellipse(px, py, pW / 2, pH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 4;
    ctx.stroke();

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

    ctx.fillStyle = '#059669';
    [[-60, -25], [55, 30], [-70, 35], [60, -30]].forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.arc(px + lx, py + ly, 14, 0, Math.PI * 1.8);
      ctx.fill();
    });
    ctx.restore();
  }
}

export function renderCavernFloor(
  ctx: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  worldW: number,
  worldH: number
) {
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, worldW, worldH);

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
}

export function renderLabFloor(
  ctx: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  worldW: number,
  worldH: number,
  isDark: boolean
) {
  ctx.fillStyle = isDark ? '#091322' : '#f0f9ff';
  ctx.fillRect(0, 0, worldW, worldH);

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
}

export function renderForestFloor(
  ctx: CanvasRenderingContext2D,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  worldW: number,
  worldH: number,
  isDark: boolean
) {
  ctx.fillStyle = isDark ? '#142018' : '#f5f5f4';
  ctx.fillRect(0, 0, worldW, worldH);

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
}
