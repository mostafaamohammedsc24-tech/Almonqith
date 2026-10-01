import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { HowItWorks, WhyUsSection } from './components/HowItWorks';
import { CustomRequestSection } from './components/CustomRequestSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { OrderWizard } from './components/OrderWizard';
import { MyOrdersView } from './components/MyOrdersView';
import { OrderDetailView } from './components/OrderDetailView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginView } from './components/AdminLoginView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { PWAInstallModal } from './components/PWAInstallModal';
import { LoyaltyPointsModal } from './components/LoyaltyPointsModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';

import { Order, ServiceItem, StudentProfile, ReviewItem, AppNotification } from './types';
import { 
  getStoredOrders, 
  saveOrders, 
  saveSingleOrder, 
  getStoredProfile, 
  saveProfile, 
  getStoredReviews,
  getStoredNotifications,
  saveNotifications,
  getStoredTheme,
  saveTheme
} from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'services' | 'orders' | 'order_wizard' | 'admin'>('home');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme());

  // Stored state
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<StudentProfile>(getStoredProfile());
  const [reviews, setReviews] = useState<ReviewItem[]>(getStoredReviews());
  const [notifications, setNotifications] = useState<AppNotification[]>(getStoredNotifications());

  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

  // Admin authentication state (credentials: 07740080310 / sofydono3?)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Wizard pre-fill states
  const [wizardServiceId, setWizardServiceId] = useState<string | undefined>(undefined);
  const [wizardParsedData, setWizardParsedData] = useState<any | null>(null);

  // Apply theme to html & body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load orders & notifications on mount and sync
  useEffect(() => {
    const loadedOrders = getStoredOrders();
    setOrders(loadedOrders);
    setNotifications(getStoredNotifications());
  }, []);

  const refreshProfileAndNotifs = () => {
    setProfile(getStoredProfile());
    setNotifications(getStoredNotifications());
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    const updated = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    setOrders(updated);
    saveOrders(updated);
    if (selectedOrder?.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
    refreshProfileAndNotifs();
  };

  const handleOrderCreated = (newOrder: Order) => {
    saveSingleOrder(newOrder);
    const updated = [newOrder, ...orders.filter(o => o.id !== newOrder.id)];
    setOrders(updated);
    refreshProfileAndNotifs();

    // Direct transition to the live tracking view of the created order
    setSelectedOrder(newOrder);
    setActiveView('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartWizardWithService = (service: ServiceItem) => {
    setWizardServiceId(service.id);
    setWizardParsedData(null);
    setSelectedOrder(null);
    setActiveView('order_wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartWizardWithParsedData = (data: any) => {
    setWizardServiceId(data.serviceId || 'report_uni');
    setWizardParsedData(data);
    setSelectedOrder(null);
    setActiveView('order_wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleNavigateToOrderFromNotification = (orderNumber?: string) => {
    if (orderNumber) {
      const found = orders.find(o => o.orderNumber === orderNumber);
      if (found) {
        setSelectedOrder(found);
        setActiveView('orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setSelectedOrder(null);
    setActiveView('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeOrdersCount = orders.filter(o => 
    ['awaiting_payment', 'received', 'confirmed', 'in_progress', 'quality_review', 'revision'].includes(o.status)
  ).length;

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 overflow-x-hidden relative shadow-2xl border-x border-slate-200/80 dark:border-slate-800 font-['Cairo',sans-serif] transition-colors">
      
      {/* PWA In-App Install Banner (Shows install option for shortcut creation) */}
      {activeView !== 'admin' && (
        <PWAInstallBanner onOpenInstallModal={() => setInstallModalOpen(true)} />
      )}

      {/* Mobile Top Header (hidden in admin mode) */}
      {activeView !== 'admin' && (
        <Navbar
          activeView={activeView}
          setActiveView={(v) => {
            setSelectedOrder(null);
            setActiveView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          ordersCount={orders.length}
          activeOrdersCount={activeOrdersCount}
          profile={profile}
          onOpenProfile={() => setProfileModalOpen(true)}
          onStartNewOrder={() => {
            setWizardServiceId(undefined);
            setWizardParsedData(null);
            setSelectedOrder(null);
            setActiveView('order_wizard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPoints={() => {
            refreshProfileAndNotifs();
            setPointsModalOpen(true);
          }}
          onOpenNotifications={() => {
            refreshProfileAndNotifs();
            setNotificationsDrawerOpen(true);
          }}
          onOpenInstall={() => setInstallModalOpen(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* Main Content Area based on current view */}
      <main className="flex-1 pb-16">
        
        {/* 1. HOME VIEW */}
        {activeView === 'home' && (
          <>
            <Hero
              onStartOrder={() => {
                setWizardServiceId(undefined);
                setWizardParsedData(null);
                setActiveView('order_wizard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBrowseServices={() => {
                const el = document.getElementById('services-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setActiveView('services');
              }}
              onOrderParsed={handleStartWizardWithParsedData}
            />

            <ServicesSection
              onSelectService={handleStartWizardWithService}
              onOpenCustomRequest={() => {
                const el = document.getElementById('custom-request-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <HowItWorks />

            <CustomRequestSection
              onStartCustomOrder={handleStartWizardWithParsedData}
            />

            <WhyUsSection />

            <TestimonialsSection reviews={reviews} />

            <FaqSection />
          </>
        )}

        {/* 2. SERVICES CATALOG VIEW */}
        {activeView === 'services' && (
          <>
            <ServicesSection
              onSelectService={handleStartWizardWithService}
              onOpenCustomRequest={() => {
                const el = document.getElementById('custom-request-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <CustomRequestSection onStartCustomOrder={handleStartWizardWithParsedData} />
            <HowItWorks />
          </>
        )}

        {/* 3. ORDER WIZARD VIEW */}
        {activeView === 'order_wizard' && (
          <OrderWizard
            initialServiceId={wizardServiceId}
            initialParsedData={wizardParsedData}
            userProfile={profile}
            onOrderCreated={handleOrderCreated}
            onCancel={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 4. ORDERS VIEW (LIST OR DETAIL) */}
        {activeView === 'orders' && (
          selectedOrder ? (
            <OrderDetailView
              order={selectedOrder}
              onBack={() => setSelectedOrder(null)}
              onUpdateOrder={handleUpdateOrder}
            />
          ) : (
            <MyOrdersView
              orders={orders}
              onSelectOrder={(ord) => {
                setSelectedOrder(ord);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNewOrder={() => {
                setWizardServiceId(undefined);
                setWizardParsedData(null);
                setActiveView('order_wizard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

        {/* 5. SEPARATE ADMIN FLOW */}
        {activeView === 'admin' && (
          !isAdminLoggedIn ? (
            <AdminLoginView
              onLoginSuccess={() => {
                setIsAdminLoggedIn(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCancel={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <AdminDashboard
              orders={orders}
              onUpdateOrder={handleUpdateOrder}
              onExitAdmin={() => {
                setIsAdminLoggedIn(false);
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewOrderDetails={(ord) => {
                setSelectedOrder(ord);
                setActiveView('orders');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

      </main>

      {/* Floating WhatsApp support widget (visible on student views, links to 07740080310) */}
      {activeView !== 'admin' && <WhatsAppFloat />}

      {/* Mobile App Footer (hidden in admin mode) */}
      {activeView !== 'admin' && (
        <Footer
          onNavigate={(v) => {
            setSelectedOrder(null);
            setActiveView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAdmin={() => {
            setActiveView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Mobile App Bottom Tab Navigation Bar (Fixed for student views) */}
      {activeView !== 'admin' && (
        <BottomNav
          activeView={activeView}
          setActiveView={(v) => {
            setSelectedOrder(null);
            setActiveView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeOrdersCount={activeOrdersCount}
          onOpenProfile={() => setProfileModalOpen(true)}
        />
      )}

      {/* Student Profile & Registration Modal */}
      {profileModalOpen && (
        <StudentProfileModal
          profile={profile}
          ordersCount={orders.length}
          onSaveProfile={handleSaveProfile}
          onClose={() => setProfileModalOpen(false)}
          onOpenAdminLogin={() => {
            setProfileModalOpen(false);
            setActiveView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPointsWallet={() => {
            setProfileModalOpen(false);
            setPointsModalOpen(true);
          }}
        />
      )}

      {/* Loyalty Points & Rewards Wallet Modal */}
      {pointsModalOpen && (
        <LoyaltyPointsModal
          isOpen={pointsModalOpen}
          onClose={() => setPointsModalOpen(false)}
          profile={profile}
          onUpdateProfile={(up) => {
            setProfile(up);
            saveProfile(up);
          }}
          onStartOrderWithPoints={() => {
            setWizardServiceId(undefined);
            setWizardParsedData(null);
            setSelectedOrder(null);
            setActiveView('order_wizard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Notifications Drawer */}
      {notificationsDrawerOpen && (
        <NotificationsDrawer
          isOpen={notificationsDrawerOpen}
          onClose={() => {
            setNotificationsDrawerOpen(false);
            setNotifications(getStoredNotifications());
          }}
          onNavigateToOrder={handleNavigateToOrderFromNotification}
          onOpenPointsModal={() => setPointsModalOpen(true)}
        />
      )}

      {/* PWA Install Guide Modal */}
      {installModalOpen && (
        <PWAInstallModal
          isOpen={installModalOpen}
          onClose={() => setInstallModalOpen(false)}
        />
      )}

    </div>
  );
}
