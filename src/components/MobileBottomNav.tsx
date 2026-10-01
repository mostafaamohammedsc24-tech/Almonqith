import React from 'react';
import { Home, Layers, PlusCircle, ShoppingBag, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeView: 'home' | 'services' | 'orders' | 'order_wizard' | 'admin';
  setActiveView: (view: 'home' | 'services' | 'orders' | 'order_wizard') => void;
  ordersCount: number;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  ordersCount,
  onOpenProfile,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-lg py-1.5 px-3">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
        
        {/* الرئيسية */}
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors cursor-pointer ${
            activeView === 'home' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        {/* الخدمات */}
        <button
          onClick={() => setActiveView('services')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors cursor-pointer ${
            activeView === 'services' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">الخدمات</span>
        </button>

        {/* طلب جديد (Centered Action) */}
        <button
          onClick={() => setActiveView('order_wizard')}
          className="flex flex-col items-center -mt-3 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-700/30 group-active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold text-blue-900 mt-0.5">اطلب الآن</span>
        </button>

        {/* طلباتي */}
        <button
          onClick={() => setActiveView('orders')}
          className={`relative flex flex-col items-center py-1 rounded-xl transition-colors cursor-pointer ${
            activeView === 'orders' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {ordersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {ordersCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">طلباتي</span>
        </button>

        {/* حسابي */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center py-1 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">حسابي</span>
        </button>

      </div>
    </nav>
  );
};
