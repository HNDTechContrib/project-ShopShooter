import React from 'react';
import { ShoppingBag, Target } from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'multiplayer' | 'shooter' | 'leaderboard' | 'powerups' | 'cart';
  onSelectTab: (tab: 'catalog' | 'multiplayer' | 'shooter' | 'leaderboard' | 'powerups' | 'cart') => void;
  cartItemCount: number;
  userPoints: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  cartItemCount,
  userPoints,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onSelectTab('catalog')}
          className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            <Target className="w-4 h-4" />
          </span>
          <span>DiskonBlaster</span>
        </button>

        {/* Zone 2: 4 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'catalog' ? 'text-amber-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Katalog Belanja
          </button>

          <button
            onClick={() => onSelectTab('multiplayer')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'multiplayer' ? 'text-amber-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <span>Arena Multiplayer</span>
            <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.2 rounded animate-pulse">
              1V1 ROOM
            </span>
          </button>

          <button
            onClick={() => onSelectTab('shooter')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'shooter' ? 'text-amber-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <span>Latihan Target</span>
          </button>

          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'leaderboard' ? 'text-amber-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Papan Peringkat
          </button>

          <button
            onClick={() => onSelectTab('powerups')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'powerups' ? 'text-amber-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Armory
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Shopping Bag with live count & points) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('cart')}
            className="flex items-center gap-2.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Keranjang ({cartItemCount})</span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="text-amber-400 font-mono-numbers">{userPoints} Pts</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white px-2 py-2 text-xs font-semibold text-slate-600">
        <button
          onClick={() => onSelectTab('catalog')}
          className={`px-2 py-1 rounded ${activeTab === 'catalog' ? 'text-amber-600 font-bold' : ''}`}
        >
          Katalog
        </button>
        <button
          onClick={() => onSelectTab('multiplayer')}
          className={`px-2 py-1 rounded ${activeTab === 'multiplayer' ? 'text-amber-600 font-bold' : ''}`}
        >
          Arena 1v1
        </button>
        <button
          onClick={() => onSelectTab('shooter')}
          className={`px-2 py-1 rounded ${activeTab === 'shooter' ? 'text-amber-600 font-bold' : ''}`}
        >
          Target
        </button>
        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`px-2 py-1 rounded ${activeTab === 'leaderboard' ? 'text-amber-600 font-bold' : ''}`}
        >
          Peringkat
        </button>
        <button
          onClick={() => onSelectTab('cart')}
          className={`px-2 py-1 rounded ${activeTab === 'cart' ? 'text-amber-600 font-bold' : ''}`}
        >
          Keranjang
        </button>
      </div>
    </header>
  );
};
