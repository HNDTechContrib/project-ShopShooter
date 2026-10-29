import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useArenaGameLoop } from '../hooks/useArenaGameLoop';
import { 
  TeamId, 
  MapTheme, 
  InGameSkillType, 
  CollectibleSkill, 
  CharacterCustomization, 
  CharacterClass, 
  AccessoryType, 
  WeaponSkin 
} from '../types';
import { soundEngine } from '../utils/audio';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../data/mockData';
import { CharacterCustomizerModal } from './CharacterCustomizerModal';
import { PlayerProfileModal } from './profile/PlayerProfileModal';
import { MapSelectorModal, MAP_CATALOG } from './MapSelectorModal';
import { ArenaScoreHeader } from './arena/hud/ArenaScoreHeader';
import { ArenaKillFeedOverlay } from './arena/hud/ArenaKillFeedOverlay';
import { ArenaRespawnModal } from './arena/hud/ArenaRespawnModal';
import { ArenaDesktopControlsBar } from './arena/hud/ArenaDesktopControlsBar';
import { ArenaMobileControls } from './arena/controls/ArenaMobileControls';
import { generateMatchRoster } from '../game/arena/rosterGenerator';
import { ArenaLobbyView } from './arena/ArenaLobbyView';
import { ArenaMatchResultModal, ArenaMatchResultStats } from './arena/ArenaMatchResultModal';
import { LobbyLightParticles } from './arena/LobbyLightParticles';
import { 
  renderArenaPerimeter, 
  renderArenaFloor, 
  renderArenaBaseZones, 
  renderThemedObstacle 
} from '../utils/arenaRenderer';
import { incrementDailyQuestProgress } from '../utils/dailyChallenge';
import { useInputDevice } from '../utils/useInputDevice';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, deleteField } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(firebaseApp);

import { 
  Users, 
  Copy, 
  Check, 
  Play, 
  Trophy, 
  Shield, 
  Zap, 
  Bot, 
  ShoppingBag, 
  RotateCcw,
  Volume2,
  VolumeX,
  Crosshair,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  Swords,
  Mountain,
  FlaskConical,
  Trees,
  Flame,
  Heart,
  Compass,
  Target,
  Skull,
  Palette,
  Wind,
  Building2,
  Boxes,
  Flower2,
  Store,
  LogOut,
  Package,
  LogIn,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Crown,
  ChevronDown,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultiplayerArenaProps {
  userDiscountPoints: number;
  onAddDiscountPoints: (points: number) => void;
  onNavigateToCart: () => void;
  onNavigateToLeaderboard: () => void;
  onTriggerSpecialNotification: (targetName: string, points: number) => void;
  themeMode?: 'dark' | 'light';
}

// World Map Dimensions
const WORLD_WIDTH = 2200;
const WORLD_HEIGHT = 1300;

import { 
  SimPlayer, 
  SimBullet, 
  SimDamageText, 
  SimBoss 
} from '../types/multiplayerTypes';

import { 
  MAP_THEMES_CONFIG, 
  INITIAL_SKILLS, 
  MapObstacle, 
  MapDecorationItem, 
  AmbientParticle 
} from '../config/mapThemesConfig';
import { 
  getTeamPalette, 
  normalizeTeamId, 
  harmonizeCustomizationForTeam 
} from '../config/teamConfig';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  subscribeToProfileUpdates 
} from '../services/profileStorage';

