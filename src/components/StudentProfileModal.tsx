import React, { useState } from 'react';
import { 
  ArrowRight, 
  User, 
  Phone, 
  GraduationCap, 
  Building2, 
  Coins, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Lock,
  LogOut,
  Sparkles,
  BookOpen,
  LogIn,
  KeyRound,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { StudentProfile, AcademicStage } from '../types';
import { IRAQI_UNIVERSITIES } from '../data/universities';
import { findRegisteredStudentByPhone } from '../utils/storage';

interface StudentProfileModalProps {
  profile: StudentProfile;
  ordersCount: number;
  onSaveProfile: (profile: StudentProfile) => void;
  onClose: () => void;
  onOpenAdminLogin?: () => void;
  onOpenPointsWallet?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  profile,
  ordersCount,
  onSaveProfile,
  onClose,
  onOpenAdminLogin,
  onOpenPointsWallet,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'login'>(profile.isRegistered ? 'profile' : 'profile');

  // Form states
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [university, setUniversity] = useState(profile.university || '');
  const [college, setCollege] = useState(profile.college || '');
  const [department, setDepartment] = useState(profile.department || '');
  const [stage, setStage] = useState<AcademicStage | ''>(profile.stage || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Login with phone states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginMsg, setLoginMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Universities and colleges lookup
  const selectedUni = IRAQI_UNIVERSITIES.find(u => u.name === university);
  const availableColleges = selectedUni ? selectedUni.colleges : [];
  const selectedCol = availableColleges.find(c => c.name === college);
  const availableDepartments = selectedCol?.departments || [];

  const handleUniversityChange = (uName: string) => {
    setUniversity(uName);
    const u = IRAQI_UNIVERSITIES.find(uni => uni.name === uName);
    if (u && u.colleges.length > 0) {
      setCollege(u.colleges[0].name);
      if (u.colleges[0].departments.length > 0) {
        setDepartment(u.colleges[0].departments[0].name);
      } else {
        setDepartment('');
      }
    } else {
      setCollege('');
      setDepartment('');
    }
  };

  const handleCollegeChange = (cName: string) => {
    setCollege(cName);
    const c = availableColleges.find(col => col.name === cName);
    if (c && c.departments.length > 0) {
      setDepartment(c.departments[0].name);
    } else {
      setDepartment('');
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setValidationError('يرجى إدخال اسم الطالب الثلاثي كاملاً لتسجيل الحساب.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!phone.trim()) {
      setValidationError('رقم هاتف الطالب (واتساب) حقل إلزامي وضروري جداً لتسليم الملفات والتواصل.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationError(null);
    const newProfile: StudentProfile = {
      ...profile,
      name: name.trim(),
      phone: phone.trim(),
      university: university.trim(),
      college: college.trim(),
      department: department.trim(),
      stage: stage || 'stage_1',
      isRegistered: true,
      referralCode: profile.referralCode || `MNQ-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onSaveProfile(newProfile);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleLoginWithPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg(null);

    const cleanInput = loginPhone.trim().replace(/\s+/g, '');
    if (!cleanInput) {
      setLoginMsg({ text: 'يرجى إدخال رقم هاتفك المسجل سابقاً.', isError: true });
      return;
    }

    const found = findRegisteredStudentByPhone(cleanInput);
    if (found) {
      onSaveProfile(found);
      setName(found.name || '');
      setPhone(found.phone || '');
      setUniversity(found.university || '');
      setCollege(found.college || '');
      setDepartment(found.department || '');
      setStage(found.stage || '');
      setLoginMsg({ 
        text: `أهلاً بعودتك يا ${found.name}! تم استعادة حسابك بنجاح مع رصيدك (${found.loyaltyPoints || 0} نقطة) وكافة وصولاتك.`, 
        isError: false 
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setLoginMsg({ 
        text: 'لم يتم العثور على حساب مسجل بهذا الرقم. يمكنك تعبئة النموذج وإنشاء حساب جديد فوراً.', 
        isError: true 
      });
      setPhone(loginPhone.trim());
      setActiveTab('profile');
    }
  };

  const handleLogout = () => {
    onSaveProfile({
      name: '',
      phone: '',
      university: '',
      college: '',
      department: '',
      stage: 'stage_1',
      loyaltyPoints: 0,
      totalEarnedPoints: 0,
      loyaltyTier: 'bronze',
      dailyStreak: 0,
      lastCheckInDate: '',
      referralCode: '',
      isRegistered: false,
    });
    setName('');
    setPhone('');
    setUniversity('');
    setCollege('');
    setDepartment('');
    setStage('');
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
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-none">
              {profile.isRegistered ? 'ملف الطالب الأكاديمي' : 'تسجيل ودخول الطالب'}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
              {profile.isRegistered ? 'بياناتك محفوظة ونقاطك ووصولاتك مؤمنة' : 'سجل حسابك أو سجّل دخولك لاستعادة نقاطك وطلباتك'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile.isRegistered && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-1 transition-colors cursor-pointer"
              title="تسجيل الخروج ومسح الجلسة"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </header>

      {/* Main Full-Screen Body */}
      <main className="flex-1 w-full max-w-xl mx-auto p-4 sm:p-6 pb-20 space-y-4">
        
        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Tab Switcher if not registered */}
        {!profile.isRegistered && (
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              إنشاء حساب جديد
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              دخول برقم الهاتف المسجل
            </button>
          </div>
        )}

        {/* Quick Phone Login Card */}
        {activeTab === 'login' && !profile.isRegistered && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  استعادة الحساب برقم الهاتف
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  أدخل رقم هاتفك لاسترجاع نقاط الولاء وجميع وصولاتك الأكاديمية
                </p>
              </div>
            </div>

            {loginMsg && (
              <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                loginMsg.isError
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}>
                {loginMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{loginMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleLoginWithPhone} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  رقم الهاتف (واتساب):
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="0770 000 0000"
                    className="w-full pr-9 pl-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-600 focus:outline-none bg-slate-50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 transition-colors text-right"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>دخول واستعادة رصيد النقاط والوصولات</span>
              </button>
            </form>
          </div>
        )}

        {/* Status Card: Registered vs Guest */}
        {activeTab === 'profile' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black shadow-md shadow-blue-700/20 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {profile.isRegistered ? profile.name : 'طالب جديد (زائر)'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    profile.isRegistered
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}>
                    {profile.isRegistered ? 'حساب محفوظ وموثق ✓' : 'غير مسجل بعد'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {profile.isRegistered 
                    ? `${profile.university || 'جامعة عراقية'} · ${profile.college || 'كلية'} · ${profile.phone || ''}` 
                    : 'سجل بياناتك لتبقى نقاطك ووصولاتك وخصوماتك محفوظة دائماً'}
                </p>
              </div>
            </div>

            {/* Loyalty Points Pill inside Card */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-3 rounded-2xl flex items-center justify-between sm:flex-col sm:items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                <Coins className="w-4 h-4 fill-amber-500 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold">رصيد النقاط:</span>
                <span className="text-sm font-mono font-black text-amber-800 dark:text-amber-300">
                  {profile.loyaltyPoints || 0}
                </span>
              </div>
              {onOpenPointsWallet && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPointsWallet();
                  }}
                  className="text-[10px] font-black text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
                >
                  فتح محفظة المكافآت ↗
                </button>
              )}
            </div>
          </div>
        )}

        {/* Profile / Registration Form */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>البيانات الأكاديمية والشخصية</span>
            </h2>

            {/* 1. الاسم الثلاثي */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                الاسم الثلاثي للطالب <span className="text-rose-600">* (مطلوب)</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك الثلاثي كما يوضع على التقرير..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-600 focus:outline-none bg-slate-50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                يُطبع على الصفحة الأولى للتقرير أو واجهة عرض السيمينار.
              </span>
            </div>

            {/* 2. رقم الهاتف للواتساب */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  رقم هاتف الطالب (واتساب) <span className="text-rose-600">* (إلزامي)</span>
                </label>
                <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                  مطلوب للتسليم واستعادة الحساب
                </span>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0770 000 0000"
                  className="w-full pr-9 pl-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-600 focus:outline-none bg-slate-50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 transition-colors text-right"
                  dir="ltr"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                نرسل عليه مسودة العمل، الملف النهائي بصيغة Word و PDF، وإشعارات التقدم.
              </span>
            </div>

            {/* 3. الجامعة */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                الجامعة الأكاديمية
              </label>
              <select
                value={university}
                onChange={(e) => handleUniversityChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-600 focus:outline-none bg-white dark:bg-slate-800 transition-colors cursor-pointer"
              >
                <option value="">-- اختر جامعتك من القائمة --</option>
                {IRAQI_UNIVERSITIES.map(u => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.city})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. الكلية والقسم */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  الكلية
                </label>
                <select
                  value={college}
                  onChange={(e) => handleCollegeChange(e.target.value)}
                  disabled={!university}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-600 focus:outline-none bg-white dark:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <option value="">-- اختر كليتك --</option>
                  {availableColleges.map((col, idx) => (
                    <option key={idx} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  القسم الأكاديمي
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!college}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-600 focus:outline-none bg-white dark:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <option value="">-- اختر القسم الأكاديمي --</option>
                  {availableDepartments.map((dept, idx) => (
                    <option key={idx} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. المرحلة الدراسية */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                المرحلة الدراسية
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as AcademicStage)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-blue-600 focus:outline-none bg-white dark:bg-slate-800 transition-colors cursor-pointer"
              >
                <option value="">-- اختر المرحلة الدراسية --</option>
                <option value="stage_1">المرحلة الأولى</option>
                <option value="stage_2">المرحلة الثانية</option>
                <option value="stage_3">المرحلة الثالثة</option>
                <option value="stage_4">المرحلة الرابعة (سنة التخرج)</option>
                <option value="stage_5_6">المرحلة الخامسة أو السادسة (طب / هندسة معماري)</option>
                <option value="postgrad">الدراسات العليا (دبلوم عالي / ماجستير / دكتوراه)</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-black text-sm shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>تم حفظ الحساب والبيانات بنجاح!</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>{profile.isRegistered ? 'تحديث وحفظ بيانات الحساب' : 'تأكيد وتسجيل الحساب الآن'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* Security & Confidentiality Notice */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-black text-slate-900 dark:text-white block">
              سرية تامة وحفظ دائم لحقوقك الأكاديمية
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              تسجيل حسابك يضمن حفظ نقاطك ومتابعة جميع وصولاتك المعتمدة وحقك في التعديل المجاني غير المحدود.
            </p>
          </div>
        </div>

        {/* Discreet Staff Portal Link */}
        {onOpenAdminLogin && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminLogin();
              }}
              className="text-[11px] text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>بوابة المشرفين والإدارة (07740080310)</span>
            </button>
          </div>
        )}

      </main>

    </div>
  );
};
