import React, { useState } from 'react';
import { CartItem, OrderConfirmation } from '../types';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../data/mockData';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  Truck,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

interface CartCheckoutViewProps {
  cartItems: CartItem[];
  userDiscountPoints: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onDeductPoints: (points: number) => void;
  onNavigateToCatalog: () => void;
  onNavigateToShooter: () => void;
}

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({
  cartItems,
  userDiscountPoints,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onDeductPoints,
  onNavigateToCatalog,
  onNavigateToShooter,
}) => {
  // Poin redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');

  // Checkout form
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('Andi Pratama');
  const [phone, setPhone] = useState<string>('081298765432');
  const [address, setAddress] = useState<string>('Jl. Sudirman No. 45, Kebayoran Baru');
  const [city, setCity] = useState<string>('Jakarta Selatan');
  const [paymentMethod, setPaymentMethod] = useState<string>('qris');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);

  // Financial calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Max points user can redeem: capped by user's total points and 50% of subtotal
  const maxRedeemablePoints = Math.min(
    userDiscountPoints,
    Math.floor((subtotal * 0.5) / POINT_TO_RUPIAH_RATIO)
  );

  const shooterDiscountRupiah = pointsToRedeem * POINT_TO_RUPIAH_RATIO;
  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 25000;
  const total = Math.max(0, subtotal - shooterDiscountRupiah - promoDiscount + shippingFee);

  // Quick point select
  const handleQuickPointSelect = (percentage: number) => {
    const calculated = Math.floor(maxRedeemablePoints * percentage);
    setPointsToRedeem(calculated);
  };

  // Promo code apply
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'SHOOTER90') {
      const discountVal = Math.min(200000, Math.floor(subtotal * 0.3));
      setPromoDiscount(discountVal);
      setPromoMessage('Kupon Juara Shooter berhasil dipakai! Diskon hemat Rp ' + discountVal.toLocaleString('id-ID'));
      soundEngine.playHit(true);
    } else if (code === 'FLASHDEAL') {
      const discountVal = 50000;
      setPromoDiscount(discountVal);
      setPromoMessage('Kupon Flash Deal Rp 50.000 aktif!');
      soundEngine.playHit(true);
    } else {
      setPromoMessage('Kode kupon tidak valid atau telah kedaluwarsa.');
      setPromoDiscount(0);
    }
  };

  // Final submit order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const order: OrderConfirmation = {
      orderId: `BLAST-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cartItems],
      subtotal,
      shooterDiscountRupiah,
      pointsUsed: pointsToRedeem,
      shippingFee,
      total,
      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        paymentMethod,
      },
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onDeductPoints(pointsToRedeem);
    setConfirmedOrder(order);
    onClearCart();
    soundEngine.playCheckoutSuccess();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  // If order confirmed modal
  if (confirmedOrder) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Pesanan Berhasil Dikonfirmasi!</h2>
        <p className="text-sm text-slate-500 mb-6">
          Nomor Pesanan: <strong className="text-slate-900 font-mono">{confirmedOrder.orderId}</strong>
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
            <span>Waktu Transaksi</span>
            <span className="font-medium text-slate-800">{confirmedOrder.createdAt} WIB</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Total Harga Barang</span>
            <span className="font-semibold text-slate-900 font-mono-numbers">
              {formatRupiah(confirmedOrder.subtotal)}
            </span>
          </div>

          {confirmedOrder.shooterDiscountRupiah > 0 && (
            <div className="flex items-center justify-between text-sm text-emerald-600">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Potongan Diskon Game Shooter ({confirmedOrder.pointsUsed} Poin)
              </span>
              <span className="font-bold font-mono-numbers">
                -{formatRupiah(confirmedOrder.shooterDiscountRupiah)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Ongkos Kirim</span>
            <span className="font-semibold text-slate-900">
              {confirmedOrder.shippingFee === 0 ? 'GRATIS' : formatRupiah(confirmedOrder.shippingFee)}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
            <strong className="text-slate-900">Total Pembayaran</strong>
            <strong className="text-lg text-slate-900 font-mono-numbers">
              {formatRupiah(confirmedOrder.total)}
            </strong>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block mb-1">Alamat Pengiriman:</span>
            {confirmedOrder.shippingAddress.fullName} ({confirmedOrder.shippingAddress.phone})
            <br />
            {confirmedOrder.shippingAddress.address}, {confirmedOrder.shippingAddress.city}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setConfirmedOrder(null);
              onNavigateToCatalog();
            }}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Lanjut Belanja di Katalog
          </button>
          <button
            onClick={() => {
              setConfirmedOrder(null);
              onNavigateToShooter();
            }}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Mainkan Shooter Lagi untuk Kumpulkan Poin
          </button>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
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
            Tembak Target Produk di Shooter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToCatalog}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Kembali ke katalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Keranjang Belanja</h2>
            <span className="text-xs text-slate-500">
              {cartItems.reduce((acc, it) => acc + it.quantity, 0)} Produk Dipilih
            </span>
          </div>
        </div>

        <button
          onClick={onClearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium"
        >
          Kosongkan Keranjang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
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

          {/* Interactive Shooter Point Redemption Box */}
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
                onChange={(e) => setPointsToRedeem(Number(e.target.value))}
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
        </div>

        {/* Right Column: Order Summary & Checkout Form */}
        <div className="lg:col-span-5 space-y-4">
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
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Kode Voucher (Coba: SHOOTER90)"
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
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
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Lanjut ke Pengiriman &amp; Checkout
              </button>
            ) : (
              <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Informasi Pengiriman
                </span>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
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
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
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
        </div>
      </div>
    </div>
  );
};
