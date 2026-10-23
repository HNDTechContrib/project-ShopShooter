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

export type QuestCategory = 'login' | 'match' | 'win' | 'kill' | 'score' | 'shooter' | 'target_hit';

export interface QuestTemplate {
  templateId: string;
  title: string;
  description: string;
  targetCount: number;
  rewardPoints: number;
  icon: string;
  category: QuestCategory;
  badgeLabel?: string;
}

export interface DailyQuest {
  id: string;
  templateId: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardPoints: number;
  isClaimed: boolean;
  icon: string;
  category: QuestCategory;
  badgeLabel?: string;
}

export interface DailyChallengeState {
  lastLoginDate: string; // YYYY-MM-DD
  streakDays: number;    // 1 - 7
  todayStreakClaimed: boolean;
  totalLoginDays: number;
  quests: DailyQuest[];
}

export interface UnclaimedRewardSummary {
  streakRewardClaimable: boolean;
  streakDay: number;
  streakReward: DailyStreakReward;
  unclaimedQuests: DailyQuest[];
  unclaimedCount: number;
  totalClaimablePoints: number;
}

const STORAGE_KEY = 'diskon_blaster_daily_challenges_v2';
export const USER_POINTS_KEY = 'diskon_blaster_user_points';

// Comprehensive pool of varied quests for daily rotation
const QUEST_POOL: QuestTemplate[] = [
  {
    templateId: 'tpl_match_1',
    title: 'Duel Arena Belanja',
    description: 'Selesaikan 1 pertandingan di Arena TDM (vs Bot atau Multiplayer)',
    targetCount: 1,
    rewardPoints: 75,
    icon: '⚔️',
    category: 'match',
    badgeLabel: 'ARENA',
  },
  {
    templateId: 'tpl_match_2',
    title: 'Tempur Taktis Bertubi',
    description: 'Selesaikan 2 pertempuran TDM hingga tuntas',
    targetCount: 2,
    rewardPoints: 125,
    icon: '🛡️',
    category: 'match',
    badgeLabel: 'TDM',
  },
  {
    templateId: 'tpl_win_1',
    title: 'Supremasi Kemenangan',
    description: 'Bawa tim kamu meraih kemenangan pada pertandingan Arena TDM',
    targetCount: 1,
    rewardPoints: 100,
    icon: '🏆',
    category: 'win',
    badgeLabel: 'VICTORY',
  },
  {
    templateId: 'tpl_kill_3',
    title: 'Diskon Hunter Jitu',
    description: 'Tembak dan eliminasi 3 musuh di Arena TDM',
    targetCount: 3,
    rewardPoints: 100,
    icon: '🎯',
    category: 'kill',
    badgeLabel: 'COMBAT',
  },
  {
    templateId: 'tpl_kill_5',
    title: 'Pembasmi Tank Musuh',
    description: 'Eliminasi total 5 tank musuh di Arena pertempuran',
    targetCount: 5,
    rewardPoints: 150,
    icon: '💥',
    category: 'kill',
    badgeLabel: 'ASSAULT',
  },
  {
    templateId: 'tpl_score_200',
    title: 'Kolektor Skor Tempur',
    description: 'Kumpulkan total 200 skor dari eliminasi dan pertempuran',
    targetCount: 200,
    rewardPoints: 80,
    icon: '⭐',
    category: 'score',
    badgeLabel: 'SCORE',
  },
  {
    templateId: 'tpl_score_400',
    title: 'Sultan Poin Pertempuran',
    description: 'Kumpulkan total 400 skor tempur dari pertandingan',
    targetCount: 400,
    rewardPoints: 140,
    icon: '🛍️',
    category: 'score',
    badgeLabel: 'SCORE',
  },
  {
    templateId: 'tpl_shooter_1',
    title: 'Sesi Latihan Tembak',
    description: 'Selesaikan 1 sesi latihan tembak di Latihan Target',
    targetCount: 1,
    rewardPoints: 75,
    icon: '🎪',
    category: 'shooter',
    badgeLabel: 'TARGET',
  },
  {
    templateId: 'tpl_target_15',
    title: 'Penembak Jitu Target',
    description: 'Tembak jatuh 15 target diskon pada mode Latihan',
    targetCount: 15,
    rewardPoints: 90,
    icon: '🎖️',
    category: 'target_hit',
    badgeLabel: 'PRECISION',
  },
];

