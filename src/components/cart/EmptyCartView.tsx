import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface EmptyCartViewProps {
  userDiscountPoints: number;
  onNavigateToCatalog: () => void;
  onNavigateToShooter: () => void;
}

export const EmptyCartView: React.FC<EmptyCartViewProps> = ({
  userDiscountPoints,
  onNavigateToCatalog,
  onNavigateToShooter,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center shadow-sm">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Keranjang Belanja Masih Kosong</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
        Kamu memiliki <strong>{userDiscountPoints} Poin Diskon</strong> dari game shooter yang siap digunakan untuk potongan belanja!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onNavigateToCatalog}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
        >
          Pilih Produk di Katalog
        </button>
        <button
          onClick={onNavigateToShooter}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
        >
          <Sparkles className="w-4 h-4 inline-block mr-1" />
          Tembak Target Produk di Shooter
        </button>
      </div>
    </div>
  );
};
