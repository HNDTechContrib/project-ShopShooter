import React from 'react';
import { Users, Bot, Building2, LogIn, LogOut, Trash2, X, Play, Compass, ChevronDown } from 'lucide-react';
import { TeamId, MapTheme } from '../../types';
import { MAP_THEMES_CONFIG } from '../../config/mapThemesConfig';
import { soundEngine } from '../../utils/audio';

interface MultiplayerRoomPanelProps {
  isDark: boolean;
  playerTeam: TeamId;
  handleSelectTeam: (team: TeamId) => void;
  totalPlayersConfig: number;
  isSelectingPlayers: boolean;
  setIsSelectingPlayers: (sel: boolean) => void;
  handleUpdateTotalSlots: (count: number) => void;
  currentRoomCode: string;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  handleCopyRoomCode: () => void;
  handleJoinMultiplayerRoom: (code: string, isHost: boolean) => void;
  isJoinedRoom: boolean;
  isEffectiveHost: boolean;
  roomPlayersList: any[];
  handleLeaveRoom: () => void;
  handleUpdateBotTeam: (botId: string, team: TeamId) => void;
  handleKickPlayer: (playerId: string) => void;
  startMatch: () => void;
  handleAddBot: () => void;
  handleDeleteRoom: () => void;
  selectedMapTheme: MapTheme;
  setShowMapSelectorModal: (show: boolean) => void;
  isLocalPlayer: (id: string) => boolean;
  playerName: string;
}

