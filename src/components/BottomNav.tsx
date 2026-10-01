import React from 'react';
import { Home, BookOpen, Plus, ShoppingBag, User } from 'lucide-react';

interface BottomNavProps {
  activeView: 'home' | 'services' | 'orders' | 'order_wizard' | 'admin';
  setActiveView: (view: 'home' | 'services' | 'orders' | 'order_wizard' | 'admin') => void;
  activeOrdersCount: number;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  setActiveView,
  activeOrdersCount,
  onOpenProfile,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-[440px] mx-auto z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 py-1.5 px-3 flex items-center justify-around shadow-lg font-['Cairo'] transition-colors">
      
      {/* 1. الرئيسية */}
      <button
        onClick={() => {
          setActiveView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeView === 'home'
            ? 'text-blue-700 dark:text-blue-400 font-bold scale-102'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Home className={`w-5 h-5 ${activeView === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] leading-none">الرئيسية</span>
      </button>

      {/* 2. الخدمات */}
      <button
        onClick={() => {
          setActiveView('services');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeView === 'services'
            ? 'text-blue-700 dark:text-blue-400 font-bold scale-102'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <BookOpen className={`w-5 h-5 ${activeView === 'services' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] leading-none">الخدمات</span>
      </button>

      {/* 3. اطلب الآن (Prominent Central Action Button) */}
      <button
        onClick={() => {
          setActiveView('order_wizard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="flex flex-col items-center -mt-4 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-700/30 group-active:scale-95 transition-transform border-2 border-white dark:border-slate-900">
          <Plus className="w-6 h-6 stroke-[3]" />
        </div>
        <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 mt-1 leading-none">اطلب الآن</span>
      </button>

      {/* 4. طلباتي (مع إشعار عدد الطلبات النشطة) */}
      <button
        onClick={() => {
          setActiveView('orders');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
          activeView === 'orders'
            ? 'text-blue-700 dark:text-blue-400 font-bold scale-102'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ShoppingBag className={`w-5 h-5 ${activeView === 'orders' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {activeOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border border-white dark:border-slate-900">
              {activeOrdersCount}
            </span>
          )}
        </div>
        <span className="text-[10px] leading-none">طلباتي</span>
      </button>

      {/* 5. حسابي */}
      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
      >
        <User className="w-5 h-5 stroke-2" />
        <span className="text-[10px] leading-none">حسابي</span>
      </button>

    </nav>
  );
};
