import React, { useRef, useEffect } from 'react';
import { CharacterCustomization, CharacterClass, AccessoryType, WeaponSkin } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Sparkles, 
  Shield, 
  Crosshair, 
  Zap, 
  Crown, 
  X, 
  Check, 
  RotateCw,
  Palette,
  Eye,
  Wrench
} from 'lucide-react';

interface CharacterCustomizerModalProps {
  customization: CharacterCustomization;
  onChange: (customization: CharacterCustomization) => void;
  onClose: () => void;
}

const CLASS_OPTIONS: {
  id: CharacterClass;
  name: string;
  role: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: 'phantom',
    name: 'Quantum Phantom',
    role: 'Kecepatan Seimbang',
    desc: 'Phantom: Karakter lincah dengan kecepatan seimbang.',
    icon: '🔮',
  },
  {
    id: 'ninja',
    name: 'Cyber Shinobi',
    role: 'Sangat Lincah',
    desc: 'Ninja: Pergerakan dan kecepatan lari sangat lincah.',
    icon: '🥷',
  },
  {
    id: 'tanker',
    name: 'Heavy Titan',
    role: 'HP 200 & Tahan Serangan',
    desc: 'Tanker: Memiliki HP maksimal sangat tinggi (200 HP) dan pengurangan damage yang diterima (tahan serangan berat) dan damage yang rendah.',
    icon: '🛡️',
  },
  {
    id: 'commando',
    name: 'Tactical Commando',
    role: 'Damage Tinggi',
    desc: 'Commando: Kekuatan tembakan dan damage lebih tinggi tetapi HP yang rendah.',
    icon: '🎖️',
  },
  {
    id: 'mecha',
    name: 'Mecha Android',
    role: 'Armor Kuat & 150 HP',
    desc: 'Mecha: Memiliki armor kuat dan 150 HP.',
    icon: '🤖',
  },
];

const COLOR_PALETTES = [
  { name: 'Cyber Cyan', hex: '#06b6d4', glow: '#38bdf8' },
  { name: 'Plasma Rose', hex: '#f43f5e', glow: '#fb7185' },
  { name: 'Gold Champion', hex: '#f59e0b', glow: '#fcd34d' },
  { name: 'Toxic Emerald', hex: '#10b981', glow: '#34d399' },
  { name: 'Void Violet', hex: '#8b5cf6', glow: '#c084fc' },
  { name: 'Solar Orange', hex: '#ea580c', glow: '#fb923c' },
  { name: 'Titanium White', hex: '#e2e8f0', glow: '#f8fafc' },
];

const WEAPON_OPTIONS: { id: WeaponSkin; name: string; icon: string; desc: string }[] = [
  { id: 'dual_blaster', name: 'Dual Plasma Blaster', icon: '⚡', desc: 'Laras ganda presisi tinggi' },
  { id: 'laser_cannon', name: 'Heavy Laser Cannon', icon: '💥', desc: 'Moncong meriam berenergi padat' },
  { id: 'plasma_rifle', name: 'Pulse Assault Rifle', icon: '🎯', desc: 'Senapan laras panjang modern' },
  { id: 'pulse_shotgun', name: 'Vortex Shotgun', icon: '🚀', desc: 'Laras lebar penyebar proyektil' },
];

