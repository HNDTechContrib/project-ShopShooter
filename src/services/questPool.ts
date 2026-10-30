/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyStreakReward, QuestTemplate, DailyQuest } from '../types/challenge';

export const STREAK_REWARDS: DailyStreakReward[] = [
  { day: 1, points: 50, bonusTitle: 'Voucher Pemula', bonusDetail: 'Potongan Rp 5.000', badge: 'DAY 1' },
  { day: 2, points: 75, bonusTitle: 'Voucher 10%', bonusDetail: 'Diskon Elektronik', badge: 'DAY 2' },
  { day: 3, points: 100, bonusTitle: 'Shield Matrix', bonusDetail: '+1 Item Perisai', badge: 'DAY 3' },
  { day: 4, points: 125, bonusTitle: 'Triple Shot 3x', bonusDetail: '+1 Power-Up Arena', badge: 'DAY 4' },
  { day: 5, points: 150, bonusTitle: 'Kupon Sultan 25%', bonusDetail: 'Diskon Semua Toko', badge: 'DAY 5' },
  { day: 6, points: 200, bonusTitle: 'Rapid Fire Pack', bonusDetail: '+2 Senjata Super', badge: 'DAY 6' },
  { day: 7, points: 350, bonusTitle: 'MEGA JACKPOT 50%', bonusDetail: 'Voucher Sultan Rp 35.000', badge: 'JACKPOT', isJackpot: true },
];

export const QUEST_POOL: QuestTemplate[] = [
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

export function generateDailyQuests(dateStr: string): DailyQuest[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const checkinQuest: DailyQuest = {
    id: `quest_login_${dateStr}`,
    templateId: 'tpl_login',
    title: 'Check-in Belanja Harian',
    description: 'Buka game & cek promosi diskon hari ini',
    targetCount: 1,
    currentCount: 1,
    rewardPoints: 50,
    isClaimed: false,
    icon: '📅',
    category: 'login',
    badgeLabel: 'HARIAN',
  };

  const poolCopy = [...QUEST_POOL];
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
