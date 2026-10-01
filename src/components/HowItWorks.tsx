import React from 'react';
import { ShoppingBag, UploadCloud, Sparkles, Download, CheckCircle2, ShieldCheck, Clock, Users, BookOpen } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'اختر الخدمة والمواصفات',
      desc: 'حدد جامعتك وكليتك ونوع العمل (تقرير، بحث، بوربوينت).',
      icon: ShoppingBag,
    },
    {
      step: '02',
      title: 'ملاحظات وتوجيهات الدكتور',
      desc: 'اكتب ما طلبه أستاذ المادة وارفع الملفات أو الشروط المطلوبة.',
      icon: UploadCloud,
    },
    {
      step: '03',
      title: 'إعداد أكاديمي وتدقيق الجودة',
      desc: 'يكتب العمل متخصص أكاديمي مع فحص شامل للاستلال والتنسيق.',
      icon: Sparkles,
    },
    {
      step: '04',
      title: 'استلام العمل وتعديل مجاني',
      desc: 'تستلم ملفاتك Word و PDF جاهزة مع ضمان تعديل فوري عند الحاجة.',
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="py-6 px-3.5 bg-slate-50 border-b border-slate-200 font-['Cairo']">
      <div className="w-full">
        
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase inline-block mb-1.5">
            خطوات بسيطة
          </span>
          <h2 className="text-lg font-black text-slate-900 font-['Cairo']">
            كيف يعمل المنقذ الجامعي؟
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            أربع خطوات تفصلك عن استلام عملك الجامعي جاهزاً
          </p>
        </div>

        {/* 4 Steps - Mobile 2x2 Grid or Clean Stack */}
        <div className="grid grid-cols-2 gap-2.5">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-black text-slate-300">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export const WhyUsSection: React.FC = () => {
  return (
    <section className="py-6 px-3.5 bg-white border-b border-slate-200 font-['Cairo']">
      <div className="w-full">
        
        <div className="text-center mb-4">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 uppercase inline-block mb-1.5">
            ضمانات المنقذ
          </span>
          <h2 className="text-lg font-black text-slate-900 font-['Cairo']">
            لماذا يثق بنا آلاف الطلبة؟
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs">التزام دقيق بالموعد</h3>
              <p className="text-[10px] text-slate-500">حتى مع الطلبات العاجلة خلال 6 إلى 12 ساعة لتفادي فوات الموعد النهائي.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs">مطابقة تعليمات كليتك ودكتورك</h3>
              <p className="text-[10px] text-slate-500">تنسيق معتمد للأبعاد، الخطوط، الهوامش، وفهرسة المراجع العلمية.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs">ضمان تعديل مجاني شامل</h3>
              <p className="text-[10px] text-slate-500">إذا طلب الدكتور أي تعديل أو إضافة، نطبقها لك فوراً وبشكل مجاني تماماً.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
