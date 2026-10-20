/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DailyStreakReward {
  day: number;
  points: number;
  bonusTitle: string;
  bonusDetail: string;
  badge: string;
  isJackpot?: boolean;
}

export const STREAK_REWARDS: DailyStreakReward[] = [
  { day: 1, points: 50, bonusTitle: 'Voucher Pemula', bonusDetail: 'Potongan Rp 5.000', badge: 'DAY 1' },
  { day: 2, points: 75, bonusTitle: 'Voucher 10%', bonusDetail: 'Diskon Elektronik', badge: 'DAY 2' },
  { day: 3, points: 100, bonusTitle: 'Shield Matrix', bonusDetail: '+1 Item Perisai', badge: 'DAY 3' },
  { day: 4, points: 125, bonusTitle: 'Triple Shot 3x', bonusDetail: '+1 Power-Up Arena', badge: 'DAY 4' },
  { day: 5, points: 150, bonusTitle: 'Kupon Sultan 25%', bonusDetail: 'Diskon Semua Toko', badge: 'DAY 5' },
  { day: 6, points: 200, bonusTitle: 'Rapid Fire Pack', bonusDetail: '+2 Senjata Super', badge: 'DAY 6' },
  { day: 7, points: 350, bonusTitle: 'MEGA JACKPOT 50%', bonusDetail: 'Voucher Sultan Rp 35.000', badge: 'JACKPOT', isJackpot: true },
];

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardPoints: number;
  isClaimed: boolean;
  icon: string;
  type: 'login' | 'match' | 'kill' | 'score';
}

export interface DailyChallengeState {
  lastLoginDate: string; // YYYY-MM-DD
  streakDays: number;    // 1 - 7
  todayStreakClaimed: boolean;
  totalLoginDays: number;
  quests: DailyQuest[];
}

const STORAGE_KEY = 'diskon_blaster_daily_challenges_v1';

export const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'quest_login',
    title: 'Check-in Belanja Harian',
    description: 'Buka game & cek promosi diskon hari ini',
    targetCount: 1,
    currentCount: 1, // Automatically 1 on visiting
    rewardPoints: 50,
    isClaimed: false,
    icon: '📅',
    type: 'login',
  },
  {
    id: 'quest_match',
    title: 'Duel Arena Belanja',
    description: 'Mainkan 1 pertandingan di Arena Multiplayer atau vs Bot',
    targetCount: 1,
    currentCount: 0,
    rewardPoints: 75,
    isClaimed: false,
    icon: '⚔️',
    type: 'match',
  },
  {
    id: 'quest_kill',
    title: 'Diskon Hunter Jitu',
    description: 'Tembak dan eliminasi 3 musuh di Arena',
    targetCount: 3,
    currentCount: 0,
    rewardPoints: 100,
    isClaimed: false,
    icon: '🎯',
    type: 'kill',
  },
  {
    id: 'quest_score',
    title: 'Kolektor Poin Sultan',
    description: 'Kumpulkan total 200 poin diskon dari pertandingan',
    targetCount: 200,
    currentCount: 0,
    rewardPoints: 100,
    isClaimed: false,
    icon: '🛍️',
    type: 'score',
  },
];

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString(): string {
  const d = new Date(Date.now() - 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadDailyChallengeState(): DailyChallengeState {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyChallengeState = JSON.parse(raw);

      if (parsed.lastLoginDate === today) {
        // Same day, return current state
        return parsed;
      } else if (parsed.lastLoginDate === yesterday) {
        // Consecutive day! If user claimed yesterday, advance streak pointer or preserve
        const nextStreak = parsed.todayStreakClaimed
          ? (parsed.streakDays >= 7 ? 1 : parsed.streakDays + 1)
          : parsed.streakDays;

        const refreshed: DailyChallengeState = {
          lastLoginDate: today,
          streakDays: nextStreak,
          todayStreakClaimed: false,
          totalLoginDays: parsed.totalLoginDays + 1,
          quests: INITIAL_QUESTS.map((q) => ({ ...q, isClaimed: false, currentCount: q.type === 'login' ? 1 : 0 })),
        };
        saveDailyChallengeState(refreshed);
        return refreshed;
      } else {
        // Streak broken (missed more than 1 day) -> Reset streak to 1
        const refreshed: DailyChallengeState = {
          lastLoginDate: today,
          streakDays: 1,
          todayStreakClaimed: false,
          totalLoginDays: (parsed.totalLoginDays || 0) + 1,
          quests: INITIAL_QUESTS.map((q) => ({ ...q, isClaimed: false, currentCount: q.type === 'login' ? 1 : 0 })),
        };
        saveDailyChallengeState(refreshed);
        return refreshed;
      }
    }
  } catch (err) {
    console.warn('Error reading daily challenge state:', err);
  }

  // First time ever
  const initial: DailyChallengeState = {
    lastLoginDate: today,
    streakDays: 1,
    todayStreakClaimed: false,
    totalLoginDays: 1,
    quests: INITIAL_QUESTS.map((q) => ({ ...q })),
  };
  saveDailyChallengeState(initial);
  return initial;
}

export function saveDailyChallengeState(state: DailyChallengeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('daily_challenge_updated', { detail: state }));
  } catch (err) {
    console.warn('Error saving daily challenge state:', err);
  }
}

export function claimDailyStreakReward(): { reward: DailyStreakReward; nextStreak: number } | null {
  const state = loadDailyChallengeState();
  if (state.todayStreakClaimed) return null;

  const currentStreakDay = Math.min(7, Math.max(1, state.streakDays));
  const reward = STREAK_REWARDS.find((r) => r.day === currentStreakDay) || STREAK_REWARDS[0];

  state.todayStreakClaimed = true;
  saveDailyChallengeState(state);

  return {
    reward,
    nextStreak: currentStreakDay,
  };
}

export function incrementDailyQuestProgress(type: 'login' | 'match' | 'kill' | 'score', amount: number = 1) {
  const state = loadDailyChallengeState();
  let changed = false;

  state.quests = state.quests.map((q) => {
    if (q.type === type && !q.isClaimed) {
      const newCount = Math.min(q.targetCount, q.currentCount + amount);
      if (newCount !== q.currentCount) {
        changed = true;
        return { ...q, currentCount: newCount };
      }
    }
    return q;
  });

  if (changed) {
    saveDailyChallengeState(state);
  }
}

export function claimDailyQuestReward(questId: string): number | null {
  const state = loadDailyChallengeState();
  const quest = state.quests.find((q) => q.id === questId);

  if (!quest || quest.isClaimed || quest.currentCount < quest.targetCount) {
    return null;
  }

  quest.isClaimed = true;
  saveDailyChallengeState(state);
  return quest.rewardPoints;
}

export function hasUnclaimedDailyRewards(state?: DailyChallengeState): boolean {
  const current = state || loadDailyChallengeState();
  if (!current.todayStreakClaimed) return true;
  return current.quests.some((q) => !q.isClaimed && q.currentCount >= q.targetCount);
}

export function getSecondsUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
}

export function formatSecondsToCountdown(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
