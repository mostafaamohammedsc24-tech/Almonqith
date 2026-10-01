import React, { useState } from 'react';
import { Lock, Phone, KeyRound, X, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanPass = password.trim();

    // Required Admin credentials from user prompt:
    // Phone: 07740080310
    // Password: sofydono3?
    setTimeout(() => {
      setLoading(false);
      if (cleanPhone === '07740080310' && cleanPass === 'sofydono3?') {
        onSuccess();
        onClose();
      } else {
        setError('بيانات الدخول غير صحيحة. يرجى التأكد من رقم الهاتف ورمز المرور الخاص بالإدارة.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-['Cairo']">
                دخول لوحة الإدارة والتشغيل
              </h3>
              <span className="text-[10px] text-slate-400">خاصة بفريق المنقذ الجامعي</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-4 space-y-3.5 text-xs">
          
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              رقم هاتف الإدارة المعتمد
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07740080310"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:border-blue-500 focus:outline-none text-xs text-right"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              رمز المرور (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:border-blue-500 focus:outline-none text-xs text-right"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>جاري التحقق من الصلاحيات...</span>
              ) : (
                <>
                  <span>تسجيل الدخول للإدارة</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
