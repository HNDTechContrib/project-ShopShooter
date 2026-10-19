/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Product, 
  CartItem, 
  PowerUpItem, 
  PowerUpType, 
  LeaderboardEntry, 
  FloatingNotification 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_POWER_UPS, 
  INITIAL_LEADERBOARD, 
  POINT_TO_RUPIAH_RATIO, 
  formatRupiah 
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { ProductCatalog } from './components/ProductCatalog';
import { ShooterArena } from './components/ShooterArena';
import { MultiplayerArena } from './components/MultiplayerArena';
import { LeaderboardView } from './components/LeaderboardView';
import { PowerUpStore } from './components/PowerUpStore';
import { CartCheckoutView } from './components/CartCheckoutView';
import { SpecialTargetNotification } from './components/SpecialTargetNotification';
import { soundEngine } from './utils/audio';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'catalog' | 'multiplayer' | 'shooter' | 'leaderboard' | 'powerups' | 'cart'>('multiplayer');

  // Products
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  // Cart: Preload with 1 item so user can immediately experiment with redemption!
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 },
  ]);

  // Points & Power-ups
  const [userDiscountPoints, setUserDiscountPoints] = useState<number>(350); // Starter bonus
  const [powerUpInventory, setPowerUpInventory] = useState<PowerUpItem[]>(INITIAL_POWER_UPS);

  // Leaderboard
  const [currentUsername, setCurrentUsername] = useState<string>('Bintang_ShooterID');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  // Notifications
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);

  // Push notification helper
  const addNotification = (
    type: 'special_target' | 'combo' | 'powerup' | 'bomb' | 'info',
    title: string,
    message: string,
    durationMs: number = 7000
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newNotif: FloatingNotification = { id, type, title, message, durationMs };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 2)]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, durationMs);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Trigger special target alert
  const handleTriggerSpecialNotification = (targetName: string, points: number) => {
    addNotification(
      'special_target',
      '🚨 TARGET SPESIAL TERDETEKSI!',
      `${targetName} muncul di arena! Nilai +${points} Poin Diskon. Butuh 3 kali tembakan tepat sebelum kabur!`,
      8000
    );
  };

  // Add discount points from game
  const handleAddDiscountPoints = (points: number) => {
    setUserDiscountPoints((prev) => prev + points);
    if (points > 0) {
      addNotification(
        'info',
        'Poin Diskon Bertambah!',
        `Kamu berhasil mengumpulkan +${points} Poin (≈ ${formatRupiah(points * POINT_TO_RUPIAH_RATIO)}). Gunakan di keranjang belanja!`
      );
    }
  };

  // Deduct points on checkout
  const handleDeductPoints = (points: number) => {
    setUserDiscountPoints((prev) => Math.max(0, prev - points));
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    addNotification(
      'info',
      'Masuk ke Keranjang',
      `${product.name} telah ditambahkan ke keranjang belanja.`
    );
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Direct challenge from product card
  const handleDirectShoot = (product: Product) => {
    setActiveTab('shooter');
    addNotification(
      'special_target',
      `Misi Target: ${product.name}`,
      `Bidik target produk ini di arena untuk raih bonus +${product.shooterBonusPoints} Poin Diskon!`,
      5000
    );
  };

  // Power-up consumption
  const handleUsePowerUpItem = (type: PowerUpType): boolean => {
    const item = powerUpInventory.find((p) => p.id === type);
    if (!item || item.count <= 0) return false;

    setPowerUpInventory((prev) =>
      prev.map((p) => (p.id === type ? { ...p, count: p.count - 1 } : p))
    );
    return true;
  };

  // Power-up purchase
  const handleBuyPowerUp = (powerUpId: string, cost: number): boolean => {
    if (userDiscountPoints < cost) return false;

    setUserDiscountPoints((prev) => prev - cost);
    setPowerUpInventory((prev) =>
      prev.map((p) => (p.id === powerUpId ? { ...p, count: p.count + 1 } : p))
    );

    addNotification(
      'powerup',
      'Power-Up Dibeli!',
      `1 unit power-up baru telah ditambahkan ke inventory arena kamu.`
    );
    return true;
  };

  // Leaderboard submit
  const handleSubmitScoreToLeaderboard = (username: string) => {
    const newEntry: LeaderboardEntry = {
      rank: 1,
      username,
      score: userDiscountPoints,
      date: 'Hari Ini',
      badge: '🎯 Shooter Aktif',
      isCurrentUser: true,
      rewardTier: userDiscountPoints > 1500 ? 'Kupon 90%' : userDiscountPoints > 1000 ? 'Kupon 70%' : 'Kupon 30%',
    };

    // Recalculate ranks
    const merged = [...leaderboard.filter((e) => !e.isCurrentUser), newEntry];
    merged.sort((a, b) => b.score - a.score);
    const updated = merged.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    setLeaderboard(updated);
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Dynamic Siren & Special Notification Toast */}
      <SpecialTargetNotification
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />

      {/* Strict Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartItemCount={totalCartCount}
        userPoints={userDiscountPoints}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 pt-6 md:pt-8">
        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            userDiscountPoints={userDiscountPoints}
            onAddToCart={handleAddToCart}
            onDirectShoot={handleDirectShoot}
            onNavigateToShooter={() => setActiveTab('multiplayer')}
          />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerArena
            userDiscountPoints={userDiscountPoints}
            onAddDiscountPoints={handleAddDiscountPoints}
            onNavigateToCart={() => setActiveTab('cart')}
            onNavigateToLeaderboard={() => setActiveTab('leaderboard')}
            onTriggerSpecialNotification={handleTriggerSpecialNotification}
          />
        )}

        {activeTab === 'shooter' && (
          <ShooterArena
            userDiscountPoints={userDiscountPoints}
            onAddDiscountPoints={handleAddDiscountPoints}
            powerUpInventory={powerUpInventory}
            onUsePowerUpItem={handleUsePowerUpItem}
            onNavigateToCart={() => setActiveTab('cart')}
            onNavigateToLeaderboard={() => setActiveTab('leaderboard')}
            onTriggerSpecialNotification={handleTriggerSpecialNotification}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            leaderboard={leaderboard}
            currentUserScore={userDiscountPoints}
            currentUsername={currentUsername}
            onUpdateUsername={setCurrentUsername}
            onSubmitScoreToLeaderboard={handleSubmitScoreToLeaderboard}
            onNavigateToShooter={() => setActiveTab('shooter')}
          />
        )}

        {activeTab === 'powerups' && (
          <PowerUpStore
            userPoints={userDiscountPoints}
            powerUpInventory={powerUpInventory}
            onBuyPowerUp={handleBuyPowerUp}
            onNavigateToShooter={() => setActiveTab('shooter')}
          />
        )}

        {activeTab === 'cart' && (
          <CartCheckoutView
            cartItems={cartItems}
            userDiscountPoints={userDiscountPoints}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onDeductPoints={handleDeductPoints}
            onNavigateToCatalog={() => setActiveTab('catalog')}
            onNavigateToShooter={() => setActiveTab('shooter')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">DiskonBlaster</span>
            <span>·</span>
            <span>Platform E-Commerce Game Shooter Interaktif</span>
          </div>

          <div className="flex items-center gap-6">
            <span>1 Poin = Rp 100 Potongan Belanja</span>
            <span>·</span>
            <span>Kompetisi Reset Mingguan Setiap Hari Minggu 23:59 WIB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
