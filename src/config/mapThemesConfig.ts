import { MapTheme, CollectibleSkill } from '../types';

export interface MapObstacle {
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

export interface MapDecorationItem {
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

export const MAP_THEMES_CONFIG: Record<
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

export const INITIAL_SKILLS: CollectibleSkill[] = [
  { id: 'skill-triple-1', type: 'tripleshot', x: 1100, y: 160, label: 'TRIPLE SHOT', icon: '💥', color: '#f59e0b', duration: 12, isAvailable: true, respawnCooldown: 0 },
  { id: 'skill-rapid-1', type: 'rapidfire', x: 1100, y: 1120, label: 'RAPID FIRE', icon: '⚡', color: '#38bdf8', duration: 10, isAvailable: true, respawnCooldown: 0 },
  { id: 'skill-shield-blue', type: 'shield', x: 720, y: 640, label: 'SHIELD MATRIX', icon: '🛡️', color: '#3b82f6', duration: 8, isAvailable: true, respawnCooldown: 0 },
  { id: 'skill-speed-red', type: 'speed', x: 1400, y: 640, label: 'SPEED BOOST', icon: '💨', color: '#10b981', duration: 12, isAvailable: true, respawnCooldown: 0 },
  { id: 'skill-heal-mid', type: 'heal', x: 1100, y: 640, label: 'NANITE HEAL', icon: '💚', color: '#22c55e', duration: 0, isAvailable: true, respawnCooldown: 0 },
];