const ACCESSORY_OPTIONS: { id: AccessoryType; name: string; icon: string }[] = [
  { id: 'none', name: 'Polos (Tanpa Hiasan)', icon: '🚫' },
  { id: 'crown', name: 'Mahkota Juara E-Commerce', icon: '👑' },
  { id: 'halo', name: 'Halo Malaikat Cyber', icon: '😇' },
  { id: 'horns', name: 'Tanduk Robotik Mecha', icon: '😈' },
  { id: 'cyber_goggles', name: 'Kacamata Taktis Neon', icon: '🕶️' },
];

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  customization,
  onChange,
  onClose,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationAngleRef = useRef<number>(0);

  // Render live preview on canvas
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
        // shotgun
        ctx.fillRect(10, -8, 20, 16);
        ctx.fillStyle = customization.visorColor;
        ctx.fillRect(26, -9, 8, 18);
      }
      ctx.restore();

      // Class-specific body details
      if (customization.characterClass === 'phantom') {
        // Hooded Cloak
        ctx.shadowBlur = 20;
        ctx.shadowColor = customization.primaryColor;
        ctx.fillStyle = customization.primaryColor;
        ctx.beginPath();
        ctx.arc(-4, 0, 26, -Math.PI * 0.7, Math.PI * 0.7);
        ctx.lineTo(-24, 0);
        ctx.closePath();
        ctx.fill();

        // Cloak Fold
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (customization.characterClass === 'tanker') {
        // Heavy Armor Pauldrons
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
        // Sleek aerodynamic chassis + Energy Katana on back
        ctx.fillStyle = customization.visorColor;
        ctx.save();
        ctx.rotate(-Math.PI / 4);
        ctx.fillRect(-34, -3, 38, 5); // Katana blade
        ctx.restore();

        ctx.fillStyle = customization.primaryColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (customization.characterClass === 'commando') {
        // Tactical vest
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
        // Mecha Android
        ctx.fillStyle = customization.primaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Dual Antennae
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
    <div className="fixed inset-0 z-50 bg-white/75 backdrop-blur-md flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-3xl w-full p-4 md:p-6 shadow-2xl text-slate-900 relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Palette className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                Kustomisasi Karakter Avatar
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Live 360°
                </span>
              </h3>
              <p className="text-xs text-slate-600">
                Ubah tipe karakter, armor, warna neon, dan senjata sesukamu!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Left 360° Preview + Right Customization Options */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: 360 Live Preview & Summary */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="relative w-48 h-48 mb-3 flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                width={192}
                height={192}
                className="w-48 h-48 rounded-xl block"
              />
              <div className="absolute bottom-2 flex items-center gap-1 text-[10px] font-mono text-slate-600 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200">
                <RotateCw className="w-3 h-3 text-amber-600 animate-spin" />
                <span>360° Auto-Rotate</span>
              </div>
            </div>

            <div className="text-center w-full">
              <h4 className="text-sm font-black text-amber-700 flex items-center justify-center gap-1.5 mb-1">
                <span>{CLASS_OPTIONS.find((c) => c.id === customization.characterClass)?.name}</span>
              </h4>
              <p className="text-[11px] text-slate-600 mb-3 px-2">
                {CLASS_OPTIONS.find((c) => c.id === customization.characterClass)?.desc}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2.5 rounded-xl border border-slate-200 text-left">
                <div>
                  <span className="text-slate-500 block">Laras Senjata:</span>
                  <span className="font-bold text-slate-800">
                    {WEAPON_OPTIONS.find((w) => w.id === customization.weaponSkin)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Aksesoris:</span>
                  <span className="font-bold text-slate-800">
                    {ACCESSORY_OPTIONS.find((a) => a.id === customization.accessory)?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Customization Controls */}
          <div className="md:col-span-7 space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {/* 1. Pilih Kelas Karakter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                1. Pilih Tipe / Kelas Karakter:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CLASS_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundEngine.playPowerUp();
                      onChange({ ...customization, characterClass: c.id });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      customization.characterClass === c.id
                        ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-600 truncate">{c.role}</div>
                    </div>
                    {customization.characterClass === c.id && (
                      <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Warna Tema Armor */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-700" />
                2. Warna Utama Armor:
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.hex}
                    onClick={() => {
                      soundEngine.playShoot();
                      onChange({
                        ...customization,
                        primaryColor: pal.hex,
                        visorColor: pal.glow,
                      });
                    }}
                    className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      customization.primaryColor === pal.hex
                        ? 'border-white scale-105 shadow-lg'
                        : 'border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: `${pal.hex}22`, borderColor: customization.primaryColor === pal.hex ? pal.glow : undefined }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/50"
                      style={{ backgroundColor: pal.hex }}
                    />
                    <span className="text-slate-800">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Skin Senjata / Laras */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-rose-600" />
                3. Tipe Senjata / Laras Blaster:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WEAPON_OPTIONS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      soundEngine.playShoot();
                      onChange({ ...customization, weaponSkin: w.id });
                    }}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      customization.weaponSkin === w.id
                        ? 'border-rose-400 bg-rose-500/15'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{w.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-slate-900 truncate">{w.name}</div>
                      <div className="text-[9px] text-slate-600 truncate">{w.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Aksesoris / Topi */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                4. Aksesoris Kepala / Topi:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACCESSORY_OPTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      soundEngine.playPowerUp();
                      onChange({ ...customization, accessory: a.id });
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      customization.accessory === a.id
                        ? 'border-amber-400 bg-amber-500/15'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{a.icon}</div>
                    <div className="text-[10px] font-semibold text-slate-800 line-clamp-1">{a.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Terapkan Karakter Ini &amp; Mainkan
          </button>
        </div>
      </div>
    </div>
  );
};
