import React from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  FileCheck2, 
  GraduationCap,
  MessageCircle
} from 'lucide-react';
import { QuickOrderBar } from './QuickOrderBar';

interface HeroProps {
  onStartOrder: () => void;
  onBrowseServices: () => void;
  onOrderParsed: (data: any) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartOrder,
  onOrderParsed,
}) => {
  return (
    <section className="relative overflow-hidden pt-4 pb-6 px-3.5 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 font-['Cairo'] transition-colors">
      
      <div className="w-full text-center">
        
        {/* Iraqi Academic Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-[10px] font-bold mb-3 shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
          <span>منصة طلب الخدمات الجامعية الأولى في العراق</span>
        </div>

        {/* Mobile Proportioned Headline */}
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug font-['Cairo']">
          عندك واجب؟ بحث؟ تقرير؟ عرض؟
          <span className="block mt-1 text-blue-800 dark:text-blue-400">
            اطلبه من المنقذ واستلمه جاهزاً.
          </span>
        </h1>

        {/* Slogan */}
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed px-1">
          "عندك واجب؟ خلّه علينا.. اطلبه واستلمه جاهز بأعلى معايير كليتك."
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-3.5 flex items-center justify-center gap-2">
          <button
            onClick={onStartOrder}
            className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-black text-xs rounded-xl shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>اطلب تقريرك الآن</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          
          <a
            href="https://wa.me/9647740080310"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </a>
        </div>

        {/* Smart Order Search Bar in Hero */}
        <div className="mt-3.5">
          <QuickOrderBar onOrderParsed={onOrderParsed} />
        </div>

        {/* Trust Badges - Mobile Row */}
        <div className="mt-4 pt-3 border-t border-slate-200/90 dark:border-slate-800 grid grid-cols-3 gap-1.5 text-right">
          
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 mb-1" />
            <h2 className="text-[10px] font-black text-slate-900 dark:text-white leading-tight">تسليم سريع</h2>
            <p className="text-[8px] text-slate-500 dark:text-slate-400">6 إلى 24 ساعة</p>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mb-1" />
            <h2 className="text-[10px] font-black text-slate-900 dark:text-white leading-tight">دليل كليتك</h2>
            <p className="text-[8px] text-slate-500 dark:text-slate-400">هوامش وتوثيق</p>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mb-1" />
            <h2 className="text-[10px] font-black text-slate-900 dark:text-white leading-tight">تعديل مجاني</h2>
            <p className="text-[8px] text-slate-500 dark:text-slate-400">ملاحظات دكتورك</p>
          </div>

        </div>

      </div>

    </section>
  );
};
