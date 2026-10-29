export interface PlayerProfile {
  id: string;
  username: string;
  avatarClass: string;
  primaryColor: string;
  weaponSkin: string;
  totalMatches: number;
  wins: number;
  losses: number;
  kills: number;
  points: number;
  isOnline: boolean;
  statusMessage?: string;
  createdAt: string;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: number;
}
