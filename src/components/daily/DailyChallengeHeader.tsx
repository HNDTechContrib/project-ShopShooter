import React from 'react';
import { Gift, Flame, X, Calendar, Clock } from 'lucide-react';

interface DailyChallengeHeaderProps {
  streakDays: number;
  totalLoginDays: number;
  countdown: string;
  onClose: () => void;
}

export const DailyChallengeHeader: React.FC<DailyChallengeHeaderProps> = ({
  streakDays,
  totalLoginDays,
  countdown,
  onClose,
}) => {
  return (
    <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 overflow-hidden shrink-0 text-white">
      <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
        <Gift className="w-56 h-56 text-white" />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg shrink-0">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Tantangan &amp; Hadiah Harian
              </h2>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Flame className="w-3 h-3 fill-slate-950" />
                <span>Streak {streakDays} Hari</span>
              </span>
            </div>
            <p className="text-xs text-orange-100 font-medium mt-0.5">
              Login &amp; selesaikan tantangan untuk raih diskon belanja hingga 50%!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1.5 rounded-xl bg-black/20 hover:bg-black/40 transition-colors shrink-0"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Reset Timer Strip */}
      <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between text-xs font-semibold text-orange-100 gap-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span>Total Login: <strong className="text-white font-bold">{totalLoginDays} Hari</strong></span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/25 px-2.5 py-1 rounded-lg border border-white/10">
          <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Reset Harian: <strong className="text-amber-300">{countdown}</strong></span>
        </div>
      </div>
    </div>
  );
};
