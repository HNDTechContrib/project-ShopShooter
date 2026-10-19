import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Smartphone,
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
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultiplayerArenaProps {
  userDiscountPoints: number;
  onAddDiscountPoints: (points: number) => void;
  onNavigateToCart: () => void;
  onNavigateToLeaderboard: () => void;
  onTriggerSpecialNotification: (targetName: string, points: number) => void;
}

// World Map Dimensions
const WORLD_WIDTH = 2200;
const WORLD_HEIGHT = 1300;

interface SimPlayer {
  id: string;
  name: string;
  team: TeamId;
  x: number;
  y: number;
  angle: number;
  hp: number;
  maxHp: number;
  score: number;
  kills: number;
  deaths: number;
  isBot: boolean;
  isShielded: boolean;
  isRespawning: boolean;
  respawnTimer: number;
  color: string;
  customization?: CharacterCustomization;
  activeSkill?: {
    type: InGameSkillType;
    timeLeft: number;
  };
}

interface SimBullet {
  id: string;
  shooterId: string;
  team: TeamId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  life: number;
}

interface SimDamageText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

interface SimBoss {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  size: number;
}

interface MapObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  borderColor: string;
}

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

// Decorative visual element on each map
interface MapDecorationItem {
  id: string;
  type:
    | 'showcase'
    | 'promo_billboard'
    | 'escalator'
    | 'kiosk'
    | 'helipad'
    | 'neon_sign'
    | 'antenna_tower'
    | 'chiller_fan'
    | 'skyline_light'
    | 'crate_stack'
    | 'conveyor'
    | 'forklift_dock'
    | 'barcode_scanner'
    | 'cyber_fountain'
    | 'biophilic_tree'
    | 'planter_box'
    | 'glass_skywalk'
    | 'crystal'
    | 'magma_fissure'
    | 'lava_pool'
    | 'lab_tube'
    | 'circuit_node'
    | 'holo_console'
    | 'mushroom'
    | 'neon_tree'
    | 'foliage_bush'
    | 'lichen_pool';
  x: number;
  y: number;
  size: number;
  color: string;
  secondaryColor?: string;
  rotation?: number;
  label?: string;
  pulsePhase?: number;
}

// Creative futuristic shopping-mall inspired map configurations
const MAP_THEMES_CONFIG: Record<
  MapTheme,
  {
    name: string;
    description: string;
    bgColor: string;
    gridColor: string;
    particleColor: string;
    obstacles: MapObstacle[];
    decorations: MapDecorationItem[];
  }
> = {
  mall: {
    name: 'Shopping Mall (Pusat Elektronik & Komputer)',
    description: 'Arena di dalam pusat perbelanjaan futuristik dengan lorong belanja, etalase laptop & PC gaming, area tengah terbuka, serta papan promosi diskon.',
    bgColor: '#080d1a',
    gridColor: 'rgba(56, 189, 248, 0.08)',
    particleColor: 'rgba(56, 189, 248, 0.45)',
    obstacles: [
      { x: 800, y: 220, w: 260, h: 140, label: 'STORE: CYBER PC & RIGS', color: '#0c1527', borderColor: '#06b6d4' },
      { x: 1140, y: 220, w: 260, h: 140, label: 'STORE: NEON GADGETS', color: '#0c1527', borderColor: '#38bdf8' },
      { x: 800, y: 940, w: 260, h: 140, label: 'STORE: MECHA GAMING GEAR', color: '#0c1527', borderColor: '#f59e0b' },
      { x: 1140, y: 940, w: 260, h: 140, label: 'STORE: AUDIO & VR PRO', color: '#0c1527', borderColor: '#ec4899' },
      { x: 480, y: 480, w: 130, h: 240, label: 'AISLE A: LAPTOP ZONE', color: '#111c33', borderColor: '#3b82f6' },
      { x: 1590, y: 480, w: 130, h: 240, label: 'AISLE B: SMARTPHONE HUB', color: '#111c33', borderColor: '#f43f5e' },
    ],
    decorations: [
      // PC & Gadget Showcases
      { id: 'sc-1', type: 'showcase', x: 680, y: 240, size: 28, color: '#06b6d4', secondaryColor: '#38bdf8', label: 'LAPTOP RTX 5090' },
      { id: 'sc-2', type: 'showcase', x: 1520, y: 240, size: 28, color: '#f59e0b', secondaryColor: '#fbbf24', label: 'RGB KEYBOARD' },
      { id: 'sc-3', type: 'showcase', x: 680, y: 1040, size: 28, color: '#ec4899', secondaryColor: '#f472b6', label: 'VR HEADSET OMNI' },
      { id: 'sc-4', type: 'showcase', x: 1520, y: 1040, size: 28, color: '#10b981', secondaryColor: '#34d399', label: 'CYBER WATCH' },
      // Central Atrium Expo Stands
      { id: 'sc-mid-1', type: 'showcase', x: 920, y: 550, size: 24, color: '#38bdf8', secondaryColor: '#ffffff', label: 'EXPO RIG' },
      { id: 'sc-mid-2', type: 'showcase', x: 1280, y: 550, size: 24, color: '#38bdf8', secondaryColor: '#ffffff', label: 'EXPO MONITOR' },
      // Promotional Neon Billboards
      { id: 'pb-1', type: 'promo_billboard', x: 1100, y: 140, size: 45, color: '#f59e0b', label: '⚡ FLASH DEAL 70% ⚡' },
      { id: 'pb-2', type: 'promo_billboard', x: 1100, y: 1160, size: 45, color: '#ec4899', label: '🎁 CASHBACK 50% VOUCHER' },
      { id: 'pb-3', type: 'promo_billboard', x: 380, y: 640, size: 35, color: '#06b6d4', label: 'CYBER MALL MEGA STORE' },
      { id: 'pb-4', type: 'promo_billboard', x: 1820, y: 640, size: 35, color: '#f43f5e', label: 'SALE DISKON 80%' },
      // Escalators
      { id: 'esc-1', type: 'escalator', x: 920, y: 760, size: 40, color: '#0284c7', label: 'LANTAI 2 ↗' },
      { id: 'esc-2', type: 'escalator', x: 1280, y: 760, size: 40, color: '#0284c7', label: 'LANTAI 2 ↗' },
      // Mall Directory Kiosks
      { id: 'kiosk-1', type: 'kiosk', x: 740, y: 640, size: 22, color: '#38bdf8', label: 'DIREKTORI' },
      { id: 'kiosk-2', type: 'kiosk', x: 1460, y: 640, size: 22, color: '#38bdf8', label: 'DIREKTORI' },
    ],
  },
  rooftop: {
    name: 'Neon Rooftop (Atap Mall & Helipad)',
    description: 'Arena atap gedung dengan lampu neon malam hari, helipad terbuka untuk duel cepat, platform bertingkat, dan lorong sempit.',
    bgColor: '#0a0614',
    gridColor: 'rgba(244, 63, 94, 0.08)',
    particleColor: 'rgba(244, 63, 94, 0.55)',
    obstacles: [
      { x: 920, y: 280, w: 200, h: 120, label: 'HVAC CHILLER TOWER 01', color: '#18181b', borderColor: '#f43f5e' },
      { x: 1080, y: 900, w: 200, h: 120, label: 'ENERGY GENERATOR B', color: '#18181b', borderColor: '#fb7185' },
      { x: 500, y: 450, w: 120, h: 240, label: 'SKYWALK ACCESS WEST', color: '#111827', borderColor: '#06b6d4' },
      { x: 1580, y: 450, w: 120, h: 240, label: 'SKYWALK ACCESS EAST', color: '#111827', borderColor: '#a855f7' },
      { x: 800, y: 640, w: 100, h: 100, label: 'VENTILASI DUCT A', color: '#1f1326', borderColor: '#ec4899' },
      { x: 1300, y: 640, w: 100, h: 100, label: 'VENTILASI DUCT B', color: '#1f1326', borderColor: '#ec4899' },
    ],
    decorations: [
      // Central Helipad
      { id: 'heli-1', type: 'helipad', x: 1100, y: 640, size: 70, color: '#f43f5e', secondaryColor: '#facc15', label: 'HELIPAD 01' },
      // Rooftop Neon Edge Signs
      { id: 'ns-1', type: 'neon_sign', x: 1100, y: 130, size: 60, color: '#f43f5e', label: 'CYBER MALL ROOFTOP SKYBAR' },
      { id: 'ns-2', type: 'neon_sign', x: 1100, y: 1170, size: 60, color: '#38bdf8', label: 'NEON AIR TAXI SERVICE' },
      // Antenna Towers with flashing hazard light
      { id: 'ant-1', type: 'antenna_tower', x: 380, y: 240, size: 26, color: '#ef4444', label: 'MAST WEST' },
      { id: 'ant-2', type: 'antenna_tower', x: 1820, y: 240, size: 26, color: '#ef4444', label: 'MAST EAST' },
      { id: 'ant-3', type: 'antenna_tower', x: 1100, y: 420, size: 26, color: '#eab308' },
      // Chiller Fans
      { id: 'fan-1', type: 'chiller_fan', x: 970, y: 340, size: 20, color: '#06b6d4' },
      { id: 'fan-2', type: 'chiller_fan', x: 1130, y: 960, size: 20, color: '#06b6d4' },
      // Skyline Skybeam searchlights
      { id: 'sky-1', type: 'skyline_light', x: 620, y: 150, size: 80, color: '#a855f7' },
      { id: 'sky-2', type: 'skyline_light', x: 1580, y: 150, size: 80, color: '#06b6d4' },
    ],
  },
  warehouse: {
    name: 'Tech Warehouse (Gudang Logistik E-Commerce)',
    description: 'Gudang logistik belanja otomatis dengan rak kargo bertingkat, peti kemas dekoratif berlindung, dan variasi lorong strategis untuk tim.',
    bgColor: '#0f1217',
    gridColor: 'rgba(245, 158, 11, 0.08)',
    particleColor: 'rgba(245, 158, 11, 0.5)',
    obstacles: [
      { x: 860, y: 240, w: 220, h: 120, label: 'RAK KARGO A1: GADGETS', color: '#1c1917', borderColor: '#f59e0b' },
      { x: 1120, y: 240, w: 220, h: 120, label: 'RAK KARGO A2: KOMPONEN', color: '#1c1917', borderColor: '#f59e0b' },
      { x: 860, y: 940, w: 220, h: 120, label: 'RAK KARGO B1: DRONE PACK', color: '#1c1917', borderColor: '#eab308' },
      { x: 1120, y: 940, w: 220, h: 120, label: 'RAK KARGO B2: BATTERY CELL', color: '#1c1917', borderColor: '#eab308' },
      { x: 500, y: 460, w: 130, h: 230, label: 'CONTAINER CARGO #03', color: '#27272a', borderColor: '#38bdf8' },
      { x: 1570, y: 460, w: 130, h: 230, label: 'CONTAINER CARGO #08', color: '#27272a', borderColor: '#f43f5e' },
    ],
    decorations: [
      // Pallet Crate Stacks
      { id: 'crate-1', type: 'crate_stack', x: 740, y: 240, size: 28, color: '#f59e0b', secondaryColor: '#fbbf24', label: 'PACK A-12' },
      { id: 'crate-2', type: 'crate_stack', x: 1460, y: 240, size: 30, color: '#f59e0b', secondaryColor: '#fbbf24', label: 'PACK B-09' },
      { id: 'crate-3', type: 'crate_stack', x: 740, y: 1040, size: 30, color: '#eab308', secondaryColor: '#fde047', label: 'EXP SHIP' },
      { id: 'crate-4', type: 'crate_stack', x: 1460, y: 1040, size: 28, color: '#eab308', secondaryColor: '#fde047', label: 'FRAGILE' },
      // Automated Logistics Conveyor Belts
      { id: 'conv-1', type: 'conveyor', x: 1100, y: 450, size: 55, color: '#f59e0b', label: 'CONVEYOR TRACK 01' },
      { id: 'conv-2', type: 'conveyor', x: 1100, y: 830, size: 55, color: '#f59e0b', label: 'CONVEYOR TRACK 02' },
      // Sorting Robot Docks
      { id: 'dock-1', type: 'forklift_dock', x: 380, y: 260, size: 35, color: '#38bdf8', label: 'AGV DOCK 1' },
      { id: 'dock-2', type: 'forklift_dock', x: 1820, y: 260, size: 35, color: '#f43f5e', label: 'AGV DOCK 2' },
      // Laser Barcode Scanner Beam
      { id: 'scan-1', type: 'barcode_scanner', x: 800, y: 640, size: 45, color: '#ef4444', label: 'SCANNER 1' },
      { id: 'scan-2', type: 'barcode_scanner', x: 1400, y: 640, size: 45, color: '#ef4444', label: 'SCANNER 2' },
    ],
  },
  garden: {
    name: 'Sky Garden (Taman Atrium Futuristik)',
    description: 'Taman atap futuristik mall dengan jembatan layang kaca, air mancur cyber lotus, tanaman bercahaya, dan platform melingkar santai.',
    bgColor: '#051410',
    gridColor: 'rgba(16, 185, 129, 0.08)',
    particleColor: 'rgba(52, 211, 153, 0.55)',
    obstacles: [
      { x: 920, y: 250, w: 220, h: 130, label: 'ORCHID BIODOME CONSERVATORY', color: '#06281e', borderColor: '#10b981' },
      { x: 920, y: 910, w: 220, h: 130, label: 'HYDRO FLORA PAVILION', color: '#06281e', borderColor: '#10b981' },
      { x: 500, y: 450, w: 120, h: 240, label: 'SKYWALK CANOPY BARAT', color: '#082f3a', borderColor: '#06b6d4' },
      { x: 1580, y: 450, w: 120, h: 240, label: 'SKYWALK CANOPY TIMUR', color: '#291224', borderColor: '#f43f5e' },
      { x: 800, y: 640, w: 100, h: 100, label: 'GAZEBO HYDRO-PARK A', color: '#0a3628', borderColor: '#34d399' },
      { x: 1300, y: 640, w: 100, h: 100, label: 'GAZEBO HYDRO-PARK B', color: '#0a3628', borderColor: '#34d399' },
    ],
    decorations: [
      // Central Cyber Lotus Fountain
      { id: 'fount-1', type: 'cyber_fountain', x: 1100, y: 640, size: 65, color: '#06b6d4', secondaryColor: '#34d399', label: 'CYBER LOTUS' },
      // Luminous Hydroponic Trees
      { id: 'tree-1', type: 'biophilic_tree', x: 740, y: 240, size: 45, color: '#10b981', secondaryColor: '#6ee7b7' },
      { id: 'tree-2', type: 'biophilic_tree', x: 1460, y: 240, size: 45, color: '#10b981', secondaryColor: '#6ee7b7' },
      { id: 'tree-3', type: 'biophilic_tree', x: 740, y: 1040, size: 45, color: '#059669', secondaryColor: '#34d399' },
      { id: 'tree-4', type: 'biophilic_tree', x: 1460, y: 1040, size: 45, color: '#059669', secondaryColor: '#34d399' },
      // Modern Planter Boxes with Neon Flowers
      { id: 'plant-1', type: 'planter_box', x: 1100, y: 440, size: 30, color: '#10b981', secondaryColor: '#f43f5e' },
      { id: 'plant-2', type: 'planter_box', x: 1100, y: 840, size: 30, color: '#10b981', secondaryColor: '#a855f7' },
      // Glass Skywalks
      { id: 'gw-1', type: 'glass_skywalk', x: 380, y: 260, size: 40, color: '#38bdf8' },
      { id: 'gw-2', type: 'glass_skywalk', x: 1820, y: 260, size: 40, color: '#38bdf8' },
    ],
  },
  cavern: {
    name: 'Gua Batuan Kristal (Rocky Cavern)',
    description: 'Medan batuan basalt terjal dengan pilar kristal bercahaya, celah lava pijar, dan fosil purba.',
    bgColor: '#090d16',
    gridColor: 'rgba(245, 158, 11, 0.06)',
    particleColor: 'rgba(245, 158, 11, 0.45)',
    obstacles: [
      { x: 950, y: 280, w: 220, h: 120, label: 'PILAR KRISTAL EMAS', color: '#1e1b18', borderColor: '#d97706' },
      { x: 950, y: 880, w: 220, h: 120, label: 'BATUAN BASALT MAGMA', color: '#1e1b18', borderColor: '#dc2626' },
      { x: 500, y: 450, w: 120, h: 240, label: 'TEBING BATUAN BARAT', color: '#181b24', borderColor: '#0284c7' },
      { x: 500, y: 800, w: 120, h: 240, label: 'FORMASI STALAGMIT', color: '#181b24', borderColor: '#0284c7' },
      { x: 1550, y: 450, w: 120, h: 240, label: 'TEBING BATUAN TIMUR', color: '#241a1c', borderColor: '#e11d48' },
      { x: 1550, y: 800, w: 120, h: 240, label: 'BONGKAHAN GRANIT', color: '#241a1c', borderColor: '#e11d48' },
    ],
    decorations: [
      { id: 'crys-1', type: 'crystal', x: 740, y: 220, size: 28, color: '#f59e0b', secondaryColor: '#fbbf24', rotation: 0.2 },
      { id: 'lava-1', type: 'lava_pool', x: 1100, y: 800, size: 65, color: '#ef4444', secondaryColor: '#f97316' },
    ],
  },
  lab: {
    name: 'Laboratorium Sci-Fi (Quantum Lab)',
    description: 'Pusat riset militer futuristik dengan reaktor kuantum, tabung spesimen kimia neon, dan konsol holografik.',
    bgColor: '#060a12',
    gridColor: 'rgba(56, 189, 248, 0.08)',
    particleColor: 'rgba(56, 189, 248, 0.45)',
    obstacles: [
      { x: 950, y: 280, w: 220, h: 110, label: 'QUANTUM CORE REACTOR', color: '#0f172a', borderColor: '#38bdf8' },
      { x: 500, y: 460, w: 110, h: 230, label: 'ENERGY CONDUIT A', color: '#0c1e30', borderColor: '#0ea5e9' },
    ],
    decorations: [
      { id: 'tube-1', type: 'lab_tube', x: 740, y: 240, size: 26, color: '#06b6d4', secondaryColor: '#38bdf8', label: 'BIO-SERUM 01' },
    ],
  },
  forest: {
    name: 'Hutan Neon Alien (Bioluminescent Forest)',
    description: 'Hutan lebat misterius dengan pohon purba bercahaya, koloni jamur fluoresen, dan semak kamuflase.',
    bgColor: '#05110d',
    gridColor: 'rgba(16, 185, 129, 0.07)',
    particleColor: 'rgba(52, 211, 153, 0.55)',
    obstacles: [
      { x: 950, y: 280, w: 220, h: 130, label: 'POHON PURBA BIOLUMINESCENT', color: '#092119', borderColor: '#10b981' },
      { x: 500, y: 450, w: 120, h: 240, label: 'RUMPUN AKAR KELAM', color: '#061c24', borderColor: '#06b6d4' },
    ],
    decorations: [
      { id: 'mush-1', type: 'mushroom', x: 740, y: 230, size: 36, color: '#a855f7', secondaryColor: '#d8b4fe' },
    ],
  },
};

