import React, { useRef, useEffect } from 'react';
import { CharacterCustomization, TeamId } from '../../types';
import { renderTankModel } from '../../game/rendering/renderTankModel';
import { getTeamPalette } from '../../config/teamConfig';

interface TankThumbnailCanvasProps {
  customization: CharacterCustomization;
  team?: TeamId | string;
  size?: number;
}

export const TankThumbnailCanvas: React.FC<TankThumbnailCanvasProps> = ({ customization, team, size = 36 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    const teamPalette = team ? getTeamPalette(team) : undefined;
    const bgPrimaryColor = teamPalette ? teamPalette.primary : customization.primaryColor;

    // Subtle radial background aura matching primary color
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, w * 0.45);
    grad.addColorStop(0, `${bgPrimaryColor}55`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Center and rotate 3/4 isometric angle (e.g. -0.5 rad or 0)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 6); // 30 degree facing angle

    renderTankModel(ctx, {
      customization,
      team,
      scale: 0.65,
      showTrail: false,
      showTeamBadge: Boolean(team),
    });

    ctx.restore();
  }, [customization, team]);

  return (
    <canvas
      ref={canvasRef}
      width={72}
      height={72}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="w-full h-full object-contain block rounded-lg"
    />
  );
};
