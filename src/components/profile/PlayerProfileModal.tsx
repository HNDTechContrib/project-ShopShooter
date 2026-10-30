import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, X, Trophy, Swords, Shield, Zap, Sparkles, Check, AlertCircle } from 'lucide-react';
import { PlayerProfile } from '../../types/profileTypes';
import { TankThumbnailCanvas } from '../customizer/TankThumbnailCanvas';
import { saveStoredProfile } from '../../services/profileStorage';

interface PlayerProfileModalProps {
  profile: PlayerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  isSelf?: boolean;
  onUpdateProfile?: (updated: Partial<PlayerProfile>) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  isDark = true,
  isSelf = false,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [displayedName, setDisplayedName] = useState<string>('');
  const [displayedStatus, setDisplayedStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync state whenever profile prop or isOpen changes
  useEffect(() => {
    if (profile) {
      const uname = profile.username || '';
      const ustatus = profile.statusMessage || 'Siap bertempur di Arena TDM!';
      setEditName(uname);
      setEditStatus(ustatus);
      setDisplayedName(uname);
      setDisplayedStatus(ustatus);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [profile, isOpen]);

  // Handle escape key and lock body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  const handleStartEdit = () => {
    setEditName(displayedName);
    setEditStatus(displayedStatus);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditName(displayedName);
    setEditStatus(displayedStatus);
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = editName.trim();
    const trimmedStatus = editStatus.trim();

    if (!trimmedName) {
      setErrorMessage('Nama pemain tidak boleh kosong.');
      return;
    }
    if (trimmedName.length < 2) {
      setErrorMessage('Nama pemain minimal 2 karakter.');
      return;
    }
    if (trimmedName.length > 20) {
      setErrorMessage('Nama pemain maksimal 20 karakter.');
      return;
    }
    if (trimmedStatus.length > 60) {
      setErrorMessage('Status bio maksimal 60 karakter.');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Save to centralized storage & broadcast
      const saveRes = saveStoredProfile({
        username: trimmedName,
        statusMessage: trimmedStatus,
      }, profile.points);

      if (!saveRes.success) {
        setErrorMessage(saveRes.error || 'Gagal menyimpan perubahan profil.');
        setIsSaving(false);
        return;
      }

      // 2. Update local displayed state immediately
      setDisplayedName(trimmedName);
      setDisplayedStatus(trimmedStatus);

      // 3. Trigger parent callback if provided
      if (onUpdateProfile) {
        onUpdateProfile({
          username: trimmedName,
          statusMessage: trimmedStatus,
        });
      }

      setSuccessMessage('✓ Profil berhasil diperbarui!');
      setIsSaving(false);
      setIsEditing(false);

      // Auto clear success notice after 3s
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setErrorMessage('Terjadi kesalahan saat menyimpan data profil.');
      setIsSaving(false);
    }
  };

  const winRate = profile.totalMatches > 0 ? Math.round((profile.wins / profile.totalMatches) * 100) : 0;

  // Build temporary customization object for TankThumbnailCanvas
  const customization = {
    characterClass: (profile.avatarClass as any) || 'phantom',
    primaryColor: profile.primaryColor || '#06b6d4',
    secondaryColor: '#0284c7',
    visorColor: '#38bdf8',
    weaponSkin: (profile.weaponSkin as any) || 'laser_cannon',
    accessory: 'crown' as const,
    trailEffect: 'sparks' as const,
  };

  const modalContent = (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-md rounded-3xl p-6 md:p-7 shadow-2xl border transition-all animate-in zoom-in-95 duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black uppercase tracking-tight">Profil Striker Pemain</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {successMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-20 h-20 rounded-2xl bg-slate-950 border-2 border-cyan-500/50 flex items-center justify-center shadow-xl mb-3 overflow-hidden">
            <TankThumbnailCanvas customization={customization} size={64} />
            <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${profile.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} title={profile.isOnline ? 'Online' : 'Offline'} />
          </div>

          {!isEditing ? (
            <>
              <h2 className="text-xl font-black tracking-tight mb-0.5">{displayedName || profile.username}</h2>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30 mb-2">
                ID: {profile.id}
              </span>
              <p className={`text-xs italic max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                "{displayedStatus || profile.statusMessage || 'Siap bertempur di Arena TDM!'}"
              </p>
            </>
          ) : (
            <form onSubmit={handleSave} className="w-full space-y-3 mt-1 text-left">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Nama / Nickname (2-20 Karakter):
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={20}
                  placeholder="Masukkan nama striker..."
                  className={`w-full text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none focus:border-cyan-500 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  disabled={isSaving}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Status Bio (Maks. 60 Karakter):
                </label>
                <input
                  type="text"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  maxLength={60}
                  placeholder="Tulis status bio singkat kamu..."
                  className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:border-cyan-500 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  disabled={isSaving}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Combat Stats Grid */}
        <div className={`grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-center p-2 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Total Pertandingan</span>
            <span className="text-base font-black font-mono text-white">{profile.totalMatches}</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Rasio Kemenangan</span>
            <span className="text-base font-black font-mono text-emerald-400">{winRate}% ({profile.wins}W / {profile.losses}L)</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Total Kill</span>
            <span className="text-base font-black font-mono text-rose-400">{profile.kills}</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Poin / Saldo XP</span>
            <span className="text-base font-black font-mono text-amber-400">{profile.points} XP</span>
          </div>
        </div>

        {/* Bottom Actions */}
        {isSelf && !isEditing && (
          <button
            onClick={handleStartEdit}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-[0.99]"
          >
            Edit Profil Striker
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
