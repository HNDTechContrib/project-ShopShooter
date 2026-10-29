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
import { MapSelectorModal, MAP_CATALOG } from './MapSelectorModal';
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

  // Player Name State (Persisted)
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('db_player_name');
      if (saved) return saved;
    } catch (e) {}
    return `Striker_${Math.floor(Math.random() * 900 + 100)}`;
  });

  // Handle player name change with immediate UI sync
  const handlePlayerNameChange = (newName: string) => {
    setPlayerName(newName);
    try {
      localStorage.setItem('db_player_name', newName);
    } catch (e) {}

    // Update in local sim
    const myP = simState.current.players.find(p => isLocalPlayer(p.id));
    if (myP) {
      myP.name = newName;
    }

    // Update waiting room roster immediately!
    setRoomPlayersList(prev => prev.map(p => isLocalPlayer(p.id) ? { ...p, username: newName } : p));

    // Update in Firestore
    if (isJoinedRoom && currentRoomCode) {
      const roomRef = doc(db, 'rooms', currentRoomCode);
      updateDoc(roomRef, {
        [`players.${myPlayerId.current}.username`]: newName,
        updatedAt: Date.now()
      }).catch(() => {});
    }

    // Update in WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update-name',
        username: newName,
      }));
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('db_player_name', playerName);
    } catch (e) {}

    const myP = simState.current.players.find(p => isLocalPlayer(p.id));
    if (myP) {
      myP.name = playerName;
    }
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

    const createBullet = (fireAngle: number) => ({
      id: `${p.id}-${now}-${Math.random()}`,
      shooterId: p.id,
      team: p.team,
      x: p.x + Math.cos(fireAngle) * 30,
      y: p.y + Math.sin(fireAngle) * 30,
      vx: Math.cos(fireAngle) * speed,
      vy: Math.sin(fireAngle) * speed,
      damage: Math.floor(18 + Math.random() * 25),
      color: p.customization?.visorColor || (p.team === 'blue' ? (isTriple ? '#38bdf8' : '#0284c7') : (isTriple ? '#fb7185' : '#e11d48')),
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

  // Initialize Roster, Skills & Particles
  const initRoster = useCallback((forcedMode?: 'bot' | 'multiplayer', customTotalSlots?: number) => {
    const effectiveMode = forcedMode || gameModeType;
    const effectiveSlots = customTotalSlots || totalPlayersConfig;
    const isMultiplayer = effectiveMode === 'multiplayer';

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

    // Human Player with customized traits and unique ID - Correctly spawns on playerTeam base (left for blue, right for red)
    const mySpawnX = playerTeam === 'blue'
      ? 220 + Math.random() * 60
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const mySpawnY = 560 + (Math.random() - 0.5) * 160;
    const mySpawnAngle = playerTeam === 'blue' ? 0 : Math.PI;
    const myStats = getCharacterStats(characterCustomization.characterClass);
    newPlayers.push({
      id: myPlayerId.current,
      name: playerName || 'Player',
      team: playerTeam,
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
      color: playerTeam === 'blue' ? '#38bdf8' : '#f43f5e',
      customization: characterCustomization,
    });

    if (isMultiplayer) {
      // Include any other humans and bots that were in roomPlayersList
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

      // If room has unfilled slots, fill with AI bots
      const remainingSlots = Math.max(0, effectiveSlots - newPlayers.length);
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
      // VS AI MODE:
      // Always spawn the exact number of bots configured!
      const totalBotsNeeded = Math.max(1, effectiveSlots - 1);
      const allyBotsNeeded = Math.floor(totalBotsNeeded / 2);
      const enemyBotsNeeded = totalBotsNeeded - allyBotsNeeded;
      const blueNeeded = playerTeam === 'blue' ? allyBotsNeeded : enemyBotsNeeded;
      const redNeeded = playerTeam === 'red' ? allyBotsNeeded : enemyBotsNeeded;

      let botIdx = 0;

      // Team Blue Bots
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

      // Team Red Bots
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

    // Initialize 45 Atmospheric Ambient Particles for the Theme
    const particles: AmbientParticle[] = [];
    for (let p = 0; p < 45; p++) {
      particles.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6 - 0.4,
        size: Math.random() * 3 + 1.5,
        color: MAP_THEMES_CONFIG[selectedMapTheme].particleColor,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    simState.current.players = newPlayers;
    simState.current.bullets = [];
    simState.current.damageTexts = [];
    simState.current.skills = JSON.parse(JSON.stringify(INITIAL_SKILLS));
    simState.current.ambientParticles = particles;
    simState.current.blueScore = 0;
    simState.current.redScore = 0;
    simState.current.timeLeft = 90;
    simState.current.currentTheme = selectedMapTheme;

    // Central Boss
    simState.current.boss = {
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
  }, [totalPlayersConfig, playerTeam, selectedMapTheme, characterCustomization, gameModeType, roomPlayersList, playerName, isLocalPlayer, getCharacterStats]);

  // Switch Team (Tim Biru / Tim Merah) with live sync
  const handleSelectTeam = async (newTeam: TeamId) => {
    setPlayerTeam(newTeam);
    soundEngine.playPowerUp();

    const newSpawnX = newTeam === 'blue' 
      ? 220 + Math.random() * 60 
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const newSpawnAngle = newTeam === 'blue' ? 0 : Math.PI;

    const myP = simState.current.players.find(p => isLocalPlayer(p.id));
    if (myP) {
      myP.team = newTeam;
      myP.color = newTeam === 'blue' ? '#38bdf8' : '#f43f5e';
      myP.x = newSpawnX;
      myP.y = 440 + Math.random() * 200;
      myP.angle = newSpawnAngle;
    }

    setRoomPlayersList(prev => prev.map(p => isLocalPlayer(p.id) ? { 
      ...p, 
      team: newTeam, 
      color: newTeam === 'blue' ? '#38bdf8' : '#f43f5e',
      x: newSpawnX,
      angle: newSpawnAngle,
    } : p));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentRoomCode) {
      wsRef.current.send(JSON.stringify({
        type: 'change-team',
        team: newTeam,
        playerId: myPlayerId.current,
        roomCode: currentRoomCode,
      }));
    }

    if (isJoinedRoom && currentRoomCode) {
      try {
        const roomRef = doc(db, 'rooms', currentRoomCode);
        const uid = myPlayerId.current;
        await updateDoc(roomRef, {
          [`players.${uid}.team`]: newTeam,
          [`players.${uid}.color`]: newTeam === 'blue' ? '#38bdf8' : '#f43f5e',
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
      {/* Top TDM Scoreboard Header (Visible only when match is active) */}
      {!inLobby && (
      <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-lg'} border-2 rounded-xl md:rounded-2xl ${isFullscreen ? 'p-1.5 md:p-3' : 'p-2.5 md:p-3'} flex items-center justify-between gap-1.5 md:gap-4 select-none shrink-0 transition-colors duration-200`}>
        {/* Team Blue Score */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl ${isDark ? 'bg-cyan-950 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-cyan-50 text-cyan-900 shadow-sm'} border-2 border-cyan-400 flex flex-col items-center justify-center font-black`}>
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-cyan-500">BIRU</span>
            <span className="text-base md:text-xl leading-none font-mono-numbers">{hudBlueScore}</span>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold text-cyan-500 block">TIM CYBER BIRU</span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Kills: {hudBlueScore}
            </span>
          </div>
        </div>

        {/* Center: Match Timer, Active Skill, Customizer Button */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs font-extrabold tracking-wider uppercase text-amber-500">
            <Swords className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
            <span className="truncate max-w-[130px] md:max-w-none">
              TDM · {MAP_THEMES_CONFIG[selectedMapTheme].name.split('(')[0]}
            </span>
          </div>

          <div className={`text-lg md:text-3xl font-black font-mono-numbers ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight leading-tight`}>
            {hudTimeLeft}s
          </div>

          {/* Active Skill or Room Code */}
          {hudActiveSkill ? (
            <div className={`flex items-center gap-1 ${isDark ? 'bg-amber-500/20 border-amber-400/80 text-amber-300' : 'bg-amber-100 border-amber-400 text-amber-800'} border px-2 py-0.5 rounded-full text-[9px] md:text-[11px] font-bold animate-pulse mt-0.5`}>
              <span>⚡ {hudActiveSkill.label}</span>
              <span className="font-mono">({hudActiveSkill.timeLeft}s)</span>
            </div>
          ) : (
            <span className={`text-[8px] md:text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'} block font-mono`}>
              HP: <strong className={hudMyHp < 30 ? 'text-rose-500' : 'text-emerald-500'}>{hudMyHp}%</strong> · Kills: <strong>{hudMyKills}</strong>
            </span>
          )}
        </div>

        {/* Team Red Score & Controls */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="hidden md:block text-right">
            <span className="text-xs font-bold text-rose-500 block">TIM PLASMA MERAH</span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Kills: {hudRedScore}
            </span>
          </div>
          <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl ${isDark ? 'bg-rose-950 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-rose-50 text-rose-900 shadow-sm'} border-2 border-rose-500 flex flex-col items-center justify-center font-black`}>
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-rose-500">MERAH</span>
            <span className="text-base md:text-xl leading-none font-mono-numbers">{hudRedScore}</span>
          </div>
          {/* Customizer Button in Header */}
          <button
            onClick={() => setShowCustomizerModal(true)}
            className={`p-1.5 md:p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-amber-500/25 border-amber-500/50 hover:bg-amber-500/35 text-amber-300' : 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800 shadow-xs'}`}
            title="Kustomisasi Karakter"
            aria-label="Kustomisasi Karakter"
          >
            <Palette className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 md:p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700 shadow-xs'}`}
            title={isFullscreen ? 'Keluar Fullscreen (F)' : 'Layar Penuh / Fullscreen (F)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-amber-500" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          {/* Leave Match Button */}
          {!inLobby && (
            <button
              onClick={handleLeaveMatch}
              className={`px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold ${isDark ? 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30 text-rose-300' : 'bg-rose-100 border-rose-300 hover:bg-rose-200 text-rose-800 shadow-xs'}`}
              title="Tinggalkan Match"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          )}
        </div>
      </div>
      )}

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
            {/* Tactical Minimap Radar in Top-Left (Visible on match, 60fps canvas with clear player names) */}
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

        {/* Live Killfeed in Top Left (Stacked cleanly below the Minimap) */}
        <div className="absolute top-[138px] sm:top-[158px] md:top-[178px] left-3 z-30 flex flex-col gap-1.5 pointer-events-none max-w-[200px] md:max-w-xs">
          {hudKillFeed.map((kf) => (
            <div
              key={kf.id}
              className={`text-[10px] md:text-[11px] font-bold px-2 py-0.5 md:py-1 rounded-md border backdrop-blur-md animate-in slide-in-from-left-2 ${
                kf.team === 'blue'
                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500/50'
                  : 'bg-rose-950/80 text-rose-200 border-rose-500/50'
              }`}
            >
              {kf.text}
            </div>
          ))}
        </div>

        {/* RESPAWN BANNER / OVERLAY WHEN HUMAN PLAYER DIES */}
        {hudRespawnTimer > 0 && (
          <div className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-rose-950 border-2 border-rose-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Skull className="w-9 h-9 text-rose-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-1">
                KAMU TERELIMINASI!
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Mempersiapkan respawn kembali ke markas tim...
              </p>

              {/* Progress Countdown Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 mb-4 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-100 ease-linear"
                  style={{ width: `${Math.max(0, 100 - (hudRespawnTimer / 3.5) * 100)}%` }}
                />
              </div>

              <div className="text-3xl font-black font-mono-numbers text-amber-400 mb-5">
                {hudRespawnTimer.toFixed(1)}s
              </div>

              {/* Instant Respawn Button */}
              <button
                onClick={handleInstantRespawn}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                ⚡ Respawn Sekarang (Instan)
              </button>
            </div>
          </div>
        )}

        {/* DESKTOP KEYBOARD & MOUSE CONTROLS HELPER BAR (Clean, non-intrusive HUD at bottom of arena) */}
        {!showVirtualControls && matchStatus === 'playing' && hudRespawnTimer === 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none max-w-[95%]">
            <div className={`flex items-center flex-wrap justify-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] md:text-xs font-semibold shadow-lg border transition-all ${
              isDark 
                ? 'bg-slate-950/85 border-slate-700/60 text-slate-300 shadow-black/40' 
                : 'bg-white/95 border-slate-200/90 text-slate-700 shadow-slate-300/40'
            }`}>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[9px] md:text-[10px] font-bold border border-slate-600">W A S D</kbd>
                <span>/</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[9px] md:text-[10px] font-bold border border-slate-600">Panah</kbd>
                <span className="text-slate-400">Gerak</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-400 font-mono text-[9px] md:text-[10px] font-bold border border-slate-600">Klik Kiri</kbd>
                <span className="text-slate-400">Bidik &amp; Tembak</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[9px] md:text-[10px] font-bold border border-slate-600">Spasi / Shift</kbd>
                <span className="text-slate-400">Dash</span>
              </span>
            </div>
          </div>
        )}

        {/* MOBILE ON-SCREEN TOUCH CONTROLS (ONLY ON TOUCH-CAPABLE DEVICES / TOUCH MODE) */}
        {showVirtualControls && matchStatus === 'playing' && hudRespawnTimer === 0 && (
          <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-2.5 sm:p-4 md:p-6 select-none touch-none">
            {/* Left: Virtual Movement Joystick */}
            <div className="pointer-events-auto flex flex-col items-center">
              <div
                onTouchStart={handleJoyTouchStart}
                onTouchMove={handleJoyTouchMove}
                onTouchEnd={handleJoyTouchEnd}
                onTouchCancel={handleJoyTouchEnd}
                className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-34 md:h-34 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 flex items-center justify-center touch-none shadow-2xl active:border-cyan-400"
              >
                {/* Center crosshair mark */}
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                {/* Floating Knob */}
                <div
                  className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center transition-transform duration-75"
                  style={{
                    transform: `translate(${joyKnobPos.x}px, ${joyKnobPos.y}px)`,
                  }}
                >
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
                </div>
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
                🕹️ Gerak 360°
              </span>
            </div>

            {/* Right: Aim Touch Pad, Shoot Button & Dash */}
            <div className="pointer-events-auto flex flex-col items-end gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2 mb-0.5">
                {/* Dash / Evade Button */}
                <button
                  onClick={triggerDash}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    triggerDash();
                  }}
                  disabled={hudDashCooldown > 0}
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold border transition-all flex items-center gap-1.5 shadow-md ${
                    hudDashCooldown > 0
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-70'
                      : 'bg-emerald-500/25 border-emerald-400 text-emerald-300 hover:bg-emerald-500/35 active:scale-90'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>{hudDashCooldown > 0 ? `${hudDashCooldown.toFixed(1)}s` : 'DASH'}</span>
                </button>
              </div>

              {/* Aim Touch Pad and Big Shoot Button */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Touch Aim Wheel */}
                <div
                  onTouchStart={handleAimTouchStart}
                  onTouchMove={handleAimTouchMove}
                  onTouchEnd={handleAimTouchEnd}
                  onTouchCancel={handleAimTouchEnd}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700 flex flex-col items-center justify-center touch-none text-slate-400 active:border-rose-400 shadow-xl"
                >
                  <Crosshair className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                  <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">BIDIK</span>
                </div>

                {/* Big Ergonomic FIRE Button */}
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    inputDevice.notifyTouchEvent();
                    isMouseDown.current = true;
                    shootLaser(myPlayerId.current);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    isMouseDown.current = false;
                  }}
                  onTouchCancel={(e) => {
                    e.preventDefault();
                    isMouseDown.current = false;
                  }}
                  onMouseDown={() => {
                    isMouseDown.current = true;
                    shootLaser(myPlayerId.current);
                  }}
                  onMouseUp={() => {
                    isMouseDown.current = false;
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-500 border-3 sm:border-4 border-white/80 shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-90 transition-transform flex flex-col items-center justify-center text-white font-black"
                >
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider">TEMBAK</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Close In-Game Match HUD Layers */}
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
    </div>
  );
};
