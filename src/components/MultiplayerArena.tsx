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
import { MapSelectorModal, MAP_CATALOG } from './MapSelectorModal';
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
  Keyboard,
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
  shieldTimer?: number;
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
  type?: string;
  subLabel?: string;
  accentColor?: string;
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
    name: 'Supermall Megastore',
    description: 'Pusat belanja PC gaming, smartphone & gadget berlantai marmer putih cerah dengan lorong belanja modern dan atrium luas.',
    bgColor: '#f8fafc',
    gridColor: 'rgba(2, 132, 199, 0.2)',
    particleColor: 'rgba(56, 189, 248, 0.45)',
    obstacles: [
      { x: 800, y: 220, w: 260, h: 140, label: 'STORE: CYBER PC & RIGS', type: 'store_pc', color: '#1e293b', borderColor: '#0284c7' },
      { x: 1140, y: 220, w: 260, h: 140, label: 'STORE: SMARTPHONE HUB', type: 'store_phone', color: '#1e293b', borderColor: '#0284c7' },
      { x: 800, y: 940, w: 260, h: 140, label: 'STORE: GAMING GEAR PRO', type: 'store_gear', color: '#1e293b', borderColor: '#d97706' },
      { x: 1140, y: 940, w: 260, h: 140, label: 'STORE: AUDIO & VR EXP', type: 'store_vr', color: '#1e293b', borderColor: '#e11d48' },
      { x: 480, y: 480, w: 130, h: 240, label: 'AISLE A: LAPTOP ZONE', type: 'store_aisle', color: '#1e293b', borderColor: '#2563eb' },
      { x: 1590, y: 480, w: 130, h: 240, label: 'AISLE B: SMART GADGETS', type: 'store_aisle', color: '#1e293b', borderColor: '#e11d48' },
    ],
    decorations: [
      { id: 'sc-1', type: 'showcase', x: 680, y: 240, size: 28, color: '#0284c7', secondaryColor: '#38bdf8', label: 'LAPTOP RTX 5090' },
      { id: 'sc-2', type: 'showcase', x: 1520, y: 240, size: 28, color: '#d97706', secondaryColor: '#f59e0b', label: 'RGB KEYBOARD' },
      { id: 'sc-3', type: 'showcase', x: 680, y: 1040, size: 28, color: '#e11d48', secondaryColor: '#f43f5e', label: 'VR HEADSET OMNI' },
      { id: 'sc-4', type: 'showcase', x: 1520, y: 1040, size: 28, color: '#059669', secondaryColor: '#10b981', label: 'CYBER WATCH' },
      { id: 'sc-mid-1', type: 'showcase', x: 920, y: 550, size: 24, color: '#0284c7', secondaryColor: '#e0f2fe', label: 'EXPO RIG' },
      { id: 'sc-mid-2', type: 'showcase', x: 1280, y: 550, size: 24, color: '#0284c7', secondaryColor: '#e0f2fe', label: 'EXPO MONITOR' },
      { id: 'pb-1', type: 'promo_billboard', x: 1100, y: 140, size: 45, color: '#d97706', label: '⚡ FLASH DEAL 70% ⚡' },
      { id: 'pb-2', type: 'promo_billboard', x: 1100, y: 1160, size: 45, color: '#e11d48', label: '🎁 CASHBACK 50% VOUCHER' },
      { id: 'pb-3', type: 'promo_billboard', x: 380, y: 640, size: 35, color: '#0284c7', label: 'MEGA STORE ATRIUM' },
      { id: 'pb-4', type: 'promo_billboard', x: 1820, y: 640, size: 35, color: '#e11d48', label: 'SALE DISKON 80%' },
      { id: 'esc-1', type: 'escalator', x: 920, y: 760, size: 40, color: '#0284c7', label: 'LANTAI 2 ↗' },
      { id: 'esc-2', type: 'escalator', x: 1280, y: 760, size: 40, color: '#0284c7', label: 'LANTAI 2 ↗' },
      { id: 'kiosk-1', type: 'kiosk', x: 740, y: 640, size: 22, color: '#0284c7', label: 'DIREKTORI' },
      { id: 'kiosk-2', type: 'kiosk', x: 1460, y: 640, size: 22, color: '#0284c7', label: 'DIREKTORI' },
    ],
  },
  rooftop: {
    name: 'Sky Plaza & Helipad',
    description: 'Arena rooftop modern berlantai granit dengan landasan helipad terbuka, skywalk kaca, dan lampu navigasi penerbangan.',
    bgColor: '#0f172a',
    gridColor: 'rgba(51, 65, 85, 0.6)',
    particleColor: 'rgba(244, 63, 94, 0.45)',
    obstacles: [
      { x: 920, y: 280, w: 200, h: 120, label: 'HVAC CHILLER TOWER 01', type: 'chiller_unit', color: '#1e293b', borderColor: '#f43f5e' },
      { x: 1080, y: 900, w: 200, h: 120, label: 'ENERGY GENERATOR B', type: 'generator_unit', color: '#1e293b', borderColor: '#f43f5e' },
      { x: 500, y: 450, w: 120, h: 240, label: 'SKYWALK ACCESS WEST', type: 'skywalk_portal', color: '#1e293b', borderColor: '#0284c7' },
      { x: 1580, y: 450, w: 120, h: 240, label: 'SKYWALK ACCESS EAST', type: 'skywalk_portal', color: '#1e293b', borderColor: '#7c3aed' },
      { x: 800, y: 640, w: 100, h: 100, label: 'VENTILASI DUCT A', type: 'vent_duct', color: '#1e293b', borderColor: '#e11d48' },
      { x: 1300, y: 640, w: 100, h: 100, label: 'VENTILASI DUCT B', type: 'vent_duct', color: '#1e293b', borderColor: '#e11d48' },
    ],
    decorations: [
      { id: 'heli-1', type: 'helipad', x: 1100, y: 640, size: 70, color: '#e11d48', secondaryColor: '#d97706', label: 'HELIPAD 01' },
      { id: 'ns-1', type: 'neon_sign', x: 1100, y: 130, size: 60, color: '#e11d48', label: 'SKY PLAZA ROOFTOP' },
      { id: 'ns-2', type: 'neon_sign', x: 1100, y: 1170, size: 60, color: '#0284c7', label: 'AIR TAXI STATION' },
      { id: 'ant-1', type: 'antenna_tower', x: 380, y: 240, size: 26, color: '#dc2626', label: 'MAST WEST' },
      { id: 'ant-2', type: 'antenna_tower', x: 1820, y: 240, size: 26, color: '#dc2626', label: 'MAST EAST' },
      { id: 'ant-3', type: 'antenna_tower', x: 1100, y: 420, size: 26, color: '#d97706' },
      { id: 'fan-1', type: 'chiller_fan', x: 970, y: 340, size: 20, color: '#0284c7' },
      { id: 'fan-2', type: 'chiller_fan', x: 1130, y: 960, size: 20, color: '#0284c7' },
      { id: 'sky-1', type: 'skyline_light', x: 620, y: 150, size: 80, color: '#7c3aed' },
      { id: 'sky-2', type: 'skyline_light', x: 1580, y: 150, size: 80, color: '#0284c7' },
    ],
  },
  warehouse: {
    name: 'Smart Logistics Hub',
    description: 'Gudang logistik belanja otomatis dengan lantai epoxy, rak kargo bertingkat, dan peti kemas modern.',
    bgColor: '#18181b',
    gridColor: 'rgba(217, 119, 6, 0.25)',
    particleColor: 'rgba(217, 119, 6, 0.45)',
    obstacles: [
      { x: 860, y: 240, w: 220, h: 120, label: 'RAK KARGO A1: GADGETS', type: 'cargo_rack', color: '#27272a', borderColor: '#d97706' },
      { x: 1120, y: 240, w: 220, h: 120, label: 'RAK KARGO A2: KOMPONEN', type: 'cargo_rack', color: '#27272a', borderColor: '#d97706' },
      { x: 860, y: 940, w: 220, h: 120, label: 'RAK KARGO B1: DRONE PACK', type: 'cargo_rack', color: '#27272a', borderColor: '#d97706' },
      { x: 1120, y: 940, w: 220, h: 120, label: 'RAK KARGO B2: BATTERY CELL', type: 'cargo_rack', color: '#27272a', borderColor: '#d97706' },
      { x: 500, y: 460, w: 130, h: 230, label: 'CONTAINER CARGO #03', type: 'shipping_container', color: '#0369a1', borderColor: '#0284c7' },
      { x: 1570, y: 460, w: 130, h: 230, label: 'CONTAINER CARGO #08', type: 'shipping_container', color: '#991b1b', borderColor: '#e11d48' },
    ],
    decorations: [
      { id: 'crate-1', type: 'crate_stack', x: 740, y: 240, size: 28, color: '#d97706', secondaryColor: '#fbbf24', label: 'PACK A-12' },
      { id: 'crate-2', type: 'crate_stack', x: 1460, y: 240, size: 30, color: '#d97706', secondaryColor: '#fbbf24', label: 'PACK B-09' },
      { id: 'crate-3', type: 'crate_stack', x: 740, y: 1040, size: 30, color: '#d97706', secondaryColor: '#fbbf24', label: 'EXP SHIP' },
      { id: 'crate-4', type: 'crate_stack', x: 1460, y: 1040, size: 28, color: '#d97706', secondaryColor: '#fbbf24', label: 'FRAGILE' },
      { id: 'conv-1', type: 'conveyor', x: 1100, y: 450, size: 55, color: '#d97706', label: 'CONVEYOR TRACK 01' },
      { id: 'conv-2', type: 'conveyor', x: 1100, y: 830, size: 55, color: '#d97706', label: 'CONVEYOR TRACK 02' },
      { id: 'dock-1', type: 'forklift_dock', x: 380, y: 260, size: 35, color: '#0284c7', label: 'AGV DOCK 1' },
      { id: 'dock-2', type: 'forklift_dock', x: 1820, y: 260, size: 35, color: '#e11d48', label: 'AGV DOCK 2' },
      { id: 'scan-1', type: 'barcode_scanner', x: 800, y: 640, size: 45, color: '#dc2626', label: 'SCANNER 1' },
      { id: 'scan-2', type: 'barcode_scanner', x: 1400, y: 640, size: 45, color: '#dc2626', label: 'SCANNER 2' },
    ],
  },
  garden: {
    name: 'Botanical Atrium',
    description: 'Atrium mall bernuansa botanical dengan lantai marmer, jembatan layang kaca, dan air mancur cyber lotus.',
    bgColor: '#022c22',
    gridColor: 'rgba(16, 185, 129, 0.25)',
    particleColor: 'rgba(16, 185, 129, 0.45)',
    obstacles: [
      { x: 920, y: 250, w: 220, h: 130, label: 'ORCHID BIODOME CONSERVATORY', type: 'glass_biodome', color: '#064e3b', borderColor: '#059669' },
      { x: 920, y: 910, w: 220, h: 130, label: 'HYDRO FLORA PAVILION', type: 'flora_pavilion', color: '#064e3b', borderColor: '#059669' },
      { x: 500, y: 450, w: 120, h: 240, label: 'SKYWALK CANOPY BARAT', type: 'canopy_bridge', color: '#064e3b', borderColor: '#0284c7' },
      { x: 1580, y: 450, w: 120, h: 240, label: 'SKYWALK CANOPY TIMUR', type: 'canopy_bridge', color: '#064e3b', borderColor: '#e11d48' },
      { x: 800, y: 640, w: 100, h: 100, label: 'GAZEBO HYDRO-PARK A', type: 'cedar_gazebo', color: '#064e3b', borderColor: '#10b981' },
      { x: 1300, y: 640, w: 100, h: 100, label: 'GAZEBO HYDRO-PARK B', type: 'cedar_gazebo', color: '#064e3b', borderColor: '#10b981' },
    ],
    decorations: [
      { id: 'fount-1', type: 'cyber_fountain', x: 1100, y: 640, size: 65, color: '#0284c7', secondaryColor: '#10b981', label: 'CYBER LOTUS' },
      { id: 'tree-1', type: 'biophilic_tree', x: 740, y: 240, size: 45, color: '#059669', secondaryColor: '#34d399' },
      { id: 'tree-2', type: 'biophilic_tree', x: 1460, y: 240, size: 45, color: '#059669', secondaryColor: '#34d399' },
      { id: 'tree-3', type: 'biophilic_tree', x: 740, y: 1040, size: 45, color: '#059669', secondaryColor: '#34d399' },
      { id: 'tree-4', type: 'biophilic_tree', x: 1460, y: 1040, size: 45, color: '#059669', secondaryColor: '#34d399' },
      { id: 'plant-1', type: 'planter_box', x: 1100, y: 440, size: 30, color: '#059669', secondaryColor: '#e11d48' },
      { id: 'plant-2', type: 'planter_box', x: 1100, y: 840, size: 30, color: '#059669', secondaryColor: '#7c3aed' },
      { id: 'gw-1', type: 'glass_skywalk', x: 380, y: 260, size: 40, color: '#0284c7' },
      { id: 'gw-2', type: 'glass_skywalk', x: 1820, y: 260, size: 40, color: '#0284c7' },
    ],
  },
  cavern: {
    name: 'Crystal Plaza',
    description: 'Plaza pameran mewah berlantai pualam hitam dengan pilar kristal emas, monumen granit, dan geode permata berkilau.',
    bgColor: '#09090b',
    gridColor: 'rgba(217, 119, 6, 0.25)',
    particleColor: 'rgba(217, 119, 6, 0.45)',
    obstacles: [
      { x: 950, y: 280, w: 220, h: 120, label: 'PILAR KRISTAL EMAS', type: 'crystal_pillar', color: '#18181b', borderColor: '#d97706' },
      { x: 950, y: 880, w: 220, h: 120, label: 'MONUMEN GRANIT PUTIH', type: 'granite_monolith', color: '#18181b', borderColor: '#dc2626' },
      { x: 500, y: 450, w: 120, h: 240, label: 'PAVILIUN MARMER BARAT', type: 'marble_colonnade', color: '#18181b', borderColor: '#0284c7' },
      { x: 500, y: 800, w: 120, h: 240, label: 'INSTALASI KRISTAL BIRU', type: 'geode_display', color: '#18181b', borderColor: '#0284c7' },
      { x: 1550, y: 450, w: 120, h: 240, label: 'PAVILIUN MARMER TIMUR', type: 'marble_colonnade', color: '#18181b', borderColor: '#e11d48' },
      { x: 1550, y: 800, w: 120, h: 240, label: 'INSTALASI KRISTAL MERAH', type: 'geode_display', color: '#18181b', borderColor: '#e11d48' },
    ],
    decorations: [
      { id: 'crys-1', type: 'crystal', x: 740, y: 220, size: 28, color: '#d97706', secondaryColor: '#fbbf24', rotation: 0.2 },
      { id: 'crys-2', type: 'crystal', x: 1460, y: 220, size: 28, color: '#0284c7', secondaryColor: '#38bdf8', rotation: -0.2 },
      { id: 'lava-1', type: 'lava_pool', x: 1100, y: 640, size: 65, color: '#ef4444', secondaryColor: '#f97316' },
    ],
  },
  lab: {
    name: 'Tech Innovation Lab',
    description: 'Pusat riset teknologi belanja modern dengan ubin cleanroom, jalur sirkuit data bercahaya, dan server mainframe core.',
    bgColor: '#091322',
    gridColor: 'rgba(2, 132, 199, 0.25)',
    particleColor: 'rgba(2, 132, 199, 0.45)',
    obstacles: [
      { x: 950, y: 280, w: 220, h: 110, label: 'INNOVATION CORE RIG', type: 'quantum_core', color: '#0f172a', borderColor: '#0284c7' },
      { x: 950, y: 890, w: 220, h: 110, label: 'QUANTUM DATA MAINFRAME', type: 'quantum_core', color: '#0f172a', borderColor: '#0284c7' },
      { x: 500, y: 460, w: 110, h: 230, label: 'SERVER RACK A: WEST', type: 'server_enclosure', color: '#0f172a', borderColor: '#0284c7' },
      { x: 1550, y: 460, w: 110, h: 230, label: 'SERVER RACK B: EAST', type: 'server_enclosure', color: '#0f172a', borderColor: '#e11d48' },
      { x: 800, y: 640, w: 100, h: 100, label: 'CLEANROOM AIRLOCK 01', type: 'cleanroom_portal', color: '#0f172a', borderColor: '#38bdf8' },
      { x: 1300, y: 640, w: 100, h: 100, label: 'CLEANROOM AIRLOCK 02', type: 'cleanroom_portal', color: '#0f172a', borderColor: '#38bdf8' },
    ],
    decorations: [
      { id: 'tube-1', type: 'lab_tube', x: 740, y: 240, size: 26, color: '#0284c7', secondaryColor: '#38bdf8', label: 'PROTOTYPE 01' },
      { id: 'tube-2', type: 'lab_tube', x: 1460, y: 240, size: 26, color: '#0284c7', secondaryColor: '#38bdf8', label: 'PROTOTYPE 02' },
      { id: 'tube-3', type: 'lab_tube', x: 1100, y: 640, size: 32, color: '#38bdf8', secondaryColor: '#0284c7', label: 'DATA MATRIX CORE' },
    ],
  },
  forest: {
    name: 'Eco Garden Mall',
    description: 'Plaza belanja terbuka dengan dek kayu ramah lingkungan, pohon kanopi modern, dan dinding taman vertikal asri.',
    bgColor: '#142018',
    gridColor: 'rgba(5, 150, 105, 0.25)',
    particleColor: 'rgba(5, 150, 105, 0.45)',
    obstacles: [
      { x: 920, y: 260, w: 220, h: 130, label: 'POHON KANOPI MODERN UTARA', type: 'solar_canopy_tree', color: '#142018', borderColor: '#059669' },
      { x: 920, y: 900, w: 220, h: 130, label: 'POHON KANOPI MODERN SELATAN', type: 'solar_canopy_tree', color: '#142018', borderColor: '#059669' },
      { x: 500, y: 450, w: 120, h: 240, label: 'TAMAN VERTICAL BARAT', type: 'vertical_garden_wall', color: '#142018', borderColor: '#0284c7' },
      { x: 1580, y: 450, w: 120, h: 240, label: 'TAMAN VERTICAL TIMUR', type: 'vertical_garden_wall', color: '#142018', borderColor: '#e11d48' },
      { x: 800, y: 640, w: 100, h: 100, label: 'PAVILIUN BAMBU A', type: 'bamboo_pavilion', color: '#142018', borderColor: '#10b981' },
      { x: 1300, y: 640, w: 100, h: 100, label: 'PAVILIUN BAMBU B', type: 'bamboo_pavilion', color: '#142018', borderColor: '#10b981' },
    ],
    decorations: [
      { id: 'mush-1', type: 'mushroom', x: 740, y: 230, size: 36, color: '#7c3aed', secondaryColor: '#c084fc' },
      { id: 'mush-2', type: 'mushroom', x: 1460, y: 230, size: 36, color: '#7c3aed', secondaryColor: '#c084fc' },
      { id: 'tree-eco-1', type: 'biophilic_tree', x: 1100, y: 640, size: 55, color: '#059669', secondaryColor: '#34d399' },
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
    p.shieldTimer = 3.0;
    p.respawnTimer = 0;

    // Base spawns: Left side (220) for Team Blue, Right side (WORLD_WIDTH - 260) for Team Red
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
  };

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
    // If in multiplayer mode, bots should NEVER be automatically spawned by initRoster!
    // In multiplayer, bots are only added deliberately by the host.
    const isMultiplayer = gameModeType === 'multiplayer';
    const totalBotsNeeded = isMultiplayer ? 0 : Math.max(1, totalPlayersConfig - 1);
    
    const allyBotsNeeded = Math.floor(totalBotsNeeded / 2);
    const enemyBotsNeeded = totalBotsNeeded - allyBotsNeeded;
    const blueNeeded = playerTeam === 'blue' ? allyBotsNeeded : enemyBotsNeeded;
    const redNeeded = playerTeam === 'red' ? allyBotsNeeded : enemyBotsNeeded;

    // Human Player with customized traits and unique ID - Correctly spawns on playerTeam base (left for blue, right for red)
    const mySpawnX = playerTeam === 'blue'
      ? 220 + Math.random() * 60
      : (WORLD_WIDTH - 260) - Math.random() * 80;
    const mySpawnY = 560 + (Math.random() - 0.5) * 160;
    const mySpawnAngle = playerTeam === 'blue' ? 0 : Math.PI;
    const myStats = getCharacterStats(characterCustomization.characterClass);
    newPlayers.push({
      id: myPlayerId.current,
      name: playerName,
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
  }, [totalPlayersConfig, playerTeam, selectedMapTheme, characterCustomization, gameModeType]);

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
        if (data.gameState === 'playing' && !matchStartedRef.current) {
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
            if (!matchStartedRef.current && data.room && data.room.players) {
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
  const startMatch = async () => {
    if (gameModeType === 'bot') {
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

      initRoster();
      setInLobby(false);
      setMatchStatus('playing');
      soundEngine.playPowerUp();
      onTriggerSpecialNotification('Mega Golden Deal Box', 300);
    } else {
      matchStartedRef.current = false;
      simState.current.currentTheme = selectedMapTheme;
      soundEngine.playPowerUp();
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
        wsRef.current.send(JSON.stringify({ type: 'start-match', mapTheme: selectedMapTheme }));
      }
    }
  };

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

  // Finish Match (Verified match completion callback)
  const finishMatch = useCallback(() => {
    matchStartedRef.current = false;
    setMatchStatus('ended');
    const myPlayer = simState.current.players.find((p) => !p.isBot);
    const blueWon = simState.current.blueScore >= simState.current.redScore;
    const myTeamWon = myPlayer?.team === 'blue' ? blueWon : !blueWon;

    const baseReward = myTeamWon ? 500 : 150;
    const killBonus = (myPlayer?.kills || 0) * 30;
    const totalAward = baseReward + killBonus;

    onAddDiscountPoints(totalAward);

    // Progress daily quests on genuine match finish
    incrementDailyQuestProgress('match', 1);
    if (myTeamWon) {
      incrementDailyQuestProgress('win', 1);
    }
    incrementDailyQuestProgress('score', totalAward);

    if (myTeamWon) {
      soundEngine.playCheckoutSuccess();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });
    }
  }, [onAddDiscountPoints]);

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

    // Drop spawn invulnerability shield immediately when shooting
    if (p.isShielded && (!p.activeSkill || p.activeSkill.type !== 'shield')) {
      p.isShielded = false;
      p.shieldTimer = 0;
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

      // 1b. Process Spawn Protection Shield Timer for ALL Players (Auto-expires reliably)
      sim.players.forEach((p) => {
        if (p.shieldTimer && p.shieldTimer > 0) {
          p.shieldTimer -= dt;
          if (p.shieldTimer <= 0) {
            p.shieldTimer = 0;
            p.isShielded = false;
          }
        } else if (!p.activeSkill || p.activeSkill.type !== 'shield') {
          p.isShielded = false;
        }
      });

      // 2. Update Match Timer and HUD
      if (hudTimerAccumulator >= 0.5) {
        hudTimerAccumulator = 0;
        sim.timeLeft -= 0.5;
        setHudTimeLeft(Math.max(0, Math.floor(sim.timeLeft)));
        setHudBlueScore(sim.blueScore);
        setHudRedScore(sim.redScore);

        const cdRemaining = Math.max(0, 3.5 - (Date.now() - lastDashTime.current) / 1000);
        setHudDashCooldown(cdRemaining > 0.05 ? cdRemaining : 0);

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

      // 4. Move Local Player (WASD/Arrows Keyboard + Mobile Virtual Joystick)
      const myP = sim.players.find((p) => isLocalPlayer(p.id));
      if (myP && !myP.isRespawning) {
        const myStats = getCharacterStats(myP.customization?.characterClass);
        const isSpeedSkill = myP.activeSkill?.type === 'speed';
        const speed = (isSpeedSkill ? 11.5 : 7.5) * myStats.speedMultiplier;

        // Keyboard axis calculation (WASD & Arrows, case-insensitive)
        const isUp = keysPressed.current['w'] || keysPressed.current['keyw'] || keysPressed.current['arrowup'];
        const isDown = keysPressed.current['s'] || keysPressed.current['keys'] || keysPressed.current['arrowdown'];
        const isLeft = keysPressed.current['a'] || keysPressed.current['keya'] || keysPressed.current['arrowleft'];
        const isRight = keysPressed.current['d'] || keysPressed.current['keyd'] || keysPressed.current['arrowright'];

        let kx = 0;
        let ky = 0;
        if (isUp) ky -= 1;
        if (isDown) ky += 1;
        if (isLeft) kx -= 1;
        if (isRight) kx += 1;

        // Diagonal normalization: magnitude is strictly 1.0 (1/√2 for both x and y)
        const kLen = Math.hypot(kx, ky);
        if (kLen > 0) {
          kx /= kLen;
          ky /= kLen;
        }

        // Mobile virtual joystick input vector (-1 to 1)
        const jx = mobileMoveVector.current.x;
        const jy = mobileMoveVector.current.y;

        // Seamless combination of keyboard + joystick (hybrid device support)
        let moveX = kx + jx;
        let moveY = ky + jy;
        const totalLen = Math.hypot(moveX, moveY);
        if (totalLen > 1.0) {
          moveX /= totalLen;
          moveY /= totalLen;
        }

        const dx = moveX * speed;
        const dy = moveY * speed;

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

                  // Spawn Shopping Explosion Particles (Receipts, Coins, Shopping Bags)
                  soundEngine.playShoppingPop();
                  for (let sp = 0; sp < 18; sp++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2 + Math.random() * 6;
                    const pTypes: ('receipt' | 'coin' | 'bag')[] = ['receipt', 'coin', 'bag'];
                    const chosenType = pTypes[Math.floor(Math.random() * pTypes.length)];
                    const pColor = chosenType === 'coin' ? '#fbbf24' : chosenType === 'bag' ? '#f43f5e' : '#f8fafc';

                    sim.shoppingParticles.push({
                      x: target.x,
                      y: target.y,
                      vx: Math.cos(angle) * speed,
                      vy: Math.sin(angle) * speed - 1.5,
                      rotation: Math.random() * Math.PI * 2,
                      vRot: (Math.random() - 0.5) * 0.15,
                      type: chosenType,
                      color: pColor,
                      alpha: 1.0,
                      scale: 0.7 + Math.random() * 0.6,
                    });
                  }

                  const shooter = sim.players.find((p) => p.id === b.shooterId);
                  if (shooter) {
                    shooter.kills += 1;
                    shooter.score += 100;
                    addKillFeed(shooter.name, target.name, b.team);

                    // Real gameplay event: local player eliminates enemy tank
                    if (isLocalPlayer(b.shooterId)) {
                      incrementDailyQuestProgress('kill', 1);
                      incrementDailyQuestProgress('score', 100);
                    }
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
              if (isLocalPlayer(b.shooterId)) {
                incrementDailyQuestProgress('score', 300);
              }
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

      // 10b. Update Shopping Explosion Particles (Receipts, Coins, Bags)
      for (let sp = sim.shoppingParticles.length - 1; sp >= 0; sp--) {
        const part = sim.shoppingParticles[sp];
        part.x += part.vx;
        part.y += part.vy;
        part.vy += 0.2; // gravity drop
        part.vx *= 0.95; // friction
        part.rotation += part.vRot;
        part.alpha -= 0.018;

        if (part.alpha <= 0) {
          sim.shoppingParticles.splice(sp, 1);
        }
      }

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

        // A0. Tactical Outer Perimeter Scenery (City skyline vista, atrium void with glass railing, warehouse logistics walls, botanical forest ridge, crystalline rock walls, cleanroom glass panels)
        renderArenaPerimeter(
          ctx,
          sim.currentTheme,
          sim.cameraX,
          sim.cameraY,
          canvas.width,
          canvas.height,
          WORLD_WIDTH,
          WORLD_HEIGHT,
          isDark
        );

        // A. Immersive Procedural Arena Floor (Marble tiles with brass dividers & compass medallion, rooftop concrete pavers & runway lights, polished warehouse epoxy & staging bays & forklift cross-hatching, botanical organic flagstone & lotus pool, cavern obsidian paving & luminescent crystal veins, cleanroom perforated tiles & data conduits, moss stone & bamboo decking)
        renderArenaFloor(
          ctx,
          sim.currentTheme,
          sim.cameraX,
          sim.cameraY,
          canvas.width,
          canvas.height,
          WORLD_WIDTH,
          WORLD_HEIGHT,
          isDark
        );

        // B. High-Tech Team Base Command Zones (Blue & Red holographic shields, spawn nodes, chevron laser boundaries)
        renderArenaBaseZones(
          ctx,
          sim.cameraX,
          sim.cameraY,
          canvas.width,
          canvas.height,
          WORLD_WIDTH,
          WORLD_HEIGHT,
          sim.currentTheme
        );

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

        // D2. Shopping Explosion Particles (Receipts, Coins, Shopping Bags)
        sim.shoppingParticles.forEach((part) => {
          ctx.save();
          ctx.globalAlpha = part.alpha;
          ctx.translate(part.x, part.y);
          ctx.rotate(part.rotation);
          ctx.scale(part.scale, part.scale);

          if (part.type === 'coin') {
            // Gold coin
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#fbbf24';
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Rp', 0, 0);
          } else if (part.type === 'bag') {
            // Shopping bag
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#f43f5e';
            ctx.fillStyle = '#e11d48';
            ctx.fillRect(-8, -6, 16, 18);
            ctx.strokeStyle = '#fda4af';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, -6, 5, Math.PI, Math.PI * 2);
            ctx.stroke();
          } else {
            // Shopping receipt paper
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffffff';
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(-6, -10, 12, 20);
            ctx.fillStyle = '#64748b';
            ctx.fillRect(-4, -6, 8, 2);
            ctx.fillRect(-4, -2, 6, 2);
            ctx.fillRect(-4, 2, 7, 2);
          }
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

        // F. Themed Obstacles (Tactile architectural structures, drop shadows, isometric rooftop HVAC chillers, warehouse pallet racks & containers, mall tech boutiques, crystal obelisks, cleanroom quantum cores)
        themeConfig.obstacles.forEach((obs) => {
          renderThemedObstacle(ctx, obs, sim.currentTheme, isDark);
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
            const isPowerupShield = p.activeSkill?.type === 'shield';
            const remaining = isPowerupShield ? (p.activeSkill?.timeLeft || 0) : (p.shieldTimer || 0);
            const fadeAlpha = remaining < 0.8 ? Math.max(0.25, remaining / 0.8) : 1;

            ctx.save();
            ctx.globalAlpha = fadeAlpha;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#facc15';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 40, 0, Math.PI * 2);
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Subtle pulsing shield dome fill
            ctx.fillStyle = 'rgba(250, 204, 21, 0.12)';
            ctx.fill();

            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#fde047';
            ctx.textAlign = 'center';
            const shieldText = isPowerupShield
              ? `SHIELD (${Math.ceil(remaining)}s)`
              : `KEBAL (${Math.ceil(remaining)}s)`;
            ctx.fillText(shieldText, p.x, p.y + 48);
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

          // Base zones on minimap
          const baseW = (320 / WORLD_WIDTH) * mw;

          // Left Base (Always Blue)
          mCtx.fillStyle = 'rgba(6, 182, 212, 0.22)';
          mCtx.fillRect(0, 0, baseW, mh);
          mCtx.fillStyle = '#06b6d4';
          mCtx.font = 'bold 7px "Plus Jakarta Sans", sans-serif';
          mCtx.textAlign = 'left';
          mCtx.fillText('BIRU', 3, mh - 3);

          // Right Base (Always Red)
          mCtx.fillStyle = 'rgba(244, 63, 94, 0.22)';
          mCtx.fillRect(mw - baseW, 0, baseW, mh);
          mCtx.fillStyle = '#f43f5e';
          mCtx.textAlign = 'right';
          mCtx.fillText('MERAH', mw - 3, mh - 3);

          // Obstacles & Shelves
          for (const obs of themeConfig.obstacles) {
            const ox = (obs.x / WORLD_WIDTH) * mw;
            const oy = (obs.y / WORLD_HEIGHT) * mh;
            const ow = (obs.w / WORLD_WIDTH) * mw;
            const oh = (obs.h / WORLD_HEIGHT) * mh;
            mCtx.fillStyle = obs.accentColor ? `${obs.accentColor}99` : (isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)');
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

            // Draw player position dot matching team color
            const teamDotColor = p.team === 'blue' ? '#06b6d4' : '#f43f5e';
            const teamBadgeBorder = p.team === 'blue' ? '#38bdf8' : '#fb7185';
            const teamTextColor = isLocal ? '#ffffff' : (p.team === 'blue' ? '#7dd3fc' : '#fda4af');

            mCtx.beginPath();
            mCtx.arc(px, py, isLocal ? 3.5 : 2.5, 0, Math.PI * 2);
            mCtx.fillStyle = teamDotColor;
            mCtx.fill();

            // Local player highlight ring (white)
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
            const name = p.name || 'Striker';
            const shortName = name.length > 8 ? name.slice(0, 7) + '…' : name;
            const label = isLocal ? `${shortName} (Kamu)` : shortName;

            const textW = mCtx.measureText(label).width;
            const badgeW = textW + 5;
            const badgeH = 8.5;
            const labelX = Math.max(badgeW / 2 + 2, Math.min(mw - badgeW / 2 - 2, px));
            const labelY = py > 14 ? py - 5 : py + 11;

            // Background badge for extreme contrast
            mCtx.fillStyle = 'rgba(2, 6, 23, 0.88)';
            mCtx.fillRect(labelX - badgeW / 2, labelY - 7, badgeW, badgeH);
            mCtx.strokeStyle = isLocal ? '#ffffff' : teamBadgeBorder;
            mCtx.lineWidth = 0.8;
            mCtx.strokeRect(labelX - badgeW / 2, labelY - 7, badgeW, badgeH);

            mCtx.fillStyle = teamTextColor;
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

          {/* Control Mode Toggle (Touch vs Keyboard/Mouse) */}
          <button
            onClick={inputDevice.toggleVirtualControls}
            className={`p-1.5 md:p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
              showVirtualControls
                ? isDark
                  ? 'bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300'
                  : 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200 text-cyan-800 shadow-xs'
                : isDark
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700 shadow-xs'
            }`}
            title={`Mode Kontrol: ${showVirtualControls ? 'Layar Sentuh (Virtual Joystick Aktif)' : 'Keyboard & Mouse (Desktop)'}. Klik untuk beralih mode.`}
            aria-label="Ganti Mode Kontrol"
          >
            {showVirtualControls ? (
              <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
            ) : (
              <Keyboard className="w-4 h-4 md:w-5 md:h-5 text-slate-300" />
            )}
            <span className="hidden xl:inline text-[10px] font-bold">
              {showVirtualControls ? 'Sentuh' : 'PC'}
            </span>
          </button>

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

      {/* Main Game Battlefield Container with Canvas */}
      <div
        className={`relative w-full ${
          isFullscreen ? 'flex-1 h-0 min-h-0' : 'h-[500px] md:h-[640px]'
        } ${isDark ? 'bg-[#060a12] border-slate-800' : 'bg-slate-100 border-slate-300'} rounded-xl md:rounded-2xl overflow-hidden border-2 shadow-2xl select-none touch-none`}
      >
        {/* Hardware-Accelerated 60 FPS HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleCanvasTouchMove}
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
          <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-3 sm:p-5 md:p-6 select-none touch-none">
            {/* Left: Virtual Movement Joystick */}
            <div className="pointer-events-auto flex flex-col items-center">
              <div
                onTouchStart={handleJoyTouchStart}
                onTouchMove={handleJoyTouchMove}
                onTouchEnd={handleJoyTouchEnd}
                onTouchCancel={handleJoyTouchEnd}
                className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 flex items-center justify-center touch-none shadow-2xl active:border-cyan-400"
              >
                {/* Center crosshair mark */}
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                {/* Floating Knob */}
                <div
                  className="absolute w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center transition-transform duration-75"
                  style={{
                    transform: `translate(${joyKnobPos.x}px, ${joyKnobPos.y}px)`,
                  }}
                >
                  <Compass className="w-5 h-5 text-white/90" />
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
                🕹️ Gerak 360°
              </span>
            </div>

            {/* Right: Aim Touch Pad, Shoot Button & Dash */}
            <div className="pointer-events-auto flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 mb-1">
                {/* Dash / Evade Button */}
                <button
                  onClick={triggerDash}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    triggerDash();
                  }}
                  disabled={hudDashCooldown > 0}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 shadow-md ${
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
              <div className="flex items-center gap-3">
                {/* Touch Aim Wheel */}
                <div
                  onTouchStart={handleAimTouchStart}
                  onTouchMove={handleAimTouchMove}
                  onTouchEnd={handleAimTouchEnd}
                  onTouchCancel={handleAimTouchEnd}
                  className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700 flex flex-col items-center justify-center touch-none text-slate-400 active:border-rose-400 shadow-xl"
                >
                  <Crosshair className="w-6 h-6 text-slate-400" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">BIDIK</span>
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
                  className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-500 border-4 border-white/80 shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-90 transition-transform flex flex-col items-center justify-center text-white font-black"
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
          <div 
            className={`absolute inset-0 z-40 flex flex-col items-center justify-center p-3 md:p-5 text-center overflow-y-auto transition-all duration-500 bg-cover bg-center ${isDark ? 'text-white' : 'text-slate-900'}`} 
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
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center mb-2 shrink-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-amber-500 to-rose-600 flex items-center justify-center mb-1.5 shadow-xl shadow-cyan-500/20 shrink-0">
                <Swords className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>

              <h2 className={`text-lg md:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                Shop Shooter Arena: Team Deathmatch
              </h2>
              <p className={`text-[11px] md:text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-md leading-relaxed`}>
                Pertempuran taktis 2 Tim! Kompatibel PC (WASD/Mouse) dan Mobile (Virtual Joystick).
              </p>
            </div>

            {/* Mode Selector Tabs (Multiplayer vs vs AI) */}
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full mb-2.5">
              <button
                onClick={() => setGameModeType('multiplayer')}
                className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 font-black text-xs md:text-sm ${
                  gameModeType === 'multiplayer'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-300 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
                    : isDark 
                      ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80' 
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-300" />
                  <span>Arena Multiplayer</span>
                </div>
                <span className="text-[9px] font-normal opacity-85">
                  Main Bareng dengan Kode Room
                </span>
              </button>

              <button
                onClick={() => setGameModeType('bot')}
                className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 font-black text-xs md:text-sm ${
                  gameModeType === 'bot'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.01]'
                    : isDark 
                      ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80' 
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>VS AI (Solo)</span>
                </div>
                <span className="text-[9px] font-normal opacity-85">
                  Latihan Cepat Lawan Komputer
                </span>
              </button>
            </div>

            {/* Profile Quick Bar: Player Name + Character Customizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full mb-2.5 text-left">
              {/* Player Name Change */}
              <div className={`${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-xl p-2.5 flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] uppercase text-cyan-500 font-bold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Nama Pemain:
                  </span>
                  <span className="text-[9px] text-emerald-500 font-mono">
                    ✓ Tersimpan
                  </span>
                </div>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => handlePlayerNameChange(e.target.value)}
                  placeholder="Ketik Nama Kamu..."
                  className={`w-full ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-cyan-400 transition-colors`}
                  maxLength={20}
                />
              </div>

              {/* Character Customization Trigger */}
              <button
                onClick={() => setShowCustomizerModal(true)}
                className={`border rounded-xl p-2.5 flex items-center justify-between group transition-all text-left ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border-amber-500/40 text-white'
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-300 text-slate-900 shadow-sm'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] uppercase text-amber-500 font-bold flex items-center gap-1 mb-0.5">
                    <Palette className="w-3 h-3" />
                    Kustomisasi Avatar:
                  </span>
                  <span className="text-xs font-bold capitalize truncate block">
                    {characterCustomization.characterClass} · {characterCustomization.weaponSkin.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                  Ubah
                </span>
              </button>
            </div>

            {/* CONDITIONAL SECTION: MULTIPLAYER vs VS AI */}
            {gameModeType === 'multiplayer' ? (
              /* MULTIPLAYER ROOM & LOBBY */
              <div className={`${isDark ? 'bg-slate-900/90 border-cyan-500/30 text-white shadow-[0_4px_25px_rgba(6,182,212,0.12)]' : 'bg-white border-cyan-400/50 text-slate-900 shadow-xl'} border rounded-2xl p-3.5 max-w-lg w-full mb-2.5 flex flex-col gap-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-500 flex items-center gap-1.5 uppercase tracking-wide">
                    <Users className="w-4 h-4" />
                    <span>LOBBY MULTIPLAYER</span>
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
                    Real-Time Room Sync
                  </span>
                </div>

                {/* Team Selection */}
                <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-xl border`}>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} block mb-1 text-left`}>PILIH TIM:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPlayerTeam('blue')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${playerTeam === 'blue' ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30' : isDark ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                    >
                      Tim Biru
                    </button>
                    <button
                      onClick={() => setPlayerTeam('red')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${playerTeam === 'red' ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30' : isDark ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                    >
                      Tim Merah
                    </button>
                  </div>
                </div>

                {/* Total Players Selection (2, 4, 6, 8 players) */}
                <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-xl border relative text-left`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>TOTAL PEMAIN:</span>
                    <span className="text-[9px] text-cyan-500 font-bold">Slot Tim Berimbang</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsSelectingPlayers(!isSelectingPlayers)}
                      className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-600' 
                          : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-sm'
                      }`}
                    >
                      <span>{totalPlayersConfig} Pemain ({totalPlayersConfig === 2 ? '1v1' : totalPlayersConfig === 4 ? '2v2' : totalPlayersConfig === 6 ? '3v3' : '4v4'})</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {isSelectingPlayers && (
                      <div className={`absolute z-50 mt-1 w-full rounded-xl p-1.5 space-y-1 shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        {[2, 4, 6, 8].map(count => (
                          <button 
                            key={count} 
                            onClick={() => { handleUpdateTotalSlots(count); setIsSelectingPlayers(false); }} 
                            className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                              isDark 
                                ? 'text-white hover:bg-slate-800' 
                                : 'text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {count} Pemain ({count === 2 ? '1v1' : count === 4 ? '2v2' : count === 6 ? '3v3' : '4v4'})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Host and Join Side-by-Side on Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {/* Host Section */}
                  <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3 flex flex-col justify-between`}>
                    <div>
                      <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Host Room Baru:</p>
                      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-inner'} border rounded-lg p-2 mb-2 flex items-center justify-between`}>
                        <span className="text-sm font-mono font-bold text-cyan-500">{currentRoomCode}</span>
                        <button onClick={handleCopyRoomCode} className={`text-[10px] font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Salin</button>
                      </div>
                    </div>
                    <button onClick={() => handleJoinMultiplayerRoom(currentRoomCode, true)} className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{isJoinedRoom && isEffectiveHost ? 'Terhubung (Host)' : 'Buka Room (Host)'}</span>
                    </button>
                  </div>

                  {/* Join Section */}
                  <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3 flex flex-col justify-between`}>
                    <div>
                      <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Gabung Room Teman:</p>
                      <input
                        type="text"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                        placeholder="Ketik Kode Room..."
                        className={`w-full ${isDark ? 'bg-slate-900 border-slate-700 text-cyan-300 placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-inner'} border rounded-lg px-2.5 py-1.5 text-xs mb-2 font-mono font-bold focus:outline-none focus:border-cyan-400`}
                      />
                    </div>
                    {isJoinedRoom && !isEffectiveHost ? (
                      <div className="flex gap-2">
                        <div className="flex-1 py-1.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Terhubung (Tamu)</span>
                        </div>
                        <button
                          onClick={handleLeaveRoom}
                          className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1 transition-all"
                          title="Tinggalkan Room"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoinMultiplayerRoom(roomCodeInput, false)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all ${
                          isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Gabung</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Waiting Room Roster */}
                {isJoinedRoom && (
                  <div className={`border rounded-xl p-3 space-y-2 text-left ${isDark ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'}`}>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                        DAFTAR PEMAIN DALAM ROOM ({roomPlayersList.length}/{totalPlayersConfig})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-mono text-[10px] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                          <span>{isEffectiveHost ? 'Host Room' : 'Tamu'}</span>
                        </span>
                        {!isEffectiveHost && (
                          <button
                            onClick={handleLeaveRoom}
                            className="bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white px-2 py-0.5 rounded text-[9px] font-bold border border-rose-500/40 flex items-center gap-1 transition-all"
                            title="Tinggalkan Room"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Tinggalkan Room</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-0.5">
                      {roomPlayersList.map((p, idx) => {
                        const isLocal = isLocalPlayer(p.id);
                        const cleanName = (p.username || p.name || (isLocal ? playerName : 'Striker')).trim();
                        return (
                          <div key={p.id || idx} className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                            <span className="flex items-center gap-1.5 font-bold truncate pr-2">
                               {p.isBot ? <Bot className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Users className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
                               <span className="truncate">{cleanName}</span> {isLocal ? <span className="text-cyan-500 text-[10px] font-normal">(Kamu)</span> : ''}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span 
                                onClick={() => {
                                  if (isLocal) {
                                    handleSelectTeam(p.team === 'blue' ? 'red' : 'blue');
                                  } else if (p.isBot && isEffectiveHost) {
                                    handleUpdateBotTeam(p.id, p.team === 'blue' ? 'red' : 'blue');
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold select-none ${(isLocal || (p.isBot && isEffectiveHost)) ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all' : ''} ${p.team === 'blue' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'}`}
                                title={(isLocal || (p.isBot && isEffectiveHost)) ? "Klik untuk ganti tim" : undefined}
                              >
                                Tim {p.team === 'blue' ? 'Biru' : 'Merah'} {(isLocal || (p.isBot && isEffectiveHost)) && '✎'}
                              </span>
                              {isEffectiveHost && !isLocal && (
                                <button
                                  onClick={() => handleKickPlayer(p.id)}
                                  className="bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white px-1.5 py-0.5 rounded text-[9px] font-bold transition-all border border-rose-500/40 flex items-center gap-1"
                                  title={p.isBot ? "Keluarkan Bot" : "Keluarkan Pemain"}
                                >
                                  <X className="w-2.5 h-2.5" />
                                  <span>Kick</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Capacity Setting in Waiting Room */}
                    {isEffectiveHost ? (
                      <div className={`pt-2 border-t space-y-1 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                        <div className={`flex items-center justify-between text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <span>Kapasitas Room:</span>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setIsSelectingPlayers(!isSelectingPlayers)}
                            className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                              isDark 
                                ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-600' 
                                : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-sm'
                            }`}
                          >
                            <span>{totalPlayersConfig} Pemain ({totalPlayersConfig === 2 ? '1v1' : totalPlayersConfig === 4 ? '2v2' : totalPlayersConfig === 6 ? '3v3' : '4v4'})</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          {isSelectingPlayers && (
                            <div className={`absolute z-50 mt-1 w-full rounded-xl p-1.5 space-y-1 shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                              {[2, 4, 6, 8].map(count => (
                                <button 
                                  key={count} 
                                  onClick={() => { handleUpdateTotalSlots(count); setIsSelectingPlayers(false); }} 
                                  className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                                    isDark 
                                      ? 'text-white hover:bg-slate-800' 
                                      : 'text-slate-800 hover:bg-slate-100'
                                  }`}
                                >
                                  {count} Pemain ({count === 2 ? '1v1' : count === 4 ? '2v2' : count === 6 ? '3v3' : '4v4'})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`pt-1.5 border-t flex items-center justify-between text-[10px] ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                        <span>Kapasitas Room:</span>
                        <span className="text-cyan-500 font-bold">{totalPlayersConfig} Pemain ({totalPlayersConfig === 2 ? '1v1' : totalPlayersConfig === 4 ? '2v2' : totalPlayersConfig === 6 ? '3v3' : '4v4'})</span>
                      </div>
                    )}

                    {/* Arena Map info row in waiting room */}
                    <div className={`pt-1.5 border-t flex items-center justify-between text-[10px] ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                      <span>Arena Pertempuran:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-500 font-bold flex items-center gap-1">
                          <Compass className="w-3 h-3" />
                          <span>{MAP_THEMES_CONFIG[selectedMapTheme].name.split('(')[0].trim()}</span>
                        </span>
                        {isEffectiveHost && (
                          <button
                            onClick={() => {
                              soundEngine.playPowerUp();
                              setShowMapSelectorModal(true);
                            }}
                            className="text-[10px] text-amber-500 hover:text-amber-400 font-bold underline ml-1"
                          >
                            (Ubah Map)
                          </button>
                        )}
                      </div>
                    </div>

                    {isEffectiveHost && (
                      <button
                        onClick={startMatch}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Pertandingan Multiplayer</span>
                      </button>
                    )}
                    {roomPlayersList.length < totalPlayersConfig && isEffectiveHost && (
                      <button
                        onClick={handleAddBot}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all shadow flex items-center justify-center gap-1.5"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Tambah Bot ke Room</span>
                      </button>
                    )}
                    {isEffectiveHost ? (
                      <button
                        onClick={handleDeleteRoom}
                        className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus / Bubarkan Room (Host)</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleLeaveRoom}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Tinggalkan Room</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* SOLO / PRACTICE VS AI (CONSISTENT DESIGN QUALITY) */
              <div className={`border rounded-2xl p-3.5 max-w-lg w-full mb-2.5 flex flex-col gap-2.5 text-left transition-all ${
                isDark 
                  ? 'bg-slate-900/90 border-amber-500/30 text-white shadow-[0_4px_25px_rgba(245,158,11,0.12)]' 
                  : 'bg-white border-amber-400/50 text-slate-900 shadow-xl'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-500 flex items-center gap-1.5 uppercase tracking-wide">
                    <Bot className="w-4 h-4" />
                    <span>LOBBY SOLO (VS AI)</span>
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    Mode Latihan Tembak & Duel
                  </span>
                </div>

                {/* Team Selection */}
                <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-xl border`}>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} block mb-1`}>PILIH TIM KAMU:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPlayerTeam('blue')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                        playerTeam === 'blue' 
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30' 
                          : isDark ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Tim Biru
                    </button>
                    <button
                      onClick={() => setPlayerTeam('red')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                        playerTeam === 'red' 
                          ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30' 
                          : isDark ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Tim Merah
                    </button>
                  </div>
                </div>

                {/* Total Players (Bot count) Selection */}
                <div className={`${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-xl p-2.5 relative`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>JUMLAH PETARUNG (KAMU + BOT):</span>
                    <span className="text-[9px] text-amber-500 font-bold">Otomatis Terisi AI</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsSelectingPlayers(!isSelectingPlayers)}
                      className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-600' 
                          : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-sm'
                      }`}
                    >
                      <span>{totalPlayersConfig} Pemain ({totalPlayersConfig === 2 ? '1v1 Duel' : totalPlayersConfig === 4 ? '2v2 TDM' : totalPlayersConfig === 6 ? '3v3 TDM' : '4v4 All-Out War'})</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {isSelectingPlayers && (
                      <div className={`absolute z-50 mt-1 w-full rounded-xl p-1.5 space-y-1 shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        {[2, 4, 6, 8].map(count => (
                          <button 
                            key={count} 
                            onClick={() => { setTotalPlayersConfig(count); setIsSelectingPlayers(false); }} 
                            className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                              isDark 
                                ? 'text-white hover:bg-slate-800' 
                                : 'text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {count} Pemain ({count === 2 ? '1v1 Duel' : count === 4 ? '2v2 TDM' : count === 6 ? '3v3 TDM' : '4v4 All-Out War'})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info Strip for Practice Mode */}
                <div className={`flex items-center gap-2 p-2 rounded-xl text-[11px] ${
                  isDark ? 'bg-amber-950/30 border border-amber-500/20 text-amber-200' : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}>
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>AI bot dilengkapi navigasi otomatis, tembakan taktis, dan pengambilan skill arena!</span>
                </div>
              </div>
            )}

            {/* Compact Active Map Banner with "Ganti Map" Modal Trigger */}
            {(() => {
              const activeMap = MAP_CATALOG.find((m) => m.id === selectedMapTheme) || MAP_CATALOG[0];
              return (
                <div className={`mb-2.5 max-w-lg w-full ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                    : 'bg-white border-slate-200 shadow-md'
                } border rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 text-left transition-all group hover:border-cyan-500/40`}>
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-16 sm:w-20 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-950 relative border border-slate-700/60 shadow-inner group-hover:border-cyan-500/50 transition-colors">
                      <img 
                        src={activeMap.image} 
                        alt={activeMap.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-1 left-1 drop-shadow">
                        {activeMap.icon}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-cyan-500 uppercase tracking-widest">
                        <Compass className="w-3 h-3 shrink-0" />
                        <span>Arena Pertempuran Aktif</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs md:text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {activeMap.name}
                        </span>
                        <span className={`hidden sm:inline text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {activeMap.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Ganti Map Button */}
                  <button
                    onClick={() => {
                      soundEngine.playPowerUp();
                      setShowMapSelectorModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all shrink-0 border border-cyan-400/30"
                    title="Buka Panel Pemilihan Map"
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span>Ganti Map</span>
                  </button>
                </div>
              );
            })()}

            {/* Launch Match Button (Only for Solo / Bot Mode) */}
            {gameModeType === 'bot' && (
              <button
                onClick={startMatch}
                className="py-3 px-6 text-white font-black rounded-xl shadow-lg transition-all text-xs md:text-sm flex items-center justify-center gap-2 max-w-lg w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-500/25 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Pertandingan vs AI ({totalPlayersConfig} Pemain)</span>
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

              {gameModeType === 'bot' ? (
                <button
                  onClick={async () => {
                    await handleLeaveMatch();
                    setTimeout(() => {
                      startMatch();
                    }, 80);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  Main Lagi Sekarang (Match Baru vs Bot)
                </button>
              ) : null}

              <button
                onClick={handleLeaveMatch}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Tinggalkan Match & Kembali ke Lobi
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