export const MultiplayerRoomPanel: React.FC<MultiplayerRoomPanelProps> = ({
  isDark,
  playerTeam,
  handleSelectTeam,
  totalPlayersConfig,
  isSelectingPlayers,
  setIsSelectingPlayers,
  handleUpdateTotalSlots,
  currentRoomCode,
  roomCodeInput,
  setRoomCodeInput,
  handleCopyRoomCode,
  handleJoinMultiplayerRoom,
  isJoinedRoom,
  isEffectiveHost,
  roomPlayersList,
  handleLeaveRoom,
  handleUpdateBotTeam,
  handleKickPlayer,
  startMatch,
  handleAddBot,
  handleDeleteRoom,
  selectedMapTheme,
  setShowMapSelectorModal,
  isLocalPlayer,
  playerName,
}) => {
  return (
    <div className={`${isDark ? 'bg-slate-900/90 border-cyan-500/30 text-white shadow-[0_4px_25px_rgba(6,182,212,0.12)]' : 'bg-white border-cyan-400/50 text-slate-900 shadow-xl'} border rounded-2xl p-3.5 max-w-lg w-full mb-2.5 flex flex-col gap-2.5 text-left`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-cyan-500 flex items-center gap-1.5 uppercase tracking-wide">
          <Users className="w-4 h-4" />
          <span>LOBBY MULTIPLAYER</span>
        </span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
          Real-Time Room Sync
        </span>
      </div>

      {/* Team Selection */}
      <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-xl border`}>
        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} block mb-1`}>PILIH TIM:</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSelectTeam('blue')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${playerTeam === 'blue' ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30' : isDark ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
          >
            Tim Biru
          </button>
          <button
            onClick={() => handleSelectTeam('red')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${playerTeam === 'red' ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30' : isDark ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
          >
            Tim Merah
          </button>
        </div>
      </div>

      {/* Total Players Selection */}
      <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-xl border relative`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>TOTAL PEMAIN:</span>
          <span className="text-[9px] text-cyan-500 font-bold">Slot Tim Berimbang</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsSelectingPlayers(!isSelectingPlayers)}
            className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
              isDark ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-600' : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-sm'
            }`}
          >
            <span>{totalPlayersConfig} Pemain ({totalPlayersConfig === 2 ? '1v1' : totalPlayersConfig === 4 ? '2v2' : totalPlayersConfig === 6 ? '3v3' : '4v4'})</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {isSelectingPlayers && (
            <div className={`absolute z-50 mt-1 w-full rounded-xl p-1.5 space-y-1 shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
              {[2, 4, 6, 8].map(count => (
                <button 
                  key={count} 
                  onClick={() => { handleUpdateTotalSlots(count); setIsSelectingPlayers(false); }} 
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'text-white hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'}`}
                >
                  {count} Pemain ({count === 2 ? '1v1' : count === 4 ? '2v2' : count === 6 ? '3v3' : '4v4'})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Host and Join Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3 flex flex-col justify-between`}>
          <div>
            <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Host Room Baru:</p>
            <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-inner'} border rounded-lg p-2 mb-2 flex items-center justify-between`}>
              <span className="text-sm font-mono font-bold text-cyan-500">{currentRoomCode}</span>
              <button onClick={handleCopyRoomCode} className={`text-[10px] font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Salin</button>
            </div>
          </div>
          <button onClick={() => handleJoinMultiplayerRoom(currentRoomCode, true)} className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all">
            <Building2 className="w-3.5 h-3.5" />
            <span>{isJoinedRoom && isEffectiveHost ? 'Terhubung (Host)' : 'Buka Room (Host)'}</span>
          </button>
        </div>

        <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3 flex flex-col justify-between`}>
          <div>
            <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Gabung Room Teman:</p>
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="Ketik Kode Room..."
              className={`w-full ${isDark ? 'bg-slate-900 border-slate-700 text-cyan-300 placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner'} border rounded-lg px-2.5 py-1.5 text-xs mb-2 font-mono font-bold focus:outline-none focus:border-cyan-400`}
            />
          </div>
          {isJoinedRoom && !isEffectiveHost ? (
            <div className="flex gap-2">
              <div className="flex-1 py-1.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Terhubung (Tamu)</span>
              </div>
              <button onClick={handleLeaveRoom} className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1 transition-all">
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleJoinMultiplayerRoom(roomCodeInput, false)}
              className={`w-full py-1.5 rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Gabung</span>
            </button>
          )}
        </div>
      </div>

      {/* Waiting Room Roster */}
      {isJoinedRoom && (
        <div className={`border rounded-xl p-3 space-y-2 ${isDark ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'}`}>
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              DAFTAR PEMAIN DALAM ROOM ({roomPlayersList.length}/{totalPlayersConfig})
            </span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-mono text-[10px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>{isEffectiveHost ? 'Host Room' : 'Tamu'}</span>
              </span>
              {!isEffectiveHost && (
                <button onClick={handleLeaveRoom} className="bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white px-2 py-0.5 rounded text-[9px] font-bold border border-rose-500/40 flex items-center gap-1 transition-all">
                  <LogOut className="w-3 h-3" />
                  <span>Tinggalkan Room</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-32 overflow-y-auto space-y-1 pr-0.5">
            {roomPlayersList.map((p, idx) => {
              const isLocal = isLocalPlayer(p.id);
              const cleanName = (p.username || p.name || (isLocal ? playerName : 'Striker')).trim();
              return (
                <div key={p.id || idx} className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <span className="flex items-center gap-1.5 font-bold truncate pr-2">
                     {p.isBot ? <Bot className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Users className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
                     <span className="truncate">{cleanName}</span> {isLocal ? <span className="text-cyan-500 text-[10px] font-normal">(Kamu)</span> : ''}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span 
                      onClick={() => {
                        if (isLocal) {
                          handleSelectTeam(p.team === 'blue' ? 'red' : 'blue');
                        } else if (p.isBot && isEffectiveHost) {
                          handleUpdateBotTeam(p.id, p.team === 'blue' ? 'red' : 'blue');
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold select-none ${(isLocal || (p.isBot && isEffectiveHost)) ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all' : ''} ${p.team === 'blue' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'}`}
                    >
                      Tim {p.team === 'blue' ? 'Biru' : 'Merah'} {(isLocal || (p.isBot && isEffectiveHost)) && '✎'}
                    </span>
                    {isEffectiveHost && !isLocal && (
                      <button onClick={() => handleKickPlayer(p.id)} className="bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white px-1.5 py-0.5 rounded text-[9px] font-bold transition-all border border-rose-500/40 flex items-center gap-1">
                        <X className="w-2.5 h-2.5" />
                        <span>Kick</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`pt-1.5 border-t flex items-center justify-between text-[10px] ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
            <span>Arena Pertempuran:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-500 font-bold flex items-center gap-1">
                <Compass className="w-3 h-3" />
                <span>{MAP_THEMES_CONFIG[selectedMapTheme].name.split('(')[0].trim()}</span>
              </span>
              {isEffectiveHost && (
                <button onClick={() => { soundEngine.playPowerUp(); setShowMapSelectorModal(true); }} className="text-[10px] text-amber-500 hover:text-amber-400 font-bold underline ml-1">
                  (Ubah Map)
                </button>
              )}
            </div>
          </div>

          {isEffectiveHost && (
            <button onClick={startMatch} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Mulai Pertandingan Multiplayer</span>
            </button>
          )}
          {roomPlayersList.length < totalPlayersConfig && isEffectiveHost && (
            <button onClick={handleAddBot} className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all shadow flex items-center justify-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span>Tambah Bot ke Room</span>
            </button>
          )}
          {isEffectiveHost ? (
            <button onClick={handleDeleteRoom} className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus / Bubarkan Room (Host)</span>
            </button>
          ) : (
            <button onClick={handleLeaveRoom} className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg">
              <LogOut className="w-3.5 h-3.5" />
              <span>Tinggalkan Room</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
