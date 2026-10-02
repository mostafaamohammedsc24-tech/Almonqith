import { Order, StudentProfile, ReviewItem, PointsTransaction, AppNotification, LoyaltyTier } from '../types';

const ORDERS_KEY = 'al_munqith_orders_v4';
const PROFILE_KEY = 'al_munqith_profile_v3';
const REGISTERED_STUDENTS_KEY = 'al_munqith_registered_students_v2';
const REVIEWS_KEY = 'al_munqith_reviews_v1';
const POINTS_HISTORY_KEY = 'al_munqith_points_history_v2';
const NOTIFICATIONS_KEY = 'al_munqith_notifications_v2';
const THEME_KEY = 'al_munqith_theme_v1';

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
      return [];
    }
    const orders: Order[] = JSON.parse(raw);
    const cleanOrders = orders.filter(order =>
      order.studentPhone !== '0770 123 4567' &&
      !['ord-10298', 'ord-10294', 'ord-10291'].includes(order.id)
    );
    if (cleanOrders.length !== orders.length) saveOrders(cleanOrders);
    return cleanOrders;
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}

export function saveSingleOrder(order: Order): void {
  const current = getStoredOrders();
  const index = current.findIndex(o => o.id === order.id);
  if (index >= 0) {
    current[index] = order;
  } else {
    current.unshift(order);
  }
  saveOrders(current);
}

// Student Accounts Registry (indexed by phone number)
export function getAllRegisteredStudents(): Record<string, StudentProfile> {
  try {
    const raw = localStorage.getItem(REGISTERED_STUDENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveRegisteredStudent(profile: StudentProfile): void {
  if (!profile.phone) return;
  const cleanPhone = profile.phone.replace(/\s+/g, '');
  const all = getAllRegisteredStudents();
  all[cleanPhone] = profile;
  try {
    localStorage.setItem(REGISTERED_STUDENTS_KEY, JSON.stringify(all));
  } catch {}
}

export function findRegisteredStudentByPhone(phone: string): StudentProfile | undefined {
  const clean = phone.replace(/\s+/g, '');
  const all = getAllRegisteredStudents();
  return all[clean];
}

export function calculateLoyaltyTier(points: number): LoyaltyTier {
  if (points >= 3000) return 'diamond';
  if (points >= 1500) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
}

export const TIER_CONFIG: Record<LoyaltyTier, { label: string; min: number; max: number; color: string; badgeBg: string; perk: string }> = {
  bronze: {
    label: 'طالب مجتهد (برونزي)',
    min: 0,
    max: 500,
    color: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
    perk: 'شارة برونزية حسب رصيد نقاطك',
  },
  silver: {
    label: 'طالب متميز (فضي)',
    min: 501,
    max: 1500,
    color: 'text-slate-400 dark:text-slate-300',
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    perk: 'شارة فضية حسب رصيد نقاطك',
  },
  gold: {
    label: 'طالب متفوق (ذهبي)',
    min: 1501,
    max: 3000,
    color: 'text-yellow-600 dark:text-yellow-400',
    badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800',
    perk: 'شارة ذهبية حسب رصيد نقاطك',
  },
  diamond: {
    label: 'نخبة المنقذ (ماسي)',
    min: 3001,
    max: 10000,
    color: 'text-cyan-600 dark:text-cyan-400',
    badgeBg: 'bg-cyan-100 text-cyan-950 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800',
    perk: 'شارة ماسية حسب رصيد نقاطك',
  },
};

// Clean initial profile without test names, test numbers, or test points
const DEFAULT_PROFILE: StudentProfile = {
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
};

export function getStoredProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isDemoProfile = parsed.name === 'أحمد علي' || parsed.name === 'أحمد علي الهاشمي' || parsed.phone?.includes('0770 123');
      if (!parsed.isRegistered || isDemoProfile) {
        parsed.name = '';
        parsed.phone = '';
        parsed.university = '';
        parsed.college = '';
        parsed.department = '';
        parsed.loyaltyPoints = 0;
        parsed.totalEarnedPoints = 0;
        parsed.dailyStreak = 0;
        parsed.lastCheckInDate = '';
        parsed.referralCode = '';
        parsed.isRegistered = false;
      }
      parsed.loyaltyTier = calculateLoyaltyTier(parsed.loyaltyPoints || 0);
      return parsed;
    }
  } catch {}
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: StudentProfile): void {
  try {
    profile.loyaltyTier = calculateLoyaltyTier(profile.loyaltyPoints || 0);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    if (profile.isRegistered && profile.phone) {
      saveRegisteredStudent(profile);
    }
  } catch {}
}

export function getStoredPointsHistory(): PointsTransaction[] {
  try {
    const raw = localStorage.getItem(POINTS_HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addPointsTransaction(tx: Omit<PointsTransaction, 'id' | 'date'>): void {
  const current = getStoredPointsHistory();
  const newTx: PointsTransaction = {
    ...tx,
    id: `pt-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
  };
  current.unshift(newTx);
  try {
    localStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify(current));
  } catch {}

  // Update profile points
  const profile = getStoredProfile();
  const updatedPoints = Math.max(0, (profile.loyaltyPoints || 0) + tx.points);
  profile.loyaltyPoints = updatedPoints;
  if (tx.points > 0) {
    profile.totalEarnedPoints = (profile.totalEarnedPoints || 0) + tx.points;
  }
  saveProfile(profile);
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const notifications: AppNotification[] = JSON.parse(raw);
    const cleanNotifications = notifications.filter(notification => notification.id !== 'notif-welcome');
    if (cleanNotifications.length !== notifications.length) saveNotifications(cleanNotifications);
    return cleanNotifications;
  } catch {
    return [];
  }
}

export function saveNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch {}
}

export function addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}`,
    timestamp: 'الآن',
    read: false,
  };
  current.unshift(newNotif);
  saveNotifications(current);
}

export function markNotificationAsRead(id: string): void {
  const current = getStoredNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(current);
}

export function markAllNotificationsAsRead(): void {
  const current = getStoredNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(current);
}

export function clearAllNotifications(): void {
  saveNotifications([]);
}

// Theme storage
export function getStoredTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function getStoredReviews(): ReviewItem[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (raw) {
      const reviews: ReviewItem[] = JSON.parse(raw);
      const cleanReviews = reviews.filter(review => !['rev-1', 'rev-2', 'rev-3', 'rev-4'].includes(review.id));
      if (cleanReviews.length !== reviews.length) {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(cleanReviews));
      }
      return cleanReviews;
    }
  } catch {}
  return [];
}

export function addReview(review: ReviewItem): void {
  const current = getStoredReviews();
  current.unshift(review);
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(current));
  } catch {}
}
