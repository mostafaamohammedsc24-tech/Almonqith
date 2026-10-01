import React, { useState } from 'react';
import { 
  FileText, 
  Presentation, 
  FolderSync, 
  BookOpen, 
  FlaskConical, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ServiceItem, ServiceCategory } from '../types';
import { ALL_SERVICES } from '../data/services';
import { formatIqd } from '../utils/pricing';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
  onOpenCustomRequest: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onOpenCustomRequest,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');

  const categories: { id: ServiceCategory | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'الكل', icon: Sparkles },
    { id: 'reports_research', label: 'تقارير وبحوث', icon: FileText },
    { id: 'presentations', label: 'بوربوينت', icon: Presentation },
    { id: 'files_formatting', label: 'تنسيق وملفات', icon: FolderSync },
    { id: 'lectures_summaries', label: 'تلخيص وأسئلة', icon: BookOpen },
    { id: 'scientific_stats', label: 'علمية وإحصاء', icon: FlaskConical },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? ALL_SERVICES 
    : ALL_SERVICES.filter(s => s.category === selectedCategory);

  return (
    <section id="services-catalog" className="py-6 px-3.5 bg-white border-b border-slate-200 font-['Cairo']">
      <div className="w-full">
        
        {/* Section Header */}
        <div className="text-center mb-4">
          <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 inline-block mb-1.5">
            دليل الخدمات الجامعية
          </span>
          <h2 className="text-lg font-black text-slate-900 font-['Cairo']">
            اطلب أي عمل جامعي واستلمه جاهزاً
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            اختر نوع العمل لتعبئة بياناتك وملاحظات الدكتور
          </p>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Services List - Mobile Cards */}
        <div className="mt-4 space-y-3">
          {filteredServices.map(service => (
            <div
              key={service.id}
              className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-black text-slate-900 text-sm font-['Cairo']">
                    {service.name}
                  </h3>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg shrink-0">
                    يبدأ من {formatIqd(service.basePriceIqd)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-normal mb-2.5">
                  {service.description}
                </p>

                {/* Deliverables chips */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {service.deliverables.slice(0, 3).map((deliv, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-bold text-slate-600 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{deliv}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectService(service)}
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>طلب {service.name}</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Custom Request Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center">
          <h4 className="text-xs font-black mb-1">لم تجد الخدمة المطلوبة في القائمة؟</h4>
          <p className="text-[10px] text-blue-200 mb-2.5">
            اكتب لنا طلبك بالتفصيل وسيقوم المشرف بتجهيزه لك فوراً
          </p>
          <button
            onClick={onOpenCustomRequest}
            className="w-full py-2 bg-white text-blue-900 hover:bg-blue-50 text-xs font-black rounded-xl transition-all cursor-pointer"
          >
            طلب مخصص حر
          </button>
        </div>

      </div>
    </section>
  );
};
