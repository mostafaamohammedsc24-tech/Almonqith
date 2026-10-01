import React, { useState } from 'react';
import { 
  Coins, 
  X, 
  Sparkles, 
  Award, 
  Flame, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight, 
  Gift, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  ChevronLeft,
  ArrowLeft,
  Info,
  CheckCircle2
} from 'lucide-react';
import { StudentProfile, PointsTransaction } from '../types';
import { 
  getStoredPointsHistory, 
  addPointsTransaction, 
  saveProfile, 
  TIER_CONFIG,
  calculateLoyaltyTier 
} from '../utils/storage';
import { formatIqd } from '../utils/pricing';

interface LoyaltyPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updatedProfile: StudentProfile) => void;
  onStartOrderWithPoints?: () => void;
}

export const LoyaltyPointsModal: React.FC<LoyaltyPointsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onStartOrderWithPoints,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [checkInCelebration, setCheckInCelebration] = useState(false);
  const [history, setHistory] = useState<PointsTransaction[]>(getStoredPointsHistory());

  if (!isOpen) return null;

  const currentPoints = profile.loyaltyPoints || 0;
  const currentTier = calculateLoyaltyTier(currentPoints);
  const tierInfo = TIER_CONFIG[currentTier];
  const equivalentIqd = Math.round((currentPoints / 100) * 1000);

  // Daily Check-in Logic
  const todayStr = new Date().toISOString().slice(0, 10);
  const canCheckIn = profile.lastCheckInDate !== todayStr;

  const handleDailyCheckIn = () => {
    if (!canCheckIn) return;

    const streak = (profile.dailyStreak || 0) + 1;
    const bonusPoints = 15;

    addPointsTransaction({
      title: `تسجيل حضور يومي (يوم ${streak})`,
      points: bonusPoints,
      type: 'bonus',
    });

    const updated: StudentProfile = {
      ...profile,
      loyaltyPoints: currentPoints + bonusPoints,
      totalEarnedPoints: (profile.totalEarnedPoints || 0) + bonusPoints,
      dailyStreak: streak,
      lastCheckInDate: todayStr,
    };

    saveProfile(updated);
    onUpdateProfile(updated);
    setHistory(getStoredPointsHistory());

    setCheckInCelebration(true);
    setTimeout(() => setCheckInCelebration(false), 3000);
  };

  const referralCode = profile.referralCode || (profile.isRegistered ? `MNQ-${Math.floor(1000 + Math.random() * 9000)}` : 'MNQ-REF2026');

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleShareReferralWhatsApp = () => {
    const text = 
`أهلاً زميلي! 🎓
أنصحك باستخدام منصة «المنقذ الجامعي» لإعداد التقارير والبحوث الأكاديمية والترجمة.
استخدم كود الخصم الأكاديمي: [${referralCode}] عند طلبك وستحصل على خصم فوري 10% على تكليفك.
رابط المنصة: https://ais-pre-j6wn3h4sunv4qf4sa2vk54-42199584482.europe-west1.run.app`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Progress to next tier
  const nextTierPoints = currentTier === 'bronze' ? 501 : currentTier === 'silver' ? 1501 : currentTier === 'gold' ? 3001 : 10000;
  const progressPercent = Math.min(100, Math.round((currentPoints / nextTierPoints) * 100));

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
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Coins className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                محفظة نقاط المنقذ الأكاديمية
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                برنامج الولاء والخصومات المباشرة للطلبة
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
      <main className="flex-1 w-full max-w-xl mx-auto p-4 sm:p-6 pb-24 space-y-4">
        
        {/* Main Balance Hero Card */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">رصيدك الأكاديمي الحالي:</span>
              <span className="text-[11px] bg-slate-950 text-amber-300 px-3 py-0.5 rounded-full font-black shadow-xs">
                {tierInfo.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-950">
                {currentPoints.toLocaleString('en-US')}
              </span>
              <span className="text-sm font-black text-amber-950">نقطة مكافأة</span>
            </div>

            <div className="bg-slate-950/15 p-3 rounded-2xl flex items-center justify-between text-xs font-bold border border-slate-950/10">
              <span className="text-amber-950">القيمة النقدية المقابلة للخصم:</span>
              <span className="font-black text-slate-950 bg-white/80 dark:bg-white/90 px-3 py-1 rounded-xl shadow-2xs">
                {formatIqd(equivalentIqd)} خصم متاح
              </span>
            </div>
          </div>

          <Coins className="w-40 h-40 text-amber-400/20 absolute -left-8 -bottom-8 pointer-events-none" />
        </div>

        {/* Daily Check-in Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-orange-200 dark:border-orange-950/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-orange-500/20">
              <Flame className="w-6 h-6 fill-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                تسجيل الحضور اليومي: {profile.dailyStreak || 0} يوم متتالي
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                سجل حضورك كل 24 ساعة واكسب <strong>+15 نقطة مجانية</strong> فوراً
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!canCheckIn}
            onClick={handleDailyCheckIn}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              canCheckIn
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
          >
            {canCheckIn ? 'تسجيل الحضور (+15 نقطة)' : 'تم الحضور اليوم ✓'}
          </button>
        </div>

        {checkInCelebration && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl text-center text-xs font-bold animate-bounce">
            🎉 مبروك! تمت إضافة +15 نقطة لرصيدك الأكاديمي بنجاح!
          </div>
        )}

        {/* Tier Level & Perks */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>مستوى العضوية الأكاديمية:</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${tierInfo.badgeBg}`}>
                {tierInfo.label}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {currentPoints} / {nextTierPoints} نقطة
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
            <div 
              className="bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>ميزة مستواك الحالي: <strong>{tierInfo.perk}</strong></span>
          </div>
        </div>

        {/* Invite a Classmate Referral Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-blue-200 dark:border-blue-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-black text-sm text-slate-900 dark:text-white">
                شارك كودك واكسب 75 نقطة لكل طلب
              </span>
            </div>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              مكافأة زميل
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            شارك كود الدعوة مع زملائك بالكلية والجامعة. عند أول طلب لهم يحصلون على خصم 10% وتحصل أنت على <strong>75 نقطة</strong> تُضاف لمحفظتك!
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full sm:flex-1 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono font-black text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <span>{referralCode}</span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="text-slate-500 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer p-1"
                title="نسخ كود الدعوة"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleShareReferralWhatsApp}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة عبر واتساب</span>
            </button>
          </div>
        </div>

        {/* How to Earn & Redeem Guide */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
          <span className="font-black text-sm text-slate-900 dark:text-white block flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>قواعد استبدال وكسب النقاط الأكاديمية:</span>
          </span>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pr-1">
            <p className="flex items-start gap-2">
              <span className="text-amber-500 font-black">•</span>
              <span><strong>100 نقطة = 1,000 د.ع</strong> خصم مباشر يُطبق في خانة السداد عند طلب أي خدمة.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-black">•</span>
              <span>تكسب <strong>10 نقاط</strong> عن كل 1,000 د.ع تنفقها في خدمات المنقذ الجامعي المعتمدة.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-emerald-500 font-black">•</span>
              <span><strong>50 نقطة مكافأة</strong> عند تقييم الخدمة وكتابة رأيك بعد استلام بحثك أو تقريرك.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-500 font-black">•</span>
              <span>النقاط لا تنتهي صلاحيتها وتتراكم لترقية مستواك الأكاديمي نحو الفئة الماسية VIP.</span>
            </p>
          </div>
        </div>

        {/* Points Transaction History */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>سجل حركات المحفظة:</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {history.length} حركة
            </span>
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
              <Coins className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="font-bold text-slate-600 dark:text-slate-400">لا توجد حركات سابقة بعد</p>
              <p className="text-[11px]">سجل حضورك اليومي أو أنشئ أول طلب لك لتبدأ بجمع النقاط!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((tx) => (
                <div 
                  key={tx.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-1">
                    <span className="font-bold text-slate-900 dark:text-white block truncate text-xs">
                      {tx.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{tx.date}</span>
                  </div>

                  <span className={`font-mono font-black text-xs shrink-0 px-2.5 py-1 rounded-xl ${
                    tx.points > 0 
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800' 
                      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {tx.points > 0 ? `+${tx.points}` : tx.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Order with Points Button */}
        {onStartOrderWithPoints && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartOrderWithPoints();
              }}
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>طلب تكليف جديد وتطبيق خصم النقاط</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}

      </main>

    </div>
  );
};
