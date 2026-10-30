/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Sparkles, ShoppingBag, Zap } from 'lucide-react';
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
import { UnclaimedRewardBanner } from './daily/UnclaimedRewardBanner';
import { DailyChallengeHeader } from './daily/DailyChallengeHeader';
import { DailyStreakView } from './daily/DailyStreakView';
import { DailyQuestsTab } from './daily/DailyQuestsTab';

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

      setTimeout(() => setJustClaimedReward(null), 4000);
    } finally {
      setIsClaiming(false);
    }
  };

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

      setTimeout(() => setJustClaimedReward(null), 4000);
    } finally {
      setIsClaiming(false);
    }
  };

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

      setTimeout(() => setJustClaimedReward(null), 4500);
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
        <DailyChallengeHeader
          streakDays={state.streakDays}
          totalLoginDays={state.totalLoginDays}
          countdown={countdown}
          onClose={onClose}
        />

        {/* Floating Success Notification */}
        {justClaimedReward && (
          <div className="bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2.5 flex items-center justify-center gap-2 animate-bounce shadow-md shrink-0">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{justClaimedReward}</span>
          </div>
        )}

        {/* Unclaimed Rewards Banner */}
        <UnclaimedRewardBanner
          summary={summary}
          totalUnclaimed={totalUnclaimed}
          streakClaimReady={streakClaimReady}
          unclaimedQuestsCount={unclaimedQuestsCount}
          isClaiming={isClaiming}
          isDark={isDark}
          onClaimAll={handleClaimAll}
        />

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
          <DailyStreakView
            state={state}
            todayReward={todayReward}
            isDark={isDark}
            isClaiming={isClaiming}
            onClaimStreak={handleClaimStreak}
          />
        )}

        {/* Tab 2: Daily Quests */}
        {activeTab === 'quests' && (
          <DailyQuestsTab
            quests={state.quests}
            isDark={isDark}
            isClaiming={isClaiming}
            onClaimQuest={handleClaimQuest}
          />
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
