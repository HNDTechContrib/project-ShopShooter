import React from 'react';
import { DailyChallengeState, DailyStreakReward } from '../../types/challenge';
import { STREAK_REWARDS } from '../../services/questPool';
import { CheckCircle2, Award, Gift } from 'lucide-react';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../../data/mockData';

interface DailyStreakViewProps {
  state: DailyChallengeState;
  todayReward: DailyStreakReward;
  isDark: boolean;
  isClaiming: boolean;
  onClaimStreak: () => void;
}

export const DailyStreakView: React.FC<DailyStreakViewProps> = ({
  state,
  todayReward,
  isDark,
  isClaiming,
  onClaimStreak,
}) => {
  return (
    <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Kalender Login 7 Hari
          </h3>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Jangan lewatkan satu hari pun agar streak tidak ter-reset ke Hari 1!
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Nilai Hadiah Hari Ini (Hari ke-{state.streakDays})
          </span>
          <span className="text-sm font-black text-amber-500">
            +{todayReward.points} Poin (≈ {formatRupiah(todayReward.points * POINT_TO_RUPIAH_RATIO)})
          </span>
        </div>
      </div>

      {/* 7 Day Roadmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {STREAK_REWARDS.map((rew) => {
          const isPast = rew.day < state.streakDays;
          const isToday = rew.day === state.streakDays;
          const isClaimedToday = isToday && state.todayStreakClaimed;

          return (
            <div
              key={rew.day}
              className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between text-center border transition-all ${
                rew.isJackpot
                  ? isToday
                    ? isDark 
                      ? 'col-span-2 sm:col-span-1 bg-gradient-to-b from-amber-500/25 to-rose-600/30 border-amber-400 ring-2 ring-amber-400/50 shadow-lg' 
                      : 'col-span-2 sm:col-span-1 bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                    : isDark
                    ? 'col-span-2 sm:col-span-1 bg-slate-800/80 border-amber-500/40 text-amber-300'
                    : 'col-span-2 sm:col-span-1 bg-slate-100 border-amber-400 text-amber-800'
                  : isToday
                  ? isDark 
                    ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40 shadow-md' 
                    : 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                  : isPast || isClaimedToday
                  ? isDark 
                    ? 'bg-emerald-950/30 border-emerald-500/30 opacity-85' 
                    : 'bg-emerald-50 border-emerald-300 opacity-90'
                  : isDark
                  ? 'bg-slate-950/50 border-slate-800 opacity-60'
                  : 'bg-slate-100 border-slate-200 opacity-60'
              }`}
            >
              {/* Badge */}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 ${
                rew.isJackpot
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : isToday
                  ? 'bg-amber-500 text-slate-950'
                  : isPast
                  ? 'bg-emerald-500 text-slate-950'
                  : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
              }`}>
                {rew.badge}
              </span>

              {/* Icon / Symbol */}
              <div className="my-1.5">
                {isPast || isClaimedToday ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-slate-900" />
                  </div>
                ) : rew.isJackpot ? (
                  <div className="text-2xl animate-pulse">👑</div>
                ) : rew.day === 3 ? (
                  <div className="text-2xl">🛡️</div>
                ) : rew.day === 4 ? (
                  <div className="text-2xl">⚡</div>
                ) : (
                  <div className="text-2xl">🎁</div>
                )}
              </div>

              {/* Reward Amount */}
              <div className="w-full">
                <span className={`text-xs font-black block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  +{rew.points} Pts
                </span>
                <span className={`text-[9px] block line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {rew.bonusTitle}
                </span>
              </div>

              {/* Status Footer */}
              <div className="mt-2 text-[9px] font-bold">
                {isPast || isClaimedToday ? (
                  <span className="text-emerald-500 flex items-center justify-center gap-0.5">
                    <span>Selesai</span>
                  </span>
                ) : isToday ? (
                  <span className="text-amber-500 animate-pulse">Hari Ini!</span>
                ) : (
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Terkunci</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Claim Action Button */}
      <div className={`rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border ${
        isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Status Hadiah Login Hari Ini (Hari ke-{state.streakDays})
            </span>
            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {state.todayStreakClaimed
                ? `Sudah Mengklaim +${todayReward.points} Poin Hari Ini`
                : `Siap Diklaim: +${todayReward.points} Poin Diskon (${todayReward.bonusTitle})`}
            </span>
          </div>
        </div>

        {state.todayStreakClaimed ? (
          <div className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${
            isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Sudah Diklaim</span>
          </div>
        ) : (
          <button
            onClick={onClaimStreak}
            disabled={isClaiming}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4 fill-white" />
            <span>KLAIM SEKARANG (+{todayReward.points} POIN)</span>
          </button>
        )}
      </div>
    </div>
  );
};
