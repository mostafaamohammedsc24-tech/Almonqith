import React, { useState } from 'react';
import { ShieldCheck, Lock, Phone, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ phone: phoneNumber.trim(), password }),
      });
      if (!response.ok) throw new Error();
      onLoginSuccess();
    } catch {
      setError('تعذر تسجيل الدخول. تحقق من البيانات أو إعدادات الخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 text-slate-900 font-['Cairo']">
      
      {/* Back button */}
      <button
        onClick={onCancel}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        <span>العودة لواجهة الطالب</span>
      </button>

      {/* Login Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-xl space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-700/20">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white font-['Cairo']">
            بوابة الإدارة والتشغيل
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            منطقة مخصصة لمشرفي منصة "المنقذ الجامعي" لإدارة الطلبات والأسعار والموظفين
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              رقم الهاتف <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="أدخل رقم الهاتف"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 text-right dir-ltr"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
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
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:border-blue-600 focus:outline-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700"
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

        </form>

      </div>

      {/* Security Note */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          بوابة إدارة المنقذ الجامعي
        </p>
      </div>

    </div>
  );
};
