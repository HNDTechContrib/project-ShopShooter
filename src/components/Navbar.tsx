import React, { useState, useEffect } from 'react';
import { Shield, Target, Swords, Trophy, Wrench, Sun, Moon, Gift } from 'lucide-react';
import { getUnclaimedRewardsSummary } from '../utils/dailyChallenge';

interface NavbarProps {
  activeTab: 'multiplayer' | 'shooter' | 'leaderboard' | 'powerups';
  onSelectTab: (tab: 'multiplayer' | 'shooter' | 'leaderboard' | 'powerups') => void;
  userPoints: number;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  userPoints,
  themeMode,
  onToggleTheme,
}) => {
  const isDark = themeMode === 'dark';
  const [unclaimedCount, setUnclaimedCount] = useState<number>(() => {
    return getUnclaimedRewardsSummary().unclaimedCount;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setUnclaimedCount(getUnclaimedRewardsSummary().unclaimedCount);
    };

    window.addEventListener('daily_challenge_updated', handleUpdate);
    return () => window.removeEventListener('daily_challenge_updated', handleUpdate);
  }, []);

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-slate-100 shadow-lg shadow-black/40' 
        : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Tank Arena Brand Wordmark */}
        <button
          onClick={() => onSelectTab('multiplayer')}
          className="text-lg font-black tracking-tight whitespace-nowrap shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-cyan-500/20 border border-cyan-400/30">
            <Shield className="w-5 h-5 fill-current" />
          </span>
          <div className="flex flex-col text-left">
            <span className={`text-base font-black tracking-wider uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              TANK ARENA
            </span>
            <span className="text-[9.5px] font-extrabold tracking-widest uppercase text-cyan-500">
              SKY CLASH TDM
            </span>
          </div>
        </button>

        {/* Zone 2: Pure Game Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-xs lg:text-sm font-bold">
          <button
            onClick={() => onSelectTab('multiplayer')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'multiplayer' 
                ? (isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300')
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Swords className="w-4 h-4 text-cyan-400" />
            <span>Arena Multiplayer</span>
            <span className="text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
              1v1 - 4v4
            </span>
          </button>

          <button
            onClick={() => onSelectTab('shooter')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'shooter' 
                ? (isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300')
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>Latihan Target</span>
          </button>

          <button
            onClick={() => onSelectTab('powerups')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'powerups' 
                ? (isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300')
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>Armory & Hangar</span>
          </button>

          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'leaderboard' 
                ? (isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border border-cyan-300')
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Peringkat Ace</span>
          </button>
        </nav>

        {/* Zone 3: Dark/White Switcher + Daily Rewards + Combat XP */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-slate-700 hover:border-indigo-400/50' 
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
            }`}
            title={isDark ? 'Ganti ke Tema Light (Terang)' : 'Ganti ke Tema Dark (Gelap)'}
          >
            {isDark ? (
              <>
                <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/30" />
                <span className="hidden sm:inline font-mono text-[11px]">DARK</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/30" />
                <span className="hidden sm:inline font-mono text-[11px]">LIGHT</span>
              </>
            )}
          </button>

          {/* Daily Gift Button with Unclaimed Badge */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open_daily_challenge'))}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
            title="Hadiah Harian & Bonus Login"
          >
            <Gift className="w-4 h-4 fill-slate-950" />
            <span className="hidden sm:inline">Bonus</span>
            {unclaimedCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-md animate-bounce flex items-center justify-center">
                {unclaimedCount}
              </span>
            )}
          </button>

          {/* Combat Points Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl border text-xs font-black font-mono-numbers shrink-0 ${
            isDark 
              ? 'bg-slate-900 border-slate-700 text-cyan-300' 
              : 'bg-slate-100 border-slate-300 text-slate-900'
          }`}>
            <span className="text-amber-400">⚡</span>
            <span>{userPoints}</span>
            <span className="text-[10px] opacity-70 font-sans">XP</span>
          </div>
        </div>
      </div>

      {/* Mobile subnav bar */}
      <div className={`md:hidden flex items-center justify-around border-t px-2 py-2 text-xs font-bold ${
        isDark ? 'border-slate-800 bg-slate-950/95 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <button
          onClick={() => onSelectTab('multiplayer')}
          className={`px-2 py-1 rounded flex items-center gap-1 ${activeTab === 'multiplayer' ? 'text-cyan-500 font-black' : ''}`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Arena</span>
        </button>
        <button
          onClick={() => onSelectTab('shooter')}
          className={`px-2 py-1 rounded flex items-center gap-1 ${activeTab === 'shooter' ? 'text-cyan-500 font-black' : ''}`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Latihan</span>
        </button>
        <button
          onClick={() => onSelectTab('powerups')}
          className={`px-2 py-1 rounded flex items-center gap-1 ${activeTab === 'powerups' ? 'text-cyan-500 font-black' : ''}`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Hangar</span>
        </button>
        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`px-2 py-1 rounded flex items-center gap-1 ${activeTab === 'leaderboard' ? 'text-cyan-500 font-black' : ''}`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Peringkat</span>
        </button>
      </div>
    </header>
  );
};
