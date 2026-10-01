import React, { useState } from 'react';
import { ShieldCheck, Lock, Phone, ArrowLeft, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('07740080310');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Required credentials: phone 07740080310 and password sofydono3?
      const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
      const cleanPass = password.trim();

      if (cleanPhone === '07740080310' && cleanPass === 'sofydono3?') {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('بيانات الدخول غير صحيحة! يرجى التأكد من رقم هاتف المشرف (07740080310) والرمز السري الخاص بالإدارة.');
      }
    }, 400);
  };

  const handleFillDemoCredentials = () => {
    setPhoneNumber('07740080310');
    setPassword('sofydono3?');
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 text-slate-900 font-['Cairo']">
      
      {/* Back button */}
      <button
        onClick={onCancel}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        <span>العودة لواجهة الطالب</span>
      </button>

      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-700/20">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-black text-slate-900 font-['Cairo']">
            بوابة الإدارة والتشغيل
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            منطقة مخصصة لمشرفي منصة "المنقذ الجامعي" لإدارة الطلبات والأسعار والموظفين
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              رقم هاتف المشرف المعتمد <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07740080310"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-right dir-ltr"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              رقم المشرف المسجل في النظام: <strong>07740080310</strong>
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              الرمز السري (كلمة المرور) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل الرمز السري..."
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-black text-xs rounded-xl shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'جاري التحقق...' : 'تسجيل الدخول إلى لوحة الإدارة'}</span>
          </button>

          {/* Quick Demo Pre-fill for Testing convenience */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>تعبئة بيانات الإدارة تلقائياً (07740080310 / sofydono3?)</span>
            </button>
          </div>

        </form>

      </div>

      {/* Security Note */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-slate-500">
          محمية ومشفرة · المنقذ الجامعي - العراق 2026
        </p>
      </div>

    </div>
  );
};
