import { MapTheme } from '../../types';
import { MapObstacleDef, drawBeveledBox } from './renderObstacles';

export function renderTechObstacle(
  ctx: CanvasRenderingContext2D,
  obs: MapObstacleDef,
  theme: MapTheme,
  isDark: boolean
): boolean {
  const { x, y, w, h, label, borderColor } = obs;

  switch (theme) {
    case 'mall': {
      drawBeveledBox(ctx, x, y, w, h, 14, isDark ? '#1e293b' : '#f1f5f9', borderColor, 3.5);

      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x + 10, y + 10, w - 20, h - 20, 8);
      ctx.fill();
      ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const now = Date.now();
      const rgbHue = (now / 20) % 360;

      if (label.includes('PC') || label.includes('GAMING')) {
        const tableW = 44;
        const tableH = 22;
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 24, y + 26, tableW, tableH);
        ctx.fillStyle = `hsl(${rgbHue}, 90%, 60%)`;
        ctx.fillRect(x + 28, y + 28, 12, 18);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 44, y + 30, 20, 14);

        ctx.fillStyle = '#334155';
        ctx.fillRect(x + w - 68, y + 26, tableW, tableH);
        ctx.fillStyle = `hsl(${(rgbHue + 180) % 360}, 90%, 60%)`;
        ctx.fillRect(x + w - 64, y + 28, 12, 18);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + w - 48, y + 30, 20, 14);
      } else if (label.includes('SMARTPHONE')) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 24, y + 28, w - 48, 18);
        for (let dx = x + 34; dx < x + w - 40; dx += 28) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(dx, y + 30, 14, 14);
        }
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 20, y + 24, w - 40, 14);
        ctx.fillRect(x + 20, y + h - 38, w - 40, 14);
      }

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
      return true;
    }

    case 'rooftop': {
      drawBeveledBox(ctx, x, y, w, h, 12, isDark ? '#1e293b' : '#cbd5e1', borderColor, 3.5);

      if (label.includes('CHILLER') || label.includes('HVAC')) {
        const fanRadius = Math.min(h * 0.35, 42);
        const f1x = x + w * 0.32;
        const f2x = x + w * 0.68;
        const fy = y + h * 0.5;
        const fanRot = Date.now() / 80;

        [f1x, f2x].forEach((fx) => {
          ctx.save();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(fx, fy, fanRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.translate(fx, fy);
          ctx.rotate(fanRot);
          ctx.fillStyle = '#94a3b8';
          for (let b = 0; b < 4; b++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillRect(-4, -fanRadius * 0.85, 8, fanRadius * 0.85);
          }
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(fx, fy, fanRadius * 0.5, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else if (label.includes('GENERATOR')) {
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 8);
        ctx.lineTo(x + w - 8, y + h - 8);
        ctx.moveTo(x + w - 8, y + 8);
        ctx.lineTo(x + 8, y + h - 8);
        ctx.stroke();
      }

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
      return true;
    }

    case 'warehouse': {
      if (label.includes('CONTAINER')) {
        const isBlue = label.includes('03');
        const cColor = isBlue ? '#0369a1' : '#b91c1c';
        const cBorder = isBlue ? '#38bdf8' : '#f87171';
        drawBeveledBox(ctx, x, y, w, h, 6, cColor, cBorder, 3);

        ctx.strokeStyle = isBlue ? '#0284c7' : '#991b1b';
        ctx.lineWidth = 2;
        for (let ry = y + 12; ry < y + h - 12; ry += 12) {
          ctx.beginPath();
          ctx.moveTo(x + 8, ry);
          ctx.lineTo(x + w - 8, ry);
          ctx.stroke();
        }

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 3, y + 3, 10, 10);
        ctx.fillRect(x + w - 13, y + 3, 10, 10);
        ctx.fillRect(x + 3, y + h - 13, 10, 10);
        ctx.fillRect(x + w - 13, y + h - 13, 10, 10);
      } else {
        drawBeveledBox(ctx, x, y, w, h, 8, isDark ? '#1c1917' : '#e7e5e4', '#ea580c', 3);

        const bays = 3;
        const bayW = (w - 20) / bays;
        for (let b = 0; b < bays; b++) {
          const bx = x + 10 + b * bayW;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bx + 4, y + 10, bayW - 8, h - 20);

          ctx.fillStyle = '#d97706';
          ctx.fillRect(bx + 8, y + 14, bayW - 16, h - 28);
          ctx.strokeStyle = '#fef3c7';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 8, y + 14, bayW - 16, h - 28);
        }
      }

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
      return true;
    }

    default:
      return false;
  }
}
