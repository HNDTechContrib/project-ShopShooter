import React from 'react';
import { MapTheme } from '../types';
import { 
  ShoppingBag, 
  Building2, 
  Boxes, 
  Flower2, 
  Gem,
  Cpu,
  Trees
} from 'lucide-react';

export interface MapOption {
  id: MapTheme;
  name: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  accentColor: string;
  themeGlow: string;
  tags: string[];
}

export const MAP_CATALOG: MapOption[] = [
  {
    id: 'mall',
    name: 'Supermall Megastore',
    badge: 'Atrium Elektronik',
    description: 'Pusat belanja PC gaming, smartphone & gadget berlantai marmer putih cerah dengan lorong belanja modern.',
    icon: <ShoppingBag className="w-4 h-4 text-cyan-400" />,
    image: '/src/assets/images/mall_lobby_bg_1792721153783.jpg',
    accentColor: '#06b6d4',
    themeGlow: 'rgba(6, 182, 212, 0.4)',
    tags: ['Etalase PC & Rig', 'Lorong Belanja', 'Atrium Luas'],
  },
  {
    id: 'rooftop',
    name: 'Sky Plaza & Helipad',
    badge: 'Atap Mall Cyber',
    description: 'Arena rooftop modern berlantai granit dengan landasan helipad terbuka, skywalk kaca, dan pemandangan kota neon.',
    icon: <Building2 className="w-4 h-4 text-rose-400" />,
    image: '/src/assets/images/rooftop_lobby_bg_1792721153944.jpg',
    accentColor: '#f43f5e',
    themeGlow: 'rgba(244, 63, 94, 0.4)',
    tags: ['Helipad Terbuka', 'Skywalk Kaca', 'Lampu Navigasi'],
  },
  {
    id: 'warehouse',
    name: 'Smart Logistics Hub',
    badge: 'Gudang Logistik Otomatis',
    description: 'Gudang logistik belanja otomatis dengan lantai epoxy, rak kargo bertingkat, konveyor, dan peti kemas modern.',
    icon: <Boxes className="w-4 h-4 text-amber-400" />,
    image: '/src/assets/images/warehouse_lobby_bg_1792721153666.jpg',
    accentColor: '#f59e0b',
    themeGlow: 'rgba(245, 158, 11, 0.4)',
    tags: ['Rak Kargo Bertingkat', 'Jalur Konveyor', 'Area Taktis'],
  },
  {
    id: 'garden',
    name: 'Botanical Atrium',
    badge: 'Taman Mall Futuristik',
    description: 'Atrium mall bernuansa botanical dengan kanopi arsitektur modern, kolam lotus cyber, dan vegetasi hijau lebat.',
    icon: <Flower2 className="w-4 h-4 text-emerald-400" />,
    image: '/src/assets/images/garden_lobby_bg_1792721154333.jpg',
    accentColor: '#10b981',
    themeGlow: 'rgba(16, 185, 129, 0.4)',
    tags: ['Eco Botanical', 'Jembatan Layang', 'Air Mancur Lotus'],
  },
  {
    id: 'cavern',
    name: 'Crystal Plaza',
    badge: 'Boutique Kristal Mewah',
    description: 'Plaza pameran mewah berlantai pualam hitam dengan pilar kristal emas, monumen granit, dan geode permata berkilau.',
    icon: <Gem className="w-4 h-4 text-amber-400" />,
    image: '/src/assets/images/crystal_plaza_bg_1792738602580.jpg',
    accentColor: '#f59e0b',
    themeGlow: 'rgba(245, 158, 11, 0.4)',
    tags: ['Pilar Kristal Emas', 'Paviliun Marmer', 'Monumen Granit'],
  },
  {
    id: 'lab',
    name: 'Tech Innovation Lab',
    badge: 'Pusat Riset Quantum',
    description: 'Pusat riset teknologi belanja modern dengan ubin cleanroom, jalur sirkuit data bercahaya, dan server mainframe core.',
    icon: <Cpu className="w-4 h-4 text-cyan-400" />,
    image: '/src/assets/images/tech_lab_bg_1792738603502.jpg',
    accentColor: '#0284c7',
    themeGlow: 'rgba(2, 132, 199, 0.4)',
    tags: ['Innovation Core Rig', 'Server Rack 42U', 'Sirkuit Data'],
  },
  {
    id: 'forest',
    name: 'Eco Garden Mall',
    badge: 'Plaza Hijau Terbuka',
    description: 'Plaza belanja terbuka dengan dek kayu ramah lingkungan, pohon kanopi modern, dan dinding taman vertikal asri.',
    icon: <Trees className="w-4 h-4 text-emerald-400" />,
    image: '/src/assets/images/eco_garden_mall_bg_1792738602977.jpg',
    accentColor: '#059669',
    themeGlow: 'rgba(5, 150, 105, 0.4)',
    tags: ['Pohon Kanopi Kayu', 'Taman Vertikal', 'Lantai Kayu Eko'],
  },
];
