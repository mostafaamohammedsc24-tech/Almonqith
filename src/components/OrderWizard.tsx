import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  FileText, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CreditCard, 
  MessageSquare, 
  Building2, 
  Phone, 
  User, 
  BookOpen,
  Lock,
  CheckCircle2,
  Copy,
  Coins
} from 'lucide-react';
import { 
  ServiceItem, 
  AcademicStage, 
  DeliverySpeed, 
  Order, 
  StudentProfile 
} from '../types';
import { ALL_SERVICES } from '../data/services';
import { IRAQI_UNIVERSITIES } from '../data/universities';
import { calculateOrderPrice, formatIqd, findCoupon, getAdminPricingConfig, incrementCouponUsage } from '../utils/pricing';
import { addPointsTransaction, addNotification } from '../utils/storage';
import { DetailedReceiptModal } from './DetailedReceiptModal';
import { getWhatsAppUrl } from '../utils/links';

interface OrderWizardProps {
  initialServiceId?: string;
  initialParsedData?: any;
  userProfile: StudentProfile;
  onOrderCreated: (newOrder: Order) => void;
  onCancel: () => void;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({
  initialServiceId,
  initialParsedData,
  userProfile,
  onOrderCreated,
  onCancel,
}) => {
  // Service
  const defaultService = ALL_SERVICES.find(s => s.id === (initialParsedData?.serviceId || initialServiceId)) || ALL_SERVICES[0];
  const [selectedService, setSelectedService] = useState<ServiceItem>(defaultService);

  // 1. العنوان
  const [title, setTitle] = useState<string>(initialParsedData?.topic || '');

  // 2. الاسم الثلاثي (مملوء تلقائياً فقط إذا كان مسجلاً مسبقاً، وإلا فارغ تماماً)
  const [studentName, setStudentName] = useState<string>(userProfile.isRegistered ? (userProfile.name || '') : '');

  // 3. اسم الأستاذ المشرف / الدكتور
  const [supervisorName, setSupervisorName] = useState<string>('');

  // 4. الجامعة (فارغة تماماً للزوار الجدد لمنع البيانات التجريبية)
  const [universityName, setUniversityName] = useState<string>(initialParsedData?.universityName || (userProfile.isRegistered ? userProfile.university : ''));

  // 5. الكلية (فارغة للزوار)
  const [collegeName, setCollegeName] = useState<string>(initialParsedData?.collegeName || (userProfile.isRegistered ? userProfile.college : ''));

  // 6. القسم (فارغ للزوار)
  const [departmentName, setDepartmentName] = useState<string>(initialParsedData?.departmentName || (userProfile.isRegistered ? userProfile.department : ''));

  // 7. المرحلة
  const [stage, setStage] = useState<AcademicStage>((initialParsedData?.stage as AcademicStage) || (userProfile.isRegistered ? userProfile.stage : 'stage_1'));

  // 8. رقم الهاتف للتواصل (فارغ تماماً للزوار)
  const [studentPhone, setStudentPhone] = useState<string>(userProfile.isRegistered ? (userProfile.phone || '') : '');

  // Detailed Receipt State after placing order
  const [createdOrderForReceipt, setCreatedOrderForReceipt] = useState<Order | null>(null);

  // 9. ملاحظات الدكتور وتفاصيل التقرير
  const [professorInstructions, setProfessorInstructions] = useState<string>(
    initialParsedData?.professorInstructions || ''
  );
  const [pageCount, setPageCount] = useState<number>(initialParsedData?.pageCount || 10);
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>((initialParsedData?.deliverySpeed as DeliverySpeed) || 'hours_24');

  // 10. كوبونات الخصم (مخفية تماماً عن الواجهة، يدخلها الطالب يدوياً إذا منحته الإدارة كوداً)
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [appliedCouponLabel, setAppliedCouponLabel] = useState<string>('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedAdditionalFeeIds, setSelectedAdditionalFeeIds] = useState<string[]>([]);

  // 10.5 نقاط المكافأة والولاء
  const [usePointsDiscount, setUsePointsDiscount] = useState<boolean>(false);

  const paymentMethod: Order['paymentMethod'] = 'wayl_online';

  // Error validation state
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // University hierarchy lookups (empty if user has not chosen yet)
  const currentUniObj = IRAQI_UNIVERSITIES.find(u => u.name === universityName);
  const availableColleges = currentUniObj ? currentUniObj.colleges : [];
  const currentCollgObj = availableColleges.find(c => c.name === collegeName);
  const availableDepartments = currentCollgObj?.departments || [];

  const handleUniversityChange = (uName: string) => {
    setUniversityName(uName);
    const newUni = IRAQI_UNIVERSITIES.find(u => u.name === uName);
    if (newUni && newUni.colleges.length > 0) {
      const firstCol = newUni.colleges[0];
      setCollegeName(firstCol.name);
      if (firstCol.departments.length > 0) {
        setDepartmentName(firstCol.departments[0].name);
      } else {
        setDepartmentName('');
      }
    } else {
      setCollegeName('');
      setDepartmentName('');
    }
  };

  const handleCollegeChange = (cName: string) => {
    setCollegeName(cName);
    const newCol = availableColleges.find(c => c.name === cName);
    if (newCol && newCol.departments.length > 0) {
      setDepartmentName(newCol.departments[0].name);
    } else {
      setDepartmentName('');
    }
  };

  // Pricing calculation
  const priceData = calculateOrderPrice({
    service: selectedService,
    pageCount: selectedService.category === 'reports_research' ? pageCount : undefined,
    slideCount: selectedService.category === 'presentations' ? pageCount : undefined,
    stage,
    deliverySpeed,
    needsReferences: true,
    referenceCount: 6,
    couponCode: appliedCoupon || undefined,
    useLoyaltyPoints: usePointsDiscount ? (userProfile.loyaltyPoints || 0) : 0,
    additionalFeeIds: selectedAdditionalFeeIds,
  });
  const availableAdditionalFees = getAdminPricingConfig().additionalFees;

  const isFreeFromCoupon = priceData.totalPriceIqd === 0;

  // Apply Coupon (Secret check against admin created coupons and fallback)
  const handleApplyCoupon = () => {
    const clean = couponCode.trim().toUpperCase();
    if (!clean) {
      setCouponError('يرجى كتابة رمز الكوبون أولاً');
      return;
    }
    const adminCoupon = findCoupon(clean);
    if (adminCoupon) {
      setAppliedCoupon(clean);
      setAppliedCouponLabel(adminCoupon.label || `خصم ${adminCoupon.discountPercent}%`);
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setAppliedCouponLabel('');
      setCouponError('عذراً، هذا الكوبون غير موجود بالنظام أو منتهي الصلاحية.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setAppliedCouponLabel('');
    setCouponCode('');
    setCouponError(null);
  };

  // Submit and open WhatsApp with auto-filled message
  const handleSubmitAndSendToWhatsApp = async () => {
    if (!priceData.isUrgentFeasible) {
      setFormError(priceData.unfeasibleReason || 'السرعة المختارة غير متاحة لهذه الخدمة.');
      return;
    }
    if (!title.trim()) {
      setFormError('يرجى كتابة عنوان التقرير أو العمل');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!studentName.trim()) {
      setFormError('يرجى كتابة الاسم الثلاثي');
      return;
    }
    if (!studentPhone.trim()) {
      setFormError('يرجى كتابة رقم الهاتف للتواصل');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    // High quality distinct Order Numbering
    const randomValues = crypto.getRandomValues(new Uint32Array(2));
    const orderNumber = `#MNQ-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const verificationCode = `VRF-${1000 + (randomValues[1] % 9000)}`;

    let deadlineDisplay = 'خلال 24 ساعة (المعيار الطبيعي)';
    if (deliverySpeed === 'hours_6') deadlineDisplay = 'خلال 6 ساعات (عاجل اليوم)';
    else if (deliverySpeed === 'hours_12') deadlineDisplay = 'خلال 12 ساعة (الليلة)';
    else if (deliverySpeed === 'hours_48') deadlineDisplay = 'أكثر من 48 ساعة (موعد مرن - خصم 25%)';
    else if (deliverySpeed === 'normal') deadlineDisplay = 'موعد مرن 3 - 5 أيام (خصم 25%)';

    const isPaid = false;
    const paymentReference = 'بانتظار تأكيد الدفع';

    const stageArabic = stage === 'stage_1' ? 'الأولى' : stage === 'stage_2' ? 'الثانية' : stage === 'stage_3' ? 'الثالثة' : stage === 'stage_4' ? 'الرابعة' : 'الدراسات العليا';
    const payMethodTitle = 'الدفع الإلكتروني';
    const deliveryHours: Record<string, number> = {
      hours_6: 6,
      hours_12: 12,
      hours_24: 24,
      hours_48: 48,
      normal: 120,
    };

    const newOrder: Order = {
      id: `ord-${crypto.randomUUID()}`,
      orderNumber,
      verificationCode,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      studentName: studentName.trim(),
      studentPhone: studentPhone.trim(),
      supervisorName: supervisorName.trim() || 'غير محدد',
      universityName,
      collegeName,
      departmentName,
      stage,
      subjectName: selectedService.name,
      title: title.trim(),
      pageCount,
      language: 'ar',
      fileFormat: ['pdf', 'docx'],
      needsReferences: true,
      professorInstructions: professorInstructions.trim(),
      attachments: [],
      deliverableFiles: [],
      deliverySpeed,
      deadlineDate: new Date(Date.now() + (deliveryHours[deliverySpeed] ?? 24) * 3600 * 1000).toISOString(),
      deadlineDisplay,
      basePriceIqd: priceData.basePriceIqd,
      volumePriceIqd: priceData.volumePriceIqd,
      complexityFeeIqd: priceData.complexityFeeIqd,
      formattingFeeIqd: priceData.formattingFeeIqd,
      referencesFeeIqd: priceData.referencesFeeIqd,
      urgencyFeeIqd: priceData.urgencyFeeIqd,
      flexibleDiscountIqd: priceData.flexibleDiscountIqd,
      pointsDiscountIqd: priceData.pointsDiscountIqd,
      discountIqd: priceData.discountIqd,
      totalPriceIqd: priceData.totalPriceIqd,
      additionalFees: priceData.additionalFees,
      couponCode: appliedCoupon || undefined,
      paymentMethod,
      paymentStatus: isPaid ? 'paid' : 'pending',
      paymentReference,
      paidAt: isPaid ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
      status: isPaid ? 'received' : 'awaiting_payment',
      statusTimeline: [
        { 
          status: 'awaiting_payment', 
          label: isPaid ? 'تم تأكيد السداد بنجاح' : 'بانتظار تأكيد الدفع والسداد', 
          timestamp: 'الآن', 
          completed: isPaid 
        },
        { status: 'received', label: 'تم استلام الطلب وتوثيقه بالنظام', completed: isPaid },
        { status: 'confirmed', label: 'تعيين المشرف الأكاديمي المختص', completed: false },
        { status: 'in_progress', label: 'إعداد وكتابة العمل بدقة', completed: false },
        { status: 'quality_review', label: 'فحص الجودة والتوثيق والسرقة العلمية', completed: false },
        { status: 'ready', label: 'جاهز للاستلام والتنزيل', completed: false },
        { status: 'delivered', label: 'تم التسليم والاعتماد', completed: false },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'system',
          senderName: 'المنقذ الجامعي',
          content: `أهلاً بك زميلنا! تم تسجيل طلبك برقم ${orderNumber} (كود التحقق: ${verificationCode}). ${
            isPaid ? 'حالة السداد: مدفوع بالكامل، تم تكليف الفريق الأكاديمي.' : 'الطلب بانتظار تأكيد السداد لبدء العمل والتسليم.'
          }`,
          timestamp: 'الآن',
        },
      ],
      revisions: [],
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(newOrder),
      });
      let result: unknown;
      try {
        result = await response.json();
      } catch {
        result = null;
      }
      if (!response.ok) {
        const errorMessage = typeof result === 'object' && result !== null &&
          'error' in result && typeof result.error === 'string'
          ? result.error
          : 'تعذر حفظ الطلب على الخادم.';
        throw new Error(errorMessage);
      }
      if (typeof result !== 'object' || result === null || !('id' in result) || result.id !== newOrder.id) {
        throw new Error('استجابة حفظ الطلب من الخادم غير صالحة.');
      }
      Object.assign(newOrder, result);
    } catch (error) {
      console.error('Failed to persist order:', error);
      setFormError(error instanceof Error
        ? error.message
        : 'تعذر حفظ الطلب على الخادم. يرجى المحاولة مجدداً.');
      setIsSubmitting(false);
      return;
    }

    if (appliedCoupon) {
      incrementCouponUsage(appliedCoupon);
    }

    // Points deduction if student redeemed points
    if (priceData.pointsDiscountIqd > 0) {
      const pointsUsed = Math.round(priceData.pointsDiscountIqd / 10);
      addPointsTransaction({
        title: `استبدال نقاط لخصم الطلب ${orderNumber}`,
        points: -pointsUsed,
        type: 'redeem',
        orderNumber,
      });
    }

    // Award loyalty points for placing the order: 10 points per 1,000 IQD
    const pointsEarned = Math.max(15, Math.round(priceData.totalPriceIqd / 100));
    addPointsTransaction({
      title: `مكافأة إتمام طلب ${selectedService.name} (${orderNumber})`,
      points: pointsEarned,
      type: 'earn',
      orderNumber,
    });

    // Send in-app notification
    addNotification({
      title: `تم توثيق طلبك ${orderNumber}`,
      message: `تم تسجيل طلب ${selectedService.name} (${title.trim()}). حالة الدفع: ${isPaid ? 'مدفوع بالكامل' : 'بانتظار السداد'}. كسبت +${pointsEarned} نقطة مكافأة!`,
      type: isPaid ? 'payment' : 'order',
      orderNumber,
      linkView: 'orders',
    });

    // Professional WhatsApp Message with Order Number & Payment Status for Easy Verification
    const waText = 
`السلام عليكم فريق المنقذ الجامعي، أود تأكيد طلبي الأكاديمي التالي:
━━━━━━━━━━━━━━━
📌 رقم الطلب المرجعي: ${orderNumber}
🔐 كود التحقق للمراجعة: ${verificationCode}
💳 حالة السداد: ${isPaid ? `✅ مدفوع بالكامل (${payMethodTitle} - ${paymentReference})` : `⚠️ غير مدفوع (بانتظار السداد عبر ${payMethodTitle})`}
💰 المبلغ المستحق: ${formatIqd(priceData.totalPriceIqd)} ${appliedCoupon ? `(كوبون مطبق: ${appliedCoupon})` : ''}
${priceData.additionalFees.length ? `الإضافات: ${priceData.additionalFees.map(fee => `${fee.label} (${formatIqd(fee.amountIqd)})`).join('، ')}` : ''}
━━━━━━━━━━━━━━━
📄 نوع الخدمة: ${selectedService.name}
📝 عنوان العمل: ${title.trim()}
👤 اسم الطالب: ${studentName.trim()}
📞 رقم هاتف التواصل: ${studentPhone.trim()}
🏛 الجامعة: ${universityName}
🏢 الكلية: ${collegeName}
🔬 القسم: ${departmentName}
🎓 المرحلة: ${stageArabic}
👨‍🏫 الأستاذ المشرف: ${supervisorName.trim() || 'لم يحدد'}
⏳ موعد التسليم: ${deadlineDisplay}
━━━━━━━━━━━━━━━
📋 ملاحظات الدكتور وتفاصيل التقرير:
${professorInstructions.trim() || 'لا توجد ملاحظات إضافية'}
━━━━━━━━━━━━━━━
⚠️ تنبيه: تم حفظ الطلب بالنظام برقم [${orderNumber}] لغرض المراجعة والتحقق والتدقيق الأكاديمي.
يرجى تأكيد الاستلام والمباشرة بالعمل. شكراً لكم!`;

    const waUrl = getWhatsAppUrl(waText);

    // Open WhatsApp
    window.open(waUrl, '_blank');

    setIsSubmitting(false);
    setCreatedOrderForReceipt(newOrder);
  };

  return (
    <div className="max-w-md mx-auto px-3.5 py-4 pb-24 text-slate-900 font-['Cairo']">
      
      {/* Sleek Mobile Form Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 font-['Cairo']">
              طلب خدمة جامعية
            </h1>
            <p className="text-[10px] text-slate-500">
              الخدمة: <strong className="text-blue-700">{selectedService.name}</strong>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/60">
          متابعة عبر واتساب
        </span>
      </div>

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form Fields in Exact Sequence */}
      <div className="space-y-3.5 text-xs">

        {/* 1. العنوان */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="block font-bold text-slate-900 mb-1">
            1. عنوان التقرير أو البحث <span className="text-rose-600">* (مطلوب)</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="اكتب عنوان موضوعك هنا بالضبط..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        {/* 2. الاسم الثلاثي */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-900">
              2. الاسم الثلاثي <span className="text-rose-600">*</span>
            </label>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
              تلقائي من حسابك
            </span>
          </div>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="اسمك الثلاثي كما يظهر في الكلية"
              className="w-full pr-8 pl-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 font-medium bg-slate-50/50"
            />
          </div>
        </div>

        {/* 3. اسم الأستاذ المشرف */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="block font-bold text-slate-900 mb-1">
            3. اسم الأستاذ المشرف أو الدكتور <span className="text-slate-500 font-normal">(اختياري)</span>
          </label>
          <input
            type="text"
            value={supervisorName}
            onChange={(e) => setSupervisorName(e.target.value)}
            placeholder="مثال: أ. د. علي الشمري..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        {/* 4. الجامعة */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-900 dark:text-white text-xs">
              4. الجامعة:
            </label>
            {userProfile.isRegistered && userProfile.university ? (
              <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded font-semibold">
                مملوءة تلقائياً من حسابك
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                اختر من القائمة
              </span>
            )}
          </div>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <select
              value={universityName}
              onChange={(e) => handleUniversityChange(e.target.value)}
              className="w-full pr-8 pl-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-blue-600 font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white cursor-pointer"
            >
              <option value="">-- اختر جامعتك --</option>
              {IRAQI_UNIVERSITIES.map(u => (
                <option key={u.id} value={u.name}>{u.name} ({u.city})</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 & 6. الكلية والقسم */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <label className="block font-bold text-slate-900 dark:text-white text-xs mb-1">
              5. الكلية:
            </label>
            <select
              value={collegeName}
              onChange={(e) => handleCollegeChange(e.target.value)}
              disabled={!universityName}
              className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-[11px] focus:outline-none focus:border-blue-600 font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white disabled:opacity-50 cursor-pointer"
            >
              <option value="">-- اختر الكلية --</option>
              {availableColleges.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <label className="block font-bold text-slate-900 dark:text-white text-xs mb-1">
              6. القسم:
            </label>
            <select
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              disabled={!collegeName}
              className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-[11px] focus:outline-none focus:border-blue-600 font-medium bg-slate-50/50 dark:bg-slate-800 dark:text-white disabled:opacity-50 cursor-pointer"
            >
              <option value="">-- اختر القسم --</option>
              {availableDepartments.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 7. المرحلة */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-900">
              7. المرحلة الدراسية:
            </label>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
              مملوءة تلقائياً
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-center">
            {[
              { id: 'stage_1', label: 'الأولى' },
              { id: 'stage_2', label: 'الثانية' },
              { id: 'stage_3', label: 'الثالثة' },
              { id: 'stage_4', label: 'الرابعة' },
              { id: 'postgrad', label: 'عليا' },
            ].map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStage(st.id as any)}
                className={`py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  stage === st.id
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8. رقم الهاتف للتواصل */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-900">
              8. رقم الهاتف للتواصل <span className="text-rose-600">* (مطلوب)</span>
            </label>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
              لإرسال الطلب عبر واتساب
            </span>
          </div>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              placeholder="077XXXXXXXX أو 078XXXXXXXX"
              className="w-full pr-8 pl-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 font-bold dir-ltr text-right bg-slate-50/50"
            />
          </div>
        </div>

        {/* 9. ملاحظات الدكتور ومواصفات العمل */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="block font-bold text-slate-900 mb-1">
            9. ملاحظات الدكتور وتفاصيل التقرير:
          </label>
          <textarea
            rows={3}
            value={professorInstructions}
            onChange={(e) => setProfessorInstructions(e.target.value)}
            placeholder="اكتب هنا شروط الأستاذ، عدد الكلمات أو الصفحات، نمط التوثيق، الخطوط، أو أي تفاصيل خاصة..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 font-medium"
          />

          {/* Number of Pages / Slides */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span className="font-bold text-slate-800">
              {selectedService.category === 'presentations' ? 'عدد الشرائح المطلوبة:' : 'عدد الصفحات التقريبي:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageCount(Math.max(1, pageCount - 1))}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                -
              </button>
              <span className="font-black text-blue-900 min-w-[30px] text-center text-sm">{pageCount}</span>
              <button
                type="button"
                onClick={() => setPageCount(pageCount + 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Delivery Speed / Date */}
          <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                موعد التسليم المطلوب:
              </label>
              {deliverySpeed === 'hours_48' && (
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 animate-pulse">
                  خصم 25% مطبق فوراً 🎉
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'hours_48', label: 'أكثر من 48 ساعة (موعد مرن)', badge: 'خصم 25% فوري 🎉' },
                { id: 'hours_24', label: 'خلال 24 ساعة (الحد الطبيعي)', badge: 'السعر الأساسي القياسي' },
                { id: 'hours_12', label: 'خلال 12 ساعة (الليلة)', badge: '+25% رسوم استعجال' },
                { id: 'hours_6', label: 'خلال 6 ساعات (أقصى سرعة)', badge: '+50% رسوم استعجال' },
              ].map(speed => (
                <button
                  key={speed.id}
                  type="button"
                  onClick={() => setDeliverySpeed(speed.id as any)}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold text-right transition-all cursor-pointer flex flex-col justify-between ${
                    deliverySpeed === speed.id
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                  }`}
                >
                  <span className="leading-snug">{speed.label}</span>
                  <span className={`text-[9px] mt-1 font-black ${
                    deliverySpeed === speed.id 
                      ? 'text-blue-100' 
                      : speed.id === 'hours_48' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {speed.badge}
                  </span>
                </button>
              ))}
            </div>
            {!priceData.isUrgentFeasible && (
              <p role="alert" className="mt-2 text-[11px] font-bold text-rose-700 dark:text-rose-300">{priceData.unfeasibleReason}</p>
            )}
          </div>

          <p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">أرسل الملفات كمرفقات في محادثة واتساب بعد فتحها؛ لا يتم رفع الملفات أو تخزينها في الموقع حالياً.</p>
        </div>

        {availableAdditionalFees.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">إضافات اختيارية</h3>
            {availableAdditionalFees.map(fee => (
              <label key={fee.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs cursor-pointer">
                <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedAdditionalFeeIds.includes(fee.id)}
                    onChange={event => setSelectedAdditionalFeeIds(current => event.target.checked ? [...current, fee.id] : current.filter(id => id !== fee.id))}
                  />
                  {fee.label}
                </span>
                <strong className="text-slate-700 dark:text-slate-300">+{formatIqd(fee.amountIqd)}</strong>
              </label>
            ))}
          </div>
        )}

        {/* 10. كوبون الخصم الخاص (مخفي تماماً عن الطلاب، يدخل يدوياً فقط إن منحته الإدارة) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="block font-bold text-slate-900 mb-0.5">
            هل لديك كوبون خصم من الإدارة؟
          </label>
          <p className="text-[10px] text-slate-500 mb-2">
            إذا تم تزويدك برمز كوبون خاص من مشرف المنقذ الجامعي، أدخله هنا:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="أدخل كود الكوبون المخصص لك..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors shrink-0"
            >
              تطبيق
            </button>
          </div>

          {appliedCoupon && (
            <div className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم تفعيل الكوبون بنجاح: <strong>{appliedCouponLabel || appliedCoupon}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold underline cursor-pointer ml-2"
              >
                إلغاء
              </button>
            </div>
          )}

          {couponError && (
            <div className="mt-1.5 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{couponError}</span>
            </div>
          )}
        </div>

        {/* 10.5 استبدال نقاط المكافأة الأكاديمية */}
        {(userProfile.loyaltyPoints || 0) > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-2xl border border-amber-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 fill-amber-500/20" />
                <span className="font-extrabold text-xs text-amber-950">
                  استبدال نقاط المكافأة بخصم نقدي:
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-200/70 text-amber-950 px-2 py-0.5 rounded-full">
                رصيدك: {userProfile.loyaltyPoints} نقطة
              </span>
            </div>

            <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 cursor-pointer transition-colors hover:bg-amber-50/50">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={usePointsDiscount}
                  onChange={(e) => setUsePointsDiscount(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-800">
                  استخدام نقاطي لتخفيض التكلفة (كل 100 نقطة = 1,000 د.ع)
                </span>
              </div>
              {usePointsDiscount && priceData.pointsDiscountIqd > 0 && (
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  -{formatIqd(priceData.pointsDiscountIqd)}
                </span>
              )}
            </label>
          </div>
        )}

        {/* Wayl payment status */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900">
              وسيلة الدفع:
            </label>
            <span className="text-[10px] text-slate-500 font-bold">
              Wayl
            </span>
          </div>
          <p className="text-xs text-amber-800">
            ستُعرض خيارات الدفع الإلكتروني عند تفعيلها. لا ترسل بيانات بطاقتك عبر واتساب.
          </p>

        </div>

        {/* Pricing Summary Box */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
            <span>السعر الأساسي والتنسيق:</span>
            <span className="font-semibold text-white">{formatIqd(priceData.subtotalIqd)}</span>
          </div>

          {priceData.flexibleDiscountIqd > 0 && (
            <div className="flex items-center justify-between text-xs text-emerald-400 py-1.5 border-b border-slate-800 font-bold">
              <span>خصم الموعد المرن (+48 ساعة 25%):</span>
              <span className="font-mono">-{formatIqd(priceData.flexibleDiscountIqd)}</span>
            </div>
          )}

          {priceData.discountIqd > priceData.flexibleDiscountIqd && (
            <div className="flex items-center justify-between text-xs text-emerald-400 py-1.5 border-b border-slate-800 font-bold">
              <span>خصم الكوبون الأكاديمي ({appliedCoupon || 'كوبون'}):</span>
              <span className="font-mono">-{formatIqd(priceData.discountIqd - priceData.flexibleDiscountIqd)}</span>
            </div>
          )}

          {priceData.pointsDiscountIqd > 0 && (
            <div className="flex items-center justify-between text-xs text-amber-300 py-1.5 border-b border-slate-800 font-bold">
              <span>خصم نقاط المكافأة الأكاديمية:</span>
              <span>-{formatIqd(priceData.pointsDiscountIqd)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-[10px] text-slate-400 block">المبلغ النهائي المستحق:</span>
              <span className="text-xl font-black text-amber-400 font-['Cairo']">
                {priceData.totalPriceIqd === 0 ? 'مجاني بالكامل (0 د.ع)' : formatIqd(priceData.totalPriceIqd)}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-emerald-400 block font-bold">تعديل مجاني مضمون</span>
              <span className="text-[10px] text-slate-400">ملفات Word + PDF</span>
            </div>
          </div>
        </div>

        {/* 12. Submit the request and open WhatsApp */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmitAndSendToWhatsApp}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-400 disabled:shadow-none text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-98"
          >
            <MessageSquare className="w-5 h-5" />
            <span>
              {isSubmitting ? 'جاري تجهيز الطلب...' : 'إرسال الطلب عبر واتساب'}
            </span>
          </button>

          <p className="text-[10px] text-center text-slate-500 mt-2">
            بالنقر على الزر، سيتم توليد رقم الطلب المرجعي وحفظه بالنظام وإرسال كافة البيانات لواتساب الإدارة فوراً.
          </p>
        </div>

      </div>

      {/* Official Detailed Receipt Modal after order submission */}
      {createdOrderForReceipt && (
        <DetailedReceiptModal
          order={createdOrderForReceipt}
          isOpen={!!createdOrderForReceipt}
          onClose={() => {
            const ord = createdOrderForReceipt;
            setCreatedOrderForReceipt(null);
            onOrderCreated(ord);
          }}
          onTrackOrder={() => {
            const ord = createdOrderForReceipt;
            setCreatedOrderForReceipt(null);
            onOrderCreated(ord);
          }}
        />
      )}

    </div>
  );
};
