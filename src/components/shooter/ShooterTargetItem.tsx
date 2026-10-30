import React from 'react';
import { ShooterTarget } from '../../types';

interface ShooterTargetItemProps {
  target: ShooterTarget;
}

export const ShooterTargetItem: React.FC<ShooterTargetItemProps> = ({ target }) => {
  const isSpecial = target.type === 'special_gold';
  const isBomb = target.type === 'bomb';
  const isPowerup = target.type === 'powerup_orb';
  const isSpeedy = target.type === 'speedy';

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 cursor-pointer group"
      style={{
        left: `${target.x}%`,
        top: `${target.y}%`,
        width: `${target.size}px`,
        height: `${target.size}px`,
      }}
    >
      <div
        className={`relative w-full h-full rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all ${
          isSpecial
            ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-yellow-200 animate-siren-pulse shadow-yellow-500/50'
            : isBomb
            ? 'bg-gradient-to-tr from-red-600 to-rose-900 border-2 border-red-400 animate-pulse shadow-red-500/40'
            : isPowerup
            ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 border-2 border-emerald-300 shadow-emerald-500/40'
            : isSpeedy
            ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-300 shadow-purple-500/40'
            : 'bg-slate-800/90 border border-blue-400/50 hover:border-blue-400 shadow-blue-500/20'
        }`}
      >
        {target.maxHp > 1 && (
          <div className="absolute -top-3 w-12 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-emerald-400 transition-all duration-150"
              style={{ width: `${(target.hp / target.maxHp) * 100}%` }}
            />
          </div>
        )}

        {isSpecial ? (
          <div className="text-center">
            <span className="text-2xl block animate-bounce">👑</span>
            <span className="text-[10px] font-black text-slate-950 uppercase tracking-tighter">
              +{target.points}
            </span>
          </div>
        ) : isBomb ? (
          <div className="text-center">
            <span className="text-2xl block animate-bounce">💣</span>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
              {target.points}
            </span>
          </div>
        ) : isPowerup ? (
          <div className="text-center">
            <span className="text-2xl block animate-pulse">⚡</span>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
              BUFF
            </span>
          </div>
        ) : isSpeedy ? (
          <div className="text-center">
            <span className="text-2xl block">🚀</span>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
              +{target.points}
            </span>
          </div>
        ) : (
          <div className="text-center p-1">
            <span className="text-xl block">🏷️</span>
            <span className="text-[10px] font-black text-sky-300 uppercase tracking-tighter truncate block max-w-[50px]">
              +{target.points}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
