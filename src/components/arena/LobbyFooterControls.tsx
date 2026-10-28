import React from 'react';
import { Trophy, Smartphone, Monitor, Target } from 'lucide-react';

interface LobbyFooterControlsProps {
  isDark: boolean;
}

export const LobbyFooterControls: React.FC<LobbyFooterControlsProps> = ({ isDark }) => {
  return (
    <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-400 ${
      isDark ? 'border-slate-800' : 'border-slate-200'
    }`}>
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="font-black text-slate-300 dark:text-white uppercase tracking-wider text-xs">ShopShooter</span>
        <span className="text-[11px] text-slate-500">Fight • Upgrade • Win</span>
      </div>

      <div className="hidden md:block h-4 w-px bg-slate-800" />

      {/* Middle 1: Mobile */}
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-cyan-400" />
        <div className="text-left leading-tight">
          <span className="block text-[10px] uppercase font-bold text-slate-300 dark:text-slate-200">Kontrol Mobile</span>
          <span className="block text-[10px] text-slate-500">Virtual Joystick</span>
        </div>
      </div>

      {/* Middle 2: Desktop */}
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-indigo-400" />
        <div className="text-left leading-tight">
          <span className="block text-[10px] uppercase font-bold text-slate-300 dark:text-slate-200">Kontrol Desktop</span>
          <span className="block text-[10px] text-slate-500">Keyboard &amp; Mouse</span>
        </div>
      </div>

      {/* Right: Callout */}
      <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs ml-auto sm:ml-0">
        <Target className="w-4 h-4" />
        <span>Bermain Bersama Lebih Seru!</span>
      </div>
    </div>
  );
};
