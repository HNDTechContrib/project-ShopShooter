import React from 'react';
import { DailyQuest } from '../../types/challenge';
import { CheckCircle2, ChevronRight, Gift } from 'lucide-react';

interface DailyQuestItemProps {
  quest: DailyQuest;
  isDark: boolean;
  isClaiming: boolean;
  onClaim: (quest: DailyQuest) => void;
}

export const DailyQuestItem: React.FC<DailyQuestItemProps> = ({
  quest,
  isDark,
  isClaiming,
  onClaim,
}) => {
  const isReadyToClaim = !quest.isClaimed && quest.currentCount >= quest.targetCount;
  const percent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
        quest.isClaimed
          ? isDark ? 'bg-slate-950/40 border-slate-800 opacity-60' : 'bg-slate-100 border-slate-200 opacity-65'
          : isReadyToClaim
          ? isDark 
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30' 
            : 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
          : isDark ? 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-2xl p-2 rounded-xl border shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {quest.icon}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {quest.title}
            </h4>
            {quest.badgeLabel && (
              <span className="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                {quest.badgeLabel}
              </span>
            )}
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
              isDark 
                ? 'text-amber-400 bg-amber-950/60 border border-amber-800/40' 
                : 'text-amber-800 bg-amber-100 border border-amber-300'
            }`}>
              +{quest.rewardPoints} Pts
            </span>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {quest.description}
          </p>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
              isDark ? 'bg-slate-800' : 'bg-slate-200'
            }`}>
              <div 
                className={`h-full transition-all duration-500 ${
                  isReadyToClaim || quest.isClaimed ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono font-bold shrink-0 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {quest.currentCount}/{quest.targetCount}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full sm:w-auto shrink-0 flex justify-end">
        {quest.isClaimed ? (
          <span className={`text-xs font-bold flex items-center gap-1 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sudah Diklaim</span>
          </span>
        ) : isReadyToClaim ? (
          <button
            onClick={() => onClaim(quest)}
            disabled={isClaiming}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 animate-pulse"
          >
            <Gift className="w-3.5 h-3.5 fill-slate-950" />
            <span>KLAIM (+{quest.rewardPoints})</span>
          </button>
        ) : (
          <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 border ${
            isDark ? 'text-slate-400 bg-slate-900 border-slate-800' : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}>
            <span>Sedang Berjalan</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </span>
        )}
      </div>
    </div>
  );
};
