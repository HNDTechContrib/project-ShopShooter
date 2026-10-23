import React, { useState, useEffect } from 'react';
import { MapTheme } from '../types';
import { soundEngine } from '../utils/audio';
import { 
  X, 
  Check, 
  ShoppingBag, 
  Building2, 
  Boxes, 
  Flower2, 
  Compass,
  Sparkles,
  Gem,
  Cpu,
  Trees
} from 'lucide-react';

interface MapSelectorModalProps {
  isOpen: boolean;
  selectedMap: MapTheme;
  onSelectMap: (map: MapTheme) => void;
  onClose: () => void;
  themeMode?: 'dark' | 'light';
}

interface MapOption {
  id: MapTheme;
  name: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  accentColor: string;
  themeGlow: string;
  tags: string[];
}

export const MAP_CATALOG: MapOption[] = [
  {
    id: 'mall',
    name: 'Supermall Megastore',
    badge: 'Atrium Elektronik',
    description: 'Pusat belanja PC gaming, smartphone & gadget berlantai marmer putih cerah dengan lorong belanja modern.',
    icon: <ShoppingBag className="w-4 h-4 text-cyan-400" />,
    image: '/src/assets/images/mall_lobby_bg_1792721153783.jpg',
    accentColor: '#06b6d4',
    themeGlow: 'rgba(6, 182, 212, 0.4)',
    tags: ['Etalase PC & Rig', 'Lorong Belanja', 'Atrium Luas'],
  },
  {
    id: 'rooftop',
    name: 'Sky Plaza & Helipad',
    badge: 'Atap Mall Cyber',
    description: 'Arena rooftop modern berlantai granit dengan landasan helipad terbuka, skywalk kaca, dan pemandangan kota neon.',
    icon: <Building2 className="w-4 h-4 text-rose-400" />,
    image: '/src/assets/images/rooftop_lobby_bg_1792721153944.jpg',
    accentColor: '#f43f5e',
    themeGlow: 'rgba(244, 63, 94, 0.4)',
    tags: ['Helipad Terbuka', 'Skywalk Kaca', 'Lampu Navigasi'],
  },
  {
    id: 'warehouse',
    name: 'Smart Logistics Hub',
    badge: 'Gudang Logistik Otomatis',
    description: 'Gudang logistik belanja otomatis dengan lantai epoxy, rak kargo bertingkat, konveyor, dan peti kemas modern.',
    icon: <Boxes className="w-4 h-4 text-amber-400" />,
    image: '/src/assets/images/warehouse_lobby_bg_1792721153666.jpg',
    accentColor: '#f59e0b',
    themeGlow: 'rgba(245, 158, 11, 0.4)',
    tags: ['Rak Kargo Bertingkat', 'Jalur Konveyor', 'Area Taktis'],
  },
  {
    id: 'garden',
    name: 'Botanical Atrium',
    badge: 'Taman Mall Futuristik',
    description: 'Atrium mall bernuansa botanical dengan kanopi arsitektur modern, kolam lotus cyber, dan vegetasi hijau lebat.',
    icon: <Flower2 className="w-4 h-4 text-emerald-400" />,
    image: '/src/assets/images/garden_lobby_bg_1792721154333.jpg',
    accentColor: '#10b981',
    themeGlow: 'rgba(16, 185, 129, 0.4)',
    tags: ['Eco Botanical', 'Jembatan Layang', 'Air Mancur Lotus'],
  },
  {
    id: 'cavern',
    name: 'Crystal Plaza',
    badge: 'Boutique Kristal Mewah',
    description: 'Plaza pameran mewah berlantai pualam hitam dengan pilar kristal emas, monumen granit, dan geode permata berkilau.',
    icon: <Gem className="w-4 h-4 text-amber-400" />,
    image: '/src/assets/images/crystal_plaza_bg_1792738602580.jpg',
    accentColor: '#f59e0b',
    themeGlow: 'rgba(245, 158, 11, 0.4)',
    tags: ['Pilar Kristal Emas', 'Paviliun Marmer', 'Monumen Granit'],
  },
  {
    id: 'lab',
    name: 'Tech Innovation Lab',
    badge: 'Pusat Riset Quantum',
    description: 'Pusat riset teknologi belanja modern dengan ubin cleanroom, jalur sirkuit data bercahaya, dan server mainframe core.',
    icon: <Cpu className="w-4 h-4 text-cyan-400" />,
    image: '/src/assets/images/tech_lab_bg_1792738603502.jpg',
    accentColor: '#0284c7',
    themeGlow: 'rgba(2, 132, 199, 0.4)',
    tags: ['Innovation Core Rig', 'Server Rack 42U', 'Sirkuit Data'],
  },
  {
    id: 'forest',
    name: 'Eco Garden Mall',
    badge: 'Plaza Hijau Terbuka',
    description: 'Plaza belanja terbuka dengan dek kayu ramah lingkungan, pohon kanopi modern, dan dinding taman vertikal asri.',
    icon: <Trees className="w-4 h-4 text-emerald-400" />,
    image: '/src/assets/images/eco_garden_mall_bg_1792738602977.jpg',
    accentColor: '#059669',
    themeGlow: 'rgba(5, 150, 105, 0.4)',
    tags: ['Pohon Kanopi Kayu', 'Taman Vertikal', 'Lantai Kayu Eko'],
  },
];

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

  // Sync internal staged selection whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStagedMap(selectedMap);
    }
  }, [isOpen, selectedMap]);

  // Handle ESC key to dismiss modal
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

        {/* Modal Body: Responsive 2-column Grid of 16:9 Landscape Map Cards */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MAP_CATALOG.map((item) => {
              const isSelected = stagedMap === item.id;
              const hasImgFailed = failedImages[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                  className={`relative p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
                    isSelected
                      ? isDark
                        ? 'border-cyan-400 bg-slate-800/90 ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.01]'
                        : 'border-cyan-500 bg-cyan-50/80 ring-2 ring-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.25)] scale-[1.01]'
                      : isDark
                        ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40 hover:scale-[1.01]'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:scale-[1.01]'
                  }`}
                >
                  {/* Landscape 16:9 Thumbnail Box */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2.5 bg-slate-950 border border-black/20">
                    {!hasImgFailed ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 text-center"
                        style={{
                          background: `linear-gradient(135deg, #0f172a, ${item.accentColor}33)`
                        }}
                      >
                        {item.icon}
                        <span className="text-xs font-bold text-white">{item.name}</span>
                      </div>
                    )}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Active Selected Badge Top Right */}
                    {isSelected ? (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-cyan-500 text-slate-950 rounded-full font-black text-[10px] shadow-lg tracking-wider uppercase animate-in zoom-in duration-150">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Terpilih</span>
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-semibold text-slate-300 border border-white/10">
                        {item.badge}
                      </div>
                    )}

                    {/* Bottom Tagline on Image */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/90">
                      <div className="flex items-center gap-1.5 font-bold">
                        {item.icon}
                        <span className="drop-shadow-md">{item.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Description */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs font-black tracking-tight ${
                        isSelected 
                          ? isDark ? 'text-cyan-300' : 'text-cyan-900 font-black' 
                          : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.name}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed line-clamp-2 mb-2.5 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {item.description}
                    </p>

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? isDark 
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' 
                                : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                              : isDark 
                                ? 'bg-slate-900 text-slate-400 border border-slate-800' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
        }`}>
          {/* Active selection info */}
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Map Terpilih:
            </span>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold text-xs ${
              isDark ? 'bg-slate-900 text-cyan-400 border border-slate-700' : 'bg-white text-cyan-700 border border-slate-200 shadow-sm'
            }`}>
              {currentStagedOption.icon}
              <span>{currentStagedOption.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                soundEngine.playShoot();
                onClose();
              }}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              Batal
            </button>

            <button
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Gunakan Map Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
