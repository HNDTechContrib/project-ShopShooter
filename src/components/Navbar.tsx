import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Target, 
  Swords, 
  Trophy, 
  Wrench, 
  Sun, 
  Moon, 
  Gift, 
  Menu, 
  ChevronDown, 
  Check 
} from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setUnclaimedCount(getUnclaimedRewardsSummary().unclaimedCount);
    };

    window.addEventListener('daily_challenge_updated', handleUpdate);
    return () => window.removeEventListener('daily_challenge_updated', handleUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      id: 'multiplayer' as const,
      label: 'Arena Multiplayer',
      sublabel: 'Pertempuran TDM 1v1 - 4v4',
      icon: Swords,
      color: 'text-cyan-400',
    },
    {
      id: 'shooter' as const,
      label: 'Latihan Target',
      sublabel: 'Asah Akurasi Tembakan',
      icon: Target,
      color: 'text-amber-400',
    },
    {
      id: 'powerups' as const,
      label: 'Armory & Hangar',
      sublabel: 'Toko Power-Up & Modifikasi',
      icon: Wrench,
      color: 'text-emerald-400',
    },
    {
      id: 'leaderboard' as const,
      label: 'Peringkat Ace',
      sublabel: 'Papan Peringkat Global',
      icon: Trophy,
      color: 'text-amber-500',
    },
  ];

  const activeItem = menuItems.find((item) => item.id === activeTab) || menuItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-slate-100 shadow-lg shadow-black/40' 
        : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3 md:gap-8">
        {/* Zone 1: Tank Arena Brand Wordmark + Game Menu Dropdown */}
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <button
            onClick={() => onSelectTab('multiplayer')}
            className="text-lg font-black tracking-tight whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-cyan-500/20 border border-cyan-400/30">
              <Swords className="w-5 h-5 fill-current" />
            </span>
            <div className="flex flex-col text-left">
              <span className={`text-base font-black tracking-wider uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                SHOPSHOOTER
              </span>
              <span className="text-[9.5px] font-extrabold tracking-widest uppercase text-cyan-500">
                SKY CLASH TDM
              </span>
            </div>
          </button>

          {/* Unified Menu Game Button */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all border shadow-sm ${
                isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 border-cyan-500/40 text-cyan-300 shadow-cyan-500/10' 
                  : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800 shadow-sm'
              }`}
            >
              <Menu className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Menu Game</span>
              <span className="sm:hidden">Menu</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Panel */}
            {isMenuOpen && (
              <div className={`absolute left-0 mt-2 w-72 md:w-80 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isDark ? 'bg-slate-900 border-slate-700 text-white shadow-black/80' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
              }`}>
                <div className="px-3 py-2 border-b border-slate-800/60 dark:border-slate-800 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 block">
                    Arena &amp; Fitur Utama
                  </span>
                  <span className="text-xs font-bold opacity-70">
                    Pilih mode permainan atau fasilitas hangar
                  </span>
                </div>

                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                          isActive 
                            ? (isDark ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300' : 'bg-cyan-50 border border-cyan-300 text-cyan-900 font-bold') 
                            : (isDark ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-slate-100 text-slate-700')
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-cyan-500/20 text-cyan-400' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{item.label}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.sublabel}</div>
                          </div>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

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
    </header>
  );
};
