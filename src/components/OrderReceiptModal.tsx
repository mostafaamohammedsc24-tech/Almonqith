import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Share2, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  Building2, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  CreditCard,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Order } from '../types';
import { formatIqd } from '../utils/pricing';

interface OrderReceiptModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onGoToOrders?: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  onGoToOrders,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const receiptNumber = `REC-${order.orderNumber.replace(/[^0-9]/g, '') || Date.now().toString().slice(-6)}`;
  const isPaid = order.paymentStatus === 'paid';
  const payMethodTitle = order.paymentMethod === 'stripe_online' ? 'منصة Stripe العالمية (دفع بالبطاقة)' : 'محفظة زين كاش (ZainCash)';

  const handleCopyReceipt = () => {
    const text = 
`🧾 وصل استلام وتسديد إلكتروني - المنقذ الجامعي
━━━━━━━━━━━━━━━━━━━
رقم الوصل: ${receiptNumber}
رقم الطلب المرجعي: ${order.orderNumber}
كود التحقق الأكاديمي: ${order.verificationCode || 'VRF-AUTO'}
التاريخ: ${order.createdAt}
━━━━━━━━━━━━━━━━━━━
👤 اسم الطالب: ${order.studentName || 'غير محدد'}
📞 هاتف التواصل: ${order.studentPhone || 'غير محدد'}
🏛 الجامعة: ${order.universityName} - ${order.collegeName}
🔬 القسم: ${order.departmentName}
👨‍🏫 الأستاذ المشرف: ${order.supervisorName || 'لم يحدد'}
━━━━━━━━━━━━━━━━━━━
📄 الخدمة: ${order.serviceName}
📝 العنوان: ${order.title}
⏳ موعد التسليم: ${order.deadlineDisplay}
━━━━━━━━━━━━━━━━━━━
💰 المبلغ الإجمالي: ${formatIqd(order.totalPriceIqd)}
💳 وسيلة الدفع: ${payMethodTitle}
حالة السداد: ${isPaid ? 'مدفوع بالكامل ومؤكد ✅' : 'بانتظار الدفع ⏳'}
المرجع المالي: ${order.paymentReference || '---'}
━━━━━━━━━━━━━━━━━━━
🔒 ضمان الجودة: تعديل مجاني مضمون وفحص استلال أكاديمي معتمد.
منصة المنقذ الجامعي - العراق (07740080310)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = 
`🧾 وصل استلام إلكتروني لطلبي من المنقذ الجامعي:
رقم الطلب: ${order.orderNumber}
كود التحقق: ${order.verificationCode || '---'}
العنوان: ${order.title}
المبلغ: ${formatIqd(order.totalPriceIqd)} (${isPaid ? 'مدفوع بالكامل ✅' : 'بانتظار السداد'})
الوسيلة: ${payMethodTitle}`;

    window.open(`https://wa.me/9647740080310?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center font-['Cairo'] animate-fadeIn overflow-y-auto">
      {/* Full-screen Container on Mobile, max-w-md on desktop */}
      <div className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col sm:rounded-3xl shadow-2xl overflow-hidden sm:border border-slate-200 dark:border-slate-800">
        
        {/* Top Header Bar */}
        <div className="p-3.5 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-['Cairo']">
                وصل إلكتروني رسمي
              </h3>
              <p className="text-[10px] text-blue-200">
                توثيق الطلب والسداد المالي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* Printable Invoice Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3 relative">
            
            {/* Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <GraduationCap className="w-64 h-64 text-blue-900 dark:text-white" />
            </div>

            {/* Receipt Header & Reference Numbers */}
            <div className="flex items-start justify-between pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                  الجمهورية العراقية · خدمات أكاديمية
                </span>
                <h4 className="text-sm font-black text-blue-900 dark:text-blue-400">
                  منصة المنقذ الجامعي
                </h4>
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  رقم الوصل: <strong>{receiptNumber}</strong>
                </span>
              </div>

              <div className="text-left font-mono">
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 font-bold px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 block mb-1">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  كود التحقق: <strong>{order.verificationCode || 'VRF-AUTO'}</strong>
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {order.createdAt}
                </span>
              </div>
            </div>

            {/* Payment Badge Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                    {payMethodTitle}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    مرجع: {order.paymentReference || 'معتمد آلياً'}
                  </span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 ${
                isPaid
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{isPaid ? 'مدفوع بالكامل' : 'بانتظار السداد'}</span>
              </span>
            </div>

            {/* Student & Academic Info */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">اسم الطالب:</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.studentName || 'طالب جامعي'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">هاتف التواصل:</span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400 dir-ltr text-right">{order.studentPhone || '---'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">الجامعة والكلية:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{order.universityName} · {order.collegeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">القسم والمرحلة:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{order.departmentName}</span>
              </div>
              {order.supervisorName && order.supervisorName !== 'غير محدد' && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">الأستاذ المشرف:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{order.supervisorName}</span>
                </div>
              )}
            </div>

            {/* Work & Deliverable Specs */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">الخدمة الأكاديمية:</span>
                <span className="font-bold text-blue-800 dark:text-blue-300">{order.serviceName}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] mb-0.5">عنوان العمل:</span>
                <span className="font-bold text-slate-900 dark:text-white block bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg leading-relaxed">
                  {order.title}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 dark:text-slate-400">موعد التسليم المتفق:</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">{order.deadlineDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">صيغ الملفات المسلمة:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">Word (.docx) + PDF جاهز للطباعة</span>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>السعر الأساسي:</span>
                <span>{formatIqd(order.basePriceIqd || order.totalPriceIqd)}</span>
              </div>

              {order.formattingFeeIqd ? (
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>رسوم التنسيق والتوثيق الأكاديمي:</span>
                  <span>+{formatIqd(order.formattingFeeIqd)}</span>
                </div>
              ) : null}

              {order.urgencyFeeIqd ? (
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                  <span>رسوم الإنجاز السريع:</span>
                  <span>+{formatIqd(order.urgencyFeeIqd)}</span>
                </div>
              ) : null}

              {order.discountIqd ? (
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>الخصم المطبق ({order.couponCode || 'كوبون'}):</span>
                  <span>-{formatIqd(order.discountIqd)}</span>
                </div>
              ) : null}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm font-black">
                <span className="text-slate-900 dark:text-white">المبلغ النهائي الصافي:</span>
                <span className="text-blue-900 dark:text-amber-400 font-mono text-base">
                  {order.totalPriceIqd === 0 ? 'مجاني بالكامل (0 د.ع)' : formatIqd(order.totalPriceIqd)}
                </span>
              </div>
            </div>

            {/* Academic Quality Seal */}
            <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 text-[10px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>الضمان الأكاديمي المعتمد من المنقذ الجامعي:</span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed pr-5">
                تعديل وتدقيق مجاني شامل لملاحظات الدكتور + فحص استلال علمي دقيق + الالتزام بموعد التسليم.
              </p>
            </div>

          </div>

        </div>

        {/* Bottom Actions */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyReceipt}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              title="نسخ نص الوصل"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copied ? 'تم النسخ' : 'نسخ الوصل'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shadow-2xs"
              title="مشاركة عبر واتساب"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">واتساب</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              title="طباعة الوصل"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">طباعة</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onGoToOrders) onGoToOrders();
            }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>متابعة في طلباتي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
