import React, { useState } from 'react';
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Download, 
  Send, 
  RotateCcw, 
  Star, 
  ShieldCheck, 
  Building2, 
  Paperclip, 
  AlertCircle,
  MessageSquare,
  FileCheck2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Order, OrderMessage, RevisionRequest } from '../types';
import { formatIqd } from '../utils/pricing';
import { DetailedReceiptModal } from './DetailedReceiptModal';
import { getWhatsAppUrl } from '../utils/links';

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
  onUpdateOrder: (updatedOrder: Order) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onBack,
  onUpdateOrder,
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailedReceipt, setShowDetailedReceipt] = useState(false);
  const [revisionType, setRevisionType] = useState<RevisionRequest['type']>('professor_notes');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [rating, setRating] = useState(order.rating || 5);
  const [reviewComment, setReviewComment] = useState(order.reviewComment || '');
  const [reviewSubmitted, setReviewSubmitted] = useState(!!order.rating);

  const handleContactPaymentSupport = () => {
    const message = `أرغب بالاستفسار عن الدفع لطلبي ${order.orderNumber}\nالطالب: ${order.studentName || 'غير محدد'}\nالمبلغ: ${formatIqd(order.totalPriceIqd)}\nبوابة Wayl غير مفعّلة حالياً.`;
    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    setShowPaymentModal(false);
  };

  // Send message in order chat
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: OrderMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      senderName: 'أنت (الطالب)',
      content: chatMessage.trim(),
      timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...order.messages, newMessage];
    
    const updatedOrder = {
      ...order,
      messages: updatedMessages,
    };
    onUpdateOrder(updatedOrder);
    setChatMessage('');

  };

  // Submit revision request
  const handleSubmitRevision = () => {
    if (!revisionNotes.trim()) {
      alert('يرجى كتابة ملاحظات التعديل بالتفصيل');
      return;
    }

    const newRevision: RevisionRequest = {
      id: `rev-${Date.now()}`,
      requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: revisionType,
      notes: revisionNotes.trim(),
      status: 'pending',
    };

    const updatedTimeline = order.statusTimeline.map(item => {
      if (item.status === 'ready' || item.status === 'delivered') {
        return { ...item, completed: false };
      }
      return item;
    });

    const updatedOrder: Order = {
      ...order,
      status: 'revision',
      statusTimeline: updatedTimeline,
      revisions: [...order.revisions, newRevision],
      messages: [
        ...order.messages,
        {
          id: `msg-rev-${Date.now()}`,
          sender: 'system',
          senderName: 'نظام التعديلات',
          content: `طلب الطالب تعديلاً جديداً: "${revisionNotes.trim()}". جاري تطبيق الملاحظات فوراً.`,
          timestamp: 'الآن',
        },
      ],
    };

    onUpdateOrder(updatedOrder);
    setShowRevisionModal(false);
    setRevisionNotes('');
  };

  // Submit review
  const handleSaveReview = () => {
    const updatedOrder: Order = {
      ...order,
      rating,
      reviewComment,
    };
    onUpdateOrder(updatedOrder);
    setReviewSubmitted(true);
  };

  // Status badge helper
  const getStatusBadge = () => {
    switch (order.status) {
      case 'awaiting_payment':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>بانتظار الدفع / السداد</span>
          </span>
        );
      case 'received':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md">تم استلام وتأكيد الطلب</span>;
      case 'confirmed':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">تم تأكيد التفاصيل</span>;
      case 'in_progress':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-md">قيد التنفيذ الأكاديمي</span>;
      case 'quality_review':
        return <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-md">مراجعة الجودة (QA)</span>;
      case 'ready':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md">جاهز للاستلام والتنزيل</span>;
      case 'delivered':
        return <span className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-md">تم التسليم والاعتماد</span>;
      case 'revision':
        return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-md">قيد التعديل المجاني</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-3.5 py-4 pb-24 font-['Cairo']">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>رجوع لطلباتي</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDetailedReceipt(true)}
            className="flex items-center gap-1 text-xs font-black text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 bg-blue-50 dark:bg-blue-950 px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-2xs"
            title="عرض الوصل المفصل والفاتورة"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الوصل المفصل 🧾</span>
          </button>
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Order Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <span>طلب رقم:</span>
              <strong className="text-slate-900 dark:text-white text-sm font-mono">{order.orderNumber}</strong>
              <span>· تاريخ الإنشاء: {order.createdAt}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-['Cairo']">
              {order.title || order.serviceName}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              الخدمة: <strong className="text-blue-900 dark:text-blue-400">{order.serviceName}</strong> · 
              الموعد النهائي: <strong className="text-rose-700 dark:text-rose-400">{order.deadlineDisplay}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {order.status === 'awaiting_payment' ? 'المبلغ المطلوب سداده:' : 'إجمالي السعر المدفوع:'}
            </span>
            <span className={`text-xl font-extrabold ${order.status === 'awaiting_payment' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {formatIqd(order.totalPriceIqd)}
            </span>
            
            {/* إتمام الدفع button in header only if awaiting_payment */}
            {order.status === 'awaiting_payment' ? (
              <div className="mt-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>إتمام الدفع</span>
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
                ✓ تم تأكيد الدفع عبر التحويل اليدوي
                {order.verificationCode && <span className="block font-mono text-[10px] text-slate-500 dark:text-slate-400">كود التحقق: {order.verificationCode}</span>}
              </span>
            )}
          </div>
        </div>

        {/* Priority Banner: Appears ONLY when awaiting_payment */}
        {order.status === 'awaiting_payment' && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-sm block text-amber-950">
                  طلبك بانتظار إتمام السداد لبدء التنفيذ فوراً
                </span>
                <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                  تم حجز مواصفات عملك وبيانات كليتك بنجاح. بمجرد إتمام الدفع بمبلغ <strong>{formatIqd(order.totalPriceIqd)}</strong>، سيتولى الكاتب الأكاديمي مباشرة تجهيز التقرير وفق الموعد المحدد.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>إتمام الدفع الآن ({formatIqd(order.totalPriceIqd)})</span>
            </button>
          </div>
        )}

        {/* Dynamic Status Timeline with awaiting_payment support */}
        <div className="pt-6">
          <span className="text-xs font-bold text-slate-700 block mb-4">
            مراحل تقدم العمل وضمان الجودة الأكاديمية:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {order.statusTimeline.map((step, idx) => {
              const isCurrentStep = step.status === order.status;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    step.completed
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                      : isCurrentStep && step.status === 'awaiting_payment'
                      ? 'bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-200'
                      : 'bg-slate-50/60 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold ${
                    step.completed 
                      ? 'bg-blue-700 text-white' 
                      : isCurrentStep && step.status === 'awaiting_payment'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-xs font-bold block leading-snug">
                    {step.label}
                  </span>
                  {step.timestamp && (
                    <span className="text-[10px] text-slate-500 block mt-1">{step.timestamp}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Details & Deliverables on left, Chat & Revisions on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Academic Metadata & Final Deliverables (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Deliverables / Final Files Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <span>ملفات العمل الجاهزة للتسليم والتنزيل</span>
              </h2>
              {order.status === 'delivered' || order.status === 'ready' ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  جاهز للتحميل
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  قيد التجهيز والمراجعة
                </span>
              )}
            </div>

            {order.deliverableFiles && order.deliverableFiles.length > 0 ? (
              <div className="space-y-3">
                {order.deliverableFiles.map(file => (
                  <div
                    key={file.id}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{file.name}</span>
                        <span className="text-xs text-slate-500">{file.size} · تم التدقيق الأكاديمي</span>
                      </div>
                    </div>

                    <a
                      href="#download"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`جاري تحميل ملف "${file.name}"... تم فحص الملف وهو جاهز للتسليم لأستاذك.`);
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل الملف</span>
                    </a>
                  </div>
                ))}

                {/* Revision & Review Actions */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>طلب تعديل مجاني (ملاحظات الأستاذ)</span>
                  </button>

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ضمان تعديل مجاني متاح لمدة 14 يوماً</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2 animate-pulse" />
                <span className="text-sm font-bold text-slate-800 block">
                  العمل قيد التجهيز الأكاديمي والتدقيق
                </span>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  يقوم الفريق التخصصي بكتابة التقرير وضبط المراجع والتنسيق. ستظهر الملفات هنا فور اعتمادها قبل موعدك النهائي.
                </p>
              </div>
            )}
          </div>

          {/* Academic & Order Specification Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              <span>المعلومات الأكاديمية ومواصفات الطلب</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5">الجامعة والكلية:</span>
                <strong className="text-slate-900 text-sm">{order.universityName}</strong>
                <p className="text-slate-700 mt-0.5">{order.collegeName} - {order.departmentName}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5">المرحلة والمادة:</span>
                <strong className="text-slate-900 text-sm">
                  {order.stage === 'postgrad' ? 'الدراسات العليا' : `المرحلة ${order.stage.replace('stage_', '')}`}
                </strong>
                <p className="text-slate-700 mt-0.5">{order.subjectName}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5">الحجم واللغة:</span>
                <strong className="text-slate-900">
                  {order.pageCount ? `${order.pageCount} صفحة` : order.slideCount ? `${order.slideCount} شريحة` : 'مشروع متكامل'}
                </strong>
                <p className="text-slate-700 mt-0.5">اللغة: {order.language === 'ar' ? 'العربية' : order.language === 'en' ? 'الإنجليزية' : 'الكردية'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5">المراجع ونمط التوثيق:</span>
                <strong className="text-slate-900">
                  {order.needsReferences ? `${order.citationStyle || 'IEEE'} (${order.referenceCount || 5} مراجع)` : 'بدون مراجع'}
                </strong>
                <p className="text-slate-700 mt-0.5">الصيغ المطلوبة: {order.fileFormat.join(', ').toUpperCase()}</p>
              </div>
            </div>

            {/* Professor Instructions box */}
            {order.professorInstructions && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">تعليمات دكتور المادة المعتمدة:</span>
                <p className="text-amber-800 leading-relaxed">{order.professorInstructions}</p>
              </div>
            )}

            {/* Student Uploaded Files */}
            {order.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  الملفات التي قمت برفعها ({order.attachments.length}):
                </span>
                <div className="space-y-1.5">
                  {order.attachments.map(att => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-800">{att.name}</span>
                        <span className="text-[11px] text-slate-500">({att.size})</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        معتمد للتنفيذ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Review & Rating Card */}
          {(order.status === 'delivered' || order.status === 'ready') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>تقييمك لجودة الخدمة وتسليم العمل</span>
              </h2>

              {reviewSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <span className="font-bold block mb-1">شكراً لتقييمك! تقييمك يساعد طلاب جامعتك:</span>
                  <div className="flex items-center gap-1 my-1">
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star key={st} className={`w-4 h-4 ${st <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  {reviewComment && <p className="italic mt-1">"{reviewComment}"</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">تقييمك العام:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setRating(st)}
                          className="p-1 cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${st <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="اكتب رأيك بصراحة: هل كان التسليم بالوقت؟ هل التنسيق طابق شروط الأستاذ؟"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />

                  <button
                    onClick={handleSaveReview}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    حفظ التقييم وكسب 50 نقطة ولاء
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Order Chat & Assigned Specialist (1 col) */}
        <div className="space-y-6">
          
          {/* Assigned Worker / Specialist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">المشرف الأكاديمي المسؤول:</span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-base">
                {(order.assignedWorker?.name || 'فريق العمل')[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {order.assignedWorker?.name || 'فريق التنسيق الأكاديمي'}
                </h3>
                <span className="text-xs text-blue-700 font-semibold block">
                  {order.assignedWorker?.role || 'Academic Specialist'}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">● متصل الآن لمتابعة طلبك</span>
              </div>
            </div>
          </div>

          {/* Dedicated Order Chat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-slate-900">محادثة الطلب المباشرة</span>
              </div>
              <span className="text-[10px] text-slate-500">مشفرة وخاصة</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {order.messages.map(msg => {
                const isStudent = msg.sender === 'student';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="inline-block bg-slate-100 text-slate-600 text-[11px] px-3 py-1 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-500">
                      <span>{msg.senderName}</span>
                      <span>· {msg.timestamp}</span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        isStudent
                          ? 'bg-blue-700 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="pt-3 border-t border-slate-100 mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="اكتب ملاحظتك أو استفسارك هنا..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 text-white rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 font-['Cairo'] mb-2">
              طلب تعديل مجاني على العمل
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              نحن نلتزم بتطبيق كافة ملاحظات أستاذك بدقة ودون أي تكلفة إضافية.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع التعديل المطلوب:</label>
                <select
                  value={revisionType}
                  onChange={(e) => setRevisionType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
                >
                  <option value="professor_notes">تطبيق ملاحظات الأستاذ بعد التدقيق</option>
                  <option value="content">تعديل أو إعادة صياغة بالمحتوى</option>
                  <option value="formatting">تعديل الخطوط والتنسيق والهوامش</option>
                  <option value="extra_pages">إضافة صفحات أو فقرات جديدة</option>
                  <option value="references">تغيير أو زيادة المراجع والمصادر</option>
                  <option value="presentation">تعديل شرائح العرض والألوان</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اكتب ملاحظات الأستاذ بالتفصيل:
                </label>
                <textarea
                  rows={4}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="مثال: «الأستاذ قال إن المقدمة قصيرة ويجب إضافة 3 مصادر وتعديل المخطط في الصفحة 6»..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                ⚡ يبدأ فريق التعديل الأكاديمي العمل فور إرسال النموذج ويتم تسليم النسخة المعدلة خلال ساعات.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSubmitRevision}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
              >
                إرسال للتعديل الفوري
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Completion Modal (Appears when student clicks إتمام الدفع) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-['Cairo']">
                  إتمام سداد الطلب {order.orderNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  الخدمة: {order.serviceName} · {order.universityName}
                </p>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-500 block">المبلغ الإجمالي:</span>
                <span className="text-lg font-black text-blue-900 font-['Cairo']">
                  {formatIqd(order.totalPriceIqd)}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="block font-bold text-slate-900">الدفع عبر Wayl غير متاح حالياً</span>
                <span className="block text-[11px] text-slate-600">لم يتم ربط بوابة الدفع بالخادم بعد. لن تتغير حالة الطلب إلى مدفوع عبر إدخال مرجع يدوي.</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>تواصل مع الدعم عبر واتساب للاستفسار عن الدفع. لا ترسل بيانات بطاقتك في المحادثة.</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleContactPaymentSupport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  التواصل مع الدعم عبر واتساب
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Receipt Modal */}
      {showDetailedReceipt && (
        <DetailedReceiptModal
          order={order}
          isOpen={showDetailedReceipt}
          onClose={() => setShowDetailedReceipt(false)}
        />
      )}

    </div>
  );
};
