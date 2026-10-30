import React from 'react';
import { CartItem } from '../../types';
import { formatRupiah } from '../../data/mockData';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemListProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
      {cartItems.map((item) => (
        <div key={item.product.id} className="p-4 md:p-5 flex gap-4 items-center">
          <img
            src={item.product.image}
            alt={item.product.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 object-cover rounded-xl bg-slate-100 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {item.product.category}
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {item.product.name}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-extrabold text-slate-900 font-mono-numbers">
                {formatRupiah(item.product.price)}
              </span>
              <span className="text-xs text-slate-400 line-through font-mono-numbers">
                {formatRupiah(item.product.originalPrice)}
              </span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Kurangi kuantitas"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-slate-900 font-mono-numbers">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Tambah kuantitas"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => onRemoveItem(item.product.id)}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              aria-label="Hapus item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
