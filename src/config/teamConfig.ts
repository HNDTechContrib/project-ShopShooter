import { TeamId, CharacterCustomization } from '../types';

export interface TeamPalette {
  id: TeamId;
  name: string;
  primary: string;
  secondary: string;
  visor: string;
  glow: string;
  outline: string;
  shield: string;
  shieldFill: string;
  bullet: string;
  tripleBullet: string;
  badge: string;
  badgeGlow: string;
  nameColor: string;
  radarDot: string;
  radarRing: string;
}

export const TEAM_PALETTES: Record<TeamId, TeamPalette> = {
  blue: {
    id: 'blue',
    name: 'Tim Biru',
    primary: '#0284c7', // Deep Azure Cyan/Blue
    secondary: '#0369a1', // Dark Ocean Accent
    visor: '#38bdf8', // Radiant Sky Lens
    glow: '#06b6d4', // Cyan Underglow
    outline: '#7dd3fc', // Sky highlight
    shield: '#38bdf8',
    shieldFill: 'rgba(56, 189, 248, 0.18)',
    bullet: '#38bdf8',
    tripleBullet: '#7dd3fc',
    badge: '#0284c7',
    badgeGlow: '#38bdf8',
    nameColor: '#38bdf8',
    radarDot: '#0284c7',
    radarRing: '#38bdf8',
  },
  red: {
    id: 'red',
    name: 'Tim Merah',
    primary: '#e11d48', // Vibrant Crimson Red
    secondary: '#be123c', // Deep Ruby Accent
    visor: '#fb7185', // Radiant Rose Lens
    glow: '#f43f5e', // Rose Red Underglow
    outline: '#fda4af', // Light Rose highlight
    shield: '#fb7185',
    shieldFill: 'rgba(244, 63, 94, 0.18)',
    bullet: '#fb7185',
    tripleBullet: '#fda4af',
    badge: '#e11d48',
    badgeGlow: '#fb7185',
    nameColor: '#fb7185',
    radarDot: '#e11d48',
    radarRing: '#fb7185',
  },
};

/**
 * Normalizes any string representation of team into 'blue' or 'red'
 * Handles cases like 'red', 'merah', 'RED', 'MERAH', 'blue', 'biru', etc.
 */
export const normalizeTeamId = (team?: string | null): TeamId => {
  if (!team) return 'blue';
  const lower = team.trim().toLowerCase();
  if (lower === 'red' || lower === 'merah' || lower.includes('red') || lower.includes('merah')) {
    return 'red';
  }
  return 'blue';
};

/**
 * Retrieves the full color palette for the team
 */
export const getTeamPalette = (team?: string | null): TeamPalette => {
  const norm = normalizeTeamId(team);
  return TEAM_PALETTES[norm];
};

/**
 * Synchronizes character customization colors with the selected team
 * while preserving the tank chassis class, weapon skin, accessory, and trail effects.
 */
export const harmonizeCustomizationForTeam = (
  customization: CharacterCustomization,
  team?: TeamId | string | null
): CharacterCustomization => {
  if (!team) return customization;
  const palette = getTeamPalette(team);
  return {
    ...customization,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    visorColor: palette.visor,
  };
};
