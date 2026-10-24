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
          Hasil bidikan tembakan produk diskon kamu telah tersimpan.
        </p>

        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-xl p-4 mb-6 space-y-3`}>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Poin Berhasil Didapat:</span>
            <span className="font-extrabold text-emerald-500 font-mono-numbers text-lg">
              +{lastRoundStats.score} Poin
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nilai Potongan Belanja:</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatRupiah(lastRoundStats.score * POINT_TO_RUPIAH_RATIO)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Berhasil Ditembak:</span>
            <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{lastRoundStats.hits} Target</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Spesial Tertembak:</span>
            <span className="font-semibold text-amber-500">{lastRoundStats.specialHits} Emas</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Streak Combo Tertinggi:</span>
            <span className="font-semibold text-orange-500">{lastRoundStats.maxCombo}x Hit</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onNavigateToCart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Tukarkan di Keranjang Belanja ({formatRupiah(lastRoundStats.score * POINT_TO_RUPIAH_RATIO)})
          </button>

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Main Lagi untuk Tambah Poin
          </button>

          <button
            onClick={onNavigateToLeaderboard}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors"
          >
            <Award className="w-4 h-4" />
            Lihat Peringkat &amp; Hadiah
          </button>
        </div>
      </div>
    </div>
  );
};
