import React from 'react';
import { Users, Bot, Palette, Compass, Play } from 'lucide-react';
import { TeamId, MapTheme, CharacterCustomization } from '../../types';
import { MAP_CATALOG } from '../MapSelectorModal';
import { soundEngine } from '../../utils/audio';
import { MultiplayerRoomPanel } from './MultiplayerRoomPanel';
import { SoloLobbyPanel } from './SoloLobbyPanel';

interface ArenaLobbyViewProps {
  isDark: boolean;
  gameModeType: 'multiplayer' | 'bot';
  setGameModeType: (mode: 'multiplayer' | 'bot') => void;
  playerName: string;
  handlePlayerNameChange: (name: string) => void;
  characterCustomization: CharacterCustomization;
  setShowCustomizerModal: (show: boolean) => void;
  playerTeam: TeamId;
  handleSelectTeam: (team: TeamId) => void;
  totalPlayersConfig: number;
  setTotalPlayersConfig: (count: number) => void;
  isSelectingPlayers: boolean;
  setIsSelectingPlayers: (sel: boolean) => void;
  handleUpdateTotalSlots: (count: number) => void;
  currentRoomCode: string;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  handleCopyRoomCode: () => void;
  handleJoinMultiplayerRoom: (code: string, isHost: boolean) => void;
  isJoinedRoom: boolean;
  joinedAsHost: boolean;
  isEffectiveHost: boolean;
  roomPlayersList: any[];
  handleLeaveRoom: () => void;
  handleUpdateBotTeam: (botId: string, team: TeamId) => void;
  handleKickPlayer: (playerId: string) => void;
  startMatch: () => void;
  handleAddBot: () => void;
  handleDeleteRoom: () => void;
  selectedMapTheme: MapTheme;
  handleSelectMapTheme: (theme: MapTheme) => void;
  setShowMapSelectorModal: (show: boolean) => void;
  isLocalPlayer: (id: string) => boolean;
}

