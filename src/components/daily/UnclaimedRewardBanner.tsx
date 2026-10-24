import React from 'react';
import { Coins, CheckCheck, CheckCircle2 } from 'lucide-react';
import { UnclaimedRewardSummary } from '../../types/challenge';

interface UnclaimedRewardBannerProps {
  summary: UnclaimedRewardSummary;
  totalUnclaimed: number;
  streakClaimReady: boolean;
  unclaimedQuestsCount: number;
  isClaiming: boolean;
  isDark: boolean;
  onClaimAll: () => void;
}

export const UnclaimedRewardBanner: React.FC<UnclaimedRewardBannerProps> = ({
  summary,
  totalUnclaimed,
  streakClaimReady,
  unclaimedQuestsCount,
  isClaiming,
  isDark,
  onClaimAll,
}) => {
  if (totalUnclaimed > 0) {
    return (
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
        isDark 
          ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/50 border-emerald-500/30' 
          : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <span className={`text-xs font-black block ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
              {totalUnclaimed} Hadiah Siap Diambil (+{summary.totalClaimablePoints} Poin)!
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {streakClaimReady && unclaimedQuestsCount > 0
                ? `1 Hadiah Login + ${unclaimedQuestsCount} Misi Harian selesai`
                : streakClaimReady
                ? '1 Hadiah Login Hari Ini siap diklaim'
                : `${unclaimedQuestsCount} Misi Harian selesai siap diklaim`}
            </span>
          </div>
        </div>

        <button
          onClick={onClaimAll}
          disabled={isClaiming}
          className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <CheckCheck className="w-4 h-4" />
          <span>KLAIM SEMUA ({summary.totalClaimablePoints} PTS)</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`px-4 sm:px-6 py-2 border-b flex items-center justify-between text-xs shrink-0 ${
      isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
    }`}>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[11px]">Semua hadiah yang memenuhi syarat telah diambil untuk saat ini.</span>
      </div>
      <span className="text-[10px] font-mono opacity-80">Siap tempur!</span>
    </div>
  );
};
