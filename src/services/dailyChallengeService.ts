/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DailyStreakReward,
  QuestCategory,
  DailyChallengeState,
  UnclaimedRewardSummary,
} from '../types/challenge';
import { STREAK_REWARDS, generateDailyQuests } from './questPool';
import { getLocalTodayString, getDaysDifference } from '../utils/dateUtils';

const STORAGE_KEY = 'diskon_blaster_daily_challenges_v2';
export const USER_POINTS_KEY = 'diskon_blaster_user_points';

export function loadDailyChallengeState(): DailyChallengeState {
  const today = getLocalTodayString();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyChallengeState = JSON.parse(raw);
      const diff = getDaysDifference(parsed.lastLoginDate, today);

      if (diff === 0) {
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
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading daily challenge state:', err);
  }

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

  if (!state.todayStreakClaimed) {
    const currentStreakDay = Math.min(7, Math.max(1, state.streakDays));
    streakReward = STREAK_REWARDS.find((r) => r.day === currentStreakDay) || STREAK_REWARDS[0];
    state.todayStreakClaimed = true;
    totalPoints += streakReward.points;
    claimedStreak = true;
  }

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