export const MultiplayerArena: React.FC<MultiplayerArenaProps> = ({
  userDiscountPoints,
  onAddDiscountPoints,
  onNavigateToCart,
  onNavigateToLeaderboard,
  onTriggerSpecialNotification,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';
  // Lobby and match state
  const [inLobby, setInLobby] = useState<boolean>(true);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const generateRandomRoomCode = () => {
    const prefixes = ['MALL', 'TDM', 'CYBER', 'SHOP', 'ARENA', 'NEON', 'VIP', 'PRO'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${randNum}`;
  };
  const [currentRoomCode, setCurrentRoomCode] = useState<string>(generateRandomRoomCode);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const firestoreUnsubRef = useRef<(() => void) | null>(null);
  const matchStartedRef = useRef<boolean>(false);

  // Globally unique player ID per client / tab (persisted in session)
  const myPlayerId = useRef<string>(
    (() => {
      try {
        const saved = sessionStorage.getItem('shop_shooter_unique_client_id');
        if (saved) return saved;
      } catch (e) {}
      const newId = 'player_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      try {
        sessionStorage.setItem('shop_shooter_unique_client_id', newId);
      } catch (e) {}
      return newId;
    })()
  );

  const isLocalPlayer = useCallback((id: string) => {
    if (!id) return false;
    if (myPlayerId.current && id === myPlayerId.current) return true;
    if (id === 'local-p1') return true;
    return false;
  }, []);

  const [isJoinedRoom, setIsJoinedRoom] = useState<boolean>(false);
  const [roomPlayersList, setRoomPlayersList] = useState<any[]>([]);
  const [roomHostId, setRoomHostId] = useState<string | null>(null);
  const [joinedAsHost, setJoinedAsHost] = useState<boolean>(false);

  // Host status: ONLY true if user explicitly opened the room as Host AND matches room host ID
  const isEffectiveHost = Boolean(
    isJoinedRoom && joinedAsHost && (roomHostId === null || roomHostId === myPlayerId.current)
  );

  // Authenticate anonymously with Firebase in background for Firestore security rules
  useEffect(() => {
    signInAnonymously(auth).catch((err) => {
      console.warn("Firebase Auth fallback to local UID:", err);
    });

    return () => {
      if (firestoreUnsubRef.current) {
        firestoreUnsubRef.current();
        firestoreUnsubRef.current = null;
      }
    };
  }, []);

  // Player Profile and Name State (Persisted via profileStorage single source of truth)
  const [profileData, setProfileData] = useState(() => getStoredProfile(userDiscountPoints));
  const [playerName, setPlayerName] = useState<string>(() => profileData.username);
  const [playerStatus, setPlayerStatus] = useState<string>(() => profileData.statusMessage || 'Siap bertempur di Arena TDM!');

  // Handle player name change with immediate UI sync
  const handlePlayerNameChange = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);

    // Save to storage
    saveStoredProfile({ username: trimmed }, userDiscountPoints);

    // Update in local sim
    const myP = simState.current.players.find(p => isLocalPlayer(p.id));
    if (myP) {
      myP.name = trimmed;
    }

    // Update waiting room roster immediately!
    setRoomPlayersList(prev => prev.map(p => isLocalPlayer(p.id) ? { ...p, username: trimmed, name: trimmed } : p));

    // Update in Firestore
    if (isJoinedRoom && currentRoomCode) {
      const roomRef = doc(db, 'rooms', currentRoomCode);
      updateDoc(roomRef, {
        [`players.${myPlayerId.current}.username`]: trimmed,
        [`players.${myPlayerId.current}.name`]: trimmed,
        updatedAt: Date.now()
      }).catch(() => {});
    }

    // Update in WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update-name',
        username: trimmed,
      }));
    }
  };

  // Listen to centralized profile updates
  useEffect(() => {
    const unsub = subscribeToProfileUpdates((updated) => {
      setProfileData(updated);
      if (updated.username && updated.username !== playerName) {
        setPlayerName(updated.username);
        const myP = simState.current.players.find(p => isLocalPlayer(p.id));
        if (myP) {
          myP.name = updated.username;
        }
        setRoomPlayersList(prev => prev.map(p => isLocalPlayer(p.id) ? { ...p, username: updated.username, name: updated.username } : p));
      }
      if (updated.statusMessage) {
        setPlayerStatus(updated.statusMessage);
      }
    });
    return unsub;
  }, [playerName, isLocalPlayer]);

  // Character Customization State (Persisted)
  const [characterCustomization, setCharacterCustomization] = useState<CharacterCustomization>(() => {
    try {
      const saved = localStorage.getItem('db_char_customization');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      characterClass: 'phantom',
      primaryColor: '#06b6d4',
      secondaryColor: '#0284c7',
      visorColor: '#38bdf8',
      weaponSkin: 'dual_blaster',
      accessory: 'crown',
      trailEffect: 'sparks',
    };
  });
  const [showCustomizerModal, setShowCustomizerModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const getCharacterStats = useCallback((charClass?: CharacterClass) => {
    switch (charClass) {
      case 'tanker':
        return { maxHp: 200, speedMultiplier: 0.78, damageMultiplier: 0.8 };
      case 'commando':
        return { maxHp: 80, speedMultiplier: 1.0, damageMultiplier: 1.35 };
      case 'ninja':
        return { maxHp: 90, speedMultiplier: 1.3, damageMultiplier: 1.0 };
      case 'mecha':
        return { maxHp: 150, speedMultiplier: 0.85, damageMultiplier: 1.1 };
      case 'phantom':
      default:
        return { maxHp: 100, speedMultiplier: 1.1, damageMultiplier: 1.0 };
    }
  }, []);

  // Match configurations
  const [totalPlayersConfig, setTotalPlayersConfig] = useState<number>(4);
  const [playerTeam, setPlayerTeam] = useState<TeamId>('blue');
  const [selectedMapTheme, setSelectedMapTheme] = useState<MapTheme>('mall');
  const [gameModeType, setGameModeType] = useState<'multiplayer' | 'bot'>('multiplayer');
  const [matchStatus, setMatchStatus] = useState<'lobby' | 'playing' | 'ended'>('lobby');
  const [wsConnectionStatus, setWsConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // React state for HUD
  const [hudBlueScore, setHudBlueScore] = useState<number>(0);
  const [hudRedScore, setHudRedScore] = useState<number>(0);
  const [hudTimeLeft, setHudTimeLeft] = useState<number>(90);
  const [hudMyKills, setHudMyKills] = useState<number>(0);
  const [hudMyHp, setHudMyHp] = useState<number>(100);
  const [hudActiveSkill, setHudActiveSkill] = useState<{ type: InGameSkillType; label: string; timeLeft: number } | null>(null);
  const [hudKillFeed, setHudKillFeed] = useState<{ id: string; text: string; team: TeamId }[]>([]);
  const [hudRespawnTimer, setHudRespawnTimer] = useState<number>(0);
  const matchAwardGivenRef = useRef<boolean>(false);
  const [matchResultStats, setMatchResultStats] = useState<ArenaMatchResultStats | null>(null);

  // Intelligent Device Input Detection (Mobile Touch vs Desktop Keyboard/Mouse)
  const inputDevice = useInputDevice();
  const showVirtualControls = inputDevice.showVirtualControls;
  const lastDashTime = useRef<number>(0);
  const [hudDashCooldown, setHudDashCooldown] = useState<number>(0);
  const [virtualJoyActive, setVirtualJoyActive] = useState<boolean>(false);
  const [joyKnobPos, setJoyKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSelectingPlayers, setIsSelectingPlayers] = useState<boolean>(false);
  const [showMapSelectorModal, setShowMapSelectorModal] = useState<boolean>(false);

  // Canvas and Engine References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const arenaContainerRef = useRef<HTMLDivElement | null>(null);
  const keysPressed = useRef<Record<string, boolean>>({});
  const mouseWorldPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDown = useRef<boolean>(false);
  const lastShotTime = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);

  // Mobile virtual joystick vector (-1 to 1)
  const mobileMoveVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const joyTouchId = useRef<number | null>(null);
  const joyOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const aimTouchId = useRef<number | null>(null);

  interface ShopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  type: 'receipt' | 'coin' | 'bag';
  color: string;
  alpha: number;
  scale: number;
}

// Mutable Game Simulation State (Ref for 60 FPS zero React DOM lag)
  const simState = useRef<{
    players: SimPlayer[];
    bullets: SimBullet[];
    boss: SimBoss | null;
    damageTexts: SimDamageText[];
    skills: CollectibleSkill[];
    ambientParticles: AmbientParticle[];
    shoppingParticles: ShopParticle[];
    blueScore: number;
    redScore: number;
    timeLeft: number;
    cameraX: number;
    cameraY: number;
    currentTheme: MapTheme;
  }>({
    players: [],
    bullets: [],
    boss: null,
    damageTexts: [],
    skills: JSON.parse(JSON.stringify(INITIAL_SKILLS)),
    ambientParticles: [],
    shoppingParticles: [],
    blueScore: 0,
    redScore: 0,
    timeLeft: 90,
    cameraX: 0,
    cameraY: 0,
    currentTheme: 'mall',
  });

  const shootLaser = useCallback((playerId: string) => {
    const p = simState.current.players.find((item) => item.id === playerId || (isLocalPlayer(playerId) && isLocalPlayer(item.id)));
    if (!p || p.isRespawning) return;

    const isRapid = p.activeSkill?.type === 'rapidfire';
    const isTriple = p.activeSkill?.type === 'tripleshot';

    const minDelay = isRapid ? 80 : 170;
    const now = Date.now();

    if (isLocalPlayer(playerId)) {
      if (now - lastShotTime.current < minDelay) return;
      lastShotTime.current = now;
      if (isTriple) soundEngine.playMultiShot();
      else soundEngine.playShoot();
    }

    if (p.isShielded && (!p.activeSkill || p.activeSkill.type !== 'shield')) {
      p.isShielded = false;
      p.shieldTimer = 0;
    }

    const speed = 23;
    const pTeam = normalizeTeamId(p.team);
    const pPalette = getTeamPalette(pTeam);
    const laserColor = isTriple ? pPalette.tripleBullet : pPalette.bullet;

    const createBullet = (fireAngle: number) => ({
      id: `${p.id}-${now}-${Math.random()}`,
      shooterId: p.id,
      team: pTeam,
      x: p.x + Math.cos(fireAngle) * 30,
      y: p.y + Math.sin(fireAngle) * 30,
      vx: Math.cos(fireAngle) * speed,
      vy: Math.sin(fireAngle) * speed,
      damage: Math.floor(18 + Math.random() * 25),
      color: laserColor,
      life: 75,
    });

    const pushAndSendBullet = (bullet: any) => {
      simState.current.bullets.push(bullet);
      if (gameModeType === 'multiplayer' && isLocalPlayer(playerId) && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'player-shoot',
          bullet,
        }));
      }
    };

    if (isTriple) {
      pushAndSendBullet(createBullet(p.angle - 0.22));
      pushAndSendBullet(createBullet(p.angle));
      pushAndSendBullet(createBullet(p.angle + 0.22));
    } else {
      pushAndSendBullet(createBullet(p.angle));
    }
  }, [gameModeType, isLocalPlayer]);

  const finishMatch = useCallback(() => {
    matchStartedRef.current = false;
    setMatchStatus('ended');

    const finalBlue = simState.current.blueScore;
    const finalRed = simState.current.redScore;
    const myPlayer = simState.current.players.find((p) => isLocalPlayer(p.id)) || simState.current.players.find((p) => !p.isBot);
    const myTeam = myPlayer?.team || playerTeam;

    let outcome: 'victory' | 'defeat' | 'draw' = 'draw';
    if (finalBlue === finalRed) {
      outcome = 'draw';
    } else if (finalBlue > finalRed) {
      outcome = myTeam === 'blue' ? 'victory' : 'defeat';
    } else {
      outcome = myTeam === 'red' ? 'victory' : 'defeat';
    }

    const isWinner = outcome === 'victory';
    const isDraw = outcome === 'draw';
    const baseReward = isWinner ? 500 : isDraw ? 250 : 150;
    const kills = myPlayer?.kills || 0;
    const killBonus = kills * 30;
    const totalAward = baseReward + killBonus;

    setMatchResultStats({
      outcome,
      blueScore: finalBlue,
      redScore: finalRed,
      playerKills: kills,
      playerTeam: myTeam,
      pointsAwarded: totalAward,
    });

    // Guard against duplicate points addition if finishMatch is called multiple times
    if (!matchAwardGivenRef.current) {
      matchAwardGivenRef.current = true;
      onAddDiscountPoints(totalAward);

      incrementDailyQuestProgress('match', 1);
      if (isWinner) {
        incrementDailyQuestProgress('win', 1);
      }
      incrementDailyQuestProgress('score', totalAward);
    }

    if (isWinner) {
      soundEngine.playCheckoutSuccess();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });
    }
  }, [isLocalPlayer, playerTeam, onAddDiscountPoints]);

  const addKillFeed = useCallback((killer: string, victim: string, team: TeamId) => {
    const id = `${Date.now()}-${Math.random()}`;
    const text = `💥 ${killer} mengeliminasi ${victim} (+1 Skor)`;
    setHudKillFeed((prev) => [{ id, text, team }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setHudKillFeed((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const addDamageText = useCallback((text: string, x: number, y: number, color: string) => {
    simState.current.damageTexts.push({
      id: `${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
    });
  }, []);

  const respawnSinglePlayer = useCallback((p: SimPlayer) => {
    p.isRespawning = false;
    const stats = getCharacterStats(p.customization?.characterClass);
    p.maxHp = stats.maxHp;
    p.hp = stats.maxHp;
    p.isShielded = true;
    p.shieldTimer = 3.0;
    p.respawnTimer = 0;

    if (p.team === 'blue') {
      p.x = 220 + Math.random() * 80;
      p.y = 380 + Math.random() * 480;
      p.angle = 0;
    } else {
      p.x = (WORLD_WIDTH - 260) - Math.random() * 80;
      p.y = 380 + Math.random() * 480;
      p.angle = Math.PI;
    }

    if (isLocalPlayer(p.id)) {
      setHudRespawnTimer(0);
      setHudMyHp(p.maxHp);
      soundEngine.playPowerUp();
      addDamageText('🛡️ PERISAI KEBAL (3s)', p.x, p.y - 25, '#facc15');
    }
  }, [getCharacterStats, isLocalPlayer]);

  useArenaGameLoop({
    matchStatus,
    simState,
    canvasRef,
    minimapCanvasRef,
    keysPressed,
    isMouseDown,
    mobileMoveVector,
    lastDashTime,
    isLocalPlayer,
    getCharacterStats,
    finishMatch,
    shootLaser,
    respawnSinglePlayer,
    addDamageText,
    addKillFeed,
    setHudRespawnTimer,
    setHudTimeLeft,
    setHudBlueScore,
    setHudRedScore,
    setHudDashCooldown,
    setHudMyHp,
    setHudMyKills,
    setHudActiveSkill,
    wsRef,
    myPlayerId,
    isDark,
    gameModeType,
  });

  // Save customization changes
  const handleCustomizationChange = (newCustom: CharacterCustomization) => {
    setCharacterCustomization(newCustom);
    try {
      localStorage.setItem('db_char_customization', JSON.stringify(newCustom));
    } catch (e) {}

    // update current local player if match is active
    const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
    if (myP) {
      myP.customization = newCustom;
    }

    if (isJoinedRoom && currentRoomCode) {
      const roomRef = doc(db, 'rooms', currentRoomCode);
      updateDoc(roomRef, {
        [`players.${myPlayerId.current}.customization`]: newCustom,
        updatedAt: Date.now()
      }).catch(() => {});
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (arenaContainerRef.current?.requestFullscreen) {
        arenaContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Copy room code
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(currentRoomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy shareable room link
  const handleCopyRoomLink = () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?room=${currentRoomCode}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      handleCopyRoomCode();
    }
  };

  // Parse URL room code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room') || window.location.hash.replace('#', '');
    if (urlRoom) {
      const cleanRoom = urlRoom.toUpperCase().trim();
      setCurrentRoomCode(cleanRoom);
      setRoomCodeInput(cleanRoom);
      setGameModeType('multiplayer');
    }
  }, []);

  // Add Bot to Room
  const handleAddBot = async () => {
    soundEngine.playPowerUp();
    const botNames = ['Cyber_Sniper', 'Valkyrie_Bot', 'Titan_Mech', 'Shadow_Reaper', 'Nexus_Bot', 'Apex_Bot'];
    const botId = `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const currentCount = roomPlayersList.length;
    if (currentCount >= totalPlayersConfig) return;

    const blueCount = roomPlayersList.filter(p => p.team === 'blue').length;
    const redCount = roomPlayersList.filter(p => p.team === 'red').length;
    const team = blueCount <= redCount ? 'blue' : 'red';

    const botSpawnX = team === 'blue' 
      ? 220 + Math.random() * 80 
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const botAngle = team === 'blue' ? 0 : Math.PI;

    const botDisplayName = `${botNames[currentCount % botNames.length]} (BOT)`;
    const newBot = {
      id: botId,
      name: botDisplayName,
      username: botDisplayName,
      team,
      color: team === 'blue' ? '#38bdf8' : '#f43f5e',
      isReady: true,
      isBot: true,
      hp: 100,
      maxHp: 100,
      score: 0,
      kills: 0,
      deaths: 0,
      x: botSpawnX,
      y: 380 + (currentCount * 65),
      angle: botAngle,
    };

    // Update locally immediately
    setRoomPlayersList(prev => {
      if (prev.length >= totalPlayersConfig || prev.some(p => p.id === botId)) return prev;
      return [...prev, newBot];
    });

    // Send the SAME bot to WebSocket server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'add-bot',
        bot: newBot,
      }));
    }

    // Update in Firestore
    if (currentRoomCode) {
      try {
        const roomRef = doc(db, 'rooms', currentRoomCode);
        await updateDoc(roomRef, {
          [`players.${botId}`]: newBot,
          updatedAt: Date.now(),
        });
      } catch (e) {
        console.warn("Firestore add bot error:", e);
      }
    }
  };

  // Leave Match / Return to Clean Lobby & Reset for New Match
  const handleLeaveMatch = async () => {
    soundEngine.playPowerUp();

    // 1. Clean up Multiplayer room (Firestore & WebSocket)
    if (currentRoomCode && isJoinedRoom) {
      try {
        const roomRef = doc(db, 'rooms', currentRoomCode);
        if (joinedAsHost) {
          await deleteDoc(roomRef);
        } else {
          await updateDoc(roomRef, {
            [`players.${myPlayerId.current}`]: deleteField(),
            updatedAt: Date.now(),
          });
        }
      } catch (e) {
        console.warn("Firestore leave match error:", e);
      }
    }

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          if (joinedAsHost) {
            wsRef.current.send(JSON.stringify({ type: 'delete-room' }));
          } else {
            wsRef.current.send(JSON.stringify({ type: 'leave-room' }));
          }
        }
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    if (firestoreUnsubRef.current) {
      firestoreUnsubRef.current();
      firestoreUnsubRef.current = null;
    }

    // 2. Completely reset match simulation state
    matchStartedRef.current = false;
    simState.current.players = [];
    simState.current.bullets = [];
    simState.current.damageTexts = [];
    simState.current.blueScore = 0;
    simState.current.redScore = 0;
    simState.current.timeLeft = 90;
    simState.current.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS));
    simState.current.boss = null;
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }

    // 3. Reset all HUD indicators to fresh values
    setHudBlueScore(0);
    setHudRedScore(0);
    setHudTimeLeft(90);
    setHudMyHp(100);
    setHudMyKills(0);
    setHudKillFeed([]);
    setHudActiveSkill(null);
    setHudRespawnTimer(0);

    // 4. Reset Room & Lobby state completely
    setIsJoinedRoom(false);
    setJoinedAsHost(false);
    setRoomHostId(null);
    setRoomPlayersList([]);
    setRoomCodeInput('');
    setCurrentRoomCode(generateRandomRoomCode());

    // 5. Return to clean lobby
    setMatchStatus('lobby');
    setInLobby(true);
  };

  // Push to Kill Feed


  // Instant Respawn button for human player
  const handleInstantRespawn = () => {
    const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
    if (myP && myP.isRespawning) {
      respawnSinglePlayer(myP);
    }
  };

  // Unified Dash ability for both Mobile (DASH button) and Desktop (Space / Shift)
  const triggerDash = useCallback(() => {
    const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
    if (!myP || myP.isRespawning) return;

    const now = Date.now();
    const cooldownMs = 3500;
    const timeSinceLast = now - lastDashTime.current;

    if (timeSinceLast < cooldownMs) {
      const remainingSec = Math.ceil((cooldownMs - timeSinceLast) / 1000);
      addDamageText(`⏳ DASH CD (${remainingSec}s)`, myP.x, myP.y - 20, '#94a3b8');
      return;
    }

    lastDashTime.current = now;
    setHudDashCooldown(3.5);

    myP.activeSkill = {
      type: 'speed',
      timeLeft: 3.5,
    };
    soundEngine.playPowerUp();
    addDamageText('💨 DASH EVASIVE!', myP.x, myP.y - 20, '#10b981');
  }, [isLocalPlayer]);

  // Initialize Roster, Skills & Particles via modular generator
  const initRoster = useCallback((forcedMode?: 'bot' | 'multiplayer', customTotalSlots?: number) => {
    const effectiveMode = forcedMode || gameModeType;
    const effectiveSlots = customTotalSlots || totalPlayersConfig;

    const roster = generateMatchRoster({
      gameModeType: effectiveMode,
      totalPlayersConfig: effectiveSlots,
      playerTeam,
      playerName,
      myPlayerId: myPlayerId.current,
      characterCustomization,
      roomPlayersList,
      selectedMapTheme,
      getCharacterStats,
      isLocalPlayer,
    });

    simState.current.players = roster.players;
    simState.current.bullets = [];
    simState.current.damageTexts = [];
    simState.current.skills = roster.skills;
    simState.current.ambientParticles = roster.ambientParticles;
    simState.current.blueScore = 0;
    simState.current.redScore = 0;
    simState.current.timeLeft = 90;
    simState.current.currentTheme = selectedMapTheme;
    simState.current.boss = roster.boss;
  }, [totalPlayersConfig, playerTeam, selectedMapTheme, characterCustomization, gameModeType, roomPlayersList, playerName, isLocalPlayer, getCharacterStats]);

  // Switch Team (Tim Biru / Tim Merah) with live sync
  const handleSelectTeam = async (newTeam: TeamId) => {
    const normTeam = normalizeTeamId(newTeam);
    setPlayerTeam(normTeam);
    soundEngine.playPowerUp();

    const tPalette = getTeamPalette(normTeam);
    const newSpawnX = normTeam === 'blue' 
      ? 220 + Math.random() * 60 
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const newSpawnAngle = normTeam === 'blue' ? 0 : Math.PI;

    const myP = simState.current.players.find(p => isLocalPlayer(p.id));
    if (myP) {
      myP.team = normTeam;
      myP.color = tPalette.primary;
      myP.x = newSpawnX;
      myP.y = 440 + Math.random() * 200;
      myP.angle = newSpawnAngle;
      if (myP.customization) {
        myP.customization = harmonizeCustomizationForTeam(myP.customization, normTeam);
      }
    }

    setRoomPlayersList(prev => prev.map(p => isLocalPlayer(p.id) ? { 
      ...p, 
      team: normTeam, 
      color: tPalette.primary,
      x: newSpawnX,
      angle: newSpawnAngle,
      customization: p.customization ? harmonizeCustomizationForTeam(p.customization, normTeam) : undefined,
    } : p));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentRoomCode) {
      wsRef.current.send(JSON.stringify({
        type: 'change-team',
        team: normTeam,
        playerId: myPlayerId.current,
        roomCode: currentRoomCode,
      }));
    }

    if (isJoinedRoom && currentRoomCode) {
      try {
        const roomRef = doc(db, 'rooms', currentRoomCode);
        const uid = myPlayerId.current;
        await updateDoc(roomRef, {
          [`players.${uid}.team`]: normTeam,
          [`players.${uid}.color`]: tPalette.primary,
          [`players.${uid}.x`]: newSpawnX,
          [`players.${uid}.y`]: 440 + Math.random() * 200,
          [`players.${uid}.angle`]: newSpawnAngle,
        });
      } catch (e) {
        console.warn("Firestore update team error:", e);
      }
    }
  };

  // Update total player slots live (2 to 8 players)
  const handleUpdateTotalSlots = async (newSlots: number) => {
    soundEngine.playPowerUp();
    setTotalPlayersConfig(newSlots);

    if (currentRoomCode && isEffectiveHost) {
      try {
        const roomRef = doc(db, 'rooms', currentRoomCode);
        await updateDoc(roomRef, {
          totalSlots: newSlots,
          updatedAt: Date.now(),
        });
      } catch (e) {
        console.warn("Firestore update totalSlots error:", e);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update-slots',
          totalSlots: newSlots,
        }));
      }
    }
  };

  // Select map theme with live multiplayer room sync
  const handleSelectMapTheme = async (newTheme: MapTheme) => {
    setSelectedMapTheme(newTheme);
    simState.current.currentTheme = newTheme;
    soundEngine.playPowerUp();

    if (currentRoomCode && isEffectiveHost) {
      try {
        const roomRef = doc(db, 'rooms', currentRoomCode);
        await updateDoc(roomRef, {
          mapTheme: newTheme,
          updatedAt: Date.now(),
        });
      } catch (e) {
        console.warn("Firestore update mapTheme error:", e);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'change-map',
          mapTheme: newTheme,
        }));
      }
    }
  };

  // Connect / Join Multiplayer Room
  const handleJoinMultiplayerRoom = async (targetCode?: string, asHost: boolean = false) => {
    soundEngine.playPowerUp();
    const codeToUse = (targetCode || roomCodeInput.trim() || currentRoomCode).toUpperCase();
    if (!codeToUse) return;

    const myId = myPlayerId.current;
    setCurrentRoomCode(codeToUse);
    setJoinedAsHost(asHost);

    const safeName = playerName.trim() || 'Pemain';

    // Set local player in simulation with unique client ID
    if (gameModeType === 'multiplayer') {
      simState.current.players = [];
    }
    let myP = simState.current.players.find(p => isLocalPlayer(p.id));
    if (!myP) {
      initRoster();
      myP = simState.current.players.find(p => isLocalPlayer(p.id));
    }
    const initialSpawnX = playerTeam === 'blue'
      ? 220 + Math.random() * 60
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const initialSpawnAngle = playerTeam === 'blue' ? 0 : Math.PI;

    if (myP) {
      myP.id = myId;
      myP.name = safeName;
      myP.team = playerTeam;
      myP.color = playerTeam === 'blue' ? '#38bdf8' : '#f43f5e';
      myP.x = initialSpawnX;
      myP.y = 440 + Math.random() * 200;
      myP.angle = initialSpawnAngle;
    }

    const myPlayerData = {
      id: myId,
      name: safeName,
      username: safeName,
      team: playerTeam,
      color: playerTeam === 'blue' ? '#38bdf8' : '#f43f5e',
      score: 0,
      kills: 0,
      deaths: 0,
      hp: 100,
      maxHp: 100,
      x: initialSpawnX,
      y: 440 + Math.random() * 200,
      angle: initialSpawnAngle,
      isReady: true,
      isBot: false,
      customization: characterCustomization,
    };

    setMatchStatus('lobby');
    setInLobby(true);
    setIsJoinedRoom(true);
    setRoomPlayersList([myPlayerData]);

    // 1. FIRESTORE REALTIME SYNC (Master cloud state for rooms and player roster across devices)
    try {
      const roomRef = doc(db, 'rooms', codeToUse);
      if (firestoreUnsubRef.current) {
        firestoreUnsubRef.current();
        firestoreUnsubRef.current = null;
      }

      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        if (!asHost) {
          alert(`Room "${codeToUse}" belum aktif. Pastikan Host telah membuka room.`);
          setIsJoinedRoom(false);
          setJoinedAsHost(false);
          setRoomPlayersList([]);
          return;
        }
        setJoinedAsHost(true);
        setRoomHostId(myId);
        await setDoc(roomRef, {
          code: codeToUse,
          gameState: 'waiting',
          totalSlots: totalPlayersConfig,
          mapTheme: selectedMapTheme,
          blueScore: 0,
          redScore: 0,
          timeLeft: 90,
          hostId: myId,
          updatedAt: Date.now(),
          players: {
            [myId]: myPlayerData,
          },
        });
      } else {
        const existingData = snap.data();
        if (asHost) {
          setJoinedAsHost(true);
          setRoomHostId(myId);
          await updateDoc(roomRef, {
            gameState: 'waiting',
            hostId: myId,
            totalSlots: totalPlayersConfig,
            blueScore: 0,
            redScore: 0,
            timeLeft: 90,
            players: {
              [myId]: myPlayerData,
            },
            updatedAt: Date.now(),
          });
        } else {
          setJoinedAsHost(false);
          if (existingData?.hostId) {
            setRoomHostId(existingData.hostId);
          }
          await updateDoc(roomRef, {
            [`players.${myId}`]: myPlayerData,
            updatedAt: Date.now(),
          });
        }
      }

      // Real-time snapshot listener on room doc
      firestoreUnsubRef.current = onSnapshot(roomRef, (docSnap) => {
        if (!docSnap.exists()) {
          // Room was deleted by host
          setIsJoinedRoom(false);
          setJoinedAsHost(false);
          setRoomHostId(null);
          setRoomPlayersList([]);
          return;
        }
        const data = docSnap.data();
        const playersMap = data.players || {};
        const playersList = Object.values(playersMap) as any[];
        setRoomPlayersList(playersList);

        if (data.hostId) {
          setRoomHostId(data.hostId);
        }

        // If player was kicked or removed from room
        if (!asHost && playersMap && !playersMap[myId] && playersList.length > 0) {
          setIsJoinedRoom(false);
          setJoinedAsHost(false);
          setRoomHostId(null);
          setRoomPlayersList([]);
          return;
        }

        if (data.mapTheme) {
          setSelectedMapTheme(data.mapTheme);
          simState.current.currentTheme = data.mapTheme;
        }
        if (data.totalSlots) setTotalPlayersConfig(data.totalSlots);

        // Update local team if synced from room
        if (playersMap[myId]) {
          setPlayerTeam(playersMap[myId].team);
          if (myP) {
            myP.team = playersMap[myId].team;
            myP.color = playersMap[myId].team === 'blue' ? '#38bdf8' : '#f43f5e';
          }
          setPlayerTeam(playersMap[myId].team);
        }

        // When host starts match!
        if (data.gameState === 'playing' && !matchStartedRef.current && gameModeType === 'multiplayer') {
          matchStartedRef.current = true;
          if (data.mapTheme) {
            setSelectedMapTheme(data.mapTheme);
            simState.current.currentTheme = data.mapTheme;
          }
          const myTeam = playersMap[myId]?.team || playerTeam;
          simState.current.players = playersList.map((p, pIdx) => {
            const isLocal = isLocalPlayer(p.id);
            const spawnX = p.team === 'blue'
              ? 220 + Math.random() * 80 
              : (WORLD_WIDTH - 260) - Math.random() * 80;
            const spawnY = 360 + (pIdx * 120);
            const spawnAngle = p.team === 'blue' ? 0 : Math.PI;

            const displayName = (p.name || p.username || (isLocal ? safeName : 'Striker')).trim();

            if (isLocal) {
              return { 
                ...p, 
                id: myId, 
                name: displayName,
                username: displayName,
                x: spawnX, 
                y: spawnY, 
                angle: spawnAngle, 
                hp: p.hp || 100,
                maxHp: 100,
                isShielded: true,
                shieldTimer: 3.0,
                isRespawning: false,
                respawnTimer: 0,
                customization: characterCustomization,
              };
            }
            return {
              ...p,
              id: p.id,
              name: displayName,
              username: displayName,
              x: p.x || spawnX,
              y: p.y || spawnY,
              angle: p.angle !== undefined ? p.angle : spawnAngle,
              isBot: p.isBot || false,
              isShielded: true,
              shieldTimer: 3.0,
              isRespawning: false,
              respawnTimer: 0,
            };
          });

          if (data.blueScore !== undefined) simState.current.blueScore = data.blueScore;
          if (data.redScore !== undefined) simState.current.redScore = data.redScore;
          if (data.timeLeft !== undefined) {
            simState.current.timeLeft = data.timeLeft;
            setHudTimeLeft(Math.max(0, Math.floor(data.timeLeft)));
          }

          setInLobby(false);
          setMatchStatus('playing');
          soundEngine.playPowerUp();
          onTriggerSpecialNotification('Mega Golden Deal Box', 300);
        } else if (data.gameState === 'playing' && matchStatus === 'playing') {
          // Fallback positional sync from Firestore
          playersList.forEach((remoteP) => {
            if (!isLocalPlayer(remoteP.id)) {
              const localSimP = simState.current.players.find(p => p.id === remoteP.id);
              if (localSimP && remoteP.x !== undefined && remoteP.y !== undefined) {
                if (Math.abs(localSimP.x - remoteP.x) > 40 || Math.abs(localSimP.y - remoteP.y) > 40) {
                  localSimP.x = remoteP.x;
                  localSimP.y = remoteP.y;
                  if (remoteP.angle !== undefined) localSimP.angle = remoteP.angle;
                }
              }
            }
          });
        } else if (data.gameState === 'ended' && matchStatus === 'playing') {
          finishMatch();
        }
      });
    } catch (err) {
      console.warn("Firestore sync warning:", err);
    }

    // 2. WEBSOCKET FAST REALTIME PROTOCOL (Using unique player client ID)
    try {
      if (wsRef.current) wsRef.current.close();
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      setWsConnectionStatus('connecting');

      ws.onopen = () => {
        setWsConnectionStatus('connected');
        ws.send(JSON.stringify({
          type: 'join-room',
          roomCode: codeToUse,
          totalSlots: totalPlayersConfig,
          player: myPlayerData,
          asHost,
        }));
      };

      ws.onerror = () => {
        setWsConnectionStatus('disconnected');
      };

      ws.onclose = () => {
        setWsConnectionStatus('disconnected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'room-updated') {
            if (data.room && data.room.players) {
              const roomPlayers = Object.values(data.room.players) as any[];
              setRoomPlayersList(roomPlayers);
            }
            if (data.room && data.room.totalSlots) {
              setTotalPlayersConfig(data.room.totalSlots);
            }
            if (data.room && data.room.mapTheme) {
              setSelectedMapTheme(data.room.mapTheme);
              simState.current.currentTheme = data.room.mapTheme;
            }
          } else if (data.type === 'match-started') {
            if (data.room && data.room.mapTheme) {
              setSelectedMapTheme(data.room.mapTheme);
              simState.current.currentTheme = data.room.mapTheme;
            }
            if (!matchStartedRef.current && data.room && data.room.players && gameModeType === 'multiplayer') {
              matchStartedRef.current = true;
              const roomPlayers = Object.values(data.room.players) as any[];
              simState.current.players = roomPlayers.map((p, pIdx) => {
                const isLocal = isLocalPlayer(p.id);
                const spawnX = p.team === 'blue'
                  ? 220 + Math.random() * 80 
                  : (WORLD_WIDTH - 260) - Math.random() * 80;
                const spawnY = 360 + (pIdx * 120);
                const spawnAngle = p.team === 'blue' ? 0 : Math.PI;

                const displayName = (p.name || p.username || (isLocal ? safeName : 'Striker')).trim();

                if (isLocal) {
                  return { 
                    ...p, 
                    id: myId, 
                    name: displayName, 
                    username: displayName, 
                    x: spawnX, 
                    y: spawnY, 
                    angle: spawnAngle, 
                    hp: p.hp || 100, 
                    maxHp: 100, 
                    isShielded: true, 
                    shieldTimer: 3.0,
                    isRespawning: false,
                    respawnTimer: 0,
                  };
                }
                return {
                  ...p,
                  id: p.id,
                  name: displayName,
                  username: displayName,
                  x: spawnX,
                  y: spawnY,
                  angle: spawnAngle,
                  isBot: p.isBot || false,
                  isShielded: true,
                  shieldTimer: 3.0,
                  isRespawning: false,
                  respawnTimer: 0,
                };
              });
            }
            if (data.room.blueScore !== undefined) simState.current.blueScore = data.room.blueScore;
            if (data.room.redScore !== undefined) simState.current.redScore = data.room.redScore;
            if (data.room.timeLeft !== undefined) simState.current.timeLeft = data.room.timeLeft;

            setInLobby(false);
            setMatchStatus('playing');
            soundEngine.playPowerUp();
            onTriggerSpecialNotification('Mega Golden Deal Box', 300);
          } else if (data.type === 'player-moved') {
            if (data.playerId && data.playerId !== myPlayerId.current) {
              const p = simState.current.players.find(item => item.id === data.playerId);
              if (p) {
                if (data.updates.x !== undefined) p.x = data.updates.x;
                if (data.updates.y !== undefined) p.y = data.updates.y;
                if (data.updates.angle !== undefined) p.angle = data.updates.angle;
                if (data.updates.hp !== undefined) p.hp = data.updates.hp;
                if (data.updates.score !== undefined) p.score = data.updates.score;
                if (data.updates.kills !== undefined) p.kills = data.updates.kills;
                if (data.updates.deaths !== undefined) p.deaths = data.updates.deaths;
              }
            }
          } else if (data.type === 'bullet-fired') {
            if (data.playerId && data.playerId !== myPlayerId.current && data.bullet) {
              simState.current.bullets.push(data.bullet);
            }
          } else if (data.type === 'room-deleted') {
            setIsJoinedRoom(false);
            setJoinedAsHost(false);
            setRoomHostId(null);
            setRoomPlayersList([]);
            if (firestoreUnsubRef.current) {
              firestoreUnsubRef.current();
              firestoreUnsubRef.current = null;
            }
          } else if (data.type === 'player-left') {
            if (data.room && data.room.players) {
              const roomPlayers = Object.values(data.room.players) as any[];
              setRoomPlayersList(roomPlayers);
            } else if (data.playerId) {
              setRoomPlayersList(prev => prev.filter(p => p.id !== data.playerId));
            }
          } else if (data.type === 'match-ended') {
            finishMatch();
          }
        } catch (err) {
          console.error(err);
        }
      };
    } catch (e) {
      console.error("WS error:", e);
    }
  };

  // Trigger Start Match (Bot or Multiplayer)
  const startMatch = useCallback(async (forcedMode?: 'bot' | 'multiplayer') => {
    const effectiveMode = forcedMode || gameModeType;
    if (forcedMode && forcedMode !== gameModeType) {
      setGameModeType(forcedMode);
    }

    matchStartedRef.current = true;
    simState.current.currentTheme = selectedMapTheme;

    // Reset all HUD indicators for fresh match!
    setHudBlueScore(0);
    setHudRedScore(0);
    setHudTimeLeft(90);
    setHudMyHp(100);
    setHudMyKills(0);
    setHudKillFeed([]);
    setHudActiveSkill(null);
    setHudRespawnTimer(0);
    matchAwardGivenRef.current = false;
    setMatchResultStats(null);

    initRoster(effectiveMode);
    setInLobby(false);
    setMatchStatus('playing');
    soundEngine.playPowerUp();
    onTriggerSpecialNotification('Mega Golden Deal Box', 300);

    if (effectiveMode === 'multiplayer') {
      // Start match in Firestore with fresh score & timer
      if (currentRoomCode) {
        try {
          const roomRef = doc(db, 'rooms', currentRoomCode);
          await updateDoc(roomRef, {
            gameState: 'playing',
            mapTheme: selectedMapTheme,
            blueScore: 0,
            redScore: 0,
            timeLeft: 90,
            updatedAt: Date.now(),
          });
        } catch (e) {
          console.warn("Firestore start match error:", e);
        }
      }
      // Also send via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ 
          type: 'start-match', 
          mapTheme: selectedMapTheme,
          players: simState.current.players,
        }));
      }
    }
  }, [gameModeType, selectedMapTheme, initRoster, currentRoomCode, onTriggerSpecialNotification]);

  const handleKickPlayer = async (targetId: string) => {
    soundEngine.playPowerUp();

    // 1. Immediately remove from local state so UI is instantly responsive and accurate
    setRoomPlayersList(prev => prev.filter(p => p.id !== targetId));

    // 2. Remove in Firestore
    if (currentRoomCode) {
      try {
        const roomRef = doc(db, 'rooms', currentRoomCode);
        await updateDoc(roomRef, {
          [`players.${targetId}`]: deleteField(),
          updatedAt: Date.now(),
        });
      } catch (e) {
        console.warn("Firestore kick error:", e);
      }
    }

    // 3. Remove in WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'kick-player',
        targetId,
      }));
    }
  };

  const handleUpdateBotTeam = async (botId: string, newTeam: 'blue' | 'red') => {
    if (!currentRoomCode) return;
    soundEngine.playPowerUp();

    const newX = newTeam === 'blue' 
      ? 220 + Math.random() * 80 
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const newAngle = newTeam === 'blue' ? 0 : Math.PI;

    // 1. Instantly update local state
    setRoomPlayersList(prev => prev.map(p => {
      if (p.id === botId) {
        return {
          ...p,
          team: newTeam,
          color: newTeam === 'blue' ? '#38bdf8' : '#f43f5e',
          x: newX,
          angle: newAngle,
        };
      }
      return p;
    }));

    // 2. Notify via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update-bot-team',
        botId,
        team: newTeam,
      }));
    }

    // 3. Update in Firestore
    try {
      const roomRef = doc(db, 'rooms', currentRoomCode);
      await updateDoc(roomRef, {
        [`players.${botId}.team`]: newTeam,
        [`players.${botId}.color`]: newTeam === 'blue' ? '#38bdf8' : '#f43f5e',
        [`players.${botId}.x`]: newX,
        [`players.${botId}.angle`]: newAngle,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn("Firestore update bot team error:", e);
    }
  };

  // Host deletes the waiting room
  const handleDeleteRoom = async () => {
    soundEngine.playPowerUp();
    const code = currentRoomCode;

    if (code) {
      try {
        const roomRef = doc(db, 'rooms', code);
        await deleteDoc(roomRef);
      } catch (e) {
        console.warn("Firestore delete room error:", e);
      }
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'delete-room',
      }));
    }

    if (firestoreUnsubRef.current) {
      firestoreUnsubRef.current();
      firestoreUnsubRef.current = null;
    }
    matchStartedRef.current = false;
    setIsJoinedRoom(false);
    setJoinedAsHost(false);
    setRoomHostId(null);
    setRoomPlayersList([]);
    const freshCode = generateRandomRoomCode();
    setCurrentRoomCode(freshCode);
  };

  // Guest leaves the waiting room
  const handleLeaveRoom = async () => {
    soundEngine.playPowerUp();
    const code = currentRoomCode;

    if (code) {
      try {
        const roomRef = doc(db, 'rooms', code);
        await updateDoc(roomRef, {
          [`players.${myPlayerId.current}`]: deleteField(),
          updatedAt: Date.now(),
        });
      } catch (e) {
        console.warn("Firestore leave room error:", e);
      }
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leave-room',
      }));
    }

    if (firestoreUnsubRef.current) {
      firestoreUnsubRef.current();
      firestoreUnsubRef.current = null;
    }
    matchStartedRef.current = false;
    setIsJoinedRoom(false);
    setJoinedAsHost(false);
    setRoomHostId(null);
    setRoomPlayersList([]);
    setRoomCodeInput('');
  };



  // Unified Aim Angle Calculation from Client Coordinates (Accounts for Canvas Scaling & Offsets)
  const updateAimAngleFromClientCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    const worldX = mouseX + simState.current.cameraX;
    const worldY = mouseY + simState.current.cameraY;

    mouseWorldPos.current = { x: worldX, y: worldY };

    const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
    if (myP && !myP.isRespawning) {
      myP.angle = Math.atan2(worldY - myP.y, worldX - myP.x);
    }
  }, [isLocalPlayer]);

  // Reset all input states to prevent stuck keys/touches on blur, tab switch, or cancel
  const resetAllInputs = useCallback(() => {
    keysPressed.current = {};
    isMouseDown.current = false;
    mobileMoveVector.current = { x: 0, y: 0 };
    joyTouchId.current = null;
    aimTouchId.current = null;
    setVirtualJoyActive(false);
    setJoyKnobPos({ x: 0, y: 0 });
  }, []);

  // Keyboard Event Handlers & Window Focus/Blur Guards
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      // Prevent accidental page scrolling when playing
      if (['space', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.code.toLowerCase()) || e.key === ' ') {
        if (matchStatus === 'playing') {
          e.preventDefault();
        }
      }

      const keyLower = e.key.toLowerCase();
      const codeLower = e.code.toLowerCase();
      keysPressed.current[keyLower] = true;
      keysPressed.current[codeLower] = true;

      // Space or Shift for Dash ability
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Shift') {
        triggerDash();
      }

      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    const handleUp = (e: KeyboardEvent) => {
      const keyLower = e.key.toLowerCase();
      const codeLower = e.code.toLowerCase();
      keysPressed.current[keyLower] = false;
      keysPressed.current[codeLower] = false;
    };

    const handleWindowBlur = () => {
      resetAllInputs();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetAllInputs();
      }
    };

    const handlePointerCancel = () => {
      resetAllInputs();
    };

    const handleGlobalMouseUp = () => {
      isMouseDown.current = false;
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (matchStatus === 'playing' && isMouseDown.current) {
        updateAimAngleFromClientCoords(e.clientX, e.clientY);
      }
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('touchcancel', handlePointerCancel);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('pointerup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('touchcancel', handlePointerCancel);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('pointerup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [matchStatus, triggerDash, resetAllInputs, updateAimAngleFromClientCoords]);



  // Mouse Move on Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updateAimAngleFromClientCoords(e.clientX, e.clientY);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      isMouseDown.current = true;
      updateAimAngleFromClientCoords(e.clientX, e.clientY);
      shootLaser(myPlayerId.current);
    }
  };

  const handleCanvasMouseUp = () => {
    isMouseDown.current = false;
  };

  // Direct canvas touch support for mobile aiming
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    inputDevice.notifyTouchEvent();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updateAimAngleFromClientCoords(touch.clientX, touch.clientY);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updateAimAngleFromClientCoords(touch.clientX, touch.clientY);
    }
  };

  // Mobile Virtual Joystick Touch Handlers (Smooth 360° Movement on Phone)
  const handleJoyTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    inputDevice.notifyTouchEvent();
    const touch = e.changedTouches[0];
    joyTouchId.current = touch.identifier;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joyOrigin.current = { x: centerX, y: centerY };

    setVirtualJoyActive(true);
    handleJoyTouchMove(e);
  };

  const handleJoyTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joyTouchId.current) {
        const dx = touch.clientX - joyOrigin.current.x;
        const dy = touch.clientY - joyOrigin.current.y;
        const dist = Math.hypot(dx, dy);
        const maxRadius = 45;

        if (dist === 0) {
          mobileMoveVector.current = { x: 0, y: 0 };
          setJoyKnobPos({ x: 0, y: 0 });
        } else {
          const clampedDist = Math.min(dist, maxRadius);
          const nx = dx / dist;
          const ny = dy / dist;
          mobileMoveVector.current = { x: nx * (clampedDist / maxRadius), y: ny * (clampedDist / maxRadius) };
          setJoyKnobPos({ x: nx * clampedDist, y: ny * clampedDist });
        }
        break;
      }
    }
  };

  const handleJoyTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joyTouchId.current) {
        joyTouchId.current = null;
        setVirtualJoyActive(false);
        mobileMoveVector.current = { x: 0, y: 0 };
        setJoyKnobPos({ x: 0, y: 0 });
        break;
      }
    }
  };

  // Mobile Touch Aim Wheel Handlers
  const handleAimTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    inputDevice.notifyTouchEvent();
    const touch = e.changedTouches[0];
    aimTouchId.current = touch.identifier;
    handleAimTouchMove(e);
  };

  const handleAimTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (aimTouchId.current === null || touch.identifier === aimTouchId.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        if (Math.hypot(dx, dy) > 8) {
          const aimAngle = Math.atan2(dy, dx);
          const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
          if (myP && !myP.isRespawning) {
            myP.angle = aimAngle;
          }
        }
        break;
      }
    }
  };

  const handleAimTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === aimTouchId.current) {
        aimTouchId.current = null;
        break;
      }
    }
  };

  // Main High-Performance Game Engine Loop (60 FPS)

  return (
    <div
      ref={arenaContainerRef}
      className={`w-full flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-1 md:p-2 h-screen w-screen overflow-hidden'
          : 'max-w-6xl mx-auto space-y-3'
      }`}
    >
      {/* Top TDM Scoreboard Header */}
      <ArenaScoreHeader
        isDark={isDark}
        hudBlueScore={hudBlueScore}
        hudRedScore={hudRedScore}
        hudTimeLeft={hudTimeLeft}
        selectedMapTheme={selectedMapTheme}
        hudActiveSkill={hudActiveSkill}
        hudMyHp={hudMyHp}
        hudMyKills={hudMyKills}
        setShowCustomizerModal={setShowCustomizerModal}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        inLobby={inLobby}
        handleLeaveMatch={handleLeaveMatch}
      />

      {/* Main Game Battlefield Container with Canvas */}
      <div
        className={`relative w-full ${
          isFullscreen ? 'flex-1 h-0 min-h-0' : inLobby ? 'min-h-[500px] border-none shadow-none bg-transparent' : 'h-[500px] md:h-[640px]'
        } ${inLobby ? '' : isDark ? 'bg-[#060a12] border-slate-800' : 'bg-slate-100 border-slate-300'} rounded-xl md:rounded-2xl overflow-hidden ${inLobby ? '' : 'border-2 shadow-2xl'} select-none touch-none`}
      >
        {/* Hardware-Accelerated 60 FPS HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleCanvasTouchMove}
          className={inLobby ? 'hidden' : 'w-full h-full block cursor-crosshair touch-none'}
        />

        {/* In-Game Match HUD Layers (Radar, Killfeed, Boss, Controls) */}
        {!inLobby && (
          <>
            {/* Tactical Minimap Radar in Top-Left */}
            <div className="absolute top-3 left-3 z-30 w-44 h-28 sm:w-52 sm:h-32 md:w-60 md:h-36 bg-slate-950/90 backdrop-blur-md rounded-xl border border-cyan-500/40 p-1.5 pointer-events-none shadow-[0_0_20px_rgba(0,0,0,0.7)] flex flex-col">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800/80 mb-1">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  📡 RADAR ARENA
                </span>
                <span className="text-[7.5px] sm:text-[8px] text-slate-400 font-mono">
                  Posisi &amp; Nama Player
                </span>
              </div>
              <div className="relative flex-1 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                <canvas
                  ref={minimapCanvasRef}
                  width={240}
                  height={140}
                  className="w-full h-full block"
                />
              </div>
            </div>

            {/* Live Killfeed */}
            <ArenaKillFeedOverlay killFeed={hudKillFeed} />

            {/* Respawn Modal */}
            <ArenaRespawnModal
              respawnTimer={hudRespawnTimer}
              onInstantRespawn={handleInstantRespawn}
            />

            {/* Desktop Controls Bar */}
            <ArenaDesktopControlsBar
              isDark={isDark}
              showVirtualControls={showVirtualControls}
              matchStatus={matchStatus}
              respawnTimer={hudRespawnTimer}
            />

            {/* Mobile Touch Controls */}
            <ArenaMobileControls
              showVirtualControls={showVirtualControls}
              matchStatus={matchStatus}
              respawnTimer={hudRespawnTimer}
              dashCooldown={hudDashCooldown}
              onTriggerDash={triggerDash}
              onJoyTouchStart={handleJoyTouchStart}
              onJoyTouchMove={handleJoyTouchMove}
              onJoyTouchEnd={handleJoyTouchEnd}
              joyKnobPos={joyKnobPos}
              onAimTouchStart={handleAimTouchStart}
              onAimTouchMove={handleAimTouchMove}
              onAimTouchEnd={handleAimTouchEnd}
              onFireStart={() => {
                isMouseDown.current = true;
                shootLaser(myPlayerId.current);
              }}
              onFireEnd={() => {
                isMouseDown.current = false;
              }}
            />
          </>
        )}

        {/* Lobby Overlay */}
        {inLobby && (
          <div 
            className={`w-full flex flex-col items-center justify-center p-1 sm:p-2 transition-all duration-300 relative overflow-hidden ${isDark ? 'text-white' : 'text-slate-900'}`} 
            style={{
              backgroundImage: `
                linear-gradient(135deg, ${
                  isDark 
                    ? 'rgba(15, 23, 42, 0.82) 0%, rgba(2, 6, 23, 0.88) 100%' 
                    : 'rgba(248, 250, 252, 0.78) 0%, rgba(241, 245, 249, 0.84) 100%'
                }),
                url('${
                  selectedMapTheme === 'mall' 
                    ? '/src/assets/images/mall_lobby_bg_1792721153783.jpg' 
                    : selectedMapTheme === 'rooftop' 
                    ? '/src/assets/images/rooftop_lobby_bg_1792721153944.jpg' 
                    : selectedMapTheme === 'warehouse' || selectedMapTheme === 'cavern'
                    ? '/src/assets/images/warehouse_lobby_bg_1792721153666.jpg' 
                    : selectedMapTheme === 'lab'
                    ? '/src/assets/images/rooftop_lobby_bg_1792721153944.jpg'
                    : '/src/assets/images/garden_lobby_bg_1792721154333.jpg'
                }')
              `
            }}
          >
            <LobbyLightParticles isDark={isDark} />
            <ArenaLobbyView
              isDark={isDark}
              gameModeType={gameModeType}
              setGameModeType={setGameModeType}
              playerName={playerName}
              handlePlayerNameChange={handlePlayerNameChange}
              characterCustomization={characterCustomization}
              setShowCustomizerModal={setShowCustomizerModal}
              playerTeam={playerTeam}
              handleSelectTeam={handleSelectTeam}
              totalPlayersConfig={totalPlayersConfig}
              setTotalPlayersConfig={setTotalPlayersConfig}
              isSelectingPlayers={isSelectingPlayers}
              setIsSelectingPlayers={setIsSelectingPlayers}
              handleUpdateTotalSlots={handleUpdateTotalSlots}
              currentRoomCode={currentRoomCode}
              roomCodeInput={roomCodeInput}
              setRoomCodeInput={setRoomCodeInput}
              handleCopyRoomCode={handleCopyRoomCode}
              handleJoinMultiplayerRoom={handleJoinMultiplayerRoom}
              onOpenProfile={() => setShowProfileModal(true)}
              isJoinedRoom={isJoinedRoom}
              joinedAsHost={joinedAsHost}
              isEffectiveHost={isEffectiveHost}
              roomPlayersList={roomPlayersList}
              handleLeaveRoom={handleLeaveRoom}
              handleUpdateBotTeam={handleUpdateBotTeam}
              handleKickPlayer={handleKickPlayer}
              startMatch={startMatch}
              handleAddBot={handleAddBot}
              handleDeleteRoom={handleDeleteRoom}
              selectedMapTheme={selectedMapTheme}
              handleSelectMapTheme={setSelectedMapTheme}
              setShowMapSelectorModal={setShowMapSelectorModal}
              isLocalPlayer={isLocalPlayer}
            />
          </div>
        )}

      </div>

      {/* Match Ended Victory Screen */}
      {matchStatus === 'ended' && (
        <ArenaMatchResultModal
          stats={
            matchResultStats || {
              outcome:
                hudBlueScore === hudRedScore
                  ? 'draw'
                  : (hudBlueScore > hudRedScore && playerTeam === 'blue') ||
                    (hudRedScore > hudBlueScore && playerTeam === 'red')
                  ? 'victory'
                  : 'defeat',
              blueScore: hudBlueScore,
              redScore: hudRedScore,
              playerKills: hudMyKills,
              playerTeam: playerTeam,
              pointsAwarded:
                (hudBlueScore === hudRedScore
                  ? 250
                  : (hudBlueScore > hudRedScore && playerTeam === 'blue') ||
                    (hudRedScore > hudBlueScore && playerTeam === 'red')
                  ? 500
                  : 150) +
                hudMyKills * 30,
            }
          }
          isDark={isDark}
          gameModeType={gameModeType}
          onPlayAgain={
            gameModeType === 'bot'
              ? async () => {
                  await handleLeaveMatch();
                  setTimeout(() => {
                    startMatch('bot');
                  }, 80);
                }
              : undefined
          }
          onReturnToLobby={handleLeaveMatch}
          onNavigateToRedemption={onNavigateToCart}
          onNavigateToLeaderboard={onNavigateToLeaderboard}
        />
      )}

      {/* Character Customization Modal */}
      {showCustomizerModal && (
        <CharacterCustomizerModal
          customization={characterCustomization}
          onChange={handleCustomizationChange}
          onClose={() => setShowCustomizerModal(false)}
        />
      )}

      {/* Map Selector Modal */}
      <MapSelectorModal
        isOpen={showMapSelectorModal}
        selectedMap={selectedMapTheme}
        onSelectMap={handleSelectMapTheme}
        onClose={() => setShowMapSelectorModal(false)}
        themeMode={themeMode}
      />

      {/* Player Profile Modal */}
      {showProfileModal && (
        <PlayerProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          isDark={isDark}
          isSelf={true}
          profile={{
            id: myPlayerId.current,
            username: playerName,
            avatarClass: characterCustomization.characterClass,
            primaryColor: characterCustomization.primaryColor,
            weaponSkin: characterCustomization.weaponSkin,
            totalMatches: profileData.totalMatches,
            wins: profileData.wins,
            losses: profileData.losses,
            kills: hudMyKills || profileData.kills,
            points: userDiscountPoints,
            isOnline: true,
            statusMessage: playerStatus,
            createdAt: profileData.createdAt,
          }}
          onUpdateProfile={(updated) => {
            saveStoredProfile(updated, userDiscountPoints);
            if (updated.username) {
              handlePlayerNameChange(updated.username);
            }
            if (updated.statusMessage) {
              setPlayerStatus(updated.statusMessage);
            }
          }}
        />
      )}
    </div>
  );
};
