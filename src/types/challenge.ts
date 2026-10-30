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
