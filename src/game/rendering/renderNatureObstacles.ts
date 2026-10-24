import { MapTheme } from '../../types';
import { MapObstacleDef, drawBeveledBox } from './renderObstacles';

export function renderNatureObstacle(
  ctx: CanvasRenderingContext2D,
  obs: MapObstacleDef,
  theme: MapTheme,
  isDark: boolean
): boolean {
  const { x, y, w, h, label } = obs;

  switch (theme) {
    case 'garden':
    case 'forest': {
      drawBeveledBox(ctx, x, y, w, h, 14, isDark ? '#064e3b' : '#bbf7d0', '#059669', 3.5);

      if (label.includes('BIODOME') || label.includes('CONSERVATORY')) {
        ctx.fillStyle = isDark ? 'rgba(6, 78, 59, 0.85)' : 'rgba(209, 250, 229, 0.85)';
        ctx.fillRect(x + 8, y + 8, w - 16, h - 16);

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

        ctx.fillStyle = '#047857';
        [[-30, -15], [20, 10], [-10, 18], [40, -12]].forEach(([fx, fy]) => {
          ctx.beginPath();
          ctx.arc(x + w / 2 + fx, y + h / 2 + fy, 16, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        ctx.fillStyle = '#047857';
        ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
      }

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
      return true;
    }

    case 'cavern': {
      drawBeveledBox(ctx, x, y, w, h, 14, '#18181b', '#d97706', 3.5);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);

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
      return true;
    }

    case 'lab': {
      drawBeveledBox(ctx, x, y, w, h, 10, isDark ? '#0f172a' : '#f0f9ff', '#0284c7', 3.5);

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
      return true;
    }

    default:
      return false;
  }
}
