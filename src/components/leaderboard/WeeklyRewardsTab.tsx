import React from 'react';
import { Crown, Medal, Gift } from 'lucide-react';

interface WeeklyRewardsTabProps {
  isDark: boolean;
}

export const WeeklyRewardsTab: React.FC<WeeklyRewardsTabProps> = ({ isDark }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={`${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-900' : 'bg-gradient-to-b from-amber-50 to-white border-amber-300'} border-2 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center`}>
        <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-amber-900 text-amber-500' : 'bg-amber-400 text-slate-950'} flex items-center justify-center mb-4 shadow-lg`}>
          <Crown className="w-7 h-7 fill-current" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
          Juara 1 Mingguan
        </span>
        <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mt-1 mb-2`}>
          Voucher Diskon 90%
        </h3>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
          Maksimum potongan hingga Rp 1.000.000 untuk belanja semua produk di katalog + Gelar Emas Juara Nasional.
        </p>
        <div className={`mt-auto w-full pt-4 border-t ${isDark ? 'border-amber-900' : 'border-amber-200'} text-xs font-bold text-amber-500`}>
          1 Pemenang Tiap Minggu
        </div>
      </div>

      <div className={`${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700' : 'bg-gradient-to-b from-slate-50 to-white border-slate-300'} border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center`}>
        <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-300 text-slate-800'} flex items-center justify-center mb-4 shadow-sm`}>
          <Medal className="w-7 h-7" />
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Peringkat 2 &amp; 3
        </span>
        <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mt-1 mb-2`}>
          Voucher Diskon 70% &amp; 50%
        </h3>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
          Potongan langsung hingga Rp 500.000 dan Rp 300.000 saat checkout belanja.
        </p>
        <div className={`mt-auto w-full pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-700'}`}>
          2 Pemenang Tiap Minggu
        </div>
      </div>

      <div className={`${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-blue-900' : 'bg-gradient-to-b from-blue-50 to-white border-blue-200'} border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center`}>
        <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-blue-900 text-blue-400' : 'bg-blue-500 text-white'} flex items-center justify-center mb-4 shadow-sm`}>
          <Gift className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
          Top 4 s/d 10 Elite
        </span>
        <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mt-1 mb-2`}>
          Voucher 30% + 500 Koin
        </h3>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
          Tambahan modal koin diskon dan voucher hemat 30% untuk seluruh peserta sepuluh besar.
        </p>
        <div className={`mt-auto w-full pt-4 border-t ${isDark ? 'border-blue-900' : 'border-blue-100'} text-xs font-bold text-blue-500`}>
          7 Pemenang Tiap Minggu
        </div>
      </div>
    </div>
  );
};
