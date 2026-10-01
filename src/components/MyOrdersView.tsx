import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  RotateCcw, 
  Search, 
  Plus,
  FileText,
  Calendar
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatIqd } from '../utils/pricing';

interface MyOrdersViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onNewOrder: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  orders,
  onSelectOrder,
  onNewOrder,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'awaiting_payment' | 'in_progress' | 'ready_delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'awaiting_payment') {
      if (order.status !== 'awaiting_payment') return false;
    } else if (activeFilter === 'in_progress') {
      if (order.status !== 'in_progress' && order.status !== 'confirmed' && order.status !== 'quality_review' && order.status !== 'revision') {
        return false;
      }
    } else if (activeFilter === 'ready_delivered') {
      if (order.status !== 'ready' && order.status !== 'delivered') {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchTitle = (order.title || '').toLowerCase().includes(q);
      const matchService = order.serviceName.toLowerCase().includes(q);
      const matchUni = order.universityName.toLowerCase().includes(q);
      return matchNum || matchTitle || matchService || matchUni;
    }

    return true;
  });

  return (
    <div className="w-full px-3.5 py-4 pb-24 font-['Cairo'] transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div>
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800 inline-block mb-1">
            متابعة الأعمال
          </span>
          <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">
            طلباتي ({orders.length})
          </h1>
        </div>

        <button
          onClick={onNewOrder}
          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>طلب جديد</span>
        </button>
      </div>

      {/* Filter Tabs - Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {[
          { id: 'all', label: `الكل (${orders.length})` },
          { 
            id: 'awaiting_payment', 
            label: `بانتظار الدفع (${orders.filter(o => o.status === 'awaiting_payment').length})` 
          },
          { 
            id: 'in_progress', 
            label: `قيد التنفيذ (${orders.filter(o => ['in_progress', 'confirmed', 'quality_review', 'revision'].includes(o.status)).length})` 
          },
          { 
            id: 'ready_delivered', 
            label: `جاهزة (${orders.filter(o => ['ready', 'delivered'].includes(o.status)).length})` 
          },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
              activeFilter === tab.id
                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم الطلب أو الموضوع..."
          className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 font-medium"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const isAwaitingPayment = order.status === 'awaiting_payment';
            const isCompleted = order.status === 'delivered' || order.status === 'ready';
            const isRevision = order.status === 'revision';

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-3.5 shadow-2xs transition-all cursor-pointer ${
                  isAwaitingPayment 
                    ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/20' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60 font-mono">
                      {order.orderNumber}
                    </span>
                    {order.verificationCode && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {order.verificationCode}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                      {order.serviceName}
                    </span>
                  </div>

                  {/* Payment & Status Badges */}
                  <div className="flex items-center gap-1">
                    {order.paymentStatus === 'paid' ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>مدفوع</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-amber-600" />
                        <span>بانتظار السداد</span>
                      </span>
                    )}

                    {isRevision ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">
                        <RotateCcw className="w-2.5 h-2.5 text-rose-600" />
                        <span>تعديل</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>جاهز</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                        <Clock className="w-2.5 h-2.5 text-blue-600" />
                        <span>تنفيذ</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                  {order.title || order.serviceName}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">
                  {order.universityName} · {order.collegeName}
                </p>

                {/* Bottom Row */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-slate-600 dark:text-slate-400">
                    <span>المبلغ: <strong className={isAwaitingPayment ? 'text-amber-800 dark:text-amber-400 font-bold' : 'text-slate-900 dark:text-white'}>{formatIqd(order.totalPriceIqd)}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAwaitingPayment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3 h-3" />
                        <span>إتمام الدفع</span>
                      </button>
                    )}

                    <div className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-0.5 text-[11px]">
                      <span>التفاصيل</span>
                      <ArrowLeft className="w-3 h-3" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-2xs">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            لا توجد طلبات في هذا القسم
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">
            اطلب تقريرك أو بحثك وسيتولى الفريق تنفيذه فوراً.
          </p>
          <button
            onClick={onNewOrder}
            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            اطلب الآن
          </button>
        </div>
      )}

    </div>
  );
};
