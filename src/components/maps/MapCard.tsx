import React from 'react';
import { MapOption } from '../../maps/mapCatalog';
import { Check } from 'lucide-react';

interface MapCardProps {
  item: MapOption;
  isSelected: boolean;
  hasImgFailed: boolean;
  isDark: boolean;
  onSelect: (id: MapOption['id']) => void;
  onImageError: (id: string) => void;
}

export const MapCard: React.FC<MapCardProps> = ({
  item,
  isSelected,
  hasImgFailed,
  isDark,
  onSelect,
  onImageError,
}) => {
  return (
    <div
      onClick={() => onSelect(item.id)}
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
            onError={() => onImageError(item.id)}
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
};
