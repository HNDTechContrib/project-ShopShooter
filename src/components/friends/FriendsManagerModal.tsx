import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, Search, UserPlus, Check, X, UserCheck, Trash2, Clock, Shield } from 'lucide-react';
import { PlayerProfile, FriendRequest } from '../../types/profileTypes';
import { TankThumbnailCanvas } from '../customizer/TankThumbnailCanvas';

interface FriendsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  currentUser: PlayerProfile;
  allProfiles: PlayerProfile[];
  friendsList: PlayerProfile[];
  incomingRequests: FriendRequest[];
  sentRequestIds: string[];
  onSendRequest: (targetId: string) => void;
  onCancelRequest: (targetId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onRemoveFriend: (friendId: string) => void;
  onViewProfile: (profile: PlayerProfile) => void;
}

export const FriendsManagerModal: React.FC<FriendsManagerModalProps> = ({
  isOpen,
  onClose,
  isDark = true,
  currentUser,
  allProfiles,
  friendsList,
  incomingRequests,
  sentRequestIds,
  onSendRequest,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onViewProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'incoming' | 'sent' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  if (!isOpen) return null;

  const searchResults = allProfiles.filter((p) => {
    if (p.id === currentUser.id) return false;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return false;
    return p.username.toLowerCase().includes(query) || p.id.toLowerCase().includes(query);
  });

  const getFriendshipStatus = (targetId: string) => {
    if (friendsList.some((f) => f.id === targetId)) return 'friends';
    if (sentRequestIds.includes(targetId)) return 'pending_sent';
    if (incomingRequests.some((r) => r.senderId === targetId)) return 'pending_received';
    return 'none';
  };

  const modalContent = (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-lg rounded-3xl p-6 md:p-7 shadow-2xl border transition-all animate-in zoom-in-95 duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black uppercase tracking-tight">Sistem Pertemanan Striker</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800 mb-5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'friends' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Teman Saya ({friendsList.length})
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap relative ${
              activeTab === 'incoming' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Permintaan Masuk
            {incomingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {incomingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'sent' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terkirim ({sentRequestIds.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'search' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cari Teman
          </button>
        </div>

        {/* Tab Content: Friends List */}
        {activeTab === 'friends' && (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {friendsList.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Belum ada teman yang ditambahkan. Gunakan menu Cari Teman untuk menambah Striker lain!
              </div>
            ) : (
              friendsList.map((friend) => (
                <div key={friend.id} className={`flex items-center justify-between p-3 rounded-2xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                      <TankThumbnailCanvas customization={{ characterClass: friend.avatarClass as any, primaryColor: friend.primaryColor, secondaryColor: '#0284c7', visorColor: '#38bdf8', weaponSkin: friend.weaponSkin as any, accessory: 'none', trailEffect: 'none' }} size={32} />
                      <div className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${friend.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black">{friend.username}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {friend.id} · {friend.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile(friend);
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] rounded-xl transition-colors"
                    >
                      Profil
                    </button>
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      className="p-1.5 bg-rose-950/50 hover:bg-rose-900 text-rose-400 rounded-xl transition-colors"
                      title="Hapus Teman"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Incoming Requests */}
        {activeTab === 'incoming' && (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {incomingRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Tidak ada permintaan pertemanan masuk saat ini.
              </div>
            ) : (
              incomingRequests.map((req) => (
                <div key={req.id} className={`flex items-center justify-between p-3 rounded-2xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black">
                      {req.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-black">{req.senderName}</h4>
                      <span className="text-[10px] text-amber-400">Ingin berteman denganmu</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition-colors shadow-sm flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Terima
                    </button>
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 font-bold text-[11px] rounded-xl transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Sent Requests */}
        {activeTab === 'sent' && (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {sentRequestIds.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Kamu belum mengirim permintaan pertemanan.
              </div>
            ) : (
              sentRequestIds.map((targetId) => {
                const targetProfile = allProfiles.find((p) => p.id === targetId);
                if (!targetProfile) return null;
                return (
                  <div key={targetId} className={`flex items-center justify-between p-3 rounded-2xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                        <TankThumbnailCanvas customization={{ characterClass: targetProfile.avatarClass as any, primaryColor: targetProfile.primaryColor, secondaryColor: '#0284c7', visorColor: '#38bdf8', weaponSkin: targetProfile.weaponSkin as any, accessory: 'none', trailEffect: 'none' }} size={32} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{targetProfile.username}</h4>
                        <span className="text-[10px] text-amber-400">Permintaan Terkirim (Menunggu)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onCancelRequest(targetId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-[11px] rounded-xl transition-colors"
                    >
                      Batalkan
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Content: Search Friends */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama atau ID unik..."
                className={`w-full text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
              />
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {!searchQuery.trim() ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Ketik nama atau ID pemain untuk mencari Striker lain.
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-rose-400 text-xs font-semibold">
                  Pemain "{searchQuery}" tidak ditemukan.
                </div>
              ) : (
                searchResults.map((profile) => {
                  const status = getFriendshipStatus(profile.id);
                  return (
                    <div key={profile.id} className={`flex items-center justify-between p-3 rounded-2xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                          <TankThumbnailCanvas customization={{ characterClass: profile.avatarClass as any, primaryColor: profile.primaryColor, secondaryColor: '#0284c7', visorColor: '#38bdf8', weaponSkin: profile.weaponSkin as any, accessory: 'none', trailEffect: 'none' }} size={32} />
                          <div className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${profile.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black">{profile.username}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {profile.id} · {profile.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile(profile);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] rounded-xl transition-colors"
                        >
                          Profil
                        </button>
                        {status === 'none' && (
                          <button
                            onClick={() => onSendRequest(profile.id)}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Tambah
                          </button>
                        )}
                        {status === 'pending_sent' && (
                          <span className="text-[10px] font-bold text-amber-400 px-2 py-1 bg-amber-950/50 rounded-lg">
                            Terkirim
                          </span>
                        )}
                        {status === 'pending_received' && (
                          <span className="text-[10px] font-bold text-cyan-400 px-2 py-1 bg-cyan-950/50 rounded-lg">
                            Menunggu Konfirmasi
                          </span>
                        )}
                        {status === 'friends' && (
                          <span className="text-[10px] font-bold text-emerald-400 px-2 py-1 bg-emerald-950/50 rounded-lg">
                            Teman
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
