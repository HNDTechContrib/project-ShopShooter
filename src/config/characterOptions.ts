import { CharacterClass, AccessoryType, WeaponSkin } from '../types';

export const CLASS_OPTIONS: {
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

export const COLOR_PALETTES = [
  { name: 'Cyber Cyan', hex: '#06b6d4', glow: '#38bdf8' },
  { name: 'Plasma Rose', hex: '#f43f5e', glow: '#fb7185' },
  { name: 'Gold Champion', hex: '#f59e0b', glow: '#fcd34d' },
  { name: 'Toxic Emerald', hex: '#10b981', glow: '#34d399' },
  { name: 'Void Violet', hex: '#8b5cf6', glow: '#c084fc' },
  { name: 'Solar Orange', hex: '#ea580c', glow: '#fb923c' },
  { name: 'Titanium White', hex: '#e2e8f0', glow: '#f8fafc' },
];

export const WEAPON_OPTIONS: { id: WeaponSkin; name: string; icon: string; desc: string }[] = [
  { id: 'dual_blaster', name: 'Dual Plasma Blaster', icon: '⚡', desc: 'Laras ganda presisi tinggi' },
  { id: 'laser_cannon', name: 'Heavy Laser Cannon', icon: '💥', desc: 'Moncong meriam berenergi padat' },
  { id: 'plasma_rifle', name: 'Pulse Assault Rifle', icon: '🎯', desc: 'Senapan laras panjang modern' },
  { id: 'pulse_shotgun', name: 'Vortex Shotgun', icon: '🚀', desc: 'Laras lebar penyebar proyektil' },
];

export const ACCESSORY_OPTIONS: { id: AccessoryType; name: string; icon: string }[] = [
  { id: 'none', name: 'Polos (Tanpa Hiasan)', icon: '🚫' },
  { id: 'crown', name: 'Mahkota Juara E-Commerce', icon: '👑' },
  { id: 'halo', name: 'Halo Malaikat Cyber', icon: '😇' },
  { id: 'horns', name: 'Tanduk Robotik Mecha', icon: '😈' },
  { id: 'cyber_goggles', name: 'Kacamata Taktis Neon', icon: '🕶️' },
];
