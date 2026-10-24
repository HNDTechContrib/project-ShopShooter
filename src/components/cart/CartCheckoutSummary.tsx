import React from 'react';
import { formatRupiah } from '../../data/mockData';
import { Sparkles, Truck, CreditCard, ShieldCheck } from 'lucide-react';

interface CartCheckoutSummaryProps {
  subtotal: number;
  shooterDiscountRupiah: number;
  promoDiscount: number;
  shippingFee: number;
  total: number;
  promoCode: string;
  promoMessage: string;
  isCheckingOut: boolean;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromo: () => void;
  onStartCheckout: () => void;
  onFullNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onAddressChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onPaymentMethodChange: (val: string) => void;
  onSubmitOrder: (e: React.FormEvent) => void;
}

export const CartCheckoutSummary: React.FC<CartCheckoutSummaryProps> = ({
  subtotal,
  shooterDiscountRupiah,
  promoDiscount,
  shippingFee,
  total,
  promoCode,
  promoMessage,
  isCheckingOut,
  fullName,
  phone,
  address,
  city,
  paymentMethod,
  onPromoCodeChange,
  onApplyPromo,
  onStartCheckout,
  onFullNameChange,
  onPhoneChange,
  onAddressChange,
  onCityChange,
  onPaymentMethodChange,
  onSubmitOrder,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
        Ringkasan Pembayaran
      </h3>

      {/* Price lines */}
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Total Harga Barang</span>
          <span className="font-semibold text-slate-900 font-mono-numbers">
            {formatRupiah(subtotal)}
          </span>
        </div>

        {shooterDiscountRupiah > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Koin Diskon Game Shooter
            </span>
            <span className="font-bold font-mono-numbers">
              -{formatRupiah(shooterDiscountRupiah)}
            </span>
          </div>
        )}

        {promoDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-medium">
            <span>Voucher Tambahan</span>
            <span className="font-bold font-mono-numbers">
              -{formatRupiah(promoDiscount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-slate-400" />
            Biaya Pengiriman
          </span>
          <span className="font-semibold text-slate-900 font-mono-numbers">
            {shippingFee === 0 ? 'GRATIS (Belanja > 500rb)' : formatRupiah(shippingFee)}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
          <strong className="text-slate-900">Total Tagihan</strong>
          <strong className="text-xl text-slate-900 font-extrabold font-mono-numbers">
            {formatRupiah(total)}
          </strong>
        </div>
      </div>

      {/* Promo code input */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value)}
            placeholder="Kode Voucher (Coba: SHOOTER90)"
            className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:border-slate-400"
          />
          <button
            type="button"
            onClick={onApplyPromo}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Terapkan
          </button>
        </div>
        {promoMessage && (
          <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">{promoMessage}</p>
        )}
      </div>

      {/* Checkout Accordion / Form */}
      {!isCheckingOut ? (
        <button
          onClick={onStartCheckout}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Lanjut ke Pengiriman &amp; Checkout
        </button>
      ) : (
        <form onSubmit={onSubmitOrder} className="pt-4 border-t border-slate-200 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Informasi Pengiriman
          </span>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Nomor WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Alamat Pengiriman</label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-slate-400"
            >
              <option value="qris">QRIS Instant (GoPay / OVO / ShopeePay / BCA)</option>
              <option value="bca_va">BCA Virtual Account</option>
              <option value="mandiri_va">Mandiri Virtual Account</option>
              <option value="cod">Cash on Delivery (Bayar di Tempat)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Konfirmasi &amp; Bayar {formatRupiah(total)}
          </button>
        </form>
      )}
    </div>
  );
};
