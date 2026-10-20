/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gift, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Award, 
  ShoppingBag, 
  Zap, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { 
  DailyChallengeState, 
  STREAK_REWARDS, 
  loadDailyChallengeState, 
  claimDailyStreakReward, 
  claimDailyQuestReward, 
  getSecondsUntilMidnight, 
  formatSecondsToCountdown,
  DailyQuest
} from '../utils/dailyChallenge';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../data/mockData';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDiscountPoints: (points: number) => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  onAddDiscountPoints,
}) => {
  const [state, setState] = useState<DailyChallengeState>(loadDailyChallengeState);
  const [countdown, setCountdown] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'streak' | 'quests'>('streak');
  const [justClaimedReward, setJustClaimedReward] = useState<string | null>(null);

  // Refresh state on open and listen to background events
  useEffect(() => {
    if (isOpen) {
      setState(loadDailyChallengeState());
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DailyChallengeState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
      } else {
        setState(loadDailyChallengeState());
      }
    };

    window.addEventListener('daily_challenge_updated', handleUpdate);
    return () => window.removeEventListener('daily_challenge_updated', handleUpdate);
  }, [isOpen]);

  // Countdown timer to midnight
  useEffect(() => {
    const updateTime = () => {
      const sec = getSecondsUntilMidnight();
      setCountdown(formatSecondsToCountdown(sec));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const currentStreakIndex = Math.min(6, Math.max(0, state.streakDays - 1));
  const todayReward = STREAK_REWARDS[currentStreakIndex];

  const handleClaimStreak = () => {
    const res = claimDailyStreakReward();
    if (!res) return;

    soundEngine.playCheckoutSuccess();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#facc15', '#fb923c', '#38bdf8', '#4ade80'],
    });

    onAddDiscountPoints(res.reward.points);
    setJustClaimedReward(`+${res.reward.points} Poin Diskon (${res.reward.bonusTitle})`);
    setState(loadDailyChallengeState());

    setTimeout(() => {
      setJustClaimedReward(null);
    }, 4500);
  };

  const handleClaimQuest = (quest: DailyQuest) => {
    const points = claimDailyQuestReward(quest.id);
    if (!points) return;

    soundEngine.playPowerUp();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#facc15', '#ec4899'],
    });

    onAddDiscountPoints(points);
    setJustClaimedReward(`Misi Selesai: +${points} Poin Diskon!`);
    setState(loadDailyChallengeState());

    setTimeout(() => {
      setJustClaimedReward(null);
    }, 4000);
  };

  const unclaimedQuestsCount = state.quests.filter(q => !q.isClaimed && q.currentCount >= q.targetCount).length;
  const streakClaimReady = !state.todayStreakClaimed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 overflow-hidden shrink-0">
          <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
            <Gift className="w-56 h-56 text-white" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg shrink-0">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Tantangan &amp; Hadiah Harian
                  </h2>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3 fill-slate-950" />
                    <span>Streak {state.streakDays} Hari</span>
                  </span>
                </div>
                <p className="text-xs text-orange-100 font-medium mt-0.5">
                  Login setiap hari untuk kumpulkan poin belanja &amp; raih Voucher Diskon hingga 50%!
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl bg-black/20 hover:bg-black/40 transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reset Timer Strip */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between text-xs font-semibold text-orange-100 gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Total Login: <strong className="text-white font-bold">{state.totalLoginDays} Hari</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/25 px-2.5 py-1 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Reset Harian: <strong className="text-amber-300">{countdown}</strong></span>
            </div>
          </div>
        </div>

        {/* Floating Success Toast inside Modal */}
        {justClaimedReward && (
          <div className="bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2 flex items-center justify-center gap-2 animate-bounce shadow-md">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>BERHASIL DIKLAIM: {justClaimedReward}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('streak')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'streak'
                ? 'text-amber-400 border-b-2 border-amber-500 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Absensi 7 Hari (Streak)</span>
            {streakClaimReady && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'quests'
                ? 'text-amber-400 border-b-2 border-amber-500 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Misi Harian Hari Ini</span>
            {unclaimedQuestsCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {unclaimedQuestsCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: 7-Day Streak Calendar */}
        {activeTab === 'streak' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Kalender Login 7 Hari
                </h3>
                <p className="text-[11px] text-slate-400">
                  Jangan lewatkan satu hari pun agar streak tidak ter-reset ke Hari 1!
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Nilai Hadiah Hari Ini</span>
                <span className="text-sm font-black text-amber-400">
                  +{todayReward.points} Poin (≈ {formatRupiah(todayReward.points * POINT_TO_RUPIAH_RATIO)})
                </span>
              </div>
            </div>

            {/* 7 Day Roadmap Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {STREAK_REWARDS.map((rew) => {
                const isPast = rew.day < state.streakDays;
                const isToday = rew.day === state.streakDays;
                const isFuture = rew.day > state.streakDays;
                const isClaimedToday = isToday && state.todayStreakClaimed;

                return (
                  <div
                    key={rew.day}
                    className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between text-center border transition-all ${
                      rew.isJackpot
                        ? isToday
                          ? 'col-span-2 sm:col-span-1 bg-gradient-to-b from-amber-500/25 to-rose-600/30 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                          : 'col-span-2 sm:col-span-1 bg-slate-800/80 border-amber-500/40 text-amber-300'
                        : isToday
                        ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                        : isPast || isClaimedToday
                        ? 'bg-emerald-950/30 border-emerald-500/30 opacity-85'
                        : 'bg-slate-950/50 border-slate-800 opacity-60'
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
                        : 'bg-slate-800 text-slate-400'
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
                      <span className="text-xs font-black text-white block">
                        +{rew.points} Pts
                      </span>
                      <span className="text-[9px] text-slate-400 block line-clamp-1">
                        {rew.bonusTitle}
                      </span>
                    </div>

                    {/* Status Footer */}
                    <div className="mt-2 text-[9px] font-bold">
                      {isPast || isClaimedToday ? (
                        <span className="text-emerald-400 flex items-center justify-center gap-0.5">
                          <span>Selesai</span>
                        </span>
                      ) : isToday ? (
                        <span className="text-amber-400 animate-pulse">Hari Ini!</span>
                      ) : (
                        <span className="text-slate-500">Terkunci</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary Claim Action Button */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Status Hadiah Login Hari Ini (Hari ke-{state.streakDays})
                  </span>
                  <span className="text-sm font-black text-white">
                    {state.todayStreakClaimed
                      ? `Sudah Mengklaim +${todayReward.points} Poin Hari Ini`
                      : `Siap Diklaim: +${todayReward.points} Poin Diskon (${todayReward.bonusTitle})`}
                  </span>
                </div>
              </div>

              {state.todayStreakClaimed ? (
                <div className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sudah Diklaim</span>
                </div>
              ) : (
                <button
                  onClick={handleClaimStreak}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4 fill-white" />
                  <span>KLAIM SEKARANG (+{todayReward.points} POIN)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Daily Quests */}
        {activeTab === 'quests' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Tantangan Harian Hari Ini
                </h3>
                <p className="text-[11px] text-slate-400">
                  Selesaikan misi cepat di bawah untuk dapatkan bonus poin tambahan setiap hari!
                </p>
              </div>
              <div className="text-xs font-bold text-amber-400 font-mono">
                Total: +{state.quests.reduce((acc, q) => acc + q.rewardPoints, 0)} Poin
              </div>
            </div>

            <div className="space-y-2.5">
              {state.quests.map((quest) => {
                const isReadyToClaim = !quest.isClaimed && quest.currentCount >= quest.targetCount;
                const percent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                      quest.isClaimed
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : isReadyToClaim
                        ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                        {quest.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {quest.title}
                          </h4>
                          <span className="text-[10px] font-black text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded">
                            +{quest.rewardPoints} Pts
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {quest.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                isReadyToClaim || quest.isClaimed ? 'bg-emerald-400' : 'bg-amber-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                            {quest.currentCount}/{quest.targetCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="w-full sm:w-auto shrink-0 flex justify-end">
                      {quest.isClaimed ? (
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Selesai</span>
                        </span>
                      ) : isReadyToClaim ? (
                        <button
                          onClick={() => handleClaimQuest(quest)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <Gift className="w-3.5 h-3.5 fill-slate-950" />
                          <span>KLAIM (+{quest.rewardPoints})</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <span>Sedang Berjalan</span>
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Poin harian dapat ditukar langsung jadi potongan belanja di Keranjang (1 Poin = Rp 100).</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
