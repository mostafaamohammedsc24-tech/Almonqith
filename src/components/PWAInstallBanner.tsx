import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenInstallModal: () => void;
}

const BANNER_DISMISSED_KEY = 'al_munqith_pwa_banner_dismissed_v1';

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenInstallModal }) => {
  const { isStandalone } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // If running as standalone shortcut, never show banner
    if (isStandalone) {
      setIsDismissed(true);
      return;
    }
    const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (!dismissed) {
      setIsDismissed(false);
    }
  }, [isStandalone]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

  if (isDismissed || isStandalone) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-3.5 py-2.5 shadow-md flex items-center justify-between gap-2 text-xs font-['Cairo'] relative z-20 border-b border-blue-700/60">
      
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20 p-1">
          <img src="/icon.svg" alt="App Icon" className="w-6 h-6" />
        </div>
        
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xs text-white truncate">
              تثبيت المنقذ كاختصار على هاتفك
            </span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full shrink-0">
              مجاناً
            </span>
          </div>
          <p className="text-[10px] text-blue-100 truncate">
            أيقونة مباشرة على الشاشة الرئيسية بدون متجر وبدون مساحة
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onOpenInstallModal}
          className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-[11px] rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-blue-700" />
          <span>تثبيت (Install)</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="إغلاق الإشعار"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
