import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShooterTarget, PowerUpType, PowerUpItem, FloatingHitText } from '../types';
import { soundEngine } from '../utils/audio';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../data/mockData';
import { ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { incrementDailyQuestProgress } from '../utils/dailyChallenge';
import { ShooterSummaryModal } from './shooter/ShooterSummaryModal';
import { ShooterHUD } from './shooter/ShooterHUD';
import { ShooterPowerUpInventory } from './shooter/ShooterPowerUpInventory';
import { ShooterCanvas } from './shooter/ShooterCanvas';
import { useShooterLoop } from '../hooks/useShooterLoop';
import { useShooterCombat } from '../hooks/useShooterCombat';

interface ShooterArenaProps {
  userDiscountPoints: number;
  onAddDiscountPoints: (points: number) => void;
  powerUpInventory: PowerUpItem[];
  onUsePowerUpItem: (id: PowerUpType) => boolean;
  onNavigateToCart?: () => void;
  onNavigateToLeaderboard?: () => void;
  onTriggerSpecialNotification?: (targetName: string, points: number) => void;
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

  const [targets, setTargets] = useState<ShooterTarget[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingHitText[]>([]);

  const [activeFreezeTime, setActiveFreezeTime] = useState<number>(0);
  const [activeMultishotTime, setActiveMultishotTime] = useState<number>(0);
  const [activeDoubleTime, setActiveDoubleTime] = useState<number>(0);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const arenaRef = useRef<HTMLDivElement>(null);
  const statsTrackerRef = useRef({ hits: 0, specialHits: 0, maxCombo: 0 });

  const toggleMute = () => {
    soundEngine.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 240);
  };

  const addFloatingText = (text: string, x: number, y: number, color: string, isCrit = false) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color, isCrit }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 850);
  };

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

  useShooterLoop({
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
  });

  const { triggerPowerUp, handleArenaClick } = useShooterCombat({
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
  });

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
  }, [isPlaying, triggerPowerUp]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <ShooterHUD
        isDark={isDark}
        roundTimeLeft={roundTimeLeft}
        isPlaying={isPlaying}
        roundScore={roundScore}
        comboCount={comboCount}
        comboMultiplier={comboMultiplier}
        isMuted={isMuted}
        isPaused={isPaused}
        onToggleMute={toggleMute}
        onStartGame={startGame}
        onTogglePause={() => setIsPaused(!isPaused)}
      />

      <ShooterCanvas
        arenaRef={arenaRef}
        isDark={isDark}
        screenShake={screenShake}
        mousePos={mousePos}
        isPlaying={isPlaying}
        isPaused={isPaused}
        activeFreezeTime={activeFreezeTime}
        activeMultishotTime={activeMultishotTime}
        activeDoubleTime={activeDoubleTime}
        targets={targets}
        floatingTexts={floatingTexts}
        onArenaClick={handleArenaClick}
        onMouseMove={handleMouseMove}
        onStartGame={startGame}
        onResumeGame={() => setIsPaused(false)}
      />

      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl p-4 md:p-6 border shadow-sm space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Persediaan Power-Up Shooter
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Gunakan tombol angka [1], [2], [3], [4] di keyboard untuk aktivasi instan saat membidik!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Total Poin Kamu:{' '}
              <strong className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{userDiscountPoints} Poin</strong> (≈{' '}
              {formatRupiah(userDiscountPoints * POINT_TO_RUPIAH_RATIO)})
            </span>
            {onNavigateToCart && (
              <button
                onClick={onNavigateToCart}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Gunakan di Keranjang
              </button>
            )}
          </div>
        </div>

        <ShooterPowerUpInventory
          powerUpInventory={powerUpInventory}
          isPlaying={isPlaying}
          isDark={isDark}
          onUsePowerUp={triggerPowerUp}
        />
      </div>

      <ShooterSummaryModal
        show={showSummaryModal}
        isDark={isDark}
        lastRoundStats={lastRoundStats}
        onNavigateToCart={onNavigateToCart}
        onRestart={startGame}
        onNavigateToLeaderboard={onNavigateToLeaderboard}
      />
    </div>
  );
};
