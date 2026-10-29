import React from 'react';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../../data/mockData';
import { Sparkles, ShoppingBag, RotateCcw, Award } from 'lucide-react';

interface ShooterSummaryModalProps {
  show: boolean;
  isDark: boolean;
  lastRoundStats: {
    score: number;
    hits: number;
    specialHits: number;
    maxCombo: number;
  };
  onNavigateToCart: () => void;
  onRestart: () => void;
  onNavigateToLeaderboard: () => void;
}

export const ShooterSummaryModal: React.FC<ShooterSummaryModalProps> = ({
  show,
  isDark,
  lastRoundStats,
  onNavigateToCart,
  onRestart,
  onNavigateToLeaderboard,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl max-w-md w-full p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-200`}>
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
          <Sparkles className="w-7 h-7" />
        </div>

        <h3 className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
          Ronde Selesai!
        </h3>
        <p className={`text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
          Hasil bidikan target kamu telah berhasil tersimpan.
        </p>

        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-xl p-4 mb-6 space-y-3`}>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Poin Diperoleh:</span>
            <span className="font-extrabold text-emerald-500 font-mono-numbers text-lg">
              +{lastRoundStats.score} Poin
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Tertembak:</span>
            <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{lastRoundStats.hits} Target</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Spesial:</span>
            <span className="font-semibold text-amber-500">{lastRoundStats.specialHits} Emas</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kombo Tertinggi:</span>
            <span className="font-semibold text-orange-500">{lastRoundStats.maxCombo}x Hit</span>
          </div>
          <p className={`text-[11px] pt-1 border-t ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            Poin berhasil ditambahkan ke saldo akunmu.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            Main Lagi
          </button>

          <button
            onClick={onNavigateToCart}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs transition-colors border ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            Lihat Penukaran Poin
          </button>

          <button
            onClick={onNavigateToLeaderboard}
            className={`w-full pt-1.5 pb-1 text-xs font-medium transition-colors hover:underline ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Cek Papan Peringkat Mingguan
          </button>
        </div>
      </div>
    </div>
  );
};
