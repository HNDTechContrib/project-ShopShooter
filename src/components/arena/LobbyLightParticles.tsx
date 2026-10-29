import React from 'react';

interface LobbyLightParticlesProps {
  isDark?: boolean;
}

export const LobbyLightParticles: React.FC<LobbyLightParticlesProps> = ({ isDark = true }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none" aria-hidden="true">
      {/* Ambient soft glow orbs focused on left & right margins */}
      <div className={`absolute -top-12 left-10 w-96 h-96 rounded-full blur-[100px] transition-colors duration-500 ${
        isDark ? 'bg-cyan-500/10' : 'bg-sky-400/15'
      }`} />
      <div className={`absolute -bottom-12 right-10 w-96 h-96 rounded-full blur-[100px] transition-colors duration-500 ${
        isDark ? 'bg-indigo-600/10' : 'bg-blue-400/15'
      }`} />

      {/* Floating minimal light specks & thin light lines */}
      <div className="absolute inset-0 opacity-60 dark:opacity-40">
        {/* Left margin particles */}
        <div className="absolute left-[8%] top-[20%] w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse duration-1000 shadow-[0_0_8px_currentColor]" />
        <div className="absolute left-[12%] top-[65%] w-2 h-2 rounded-full bg-sky-300 animate-pulse duration-700 shadow-[0_0_8px_currentColor]" />
        <div className="absolute left-[5%] top-[80%] w-1 h-1 rounded-full bg-indigo-300 animate-pulse duration-1000" />

        {/* Right margin particles */}
        <div className="absolute right-[10%] top-[25%] w-2 h-2 rounded-full bg-cyan-300 animate-pulse duration-700 shadow-[0_0_8px_currentColor]" />
        <div className="absolute right-[7%] top-[55%] w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse duration-1000 shadow-[0_0_8px_currentColor]" />
        <div className="absolute right-[14%] top-[75%] w-1 h-1 rounded-full bg-sky-400 animate-pulse duration-1000" />

        {/* Subtle geometric light streaks */}
        <div className="absolute left-[3%] top-[40%] w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rotate-[-25deg]" />
        <div className="absolute right-[4%] top-[45%] w-32 h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent rotate-[30deg]" />
      </div>
    </div>
  );
};
