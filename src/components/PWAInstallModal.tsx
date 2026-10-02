import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  ExternalLink,
  ShieldCheck,
  Zap,
  BellRing,
  Layers
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'auto' | 'ios' | 'android'>(isIOS ? 'ios' : 'auto');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
        setInstallSuccess(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col font-['Cairo'] overflow-y-auto animate-fadeIn transition-colors">
      
      {/* Top Sticky App Bar */}
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="رجوع"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                تثبيت المنقذ الجامعي
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                إنشاء اختصار سريع ومباشر على شاشة هاتفك
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          إغلاق
        </button>
      </header>

      {/* Main Full-Screen Body */}
      <main className="flex-1 w-full max-w-xl mx-auto p-4 sm:p-6 pb-24 space-y-5">
        
        {/* App Hero Badge */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-800 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-700/25 p-3 shrink-0">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="المنقذ الجامعي" className="w-full h-full drop-shadow" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                تطبيق المنقذ الجامعي (PWA)
              </h2>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                اختصار رسمي
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              يعمل كتطبيق هاتف حقيقي وخفيف دون استهلاك مساحة الذاكرة أو متجر التطبيقات، مع إمكانية المتابعة الفورية والتنبيهات.
            </p>
          </div>
        </div>

        {/* Quick Native Install Button (if browser supports BeforeInstallPrompt) */}
        {isInstallable && !installSuccess && (
          <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center space-y-2">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">
              متصفحك يدعم التثبيت بنقرة واحدة مباشرة!
            </span>
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-5 h-5" />
              <span>تثبيت التطبيق الآن على هاتفك (نقرة واحدة)</span>
            </button>
          </div>
        )}

        {installSuccess && (
          <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-center space-y-1 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <span className="font-black text-sm block">تمت إضافة التطبيق بنجاح!</span>
            <p className="text-xs">ستجد أيقونة «المنقذ الجامعي» على شاشة هاتفك الرئيسية الآن.</p>
          </div>
        )}

        {/* Device Selection Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            هواتف iPhone (آبل / Safari)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            هواتف Android (Chrome)
          </button>
        </div>

        {/* Step-by-Step Instructions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              {activeTab === 'ios' ? 'طريقة تثبيت الاختصار على الآيفون (Safari):' : 'طريقة تثبيت الاختصار على أندرويد (Chrome):'}
            </span>
          </h3>

          {activeTab === 'ios' ? (
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    افتح الرابط في متصفح Safari
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    تأكد من فتح المنصة عبر تطبيق Safari الأصلي في جهازك.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                    <span>اضغط زر المشاركة السفلي</span>
                    <Share className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline" />
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    أيقونة المربع الذي يخرج منه سهم للأعلى في شريط Safari السفلي.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                    <span>اختر «إضافة إلى الشاشة الرئيسية»</span>
                    <PlusSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline" />
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    انزل بالقائمة للأسفل واضغط (Add to Home Screen) ثم اضغط «إضافة».
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    افتح متصفح Google Chrome
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    تأكد من فتح رابط المنصة في متصفح كروم.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    اضغط قائمة الثلاث نقاط (⋮) في أعلى المتصفح
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    توجد في الزاوية العلوية يميناً أو يساراً.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    اضغط «تثبيت التطبيق» أو «الإضافة للشاشة الرئيسية»
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    (Install app / Add to Home screen) وستظهر الأيقونة فوراً على شاشتك.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <span className="font-black text-xs text-slate-900 dark:text-white block">
            لماذا تثبت المنقذ الجامعي كاختصار؟
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">فتح فوري وسريع</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">دون الحاجة لكتابة الرابط كل مرة في المتصفح.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <BellRing className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">إشعارات تسليم الملفات</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">تنبيهات عند اكتمال كتابة وتدقيق بحثك.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">حجم خفيف جداً (صفر ميغابايت)</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">لا يشغل مساحة من ذاكرة هاتفك على الإطلاق.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">حفظ الحساب والنقاط</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">تبقى مسجلاً دائماً وتتابع رصيد نقاطك وأوامرك.</span>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};
