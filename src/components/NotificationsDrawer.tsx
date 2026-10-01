import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  ArrowRight,
  Coins,
  ShieldCheck,
  CreditCard,
  ChevronLeft
} from 'lucide-react';
import { AppNotification } from '../types';
import { 
  getStoredNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearAllNotifications 
} from '../utils/storage';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOrder?: (orderNumber?: string) => void;
  onOpenPointsModal?: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToOrder,
  onOpenPointsModal,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(getStoredNotifications());
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'order' | 'points'>('all');

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getStoredNotifications());
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    setNotifications(getStoredNotifications());

    if (notif.type === 'points' && onOpenPointsModal) {
      onClose();
      onOpenPointsModal();
    } else if ((notif.type === 'order' || notif.type === 'payment' || notif.type === 'delivery') && onNavigateToOrder) {
      onClose();
      onNavigateToOrder(notif.orderNumber);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'order') return n.type === 'order' || n.type === 'payment' || n.type === 'delivery';
    if (filterType === 'points') return n.type === 'points';
    return true;
  });

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
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                  مركز الإشعارات الأكاديمية
                </h1>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                تحديثات فورية لحالة بحوثك وسداد الدفعات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="تحديد الكل كمقروء"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="مسح كل الإشعارات"
            >
              <Trash2 className="w-4 h-4" />
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
      <main className="flex-1 w-full max-w-xl mx-auto p-4 sm:p-6 pb-24 space-y-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            الكل ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterType === 'unread'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            غير مقروءة ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('order')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterType === 'order'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            طلبات ودفعات
          </button>
          <button
            type="button"
            onClick={() => setFilterType('points')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterType === 'points'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            مكافآت ونقاط
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">لا توجد إشعارات حالياً</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">ستصلك هنا كافة التحديثات الخاصة بطلباتك وسداد المدفوعات ونقاطك.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((notif) => {
              const isOrderRelated = notif.type === 'order' || notif.type === 'payment' || notif.type === 'delivery';
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs relative ${
                    !notif.read
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 hover:border-blue-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.type === 'order' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                      notif.type === 'payment' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                      notif.type === 'points' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {notif.type === 'order' && <FileText className="w-4 h-4" />}
                      {notif.type === 'payment' && <CreditCard className="w-4 h-4" />}
                      {notif.type === 'points' && <Coins className="w-4 h-4" />}
                      {notif.type === 'system' && <Sparkles className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.orderNumber && (
                        <div className="pt-1 flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                            {notif.orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            انقر لعرض تفاصيل الطلب ↗
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
};
