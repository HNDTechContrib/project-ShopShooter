import React from 'react';
import { PowerUpItem, PowerUpType } from '../../types';

interface ShooterPowerUpInventoryProps {
  powerUpInventory: PowerUpItem[];
  isPlaying: boolean;
  isDark: boolean;
  onUsePowerUp: (id: PowerUpType) => void;
}

export const ShooterPowerUpInventory: React.FC<ShooterPowerUpInventoryProps> = ({
  powerUpInventory,
  isPlaying,
  isDark,
  onUsePowerUp,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {powerUpInventory.map((item, idx) => {
        const hotkey = idx + 1;
        const hasStock = item.count > 0;

        return (
          <button
            key={item.id}
            disabled={!isPlaying || !hasStock}
            onClick={() => onUsePowerUp(item.id)}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
              hasStock && isPlaying
                ? isDark 
                  ? 'border-slate-700 bg-slate-950 hover:border-amber-500 text-white shadow-md' 
                  : 'border-slate-300 bg-slate-50 hover:border-amber-500 text-slate-900 shadow-sm'
                : isDark ? 'border-slate-800 bg-slate-950/60 text-slate-600 opacity-60 cursor-not-allowed' : 'border-slate-200 bg-slate-100/60 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'} px-1.5 py-0.5 rounded font-mono font-bold`}>
                  [{hotkey}]
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    hasStock ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  x{item.count}
                </span>
              </div>
            </div>

            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{item.name}</span>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-tight mb-2 line-clamp-2`}>
              {item.description}
            </p>

            <div className={`mt-auto pt-2 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} flex items-center justify-between text-[11px]`}>
              <span>Durasi: {item.durationSeconds}s</span>
              <span className="font-semibold text-amber-500">{hasStock ? 'Siap Pakai' : 'Habis'}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
