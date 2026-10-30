import { ShooterTarget, TargetType, PowerUpType } from '../../types';
import { INITIAL_PRODUCTS } from '../../data/mockData';

export function createRandomShooterTarget(): {
  target: ShooterTarget;
  isSpecialGold: boolean;
} {
  const rand = Math.random();
  let targetType: TargetType = 'regular';
  let name = 'Produk Flash Deal';
  let points = 25;
  let hp = 1;
  let color = '#3b82f6';
  let size = 68;
  let speedMult = 1.35;

  if (rand < 0.16) {
    targetType = 'bomb';
    name = 'Zonk! Pecah Diskon';
    points = -60;
    color = '#ef4444';
    size = 60;
    speedMult = 1.2;
  } else if (rand < 0.26) {
    targetType = 'special_gold';
    name = 'Mega Gold Voucher Robot';
    points = 250;
    hp = 3;
    color = '#f59e0b';
    size = 80;
    speedMult = 1.8;
  } else if (rand < 0.46) {
    targetType = 'speedy';
    name = 'Speedy Flash Discount';
    points = 60;
    color = '#8b5cf6';
    size = 54;
    speedMult = 2.1;
  } else if (rand < 0.56) {
    targetType = 'powerup_orb';
    const pOptions: PowerUpType[] = ['freeze', 'multishot', 'magnet', 'double_points'];
    const chosenP = pOptions[Math.floor(Math.random() * pOptions.length)];
    name = `Orb Power-Up: ${chosenP}`;
    points = 30;
    color = '#10b981';
    size = 56;
    speedMult = 1.4;
  } else {
    const sampleProd = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
    name = sampleProd.name;
    points = sampleProd.shooterBonusPoints;
  }

  const edge = Math.floor(Math.random() * 4);
  let startX = 10;
  let startY = 10;
  let vx = (Math.random() * 1.8 + 0.8) * speedMult;
  let vy = (Math.random() * 1.8 + 0.8) * speedMult;

  if (edge === 0) {
    startX = Math.random() * 70 + 15;
    startY = 5;
    vy = Math.abs(vy);
  } else if (edge === 1) {
    startX = 92;
    startY = Math.random() * 65 + 15;
    vx = -Math.abs(vx);
  } else if (edge === 2) {
    startX = Math.random() * 70 + 15;
    startY = 88;
    vy = -Math.abs(vy);
  } else {
    startX = 8;
    startY = Math.random() * 65 + 15;
    vx = Math.abs(vx);
  }

  if (Math.random() > 0.5) vx = -vx;

  const target: ShooterTarget = {
    id: `${Date.now()}-${Math.random()}`,
    type: targetType,
    name,
    points,
    x: startX,
    y: startY,
    vx,
    vy,
    size,
    color,
    createdAt: Date.now(),
    duration: targetType === 'special_gold' ? 8500 : 6000,
    hp,
    maxHp: hp,
    wobbleFreq: Math.random() * 0.05 + 0.02,
    wobbleAmp: Math.random() * 1.2 + 0.6,
    wobbleOffset: Math.random() * 10,
  };

  return {
    target,
    isSpecialGold: targetType === 'special_gold',
  };
}
