import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloat: React.FC = () => {
  const handleOpenWhatsApp = () => {
    // Direct link to Iraqi customer support WhatsApp at 07740080310
    const message = encodeURIComponent('مرحباً فريق المنقذ الجامعي، أود الاستفسار بخصوص خدمة جامعية.');
    window.open(`https://wa.me/9647740080310?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-20 left-4 z-30 flex items-center gap-2 group">
      <div className="hidden sm:block bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-md font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        تواصل واتساب: 07740080310
      </div>

      <button
        onClick={handleOpenWhatsApp}
        className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        aria-label="تواصل عبر واتساب 07740080310"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};
