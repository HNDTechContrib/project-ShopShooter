import React from 'react';
import { OrderConfirmation } from '../../types';
import { formatRupiah } from '../../data/mockData';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: OrderConfirmation;
  onNavigateToCatalog: () => void;
  onNavigateToShooter: () => void;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onNavigateToCatalog,
  onNavigateToShooter,
  onClose,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl text-center">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-1">Pesanan Berhasil Dikonfirmasi!</h2>
      <p className="text-sm text-slate-500 mb-6">
        Nomor Pesanan: <strong className="text-slate-900 font-mono">{order.orderId}</strong>
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-left space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
          <span>Waktu Transaksi</span>
          <span className="font-medium text-slate-800">{order.createdAt} WIB</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Total Harga Barang</span>
          <span className="font-semibold text-slate-900 font-mono-numbers">
            {formatRupiah(order.subtotal)}
          </span>
        </div>

        {order.shooterDiscountRupiah > 0 && (
          <div className="flex items-center justify-between text-sm text-emerald-600">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Potongan Diskon Game Shooter ({order.pointsUsed} Poin)
            </span>
            <span className="font-bold font-mono-numbers">
              -{formatRupiah(order.shooterDiscountRupiah)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Ongkos Kirim</span>
          <span className="font-semibold text-slate-900">
            {order.shippingFee === 0 ? 'GRATIS' : formatRupiah(order.shippingFee)}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
          <strong className="text-slate-900">Total Pembayaran</strong>
          <strong className="text-lg text-slate-900 font-mono-numbers">
            {formatRupiah(order.total)}
          </strong>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
          <span className="font-semibold text-slate-800 block mb-1">Alamat Pengiriman:</span>
          {order.shippingAddress.fullName} ({order.shippingAddress.phone})
          <br />
          {order.shippingAddress.address}, {order.shippingAddress.city}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => {
            onClose();
            onNavigateToCatalog();
          }}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
        >
          Lanjut Belanja di Katalog
        </button>
        <button
          onClick={() => {
            onClose();
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
};
