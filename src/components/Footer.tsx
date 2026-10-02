import React from 'react';
import { GraduationCap, ShieldCheck, Heart, MessageCircle, Lock, Sparkles } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/links';

interface FooterProps {
  onNavigate: (view: 'home' | 'services' | 'orders' | 'order_wizard') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-8 pb-20 border-t border-slate-800 text-xs font-['Cairo']">
      <div className="w-full px-4 space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <span className="text-base font-black text-white font-['Cairo'] block">
              المنقذ الجامعي
            </span>
            <span className="text-[11px] text-blue-400 font-semibold block">
              "عندك واجب؟ خلّه علينا. اطلبه... واستلمه جاهز."
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
          المنصة العراقية الأولى لطلب وإعداد التقارير، البحوث، مشاريع التخرج، وعروض PowerPoint لجميع الجامعات والكليات الحكومية والأهلية.
        </p>

        {/* WhatsApp Support Banner */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">دعم واستفسار مباشر:</span>
              <span className="text-xs font-bold text-white block text-right">واتساب</span>
            </div>
          </div>
          <a
            href={getWhatsAppUrl('مرحباً، أود الاستفسار عن خدمات المنقذ الجامعي.')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
          >
            مراسلة
          </a>
        </div>

        {/* Guarantees List */}
        <div className="space-y-2 text-[11px] text-slate-400 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-850">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>تعديل مجاني مفتوح وفق ملاحظات الدكتور وأستاذ المادة.</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>فحص استلال وتوثيق دقيق بالمصادر والمراجع العلمية.</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>تأكيد حالة الدفع يدوياً بعد مراجعة مرجع التحويل.</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
          <button onClick={() => onNavigate('home')} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
            الرئيسية
          </button>
          <button onClick={() => onNavigate('services')} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
            دليل الخدمات
          </button>
          <button onClick={() => onNavigate('order_wizard')} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
            طلب عمل جديد
          </button>
          <button onClick={() => onNavigate('orders')} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
            متابعة طلباتي
          </button>
        </div>

        {/* Admin discreet portal link */}
        <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
          <span>المنقذ الجامعي © 2026</span>
          <button
            onClick={onOpenAdmin}
            className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer py-1"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>دخول الإدارة</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
