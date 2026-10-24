import React, { useState, useEffect } from 'react';
import { MapTheme } from '../types';
import { soundEngine } from '../utils/audio';
import { X, Compass, Sparkles } from 'lucide-react';
import { MAP_CATALOG } from '../maps/mapCatalog';
import { MapCard } from './maps/MapCard';

interface MapSelectorModalProps {
  isOpen: boolean;
  selectedMap: MapTheme;
  onSelectMap: (map: MapTheme) => void;
  onClose: () => void;
  themeMode?: 'dark' | 'light';
}

export { MAP_CATALOG };

export const MapSelectorModal: React.FC<MapSelectorModalProps> = ({
  isOpen,
  selectedMap,
  onSelectMap,
  onClose,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';
  const [stagedMap, setStagedMap] = useState<MapTheme>(selectedMap);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setStagedMap(selectedMap);
    }
  }, [isOpen, selectedMap]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStagedOption = MAP_CATALOG.find((m) => m.id === stagedMap) || MAP_CATALOG[0];

  const handleConfirm = () => {
    soundEngine.playPowerUp();
    onSelectMap(stagedMap);
    onClose();
  };

  const handleCardClick = (mapId: MapTheme) => {
    soundEngine.playShoot();
    setStagedMap(mapId);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`${
          isDark 
            ? 'bg-slate-900 border-slate-700/80 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]' 
            : 'bg-white border-slate-300 text-slate-900 shadow-2xl'
        } border rounded-3xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between gap-4 ${
          isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`text-base md:text-lg font-black tracking-tight uppercase truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Pilih Arena Pertempuran
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                  7 Map TDM
                </span>
              </div>
              <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Pilih map futuristik untuk latihan bot maupun pertandingan multiplayer
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playShoot();
              onClose();
            }}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900'
            }`}
            title="Tutup (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MAP_CATALOG.map((item) => (
              <MapCard
                key={item.id}
                item={item}
                isSelected={stagedMap === item.id}
                hasImgFailed={!!failedImages[item.id]}
                isDark={isDark}
                onSelect={handleCardClick}
                onImageError={(id) => setFailedImages((prev) => ({ ...prev, [id]: true }))}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-5 py-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50/90'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Map Aktif:
            </span>
            <span className="text-xs font-black text-cyan-400">
              {currentStagedOption.name}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>Gunakan Map Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