export function getLocalTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  try {
    const [y1, m1, d1] = fromDateStr.split('-').map(Number);
    const [y2, m2, d2] = toDateStr.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffTime = date2.getTime() - date1.getTime();
    return Math.round(diffTime / (1000 * 3600 * 24));
  } catch {
    return 0;
  }
}

// Generate daily quests deterministically based on date string
export function generateDailyQuests(dateStr: string): DailyQuest[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  // 1. Guaranteed daily login check-in quest
  const checkinQuest: DailyQuest = {
    id: `quest_login_${dateStr}`,
    templateId: 'tpl_login',
    title: 'Check-in Belanja Harian',
    description: 'Buka game & cek promosi diskon hari ini',
    targetCount: 1,
    currentCount: 1, // Auto-completed when visiting on this day
    rewardPoints: 50,
    isClaimed: false,
    icon: '📅',
    category: 'login',
    badgeLabel: 'HARIAN',
  };

  // 2. Deterministically select 3 distinct quests from the pool with no duplicate categories
  const poolCopy = [...QUEST_POOL];
  // Deterministic shuffle
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = (seed + i * 17) % (i + 1);
    const temp = poolCopy[i];
    poolCopy[i] = poolCopy[j];
    poolCopy[j] = temp;
  }

  const selectedTemplates: QuestTemplate[] = [];
  const usedCategories = new Set<string>();

  for (const tpl of poolCopy) {
    if (!usedCategories.has(tpl.category)) {
      selectedTemplates.push(tpl);
      usedCategories.add(tpl.category);
      if (selectedTemplates.length >= 3) break;
    }
  }

  // Fallback if needed to reach 3
  if (selectedTemplates.length < 3) {
    for (const tpl of poolCopy) {
      if (!selectedTemplates.some((st) => st.templateId === tpl.templateId)) {
        selectedTemplates.push(tpl);
        if (selectedTemplates.length >= 3) break;
      }
    }
  }

  const selectedQuests: DailyQuest[] = selectedTemplates.map((tpl, idx) => ({
    id: `quest_${tpl.templateId}_${dateStr}_${idx}`,
    templateId: tpl.templateId,
    title: tpl.title,
    description: tpl.description,
    targetCount: tpl.targetCount,
    currentCount: 0,
    rewardPoints: tpl.rewardPoints,
    isClaimed: false,
    icon: tpl.icon,
    category: tpl.category,
    badgeLabel: tpl.badgeLabel,
  }));

  return [checkinQuest, ...selectedQuests];
}

