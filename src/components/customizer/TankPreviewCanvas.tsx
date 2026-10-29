import React, { useRef, useEffect } from 'react';
import { CharacterCustomization } from '../../types';
import { renderTankModel } from '../../game/rendering/renderTankModel';

interface TankPreviewCanvasProps {
  customization: CharacterCustomization;
}

export const TankPreviewCanvas: React.FC<TankPreviewCanvasProps> = ({ customization }) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationAngleRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const renderPreview = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      rotationAngleRef.current += 0.02;
      const angle = rotationAngleRef.current;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Radial background aura matching primary color
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110);
      grad.addColorStop(0, `${customization.primaryColor}33`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Rotating Pedestal
      ctx.save();
      ctx.translate(cx, cy);

      // Hexagonal glowing ground ring
      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = customization.primaryColor;
      ctx.strokeStyle = customization.primaryColor;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + angle * 0.5;
        const hx = Math.cos(a) * 55;
        const hy = Math.sin(a) * 55;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Rotate character model
      ctx.rotate(angle);

      // Render unified tank model
      renderTankModel(ctx, {
        customization,
        scale: 1.0,
        showTrail: true,
        showTeamBadge: false,
      });

      ctx.restore();

      animId = requestAnimationFrame(renderPreview);
    };

    renderPreview();
    return () => cancelAnimationFrame(animId);
  }, [customization]);

  return (
    <canvas
      ref={previewCanvasRef}
      width={240}
      height={240}
      className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner"
    />
  );
};