// Skill Pickup Locations (Spread across battlefield)
const INITIAL_SKILLS: CollectibleSkill[] = [
  { id: 'skill-triple-1', type: 'tripleshot', x: 1100, y: 160, label: 'TRIPLE SHOT', icon: '💥', color: '#f59e0b', duration: 12, isAvailable: true, respawnCooldown: 0 },
  { id: 'skill-rapid-1', type: 'rapidfire', x: 1100, y: 1120, label: 'RAPID FIRE', icon: '⚡', color: '#38bdf8', duration: 10, isAvailable: true, respawnCooldown: 0 },
  { id: 'skill-shield-blue', type: 'shield', x: 720, y: 640, label: 'SHIELD MATRIX', icon: '🛡️', color: '#3b82f6', duration: 8, isAvailable: true, respawnCooldown: 0 },
  { id: 'skill-speed-red', type: 'speed', x: 1400, y: 640, label: 'SPEED BOOST', icon: '💨', color: '#10b981', duration: 12, isAvailable: true, respawnCooldown: 0 },
  { id: 'skill-heal-mid', type: 'heal', x: 1100, y: 640, label: 'NANITE HEAL', icon: '💚', color: '#22c55e', duration: 0, isAvailable: true, respawnCooldown: 0 },
];

export const MultiplayerArena: React.FC<MultiplayerArenaProps> = ({
  userDiscountPoints,
  onAddDiscountPoints,
  onNavigateToCart,
  onNavigateToLeaderboard,
  onTriggerSpecialNotification,
}) => {
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

  // Globally unique player ID per client / tab (persisted in session)
  const myPlayerId = useRef<string>(
    (() => {
      try {
        const saved = sessionStorage.getItem('shop_shooter_player_uid');
        if (saved) return saved;
      } catch (e) {}
      const newId = 'p_' + Math.random().toString(36).substring(2, 9);
      try {
        sessionStorage.setItem('shop_shooter_player_uid', newId);
      } catch (e) {}
      return newId;
    })()
  );

  const isLocalPlayer = useCallback((id: string) => {
    return id === myPlayerId.current || id === 'local-p1';
  }, []);

  const [isJoinedRoom, setIsJoinedRoom] = useState<boolean>(false);
  const [roomPlayersList, setRoomPlayersList] = useState<any[]>([]);
  const [roomHostId, setRoomHostId] = useState<string | null>(null);
  const [isRoomHost, setIsRoomHost] = useState<boolean>(false);

  const isEffectiveHost = isRoomHost || (roomHostId !== null && (roomHostId === myPlayerId.current || isLocalPlayer(roomHostId)));

  // Authenticate anonymously with Firebase on startup
  useEffect(() => {
    signInAnonymously(auth).then((cred) => {
      if (cred?.user?.uid) {
        myPlayerId.current = cred.user.uid;
        try {
          sessionStorage.setItem('shop_shooter_player_uid', cred.user.uid);
        } catch (e) {}
      }
    }).catch((err) => {
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

  const getCharacterStats = (charClass?: CharacterClass) => {
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
  };

  // Match configurations
  const [totalPlayersConfig, setTotalPlayersConfig] = useState<2 | 4 | 6 | 8>(4);
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

  // Mobile Touch Controls State
  const [isMobileControlsEnabled, setIsMobileControlsEnabled] = useState<boolean>(true);
  const [virtualJoyActive, setVirtualJoyActive] = useState<boolean>(false);
  const [joyKnobPos, setJoyKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Mutable Game Simulation State (Ref for 60 FPS zero React DOM lag)
  const simState = useRef<{
    players: SimPlayer[];
    bullets: SimBullet[];
    boss: SimBoss | null;
    damageTexts: SimDamageText[];
    skills: CollectibleSkill[];
    ambientParticles: AmbientParticle[];
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
    blueScore: 0,
    redScore: 0,
    timeLeft: 90,
    cameraX: 0,
    cameraY: 0,
    currentTheme: 'mall',
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

    const isAlly = team === playerTeam;
    const botSpawnX = isAlly 
      ? 220 + Math.random() * 80 
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const botAngle = isAlly ? 0 : Math.PI;

    const newBot = {
      id: botId,
      username: `${botNames[currentCount % botNames.length]} (BOT)`,
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

    // Immediately update local roster state
    setRoomPlayersList(prev => {
      if (prev.some(p => p.id === botId)) return prev;
      return [...prev, newBot];
    });

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

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'add-bot' }));
    }
  };

  // Leave Match / Return to Lobby
  const handleLeaveMatch = async () => {
    soundEngine.playPowerUp();
    if (currentRoomCode && isJoinedRoom) {
      try {
        const roomRef = doc(db, 'rooms', currentRoomCode);
        await updateDoc(roomRef, {
          [`players.${myPlayerId.current}`]: deleteField(),
          updatedAt: Date.now(),
        });
      } catch (e) {}
    }
    if (firestoreUnsubRef.current) {
      firestoreUnsubRef.current();
      firestoreUnsubRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsJoinedRoom(false);
    setRoomPlayersList([]);
    setMatchStatus('lobby');
    setInLobby(true);
  };

  // Push to Kill Feed
  const addKillFeed = (killer: string, victim: string, team: TeamId) => {
    const id = `${Date.now()}-${Math.random()}`;
    const text = `💥 ${killer} mengeliminasi ${victim} (+1 Skor)`;
    setHudKillFeed((prev) => [{ id, text, team }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setHudKillFeed((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  // Add floating damage number
  const addDamageText = (text: string, x: number, y: number, color: string) => {
    simState.current.damageTexts.push({
      id: `${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
    });
  };

  // Circle-to-AABB Box Collision Push-Out
  const resolveBoxCollision = (entity: { x: number; y: number }, radius: number, box: MapObstacle) => {
    const closestX = Math.max(box.x, Math.min(entity.x, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(entity.y, box.y + box.h));
    const dx = entity.x - closestX;
    const dy = entity.y - closestY;
    const distSq = dx * dx + dy * dy;

    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq);
      if (dist === 0) {
        entity.x = box.x - radius - 2;
        return true;
      }
      const overlap = radius - dist;
      entity.x += (dx / dist) * (overlap + 2.0);
      entity.y += (dy / dist) * (overlap + 2.0);
      return true;
    }
    return false;
  };

  // Respawn single player back into the arena
  const respawnSinglePlayer = (p: SimPlayer) => {
    p.isRespawning = false;
    const stats = getCharacterStats(p.customization?.characterClass);
    p.maxHp = stats.maxHp;
    p.hp = stats.maxHp;
    p.isShielded = true;
    p.respawnTimer = 0;

    const isAlly = p.team === playerTeam;
    if (isAlly) {
      // Local player & allies always respawn on Left base facing right
      p.x = 220 + Math.random() * 80;
      p.y = 380 + Math.random() * 480;
      p.angle = 0;
    } else {
      // Enemies always respawn on Right base facing left
      p.x = (WORLD_WIDTH - 260) - Math.random() * 80;
      p.y = 380 + Math.random() * 480;
      p.angle = Math.PI;
    }

    if (isLocalPlayer(p.id)) {
      setHudRespawnTimer(0);
      setHudMyHp(p.maxHp);
      soundEngine.playPowerUp();
      addDamageText('🛡️ RESPAWN! PERISAI KEBAL (3.5s)', p.x, p.y - 25, '#facc15');
    }

    // Protective Invulnerability shield expires after 3.5s
    setTimeout(() => {
      p.isShielded = false;
    }, 3500);
  };

  // Instant Respawn button for human player
  const handleInstantRespawn = () => {
    const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
    if (myP && myP.isRespawning) {
      respawnSinglePlayer(myP);
    }
  };

  // Mobile Dash sprint burst
  const handleMobileDash = () => {
    const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
    if (myP && !myP.isRespawning) {
      myP.activeSkill = {
        type: 'speed',
        timeLeft: 3.5,
      };
      soundEngine.playPowerUp();
      addDamageText('💨 DASH EVASIVE!', myP.x, myP.y - 20, '#10b981');
    }
  };

  // Initialize Roster, Skills & Particles
  const initRoster = useCallback(() => {
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
    const countPerTeam = totalPlayersConfig / 2;

    // Human Player with customized traits and unique ID - Always starts on left base facing right
    const mySpawnX = 220 + Math.random() * 60;
    const mySpawnY = 560 + (Math.random() - 0.5) * 160;
    const myStats = getCharacterStats(characterCustomization.characterClass);
    newPlayers.push({
      id: myPlayerId.current,
      name: playerName,
      team: playerTeam,
      x: mySpawnX,
      y: mySpawnY,
      angle: 0,
      hp: myStats.maxHp,
      maxHp: myStats.maxHp,
      score: 0,
      kills: 0,
      deaths: 0,
      isBot: false,
      isShielded: true,
      isRespawning: false,
      respawnTimer: 0,
      color: playerTeam === 'blue' ? '#38bdf8' : '#f43f5e',
      customization: characterCustomization,
    });

    let botIdx = 0;

    // Team Blue Bots (Left if ally, Right if enemy)
    const blueNeeded = playerTeam === 'blue' ? countPerTeam - 1 : countPerTeam;
    for (let i = 0; i < blueNeeded; i++) {
      const isAlly = playerTeam === 'blue';
      const botX = isAlly 
        ? 180 + Math.random() * 80 
        : (WORLD_WIDTH - 260) - Math.random() * 80;
      const botY = 360 + (i * 140);
      const botAngle = isAlly ? 0 : Math.PI;
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

    // Team Red Bots (Left if ally, Right if enemy)
    const redNeeded = playerTeam === 'red' ? countPerTeam - 1 : countPerTeam;
    for (let i = 0; i < redNeeded; i++) {
      const isAlly = playerTeam === 'red';
      const botX = isAlly 
        ? 180 + Math.random() * 80 
        : (WORLD_WIDTH - 260) - Math.random() * 80;
      const botY = 360 + (i * 140);
      const botAngle = isAlly ? 0 : Math.PI;
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

    // Remove spawn shields after 3s
    setTimeout(() => {
      simState.current.players.forEach((p) => {
        p.isShielded = false;
      });
    }, 3000);
  }, [totalPlayersConfig, playerTeam, selectedMapTheme, characterCustomization]);

  // Switch Team (Tim Biru / Tim Merah) with live sync
  const handleSelectTeam = async (newTeam: TeamId) => {
    setPlayerTeam(newTeam);
    soundEngine.playPowerUp();

    const myP = simState.current.players.find(p => isLocalPlayer(p.id));
    if (myP) {
      myP.team = newTeam;
      myP.color = newTeam === 'blue' ? '#38bdf8' : '#f43f5e';
      myP.x = 220 + Math.random() * 60;
      myP.y = newTeam === 'blue' ? 440 : 760;
      myP.angle = 0;
    }

    setRoomPlayersList(prev => prev.map(p => isLocalPlayer(p.id) ? { ...p, team: newTeam, color: newTeam === 'blue' ? '#38bdf8' : '#f43f5e' } : p));

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
          [`players.${uid}.x`]: 220 + Math.random() * 60,
          [`players.${uid}.y`]: newTeam === 'blue' ? 440 : 760,
          [`players.${uid}.angle`]: 0,
        });
      } catch (e) {
        console.warn("Firestore update team error:", e);
      }
    }
  };

  // Connect / Join Multiplayer Room
  const handleJoinMultiplayerRoom = async (targetCode?: string, asHost: boolean = false) => {
    soundEngine.playPowerUp();
    const codeToUse = (targetCode || roomCodeInput.trim() || currentRoomCode).toUpperCase();
    if (!codeToUse) return;
    setCurrentRoomCode(codeToUse);
    setIsJoinedRoom(true);

    // Ensure Anonymous Auth for Firestore rules
    let uid = auth.currentUser?.uid || myPlayerId.current;
    if (!auth.currentUser) {
      try {
        const cred = await signInAnonymously(auth);
        uid = cred.user.uid;
        myPlayerId.current = uid;
        try {
          sessionStorage.setItem('shop_shooter_player_uid', uid);
        } catch (e) {}
      } catch (e) {
        console.warn("Auth fallback to local UID:", e);
      }
    }

    if (asHost) {
      setIsRoomHost(true);
      setRoomHostId(uid);
    } else {
      setIsRoomHost(false);
    }

    // Set local player in simulation with unique UID
    let myP = simState.current.players.find(p => isLocalPlayer(p.id));
    if (!myP) {
      initRoster();
      myP = simState.current.players.find(p => isLocalPlayer(p.id));
    }
    if (myP) {
      myP.id = uid;
      myP.name = playerName;
      myP.team = playerTeam;
      myP.color = playerTeam === 'blue' ? '#38bdf8' : '#f43f5e';
      myP.x = 220 + Math.random() * 60;
      myP.y = playerTeam === 'blue' ? 440 : 760;
      myP.angle = 0;
    }

    const myPlayerData = {
      id: uid,
      username: playerName,
      team: playerTeam,
      color: playerTeam === 'blue' ? '#38bdf8' : '#f43f5e',
      score: 0,
      kills: 0,
      deaths: 0,
      hp: 100,
      maxHp: 100,
      x: 220 + Math.random() * 60,
      y: playerTeam === 'blue' ? 440 : 760,
      angle: 0,
      isReady: true,
      isBot: false,
      customization: characterCustomization,
    };

    // Always stay in lobby/waiting room when opening or joining a room
    setMatchStatus('lobby');
    setInLobby(true);

    // Immediately show self in room list
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
        setIsRoomHost(true);
        setRoomHostId(uid);
        await setDoc(roomRef, {
          code: codeToUse,
          gameState: 'waiting',
          totalSlots: totalPlayersConfig,
          mapTheme: selectedMapTheme,
          blueScore: 0,
          redScore: 0,
          timeLeft: 90,
          hostId: uid,
          updatedAt: Date.now(),
          players: {
            [uid]: myPlayerData,
          },
        });
      } else {
        const existingData = snap.data();
        if (asHost) {
          setIsRoomHost(true);
          setRoomHostId(uid);
          await updateDoc(roomRef, {
            gameState: 'waiting',
            hostId: uid,
            totalSlots: totalPlayersConfig,
            blueScore: 0,
            redScore: 0,
            timeLeft: 90,
            players: {
              [uid]: myPlayerData,
            },
            updatedAt: Date.now(),
          });
        } else {
          if (existingData?.hostId) {
            setRoomHostId(existingData.hostId);
            if (existingData.hostId === uid || isLocalPlayer(existingData.hostId)) {
              setIsRoomHost(true);
            }
          }
          await updateDoc(roomRef, {
            [`players.${uid}`]: myPlayerData,
            updatedAt: Date.now(),
          });
        }
      }

      // Real-time snapshot listener on room doc
      firestoreUnsubRef.current = onSnapshot(roomRef, (docSnap) => {
        if (!docSnap.exists()) {
          // Room was deleted by host
          setIsJoinedRoom(false);
          setIsRoomHost(false);
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
          if (data.hostId === uid || isLocalPlayer(data.hostId)) {
            setIsRoomHost(true);
          }
        } else if (asHost) {
          setRoomHostId(uid);
          setIsRoomHost(true);
        }

        // If player was kicked or removed from room
        if (!asHost && playersMap && !playersMap[uid] && playersList.length > 0) {
          setIsJoinedRoom(false);
          setIsRoomHost(false);
          setRoomHostId(null);
          setRoomPlayersList([]);
          return;
        }

        if (data.mapTheme) setSelectedMapTheme(data.mapTheme);
        if (data.totalSlots) setTotalPlayersConfig(data.totalSlots);

        // Update local team if synced from room
        if (playersMap[uid]) {
          setPlayerTeam(playersMap[uid].team);
          if (myP) {
            myP.team = playersMap[uid].team;
            myP.color = playersMap[uid].team === 'blue' ? '#38bdf8' : '#f43f5e';
          }
        }

        // When host starts match!
        if (data.gameState === 'playing' && matchStatus !== 'playing') {
          const myTeam = playersMap[uid]?.team || playerTeam;
          simState.current.players = playersList.map((p, pIdx) => {
            const isAlly = p.team === myTeam;
            const spawnX = isAlly 
              ? 220 + Math.random() * 80 
              : (WORLD_WIDTH - 260) - Math.random() * 80;
            const spawnY = 360 + (pIdx * 120);
            const spawnAngle = isAlly ? 0 : Math.PI;

            if (isLocalPlayer(p.id)) {
              return { 
                ...p, 
                id: uid, 
                x: spawnX, 
                y: spawnY, 
                angle: spawnAngle, 
                hp: p.hp || 100,
                maxHp: 100,
                isShielded: true,
                isRespawning: false,
                respawnTimer: 0,
              };
            }
            return {
              ...p,
              x: p.x || spawnX,
              y: p.y || spawnY,
              angle: p.angle !== undefined ? p.angle : spawnAngle,
              isBot: p.isBot || false,
              isShielded: p.isShielded || false,
              isRespawning: p.isRespawning || false,
              respawnTimer: p.respawnTimer || 0,
            };
          });

          if (data.blueScore !== undefined) simState.current.blueScore = data.blueScore;
          if (data.redScore !== undefined) simState.current.redScore = data.redScore;
          if (data.timeLeft !== undefined) simState.current.timeLeft = data.timeLeft;

          setInLobby(false);
          setMatchStatus('playing');
          soundEngine.playPowerUp();
          onTriggerSpecialNotification('Mega Golden Deal Box', 300);
        } else if (data.gameState === 'ended' && matchStatus === 'playing') {
          finishMatch();
        }
      });
    } catch (err) {
      console.warn("Firestore sync warning:", err);
    }

    // 2. WEBSOCKET FAST REALTIME PROTOCOL (Using unique player UID)
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
          } else if (data.type === 'match-started') {
            if (data.room && data.room.players) {
              const roomPlayers = Object.values(data.room.players) as any[];
              simState.current.players = roomPlayers.map(p => {
                if (isLocalPlayer(p.id)) {
                  const existing = simState.current.players.find(x => isLocalPlayer(x.id));
                  return existing ? { ...p, id: uid, x: existing.x, y: existing.y, angle: existing.angle, hp: existing.hp } : { ...p, id: uid };
                }
                return {
                  ...p,
                  isBot: p.isBot || false,
                  isShielded: p.isShielded || false,
                  isRespawning: p.isRespawning || false,
                  respawnTimer: p.respawnTimer || 0,
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
            if (!isLocalPlayer(data.playerId)) {
              const p = simState.current.players.find(item => item.id === data.playerId);
              if (p) {
                Object.assign(p, data.updates);
              }
            }
          } else if (data.type === 'bullet-fired') {
            if (!isLocalPlayer(data.playerId)) {
              simState.current.bullets.push(data.bullet);
            }
          } else if (data.type === 'room-deleted') {
            setIsJoinedRoom(false);
            setIsRoomHost(false);
            setRoomHostId(null);
            setRoomPlayersList([]);
            if (firestoreUnsubRef.current) {
              firestoreUnsubRef.current();
              firestoreUnsubRef.current = null;
            }
          } else if (data.type === 'player-left') {
            if (data.room && data.room.players) {
              setRoomPlayersList(Object.values(data.room.players));
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
  const startMatch = async () => {
    if (gameModeType === 'bot') {
      setInLobby(false);
      setMatchStatus('playing');
      initRoster();
      soundEngine.playPowerUp();
      onTriggerSpecialNotification('Mega Golden Deal Box', 300);
    } else {
      soundEngine.playPowerUp();
      // Start match in Firestore
      if (currentRoomCode) {
        try {
          const roomRef = doc(db, 'rooms', currentRoomCode);
          await updateDoc(roomRef, {
            gameState: 'playing',
            updatedAt: Date.now(),
          });
        } catch (e) {
          console.warn("Firestore start match error:", e);
        }
      }
      // Also send via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'start-match' }));
      }
    }
  };

  const handleKickPlayer = async (targetId: string) => {
    soundEngine.playPowerUp();
    // Instantly remove locally
    setRoomPlayersList(prev => prev.filter(p => p.id !== targetId));

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

    const isAlly = newTeam === playerTeam;
    const newX = isAlly 
      ? 220 + Math.random() * 80 
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const newAngle = isAlly ? 0 : Math.PI;

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
    setIsJoinedRoom(false);
    setIsRoomHost(false);
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
    setIsJoinedRoom(false);
    setIsRoomHost(false);
    setRoomHostId(null);
    setRoomPlayersList([]);
    setRoomCodeInput('');
  };

  // Finish Match
  const finishMatch = useCallback(() => {
    setMatchStatus('ended');
    const myPlayer = simState.current.players.find((p) => !p.isBot);
    const blueWon = simState.current.blueScore >= simState.current.redScore;
    const myTeamWon = myPlayer?.team === 'blue' ? blueWon : !blueWon;

    const baseReward = myTeamWon ? 500 : 150;
    const killBonus = (myPlayer?.kills || 0) * 30;
    const totalAward = baseReward + killBonus;

    onAddDiscountPoints(totalAward);

    if (myTeamWon) {
      soundEngine.playCheckoutSuccess();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });
    }
  }, [onAddDiscountPoints]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.code === 'Space') {
        shootLaser(myPlayerId.current);
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    const handleUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  // Shoot Weapon Function (Supports Triple Shot & Rapid Fire skills!)
  const shootLaser = (playerId: string) => {
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

    const speed = 23;

    // Helper to spawn 1 bullet
    const createBullet = (fireAngle: number) => ({
      id: `${p.id}-${now}-${Math.random()}`,
      shooterId: p.id,
      team: p.team,
      x: p.x + Math.cos(fireAngle) * 30,
      y: p.y + Math.sin(fireAngle) * 30,
      vx: Math.cos(fireAngle) * speed,
      vy: Math.sin(fireAngle) * speed,
      damage: Math.floor(18 + Math.random() * 25),
      color: p.team === 'blue' ? (isTriple ? '#38bdf8' : '#0284c7') : (isTriple ? '#fb7185' : '#e11d48'),
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
  };

  // Mouse Move on Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = mouseX + simState.current.cameraX;
    const worldY = mouseY + simState.current.cameraY;

    mouseWorldPos.current = { x: worldX, y: worldY };

    const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
    if (myP && !myP.isRespawning) {
      myP.angle = Math.atan2(worldY - myP.y, worldX - myP.x);
    }
  };

  const handleCanvasMouseDown = () => {
    isMouseDown.current = true;
    shootLaser(myPlayerId.current);
  };

  const handleCanvasMouseUp = () => {
    isMouseDown.current = false;
  };

  // Mobile Virtual Joystick Touch Handlers (Smooth 360° Movement on Phone)
  const handleJoyTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
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

  // Mobile Touch Aim & Shoot Pad Handlers
  const handleAimTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const worldX = touch.clientX - rect.left + simState.current.cameraX;
    const worldY = touch.clientY - rect.top + simState.current.cameraY;

    const myP = simState.current.players.find((p) => isLocalPlayer(p.id));
    if (myP && !myP.isRespawning) {
      myP.angle = Math.atan2(worldY - myP.y, worldX - myP.x);
    }
  };

  // Main High-Performance Game Engine Loop (60 FPS)
  useEffect(() => {
    if (matchStatus !== 'playing') return;

    let lastTick = performance.now();
    let hudTimerAccumulator = 0;

    const loop = (time: number) => {
      const dt = Math.min(0.08, (time - lastTick) / 1000);
      lastTick = time;
      hudTimerAccumulator += dt;

      const sim = simState.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const themeConfig = MAP_THEMES_CONFIG[sim.currentTheme];

      // 1. Process Respawn for ALL Players (Fixing bug: player cannot respawn!)
      sim.players.forEach((p) => {
        if (p.isRespawning) {
          p.respawnTimer -= dt;
          if (isLocalPlayer(p.id)) {
            setHudRespawnTimer(Math.max(0, p.respawnTimer));
          }

          if (p.respawnTimer <= 0) {
            respawnSinglePlayer(p);
          }
        }
      });

      // 2. Update Match Timer and HUD
      if (hudTimerAccumulator >= 0.5) {
        hudTimerAccumulator = 0;
        sim.timeLeft -= 0.5;
        setHudTimeLeft(Math.max(0, Math.floor(sim.timeLeft)));
        setHudBlueScore(sim.blueScore);
        setHudRedScore(sim.redScore);

        const myP = sim.players.find((p) => isLocalPlayer(p.id));
        if (myP) {
          setHudMyHp(myP.hp);
          setHudMyKills(myP.kills);
          if (myP.activeSkill && myP.activeSkill.timeLeft > 0) {
            const skillLabel =
              myP.activeSkill.type === 'tripleshot'
                ? 'TRIPLE SHOT 3x'
                : myP.activeSkill.type === 'rapidfire'
                ? 'RAPID FIRE'
                : myP.activeSkill.type === 'shield'
                ? 'SHIELD DOME'
                : 'SPEED OVERDRIVE';
            setHudActiveSkill({
              type: myP.activeSkill.type,
              label: skillLabel,
              timeLeft: Math.ceil(myP.activeSkill.timeLeft),
            });
          } else {
            setHudActiveSkill(null);
          }
        }

        if (sim.timeLeft <= 0) {
          finishMatch();
          return;
        }
      }

      // Continuous firing when mouse or mobile shoot button is held
      if (isMouseDown.current) {
        shootLaser(myPlayerId.current);
      }

      // 3. Decrement Skill Timers on Players
      sim.players.forEach((p) => {
        if (p.activeSkill) {
          p.activeSkill.timeLeft -= dt;
          if (p.activeSkill.timeLeft <= 0) {
            p.activeSkill = undefined;
          }
        }
      });

      // 4. Move Local Player (WASD Keyboard + Mobile Virtual Joystick)
      const myP = sim.players.find((p) => isLocalPlayer(p.id));
      if (myP && !myP.isRespawning) {
        let dx = 0;
        let dy = 0;
        const myStats = getCharacterStats(myP.customization?.characterClass);
        const isSpeedSkill = myP.activeSkill?.type === 'speed';
        const speed = (isSpeedSkill ? 11.5 : 7.5) * myStats.speedMultiplier;

        // Keyboard inputs
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= speed;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += speed;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= speed;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += speed;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        // Add mobile virtual joystick inputs
        if (mobileMoveVector.current.x !== 0 || mobileMoveVector.current.y !== 0) {
          dx += mobileMoveVector.current.x * speed;
          dy += mobileMoveVector.current.y * speed;
        }

        myP.x = Math.max(45, Math.min(WORLD_WIDTH - 45, myP.x + dx));
        myP.y = Math.max(45, Math.min(WORLD_HEIGHT - 45, myP.y + dy));



        // Circle-to-AABB Box Collision Push-Out
        themeConfig.obstacles.forEach((obs) => {
          resolveBoxCollision(myP, 26, obs);
        });

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'player-update',
            updates: {
              x: myP.x,
              y: myP.y,
              angle: myP.angle,
              hp: myP.hp,
              score: myP.score,
              kills: myP.kills,
              deaths: myP.deaths,
            }
          }));
        }
      }

      // 5. Update AI Bots
      sim.players.forEach((bot) => {
        if (!bot.isBot || bot.isRespawning) return;

        // Target opposing players
        let targetX = 1100;
        let targetY = 640;
        let minDist = 999999;

        sim.players.forEach((other) => {
          if (other.team !== bot.team && !other.isRespawning) {
            const d = Math.hypot(other.x - bot.x, other.y - bot.y);
            if (d < minDist) {
              minDist = d;
              targetX = other.x;
              targetY = other.y;
            }
          }
        });

        // Steer towards target
        let angleTo = Math.atan2(targetY - bot.y, targetX - bot.x);
        bot.angle = angleTo;

        const botStats = getCharacterStats(bot.customization?.characterClass);
        const isSpeedSkill = bot.activeSkill?.type === 'speed';
        let moveSpeed = (isSpeedSkill ? 6.5 : 4.4) * (botStats?.speedMultiplier || 1.0);

        if (minDist < 260) {
          moveSpeed = -1.5; // Combat spacing
        }

        bot.x += Math.cos(angleTo) * moveSpeed;
        bot.y += Math.sin(angleTo) * moveSpeed;

        // Obstacle push-out
        themeConfig.obstacles.forEach((obs) => {
          resolveBoxCollision(bot, 26, obs);
        });

        bot.x = Math.max(60, Math.min(WORLD_WIDTH - 60, bot.x));
        bot.y = Math.max(60, Math.min(WORLD_HEIGHT - 60, bot.y));

        // Bot Firing logic
        if (minDist < 650 && Math.random() < 0.04) {
          shootLaser(bot.id);
        }
      });

      // 6. Bot-to-Bot & Player Mutual Separation
      for (let i = 0; i < sim.players.length; i++) {
        for (let j = i + 1; j < sim.players.length; j++) {
          const p1 = sim.players[i];
          const p2 = sim.players[j];
          if (p1.isRespawning || p2.isRespawning) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = 46;

          if (dist < minDist) {
            const overlap = (minDist - (dist || 0.1)) / 2;
            const nx = (dx || 0.1) / (dist || 0.1);
            const ny = (dy || 0.1) / (dist || 0.1);
            p1.x -= nx * (overlap + 1.0);
            p1.y -= ny * (overlap + 1.0);
            p2.x += nx * (overlap + 1.0);
            p2.y += ny * (overlap + 1.0);
          }
        }
      }

      // 7. Collectible In-Game Skills Check
      sim.skills.forEach((skill) => {
        if (!skill.isAvailable) {
          skill.respawnCooldown -= dt;
          if (skill.respawnCooldown <= 0) {
            skill.isAvailable = true;
          }
          return;
        }

        sim.players.forEach((p) => {
          if (p.isRespawning) return;
          const dist = Math.hypot(p.x - skill.x, p.y - skill.y);
          if (dist < 42 && skill.isAvailable) {
            skill.isAvailable = false;
            skill.respawnCooldown = 22;

            if (skill.type === 'heal') {
              p.hp = Math.min(p.maxHp, p.hp + 50);
              addDamageText('+50 HEAL!', p.x, p.y - 25, '#22c55e');
            } else {
              p.activeSkill = {
                type: skill.type,
                timeLeft: skill.duration,
              };
              addDamageText(`${skill.icon} ${skill.label}!`, p.x, p.y - 25, skill.color);
            }

            if (isLocalPlayer(p.id)) {
              soundEngine.playPowerUp();
            }
          }
        });
      });

      // 8. Update Bullets & Collisions
      for (let i = sim.bullets.length - 1; i >= 0; i--) {
        const b = sim.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life -= 1;

        if (b.x < 0 || b.x > WORLD_WIDTH || b.y < 0 || b.y > WORLD_HEIGHT || b.life <= 0) {
          sim.bullets.splice(i, 1);
          continue;
        }

        // Obstacle collision
        let hitObs = false;
        for (const obs of themeConfig.obstacles) {
          if (b.x > obs.x && b.x < obs.x + obs.w && b.y > obs.y && b.y < obs.y + obs.h) {
            hitObs = true;
            break;
          }
        }
        if (hitObs) {
          sim.bullets.splice(i, 1);
          continue;
        }

        // Player Hit Collision
        let hitPlayer = false;
        for (const target of sim.players) {
          if (target.team !== b.team && !target.isRespawning) {
            const hasShieldSkill = target.activeSkill?.type === 'shield';
            if (target.isShielded || hasShieldSkill) {
              const dist = Math.hypot(target.x - b.x, target.y - b.y);
              if (dist < 32) {
                hitPlayer = true;
                addDamageText('BLOCKED!', target.x, target.y - 15, '#38bdf8');
                break;
              }
            } else {
              const dist = Math.hypot(target.x - b.x, target.y - b.y);
              if (dist < 26) {
                hitPlayer = true;
                const shooter = sim.players.find((p) => p.id === b.shooterId);
                const shooterStats = getCharacterStats(shooter?.customization?.characterClass);
                const rawDmg = Math.floor(b.damage * (shooterStats?.damageMultiplier || 1.0));

                const isTanker = target.customization?.characterClass === 'tanker';
                const damageReduction = isTanker ? 0.6 : 1.0;
                const finalDmg = Math.max(4, Math.round(rawDmg * damageReduction));

                target.hp = Math.max(0, target.hp - finalDmg);
                addDamageText(`-${finalDmg}`, target.x, target.y - 10, b.team === 'blue' ? '#22c55e' : '#f59e0b');
                soundEngine.playHit(target.hp === 0);

                if (target.hp === 0) {
                  target.deaths += 1;
                  target.isRespawning = true;
                  target.respawnTimer = 3.5;

                  const shooter = sim.players.find((p) => p.id === b.shooterId);
                  if (shooter) {
                    shooter.kills += 1;
                    shooter.score += 100;
                    addKillFeed(shooter.name, target.name, b.team);
                  }

                  if (b.team === 'blue') sim.blueScore += 1;
                  else sim.redScore += 1;
                }
                break;
              }
            }
          }
        }
        if (hitPlayer) {
          sim.bullets.splice(i, 1);
          continue;
        }

        // Boss Hit Collision
        if (sim.boss && sim.boss.hp > 0) {
          const bossDist = Math.hypot(sim.boss.x - b.x, sim.boss.y - b.y);
          if (bossDist < 38) {
            sim.boss.hp = Math.max(0, sim.boss.hp - b.damage);
            addDamageText(`-${b.damage}`, sim.boss.x, sim.boss.y - 20, '#fbbf24');
            soundEngine.playHit(false);

            if (sim.boss.hp === 0) {
              soundEngine.playPowerUp();
              if (b.team === 'blue') sim.blueScore += 3;
              else sim.redScore += 3;

              addDamageText('+300 BOSS VOUCHER!', sim.boss.x, sim.boss.y - 40, '#f59e0b');
            }

            sim.bullets.splice(i, 1);
            continue;
          }
        }
      }

      // 9. Update Boss Position
      if (sim.boss && sim.boss.hp > 0) {
        sim.boss.x += sim.boss.vx;
        sim.boss.y += sim.boss.vy;
        if (sim.boss.x < 900 || sim.boss.x > 1300) sim.boss.vx *= -1;
        if (sim.boss.y < 480 || sim.boss.y > 800) sim.boss.vy *= -1;
      }

      // 10. Update Ambient Theme Particles
      sim.ambientParticles.forEach((part) => {
        part.x += part.vx;
        part.y += part.vy;
        if (part.y < 0) part.y = WORLD_HEIGHT;
        if (part.x < 0) part.x = WORLD_WIDTH;
        if (part.x > WORLD_WIDTH) part.x = 0;
      });

      // 11. Camera Tracking (Centered on local player)
      if (canvas) {
        const viewW = canvas.width;
        const viewH = canvas.height;
        const focusP = sim.players.find((p) => isLocalPlayer(p.id));
        if (focusP) {
          sim.cameraX = Math.max(0, Math.min(WORLD_WIDTH - viewW, focusP.x - viewW / 2));
          sim.cameraY = Math.max(0, Math.min(WORLD_HEIGHT - viewH, focusP.y - viewH / 2));
        }
      }

      // ==========================================
      // 12. RENDER PASS (HTML5 Canvas 60 FPS)
      // ==========================================
      if (canvas && ctx) {
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Camera World space translation
        ctx.translate(-sim.cameraX, -sim.cameraY);

        // A. Themed Arena Floor
        ctx.fillStyle = themeConfig.bgColor;
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        // Grid lines
        ctx.strokeStyle = themeConfig.gridColor;
        ctx.lineWidth = 1;
        const gSize = 60;
        for (let x = 0; x <= WORLD_WIDTH; x += gSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, WORLD_HEIGHT);
          ctx.stroke();
        }
        for (let y = 0; y <= WORLD_HEIGHT; y += gSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(WORLD_WIDTH, y);
          ctx.stroke();
        }

        // B. Base Zones
        // B. Base Zones
        const leftTeam = playerTeam;
        const rightTeam = playerTeam === 'blue' ? 'red' : 'blue';

        const leftRgba = leftTeam === 'blue' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(244, 63, 94, 0.08)';
        const leftStroke = leftTeam === 'blue' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(244, 63, 94, 0.4)';
        const leftText = leftTeam === 'blue' ? 'BLUE BASE' : 'RED BASE';
        const leftTextFill = leftTeam === 'blue' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(244, 63, 94, 0.2)';

        const rightRgba = rightTeam === 'blue' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(244, 63, 94, 0.08)';
        const rightStroke = rightTeam === 'blue' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(244, 63, 94, 0.4)';
        const rightText = rightTeam === 'blue' ? 'BLUE BASE' : 'RED BASE';
        const rightTextFill = rightTeam === 'blue' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(244, 63, 94, 0.2)';

        // Left Base
        ctx.fillStyle = leftRgba;
        ctx.fillRect(0, 0, 320, WORLD_HEIGHT);
        ctx.strokeStyle = leftStroke;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(0, 0, 320, WORLD_HEIGHT);
        ctx.setLineDash([]);
        ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = leftTextFill;
        ctx.fillText(leftText, 60, WORLD_HEIGHT / 2);

        // Right Base
        ctx.fillStyle = rightRgba;
        ctx.fillRect(WORLD_WIDTH - 320, 0, 320, WORLD_HEIGHT);
        ctx.strokeStyle = rightStroke;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(WORLD_WIDTH - 320, 0, 320, WORLD_HEIGHT);
        ctx.setLineDash([]);
        ctx.fillStyle = rightTextFill;
        ctx.fillText(rightText, WORLD_WIDTH - 240, WORLD_HEIGHT / 2);

        // C. MAP THEMED DECORATIONS (Shopping Mall, Neon Rooftop, Tech Warehouse, Sky Garden)
        themeConfig.decorations.forEach((dec) => {
          ctx.save();
          if (dec.type === 'showcase') {
            // High-tech glass computer/electronics showcase counter
            ctx.save();
            ctx.shadowBlur = 18;
            ctx.shadowColor = dec.color;
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(dec.x - dec.size, dec.y - dec.size * 0.6, dec.size * 2, dec.size * 1.2, 8);
            ctx.fill();
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Glass screen / keyboard glow inside showcase
            ctx.fillStyle = dec.secondaryColor || '#38bdf8';
            ctx.fillRect(dec.x - dec.size * 0.6, dec.y - dec.size * 0.3, dec.size * 1.2, dec.size * 0.6);

            // Tech label underneath
            if (dec.label) {
              ctx.font = 'bold 9px monospace';
              ctx.fillStyle = '#f8fafc';
              ctx.textAlign = 'center';
              ctx.fillText(dec.label, dec.x, dec.y + dec.size + 14);
            }
            ctx.restore();
          } else if (dec.type === 'promo_billboard') {
            // Glowing neon promotional banner
            ctx.save();
            ctx.shadowBlur = 24;
            ctx.shadowColor = dec.color;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            const bWidth = dec.size * 3.6;
            const bHeight = 32;
            ctx.beginPath();
            ctx.roundRect(dec.x - bWidth / 2, dec.y - bHeight / 2, bWidth, bHeight, 8);
            ctx.fill();
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Corner cyber bracket notches
            ctx.fillStyle = dec.color;
            ctx.fillRect(dec.x - bWidth / 2, dec.y - bHeight / 2, 6, 6);
            ctx.fillRect(dec.x + bWidth / 2 - 6, dec.y - bHeight / 2, 6, 6);
            ctx.fillRect(dec.x - bWidth / 2, dec.y + bHeight / 2 - 6, 6, 6);
            ctx.fillRect(dec.x + bWidth / 2 - 6, dec.y + bHeight / 2 - 6, 6, 6);

            ctx.font = '900 11px "Plus Jakarta Sans", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(dec.label || 'PROMO MALL', dec.x, dec.y + 4);
            ctx.restore();
          } else if (dec.type === 'escalator') {
            // Mall escalator / travelator floor markings with animated chevron arrows
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
            ctx.fillRect(dec.x - 24, dec.y - 40, 48, 80);
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(dec.x - 24, dec.y - 40, 48, 80);

            // Chevrons
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 3;
            const animOffset = (Date.now() / 250) % 20;
            for (let cy = -30; cy <= 30; cy += 20) {
              const pos = cy + animOffset - 10;
              if (pos > -36 && pos < 36) {
                ctx.beginPath();
                ctx.moveTo(dec.x - 14, dec.y + pos + 6);
                ctx.lineTo(dec.x, dec.y + pos - 4);
                ctx.lineTo(dec.x + 14, dec.y + pos + 6);
                ctx.stroke();
              }
            }
            if (dec.label) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#94a3b8';
              ctx.textAlign = 'center';
              ctx.fillText(dec.label, dec.x, dec.y + 54);
            }
            ctx.restore();
          } else if (dec.type === 'kiosk') {
            // Touchscreen mall info directory kiosk
            ctx.save();
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(dec.x - 16, dec.y - 20, 32, 40);
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(dec.x - 16, dec.y - 20, 32, 40);
            ctx.shadowBlur = 12;
            ctx.shadowColor = dec.color;
            ctx.fillStyle = dec.color;
            ctx.fillRect(dec.x - 12, dec.y - 14, 24, 18);
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(dec.label || 'INFO', dec.x, dec.y + 30);
            ctx.restore();
          } else if (dec.type === 'helipad') {
            // Neon rooftop helipad with landing circle and [ H ]
            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = dec.color;
            // Outer dashed ring
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 3;
            ctx.setLineDash([12, 10]);
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Inner circle
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, dec.size * 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = dec.secondaryColor || '#facc15';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Bold [ H ] emblem
            ctx.font = '900 48px monospace';
            ctx.fillStyle = dec.secondaryColor || '#facc15';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('H', dec.x, dec.y);

            // 4 Corner Strobes
            const strobeAlpha = (Math.sin(Date.now() / 150) + 1) / 2;
            ctx.fillStyle = `rgba(244, 63, 94, ${strobeAlpha})`;
            const sDist = dec.size * 1.15;
            [-sDist, sDist].forEach((sx) => {
              [-sDist, sDist].forEach((sy) => {
                ctx.beginPath();
                ctx.arc(dec.x + sx, dec.y + sy, 5, 0, Math.PI * 2);
                ctx.fill();
              });
            });
            ctx.restore();
          } else if (dec.type === 'neon_sign') {
            // Giant rooftop advertising neon sign
            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = dec.color;
            ctx.fillStyle = 'rgba(10, 6, 20, 0.9)';
            const sW = dec.size * 5;
            const sH = 34;
            ctx.fillRect(dec.x - sW / 2, dec.y - sH / 2, sW, sH);
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(dec.x - sW / 2, dec.y - sH / 2, sW, sH);

            ctx.font = '900 12px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = dec.color;
            ctx.textAlign = 'center';
            ctx.fillText(dec.label || 'CYBER ROOFTOP', dec.x, dec.y + 4);
            ctx.restore();
          } else if (dec.type === 'antenna_tower') {
            // Rooftop communication mast with blinking aviation hazard beacon
            ctx.save();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(dec.x - 14, dec.y + 24);
            ctx.lineTo(dec.x, dec.y - 28);
            ctx.lineTo(dec.x + 14, dec.y + 24);
            ctx.moveTo(dec.x - 10, dec.y + 6);
            ctx.lineTo(dec.x + 10, dec.y + 6);
            ctx.stroke();

            // Blinking beacon
            const blink = Math.sin(Date.now() / 180) > 0;
            ctx.fillStyle = blink ? dec.color : '#334155';
            ctx.shadowBlur = blink ? 20 : 0;
            ctx.shadowColor = dec.color;
            ctx.beginPath();
            ctx.arc(dec.x, dec.y - 30, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (dec.type === 'chiller_fan') {
            // Rotating HVAC ventilation chiller fan
            ctx.save();
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Blades rotating
            const fanAngle = Date.now() / 120;
            ctx.save();
            ctx.translate(dec.x, dec.y);
            ctx.rotate(fanAngle);
            ctx.fillStyle = dec.color;
            for (let b = 0; b < 4; b++) {
              ctx.rotate(Math.PI / 2);
              ctx.fillRect(0, -3, dec.size * 0.8, 6);
            }
            ctx.restore();
            ctx.restore();
          } else if (dec.type === 'skyline_light') {
            // Cyberpunk city skyline spotlight sweeping sky
            ctx.save();
            const beamAngle = Math.sin(Date.now() / 1200) * 0.35;
            ctx.translate(dec.x, dec.y);
            ctx.rotate(beamAngle);
            const beamGrad = ctx.createLinearGradient(0, 0, 0, -dec.size * 3);
            beamGrad.addColorStop(0, `${dec.color}66`);
            beamGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(-6, 0);
            ctx.lineTo(-40, -dec.size * 3);
            ctx.lineTo(40, -dec.size * 3);
            ctx.lineTo(6, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else if (dec.type === 'crate_stack') {
            // Warehouse high-tech shipping cargo containers with hazard stripes
            ctx.save();
            ctx.fillStyle = '#292524';
            ctx.fillRect(dec.x - dec.size, dec.y - dec.size, dec.size * 2, dec.size * 2);
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(dec.x - dec.size, dec.y - dec.size, dec.size * 2, dec.size * 2);

            // Diagonal hazard warning stripes
            ctx.fillStyle = dec.color;
            ctx.fillRect(dec.x - dec.size, dec.y - dec.size, dec.size * 2, 7);
            ctx.fillRect(dec.x - dec.size, dec.y + dec.size - 7, dec.size * 2, 7);

            if (dec.label) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#f8fafc';
              ctx.textAlign = 'center';
              ctx.fillText(dec.label, dec.x, dec.y + 3);
            }
            ctx.restore();
          } else if (dec.type === 'conveyor') {
            // Automated logistics conveyor belt with rolling parcels
            ctx.save();
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(dec.x - dec.size, dec.y - 12, dec.size * 2, 24);
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(dec.x - dec.size, dec.y - 12, dec.size * 2, 24);

            // Moving parcel box on conveyor
            const parcelOffset = ((Date.now() / 40) % (dec.size * 2)) - dec.size;
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(dec.x + parcelOffset - 8, dec.y - 8, 16, 16);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(dec.x + parcelOffset - 8, dec.y - 8, 16, 16);
            ctx.restore();
          } else if (dec.type === 'forklift_dock') {
            // Sorting robot dock
            ctx.save();
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(dec.x - dec.size / 2, dec.y - dec.size / 2, dec.size, dec.size);
            ctx.setLineDash([]);
            ctx.fillStyle = `${dec.color}22`;
            ctx.fillRect(dec.x - dec.size / 2, dec.y - dec.size / 2, dec.size, dec.size);
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = dec.color;
            ctx.textAlign = 'center';
            ctx.fillText(dec.label || 'AGV DOCK', dec.x, dec.y + 4);
            ctx.restore();
          } else if (dec.type === 'barcode_scanner') {
            // Red laser scanner beam across lane
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = dec.color;
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2.5;
            const beamPulse = (Math.sin(Date.now() / 150) + 1) / 2;
            ctx.globalAlpha = 0.5 + beamPulse * 0.5;
            ctx.beginPath();
            ctx.moveTo(dec.x - dec.size, dec.y);
            ctx.lineTo(dec.x + dec.size, dec.y);
            ctx.stroke();
            ctx.restore();
          } else if (dec.type === 'cyber_fountain') {
            // Sky Garden cyber lotus aquatic fountain with concentric pulsing water ripples
            ctx.save();
            ctx.shadowBlur = 24;
            ctx.shadowColor = dec.color;

            // Concentric expanding ripples
            const ripple1 = (Date.now() / 30) % dec.size;
            const ripple2 = (Date.now() / 30 + dec.size * 0.5) % dec.size;

            ctx.strokeStyle = `${dec.color}66`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, ripple1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, ripple2, 0, Math.PI * 2);
            ctx.stroke();

            // Central pool basin
            ctx.fillStyle = '#06281e';
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = dec.secondaryColor || '#34d399';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Lotus emblem
            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🪷', dec.x, dec.y);
            ctx.restore();
          } else if (dec.type === 'biophilic_tree') {
            // Luminous hydroponic tree
            ctx.save();
            ctx.shadowBlur = 24;
            ctx.shadowColor = dec.secondaryColor || dec.color;
            ctx.fillStyle = dec.color;
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = dec.secondaryColor || '#34d399';
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, dec.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (dec.type === 'planter_box') {
            // Modern geometric planter with glowing flowers
            ctx.save();
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(dec.x - dec.size / 2, dec.y - 12, dec.size, 24);
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(dec.x - dec.size / 2, dec.y - 12, dec.size, 24);
            ctx.fillStyle = dec.secondaryColor || '#f43f5e';
            ctx.beginPath();
            ctx.arc(dec.x - 6, dec.y, 4, 0, Math.PI * 2);
            ctx.arc(dec.x + 6, dec.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (dec.type === 'glass_skywalk') {
            // Glass skywalk bridge
            ctx.save();
            ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
            ctx.fillRect(dec.x - dec.size, dec.y - 16, dec.size * 2, 32);
            ctx.strokeStyle = dec.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(dec.x - dec.size, dec.y - 16, dec.size * 2, 32);
            ctx.restore();
          } else if (dec.type === 'crystal') {
            // Cavern crystal
            ctx.save();
            ctx.translate(dec.x, dec.y);
            ctx.shadowBlur = 18;
            ctx.shadowColor = dec.color;
            ctx.fillStyle = dec.color;
            ctx.beginPath();
            ctx.moveTo(0, -dec.size);
            ctx.lineTo(dec.size * 0.5, 0);
            ctx.lineTo(0, dec.size);
            ctx.lineTo(-dec.size * 0.5, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else if (dec.type === 'lava_pool') {
            // Lava pool
            ctx.save();
            ctx.shadowBlur = 24;
            ctx.shadowColor = dec.color;
            ctx.fillStyle = dec.color;
            ctx.beginPath();
            ctx.ellipse(dec.x, dec.y, dec.size, dec.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();
        });

        // D. Ambient Themed Floating Particles
        sim.ambientParticles.forEach((part) => {
          ctx.save();
          ctx.globalAlpha = part.alpha;
          ctx.fillStyle = part.color;
          ctx.beginPath();
          ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // E. Collectible In-Game Skill Pads
        sim.skills.forEach((skill) => {
          ctx.save();
          if (skill.isAvailable) {
            ctx.shadowBlur = 18;
            ctx.shadowColor = skill.color;
            ctx.strokeStyle = skill.color;
            ctx.lineWidth = 2.5;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.beginPath();
            ctx.arc(skill.x, skill.y, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(skill.icon, skill.x, skill.y + 6);

            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = skill.color;
            ctx.fillText(skill.label, skill.x, skill.y + 36);
          } else {
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.5;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
            ctx.beginPath();
            ctx.arc(skill.x, skill.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.ceil(skill.respawnCooldown)}s`, skill.x, skill.y + 3);
          }
          ctx.restore();
        });

        // F. Themed Obstacles
        themeConfig.obstacles.forEach((obs) => {
          ctx.fillStyle = obs.color;
          ctx.strokeStyle = obs.borderColor;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 20);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, obs.x + obs.w / 2, obs.y + obs.h / 2 + 4);
        });

        // G. Golden Deal Boss
        if (sim.boss && sim.boss.hp > 0) {
          const b = sim.boss;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(b.x - 36, b.y - 44, 72, 8);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(b.x - 36, b.y - 44, (b.hp / b.maxHp) * 72, 8);

          ctx.shadowBlur = 25;
          ctx.shadowColor = '#f59e0b';
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size, 18);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👑', b.x, b.y + 8);
        }

        // H. Bullets (Glowing Projectiles)
        sim.bullets.forEach((bullet) => {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = bullet.color;
          ctx.fillStyle = bullet.color;
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // I. Players & Bots with Full Character Customization Models!
        sim.players.forEach((p) => {
          if (p.isRespawning) return;

          ctx.save();

          // Hexagonal glowing pedestal
          const hexRadius = 32;
          ctx.save();
          ctx.shadowBlur = 22;
          ctx.shadowColor = p.team === 'blue' ? '#06b6d4' : '#f43f5e';
          ctx.strokeStyle = p.team === 'blue' ? '#38bdf8' : '#fb7185';
          ctx.fillStyle = p.team === 'blue' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(244, 63, 94, 0.25)';
          ctx.lineWidth = 3;

          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const hAngle = (Math.PI / 3) * s;
            const hx = p.x + hexRadius * Math.cos(hAngle);
            const hy = p.y + hexRadius * Math.sin(hAngle);
            if (s === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Spawn Shield / Invulnerability Dome
          if (p.isShielded || p.activeSkill?.type === 'shield') {
            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#facc15';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 40, 0, Math.PI * 2);
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3.5;
            ctx.stroke();

            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#fde047';
            ctx.textAlign = 'center';
            ctx.fillText('SHIELDED', p.x, p.y + 48);
            ctx.restore();
          }

          // Active Skill Ring
          if (p.activeSkill) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 42, 0, Math.PI * 2);
            ctx.strokeStyle =
              p.activeSkill.type === 'tripleshot'
                ? '#f59e0b'
                : p.activeSkill.type === 'rapidfire'
                ? '#38bdf8'
                : '#10b981';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Render Character Avatar based on Customization
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          const custom = p.customization || {
            characterClass: 'phantom',
            primaryColor: p.team === 'blue' ? '#0284c7' : '#e11d48',
            secondaryColor: '#0f172a',
            visorColor: p.team === 'blue' ? '#38bdf8' : '#fb7185',
            weaponSkin: 'dual_blaster',
            accessory: 'none',
            trailEffect: 'sparks',
          };

          // Weapon Barrel Drawing
          ctx.save();
          ctx.fillStyle = '#f8fafc';
          if (custom.weaponSkin === 'dual_blaster') {
            ctx.fillRect(10, -7, 20, 5);
            ctx.fillRect(10, 2, 20, 5);
            ctx.fillStyle = custom.visorColor;
            ctx.fillRect(26, -6, 5, 3);
            ctx.fillRect(26, 3, 5, 3);
          } else if (custom.weaponSkin === 'laser_cannon') {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(10, -6, 24, 12);
            ctx.fillStyle = custom.visorColor;
            ctx.fillRect(30, -4, 6, 8);
          } else if (custom.weaponSkin === 'plasma_rifle') {
            ctx.fillRect(8, -3, 26, 6);
            ctx.fillStyle = custom.visorColor;
            ctx.fillRect(14, -5, 6, 2);
          } else {
            // Shotgun
            ctx.fillRect(8, -6, 16, 12);
            ctx.fillStyle = custom.visorColor;
            ctx.fillRect(20, -7, 6, 14);
          }
          ctx.restore();

          // Class-specific body
          if (custom.characterClass === 'phantom') {
            // Hooded cloak
            ctx.fillStyle = custom.primaryColor;
            ctx.beginPath();
            ctx.arc(-4, 0, 24, -Math.PI * 0.7, Math.PI * 0.7);
            ctx.lineTo(-20, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();
          } else if (custom.characterClass === 'tanker') {
            // Heavy armor pauldrons
            ctx.fillStyle = '#334155';
            ctx.fillRect(-18, -20, 14, 10);
            ctx.fillRect(-18, 10, 14, 10);

            ctx.fillStyle = custom.primaryColor;
            ctx.beginPath();
            ctx.roundRect(-16, -16, 32, 32, 6);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          } else if (custom.characterClass === 'ninja') {
            // Katana scabbard
            ctx.fillStyle = custom.visorColor;
            ctx.save();
            ctx.rotate(-Math.PI / 4);
            ctx.fillRect(-28, -2.5, 30, 4);
            ctx.restore();

            ctx.fillStyle = custom.primaryColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (custom.characterClass === 'commando') {
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = custom.primaryColor;
            ctx.fillRect(-10, -14, 20, 28);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-10, -14, 20, 28);
          } else {
            // Mecha Android
            ctx.fillStyle = custom.primaryColor;
            ctx.beginPath();
            ctx.arc(0, 0, 19, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-14, -22, 3, 8);
            ctx.fillRect(-14, 14, 3, 8);
          }

          // Visor Glow
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = custom.visorColor;
          ctx.fillStyle = custom.visorColor;
          ctx.beginPath();
          ctx.arc(6, 0, 6.5, -Math.PI / 2, Math.PI / 2);
          ctx.fill();
          ctx.restore();

          // Accessories
          if (custom.accessory === 'crown') {
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('👑', -2, -14);
          } else if (custom.accessory === 'halo') {
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, 24, 24, 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (custom.accessory === 'horns') {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(-8, -14);
            ctx.lineTo(-4, -24);
            ctx.lineTo(-1, -14);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-8, 14);
            ctx.lineTo(-4, 24);
            ctx.lineTo(-1, 14);
            ctx.fill();
          } else if (custom.accessory === 'cyber_goggles') {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(4, -6, 6, 12);
          }

          ctx.restore(); // restore character rotation

          // Health Bar & Visible Player Nameplate
          const barW = 54;
          const barH = 6;
          const barX = p.x - barW / 2;
          const barY = p.y - 32;

          // Health bar background & border
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);

          // Health bar fill
          ctx.fillStyle = p.team === 'blue' ? '#06b6d4' : '#f43f5e';
          ctx.fillRect(barX, barY, Math.max(0, (p.hp / p.maxHp) * barW), barH);

          // Highly Visible Player Name Badge (High Contrast & Polished)
          const isLocal = isLocalPlayer(p.id);
          const displayName = isLocal ? `⭐ ${p.name} (Kamu)` : p.name;
          ctx.font = isLocal ? 'bold 11px "Plus Jakarta Sans", sans-serif' : 'bold 10.5px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';

          const nameMetrics = ctx.measureText(displayName);
          const badgeW = nameMetrics.width + 12;
          const badgeH = 17;
          const badgeX = p.x - badgeW / 2;
          const badgeY = barY - badgeH - 3;

          // Dark solid pill background for crystal-clear readability
          ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
          } else {
            ctx.rect(badgeX, badgeY, badgeW, badgeH);
          }
          ctx.fill();

          // Border for badge
          ctx.strokeStyle = isLocal
            ? '#38bdf8'
            : p.team === 'blue'
            ? 'rgba(56, 189, 248, 0.8)'
            : 'rgba(251, 113, 133, 0.8)';
          ctx.lineWidth = isLocal ? 1.5 : 1;
          ctx.stroke();

          // Text with contrast shadow
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = isLocal ? '#38bdf8' : p.team === 'blue' ? '#e0f2fe' : '#ffe4e6';
          ctx.fillText(displayName, p.x, badgeY + 12);
          ctx.restore();

          ctx.restore();
        });

        // J. Floating Damage Numbers
        for (let d = sim.damageTexts.length - 1; d >= 0; d--) {
          const dtItem = sim.damageTexts[d];
          dtItem.y -= 1.3;
          dtItem.alpha -= 0.02;

          if (dtItem.alpha <= 0) {
            sim.damageTexts.splice(d, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, dtItem.alpha);
          ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = dtItem.color;
          ctx.textAlign = 'center';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#000000';
          ctx.fillText(dtItem.text, dtItem.x, dtItem.y);
          ctx.restore();
        }

        ctx.restore(); // Restore camera translation
      }

      // Tactical Minimap 60 FPS Radar Pass (Top-Left)
      if (minimapCanvasRef.current) {
        const mCanvas = minimapCanvasRef.current;
        const mCtx = mCanvas.getContext('2d');
        if (mCtx) {
          const mw = mCanvas.width;
          const mh = mCanvas.height;

          // Clear minimap background
          mCtx.fillStyle = '#070b16';
          mCtx.fillRect(0, 0, mw, mh);

          // Subtle tactical grid
          mCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
          mCtx.lineWidth = 1;
          for (let gx = mw / 4; gx < mw; gx += mw / 4) {
            mCtx.beginPath();
            mCtx.moveTo(gx, 0);
            mCtx.lineTo(gx, mh);
            mCtx.stroke();
          }
          for (let gy = mh / 3; gy < mh; gy += mh / 3) {
            mCtx.beginPath();
            mCtx.moveTo(0, gy);
            mCtx.lineTo(mw, gy);
            mCtx.stroke();
          }

          // Base zones
          // Blue Base (Left)
          const blueBaseW = (320 / WORLD_WIDTH) * mw;
          mCtx.fillStyle = 'rgba(6, 182, 212, 0.22)';
          mCtx.fillRect(0, 0, blueBaseW, mh);
          mCtx.fillStyle = 'rgba(6, 182, 212, 0.9)';
          mCtx.font = 'bold 7px "Plus Jakarta Sans", sans-serif';
          mCtx.textAlign = 'left';
          mCtx.fillText('BIRU', 3, mh - 3);

          // Red Base (Right)
          const redBaseW = (320 / WORLD_WIDTH) * mw;
          mCtx.fillStyle = 'rgba(244, 63, 94, 0.22)';
          mCtx.fillRect(mw - redBaseW, 0, redBaseW, mh);
          mCtx.fillStyle = 'rgba(244, 63, 94, 0.9)';
          mCtx.textAlign = 'right';
          mCtx.fillText('MERAH', mw - 3, mh - 3);

          // Obstacles & Shelves
          mCtx.fillStyle = 'rgba(71, 85, 105, 0.5)';
          for (const obs of themeConfig.obstacles) {
            const ox = (obs.x / WORLD_WIDTH) * mw;
            const oy = (obs.y / WORLD_HEIGHT) * mh;
            const ow = (obs.w / WORLD_WIDTH) * mw;
            const oh = (obs.h / WORLD_HEIGHT) * mh;
            mCtx.fillRect(ox, oy, Math.max(2, ow), Math.max(2, oh));
          }

          // Camera Viewport Rectangle on Minimap
          if (canvas) {
            const camX = (sim.cameraX / WORLD_WIDTH) * mw;
            const camY = (sim.cameraY / WORLD_HEIGHT) * mh;
            const camW = (canvas.width / WORLD_WIDTH) * mw;
            const camH = (canvas.height / WORLD_HEIGHT) * mh;
            mCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            mCtx.lineWidth = 1;
            mCtx.strokeRect(camX, camY, camW, camH);
          }

          // Boss Dot & Label
          if (sim.boss && sim.boss.hp > 0) {
            const bx = (sim.boss.x / WORLD_WIDTH) * mw;
            const by = (sim.boss.y / WORLD_HEIGHT) * mh;
            mCtx.fillStyle = '#f59e0b';
            mCtx.beginPath();
            mCtx.arc(bx, by, 3.5, 0, Math.PI * 2);
            mCtx.fill();
            mCtx.fillStyle = '#fbbf24';
            mCtx.font = 'bold 7px "Plus Jakarta Sans", sans-serif';
            mCtx.textAlign = 'center';
            mCtx.fillText('BOSS', bx, Math.max(7, by - 5));
          }

          // Real-time Players with Names on Minimap Radar
          for (const p of sim.players) {
            if (p.isRespawning) continue;
            const px = (p.x / WORLD_WIDTH) * mw;
            const py = (p.y / WORLD_HEIGHT) * mh;
            const isLocal = isLocalPlayer(p.id);

            // Draw player position dot
            mCtx.beginPath();
            mCtx.arc(px, py, isLocal ? 3.5 : 2.5, 0, Math.PI * 2);
            mCtx.fillStyle = isLocal ? '#38bdf8' : p.team === 'blue' ? '#06b6d4' : '#f43f5e';
            mCtx.fill();

            // Local player highlight ring
            if (isLocal) {
              mCtx.strokeStyle = '#ffffff';
              mCtx.lineWidth = 1.5;
              mCtx.stroke();
            }

            // Visible Player Name on Minimap!
            mCtx.font = isLocal
              ? 'bold 7.5px "Plus Jakarta Sans", sans-serif'
              : 'bold 6.5px "Plus Jakarta Sans", sans-serif';
            mCtx.textAlign = 'center';
            const shortName = p.name.length > 8 ? p.name.slice(0, 7) + '…' : p.name;
            const label = isLocal ? `${shortName} (Kamu)` : shortName;

            const textW = mCtx.measureText(label).width;
            const badgeW = textW + 5;
            const badgeH = 8.5;
            const labelX = Math.max(badgeW / 2 + 2, Math.min(mw - badgeW / 2 - 2, px));
            const labelY = py > 14 ? py - 5 : py + 11;

            // Background badge for extreme contrast
            mCtx.fillStyle = 'rgba(2, 6, 23, 0.88)';
            mCtx.fillRect(labelX - badgeW / 2, labelY - 7, badgeW, badgeH);
            mCtx.strokeStyle = isLocal ? '#38bdf8' : p.team === 'blue' ? '#06b6d4' : '#f43f5e';
            mCtx.lineWidth = 0.8;
            mCtx.strokeRect(labelX - badgeW / 2, labelY - 7, badgeW, badgeH);

            mCtx.fillStyle = isLocal ? '#ffffff' : p.team === 'blue' ? '#7dd3fc' : '#fda4af';
            mCtx.fillText(label, labelX, labelY - 0.5);
          }
        }
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [matchStatus, finishMatch]);

  return (
    <div
      ref={arenaContainerRef}
      className={`w-full flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-1 md:p-2 h-screen w-screen overflow-hidden'
          : 'max-w-6xl mx-auto space-y-3'
      }`}
    >
      {/* Top TDM Scoreboard Header (Compact on Fullscreen/Mobile for Wider Field of View) */}
      <div className={`bg-slate-950 border-2 border-slate-800 rounded-xl md:rounded-2xl ${isFullscreen ? 'p-1.5 md:p-3' : 'p-2.5 md:p-3'} text-white shadow-2xl flex items-center justify-between gap-1.5 md:gap-4 select-none shrink-0`}>
        {/* Team Blue Score */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-cyan-950 border-2 border-cyan-400 flex flex-col items-center justify-center font-black text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-cyan-400">BIRU</span>
            <span className="text-base md:text-xl leading-none font-mono-numbers">{hudBlueScore}</span>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold text-cyan-400 block">TIM CYBER BIRU</span>
            <span className="text-[11px] text-slate-400">
              Kills: {hudBlueScore}
            </span>
          </div>
        </div>

        {/* Center: Match Timer, Active Skill, Customizer Button */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs font-extrabold tracking-wider uppercase text-amber-400">
            <Swords className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
            <span className="truncate max-w-[130px] md:max-w-none">
              TDM · {MAP_THEMES_CONFIG[selectedMapTheme].name.split('(')[0]}
            </span>
          </div>

          <div className="text-lg md:text-3xl font-black font-mono-numbers text-white tracking-tight leading-tight">
            {hudTimeLeft}s
          </div>

          {/* Active Skill or Room Code */}
          {hudActiveSkill ? (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/80 px-2 py-0.5 rounded-full text-[9px] md:text-[11px] font-bold text-amber-300 animate-pulse mt-0.5">
              <span>⚡ {hudActiveSkill.label}</span>
              <span className="font-mono">({hudActiveSkill.timeLeft}s)</span>
            </div>
          ) : (
            <span className="text-[8px] md:text-[10px] text-slate-400 block font-mono">
              HP: <strong className={hudMyHp < 30 ? 'text-rose-400' : 'text-emerald-400'}>{hudMyHp}%</strong> · Kills: <strong>{hudMyKills}</strong>
            </span>
          )}
        </div>

        {/* Team Red Score & Controls */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="hidden md:block text-right">
            <span className="text-xs font-bold text-rose-400 block">TIM PLASMA MERAH</span>
            <span className="text-[11px] text-slate-400">
              Kills: {hudRedScore}
            </span>
          </div>
          <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-rose-950 border-2 border-rose-500 flex flex-col items-center justify-center font-black text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-rose-400">MERAH</span>
            <span className="text-base md:text-xl leading-none font-mono-numbers">{hudRedScore}</span>
          </div>

          {/* Customizer Button in Header */}
          <button
            onClick={() => setShowCustomizerModal(true)}
            className="p-1.5 md:p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 transition-colors"
            title="Kustomisasi Karakter"
            aria-label="Kustomisasi Karakter"
          >
            <Palette className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 md:p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            title={isFullscreen ? 'Keluar Fullscreen (F)' : 'Layar Penuh / Fullscreen (F)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          {/* Leave Match Button */}
          {!inLobby && (
            <button
              onClick={handleLeaveMatch}
              className="px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl bg-rose-500/20 border border-rose-500/50 hover:bg-rose-500/30 text-rose-300 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Tinggalkan Match"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Game Battlefield Container with Canvas */}
      <div
        className={`relative w-full ${
          isFullscreen ? 'flex-1 h-0 min-h-0' : 'h-[500px] md:h-[640px]'
        } bg-[#060a12] rounded-xl md:rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl select-none touch-none`}
      >
        {/* Hardware-Accelerated 60 FPS HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          className="w-full h-full block cursor-crosshair touch-none"
        />

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

        {/* MOBILE ON-SCREEN TOUCH CONTROLS (HP FRIENDLY) */}
        {isMobileControlsEnabled && matchStatus === 'playing' && hudRespawnTimer === 0 && (
          <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-3 md:p-6 select-none">
            {/* Left: Virtual Movement Joystick */}
            <div className="pointer-events-auto flex flex-col items-center">
              <div
                onTouchStart={handleJoyTouchStart}
                onTouchMove={handleJoyTouchMove}
                onTouchEnd={handleJoyTouchEnd}
                className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-900/70 backdrop-blur-md border-2 border-slate-700 flex items-center justify-center touch-none shadow-xl active:border-cyan-400"
              >
                {/* Center crosshair mark */}
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                {/* Floating Knob */}
                <div
                  className="absolute w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center transition-transform duration-75"
                  style={{
                    transform: `translate(${joyKnobPos.x}px, ${joyKnobPos.y}px)`,
                  }}
                >
                  <Compass className="w-5 h-5 text-white/90" />
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 bg-slate-950/70 px-2 py-0.5 rounded-full border border-slate-800">
                🕹️ Gerak 360°
              </span>
            </div>

            {/* Right: Aim Touch Pad, Shoot Button & Dash */}
            <div className="pointer-events-auto flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 mb-1">
                {/* Dash / Evade Button */}
                <button
                  onClick={handleMobileDash}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-500/20 border border-emerald-400 text-emerald-300 active:scale-90 transition-transform flex items-center gap-1"
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>DASH</span>
                </button>
              </div>

              {/* Aim Touch Pad and Big Shoot Button */}
              <div className="flex items-center gap-3">
                {/* Touch Aim Wheel */}
                <div
                  onTouchMove={handleAimTouchMove}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-900/70 backdrop-blur-md border-2 border-slate-700 flex items-center justify-center touch-none text-slate-400 active:border-rose-400"
                >
                  <Crosshair className="w-6 h-6 text-slate-400" />
                </div>

                {/* Big Ergonomic FIRE Button */}
                <button
                  onTouchStart={(e) => {
                    e.preventDefault();
                    isMouseDown.current = true;
                    shootLaser(myPlayerId.current);
                  }}
                  onTouchEnd={(e) => {
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
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-500 border-4 border-white/80 shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-90 transition-transform flex flex-col items-center justify-center text-white font-black"
                >
                  <Flame className="w-6 h-6 fill-white" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">TEMBAK</span>
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Lobby Overlay */}
        {inLobby && (
          <div className="absolute inset-0 z-40 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6 text-center overflow-y-auto">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-amber-500 to-rose-600 flex items-center justify-center mb-2 md:mb-3 shadow-xl shrink-0">
              <Swords className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>

            <h2 className="text-xl md:text-3xl font-black text-white mb-1">
              Shop Shooter Arena: Team Deathmatch
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-lg mb-3 leading-relaxed">
              2 Tim saling bertarung! Main di PC atau HP dengan joystick layar sentuh. Ambil skill &amp; kustomisasi karaktermu.
            </p>

            {/* Mode Selector Tabs (Main Bareng vs Main vs Bot) */}
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full mb-3">
              <button
                onClick={() => setGameModeType('multiplayer')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 font-black text-xs md:text-sm ${
                  gameModeType === 'multiplayer'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-300 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-300" />
                  <span>Main Bareng Teman</span>
                </div>
                <span className="text-[9px] font-normal opacity-85">
                  Pakai Kode Room untuk Mabar
                </span>
              </button>

              <button
                onClick={() => setGameModeType('bot')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 font-black text-xs md:text-sm ${
                  gameModeType === 'bot'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>Main vs Bot (Solo)</span>
                </div>
                <span className="text-[9px] font-normal opacity-85">
                  Latihan Solo vs Bot AI
                </span>
              </button>
            </div>

            {/* Player Name Change Bar */}
            <div className="max-w-lg w-full mb-3 bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-left shadow-lg">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Ubah Nama Pemain Kamu:
                </span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => handlePlayerNameChange(e.target.value)}
                  placeholder="Ketik Nama Kamu..."
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                  maxLength={20}
                />
              </div>
              <span className="text-[9px] text-emerald-400 font-mono self-end pb-1.5">
                ✓ Tersimpan
              </span>
            </div>

            {/* Character Customization Quick Trigger */}
            <div className="max-w-lg w-full mb-3">
              <button
                onClick={() => setShowCustomizerModal(true)}
                className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 rounded-xl px-3 py-2 flex items-center justify-between text-left group transition-all"
              >
                <div>
                  <span className="text-[9px] uppercase text-amber-400 font-bold block flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    Karakter Avatar Kamu:
                  </span>
                  <span className="text-xs font-bold text-white capitalize">
                    {characterCustomization.characterClass} · {characterCustomization.weaponSkin.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-md group-hover:scale-105 transition-transform">
                  Ubah Kustomisasi
                </span>
              </button>
            </div>

            {/* CONDITIONAL SECTION BASED ON MODE */}
            {gameModeType === 'multiplayer' ? (
              /* MULTIPLAYER / MAIN BARENG ROOM CODE */
              <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 max-w-lg w-full mb-3 flex flex-col gap-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>LOBBY MULTIPLAYER</span>
                  </span>
                </div>

                {/* Team Selection */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5">PILIH TIM:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPlayerTeam('blue')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border ${playerTeam === 'blue' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                    >
                      Tim Biru
                    </button>
                    <button
                      onClick={() => setPlayerTeam('red')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border ${playerTeam === 'red' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                    >
                      Tim Merah
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Host Section */}
                  <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 mb-2">Host Room:</p>
                    <div className="bg-slate-900 rounded p-2 mb-2 flex items-center justify-between">
                      <span className="text-sm font-mono font-bold text-cyan-300">{currentRoomCode}</span>
                      <button onClick={handleCopyRoomCode} className="text-[10px] text-slate-400">Salin</button>
                    </div>
                    <button onClick={() => handleJoinMultiplayerRoom(currentRoomCode, true)} className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold shadow flex items-center justify-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{isJoinedRoom && isEffectiveHost ? 'Terhubung (Host)' : 'Buka Room (Host)'}</span>
                    </button>
                  </div>

                  {/* Join Section */}
                  <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 mb-2">Gabung Room:</p>
                    <input
                      type="text"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="Ketik Kode..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-cyan-300 mb-2 font-mono font-bold"
                    />
                    <button
                      onClick={() => handleJoinMultiplayerRoom(roomCodeInput, false)}
                      className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold shadow flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{isJoinedRoom && !isEffectiveHost ? 'Terhubung (Pemain)' : 'Gabung'}</span>
                    </button>
                  </div>
                </div>

                {/* Waiting Room Roster */}
                {isJoinedRoom && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>DAFTAR PEMAIN ({roomPlayersList.length}/{totalPlayersConfig})</span>
                      <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                        <span>Terhubung {isEffectiveHost ? '(Host)' : ''}</span>
                      </span>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {roomPlayersList.map((p, idx) => (
                        <div key={p.id || idx} className="flex items-center justify-between bg-slate-900 p-1.5 rounded text-[10px] border border-slate-800">
                          <span className="text-white flex items-center gap-1.5 font-bold">
                             {p.isBot ? <Bot className="w-3.5 h-3.5 text-amber-400" /> : <Users className="w-3.5 h-3.5 text-cyan-400" />}
                             {p.username} {isLocalPlayer(p.id) ? '(Kamu)' : ''}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span 
                              onClick={() => {
                                if (isLocalPlayer(p.id)) {
                                  handleSelectTeam(p.team === 'blue' ? 'red' : 'blue');
                                } else if (p.isBot && isEffectiveHost) {
                                  handleUpdateBotTeam(p.id, p.team === 'blue' ? 'red' : 'blue');
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold select-none ${(isLocalPlayer(p.id) || (p.isBot && isEffectiveHost)) ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all' : ''} ${p.team === 'blue' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'}`}
                              title={(isLocalPlayer(p.id) || (p.isBot && isEffectiveHost)) ? "Klik untuk ganti tim" : undefined}
                            >
                              Tim {p.team === 'blue' ? 'Biru' : 'Merah'} {(isLocalPlayer(p.id) || (p.isBot && isEffectiveHost)) && '(Ubah)'}
                            </span>
                            {isEffectiveHost && !isLocalPlayer(p.id) && (
                              <button
                                onClick={() => handleKickPlayer(p.id)}
                                className="bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white px-2 py-0.5 rounded text-[9px] font-bold transition-all border border-rose-500/40 flex items-center gap-1"
                                title={p.isBot ? "Keluarkan Bot" : "Keluarkan Pemain"}
                              >
                                <X className="w-2.5 h-2.5" />
                                <span>Kick</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {isEffectiveHost && (
                      <button
                        onClick={startMatch}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-all shadow flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Pertandingan</span>
                      </button>
                    )}
                    {roomPlayersList.length < totalPlayersConfig && isEffectiveHost && (
                      <button
                        onClick={handleAddBot}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded transition-all shadow flex items-center justify-center gap-1.5"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Tambah Bot</span>
                      </button>
                    )}
                    {isEffectiveHost ? (
                      <button
                        onClick={handleDeleteRoom}
                        className="w-full py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Room (Host)</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleLeaveRoom}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Tinggalkan Room</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* BOT PRACTICE / MAIN VS BOT */
              <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 max-w-lg w-full mb-3 flex flex-col gap-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>LOBBY SOLO (VS BOT)</span>
                  </span>
                </div>

                {/* Team Selection */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5">PILIH TIM:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPlayerTeam('blue')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border ${playerTeam === 'blue' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                    >
                      Tim Biru
                    </button>
                    <button
                      onClick={() => setPlayerTeam('red')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border ${playerTeam === 'red' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                    >
                      Tim Merah
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Pilih Total Pemain:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[2, 4, 6, 8].map((count) => (
                      <button
                        key={count}
                        onClick={() => setTotalPlayersConfig(count as 2 | 4 | 6 | 8)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border ${
                          totalPlayersConfig === count
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>


            )}

            {/* Map Selector (4 Futuristic Shopping-Inspired Arenas) */}
            <div className="mb-3 max-w-lg w-full text-left">
              <span className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Pilih Arena Mall Futuristik:</span>
                <span className="text-[10px] text-amber-400 font-normal">Identitas Tema Belanja</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Shopping Mall */}
                <button
                  onClick={() => setSelectedMapTheme('mall')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedMapTheme === 'mall'
                      ? 'border-cyan-400 bg-cyan-950/70 shadow-md ring-1 ring-cyan-400'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs mb-0.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Shopping Mall</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block line-clamp-1">
                    Pusat Elektronik &amp; Etalase PC
                  </span>
                </button>

                {/* 2. Neon Rooftop */}
                <button
                  onClick={() => setSelectedMapTheme('rooftop')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedMapTheme === 'rooftop'
                      ? 'border-rose-400 bg-rose-950/70 shadow-md ring-1 ring-rose-400'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Neon Rooftop</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block line-clamp-1">
                    Atap Mall &amp; Helipad Cepat
                  </span>
                </button>

                {/* 3. Tech Warehouse */}
                <button
                  onClick={() => setSelectedMapTheme('warehouse')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedMapTheme === 'warehouse'
                      ? 'border-amber-400 bg-amber-950/70 shadow-md ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-0.5">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Tech Warehouse</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block line-clamp-1">
                    Gudang Logistik &amp; Taktis Tim
                  </span>
                </button>

                {/* 4. Sky Garden */}
                <button
                  onClick={() => setSelectedMapTheme('garden')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedMapTheme === 'garden'
                      ? 'border-emerald-400 bg-emerald-950/70 shadow-md ring-1 ring-emerald-400'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-0.5">
                    <Flower2 className="w-3.5 h-3.5" />
                    <span>Sky Garden</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block line-clamp-1">
                    Taman Atrium &amp; Jalur Melingkar
                  </span>
                </button>
              </div>
            </div>

            {/* Launch Match Button (Only for Solo / Bot Mode) */}
            {gameModeType === 'bot' && (
              <button
                onClick={startMatch}
                className="py-3 px-8 text-white font-black rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 max-w-lg w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-500/25 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Pertandingan vs Bot ({totalPlayersConfig} Pemain)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Match Ended Victory Screen */}
      {matchStatus === 'ended' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
              <Trophy className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-1">
              {hudBlueScore === hudRedScore
                ? 'Hasil Pertandingan: SERI (DRAW)!'
                : (hudBlueScore > hudRedScore && playerTeam === 'blue') || (hudRedScore > hudBlueScore && playerTeam === 'red')
                ? '🏆 TIM KAMU MENANG! VICTORY!'
                : 'Pertandingan Berakhir! DEFEAT!'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Skor Akhir: Tim Biru <strong>{hudBlueScore}</strong> vs Tim Merah <strong>{hudRedScore}</strong>
            </p>

            {/* Reward Breakdown Box */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-amber-200">
                <span>Hadiah Tim Juara:</span>
                <span className="font-bold text-amber-800">
                  {(hudBlueScore >= hudRedScore && playerTeam === 'blue') || (hudRedScore >= hudBlueScore && playerTeam === 'red')
                    ? 'Kupon Diskon 90% (Maks Rp 750.000)'
                    : 'Voucher Diskon 40% (Maks Rp 250.000)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">Total Kill Kamu:</span>
                <span className="font-extrabold text-slate-900 font-mono-numbers">
                  {hudMyKills} Kill
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">Poin Belanja Ditambahkan:</span>
                <span className="font-extrabold text-emerald-600 font-mono-numbers text-base">
                  +{(playerTeam === 'blue' && hudBlueScore >= hudRedScore) || (playerTeam === 'red' && hudRedScore >= hudBlueScore) ? 500 : 150} Poin
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={onNavigateToCart}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Gunakan Hadiah Diskon di Keranjang Belanja
              </button>

              <button
                onClick={() => {
                  setMatchStatus('lobby');
                  setInLobby(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Tanding Ulang TDM (Rematch)
              </button>

              <button
                onClick={onNavigateToLeaderboard}
                className="w-full py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cek Papan Peringkat Mingguan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Customization Modal */}
      {showCustomizerModal && (
        <CharacterCustomizerModal
          customization={characterCustomization}
          onChange={handleCustomizationChange}
          onClose={() => setShowCustomizerModal(false)}
        />
      )}
    </div>
  );
};
