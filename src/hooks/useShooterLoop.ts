import { useEffect, useRef } from 'react';
import { ShooterTarget } from '../types';
import { soundEngine } from '../utils/audio';
import { createRandomShooterTarget } from '../game/shooter/shooterSpawner';

interface UseShooterLoopParams {
  isPlaying: boolean;
  isPaused: boolean;
  roundTimeLeft: number;
  activeFreezeTime: number;
  setRoundTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setActiveFreezeTime: React.Dispatch<React.SetStateAction<number>>;
  setActiveMultishotTime: React.Dispatch<React.SetStateAction<number>>;
  setActiveDoubleTime: React.Dispatch<React.SetStateAction<number>>;
  setTargets: React.Dispatch<React.SetStateAction<ShooterTarget[]>>;
  finishGame: () => void;
  onTriggerSpecialNotification: (targetName: string, points: number) => void;
}

export function useShooterLoop({
  isPlaying,
  isPaused,
  roundTimeLeft,
  activeFreezeTime,
  setRoundTimeLeft,
  setActiveFreezeTime,
  setActiveMultishotTime,
  setActiveDoubleTime,
  setTargets,
  finishGame,
  onTriggerSpecialNotification,
}: UseShooterLoopParams) {
  const requestRef = useRef<number | null>(null);

  // Round countdown timer
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const timer = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isPaused, finishGame, setRoundTimeLeft]);

  // Power-up active timers decrement
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const pTimer = setInterval(() => {
      setActiveFreezeTime((prev) => Math.max(0, prev - 1));
      setActiveMultishotTime((prev) => Math.max(0, prev - 1));
      setActiveDoubleTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(pTimer);
  }, [isPlaying, isPaused, setActiveFreezeTime, setActiveMultishotTime, setActiveDoubleTime]);

  // Target spawner
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const baseInterval = roundTimeLeft > 25 ? 900 : roundTimeLeft > 12 ? 700 : 550;

    const spawner = setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= 7) return prev;
        const res = createRandomShooterTarget();
        if (res.isSpecialGold) {
          soundEngine.playSpecialSiren();
          onTriggerSpecialNotification(res.target.name, res.target.points);
        }
        return [...prev, res.target];
      });
    }, baseInterval);

    return () => clearInterval(spawner);
  }, [isPlaying, isPaused, roundTimeLeft, onTriggerSpecialNotification, setTargets]);

  // Movement physics animation loop
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const isFrozen = activeFreezeTime > 0;
      const speedScale = isFrozen ? 0.32 : 1.0;

      setTargets((prevTargets) => {
        const now = Date.now();

        return prevTargets
          .filter((t) => now - t.createdAt < t.duration)
          .map((target) => {
            let nextX = target.x + target.vx * speedScale;
            let nextY = target.y + target.vy * speedScale;
            let nextVx = target.vx;
            let nextVy = target.vy;

            const sineShift = Math.sin((time * 0.005) + target.wobbleOffset) * target.wobbleAmp * speedScale;
            nextY += sineShift * 0.15;

            if (Math.random() < 0.015 && !isFrozen) {
              nextVx = (Math.random() - 0.5) * 3.2;
              nextVy = (Math.random() - 0.5) * 3.2;
            }

            if (nextX <= 6) {
              nextX = 6;
              nextVx = Math.abs(nextVx);
            } else if (nextX >= 92) {
              nextX = 92;
              nextVx = -Math.abs(nextVx);
            }

            if (nextY <= 8) {
              nextY = 8;
              nextVy = Math.abs(nextVy);
            } else if (nextY >= 88) {
              nextY = 88;
              nextVy = -Math.abs(nextVy);
            }

            return {
              ...target,
              x: nextX,
              y: nextY,
              vx: nextVx,
              vy: nextVy,
            };
          });
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isPaused, activeFreezeTime, setTargets]);
}
