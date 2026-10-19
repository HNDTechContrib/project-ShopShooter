import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Search, Sparkles, Crosshair, ArrowRight } from 'lucide-react';
import { formatRupiah, POINT_TO_RUPIAH_RATIO } from '../data/mockData';

interface ProductCatalogProps {
  products: Product[];
  userDiscountPoints: number;
  onAddToCart: (product: Product) => void;
  onDirectShoot: (product: Product) => void;
  onNavigateToShooter: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  userDiscountPoints,
  onAddToCart,
  onDirectShoot,
  onNavigateToShooter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['Semua', 'Gaming & Setup', 'Audio & Studio', 'Gadget & Wearables', 'Fashion & Sneakers'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-16">
      {/* Campaign Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Koleksi Unggulan &amp; Diskon Interaktif</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Belanja Cerdas. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Tembak Target &amp; Raih Diskonmu.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Mainkan arena shooter interaktif untuk mengumpulkan poin diskon. Setiap poin bisa langsung kamu potongkan di keranjang belanja hingga 50%!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onNavigateToShooter}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm"
            >
              <Crosshair className="w-4 h-4" />
              Buka Arena Shooter (+Poin Diskon)
            </button>

            <div className="bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-xl text-xs text-slate-300">
              Saldo Poin Kamu:{' '}
              <strong className="text-amber-400 font-bold">
                {userDiscountPoints} Poin
              </strong>{' '}
              (≈ {formatRupiah(userDiscountPoints * POINT_TO_RUPIAH_RATIO)})
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Functional Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1 bg-slate-100 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk impian..."
              className="w-full bg-white border border-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onDirectShoot={onDirectShoot}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-sm text-slate-500">Tidak ada produk yang sesuai dengan pencarian Anda.</p>
        </div>
      )}
    </div>
  );
};
