import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TargetType, ShooterTarget, PowerUpType, PowerUpItem, FloatingHitText } from '../types';
import { soundEngine } from '../utils/audio';
import { INITIAL_PRODUCTS, POINT_TO_RUPIAH_RATIO, formatRupiah } from '../data/mockData';
import { 
  Crosshair, 
  Flame, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Zap, 
  Award,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Play,
  Target,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { incrementDailyQuestProgress } from '../utils/dailyChallenge';

interface ShooterArenaProps {
  userDiscountPoints: number;
  onAddDiscountPoints: (points: number) => void;
  powerUpInventory: PowerUpItem[];
  onUsePowerUpItem: (id: PowerUpType) => boolean;
  onNavigateToCart: () => void;
  onNavigateToLeaderboard: () => void;
  onTriggerSpecialNotification: (targetName: string, points: number) => void;
  themeMode?: 'dark' | 'light';
}

export const ShooterArena: React.FC<ShooterArenaProps> = ({
  userDiscountPoints,
  onAddDiscountPoints,
  powerUpInventory,
  onUsePowerUpItem,
  onNavigateToCart,
  onNavigateToLeaderboard,
  onTriggerSpecialNotification,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';
  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState<number>(45);
  const [roundScore, setRoundScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1.0);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [lastRoundStats, setLastRoundStats] = useState<{
    score: number;
    hits: number;
    specialHits: number;
    maxCombo: number;
  }>({ score: 0, hits: 0, specialHits: 0, maxCombo: 0 });

  // Targets state
  const [targets, setTargets] = useState<ShooterTarget[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingHitText[]>([]);

  // Active Power-up gauges
  const [activeFreezeTime, setActiveFreezeTime] = useState<number>(0);
  const [activeMultishotTime, setActiveMultishotTime] = useState<number>(0);
  const [activeDoubleTime, setActiveDoubleTime] = useState<number>(0);

  // Crosshair laser positioning
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const arenaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const statsTrackerRef = useRef({ hits: 0, specialHits: 0, maxCombo: 0 });

  // Toggle sound mute
  const toggleMute = () => {
    soundEngine.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Trigger screen shake
  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 240);
  };

  // Add floating text
  const addFloatingText = (text: string, x: number, y: number, color: string, isCrit = false) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color, isCrit }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 850);
  };

  // Start a new shooter game
  const startGame = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setRoundTimeLeft(45);
    setRoundScore(0);
    setComboCount(0);
    setComboMultiplier(1.0);
    setTargets([]);
    setFloatingTexts([]);
    setActiveFreezeTime(0);
    setActiveMultishotTime(0);
    setActiveDoubleTime(0);
    setShowSummaryModal(false);
    statsTrackerRef.current = { hits: 0, specialHits: 0, maxCombo: 0 };
    soundEngine.playPowerUp();
  };

  // End game round
  const finishGame = useCallback(() => {
    setIsPlaying(false);
    setShowSummaryModal(true);
    setLastRoundStats({
      score: roundScore,
      hits: statsTrackerRef.current.hits,
      specialHits: statsTrackerRef.current.specialHits,
      maxCombo: statsTrackerRef.current.maxCombo,
    });
    onAddDiscountPoints(roundScore);

    // Progress daily quests on genuine shooter round completion
    incrementDailyQuestProgress('shooter', 1);
    incrementDailyQuestProgress('score', roundScore);

    if (roundScore > 400) {
      soundEngine.playCheckoutSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [roundScore, onAddDiscountPoints]);

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
  }, [isPlaying, isPaused, finishGame]);

  // Power-up active timers decrement
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const pTimer = setInterval(() => {
      setActiveFreezeTime((prev) => Math.max(0, prev - 1));
      setActiveMultishotTime((prev) => Math.max(0, prev - 1));
      setActiveDoubleTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(pTimer);
  }, [isPlaying, isPaused]);

  // Activate power-up manually
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
      // Golden magnet absorbs all non-bomb targets immediately!
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

  // Keyboard shortcut listener (1, 2, 3, 4, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === '1') triggerPowerUp('freeze');
      if (e.key === '2') triggerPowerUp('multishot');
      if (e.key === '3') triggerPowerUp('magnet');
      if (e.key === '4') triggerPowerUp('double_points');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, activeDoubleTime, comboMultiplier]);

  // Target spawner logic
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    // Spawn interval faster as time ticks down (harder difficulty)
    const baseInterval = roundTimeLeft > 25 ? 900 : roundTimeLeft > 12 ? 700 : 550;

    const spawner = setInterval(() => {
      setTargets((prev) => {
        // Cap active targets on screen
        if (prev.length >= 7) return prev;

        const rand = Math.random();
        let targetType: TargetType = 'regular';
        let name = 'Produk Flash Deal';
        let points = 25;
        let hp = 1;
        let color = '#3b82f6';
        let size = 68;
        let speedMult = 1.35; // increased base speed for snappy action

        // 15% chance bomb (zonk hazard)
        if (rand < 0.16) {
          targetType = 'bomb';
          name = 'Zonk! Pecah Diskon';
          points = -60;
          color = '#ef4444';
          size = 60;
          speedMult = 1.2;
        } 
        // 10% chance special golden robot/voucher (Boss target!)
        else if (rand < 0.26) {
          targetType = 'special_gold';
          name = 'Mega Gold Voucher Robot';
          points = 250;
          hp = 3;
          color = '#f59e0b';
          size = 80;
          speedMult = 1.8; // very fast erratic movement
        } 
        // 20% chance speedy target
        else if (rand < 0.46) {
          targetType = 'speedy';
          name = 'Speedy Flash Discount';
          points = 60;
          color = '#8b5cf6';
          size = 54;
          speedMult = 2.1; // rapid zig-zag
        } 
        // 10% chance powerup orb
        else if (rand < 0.56) {
          targetType = 'powerup_orb';
          const pOptions: PowerUpType[] = ['freeze', 'multishot', 'magnet', 'double_points'];
          const chosenP = pOptions[Math.floor(Math.random() * pOptions.length)];
          name = `Orb Power-Up: ${chosenP}`;
          points = 30;
          color = '#10b981';
          size = 56;
          speedMult = 1.4;
        } 
        // Regular target with random product association
        else {
          const sampleProd = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
          name = sampleProd.name;
          points = sampleProd.shooterBonusPoints;
        }

        // Spawn position around edges
        const edge = Math.floor(Math.random() * 4);
        let startX = 10;
        let startY = 10;
        let vx = (Math.random() * 1.8 + 0.8) * speedMult;
        let vy = (Math.random() * 1.8 + 0.8) * speedMult;

        if (edge === 0) {
          // Top
          startX = Math.random() * 70 + 15;
          startY = 5;
          vy = Math.abs(vy);
        } else if (edge === 1) {
          // Right
          startX = 92;
          startY = Math.random() * 65 + 15;
          vx = -Math.abs(vx);
        } else if (edge === 2) {
          // Bottom
          startX = Math.random() * 70 + 15;
          startY = 88;
          vy = -Math.abs(vy);
        } else {
          // Left
          startX = 8;
          startY = Math.random() * 65 + 15;
          vx = Math.abs(vx);
        }

        // Add random direction sign
        if (Math.random() > 0.5) vx = -vx;

        // If it's a special gold target, trigger sound siren & notification!
        if (targetType === 'special_gold') {
          soundEngine.playSpecialSiren();
          onTriggerSpecialNotification(name, points);
        }

        const newTarget: ShooterTarget = {
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

        return [...prev, newTarget];
      });
    }, baseInterval);

    return () => clearInterval(spawner);
  }, [isPlaying, isPaused, roundTimeLeft, onTriggerSpecialNotification]);

  // Main Target Physics & Animation Loop (erratic bouncing & sine wobble)
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
          .filter((t) => now - t.createdAt < t.duration) // Despawn expired
          .map((target) => {
            let nextX = target.x + target.vx * speedScale;
            let nextY = target.y + target.vy * speedScale;
            let nextVx = target.vx;
            let nextVy = target.vy;

            // Sinusoidal erratic wobble
            const sineShift = Math.sin((time * 0.005) + target.wobbleOffset) * target.wobbleAmp * speedScale;
            nextY += sineShift * 0.15;

            // Random sudden erratic trajectory twitch (for high difficulty)
            if (Math.random() < 0.015 && !isFrozen) {
              nextVx = (Math.random() - 0.5) * 3.2;
              nextVy = (Math.random() - 0.5) * 3.2;
            }

            // Bounce off boundaries (5% to 92% horizontal, 8% to 88% vertical)
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
  }, [isPlaying, isPaused, activeFreezeTime]);

  // Handle shooting action
  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying || isPaused || !arenaRef.current) return;

    const rect = arenaRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const isMulti = activeMultishotTime > 0;
    if (isMulti) {
      soundEngine.playMultiShot();
    } else {
      soundEngine.playShoot();
    }

    const hitRadius = isMulti ? 18 : 9; // percentage distance
    let hitAny = false;

    setTargets((prevTargets) => {
      const remaining: ShooterTarget[] = [];

      prevTargets.forEach((target) => {
        // Distance calculation
        const dx = target.x - clickX;
        const dy = target.y - clickY;
        const dist = Math.hypot(dx, dy);

        if (dist <= hitRadius) {
          hitAny = true;

          // Target Hit logic!
          if (target.type === 'bomb') {
            // Hit a bomb! Penalty!
            soundEngine.playBomb();
            triggerShake();
            setComboCount(0);
            setComboMultiplier(1.0);
            setRoundScore((s) => Math.max(0, s + target.points));
            addFloatingText(`${target.points} ZONK BOMB!`, target.x, target.y, '#ef4444', true);
            // Bomb explodes and disappears
          } else {
            // Regular / Speedy / Special Gold / Powerup
            const newHp = target.hp - 1;

            if (newHp > 0) {
              // Boss multi-hit target still alive!
              soundEngine.playHit(false);
              addFloatingText(`HIT! (${newHp}/${target.maxHp} HP)`, target.x, target.y, '#f59e0b', false);
              remaining.push({
                ...target,
                hp: newHp,
                // Quick jitter bounce when damaged
                vx: -target.vx * 1.3,
                vy: -target.vy * 1.3,
              });
            } else {
              // Destroyed completely!
              statsTrackerRef.current.hits += 1;
              incrementDailyQuestProgress('target_hit', 1);
              if (target.type === 'special_gold') {
                statsTrackerRef.current.specialHits += 1;
              }

              // Update Combo
              const nextCombo = comboCount + 1;
              setComboCount(nextCombo);
              if (nextCombo > statsTrackerRef.current.maxCombo) {
                statsTrackerRef.current.maxCombo = nextCombo;
              }

              let nextMultiplier = 1.0;
              if (nextCombo >= 10) nextMultiplier = 3.0;
              else if (nextCombo >= 6) nextMultiplier = 2.0;
              else if (nextCombo >= 3) nextMultiplier = 1.5;
              setComboMultiplier(nextMultiplier);

              const isDouble = activeDoubleTime > 0;
              const pointsEarned = Math.round(target.points * nextMultiplier * (isDouble ? 2 : 1));

              setRoundScore((s) => s + pointsEarned);
              soundEngine.playHit(true);

              const hitLabel = isDouble
                ? `+${pointsEarned} (2X BOOST!)`
                : nextMultiplier > 1
                ? `+${pointsEarned} (COMBO x${nextMultiplier})`
                : `+${pointsEarned}`;

              addFloatingText(hitLabel, target.x, target.y, target.color, true);

              // If powerup orb was shot, give instant bonus
              if (target.type === 'powerup_orb') {
                soundEngine.playPowerUp();
                setActiveDoubleTime(6);
                addFloatingText('⚡ BONUS DOUBLE POIN 6s!', target.x, target.y - 4, '#10b981', true);
              }
            }
          }
        } else {
          remaining.push(target);
        }
      });

      return remaining;
    });

    // Missed shot resets combo
    if (!hitAny) {
      setComboCount(0);
      setComboMultiplier(1.0);
    }
  };

  // Track mouse coordinates for custom laser reticle
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top HUD Bar */}
      <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-2xl p-4 md:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4`}>
        {/* Left: Round Timer & Status */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'} font-semibold`}>Sisa Waktu</span>
            <span className={`text-3xl font-extrabold font-mono-numbers ${roundTimeLeft <= 10 && isPlaying ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
              {roundTimeLeft}s
            </span>
          </div>

          <div className={`h-10 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

          <div className="flex flex-col">
            <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'} font-semibold`}>Skor Ronde Ini</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-500 font-mono-numbers">
                +{roundScore}
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                (≈ {formatRupiah(roundScore * POINT_TO_RUPIAH_RATIO)})
              </span>
            </div>
          </div>
        </div>

        {/* Center: Combo Streak Indicator */}
        <div className={`flex items-center gap-3 ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'} px-4 py-2 rounded-xl border`}>
          <Flame className={`w-5 h-5 ${comboCount > 0 ? 'text-orange-500 animate-bounce' : 'text-slate-400'}`} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} font-medium`}>Combo Streak:</span>
              <span className="font-bold text-orange-500 font-mono-numbers">{comboCount} Hits</span>
            </div>
            <span className="text-xs font-semibold text-emerald-500">
              Pengali: x{comboMultiplier.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Right: Sound & Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-emerald-500" />}
          </button>

          {!isPlaying ? (
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              Mulai Tembak!
            </button>
          ) : (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-4 py-2.5 ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'} font-medium rounded-xl border text-sm transition-colors`}
            >
              {isPaused ? 'Lanjut' : 'Jeda'}
            </button>
          )}
        </div>
      </div>

      {/* Main Shooter Game Canvas Arena */}
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        onMouseMove={handleMouseMove}
        className={`relative w-full h-[520px] md:h-[600px] ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-300'} rounded-2xl overflow-hidden border-2 select-none cursor-crosshair-custom shadow-2xl transition-transform ${
          screenShake ? 'translate-x-1.5 -translate-y-1.5' : ''
        }`}
        style={{
          backgroundImage: `
            radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(245, 158, 11, 0.08) 0%, transparent 45%),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      >
        {/* Active Power-up Gauge Badges inside Canvas */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
          {activeFreezeTime > 0 && (
            <div className="flex items-center gap-2 bg-sky-950/80 border border-sky-400/60 px-3 py-1 rounded-lg text-sky-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Matrix Slow-Mo ({activeFreezeTime}s)</span>
            </div>
          )}
          {activeMultishotTime > 0 && (
            <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-400/60 px-3 py-1 rounded-lg text-amber-300 text-xs font-semibold backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Cluster Area Blast ({activeMultishotTime}s)</span>
            </div>
          )}
          {activeDoubleTime > 0 && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-400/60 px-3 py-1 rounded-lg text-emerald-300 text-xs font-semibold backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Pengali 2X Aktif ({activeDoubleTime}s)</span>
            </div>
          )}
        </div>

        {/* Laser Sight Guide Overlay */}
        {isPlaying && !isPaused && (
          <div
            className="pointer-events-none absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/40 flex items-center justify-center transition-all duration-75"
            style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}
          >
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
            <div className="absolute w-full h-[1px] bg-amber-400/20" />
            <div className="absolute h-full w-[1px] bg-amber-400/20" />
          </div>
        )}

        {/* Welcome / Idle Screen */}
        {!isPlaying && (
          <div className={`absolute inset-0 z-30 ${isDark ? 'bg-slate-950/85 text-white' : 'bg-slate-50/95 text-slate-900'} backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center`}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-xl shadow-orange-500/20">
              <Crosshair className="w-7 h-7 text-white" />
            </div>

            <h2 className={`text-2xl md:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 tracking-tight`}>
              Arena Latihan Target
            </h2>
            <p className={`text-xs md:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-lg mb-6 leading-relaxed`}>
              Tembak target diskon yang bergerak di arena. Kumpulkan poin sebanyak mungkin untuk ditukarkan menjadi potongan belanja di keranjang.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full mb-6 text-left text-xs">
              <div className={`${isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'} border p-3 rounded-xl flex flex-col gap-1`}>
                <span className="font-bold text-sky-500 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Target Reguler</span>
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>+25 s/d +60 Poin per hit.</span>
              </div>
              <div className={`${isDark ? 'bg-slate-900/90 border-amber-500/30 text-slate-300' : 'bg-white border-amber-400/50 text-slate-700 shadow-sm'} border p-3 rounded-xl flex flex-col gap-1`}>
                <span className="font-bold text-amber-500 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Target Emas</span>
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>+250 Poin! Butuh 3x hit.</span>
              </div>
              <div className={`${isDark ? 'bg-slate-900/90 border-red-500/30 text-slate-300' : 'bg-white border-red-400/50 text-slate-700 shadow-sm'} border p-3 rounded-xl flex flex-col gap-1`}>
                <span className="font-bold text-rose-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Bom Penalti</span>
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>-60 Poin jika terkena tembak.</span>
              </div>
              <div className={`${isDark ? 'bg-slate-900/90 border-emerald-500/30 text-slate-300' : 'bg-white border-emerald-400/50 text-slate-700 shadow-sm'} border p-3 rounded-xl flex flex-col gap-1`}>
                <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Power-Up</span>
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Slow-mo, Multi-shot, & Magnet.</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mulai Bermain (45 Detik)</span>
            </button>
          </div>
        )}

        {/* Paused Screen */}
        {isPlaying && isPaused && (
          <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold text-white mb-4">Permainan Dijeda</h3>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl"
            >
              Lanjutkan Permainan
            </button>
          </div>
        )}

        {/* Dynamic Targets */}
        {isPlaying &&
          targets.map((target) => {
            const isSpecial = target.type === 'special_gold';
            const isBomb = target.type === 'bomb';
            const isPowerup = target.type === 'powerup_orb';
            const isSpeedy = target.type === 'speedy';

            return (
              <div
                key={target.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 cursor-pointer group"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: `${target.size}px`,
                  height: `${target.size}px`,
                }}
              >
                {/* Visual Target Body */}
                <div
                  className={`relative w-full h-full rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all ${
                    isSpecial
                      ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-yellow-200 animate-siren-pulse shadow-yellow-500/50'
                      : isBomb
                      ? 'bg-gradient-to-tr from-red-600 to-rose-900 border-2 border-red-400 animate-pulse shadow-red-500/40'
                      : isPowerup
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 border-2 border-emerald-300 shadow-emerald-500/40'
                      : isSpeedy
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-300 shadow-purple-500/40'
                      : 'bg-slate-800/90 border border-blue-400/50 hover:border-blue-400 shadow-blue-500/20'
                  }`}
                >
                  {/* Multi-hit health bar for Boss/Special target */}
                  {target.maxHp > 1 && (
                    <div className="absolute -top-3 w-12 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-150"
                        style={{ width: `${(target.hp / target.maxHp) * 100}%` }}
                      />
                    </div>
                  )}

                  {/* Icon / Content inside target */}
                  {isSpecial ? (
                    <div className="text-center">
                      <span className="text-2xl block animate-bounce">👑</span>
                      <span className="text-[10px] font-black text-slate-950 uppercase tracking-tighter">
                        +{target.points}
                      </span>
                    </div>
                  ) : isBomb ? (
                    <div className="text-center">
                      <span className="text-2xl block">💣</span>
                      <span className="text-[9px] font-bold text-white uppercase tracking-tighter">
                        ZONK
                      </span>
                    </div>
                  ) : isPowerup ? (
                    <div className="text-center">
                      <span className="text-xl block">⚡</span>
                      <span className="text-[9px] font-bold text-white uppercase">ORB</span>
                    </div>
                  ) : isSpeedy ? (
                    <div className="text-center">
                      <span className="text-lg block">🚀</span>
                      <span className="text-[9px] font-bold text-white uppercase">+{target.points}</span>
                    </div>
                  ) : (
                    <div className="text-center p-1">
                      <ShoppingBag className="w-5 h-5 text-blue-300 mx-auto" />
                      <span className="text-[10px] font-bold text-white block font-mono-numbers">
                        +{target.points}
                      </span>
                    </div>
                  )}

                  {/* Reticle Ring Indicator */}
                  <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-amber-400 transition-colors pointer-events-none" />
                </div>
              </div>
            );
          })}

        {/* Floating Numbers & Hit Indicators */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute pointer-events-none font-extrabold text-sm md:text-base animate-float-up z-30 drop-shadow-md select-none"
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color,
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Power-Up Inventory & Quick Action Bar */}
      <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-2xl p-4 md:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <Zap className="w-5 h-5 text-amber-500" />
              Power-Up Eksklusif Shooter
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Gunakan selama permainan untuk membidik target yang cepat dan acak. Klik tombol atau tekan hotkey [1-4].
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Total Poin Kamu:{' '}
              <strong className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{userDiscountPoints} Poin</strong> (≈{' '}
              {formatRupiah(userDiscountPoints * POINT_TO_RUPIAH_RATIO)})
            </span>
            <button
              onClick={onNavigateToCart}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Gunakan di Keranjang
            </button>
          </div>
        </div>

        {/* Power-up Item Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {powerUpInventory.map((item, idx) => {
            const hotkey = idx + 1;
            const hasStock = item.count > 0;

            return (
              <button
                key={item.id}
                disabled={!isPlaying || !hasStock}
                onClick={() => triggerPowerUp(item.id)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                  hasStock && isPlaying
                    ? isDark 
                      ? 'border-slate-700 bg-slate-950 hover:border-amber-500 text-white shadow-md' 
                      : 'border-slate-300 bg-slate-50 hover:border-amber-500 text-slate-900 shadow-sm'
                    : isDark ? 'border-slate-800 bg-slate-950/60 text-slate-600 opacity-60 cursor-not-allowed' : 'border-slate-200 bg-slate-100/60 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'} px-1.5 py-0.5 rounded font-mono font-bold`}>
                      [{hotkey}]
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        hasStock ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      x{item.count}
                    </span>
                  </div>
                </div>

                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{item.name}</span>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-tight mb-2 line-clamp-2`}>
                  {item.description}
                </p>

                <div className={`mt-auto pt-2 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} flex items-center justify-between text-[11px]`}>
                  <span>Durasi: {item.durationSeconds}s</span>
                  <span className="font-semibold text-amber-500">{hasStock ? 'Siap Pakai' : 'Habis'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Round Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl max-w-md w-full p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-200`}>
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
              Ronde Selesai!
            </h3>
            <p className={`text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
              Hasil bidikan tembakan produk diskon kamu telah tersimpan.
            </p>

            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-xl p-4 mb-6 space-y-3`}>
              <div className="flex items-center justify-between text-sm">
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Poin Berhasil Didapat:</span>
                <span className="font-extrabold text-emerald-500 font-mono-numbers text-lg">
                  +{lastRoundStats.score} Poin
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nilai Potongan Belanja:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatRupiah(lastRoundStats.score * POINT_TO_RUPIAH_RATIO)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Berhasil Ditembak:</span>
                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{lastRoundStats.hits} Target</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Spesial Tertembak:</span>
                <span className="font-semibold text-amber-500">{lastRoundStats.specialHits} Emas</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Streak Combo Tertinggi:</span>
                <span className="font-semibold text-orange-500">{lastRoundStats.maxCombo}x Hit</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={onNavigateToCart}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Tukarkan di Keranjang Belanja ({formatRupiah(lastRoundStats.score * POINT_TO_RUPIAH_RATIO)})
              </button>

              <button
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Main Lagi untuk Tambah Poin
              </button>

              <button
                onClick={onNavigateToLeaderboard}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors"
              >
                <Award className="w-4 h-4 text-amber-600" />
                Cek Posisi di Papan Peringkat Mingguan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
