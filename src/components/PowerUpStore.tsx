import React from 'react';
import { PowerUpItem } from '../types';
import { Zap, ShoppingBag, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PowerUpStoreProps {
  userPoints: number;
  powerUpInventory: PowerUpItem[];
  onBuyPowerUp: (powerUpId: string, cost: number) => boolean;
  onNavigateToShooter: () => void;
  themeMode?: 'dark' | 'light';
}

export const PowerUpStore: React.FC<PowerUpStoreProps> = ({
  userPoints,
  powerUpInventory,
  onBuyPowerUp,
  onNavigateToShooter,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';
  const handleBuy = (item: PowerUpItem) => {
    const success = onBuyPowerUp(item.id, item.costPoints);
    if (success) {
      soundEngine.playPowerUp();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>Armory &amp; Perlengkapan Tembak</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Toko Power-Up Eksklusif
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-lg">
            Persiapkan dirimu untuk menghadapi target yang bergerak acak dan berkecepatan tinggi di Arena Shooter.
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 px-5 py-3.5 rounded-2xl flex items-center gap-4 shrink-0 shadow-inner">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
              Koin Poin Kamu
            </span>
            <span className="text-xl font-extrabold text-amber-400 font-mono-numbers">
              {userPoints} Pts
            </span>
          </div>
          <button
            onClick={onNavigateToShooter}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
          >
            <span>Arena Shooter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Power-Ups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {powerUpInventory.map((item) => {
          const canAfford = userPoints >= item.costPoints;

          return (
            <div
              key={item.id}
              className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-2xl p-6 transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-900'} flex items-center justify-center text-3xl shadow-inner`}>
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} block`}>Stok Tersedia</span>
                    <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} font-mono-numbers`}>
                      {item.count} Unit
                    </span>
                  </div>
                </div>

                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{item.name}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed mb-4`}>
                  {item.description}
                </p>

                <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <span>Durasi Efek: <strong>{item.durationSeconds} Detik</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Hotkey: <strong>[Tombol Angka]</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-medium">Harga Beli</span>
                  <span className="text-base font-extrabold text-amber-600 font-mono-numbers">
                    {item.costPoints} Poin
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={!canAfford}
                  className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    canAfford
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {canAfford ? 'Beli Power-Up (+1)' : 'Poin Kurang'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
