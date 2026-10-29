import { CharacterCustomization, CharacterClass, WeaponSkin, AccessoryType, TeamId } from '../../types';
import { getTeamPalette, normalizeTeamId } from '../../config/teamConfig';

export interface RenderTankOptions {
  customization?: CharacterCustomization;
  team?: TeamId | string;
  fallbackColor?: string;
  isShielded?: boolean;
  scale?: number;
  showTrail?: boolean;
  showTeamBadge?: boolean;
  isMoving?: boolean;
}

const DEFAULT_CUSTOMIZATION: CharacterCustomization = {
  characterClass: 'phantom',
  primaryColor: '#06b6d4',
  secondaryColor: '#0284c7',
  visorColor: '#38bdf8',
  weaponSkin: 'laser_cannon',
  accessory: 'none',
  trailEffect: 'none',
};

/**
 * Universal High-Fidelity Tank Model Renderer
 * Shared between Character Customization 360° Preview and In-Game 2D Arena Match.
 * Assumes the canvas context is already translated to the tank's center (0, 0)
 * and rotated to the tank's facing angle (0 rad points towards +X forward).
 */
export const renderTankModel = (
  ctx: CanvasRenderingContext2D,
  options: RenderTankOptions = {}
) => {
  const {
    customization = DEFAULT_CUSTOMIZATION,
    team,
    fallbackColor,
    isShielded = false,
    scale = 1.0,
    showTrail = false,
    showTeamBadge = true,
    isMoving = false,
  } = options;

  const charClass: CharacterClass = customization.characterClass || 'phantom';

  // Team Palette takes absolute precedence in matches to guarantee team identification
  const teamPalette = team ? getTeamPalette(team) : undefined;
  const primaryColor = teamPalette 
    ? teamPalette.primary 
    : (customization.primaryColor || fallbackColor || '#06b6d4');
  const secondaryColor = teamPalette 
    ? teamPalette.secondary 
    : (customization.secondaryColor || '#0284c7');
  const visorColor = teamPalette 
    ? teamPalette.visor 
    : (customization.visorColor || '#38bdf8');
  const weaponSkin: WeaponSkin = customization.weaponSkin || 'laser_cannon';
  const accessory: AccessoryType = customization.accessory || 'none';

  ctx.save();
  if (scale !== 1.0) {
    ctx.scale(scale, scale);
  }

  // 1. Forcefield Shield Aura (if active)
  if (isShielded) {
    ctx.save();
    const shieldGlow = teamPalette ? teamPalette.visor : (team === 'red' ? '#fb7185' : '#38bdf8');
    const shieldStroke = teamPalette ? teamPalette.glow : (team === 'red' ? '#f43f5e' : '#38bdf8');
    const shieldFill = teamPalette ? teamPalette.shieldFill : (team === 'red' ? 'rgba(244, 63, 94, 0.16)' : 'rgba(56, 189, 248, 0.18)');

    ctx.shadowBlur = 18;
    ctx.shadowColor = shieldGlow;
    ctx.strokeStyle = shieldStroke;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = shieldFill;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Subtle pulsing energy arc rings
    ctx.setLineDash([8, 12]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Thruster / Exhaust Plume (Rear: -X direction)
  if (isMoving || showTrail || customization.trailEffect !== 'none') {
    ctx.save();
    const thrusterColor = customization.trailEffect === 'flames' 
      ? '#f97316' 
      : customization.trailEffect === 'matrix' 
      ? '#10b981' 
      : visorColor;

    ctx.shadowBlur = 12;
    ctx.shadowColor = thrusterColor;
    ctx.fillStyle = thrusterColor;

    // Dual rear thruster jets
    ctx.beginPath();
    ctx.moveTo(-22, -8);
    ctx.lineTo(-32, -5);
    ctx.lineTo(-22, -2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-22, 2);
    ctx.lineTo(-32, 5);
    ctx.lineTo(-22, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 3. Weapon Barrel Assembly (Facing +X direction)
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = visorColor;

  if (weaponSkin === 'laser_cannon') {
    // Heavy Laser Cannon: Dual magnetic rails + heavy power chamber + glowing emitter lens
    // Base chamber
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, -8, 12, 16);

    // Main heavy barrel housing
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(14, -7, 24, 14, 3);
    ctx.fill();

    // Top and bottom magnetic capacitor rails
    ctx.fillStyle = '#475569';
    ctx.fillRect(12, -9, 26, 3);
    ctx.fillRect(12, 6, 26, 3);

    // Glowing internal plasma core channel
    ctx.fillStyle = visorColor;
    ctx.fillRect(18, -2, 18, 4);

    // Heavy focus emitter muzzle
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(36, -8, 8, 16);
    ctx.fillStyle = visorColor;
    ctx.fillRect(38, -6, 6, 12);

    ctx.strokeStyle = visorColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, -8, 8, 16);
  } else if (weaponSkin === 'dual_blaster') {
    // Dual Plasma Blaster: Twin parallel high-velocity barrels
    // Breach connector
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, -10, 8, 20);

    // Twin barrels
    ctx.fillStyle = '#334155';
    ctx.fillRect(14, -9, 22, 6);
    ctx.fillRect(14, 3, 22, 6);

    // Barrel top plates
    ctx.fillStyle = '#64748b';
    ctx.fillRect(16, -8, 14, 2);
    ctx.fillRect(16, 4, 14, 2);

    // Glowing muzzle tips
    ctx.fillStyle = visorColor;
    ctx.fillRect(32, -9, 6, 6);
    ctx.fillRect(32, 3, 6, 6);
  } else if (weaponSkin === 'plasma_rifle') {
    // Pulse Assault Rifle: Long precision rail barrel with magnetic induction coils
    // Long rifle barrel
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, -4, 34, 8);

    // Under-barrel stabilizer
    ctx.fillStyle = '#475569';
    ctx.fillRect(12, 2, 22, 3);

    // 3 Glowing magnetic coils
    ctx.fillStyle = visorColor;
    ctx.fillRect(16, -6, 4, 12);
    ctx.fillRect(24, -6, 4, 12);
    ctx.fillRect(32, -6, 4, 12);

    // Needle muzzle tip
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(42, -2, 4, 4);
  } else {
    // Vortex Shotgun: Wide heavy flared scatter muzzle
    // Heavy receiver
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, -9, 14, 18);

    // Expanding flared barrel
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(14, -8);
    ctx.lineTo(30, -11);
    ctx.lineTo(30, 11);
    ctx.lineTo(14, 8);
    ctx.closePath();
    ctx.fill();

    // Wide glowing scatter muzzle plate
    ctx.fillStyle = visorColor;
    ctx.fillRect(28, -10, 6, 20);

    // Muzzle brake ports
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(18, -6, 3, 12);
    ctx.fillRect(23, -7, 3, 14);
  }
  ctx.restore();

  // 4. Chassis & Armor Hull (by CharacterClass)
  ctx.save();
  if (charClass === 'phantom') {
    // Phantom: Swept-wing aerodynamic stealth hull
    ctx.shadowBlur = 14;
    ctx.shadowColor = primaryColor;

    // Outer stealth wing hull
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(-4, 0, 26, -Math.PI * 0.72, Math.PI * 0.72);
    ctx.lineTo(-24, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner dark stealth core
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();

    // Wing accent lines
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, -16);
    ctx.lineTo(4, -8);
    ctx.moveTo(-16, 16);
    ctx.lineTo(4, 8);
    ctx.stroke();
  } else if (charClass === 'tanker') {
    // Tanker: Heavy armored titan with left & right dual caterpillar tracks
    // Left & Right Track housings
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-24, -26, 44, 11);
    ctx.fillRect(-24, 15, 44, 11);

    // Track link treads
    ctx.fillStyle = '#475569';
    for (let tx = -22; tx <= 16; tx += 6) {
      ctx.fillRect(tx, -25, 4, 9);
      ctx.fillRect(tx, 16, 4, 9);
    }

    // Heavy square central armor hull
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(-20, -18, 40, 36, 7);
    ctx.fill();

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Heavy front armor ram plate
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(12, -14, 8, 28);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(12, -14, 8, 28);

    // Rivet accents
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-14, -13, 1.8, 0, Math.PI * 2);
    ctx.arc(-14, 13, 1.8, 0, Math.PI * 2);
    ctx.arc(6, -13, 1.8, 0, Math.PI * 2);
    ctx.arc(6, 13, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (charClass === 'ninja') {
    // Ninja: Twin katana stabilizers / aero fins + streamlined ellipse hull
    ctx.fillStyle = visorColor;
    // Rear katana diagonal stabilizers
    ctx.save();
    ctx.rotate(-Math.PI / 4);
    ctx.fillRect(-34, -3, 38, 5);
    ctx.restore();

    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-34, -2, 38, 5);
    ctx.restore();

    // Streamlined aerodynamic ellipse hull
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 23, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner dark cockpit
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Speed streaks
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(8, -5);
    ctx.moveTo(-10, 5);
    ctx.lineTo(8, 5);
    ctx.stroke();
  } else if (charClass === 'commando') {
    // Commando: Tactical circular chassis with heavy front bumper and armor plating
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 23, 0, Math.PI * 2);
    ctx.fill();

    // Reinforced front bumper
    ctx.fillStyle = '#475569';
    ctx.fillRect(15, -15, 7, 30);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(15, -15, 7, 30);

    // Tactical armor chest plate
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-12, -18, 24, 36);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -18, 24, 36);

    // Center combat hatch
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Mecha: Android robotic chassis with shoulder rocket battery pods
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shoulder rocket battery pods
    ctx.fillStyle = '#334155';
    ctx.fillRect(-16, -26, 16, 9);
    ctx.fillRect(-16, 17, 16, 9);

    // Missile tips / vents
    ctx.fillStyle = visorColor;
    ctx.fillRect(-2, -24, 4, 5);
    ctx.fillRect(-2, 19, 4, 5);

    // Center circular mecha reactor
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 5. Central Turret Dome & Directional Visor Eye
  ctx.save();
  // Central cupola ring
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(2, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = secondaryColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Directional Glowing Visor (Points forward +X)
  ctx.shadowBlur = 14;
  ctx.shadowColor = visorColor;
  ctx.fillStyle = visorColor;
  ctx.beginPath();
  ctx.arc(7, 0, 7.5, -Math.PI / 2, Math.PI / 2);
  ctx.fill();

  // Visor reflection highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(10, -2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Prominent Team Identification Ring & Badge (Arena match support)
  if (showTeamBadge && (team || teamPalette)) {
    ctx.save();
    const badgeColor = teamPalette ? teamPalette.primary : (team === 'red' ? '#e11d48' : '#0284c7');
    const ringColor = teamPalette ? teamPalette.visor : (team === 'red' ? '#fb7185' : '#38bdf8');
    
    // Team identification boundary circle with subtle glow
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ringColor;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();

    // Solid team insignia notch at the rear
    ctx.beginPath();
    ctx.arc(-18, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = badgeColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // 7. Headwear & Accessories
  if (accessory && accessory !== 'none') {
    ctx.save();
    if (accessory === 'crown') {
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f59e0b';
      ctx.fillText('👑', -2, -18);
    } else if (accessory === 'halo') {
      ctx.strokeStyle = '#fef08a';
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 28, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (accessory === 'horns') {
      ctx.fillStyle = '#dc2626';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-10, -18);
      ctx.lineTo(-6, -30);
      ctx.lineTo(-2, -18);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-10, 18);
      ctx.lineTo(-6, 30);
      ctx.lineTo(-2, 18);
      ctx.closePath();
      ctx.fill();
    } else if (accessory === 'cyber_goggles') {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0284c7';
      ctx.fillRect(4, -8, 8, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, -8, 8, 16);
    }
    ctx.restore();
  }

  ctx.restore();
};
