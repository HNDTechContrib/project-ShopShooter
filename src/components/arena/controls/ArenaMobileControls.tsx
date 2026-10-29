import React from 'react';
import { Compass, Wind, Crosshair, Flame } from 'lucide-react';

interface ArenaMobileControlsProps {
  showVirtualControls: boolean;
  matchStatus: 'lobby' | 'playing' | 'ended';
  respawnTimer: number;
  dashCooldown: number;
  onTriggerDash: () => void;
  onJoyTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onJoyTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onJoyTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  joyKnobPos: { x: number; y: number };
  onAimTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onAimTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onAimTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  onFireStart: () => void;
  onFireEnd: () => void;
}

export const ArenaMobileControls: React.FC<ArenaMobileControlsProps> = ({
  showVirtualControls,
  matchStatus,
  respawnTimer,
  dashCooldown,
  onTriggerDash,
  onJoyTouchStart,
  onJoyTouchMove,
  onJoyTouchEnd,
  joyKnobPos,
  onAimTouchStart,
  onAimTouchMove,
  onAimTouchEnd,
  onFireStart,
  onFireEnd,
}) => {
  if (!showVirtualControls || matchStatus !== 'playing' || respawnTimer > 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-2.5 sm:p-4 md:p-6 select-none touch-none">
      {/* Left: Virtual Movement Joystick */}
      <div className="pointer-events-auto flex flex-col items-center">
        <div
          onTouchStart={onJoyTouchStart}
          onTouchMove={onJoyTouchMove}
          onTouchEnd={onJoyTouchEnd}
          onTouchCancel={onJoyTouchEnd}
          className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-34 md:h-34 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 flex items-center justify-center touch-none shadow-2xl active:border-cyan-400"
        >
          {/* Center crosshair mark */}
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          {/* Floating Knob */}
          <div
            className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${joyKnobPos.x}px, ${joyKnobPos.y}px)`,
            }}
          >
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
          </div>
        </div>
        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
          🕹️ Gerak 360°
        </span>
      </div>

      {/* Right: Aim Touch Pad, Shoot Button & Dash */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2 mb-0.5">
          {/* Dash / Evade Button */}
          <button
            onClick={onTriggerDash}
            onTouchStart={(e) => {
              e.preventDefault();
              onTriggerDash();
            }}
            disabled={dashCooldown > 0}
            className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold border transition-all flex items-center gap-1.5 shadow-md ${
              dashCooldown > 0
                ? 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-70'
                : 'bg-emerald-500/25 border-emerald-400 text-emerald-300 hover:bg-emerald-500/35 active:scale-90'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>{dashCooldown > 0 ? `${dashCooldown.toFixed(1)}s` : 'DASH'}</span>
          </button>
        </div>

        {/* Aim Touch Pad and Big Shoot Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Touch Aim Wheel */}
          <div
            onTouchStart={onAimTouchStart}
            onTouchMove={onAimTouchMove}
            onTouchEnd={onAimTouchEnd}
            onTouchCancel={onAimTouchEnd}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700 flex flex-col items-center justify-center touch-none text-slate-400 active:border-rose-400 shadow-xl"
          >
            <Crosshair className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              BIDIK
            </span>
          </div>

          {/* Big Ergonomic FIRE Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onFireStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onFireEnd();
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              onFireEnd();
            }}
            onMouseDown={onFireStart}
            onMouseUp={onFireEnd}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-500 border-3 sm:border-4 border-white/80 shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-90 transition-transform flex flex-col items-center justify-center text-white font-black"
          >
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider">
              TEMBAK
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
