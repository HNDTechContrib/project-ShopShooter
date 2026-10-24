import React from 'react';
import { Bot, Sparkles, ChevronDown } from 'lucide-react';
import { TeamId } from '../../types';

interface SoloLobbyPanelProps {
  isDark: boolean;
  playerTeam: TeamId;
  handleSelectTeam: (team: TeamId) => void;
  totalPlayersConfig: number;
  setTotalPlayersConfig: (count: number) => void;
  isSelectingPlayers: boolean;
  setIsSelectingPlayers: (sel: boolean) => void;
}

export const SoloLobbyPanel: React.FC<SoloLobbyPanelProps> = ({
  isDark,
  playerTeam,
  handleSelectTeam,
  totalPlayersConfig,
  setTotalPlayersConfig,
  isSelectingPlayers,
  setIsSelectingPlayers,
}) => {
  return (
    <div className={`border rounded-2xl p-3.5 max-w-lg w-full mb-2.5 flex flex-col gap-2.5 text-left transition-all ${
      isDark ? 'bg-slate-900/90 border-amber-500/30 text-white shadow-[0_4px_25px_rgba(245,158,11,0.12)]' : 'bg-white border-amber-400/50 text-slate-900 shadow-xl'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-amber-500 flex items-center gap-1.5 uppercase tracking-wide">
          <Bot className="w-4 h-4" />
          <span>LOBBY SOLO (VS AI)</span>
        </span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          Mode Latihan Tembak & Duel
        </span>
      </div>

      <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-xl border`}>
        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} block mb-1`}>PILIH TIM KAMU:</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSelectTeam('blue')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
              playerTeam === 'blue' ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30' : isDark ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Tim Biru
          </button>
          <button
            onClick={() => handleSelectTeam('red')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
              playerTeam === 'red' ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30' : isDark ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Tim Merah
          </button>
        </div>
      </div>

      <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-xl p-2.5 relative`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>JUMLAH PETARUNG (KAMU + BOT):</span>
          <span className="text-[9px] text-amber-500 font-bold">Otomatis Terisi AI</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsSelectingPlayers(!isSelectingPlayers)}
            className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
              isDark ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-600' : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-sm'
            }`}
          >
            <span>{totalPlayersConfig} Pemain ({totalPlayersConfig === 2 ? '1v1 Duel' : totalPlayersConfig === 4 ? '2v2 TDM' : totalPlayersConfig === 6 ? '3v3 TDM' : '4v4 All-Out War'})</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {isSelectingPlayers && (
            <div className={`absolute z-50 mt-1 w-full rounded-xl p-1.5 space-y-1 shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
              {[2, 4, 6, 8].map(count => (
                <button 
                  key={count} 
                  onClick={() => { setTotalPlayersConfig(count); setIsSelectingPlayers(false); }} 
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'text-white hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'}`}
                >
                  {count} Pemain ({count === 2 ? '1v1 Duel' : count === 4 ? '2v2 TDM' : count === 6 ? '3v3 TDM' : '4v4 All-Out War'})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-2 p-2 rounded-xl text-[11px] ${
        isDark ? 'bg-amber-950/30 border border-amber-500/20 text-amber-200' : 'bg-amber-50 border border-amber-200 text-amber-800'
      }`}>
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>AI bot dilengkapi navigasi otomatis, tembakan taktis, dan pengambilan skill arena!</span>
      </div>
    </div>
  );
};