export const ArenaLobbyView: React.FC<ArenaLobbyViewProps> = ({
  isDark,
  gameModeType,
  setGameModeType,
  playerName,
  handlePlayerNameChange,
  characterCustomization,
  setShowCustomizerModal,
  playerTeam,
  handleSelectTeam,
  totalPlayersConfig,
  setTotalPlayersConfig,
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
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 text-center">
      {/* Header Banner */}
      <div className="max-w-lg w-full mb-3">
        <h2 className={`text-xl md:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight mb-1 flex items-center justify-center gap-2`}>
          <span>⚔️ SHOPSHOOTER ARENA</span>
        </h2>
        <p className={`text-[11px] md:text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-md leading-relaxed mx-auto`}>
          Pertempuran taktis 2 Tim! Kompatibel PC (WASD/Mouse) dan Mobile (Virtual Joystick).
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 max-w-lg w-full mb-2.5">
        <button
          onClick={() => setGameModeType('multiplayer')}
          className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 font-black text-xs md:text-sm ${
            gameModeType === 'multiplayer'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-300 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
              : isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-300" />
            <span>Arena Multiplayer</span>
          </div>
          <span className="text-[9px] font-normal opacity-85">Main Bareng dengan Kode Room</span>
        </button>

        <button
          onClick={() => setGameModeType('bot')}
          className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 font-black text-xs md:text-sm ${
            gameModeType === 'bot'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.01]'
              : isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-amber-300" />
            <span>VS AI (Solo)</span>
          </div>
          <span className="text-[9px] font-normal opacity-85">Latihan Cepat Lawan Komputer</span>
        </button>
      </div>

      {/* Profile Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full mb-2.5 text-left">
        <div className={`${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-xl p-2.5 flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase text-cyan-500 font-bold flex items-center gap-1">
              <Users className="w-3 h-3" />
              Nama Pemain:
            </span>
            <span className="text-[9px] text-emerald-500 font-mono">✓ Tersimpan</span>
          </div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => handlePlayerNameChange(e.target.value)}
            placeholder="Ketik Nama Kamu..."
            className={`w-full ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-cyan-400 transition-colors`}
            maxLength={20}
          />
        </div>

        <button
          onClick={() => setShowCustomizerModal(true)}
          className={`border rounded-xl p-2.5 flex items-center justify-between group transition-all text-left ${
            isDark
              ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border-amber-500/40 text-white'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-300 text-slate-900 shadow-sm'
          }`}
        >
          <div className="min-w-0 pr-2">
            <span className="text-[9px] uppercase text-amber-500 font-bold flex items-center gap-1 mb-0.5">
              <Palette className="w-3 h-3" />
              Kustomisasi Avatar:
            </span>
            <span className="text-xs font-bold capitalize truncate block">
              {characterCustomization.characterClass} · {characterCustomization.weaponSkin.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg group-hover:scale-105 transition-transform shrink-0">
            Ubah
          </span>
        </button>
      </div>

      {/* Mode Panels */}
      {gameModeType === 'multiplayer' ? (
        <MultiplayerRoomPanel
          isDark={isDark}
          playerTeam={playerTeam}
          handleSelectTeam={handleSelectTeam}
          totalPlayersConfig={totalPlayersConfig}
          isSelectingPlayers={isSelectingPlayers}
          setIsSelectingPlayers={setIsSelectingPlayers}
          handleUpdateTotalSlots={handleUpdateTotalSlots}
          currentRoomCode={currentRoomCode}
          roomCodeInput={roomCodeInput}
          setRoomCodeInput={setRoomCodeInput}
          handleCopyRoomCode={handleCopyRoomCode}
          handleJoinMultiplayerRoom={handleJoinMultiplayerRoom}
          isJoinedRoom={isJoinedRoom}
          isEffectiveHost={isEffectiveHost}
          roomPlayersList={roomPlayersList}
          handleLeaveRoom={handleLeaveRoom}
          handleUpdateBotTeam={handleUpdateBotTeam}
          handleKickPlayer={handleKickPlayer}
          startMatch={startMatch}
          handleAddBot={handleAddBot}
          handleDeleteRoom={handleDeleteRoom}
          selectedMapTheme={selectedMapTheme}
          setShowMapSelectorModal={setShowMapSelectorModal}
          isLocalPlayer={isLocalPlayer}
          playerName={playerName}
        />
      ) : (
        <SoloLobbyPanel
          isDark={isDark}
          playerTeam={playerTeam}
          handleSelectTeam={handleSelectTeam}
          totalPlayersConfig={totalPlayersConfig}
          setTotalPlayersConfig={setTotalPlayersConfig}
          isSelectingPlayers={isSelectingPlayers}
          setIsSelectingPlayers={setIsSelectingPlayers}
        />
      )}

      {/* Map Selector Banner */}
      {(() => {
        const activeMap = MAP_CATALOG.find((m) => m.id === selectedMapTheme) || MAP_CATALOG[0];
        return (
          <div className={`mb-2.5 max-w-lg w-full ${
            isDark ? 'bg-slate-900/90 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-200 shadow-md'
          } border rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 text-left transition-all group hover:border-cyan-500/40`}>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-16 sm:w-20 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-950 relative border border-slate-700/60 shadow-inner group-hover:border-cyan-500/50 transition-colors">
                <img src={activeMap.image} alt={activeMap.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-1 left-1 drop-shadow">{activeMap.icon}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-cyan-500 uppercase tracking-widest">
                  <Compass className="w-3 h-3 shrink-0" />
                  <span>Arena Pertempuran Aktif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs md:text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeMap.name}</span>
                  <span className={`hidden sm:inline text-[9px] font-bold px-1.5 py-0.2 rounded-md ${isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {activeMap.badge}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => { soundEngine.playPowerUp(); setShowMapSelectorModal(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all shrink-0 border border-cyan-400/30"
              title="Buka Panel Pemilihan Map"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Ganti Map</span>
            </button>
          </div>
        );
      })()}

      {gameModeType === 'bot' && (
        <button
          onClick={startMatch}
          className="py-3 px-6 text-white font-black rounded-xl shadow-lg transition-all text-xs md:text-sm flex items-center justify-center gap-2 max-w-lg w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-500/25 active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mulai Pertandingan vs AI ({totalPlayersConfig} Pemain)</span>
        </button>
      )}
    </div>
  );
};
