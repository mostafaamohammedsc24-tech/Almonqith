import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Clock, 
  CreditCard, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { Order } from '../types';
import { formatIqd } from '../utils/pricing';

interface DetailedReceiptModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder?: () => void;
}

export const DetailedReceiptModal: React.FC<DetailedReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isPaid = order.paymentStatus === 'paid';
  const payMethodName = order.paymentMethod === 'stripe_online' ? 'منصة Stripe العالمية' : 'محفظة زين كاش (ZainCash)';
  const stageArabic = order.stage === 'stage_1' ? 'المرحلة الأولى' : order.stage === 'stage_2' ? 'المرحلة الثانية' : order.stage === 'stage_3' ? 'المرحلة الثالثة' : order.stage === 'stage_4' ? 'المرحلة الرابعة' : 'الدراسات العليا';

  const receiptPlainText = `
══════════════════════════════════════
    منصة المنقذ الجامعي - العراق
  وصل استلام طلب وفاتورة إلكترونية معتمدة
══════════════════════════════════════
رقم الطلب: ${order.orderNumber}
كود التحقق الأكاديمي: ${order.verificationCode || 'VRF-MNQ'}
تاريخ وتوقيت الطلب: ${order.createdAt}
حالة السداد: ${isPaid ? 'مدفوع بالكامل وموثق ✓' : 'بانتظار التحويل والسداد ⏳'}

بيانات الطالب:
• الاسم: ${order.studentName || 'غير مسجل'}
• الهاتف: ${order.studentPhone || 'غير مسجل'}
• الجامعة: ${order.universityName || 'غير محدد'}
• الكلية والقسم: ${order.collegeName || ''} - ${order.departmentName || ''}
• المرحلة: ${stageArabic}

تفاصيل الخدمة الأكاديمية:
• نوع الخدمة: ${order.serviceName}
• عنوان العمل: ${order.title}
• عدد الصفحات/السلايدات: ${order.pageCount}
• الموعد النهائي: ${order.deadlineDisplay}
• التوثيق والمصادر: معتمد أكاديمياً (فحص سرقة علمية 100%)

البيان المالي:
• المبلغ الأساسي: ${formatIqd(order.basePriceIqd)}
• رسوم السرعة والتنسيق: ${formatIqd(order.urgencyFeeIqd + order.formattingFeeIqd)}
• الخصم المالي: ${order.discountIqd > 0 ? formatIqd(order.discountIqd) : 'لا يوجد'}
• الإجمالي النهائي: ${formatIqd(order.totalPriceIqd)}
• طريقة الدفع: ${payMethodName}
• مرجع العملية: ${order.paymentReference || 'سداد مباشر'}

الضمان الأكاديمي:
• ضمان الأصالة وخلو من الاستلال العلمي بنسبة 100%
• تعديلات مجانية لمدة 7 أيام من الاستلام
══════════════════════════════════════
`;

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptPlainText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(receiptPlainText.trim());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col font-['Cairo'] animate-fadeIn overflow-y-auto">
      
      {/* Top Sticky App Bar */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none">
              وصل الطلب الأكاديمي المعتمد
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
              فاتورة رسمية موثقة برقم وتفاصيل العمل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            title="طباعة الوصل"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">طباعة</span>
          </button>

          <button
            type="button"
            onClick={handleCopyReceipt}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            title="نسخ الوصل"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Printable Receipt Sheet */}
      <div className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:p-0">
          
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
            <span className="text-8xl font-black rotate-[-30deg]">المنقذ الجامعي</span>
          </div>

          {/* Official Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-800 to-blue-600 flex items-center justify-center p-2.5 shadow-md text-white">
                <img src="/icon.svg" alt="شعار المنقذ" className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-black text-slate-900 dark:text-white">
                    المنقذ الجامعي
                  </h1>
                  <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    العراق
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                  المنصة الأكاديمية الأولى لإعداد التقارير والبحوث الجامعية
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  بغداد - العراق · دعم مباشر 07740080310
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-left sm:text-right shrink-0">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                وصل استلام رسمي رقم
              </div>
              <div className="text-base font-black text-blue-800 dark:text-blue-400 font-mono tracking-tight">
                {order.orderNumber}
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                كود التحقق: <strong className="text-slate-900 dark:text-white">{order.verificationCode || 'VRF-MNQ'}</strong>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {order.createdAt}
              </div>
            </div>
          </div>

          {/* Payment Status Banner */}
          <div className="my-5 p-3.5 rounded-2xl flex items-center justify-between gap-3 border shadow-2xs ${
            isPaid 
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
              : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }">
            <div className="flex items-center gap-2.5">
              {isPaid ? (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-xs font-black block">
                  {isPaid ? 'حالة السداد: مدفوع بالكامل ومؤكد رسمياً ✓' : 'حالة السداد: بانتظار إتمام الدفع لبدء العمل ⏳'}
                </span>
                <span className="text-[11px] opacity-80 block">
                  طريقة الدفع: {payMethodName} · {order.paymentReference || 'سداد إلكتروني'}
                </span>
              </div>
            </div>

            <div className="text-left shrink-0">
              <span className="text-xs font-mono font-black text-slate-900 dark:text-white block">
                {formatIqd(order.totalPriceIqd)}
              </span>
              <span className="text-[10px] font-bold opacity-75">
                {isPaid ? 'تم التحصيل' : 'مستحق الدفع'}
              </span>
            </div>
          </div>

          {/* Details Grid: Student Info & Order Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Student & Academic Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>بيانات الطالب والأكاديميا</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">اسم الطالب:</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.studentName || 'غير مسجل'}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">رقم الهاتف:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white" dir="ltr">{order.studentPhone || 'غير مسجل'}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">الجامعة:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{order.universityName || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">الكلية والقسم:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{order.collegeName || ''} - {order.departmentName || ''}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">المرحلة الدراسية:</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">{stageArabic}</span>
              </div>
              {order.supervisorName && order.supervisorName !== 'غير محدد' && (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400">المشرف الأكاديمي:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{order.supervisorName}</span>
                </div>
              )}
            </div>

            {/* Order Specification Details */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>مواصفات التكليف الجامعي</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">نوع الخدمة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.serviceName}</span>
              </div>
              <div className="py-0.5">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">عنوان العمل:</span>
                <span className="font-bold text-blue-900 dark:text-blue-300 leading-snug block bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  {order.title}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">عدد الصفحات / الشرائح:</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.pageCount} صفحة</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">الموعد النهائي للتسليم:</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">{order.deadlineDisplay}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 dark:text-slate-400">التوثيق والمراجع:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">معتمد وشامل المصادر</span>
              </div>
            </div>

          </div>

          {/* Financial Breakdown Table */}
          <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="bg-slate-100 dark:bg-slate-800/90 px-4 py-2.5 font-black text-slate-800 dark:text-slate-200 flex justify-between">
              <span>بيان الحساب المالي والرسوم</span>
              <span>المبلغ</span>
            </div>
            <div className="p-4 space-y-2 bg-white dark:bg-slate-900">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>سعر الخدمة الأساسية ({order.serviceName}):</span>
                <span className="font-mono">{formatIqd(order.basePriceIqd)}</span>
              </div>
              {order.formattingFeeIqd > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>رسوم التنسيق الأكاديمي والصفحات الإضافية:</span>
                  <span className="font-mono">+{formatIqd(order.formattingFeeIqd)}</span>
                </div>
              )}
              {order.urgencyFeeIqd > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>رسوم الأولوية والتسليم السريع:</span>
                  <span className="font-mono">+{formatIqd(order.urgencyFeeIqd)}</span>
                </div>
              )}
              {order.discountIqd > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>خصم كوبون أو نقاط مكافأة ({order.couponCode || 'خصم ترويجي'}):</span>
                  <span className="font-mono">-{formatIqd(order.discountIqd)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                <span>المبلغ الإجمالي المستحق:</span>
                <span className="text-base text-blue-800 dark:text-blue-400 font-mono">
                  {formatIqd(order.totalPriceIqd)}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Guarantee & Security Badge */}
          <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-6 h-6 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black text-blue-950 dark:text-blue-200 block">
                ضمان الجودة الأكاديمية والسرقة العلمية 100%
              </span>
              <p className="text-blue-900/80 dark:text-blue-300/80 text-[11px] leading-relaxed">
                هذا الوصل وثيقة إلكترونية رسمية صادرة عن نظام «المنقذ الجامعي». يتعهد الفريق بتسليم العمل وفق معايير الكلية بدقة، مع فحص الاستلال عبر Turnitin، وتوفير حق التعديل المجاني غير المحدود خلال أسبوع من التسليم.
              </p>
            </div>
          </div>

          {/* Digital Signature / Seal Section */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <QrCode className="w-full h-full" />
              </div>
              <div className="text-[10px] text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">كود التوثيق الأكاديمي الرقمي</span>
                <span className="font-mono">{order.orderNumber}::{order.verificationCode}</span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="inline-block px-3 py-1 rounded-xl bg-blue-900 text-amber-300 text-[11px] font-black tracking-wider uppercase border border-amber-400/40 shadow-xs">
                ختم الاعتماد الرقمي ✓
              </div>
              <p className="text-[9px] text-slate-400 mt-1">
                صادر إلكترونياً ولا يتطلب توقيعاً يدوياً
              </p>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 print:hidden">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة الوصل عبر واتساب</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>حفظ أو طباعة PDF</span>
              </button>

              {onTrackOrder && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTrackOrder();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>متابعة الطلب</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
