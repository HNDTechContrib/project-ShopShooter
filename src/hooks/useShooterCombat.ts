import React from 'react';
import { ShooterTarget, PowerUpType, FloatingHitText } from '../types';
import { soundEngine } from '../utils/audio';
import { incrementDailyQuestProgress } from '../utils/dailyChallenge';

interface UseShooterCombatParams {
  isPlaying: boolean;
  isPaused: boolean;
  arenaRef: React.RefObject<HTMLDivElement | null>;
  mousePos: { x: number; y: number };
  activeMultishotTime: number;
  activeDoubleTime: number;
  comboCount: number;
  comboMultiplier: number;
  statsTrackerRef: React.MutableRefObject<{ hits: number; specialHits: number; maxCombo: number }>;
  onUsePowerUpItem: (id: PowerUpType) => boolean;
  setComboCount: React.Dispatch<React.SetStateAction<number>>;
  setComboMultiplier: React.Dispatch<React.SetStateAction<number>>;
  setRoundScore: React.Dispatch<React.SetStateAction<number>>;
  setTargets: React.Dispatch<React.SetStateAction<ShooterTarget[]>>;
  setActiveFreezeTime: React.Dispatch<React.SetStateAction<number>>;
  setActiveMultishotTime: React.Dispatch<React.SetStateAction<number>>;
  setActiveDoubleTime: React.Dispatch<React.SetStateAction<number>>;
  triggerShake: () => void;
  addFloatingText: (text: string, x: number, y: number, color: string, isCrit?: boolean) => void;
}

export function useShooterCombat({
  isPlaying,
  isPaused,
  arenaRef,
  mousePos,
  activeMultishotTime,
  activeDoubleTime,
  comboCount,
  comboMultiplier,
  statsTrackerRef,
  onUsePowerUpItem,
  setComboCount,
  setComboMultiplier,
  setRoundScore,
  setTargets,
  setActiveFreezeTime,
  setActiveMultishotTime,
  setActiveDoubleTime,
  triggerShake,
  addFloatingText,
}: UseShooterCombatParams) {
  const triggerPowerUp = (type: PowerUpType) => {
    if (!isPlaying) return;
    const success = onUsePowerUpItem(type);
    if (!success) return;

    soundEngine.playPowerUp();
    if (type === 'freeze') {
      setActiveFreezeTime(6);
      addFloatingText('❄️ MATRIX SLOW-MO!', mousePos.x, mousePos.y, '#38bdf8', true);
    } else if (type === 'multishot') {
      setActiveMultishotTime(8);
      addFloatingText('💥 CLUSTER MULTI-SHOT!', mousePos.x, mousePos.y, '#fbbf24', true);
    } else if (type === 'double_points') {
      setActiveDoubleTime(10);
      addFloatingText('⚡ 2X DOUBLE POIN!', mousePos.x, mousePos.y, '#34d399', true);
    } else if (type === 'magnet') {
      addFloatingText('🧲 MAGNET DISKON!', mousePos.x, mousePos.y, '#c084fc', true);
      soundEngine.playHit(true);

      setTargets((prevTargets) => {
        let harvestedPoints = 0;
        let hitsAdded = 0;
        const remaining: ShooterTarget[] = [];

        prevTargets.forEach((t) => {
          if (t.type !== 'bomb') {
            harvestedPoints += t.points;
            hitsAdded++;
          } else {
            remaining.push(t);
          }
        });

        if (harvestedPoints > 0) {
          const finalEarned = Math.round(harvestedPoints * comboMultiplier * (activeDoubleTime > 0 ? 2 : 1));
          setRoundScore((s) => s + finalEarned);
          statsTrackerRef.current.hits += hitsAdded;
          addFloatingText(`+${finalEarned} MAGNET POIN!`, 50, 40, '#a855f7', true);
        }
        return remaining;
      });
    }
  };

  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying || isPaused || !arenaRef.current) return;

    const rect = arenaRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const isMulti = activeMultishotTime > 0;
    if (isMulti) soundEngine.playMultiShot();
    else soundEngine.playShoot();

    const hitRadius = isMulti ? 18 : 9;
    let hitAny = false;

    setTargets((prevTargets) => {
      const remaining: ShooterTarget[] = [];

      prevTargets.forEach((target) => {
        const dx = target.x - clickX;
        const dy = target.y - clickY;
        const dist = Math.hypot(dx, dy);

        if (dist <= hitRadius) {
          hitAny = true;

          if (target.type === 'bomb') {
            soundEngine.playBomb();
            triggerShake();
            setComboCount(0);
            setComboMultiplier(1.0);
            setRoundScore((s) => Math.max(0, s + target.points));
            addFloatingText(`${target.points} ZONK BOMB!`, target.x, target.y, '#ef4444', true);
          } else {
            const newHp = target.hp - 1;

            if (newHp > 0) {
              soundEngine.playHit(false);
              addFloatingText(`HIT! (${newHp}/${target.maxHp} HP)`, target.x, target.y, '#f59e0b', false);
              remaining.push({
                ...target,
                hp: newHp,
                vx: -target.vx * 1.3,
                vy: -target.vy * 1.3,
              });
            } else {
              statsTrackerRef.current.hits += 1;
              incrementDailyQuestProgress('target_hit', 1);
              if (target.type === 'special_gold') {
                statsTrackerRef.current.specialHits += 1;
              }

              const nextCombo = comboCount + 1;
              setComboCount(nextCombo);
              if (nextCombo > statsTrackerRef.current.maxCombo) {
                statsTrackerRef.current.maxCombo = nextCombo;
              }

              const nextMultiplier = Math.min(3.5, 1.0 + Math.floor(nextCombo / 3) * 0.5);
              setComboMultiplier(nextMultiplier);

              const isDouble = activeDoubleTime > 0;
              const earned = Math.round(target.points * nextMultiplier * (isDouble ? 2 : 1));
              setRoundScore((s) => s + earned);

              soundEngine.playHit(target.type === 'special_gold');
              const critColor = target.type === 'special_gold' ? '#facc15' : '#34d399';
              addFloatingText(
                `+${earned} ${target.type === 'special_gold' ? 'ROYAL HIT!' : 'HIT!'}`,
                target.x,
                target.y,
                critColor,
                target.type === 'special_gold'
              );
            }
          }
        } else {
          remaining.push(target);
        }
      });

      return remaining;
    });

    if (!hitAny) {
      setComboCount(0);
      setComboMultiplier(1.0);
    }
  };

  return { triggerPowerUp, handleArenaClick };
}
