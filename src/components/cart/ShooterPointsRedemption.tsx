import React from 'react';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../../data/mockData';
import { Sparkles } from 'lucide-react';

interface ShooterPointsRedemptionProps {
  userDiscountPoints: number;
  maxRedeemablePoints: number;
  pointsToRedeem: number;
  onPointsChange: (points: number) => void;
  onNavigateToShooter: () => void;
}

export const ShooterPointsRedemption: React.FC<ShooterPointsRedemptionProps> = ({
  userDiscountPoints,
  maxRedeemablePoints,
  pointsToRedeem,
  onPointsChange,
  onNavigateToShooter,
}) => {
  const handleQuickPointSelect = (percentage: number) => {
    const calculated = Math.floor(maxRedeemablePoints * percentage);
    onPointsChange(calculated);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Tukarkan Koin Diskon Shooter Game
            </h4>
            <p className="text-xs text-slate-600">
              Kamu memiliki{' '}
              <strong className="text-slate-900 font-bold">
                {userDiscountPoints} Poin
              </strong>{' '}
              (Bisa hemat hingga {formatRupiah(maxRedeemablePoints * POINT_TO_RUPIAH_RATIO)})
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToShooter}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 underline shrink-0"
        >
          + Main Tambah Poin
        </button>
      </div>

      {/* Slider control */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Gunakan Poin:</span>
          <span className="font-extrabold text-amber-700 font-mono-numbers text-sm">
            {pointsToRedeem} Poin = Potongan{' '}
            {formatRupiah(pointsToRedeem * POINT_TO_RUPIAH_RATIO)}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={maxRedeemablePoints}
          step={10}
          value={pointsToRedeem}
          onChange={(e) => onPointsChange(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-amber-200 rounded-lg"
        />

        {/* Quick Percentage Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleQuickPointSelect(0)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-amber-300 rounded-md text-slate-700 hover:bg-amber-100"
          >
            Reset (0)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPointSelect(0.25)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-amber-300 rounded-md text-slate-700 hover:bg-amber-100"
          >
            25%
          </button>
          <button
            type="button"
            onClick={() => handleQuickPointSelect(0.5)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-amber-300 rounded-md text-slate-700 hover:bg-amber-100"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => handleQuickPointSelect(1)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500 text-slate-950 font-bold rounded-md hover:bg-amber-600 ml-auto"
          >
            Gunakan Maksimal
          </button>
        </div>
      </div>
    </div>
  );
};
