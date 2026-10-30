import React from 'react';
import { TeamId } from '../../../types';

interface KillFeedItem {
  id: string;
  text: string;
  team: TeamId;
}

interface ArenaKillFeedOverlayProps {
  killFeed: KillFeedItem[];
}

export const ArenaKillFeedOverlay: React.FC<ArenaKillFeedOverlayProps> = ({ killFeed }) => {
  return (
    <div className="absolute top-[138px] sm:top-[158px] md:top-[178px] left-3 z-30 flex flex-col gap-1.5 pointer-events-none max-w-[200px] md:max-w-xs">
      {killFeed.map((kf) => (
        <div
          key={kf.id}
          className={`text-[10px] md:text-[11px] font-bold px-2 py-0.5 md:py-1 rounded-md border backdrop-blur-md animate-in slide-in-from-left-2 ${
            kf.team === 'blue'
              ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500/50'
              : 'bg-rose-950/80 text-rose-200 border-rose-500/50'
          }`}
        >
          {kf.text}
        </div>
      ))}
    </div>
  );
};
