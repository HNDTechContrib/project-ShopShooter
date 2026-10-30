import React, {useCallback, useRef, useState} from 'react';
import {INITIAL_POWER_UPS} from '../data/mockData';
import {PowerUpItem, PowerUpType} from '../types';
import {MultiplayerArena} from './MultiplayerArena';
import {ShooterArena} from './ShooterArena';

export interface ShopShooterOptions {
  mode?: 'shooter' | 'multiplayer';
  webSocketUrl?: string;
  initialPoints?: number;
  onPointsEarned?: (points: number) => void;
  onNavigateToCart?: () => void;
  onNavigateToLeaderboard?: () => void;
  onSpecialTarget?: (name: string, points: number) => void;
}

export default function ShopShooterGame(options: ShopShooterOptions) {
  const [points, setPoints] = useState(options.initialPoints ?? 0);
  const [powerUps, setPowerUps] = useState<PowerUpItem[]>(INITIAL_POWER_UPS);
  const powerUpsRef = useRef(powerUps);

  const addPoints = useCallback((earnedPoints: number) => {
    setPoints((current) => current + earnedPoints);
    options.onPointsEarned?.(earnedPoints);
  }, [options.onPointsEarned]);

  const usePowerUp = useCallback((type: PowerUpType) => {
    const powerUp = powerUpsRef.current.find((item) => item.id === type);
    if (!powerUp || powerUp.count <= 0) return false;

    const updatedPowerUps = powerUpsRef.current.map((item) =>
      item.id === type ? {...item, count: item.count - 1} : item
    );
    powerUpsRef.current = updatedPowerUps;
    setPowerUps(updatedPowerUps);
    return true;
  }, []);

  return (
    <div className="min-h-screen w-full">
      {options.mode === 'multiplayer' ? (
        <MultiplayerArena
          userDiscountPoints={points}
          onAddDiscountPoints={addPoints}
          onNavigateToCart={options.onNavigateToCart}
          onNavigateToLeaderboard={options.onNavigateToLeaderboard}
          onTriggerSpecialNotification={options.onSpecialTarget}
          webSocketUrl={options.webSocketUrl}
        />
      ) : (
        <ShooterArena
          userDiscountPoints={points}
          onAddDiscountPoints={addPoints}
          powerUpInventory={powerUps}
          onUsePowerUpItem={usePowerUp}
          onNavigateToCart={options.onNavigateToCart}
          onNavigateToLeaderboard={options.onNavigateToLeaderboard}
          onTriggerSpecialNotification={options.onSpecialTarget}
        />
      )}
    </div>
  );
}
