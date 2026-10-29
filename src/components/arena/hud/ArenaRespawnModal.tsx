import React from 'react';
import { Skull, Zap } from 'lucide-react';

interface ArenaRespawnModalProps {
  respawnTimer: number;
  onInstantRespawn: () => void;
}

export const ArenaRespawnModal: React.FC<ArenaRespawnModalProps> = ({
  respawnTimer,
  onInstantRespawn,
}) => {
  if (respawnTimer <= 0) return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950 border-2 border-rose-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Skull className="w-9 h-9 text-rose-400" />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white mb-1">
          KAMU TERELIMINASI!
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Mempersiapkan respawn kembali ke markas tim...
        </p>

        {/* Progress Countdown Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 mb-4 overflow-hidden border border-slate-700">
          <div
            className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-100 ease-linear"
            style={{ width: `${Math.max(0, 100 - (respawnTimer / 3.5) * 100)}%` }}
          />
        </div>

        <div className="text-3xl font-black font-mono-numbers text-amber-400 mb-5">
          {respawnTimer.toFixed(1)}s
        </div>

        {/* Instant Respawn Button */}
        <button
          onClick={onInstantRespawn}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-white" />
          ⚡ Respawn Sekarang (Instan)
        </button>
      </div>
    </div>
  );
};
