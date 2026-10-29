import React, { useState, useEffect } from 'react';
import { User, Users, Shield, Award, Sparkles, LogOut, CheckCircle2, ChevronRight } from 'lucide-react';
import { PlayerProfile, FriendRequest } from '../../types/profileTypes';
import { PlayerProfileModal } from './PlayerProfileModal';
import { FriendsManagerModal } from '../friends/FriendsManagerModal';
import { TankThumbnailCanvas } from '../customizer/TankThumbnailCanvas';

interface ProfileNavbarWidgetProps {
  isDark?: boolean;
  userPoints: number;
  onNavigateToLeaderboard: () => void;
}

export const ProfileNavbarWidget: React.FC<ProfileNavbarWidgetProps> = ({
  isDark = true,
  userPoints,
  onNavigateToLeaderboard,
}) => {
  // Current User Profile State (Persisted)
  const [myProfile, setMyProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem('shopshooter_my_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    const defaultName = localStorage.getItem('db_player_name') || `Striker_${Math.floor(Math.random() * 900 + 100)}`;
    const defaultCustom = JSON.parse(localStorage.getItem('db_char_customization') || '{}');
    return {
      id: 'MY_STRIKER_ID',
      username: defaultName,
      avatarClass: defaultCustom.characterClass || 'phantom',
      primaryColor: defaultCustom.primaryColor || '#06b6d4',
      weaponSkin: defaultCustom.weaponSkin || 'laser_cannon',
      totalMatches: 14,
      wins: 9,
      losses: 5,
      kills: 42,
      points: userPoints,
      isOnline: true,
      statusMessage: 'Siap mendominasi arena TDM!',
      createdAt: '2026-10-01',
    };
  });

  // Sync points with App state
  useEffect(() => {
    setMyProfile((prev: PlayerProfile) => ({ ...prev, points: userPoints }));
  }, [userPoints]);

  useEffect(() => {
    try {
      localStorage.setItem('shopshooter_my_profile', JSON.stringify(myProfile));
    } catch {}
  }, [myProfile]);

  // Mock All Profiles for Discovery & Friends
  const [allProfiles, setAllProfiles] = useState<PlayerProfile[]>(() => {
    return [
      { id: 'ACE-7721', username: 'Ghost_Sniper', avatarClass: 'ninja', primaryColor: '#f43f5e', weaponSkin: 'laser_cannon', totalMatches: 48, wins: 38, losses: 10, kills: 185, points: 3450, isOnline: true, statusMessage: 'Satu tembakan, satu eliminasi.', createdAt: '2026-09-15' },
      { id: 'ACE-8842', username: 'Titan_Mech', avatarClass: 'tanker', primaryColor: '#f59e0b', weaponSkin: 'pulse_shotgun', totalMatches: 62, wins: 41, losses: 21, kills: 210, points: 4100, isOnline: true, statusMessage: 'Armor tebal siap menahan gempuran.', createdAt: '2026-09-10' },
      { id: 'ACE-9910', username: 'Valkyrie_Bot', avatarClass: 'commando', primaryColor: '#8b5cf6', weaponSkin: 'plasma_rifle', totalMatches: 35, wins: 22, losses: 13, kills: 120, points: 2800, isOnline: false, statusMessage: 'Offline melatih taktik.', createdAt: '2026-09-20' },
      { id: 'ACE-1042', username: 'Shadow_Reaper', avatarClass: 'phantom', primaryColor: '#10b981', weaponSkin: 'dual_blaster', totalMatches: 29, wins: 18, losses: 11, kills: 98, points: 1950, isOnline: true, statusMessage: 'Cepat dan mematikan.', createdAt: '2026-09-25' },
    ];
  });

  // Friends & Requests state
  const [friendsList, setFriendsList] = useState<PlayerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('shopshooter_friends_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [allProfiles[0], allProfiles[1]];
  });

  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>(() => {
    return [
      { id: 'req-1', senderId: 'ACE-9910', senderName: 'Valkyrie_Bot', senderAvatar: 'commando', timestamp: Date.now() - 3600000 },
    ];
  });

  const [sentRequestIds, setSentRequestIds] = useState<string[]>(() => {
    return ['ACE-1042'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('shopshooter_friends_list', JSON.stringify(friendsList));
    } catch {}
  }, [friendsList]);

  // Modal visibility states
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfile | null>(null);
  const [isViewingOtherProfile, setIsViewingOtherProfile] = useState<boolean>(false);

  // Friend Actions
  const handleSendRequest = (targetId: string) => {
    if (sentRequestIds.includes(targetId)) return;
    setSentRequestIds((prev: string[]) => [...prev, targetId]);
  };

  const handleCancelRequest = (targetId: string) => {
    setSentRequestIds((prev: string[]) => prev.filter((id: string) => id !== targetId));
  };

  const handleAcceptRequest = (requestId: string) => {
    const req = incomingRequests.find((r: FriendRequest) => r.id === requestId);
    if (!req) return;
    const profile = allProfiles.find((p: PlayerProfile) => p.id === req.senderId);
    if (profile && !friendsList.some((f: PlayerProfile) => f.id === profile.id)) {
      setFriendsList((prev: PlayerProfile[]) => [...prev, profile]);
    }
    setIncomingRequests((prev: FriendRequest[]) => prev.filter((r: FriendRequest) => r.id !== requestId));
  };

  const handleRejectRequest = (requestId: string) => {
    setIncomingRequests((prev: FriendRequest[]) => prev.filter((r: FriendRequest) => r.id !== requestId));
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriendsList((prev: PlayerProfile[]) => prev.filter((f: PlayerProfile) => f.id !== friendId));
  };

  const handleViewProfile = (profile: PlayerProfile) => {
    setSelectedProfile(profile);
    setIsViewingOtherProfile(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Friends Quick Button with Badge */}
        <button
          onClick={() => setIsFriendsOpen(true)}
          className={`relative p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
            isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
          }`}
          title="Sistem Pertemanan & Daftar Teman"
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Teman</span>
          {incomingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {incomingRequests.length}
            </span>
          )}
        </button>

        {/* My Profile Widget Button */}
        <button
          onClick={() => {
            setSelectedProfile(myProfile);
            setIsViewingOtherProfile(false);
            setIsProfileOpen(true);
          }}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
          }`}
          title="Buka Profil Pemain"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 shrink-0">
            <TankThumbnailCanvas customization={{ characterClass: myProfile.avatarClass as any, primaryColor: myProfile.primaryColor, secondaryColor: '#0284c7', visorColor: '#38bdf8', weaponSkin: myProfile.weaponSkin as any, accessory: 'none', trailEffect: 'none' }} size={24} />
          </div>
          <span className="hidden md:inline font-black max-w-[90px] truncate">{myProfile.username}</span>
        </button>
      </div>

      {/* Profile Modal (Self) */}
      <PlayerProfileModal
        profile={myProfile}
        isOpen={isProfileOpen && !isViewingOtherProfile}
        onClose={() => setIsProfileOpen(false)}
        isDark={isDark}
        isSelf={true}
        onUpdateProfile={(updated: Partial<PlayerProfile>) => {
          setMyProfile((prev: PlayerProfile) => ({ ...prev, ...updated }));
        }}
      />

      {/* Profile Modal (Other Player) */}
      <PlayerProfileModal
        profile={selectedProfile}
        isOpen={isProfileOpen && isViewingOtherProfile}
        onClose={() => {
          setIsProfileOpen(false);
          setSelectedProfile(null);
        }}
        isDark={isDark}
        isSelf={false}
      />

      {/* Friends Manager Modal */}
      <FriendsManagerModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        isDark={isDark}
        currentUser={myProfile}
        allProfiles={allProfiles}
        friendsList={friendsList}
        incomingRequests={incomingRequests}
        sentRequestIds={sentRequestIds}
        onSendRequest={handleSendRequest}
        onCancelRequest={handleCancelRequest}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onRemoveFriend={handleRemoveFriend}
        onViewProfile={(profile: PlayerProfile) => {
          setIsFriendsOpen(false);
          handleViewProfile(profile);
          setIsProfileOpen(true);
        }}
      />
    </>
  );
};
