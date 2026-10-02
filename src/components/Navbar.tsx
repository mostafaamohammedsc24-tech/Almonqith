import React from 'react';
import { 
  GraduationCap, 
  User, 
  MessageCircle, 
  Coins, 
  Bell, 
  Download, 
  Sun, 
  Moon,
  CheckCircle2
} from 'lucide-react';
import { StudentProfile } from '../types';

interface NavbarProps {
  activeView: 'home' | 'services' | 'orders' | 'order_wizard' | 'admin';
  setActiveView: (view: 'home' | 'services' | 'orders' | 'order_wizard' | 'admin') => void;
  ordersCount: number;
  activeOrdersCount: number;
  profile: StudentProfile;
  onOpenProfile: () => void;
  onStartNewOrder: () => void;
  onOpenPoints: () => void;
  onOpenNotifications: () => void;
  onOpenInstall: () => void;
  unreadNotificationsCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveView,
  profile,
  onOpenProfile,
  onOpenPoints,
  onOpenNotifications,
  onOpenInstall,
  unreadNotificationsCount,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs font-['Cairo'] transition-colors">
      <div className="w-full px-3 py-2 flex items-center justify-between gap-1.5">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveView('home')} 
          className="flex items-center gap-1.5 cursor-pointer active:scale-98 transition-transform select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-800 to-blue-600 flex items-center justify-center text-white shadow-xs p-1">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="Logo" className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white font-['Cairo']">
                المنقذ
              </span>
              <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-1 py-0.2 rounded border border-blue-200/60 dark:border-blue-800">
                العراق
              </span>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 leading-none">
              عندك واجب؟ خلّه علينا
            </p>
          </div>
        </div>

        {/* Header Right Action Icons (Clean, No Name Text, Fits Easily) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* PWA Install Button (اختصار) */}
          <button
            type="button"
            onClick={onOpenInstall}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200/80 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[10px] font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            title="تثبيت التطبيق كاختصار على هاتفك"
          >
            <Download className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span className="font-black hidden xs:inline">تثبيت</span>
          </button>

          {/* Loyalty Points Pill (النقاط) */}
          <button
            type="button"
            onClick={onOpenPoints}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-300 text-[11px] font-black transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="محفظة نقاط المنقذ"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
            <span className="font-mono">{profile.loyaltyPoints || 0}</span>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="مركز الإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Profile Button - Purely Icon Button (No Triple Name Text as requested) */}
          <button
            type="button"
            onClick={onOpenProfile}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs relative ${
              profile.isRegistered
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title={profile.isRegistered ? 'حساب الطالب' : 'تسجيل حساب جديد'}
          >
            <User className="w-4 h-4" />
            {profile.isRegistered && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 border border-white dark:border-slate-900" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
