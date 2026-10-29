import { TeamId, MapTheme, CharacterCustomization, CharacterClass, AccessoryType, WeaponSkin, CollectibleSkill } from '../../types';
import { SimPlayer, AmbientParticle, SimBoss } from '../../types/multiplayerTypes';
import { MAP_THEMES_CONFIG, INITIAL_SKILLS } from '../../config/mapThemesConfig';
import { getTeamPalette, normalizeTeamId, harmonizeCustomizationForTeam } from '../../config/teamConfig';

interface GenerateRosterOptions {
  gameModeType: 'multiplayer' | 'bot';
  totalPlayersConfig: number;
  playerTeam: TeamId;
  playerName: string;
  myPlayerId: string;
  characterCustomization: CharacterCustomization;
  roomPlayersList: any[];
  selectedMapTheme: MapTheme;
  getCharacterStats: (charClass?: CharacterClass) => { maxHp: number; speedMultiplier: number; damageMultiplier: number };
  isLocalPlayer: (id: string) => boolean;
}

export function generateMatchRoster({
  gameModeType,
  totalPlayersConfig,
  playerTeam,
  playerName,
  myPlayerId,
  characterCustomization,
  roomPlayersList,
  selectedMapTheme,
  getCharacterStats,
  isLocalPlayer,
}: GenerateRosterOptions): {
  players: SimPlayer[];
  skills: CollectibleSkill[];
  ambientParticles: AmbientParticle[];
  boss: SimBoss;
} {
  const WORLD_WIDTH = 2200;
  const WORLD_HEIGHT = 1300;
  const isMultiplayer = gameModeType === 'multiplayer';

  const botNames = [
    'Ghost_Sniper',
    'Valkyrie_Bot',
    'Titan_Mech',
    'Shadow_Reaper',
    'Nexus_Blaster',
    'Cyber_Knight',
    'Frost_Byte',
    'Apex_Hunter'
  ];

  const botClasses: CharacterClass[] = ['phantom', 'ninja', 'tanker', 'commando', 'mecha'];
  const botWeapons: WeaponSkin[] = ['dual_blaster', 'laser_cannon', 'plasma_rifle', 'pulse_shotgun'];
  const botAccessories: AccessoryType[] = ['horns', 'cyber_goggles', 'halo', 'none', 'crown'];

  const newPlayers: SimPlayer[] = [];

  // Human Player
  const normPlayerTeam = normalizeTeamId(playerTeam);
  const myPalette = getTeamPalette(normPlayerTeam);
  const mySpawnX = normPlayerTeam === 'blue'
    ? 220 + Math.random() * 60
    : (WORLD_WIDTH - 260) - Math.random() * 80;
  const mySpawnY = 560 + (Math.random() - 0.5) * 160;
  const mySpawnAngle = normPlayerTeam === 'blue' ? 0 : Math.PI;
  const myStats = getCharacterStats(characterCustomization.characterClass);

  newPlayers.push({
    id: myPlayerId,
    name: playerName || 'Player',
    team: normPlayerTeam,
    x: mySpawnX,
    y: mySpawnY,
    angle: mySpawnAngle,
    hp: myStats.maxHp,
    maxHp: myStats.maxHp,
    score: 0,
    kills: 0,
    deaths: 0,
    isBot: false,
    isShielded: true,
    shieldTimer: 3.0,
    isRespawning: false,
    respawnTimer: 0,
    color: myPalette.primary,
    customization: harmonizeCustomizationForTeam(characterCustomization, normPlayerTeam),
  });

  if (isMultiplayer) {
    const otherRoomPlayers = roomPlayersList.filter(p => !isLocalPlayer(p.id));
    otherRoomPlayers.forEach((rp, idx) => {
      const team = rp.team || (idx % 2 === 0 ? 'blue' : 'red');
      const isBlue = team === 'blue';
      const spawnX = isBlue ? 220 + Math.random() * 80 : (WORLD_WIDTH - 260) - Math.random() * 80;
      const spawnY = 360 + (idx * 120);
      const spawnAngle = isBlue ? 0 : Math.PI;
      const bClass = rp.customization?.characterClass || botClasses[idx % botClasses.length];
      const bStats = getCharacterStats(bClass);

      newPlayers.push({
        id: rp.id || `room-p-${idx}`,
        name: rp.name || rp.username || `Player_${idx + 1}`,
        team,
        x: spawnX,
        y: spawnY,
        angle: spawnAngle,
        hp: bStats.maxHp,
        maxHp: bStats.maxHp,
        score: 0,
        kills: 0,
        deaths: 0,
        isBot: rp.isBot ?? false,
        isShielded: true,
        shieldTimer: 3.0,
        isRespawning: false,
        respawnTimer: 0,
        color: isBlue ? '#38bdf8' : '#f43f5e',
        customization: rp.customization || {
          characterClass: bClass,
          primaryColor: isBlue ? '#0284c7' : '#e11d48',
          secondaryColor: isBlue ? '#0369a1' : '#be123c',
          visorColor: isBlue ? '#38bdf8' : '#fb7185',
          weaponSkin: botWeapons[idx % botWeapons.length],
          accessory: botAccessories[idx % botAccessories.length],
          trailEffect: isBlue ? 'sparks' : 'flames',
        },
      });
    });

    const remainingSlots = Math.max(0, totalPlayersConfig - newPlayers.length);
    for (let i = 0; i < remainingSlots; i++) {
      const blueCount = newPlayers.filter(p => p.team === 'blue').length;
      const redCount = newPlayers.filter(p => p.team === 'red').length;
      const team = blueCount <= redCount ? 'blue' : 'red';
      const isBlue = team === 'blue';
      const botX = isBlue ? 180 + Math.random() * 80 : (WORLD_WIDTH - 260) - Math.random() * 80;
      const botY = 360 + (newPlayers.length * 90);
      const botAngle = isBlue ? 0 : Math.PI;
      const botClass = botClasses[newPlayers.length % botClasses.length];
      const botStats = getCharacterStats(botClass);

      newPlayers.push({
        id: `bot-fill-${i}`,
        name: `${botNames[newPlayers.length % botNames.length]} (BOT)`,
        team,
        x: botX,
        y: botY,
        angle: botAngle,
        hp: botStats.maxHp,
        maxHp: botStats.maxHp,
        score: 0,
        kills: 0,
        deaths: 0,
        isBot: true,
        isShielded: true,
        shieldTimer: 3.0,
        isRespawning: false,
        respawnTimer: 0,
        color: isBlue ? '#38bdf8' : '#f43f5e',
        customization: {
          characterClass: botClass,
          primaryColor: isBlue ? '#0284c7' : '#e11d48',
          secondaryColor: isBlue ? '#0369a1' : '#be123c',
          visorColor: isBlue ? '#38bdf8' : '#fb7185',
          weaponSkin: botWeapons[i % botWeapons.length],
          accessory: botAccessories[i % botAccessories.length],
          trailEffect: isBlue ? 'sparks' : 'flames',
        },
      });
    }
  } else {
    // VS AI MODE
    const totalBotsNeeded = Math.max(1, totalPlayersConfig - 1);
    const allyBotsNeeded = Math.floor(totalBotsNeeded / 2);
    const enemyBotsNeeded = totalBotsNeeded - allyBotsNeeded;
    const blueNeeded = playerTeam === 'blue' ? allyBotsNeeded : enemyBotsNeeded;
    const redNeeded = playerTeam === 'red' ? allyBotsNeeded : enemyBotsNeeded;

    let botIdx = 0;

    for (let i = 0; i < blueNeeded; i++) {
      const botX = 180 + Math.random() * 80;
      const botY = 360 + (i * 140);
      const botAngle = 0;
      const botClass = botClasses[botIdx % botClasses.length];
      const botStats = getCharacterStats(botClass);

      newPlayers.push({
        id: `bot-blue-${i}`,
        name: `${botNames[botIdx % botNames.length]} (BOT)`,
        team: 'blue',
        x: botX,
        y: botY,
        angle: botAngle,
        hp: botStats.maxHp,
        maxHp: botStats.maxHp,
        score: 0,
        kills: 0,
        deaths: 0,
        isBot: true,
        isShielded: true,
        shieldTimer: 3.0,
        isRespawning: false,
        respawnTimer: 0,
        color: '#38bdf8',
        customization: {
          characterClass: botClass,
          primaryColor: '#0284c7',
          secondaryColor: '#0369a1',
          visorColor: '#38bdf8',
          weaponSkin: botWeapons[botIdx % botWeapons.length],
          accessory: botAccessories[botIdx % botAccessories.length],
          trailEffect: 'sparks',
        },
      });
      botIdx++;
    }

    for (let i = 0; i < redNeeded; i++) {
      const botX = (WORLD_WIDTH - 260) - Math.random() * 80;
      const botY = 360 + (i * 140);
      const botAngle = Math.PI;
      const botClass = botClasses[botIdx % botClasses.length];
      const botStats = getCharacterStats(botClass);

      newPlayers.push({
        id: `bot-red-${i}`,
        name: `${botNames[botIdx % botNames.length]} (BOT)`,
        team: 'red',
        x: botX,
        y: botY,
        angle: botAngle,
        hp: botStats.maxHp,
        maxHp: botStats.maxHp,
        score: 0,
        kills: 0,
        deaths: 0,
        isBot: true,
        isShielded: true,
        shieldTimer: 3.0,
        isRespawning: false,
        respawnTimer: 0,
        color: '#f43f5e',
        customization: {
          characterClass: botClass,
          primaryColor: '#e11d48',
          secondaryColor: '#be123c',
          visorColor: '#fb7185',
          weaponSkin: botWeapons[botIdx % botWeapons.length],
          accessory: botAccessories[botIdx % botAccessories.length],
          trailEffect: 'flames',
        },
      });
      botIdx++;
    }
  }

  const ambientParticles: AmbientParticle[] = [];
  for (let p = 0; p < 45; p++) {
    ambientParticles.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6 - 0.4,
      size: Math.random() * 3 + 1.5,
      color: MAP_THEMES_CONFIG[selectedMapTheme]?.particleColor || '#06b6d4',
      alpha: Math.random() * 0.7 + 0.3,
    });
  }

  const boss: SimBoss = {
    id: 'boss-deal-box',
    name: 'Mega Golden Deal Box',
    x: 1100,
    y: 640,
    vx: 1.2,
    vy: 0.9,
    hp: 300,
    maxHp: 300,
    size: 58,
  };

  return {
    players: newPlayers,
    skills: JSON.parse(JSON.stringify(INITIAL_SKILLS)),
    ambientParticles,
    boss,
  };
}
