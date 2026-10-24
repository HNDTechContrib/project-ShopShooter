import React from 'react';
import { DailyQuest } from '../../types/challenge';
import { DailyQuestItem } from './DailyQuestItem';

interface DailyQuestsTabProps {
  quests: DailyQuest[];
  isDark: boolean;
  isClaiming: boolean;
  onClaimQuest: (quest: DailyQuest) => void;
}

export const DailyQuestsTab: React.FC<DailyQuestsTabProps> = ({
  quests,
  isDark,
  isClaiming,
  onClaimQuest,
}) => {
  return (
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
          Total: +{quests.reduce((acc, q) => acc + q.rewardPoints, 0)} Poin
        </div>
      </div>

      <div className="space-y-2.5">
        {quests.map((quest) => (
          <DailyQuestItem
            key={quest.id}
            quest={quest}
            isDark={isDark}
            isClaiming={isClaiming}
            onClaim={onClaimQuest}
          />
        ))}
      </div>
    </div>
  );
};
