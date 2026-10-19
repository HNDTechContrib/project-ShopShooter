import React from 'react';
import { FloatingNotification } from '../types';
import { Sparkles, AlertTriangle, Zap, X } from 'lucide-react';

interface SpecialTargetNotificationProps {
  notifications: FloatingNotification[];
  onDismiss: (id: string) => void;
}

export const SpecialTargetNotification: React.FC<SpecialTargetNotificationProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 md:right-8 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        const isSpecial = notif.type === 'special_target';
        const isBomb = notif.type === 'bomb';

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto rounded-xl p-4 shadow-2xl border transition-all transform animate-in slide-in-from-top-4 duration-300 ${
              isSpecial
                ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white border-amber-400/80 shadow-amber-500/20'
                : isBomb
                ? 'bg-rose-950 text-white border-rose-500 shadow-rose-950/40'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isSpecial
                    ? 'bg-amber-400 text-slate-950 animate-siren-pulse'
                    : isBomb
                    ? 'bg-rose-500 text-white animate-bounce'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {isSpecial ? (
                  <Sparkles className="w-5 h-5" />
                ) : isBomb ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 truncate">
                    {notif.title}
                  </h4>
                  <button
                    onClick={() => onDismiss(notif.id)}
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label="Tutup notifikasi"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-200 mt-0.5 leading-snug">
                  {notif.message}
                </p>
              </div>
            </div>

            {/* Glowing countdown bar */}
            {isSpecial && (
              <div className="mt-2.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 animate-[shrink_8s_linear_forwards]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
