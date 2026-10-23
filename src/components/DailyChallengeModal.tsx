/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCheck,
  ChevronRight,
  ShieldAlert,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { 
  DailyChallengeState, 
  STREAK_REWARDS, 
  DailyQuest,
  loadDailyChallengeState, 
  claimDailyStreakReward, 
  claimDailyQuestReward, 
  claimAllUnclaimedRewards,
  getUnclaimedRewardsSummary,
  getSecondsUntilMidnight, 
  formatSecondsToCountdown,
  UnclaimedRewardSummary
} from '../utils/dailyChallenge';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../data/mockData';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDiscountPoints: (points: number) => void;
  themeMode?: 'dark' | 'light';
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  onAddDiscountPoints,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';
  const [state, setState] = useState<DailyChallengeState>(loadDailyChallengeState);
  const [summary, setSummary] = useState<UnclaimedRewardSummary>(() => getUnclaimedRewardsSummary());
  const [countdown, setCountdown] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'streak' | 'quests'>('streak');
  const [justClaimedReward, setJustClaimedReward] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  // Sync state and summary whenever modal opens or background events fire
  const refreshData = useCallback(() => {
    const s = loadDailyChallengeState();
    setState(s);
    setSummary(getUnclaimedRewardsSummary(s));
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DailyChallengeState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
        setSummary(getUnclaimedRewardsSummary(customEvent.detail));
      } else {
        refreshData();
      }
    };

    window.addEventListener('daily_challenge_updated', handleUpdate);
    return () => window.removeEventListener('daily_challenge_updated', handleUpdate);
  }, [isOpen, refreshData]);

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

  // Claim Daily Streak
  const handleClaimStreak = () => {
    if (isClaiming || state.todayStreakClaimed) return;
    setIsClaiming(true);

    try {
      const res = claimDailyStreakReward();
      if (!res) return;

      soundEngine.playCheckoutSuccess();
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#facc15', '#fb923c', '#38bdf8', '#4ade80'],
      });

      onAddDiscountPoints(res.reward.points);
      setJustClaimedReward(`+${res.reward.points} Poin Diskon (${res.reward.bonusTitle})`);
      refreshData();

      setTimeout(() => {
        setJustClaimedReward(null);
      }, 4000);
    } finally {
      setIsClaiming(false);
    }
  };

  // Claim Individual Quest
  const handleClaimQuest = (quest: DailyQuest) => {
    if (isClaiming || quest.isClaimed || quest.currentCount < quest.targetCount) return;
    setIsClaiming(true);

    try {
      const points = claimDailyQuestReward(quest.id);
      if (!points) return;

      soundEngine.playPowerUp();
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#facc15', '#ec4899'],
      });

      onAddDiscountPoints(points);
      setJustClaimedReward(`Misi "${quest.title}" Selesai: +${points} Poin Diskon!`);
      refreshData();

      setTimeout(() => {
        setJustClaimedReward(null);
      }, 4000);
    } finally {
      setIsClaiming(false);
    }
  };

  // Claim All Unclaimed Rewards in One Click
  const handleClaimAll = () => {
    if (isClaiming || summary.unclaimedCount === 0) return;
    setIsClaiming(true);

    try {
      const res = claimAllUnclaimedRewards();
      if (!res || res.totalPoints <= 0) return;

      soundEngine.playCheckoutSuccess();
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#facc15', '#38bdf8', '#4ade80', '#ec4899', '#f97316'],
      });

      onAddDiscountPoints(res.totalPoints);

      const streakTxt = res.claimedStreak ? 'Absensi Harian' : '';
      const questTxt = res.claimedQuestsCount > 0 ? `${res.claimedQuestsCount} Misi Harian` : '';
      const combinedTxt = [streakTxt, questTxt].filter(Boolean).join(' & ');

      setJustClaimedReward(`KLAIM SEMUA BERHASIL: +${res.totalPoints} Poin (${combinedTxt})!`);
      refreshData();

      setTimeout(() => {
        setJustClaimedReward(null);
      }, 4500);
    } finally {
      setIsClaiming(false);
    }
  };

  const unclaimedQuestsCount = summary.unclaimedQuests.length;
  const streakClaimReady = summary.streakRewardClaimable;
  const totalUnclaimed = summary.unclaimedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border transition-colors ${
          isDark 
            ? 'bg-slate-900 border-slate-700/80 text-slate-100' 
            : 'bg-white border-slate-300 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
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
                    <span>Streak {state.streakDays} Hari</span>
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
              <span>Total Login: <strong className="text-white font-bold">{state.totalLoginDays} Hari</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/25 px-2.5 py-1 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Reset Harian: <strong className="text-amber-300">{countdown}</strong></span>
            </div>
          </div>
        </div>

        {/* Floating Success Notification inside Modal */}
        {justClaimedReward && (
          <div className="bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2.5 flex items-center justify-center gap-2 animate-bounce shadow-md shrink-0">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{justClaimedReward}</span>
          </div>
        )}

        {/* Unclaimed Rewards Banner & Klaim Semua Button */}
        {totalUnclaimed > 0 ? (
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
              onClick={handleClaimAll}
              disabled={isClaiming}
              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <CheckCheck className="w-4 h-4" />
              <span>KLAIM SEMUA ({summary.totalClaimablePoints} PTS)</span>
            </button>
          </div>
        ) : (
          <div className={`px-4 sm:px-6 py-2 border-b flex items-center justify-between text-xs shrink-0 ${
            isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px]">Semua hadiah yang memenuhi syarat telah diambil untuk saat ini.</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">Siap tempur!</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className={`flex border-b px-4 pt-2 gap-2 shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-100/70'
        }`}>
          <button
            onClick={() => setActiveTab('streak')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'streak'
                ? 'text-amber-500 border-b-2 border-amber-500 font-black'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
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
                ? 'text-amber-500 border-b-2 border-amber-500 font-black'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Tantangan Harian</span>
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
                const isFuture = rew.day > state.streakDays;
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
                  onClick={handleClaimStreak}
                  disabled={isClaiming}
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
                <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Tantangan Harian Hari Ini
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Selesaikan misi pertempuran di bawah untuk dapatkan bonus poin belanja setiap hari!
                </p>
              </div>
              <div className="text-xs font-bold text-amber-500 font-mono">
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
                          onClick={() => handleClaimQuest(quest)}
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
              })}
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className={`p-3 border-t text-[11px] flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Poin harian dapat ditukar langsung jadi diskon belanja di Hangar &amp; Armory (1 Poin = Rp 100).</span>
          </div>
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
