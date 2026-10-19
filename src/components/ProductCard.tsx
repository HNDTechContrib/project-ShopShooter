import React from 'react';
import { Product } from '../types';
import { formatRupiah } from '../data/mockData';
import { Star, ShoppingBag, Target } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onDirectShoot: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onDirectShoot,
}) => {
  return (
    <div className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all flex flex-col h-full">
      {/* 65-75% Image Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quiet unboxed discount tag */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight">
          Hemat {product.discountPercent}%
        </div>

        {/* Shooter Bonus Points Badge */}
        <div className="absolute top-3 right-3 bg-amber-500/95 backdrop-blur-sm text-slate-950 px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-1 shadow-sm">
          <Target className="w-3 h-3 text-slate-950" />
          <span>+{product.shooterBonusPoints} Pts</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata with · separator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Key Specs */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.specs.slice(0, 2).map((spec, i) => (
              <span
                key={i}
                className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing Baseline & Interactive Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-slate-900 font-mono-numbers">
              {formatRupiah(product.price)}
            </span>
            <span className="text-xs text-slate-400 line-through font-mono-numbers">
              {formatRupiah(product.originalPrice)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onAddToCart(product);
                soundEngine.playHit(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Beli Sekarang
            </button>

            <button
              onClick={() => onDirectShoot(product)}
              className="w-full flex items-center justify-center gap-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors active:scale-95"
              title="Bidik produk ini di game untuk kumpulkan koin diskon!"
            >
              <Target className="w-3.5 h-3.5 text-amber-600" />
              Tembak Target
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
