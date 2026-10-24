import React from 'react';
import { ShooterTarget, FloatingHitText } from '../../types';
import { Sparkles, Flame, Zap } from 'lucide-react';
import { ShooterWelcomeScreen } from './ShooterWelcomeScreen';
import { ShooterTargetItem } from './ShooterTargetItem';

interface ShooterCanvasProps {
  arenaRef: React.RefObject<HTMLDivElement | null>;
  isDark: boolean;
  screenShake: boolean;
  mousePos: { x: number; y: number };
  isPlaying: boolean;
  isPaused: boolean;
  activeFreezeTime: number;
  activeMultishotTime: number;
  activeDoubleTime: number;
  targets: ShooterTarget[];
  floatingTexts: FloatingHitText[];
  onArenaClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onStartGame: () => void;
  onResumeGame: () => void;
}

export const ShooterCanvas: React.FC<ShooterCanvasProps> = ({
  arenaRef,
  isDark,
  screenShake,
  mousePos,
  isPlaying,
  isPaused,
  activeFreezeTime,
  activeMultishotTime,
  activeDoubleTime,
  targets,
  floatingTexts,
  onArenaClick,
  onMouseMove,
  onStartGame,
  onResumeGame,
}) => {
  return (
    <div
      ref={arenaRef}
      onClick={onArenaClick}
      onMouseMove={onMouseMove}
      className={`relative w-full h-[520px] md:h-[600px] ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-300'} rounded-2xl overflow-hidden border-2 select-none cursor-crosshair-custom shadow-2xl transition-transform ${
        screenShake ? 'translate-x-1.5 -translate-y-1.5' : ''
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(245, 158, 11, 0.08) 0%, transparent 45%),
          linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      }}
    >
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        {activeFreezeTime > 0 && (
          <div className="flex items-center gap-2 bg-sky-950/80 border border-sky-400/60 px-3 py-1 rounded-lg text-sky-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Matrix Slow-Mo ({activeFreezeTime}s)</span>
          </div>
        )}
        {activeMultishotTime > 0 && (
          <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-400/60 px-3 py-1 rounded-lg text-amber-300 text-xs font-semibold backdrop-blur-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Cluster Area Blast ({activeMultishotTime}s)</span>
          </div>
        )}
        {activeDoubleTime > 0 && (
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-400/60 px-3 py-1 rounded-lg text-emerald-300 text-xs font-semibold backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Pengali 2X Aktif ({activeDoubleTime}s)</span>
          </div>
        )}
      </div>

      {isPlaying && !isPaused && (
        <div
          className="pointer-events-none absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/40 flex items-center justify-center transition-all duration-75"
          style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}
        >
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
          <div className="absolute w-full h-[1px] bg-amber-400/20" />
          <div className="absolute h-full w-[1px] bg-amber-400/20" />
        </div>
      )}

      {!isPlaying && (
        <ShooterWelcomeScreen isDark={isDark} onStartGame={onStartGame} />
      )}

      {isPlaying && isPaused && (
        <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center">
          <h3 className="text-2xl font-bold text-white mb-4">Permainan Dijeda</h3>
          <button
            onClick={onResumeGame}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl"
          >
            Lanjutkan Permainan
          </button>
        </div>
      )}

      {isPlaying &&
        targets.map((target) => (
          <ShooterTargetItem key={target.id} target={target} />
        ))}

      {floatingTexts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-none absolute font-black transform -translate-x-1/2 animate-float-fade ${
            item.isCrit ? 'text-lg md:text-xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-sm'
          }`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            color: item.color,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};
