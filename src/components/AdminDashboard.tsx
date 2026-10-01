import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  Search, 
  Filter, 
  Tag, 
  Star, 
  Settings, 
  Plus, 
  Edit, 
  Eye, 
  Send, 
  Building2, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Lock,
  Phone,
  ToggleLeft,
  ToggleRight,
  Share2
} from 'lucide-react';
import { Order, OrderStatus, Worker, WorkerRole } from '../types';
import { WORKERS_TEAM } from '../data/mockOrders';
import { ALL_SERVICES } from '../data/services';
import { IRAQI_UNIVERSITIES } from '../data/universities';
import { 
  formatIqd, 
  getAdminCoupons, 
  addAdminCoupon, 
  deleteAdminCoupon, 
  toggleAdminCouponActive, 
  AdminCoupon 
} from '../utils/pricing';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  onExitAdmin: () => void;
  onViewOrderDetails: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateOrder,
  onExitAdmin,
  onViewOrderDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'workers' | 'services' | 'universities' | 'coupons'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [workersList, setWorkersList] = useState<Worker[]>(WORKERS_TEAM);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);

  // Copied states for feedback
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Dynamic Coupons State (managed strictly by admin)
  const [adminCoupons, setAdminCoupons] = useState<AdminCoupon[]>(getAdminCoupons());
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent' | 'fixed'>('percent');
  const [newCouponPercent, setNewCouponPercent] = useState<number>(100);
  const [newCouponAmount, setNewCouponAmount] = useState<number>(10000);
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState<number>(1000000);
  const [newCouponNote, setNewCouponNote] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  // Handle Create Coupon by Admin
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCouponCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) return;

    const isFixed = newCouponType === 'fixed';
    const label = isFixed 
      ? `خصم ${formatIqd(newCouponAmount)} (${cleanCode})`
      : newCouponPercent === 100 
      ? `كوبون مجاني 100% (${cleanCode})`
      : `كوبون خصم ${newCouponPercent}% (${cleanCode})`;

    const newCoupon: AdminCoupon = {
      code: cleanCode,
      discountType: newCouponType,
      discountPercent: isFixed ? 0 : newCouponPercent,
      discountAmountIqd: isFixed ? newCouponAmount : undefined,
      maxDiscountIqd: isFixed ? newCouponAmount : (newCouponPercent === 100 ? 1000000 : newCouponMaxDiscount),
      label,
      createdAt: new Date().toISOString().slice(0, 10),
      active: true,
      note: newCouponNote.trim() || (newCouponPercent === 100 ? 'منحة مجانية 100% صادرة من الإدارة' : `كوبون تخفيض ${newCouponPercent}%`),
      usageCount: 0,
    };

    addAdminCoupon(newCoupon);
    setAdminCoupons(getAdminCoupons());
    setNewCouponCode('');
    setNewCouponNote('');
    setCouponSuccessMsg(`تم بنجاح إنتاج وتفعيل الكوبون "${cleanCode}" في النظام!`);
    setTimeout(() => setCouponSuccessMsg(null), 3500);
  };

  const handleDeleteCoupon = (code: string) => {
    if (confirm(`هل أنت متأكد من حذف الكوبون "${code}"؟ لن يتمكن الطلاب من استخدامه بعد الآن.`)) {
      deleteAdminCoupon(code);
      setAdminCoupons(getAdminCoupons());
    }
  };

  const handleToggleCouponActive = (code: string) => {
    toggleAdminCouponActive(code);
    setAdminCoupons(getAdminCoupons());
  };

  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 1500);
  };

  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrderNumber(orderNumber);
    setTimeout(() => setCopiedOrderNumber(null), 1500);
  };

  const handleGenerateRandomCode = (percent: number) => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const prefix = percent === 100 ? 'FREE' : percent === 50 ? 'SAVE' : 'MNQ';
    setNewCouponCode(`${prefix}${randomNum}`);
    setNewCouponType('percent');
    setNewCouponPercent(percent);
    setNewCouponMaxDiscount(percent === 100 ? 1000000 : 500000);
  };

  // Share Coupon with Student via WhatsApp
  const handleShareCouponWhatsApp = (coupon: AdminCoupon) => {
    const discountText = coupon.discountType === 'fixed'
      ? `خصم ${formatIqd(coupon.discountAmountIqd || 0)}`
      : coupon.discountPercent === 100 ? 'خصم 100% (مجاني بالكامل)' : `خصم ${coupon.discountPercent}%`;

    const text = 
`أهلاً بك زميلنا! 🎓
يسر إدارة «المنقذ الجامعي» تزويدك بكوبون خصم أكاديمي خاص:
━━━━━━━━━━━━━━━
🎟 رمز الكوبون: ${coupon.code}
🎁 قيمة الخصم: ${discountText}
📝 التفاصيل: ${coupon.note || coupon.label}
━━━━━━━━━━━━━━━
طريقة الاستخدام:
1. افتح منصة المنقذ الجامعي واختر خدمتك.
2. في خانة "كوبون الخصم الخاص"، أدخل الرمز [${coupon.code}] واضغط "تطبيق".
3. سيتم تطبيق الخصم فوراً وتحديث التكلفة.

بالتوفيق في مسيرتك الجامعية!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Toggle Payment Status on Order
  const handleTogglePaymentStatus = (order: Order) => {
    const isNowPaid = order.paymentStatus !== 'paid';
    const updatedTimeline = order.statusTimeline.map(step => {
      if (step.status === 'awaiting_payment' || step.status === 'received') {
        return { ...step, completed: isNowPaid, timestamp: 'الآن' };
      }
      return step;
    });

    const updatedOrder: Order = {
      ...order,
      paymentStatus: isNowPaid ? 'paid' : 'pending',
      paidAt: isNowPaid ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
      status: isNowPaid && order.status === 'awaiting_payment' ? 'received' : order.status,
      statusTimeline: updatedTimeline,
      messages: [
        ...order.messages,
        {
          id: `msg-pay-admin-${Date.now()}`,
          sender: 'system',
          senderName: 'المشرف العام',
          content: isNowPaid 
            ? `قام المشرف بتأكيد استلام السداد بنجاح (${order.paymentMethod === 'stripe_online' ? 'منصة Stripe' : 'زين كاش'}). الطلب قيد التجهيز.`
            : 'تم تغيير حالة السداد إلى: بانتظار الدفع.',
          timestamp: 'الآن',
        },
      ],
    };

    onUpdateOrder(updatedOrder);
  };

  // Open Direct WhatsApp with Student about this exact Order
  const handleChatWithStudentWhatsApp = (order: Order) => {
    const cleanPhone = (order.studentPhone || '').replace(/\D/g, '');
    let fullPhone = cleanPhone;
    if (fullPhone.startsWith('0')) {
      fullPhone = '964' + fullPhone.slice(1);
    }
    const msg = 
`مرحباً زميلنا ${order.studentName || ''}!
بخصوص طلبك لدى المنقذ الجامعي برقم: ${order.orderNumber}
كود التحقق: ${order.verificationCode || '---'}
حالة الدفع المسجلة: ${order.paymentStatus === 'paid' ? 'مدفوع بالكامل ✅' : 'بانتظار تأكيد الدفع ⏳'}`;

    window.open(`https://wa.me/${fullPhone || '9647740080310'}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Statistics calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalPriceIqd : 0), 0);
  const paidCount = orders.filter(o => o.paymentStatus === 'paid').length;
  const unpaidCount = orders.filter(o => o.paymentStatus === 'pending' || o.status === 'awaiting_payment').length;
  const inProgressCount = orders.filter(o => ['in_progress', 'confirmed', 'quality_review', 'revision'].includes(o.status)).length;
  const urgentCount = orders.filter(o => o.deliverySpeed === 'hours_6' || o.deliverySpeed === 'hours_12').length;

  // Filtered orders with search and payment filters
  const filteredOrders = orders.filter(o => {
    // Payment filter
    if (paymentFilter === 'paid' && o.paymentStatus !== 'paid') return false;
    if (paymentFilter === 'pending' && o.paymentStatus === 'paid') return false;

    // Procedural status filter
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    // Search query: Order number, Verification code, payment reference, student name, phone, title
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (o.verificationCode && o.verificationCode.toLowerCase().includes(q)) ||
        (o.paymentReference && o.paymentReference.toLowerCase().includes(q)) ||
        (o.studentName && o.studentName.toLowerCase().includes(q)) ||
        (o.studentPhone && o.studentPhone.toLowerCase().includes(q)) ||
        o.title.toLowerCase().includes(q) ||
        o.universityName.toLowerCase().includes(q) ||
        o.serviceName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    const updatedTimeline = order.statusTimeline.map(step => {
      if (step.status === newStatus) {
        return { ...step, completed: true, timestamp: 'الآن' };
      }
      return step;
    });

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      statusTimeline: updatedTimeline,
      messages: [
        ...order.messages,
        {
          id: `msg-sys-${Date.now()}`,
          sender: 'system',
          senderName: 'نظام الإدارة',
          content: `تم تحديث حالة الطلب إلى: ${
            newStatus === 'in_progress' ? 'قيد التنفيذ الأكاديمي' :
            newStatus === 'quality_review' ? 'مراجعة الجودة والتدقيق (QA)' :
            newStatus === 'ready' ? 'جاهز للاستلام والتنزيل' :
            newStatus === 'delivered' ? 'تم التسليم والاعتماد' : newStatus
          }`,
          timestamp: 'الآن',
        },
      ],
    };

    onUpdateOrder(updatedOrder);
  };

  const handleAssignWorker = (workerId: string) => {
    if (!selectedOrderForAssign) return;
    const worker = workersList.find(w => w.id === workerId);
    if (!worker) return;

    const updatedOrder: Order = {
      ...selectedOrderForAssign,
      assignedWorker: {
        id: worker.id,
        name: worker.name,
        role: worker.role,
      },
      status: selectedOrderForAssign.status === 'received' ? 'confirmed' : selectedOrderForAssign.status,
      messages: [
        ...selectedOrderForAssign.messages,
        {
          id: `msg-as-${Date.now()}`,
          sender: 'team',
          senderName: worker.name,
          content: `مرحباً، تم تعييني لمتابعة طلبك الأكاديمي (${worker.specialty}). سننجزه بأعلى دقة.`,
          timestamp: 'الآن',
        },
      ],
    };

    onUpdateOrder(updatedOrder);
    setSelectedOrderForAssign(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-['Cairo'] pb-16">
      
      {/* Top Admin Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white font-['Cairo']">
                  لوحة تحكم المنقذ الجامعي
                </h1>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700">
                  المشرف الأكاديمي (07740080310)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                إدارة الطلبات، تدقيق عمليات الدفع الإلكتروني (زين كاش & Stripe)، وإنتاج الكوبونات
              </p>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>خروج لواجهة الطالب</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Statistics & KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي الطلبات:</span>
            <span className="text-2xl font-black text-white font-mono">{orders.length}</span>
            <span className="text-[10px] text-blue-400 block mt-1">مسجلة بالنظام</span>
          </div>

          <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/60">
            <span className="text-[11px] text-emerald-300 block mb-1">الطلبات المدفوعة:</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{paidCount}</span>
            <span className="text-[10px] text-emerald-400 block mt-1">✅ تم تأكيد السداد</span>
          </div>

          <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-800/60">
            <span className="text-[11px] text-amber-300 block mb-1">بانتظار الدفع:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{unpaidCount}</span>
            <span className="text-[10px] text-amber-400 block mt-1">⏳ قيد التحقق المالي</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-1">قيد التنفيذ:</span>
            <span className="text-2xl font-black text-blue-400 font-mono">{inProgressCount}</span>
            <span className="text-[10px] text-blue-300 block mt-1">مع الأساتذة والكتاب</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي المقبوضات:</span>
            <span className="text-lg font-black text-emerald-400">{formatIqd(totalRevenue)}</span>
            <span className="text-[10px] text-slate-400 block mt-1">زين كاش & Stripe</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block mb-1">الكوبونات النشطة:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{adminCoupons.filter(c => c.active).length}</span>
            <span className="text-[10px] text-amber-300 block mt-1">صادرة من الإدارة</span>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'orders', label: `إدارة الطلبات (${orders.length})`, icon: ShoppingBag },
            { id: 'coupons', label: `إنتاج وإدارة الكوبونات (${adminCoupons.length})`, icon: Tag },
            { id: 'workers', label: `فريق العمل الأكاديمي (${workersList.length})`, icon: Users },
            { id: 'services', label: `دليل الخدمات والأسعار (${ALL_SERVICES.length})`, icon: FileText },
            { id: 'universities', label: `الجامعات والكليات (${IRAQI_UNIVERSITIES.length})`, icon: Building2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Orders Management & Payment Verification */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Payment Filter & Search Bar */}
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Payment Status Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs text-slate-400 font-bold ml-1">حالة السداد:</span>
                  {[
                    { id: 'all', label: `كافة الطلبات (${orders.length})` },
                    { id: 'paid', label: `مدفوعة بالكامل ✅ (${paidCount})` },
                    { id: 'pending', label: `بانتظار الدفع ⏳ (${unpaidCount})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setPaymentFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        paymentFilter === f.id
                          ? f.id === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : f.id === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-750 border border-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Search by Order Number / Ref / Phone / Name */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث برقم الطلب #MNQ- أو الهاتف أو الاسم..."
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Status Timeline Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-700/60 text-xs">
                <span className="text-slate-400 text-[11px] font-bold ml-1">المرحلة الإجرائية:</span>
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'awaiting_payment', label: 'بانتظار الدفع' },
                  { id: 'received', label: 'مستلم / مؤكد' },
                  { id: 'in_progress', label: 'قيد التنفيذ' },
                  { id: 'quality_review', label: 'تدقيق QA' },
                  { id: 'ready', label: 'جاهز للاستلام' },
                  { id: 'delivered', label: 'تم التسليم' },
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === st.id
                        ? 'bg-slate-200 text-slate-950'
                        : 'bg-slate-900/70 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-700 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">رقم الطلب والتحقق</th>
                      <th className="py-3.5 px-4">الطالب والجامعة</th>
                      <th className="py-3.5 px-4">الخدمة والتفاصيل</th>
                      <th className="py-3.5 px-4">حالة الدفع الإلكتروني</th>
                      <th className="py-3.5 px-4">المشرف المسؤول</th>
                      <th className="py-3.5 px-4">الحالة الإجرائية</th>
                      <th className="py-3.5 px-4 text-left">إجراءات المراجعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map(order => {
                        const isPaid = order.paymentStatus === 'paid';
                        const isZain = order.paymentMethod === 'zain_cash';
                        const isCopied = copiedOrderNumber === order.orderNumber;

                        return (
                          <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                            
                            {/* Order Number & Verification Code */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 mb-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyOrderNumber(order.orderNumber)}
                                  className="font-mono font-black text-xs text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/70 hover:bg-blue-900 flex items-center gap-1 cursor-pointer transition-colors"
                                  title="انقر لنسخ رقم الطلب"
                                >
                                  <span>{order.orderNumber}</span>
                                  {isCopied ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 block">
                                كود التحقق: <strong className="text-slate-300">{order.verificationCode || 'VRF-AUTO'}</strong>
                              </span>
                              <span className="text-[10px] text-slate-500 block">{order.createdAt}</span>
                            </td>

                            {/* Student & Uni */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-bold text-white block">{order.studentName || 'طالب مجهول'}</span>
                              <span className="text-[11px] text-blue-300 font-mono block dir-ltr text-right">
                                {order.studentPhone || 'بدون هاتف'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                                {order.universityName} · {order.collegeName}
                              </span>
                            </td>

                            {/* Service & Title */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <span className="font-bold text-white block truncate">{order.title}</span>
                              <span className="text-[11px] text-slate-400 block">
                                {order.serviceName} · {order.deadlineDisplay}
                              </span>
                              {order.couponCode && (
                                <span className="inline-block mt-0.5 text-[10px] font-bold bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800">
                                  كوبون: {order.couponCode}
                                </span>
                              )}
                            </td>

                            {/* Payment Status (Linked directly with ZainCash & Stripe) */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  {isPaid ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-950 text-emerald-300 border border-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>مدفوع بالكامل</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-950 text-amber-300 border border-amber-700 animate-pulse">
                                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                                      <span>بانتظار السداد</span>
                                    </span>
                                  )}
                                  
                                  <span className="font-black text-xs text-white">
                                    {formatIqd(order.totalPriceIqd)}
                                  </span>
                                </div>

                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span>الوسيلة:</span>
                                  <span className="font-bold text-slate-200">
                                    {isZain ? 'محفظة زين كاش' : 'منصة Stripe'}
                                  </span>
                                </div>

                                {order.paymentReference && (
                                  <div className="text-[10px] text-slate-400 truncate max-w-[170px]" title={order.paymentReference}>
                                    مرجع: <span className="font-mono text-slate-300">{order.paymentReference}</span>
                                  </div>
                                )}

                                {/* Admin Instant Toggle Payment */}
                                <button
                                  type="button"
                                  onClick={() => handleTogglePaymentStatus(order)}
                                  className={`mt-1 px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer transition-colors ${
                                    isPaid 
                                      ? 'text-rose-400 border-rose-800 hover:bg-rose-950/50' 
                                      : 'text-emerald-400 border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900'
                                  }`}
                                >
                                  {isPaid ? 'إلغاء تأكيد السداد 🔄' : 'تأكيد استلام الدفع الآن ✅'}
                                </button>
                              </div>
                            </td>

                            {/* Assigned Worker */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {order.assignedWorker ? (
                                <div>
                                  <span className="font-bold text-white block">{order.assignedWorker.name}</span>
                                  <span className="text-[10px] text-blue-300">{order.assignedWorker.role}</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSelectedOrderForAssign(order)}
                                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold bg-amber-950/60 px-2 py-1 rounded border border-amber-800 cursor-pointer"
                                >
                                  + تعيين مشرف
                                </button>
                              )}
                            </td>

                            {/* Status Selector */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                                className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                  order.status === 'awaiting_payment' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                                  order.status === 'delivered' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                                  order.status === 'ready' ? 'bg-emerald-900 text-white border-emerald-600' :
                                  order.status === 'in_progress' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                                  'bg-blue-950 text-blue-300 border-blue-800'
                                }`}
                              >
                                <option value="awaiting_payment">بانتظار الدفع</option>
                                <option value="received">تم الاستلام وتأكيد السداد</option>
                                <option value="confirmed">تأكيد المواصفات</option>
                                <option value="in_progress">قيد التنفيذ</option>
                                <option value="quality_review">مراجعة الجودة (QA)</option>
                                <option value="ready">جاهز للتسليم</option>
                                <option value="delivered">تم التسليم</option>
                                <option value="revision">قيد التعديل</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-left whitespace-nowrap">
                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleChatWithStudentWhatsApp(order)}
                                  className="p-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                                  title="مراسلة الطالب بالواتساب للتحقق من الطلب"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => onViewOrderDetails(order)}
                                  className="px-2.5 py-1.5 bg-slate-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                                >
                                  عرض التفاصيل
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          لا توجد طلبات تطابق معايير البحث والفلترة المحددة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Coupons Management Studio (Exclusive to Admin) */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            
            {/* Coupon Generator Box */}
            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white font-['Cairo']">
                      استوديو إنتاج وتوليد الكوبونات الأكاديمية
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      الكوبونات مخفية عن الطلاب وتنتجها الإدارة فقط لمنحها للطلبة أو الحالات المستحقة
                    </p>
                  </div>
                </div>

                <span className="text-xs bg-amber-950 text-amber-300 font-bold px-2.5 py-1 rounded-xl border border-amber-800">
                  لوحة المشرف
                </span>
              </div>

              {couponSuccessMsg && (
                <div className="p-3 bg-emerald-950 border border-emerald-600 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{couponSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                
                {/* Code input with Random Generator buttons */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    كود الكوبون:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="مثال: FREE100, SAVE50, BAGHDAD_VIP"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white font-mono font-bold text-xs uppercase focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerateRandomCode(100)}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                    >
                      كود 100% عشوائي
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateRandomCode(50)}
                      className="px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                    >
                      كود 50% عشوائي
                    </button>
                  </div>
                </div>

                {/* Discount Type: Percentage or Fixed IQD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      نوع الخصم:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCouponType('percent')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          newCouponType === 'percent'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        نسبة مئوية (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCouponType('fixed')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          newCouponType === 'fixed'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        مبلغ مالي ثابت (د.ع)
                      </button>
                    </div>
                  </div>

                  {newCouponType === 'percent' ? (
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        نسبة الخصم المعتمدة:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { percent: 100, label: '100% (مجاني)' },
                          { percent: 50, label: '50% (نصف)' },
                          { percent: 25, label: '25%' },
                          { percent: 15, label: '15%' },
                        ].map(p => (
                          <button
                            key={p.percent}
                            type="button"
                            onClick={() => setNewCouponPercent(p.percent)}
                            className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                              newCouponPercent === p.percent
                                ? 'bg-blue-600 text-white border-blue-500 font-black'
                                : 'bg-slate-900 text-slate-300 border-slate-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        مبلغ الخصم (د.ع):
                      </label>
                      <input
                        type="number"
                        step={1000}
                        value={newCouponAmount}
                        onChange={(e) => setNewCouponAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs font-mono font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Note / Student Name */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    اسم الطالب المستفيد أو مناسبة الكوبون (للتوثيق الداخلي):
                  </label>
                  <input
                    type="text"
                    value={newCouponNote}
                    onChange={(e) => setNewCouponNote(e.target.value)}
                    placeholder="مثال: منحة للطالب حسين علي، خصم تكريم الأوائل بكلية الهندسة..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!newCouponCode.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>حفظ وتفعيل الكوبون في النظام فوراً</span>
                </button>

              </form>
            </div>

            {/* List of Active Admin Coupons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300">
                  الكوبونات الصادرة والمسجلة بالنظام ({adminCoupons.length}):
                </h3>
                <span className="text-[10px] text-slate-400">
                  انقر على الكود لنسخه أو زر واتساب لإرساله مباشرة للطالب
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {adminCoupons.map((c) => {
                  const is100 = c.discountPercent === 100;
                  const is50 = c.discountPercent === 50;
                  const isCopied = copiedCouponCode === c.code;

                  return (
                    <div
                      key={c.code}
                      className={`bg-slate-800 p-4 rounded-2xl border flex flex-col justify-between shadow-2xs transition-all ${
                        c.active ? 'border-slate-700 hover:border-slate-600' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          
                          {/* Code with Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyCouponCode(c.code)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-950 border border-slate-700 text-amber-400 font-mono font-black text-xs cursor-pointer transition-colors"
                            title="انقر لنسخ الكود"
                          >
                            <span>{c.code}</span>
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>

                          {/* Discount Badge */}
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            is100
                              ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-700'
                              : is50
                              ? 'bg-blue-900/70 text-blue-300 border border-blue-700'
                              : 'bg-amber-900/70 text-amber-300 border border-amber-700'
                          }`}>
                            {c.discountType === 'fixed' 
                              ? `خصم ${formatIqd(c.discountAmountIqd || 0)}` 
                              : `خصم ${c.discountPercent}%`}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                          {c.note || c.label}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>مرات الاستخدام: <strong className="text-slate-200">{c.usageCount || 0}</strong></span>
                          <span>بتاريخ: {c.createdAt}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          
                          {/* Active / Inactive Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleCouponActive(c.code)}
                            className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                              c.active 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}
                          >
                            <span>{c.active ? 'نشط الآن' : 'معطل'}</span>
                          </button>

                          {/* Direct WhatsApp Send */}
                          <button
                            type="button"
                            onClick={() => handleShareCouponWhatsApp(c)}
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/80 flex items-center gap-1 cursor-pointer"
                            title="إرسال الكود للطالب عبر واتساب"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>واتساب الطالب</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="text-rose-400 hover:text-rose-300 flex items-center gap-0.5 cursor-pointer text-[10px] font-semibold"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Academic Workers */}
        {activeTab === 'workers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">الكادر الأكاديمي والمدققين</h2>
              <span className="text-xs text-slate-400">توزيع حسب التخصص (طب، هندسة، علوم، لغات، إحصاء)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workersList.map(worker => (
                <div key={worker.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                        {worker.role}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{worker.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-sm mb-1">{worker.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{worker.specialty}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">الطلبات النشطة:</span>
                    <span className="font-bold text-white font-mono">{worker.activeOrdersCount} أعمال</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Services Directory */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">دليل الخدمات الجامعية وقوائم الأسعار</h2>
              <span className="text-xs text-slate-400">الأسعار بالدينار العراقي (د.ع)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_SERVICES.map(service => (
                <div key={service.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{service.name}</span>
                    <span className="text-xs font-black text-amber-400">{formatIqd(service.basePriceIqd)}</span>
                  </div>
                  <p className="text-xs text-slate-400">{service.description}</p>
                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                    <span>زمن الإنجاز: {service.minDurationHours} ساعة</span>
                    <span className="text-emerald-400">شامل التعديل والتوثيق</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Universities */}
        {activeTab === 'universities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">الجامعات والكليات العراقية المغطاة</h2>
              <span className="text-xs text-slate-400">{IRAQI_UNIVERSITIES.length} جامعة معتمدة</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {IRAQI_UNIVERSITIES.map(uni => (
                <div key={uni.id} className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{uni.name}</span>
                    <span className="text-[10px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded">{uni.city}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    الكليات المغطاة: {uni.colleges.length} كلية ومعهد
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Assign Worker Modal */}
      {selectedOrderForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">تعيين مشرف أكاديمي للطلب</h3>
                <p className="text-xs text-blue-400 font-mono">{selectedOrderForAssign.orderNumber} - {selectedOrderForAssign.title}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForAssign(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workersList.map(w => (
                <div
                  key={w.id}
                  onClick={() => handleAssignWorker(w.id)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block text-xs">{w.name}</span>
                    <span className="text-[11px] text-slate-400">{w.role} · {w.specialty}</span>
                  </div>
                  <span className="text-xs text-amber-400 font-bold">{w.rating} ★</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
