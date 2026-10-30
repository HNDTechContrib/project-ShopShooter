import React from 'react';
import { CharacterCustomization } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  Sparkles, 
  Crosshair, 
  Crown, 
  X, 
  Check, 
  RotateCw,
  Palette
} from 'lucide-react';
import { CLASS_OPTIONS, COLOR_PALETTES, WEAPON_OPTIONS, ACCESSORY_OPTIONS } from '../config/characterOptions';
import { TankPreviewCanvas } from './customizer/TankPreviewCanvas';

interface CharacterCustomizerModalProps {
  customization: CharacterCustomization;
  onChange: (customization: CharacterCustomization) => void;
  onClose: () => void;
}

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  customization,
  onChange,
  onClose,
}) => {
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
              <TankPreviewCanvas customization={customization} />
              <div className="absolute bottom-2 flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700">
                <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />
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
              <div className="flex overflow-x-auto gap-2 pb-2 snap-x">
                {CLASS_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundEngine.playPowerUp();
                      onChange({ ...customization, characterClass: c.id });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 min-w-[160px] snap-start ${
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
              <div className="flex overflow-x-auto gap-2 pb-2 snap-x">
                {WEAPON_OPTIONS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      soundEngine.playShoot();
                      onChange({ ...customization, weaponSkin: w.id });
                    }}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 min-w-[140px] snap-start ${
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
              <div className="flex overflow-x-auto gap-2 pb-2 snap-x">
                {ACCESSORY_OPTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      soundEngine.playPowerUp();
                      onChange({ ...customization, accessory: a.id });
                    }}
                    className={`p-2 rounded-xl border text-center transition-all min-w-[80px] snap-start ${
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