export function loadDailyChallengeState(): DailyChallengeState {
  const today = getLocalTodayString();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyChallengeState = JSON.parse(raw);
      const diff = getDaysDifference(parsed.lastLoginDate, today);

      if (diff === 0) {
        // Same day: preserve all state and ensure check-in is at least 1/1
        let updated = false;
        parsed.quests = parsed.quests.map((q) => {
          if (q.category === 'login' && q.currentCount < q.targetCount) {
            updated = true;
            return { ...q, currentCount: q.targetCount };
          }
          return q;
        });
        if (updated) saveDailyChallengeState(parsed);
        return parsed;
      } else if (diff === 1) {
        // Consecutive day: advance streak if yesterday was claimed
        const nextStreak = parsed.todayStreakClaimed
          ? (parsed.streakDays >= 7 ? 1 : parsed.streakDays + 1)
          : parsed.streakDays;

        const refreshed: DailyChallengeState = {
          lastLoginDate: today,
          streakDays: Math.min(7, Math.max(1, nextStreak)),
          todayStreakClaimed: false,
          totalLoginDays: (parsed.totalLoginDays || 0) + 1,
          quests: generateDailyQuests(today),
        };
        saveDailyChallengeState(refreshed);
        return refreshed;
      } else if (diff > 1) {
        // Streak broken: reset to Day 1
        const refreshed: DailyChallengeState = {
          lastLoginDate: today,
          streakDays: 1,
          todayStreakClaimed: false,
          totalLoginDays: (parsed.totalLoginDays || 0) + 1,
          quests: generateDailyQuests(today),
        };
        saveDailyChallengeState(refreshed);
        return refreshed;
      } else {
        // Clock skew backwards: return as-is
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading daily challenge state:', err);
  }

  // First time initialization
  const initial: DailyChallengeState = {
    lastLoginDate: today,
    streakDays: 1,
    todayStreakClaimed: false,
    totalLoginDays: 1,
    quests: generateDailyQuests(today),
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

export function getUnclaimedRewardsSummary(customState?: DailyChallengeState): UnclaimedRewardSummary {
  const state = customState || loadDailyChallengeState();
  const currentStreakDay = Math.min(7, Math.max(1, state.streakDays));
  const streakReward = STREAK_REWARDS.find((r) => r.day === currentStreakDay) || STREAK_REWARDS[0];
  const streakRewardClaimable = !state.todayStreakClaimed;

  const unclaimedQuests = state.quests.filter(
    (q) => !q.isClaimed && q.currentCount >= q.targetCount
  );

  const questPoints = unclaimedQuests.reduce((sum, q) => sum + q.rewardPoints, 0);
  const streakPoints = streakRewardClaimable ? streakReward.points : 0;

  return {
    streakRewardClaimable,
    streakDay: currentStreakDay,
    streakReward,
    unclaimedQuests,
    unclaimedCount: (streakRewardClaimable ? 1 : 0) + unclaimedQuests.length,
    totalClaimablePoints: streakPoints + questPoints,
  };
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

export function claimAllUnclaimedRewards(): {
  totalPoints: number;
  claimedStreak: boolean;
  claimedQuestsCount: number;
  streakReward?: DailyStreakReward;
} | null {
  const state = loadDailyChallengeState();
  let totalPoints = 0;
  let claimedStreak = false;
  let streakReward: DailyStreakReward | undefined;

  // 1. Claim streak if available
  if (!state.todayStreakClaimed) {
    const currentStreakDay = Math.min(7, Math.max(1, state.streakDays));
    streakReward = STREAK_REWARDS.find((r) => r.day === currentStreakDay) || STREAK_REWARDS[0];
    state.todayStreakClaimed = true;
    totalPoints += streakReward.points;
    claimedStreak = true;
  }

  // 2. Claim all eligible quests
  let claimedQuestsCount = 0;
  state.quests = state.quests.map((q) => {
    if (!q.isClaimed && q.currentCount >= q.targetCount) {
      q.isClaimed = true;
      totalPoints += q.rewardPoints;
      claimedQuestsCount++;
    }
    return q;
  });

  if (totalPoints > 0) {
    saveDailyChallengeState(state);
    return {
      totalPoints,
      claimedStreak,
      claimedQuestsCount,
      streakReward,
    };
  }

  return null;
}

export function incrementDailyQuestProgress(
  category: QuestCategory,
  amount: number = 1
): boolean {
  if (amount <= 0) return false;
  const state = loadDailyChallengeState();
  let changed = false;

  state.quests = state.quests.map((q) => {
    if (q.category === category && !q.isClaimed) {
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
  return changed;
}

export function hasUnclaimedDailyRewards(customState?: DailyChallengeState): boolean {
  const summary = getUnclaimedRewardsSummary(customState);
  return summary.unclaimedCount > 0;
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
