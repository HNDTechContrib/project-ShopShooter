import React, { useState } from 'react';
import { CartItem, OrderConfirmation } from '../types';
import { POINT_TO_RUPIAH_RATIO } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { OrderConfirmationModal } from './cart/OrderConfirmationModal';
import { EmptyCartView } from './cart/EmptyCartView';
import { CartItemList } from './cart/CartItemList';
import { ShooterPointsRedemption } from './cart/ShooterPointsRedemption';
import { CartCheckoutSummary } from './cart/CartCheckoutSummary';

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
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');

  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('Andi Pratama');
  const [phone, setPhone] = useState<string>('081298765432');
  const [address, setAddress] = useState<string>('Jl. Sudirman No. 45, Kebayoran Baru');
  const [city, setCity] = useState<string>('Jakarta Selatan');
  const [paymentMethod, setPaymentMethod] = useState<string>('qris');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const maxRedeemablePoints = Math.min(
    userDiscountPoints,
    Math.floor((subtotal * 0.5) / POINT_TO_RUPIAH_RATIO)
  );

  const shooterDiscountRupiah = pointsToRedeem * POINT_TO_RUPIAH_RATIO;
  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 25000;
  const total = Math.max(0, subtotal - shooterDiscountRupiah - promoDiscount + shippingFee);

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

  if (confirmedOrder) {
    return (
      <OrderConfirmationModal
        order={confirmedOrder}
        onNavigateToCatalog={onNavigateToCatalog}
        onNavigateToShooter={onNavigateToShooter}
        onClose={() => setConfirmedOrder(null)}
      />
    );
  }

  if (cartItems.length === 0) {
    return (
      <EmptyCartView
        userDiscountPoints={userDiscountPoints}
        onNavigateToCatalog={onNavigateToCatalog}
        onNavigateToShooter={onNavigateToShooter}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
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
        <div className="lg:col-span-7 space-y-4">
          <CartItemList
            cartItems={cartItems}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />

          <ShooterPointsRedemption
            userDiscountPoints={userDiscountPoints}
            maxRedeemablePoints={maxRedeemablePoints}
            pointsToRedeem={pointsToRedeem}
            onPointsChange={setPointsToRedeem}
            onNavigateToShooter={onNavigateToShooter}
          />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <CartCheckoutSummary
            subtotal={subtotal}
            shooterDiscountRupiah={shooterDiscountRupiah}
            promoDiscount={promoDiscount}
            shippingFee={shippingFee}
            total={total}
            promoCode={promoCode}
            promoMessage={promoMessage}
            isCheckingOut={isCheckingOut}
            fullName={fullName}
            phone={phone}
            address={address}
            city={city}
            paymentMethod={paymentMethod}
            onPromoCodeChange={setPromoCode}
            onApplyPromo={handleApplyPromo}
            onStartCheckout={() => setIsCheckingOut(true)}
            onFullNameChange={setFullName}
            onPhoneChange={setPhone}
            onAddressChange={setAddress}
            onCityChange={setCity}
            onPaymentMethodChange={setPaymentMethod}
            onSubmitOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </div>
  );
};
