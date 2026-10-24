import React, { useRef, useEffect } from 'react';
import { CharacterCustomization } from '../../types';

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

      // Radial background aura
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

      // Weapon Barrel Drawing
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = customization.visorColor;
      ctx.fillStyle = '#f8fafc';

      if (customization.weaponSkin === 'dual_blaster') {
        ctx.fillRect(14, -9, 22, 6);
        ctx.fillRect(14, 3, 22, 6);
        ctx.fillStyle = customization.visorColor;
        ctx.fillRect(32, -8, 6, 4);
        ctx.fillRect(32, 4, 6, 4);
      } else if (customization.weaponSkin === 'laser_cannon') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(12, -7, 28, 14);
        ctx.fillStyle = customization.visorColor;
        ctx.fillRect(36, -5, 8, 10);
      } else if (customization.weaponSkin === 'plasma_rifle') {
        ctx.fillRect(12, -4, 32, 8);
        ctx.fillStyle = customization.visorColor;
        ctx.fillRect(20, -6, 8, 3);
      } else {
        ctx.fillRect(10, -8, 20, 16);
        ctx.fillStyle = customization.visorColor;
        ctx.fillRect(26, -9, 8, 18);
      }
      ctx.restore();

      // Class-specific body details
      if (customization.characterClass === 'phantom') {
        ctx.shadowBlur = 20;
        ctx.shadowColor = customization.primaryColor;
        ctx.fillStyle = customization.primaryColor;
        ctx.beginPath();
        ctx.arc(-4, 0, 26, -Math.PI * 0.7, Math.PI * 0.7);
        ctx.lineTo(-24, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (customization.characterClass === 'tanker') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(-22, -24, 18, 12);
        ctx.fillRect(-22, 12, 18, 12);

        ctx.fillStyle = customization.primaryColor;
        ctx.beginPath();
        ctx.roundRect(-20, -20, 40, 40, 8);
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (customization.characterClass === 'ninja') {
        ctx.fillStyle = customization.visorColor;
        ctx.save();
        ctx.rotate(-Math.PI / 4);
        ctx.fillRect(-34, -3, 38, 5);
        ctx.restore();

        ctx.fillStyle = customization.primaryColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (customization.characterClass === 'commando') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = customization.primaryColor;
        ctx.fillRect(-12, -18, 24, 36);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(-12, -18, 24, 36);
      } else {
        ctx.fillStyle = customization.primaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-16, -26, 4, 10);
        ctx.fillRect(-16, 16, 4, 10);
      }

      // Visor Glow
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = customization.visorColor;
      ctx.fillStyle = customization.visorColor;
      ctx.beginPath();
      ctx.arc(8, 0, 8, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.restore();

      // Accessories
      if (customization.accessory === 'crown') {
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑', -2, -18);
      } else if (customization.accessory === 'halo') {
        ctx.strokeStyle = '#fef08a';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 28, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (customization.accessory === 'horns') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-10, -18);
        ctx.lineTo(-6, -30);
        ctx.lineTo(-2, -18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-10, 18);
        ctx.lineTo(-6, 30);
        ctx.lineTo(-2, 18);
        ctx.fill();
      } else if (customization.accessory === 'cyber_goggles') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(4, -8, 8, 16);
      }

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
