import React from 'react';
import { 
  MapPin, 
  RotateCcw, 
  Bot, 
  Play, 
  Users, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { TeamId, MapTheme } from '../../types';
import { MAP_CATALOG } from '../MapSelectorModal';
import { soundEngine } from '../../utils/audio';

interface LobbyMapShowcaseProps {
  isDark: boolean;
  selectedMapTheme: MapTheme;
  handleSelectMapTheme: (theme: MapTheme) => void;
  setShowMapSelectorModal: (show: boolean) => void;
  playerTeam: TeamId;
  handleSelectTeam: (team: TeamId) => void;
  totalPlayersConfig: number;
  handleBotCountChange: (delta: number) => void;
  startMatch: () => void;
}

export const LobbyMapShowcase: React.FC<LobbyMapShowcaseProps> = ({
  isDark,
  selectedMapTheme,
  handleSelectMapTheme,
  setShowMapSelectorModal,
  playerTeam,
  handleSelectTeam,
  totalPlayersConfig,
  handleBotCountChange,
  startMatch,
}) => {
  const currentMapIndex = MAP_CATALOG.findIndex((m) => m.id === selectedMapTheme);
  const activeMap = MAP_CATALOG[currentMapIndex >= 0 ? currentMapIndex : 0];
  const botCount = Math.max(1, totalPlayersConfig - 1);

  const handleNextMap = () => {
    soundEngine.playPowerUp();
    const nextIdx = (currentMapIndex + 1) % MAP_CATALOG.length;
    handleSelectMapTheme(MAP_CATALOG[nextIdx].id);
  };

  const handlePrevMap = () => {
    soundEngine.playPowerUp();
    const prevIdx = (currentMapIndex - 1 + MAP_CATALOG.length) % MAP_CATALOG.length;
    handleSelectMapTheme(MAP_CATALOG[prevIdx].id);
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Card: MAP AKTIF */}
      <div className={`rounded-2xl border p-4 transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Map Aktif</span>
          </span>
          <button
            onClick={() => { soundEngine.playPowerUp(); setShowMapSelectorModal(true); }}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 shadow-sm transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Ganti Map</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-24 sm:w-28 aspect-video rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950 relative">
            <img src={activeMap.image} alt={activeMap.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-black truncate">{activeMap.name}</h3>
            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400">
              TEMA: {activeMap.id.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Carousel navigation dots */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
          <button onClick={handlePrevMap} className="p-1 text-slate-400 hover:text-white" title="Peta Sebelumnya">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {MAP_CATALOG.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => handleSelectMapTheme(m.id)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentMapIndex ? 'w-5 bg-cyan-400' : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
          <button onClick={handleNextMap} className="p-1 text-slate-400 hover:text-white" title="Peta Selanjutnya">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card: INFO MODE VS AI */}
      <div className={`rounded-2xl border p-4 transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>Info Mode VS AI</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Lawan bot dengan tingkat kesulitan yang bisa disesuaikan.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-1">Pilih Tim</span>
            <div className="flex rounded-lg border border-slate-700 overflow-hidden">
              <button
                onClick={() => handleSelectTeam('blue')}
                className={`flex-1 py-1 text-xs font-bold ${playerTeam === 'blue' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Tim Biru
              </button>
              <button
                onClick={() => handleSelectTeam('red')}
                className={`flex-1 py-1 text-xs font-bold ${playerTeam === 'red' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Tim Merah
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-1">Jumlah Bot</span>
            <div className="flex items-center justify-between px-2 py-1 rounded-lg border border-slate-700 text-xs font-mono font-bold">
              <button onClick={() => handleBotCountChange(-2)} className="text-slate-400 hover:text-white px-1">-</button>
              <span>{botCount}</span>
              <button onClick={() => handleBotCountChange(2)} className="text-slate-400 hover:text-white px-1">+</button>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>Bot menggunakan AI canggih untuk pengalaman bermain yang lebih seru.</span>
        </div>

        <button
          onClick={startMatch}
          className="w-full py-2.5 px-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-md flex items-center justify-center gap-1.5 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Mulai Pertandingan vs AI ({totalPlayersConfig} Pemain)</span>
          <Users className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mini Banner Map Aktif */}
      <div className={`rounded-xl border p-2.5 flex items-center justify-between gap-2.5 ${
        isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-700">
            <img src={activeMap.image} alt="Active Map Mini" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-bold text-cyan-500 block leading-tight">
              Arena Pertempuran Aktif
            </span>
            <span className="text-xs font-black truncate block">{activeMap.name}</span>
            <span className="text-[10px] text-slate-400 truncate block">{activeMap.badge}</span>
          </div>
        </div>
        <button
          onClick={() => { soundEngine.playPowerUp(); setShowMapSelectorModal(true); }}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Ganti Map</span>
        </button>
      </div>
    </div>
  );
};
