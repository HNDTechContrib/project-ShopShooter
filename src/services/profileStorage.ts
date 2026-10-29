import { PlayerProfile } from '../types/profileTypes';

export const PROFILE_UPDATED_EVENT = 'shopshooter_profile_updated';

const STORAGE_KEY_PROFILE = 'shopshooter_my_profile';
const STORAGE_KEY_NAME = 'db_player_name';
const STORAGE_KEY_STATUS = 'db_player_status';
const STORAGE_KEY_CUSTOMIZATION = 'db_char_customization';

/**
 * Returns a stable unique ID for this player.
 */
export const getMyPlayerId = (): string => {
  try {
    const saved = sessionStorage.getItem('shop_shooter_unique_client_id');
    if (saved) return saved;
  } catch {}
  const newId = 'STRIKER_' + Math.floor(1000 + Math.random() * 9000);
  try {
    sessionStorage.setItem('shop_shooter_unique_client_id', newId);
  } catch {}
  return newId;
};

/**
 * Gets the current player profile from storage (single source of truth),
 * falling back gracefully to defaults.
 */
export const getStoredProfile = (userPoints?: number): PlayerProfile => {
  let profile: Partial<PlayerProfile> = {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      profile = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading stored profile:', e);
  }

  // Fallbacks for name and customization
  const savedName = localStorage.getItem(STORAGE_KEY_NAME);
  const savedStatus = localStorage.getItem(STORAGE_KEY_STATUS);
  
  let customization: any = {};
  try {
    const rawCustom = localStorage.getItem(STORAGE_KEY_CUSTOMIZATION);
    if (rawCustom) customization = JSON.parse(rawCustom);
  } catch {}

  const finalName = (profile.username || savedName || 'Tester').trim();
  const finalStatus = (profile.statusMessage || savedStatus || 'Siap bertempur di Arena TDM!').trim();
  const finalId = profile.id || getMyPlayerId();

  return {
    id: finalId,
    username: finalName,
    avatarClass: profile.avatarClass || customization.characterClass || 'phantom',
    primaryColor: profile.primaryColor || customization.primaryColor || '#06b6d4',
    weaponSkin: profile.weaponSkin || customization.weaponSkin || 'laser_cannon',
    totalMatches: typeof profile.totalMatches === 'number' ? profile.totalMatches : 14,
    wins: typeof profile.wins === 'number' ? profile.wins : 9,
    losses: typeof profile.losses === 'number' ? profile.losses : 5,
    kills: typeof profile.kills === 'number' ? profile.kills : 42,
    points: typeof userPoints === 'number' ? userPoints : (profile.points ?? 500),
    isOnline: true,
    statusMessage: finalStatus,
    createdAt: profile.createdAt || '2026-10-01',
  };
};

export interface SaveProfileResult {
  success: boolean;
  error?: string;
  profile?: PlayerProfile;
}

/**
 * Validates and saves profile updates (such as username and statusMessage)
 * into all standard storage keys and broadcasts the update to all components.
 */
export const saveStoredProfile = (
  updates: Partial<PlayerProfile>,
  userPoints?: number
): SaveProfileResult => {
  const current = getStoredProfile(userPoints);

  // Validation
  if (updates.username !== undefined) {
    const trimmedUsername = updates.username.trim();
    if (trimmedUsername.length === 0) {
      return { success: false, error: 'Nama pemain tidak boleh kosong.' };
    }
    if (trimmedUsername.length < 2) {
      return { success: false, error: 'Nama pemain minimal 2 karakter.' };
    }
    if (trimmedUsername.length > 20) {
      return { success: false, error: 'Nama pemain maksimal 20 karakter.' };
    }
    updates.username = trimmedUsername;
  }

  if (updates.statusMessage !== undefined) {
    const trimmedStatus = updates.statusMessage.trim();
    if (trimmedStatus.length > 60) {
      return { success: false, error: 'Status bio maksimal 60 karakter.' };
    }
    updates.statusMessage = trimmedStatus;
  }

  const updatedProfile: PlayerProfile = {
    ...current,
    ...updates,
    points: typeof userPoints === 'number' ? userPoints : (updates.points ?? current.points),
  };

  try {
    // 1. Write full profile object
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));

    // 2. Synchronize legacy keys used by MultiplayerArena and others
    if (updatedProfile.username) {
      localStorage.setItem(STORAGE_KEY_NAME, updatedProfile.username);
    }
    if (updatedProfile.statusMessage) {
      localStorage.setItem(STORAGE_KEY_STATUS, updatedProfile.statusMessage);
    }

    // 3. Broadcast event to all listening tabs/components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(PROFILE_UPDATED_EVENT, { detail: updatedProfile })
      );
    }

    return { success: true, profile: updatedProfile };
  } catch (err: any) {
    console.error('Failed to save profile to storage:', err);
    return {
      success: false,
      error: 'Gagal menyimpan ke penyimpanan lokal browser. Silakan coba lagi.',
    };
  }
};

/**
 * Subscribes to profile changes across any component.
 */
export const subscribeToProfileUpdates = (
  callback: (profile: PlayerProfile) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvt = e as CustomEvent<PlayerProfile>;
    if (customEvt && customEvt.detail) {
      callback(customEvt.detail);
    } else {
      callback(getStoredProfile());
    }
  };

  window.addEventListener(PROFILE_UPDATED_EVENT, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_PROFILE || e.key === STORAGE_KEY_NAME || e.key === STORAGE_KEY_STATUS) {
      callback(getStoredProfile());
    }
  });

  return () => {
    window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
  };
};
