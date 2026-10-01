import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'هل العمل يتم كتابته خصيصاً لي أم جاهز مسبقاً؟',
      a: 'كل عمل يُكتب من الصفر خصيصاً وفق متطلبات دكتور مادتك وكليتك المحددة، مع فحص استلال وتوثيق دقيق بالمصادر.',
    },
    {
      q: 'متى يتم تسليم التقرير أو العمل النهائي؟',
      a: 'يتم تسليم الملفات بصيغتي Word و PDF مباشرة بعد تأكيد السداد وإتمام الدفع الإلكتروني، وحسب الموعد المتفق عليه (6 ساعات، 12 ساعة، أو 24 ساعة).',
    },
    {
      q: 'ماذا لو طلب دكتور المادة تعديلاً أو إضافة بعد التسليم؟',
      a: 'التعديل مجاني 100%! ما عليك سوى الدخول لصفحة طلبك أو مراسلتنا بالواتساب وسنقوم بتطبيق ملاحظات الأستاذ فوراً دون أي تكلفة إضافية.',
    },
    {
      q: 'كيف أحصل على كوبون خصم؟',
      a: 'يقوم مشرفو المنصة وإدارة المنقذ الجامعي بإنشاء وتزويد الطلبة بكوبونات خصم خاصة (تصل إلى 50% أو 100%) لحالات الدعم والطلبة المميزين. يتم إدخال كود الكوبون في خانة الكوبون عند تقديم الطلب.',
    },
    {
      q: 'ما هي طرق الدفع المتوفرة؟',
      a: 'نوفر وسيلتين معتمدتين حصرياً: محفظة زين كاش (ZainCash) داخل العراق، ومنصة Stripe العالمية المعتمدة للدفع الإلكتروني الآمن ببطاقات Visa و Mastercard.',
    },
  ];

  return (
    <section className="py-6 px-3.5 bg-white border-b border-slate-200 font-['Cairo']">
      <div className="w-full">
        
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase inline-block mb-1.5">
            الأسئلة الشائعة
          </span>
          <h2 className="text-base font-black text-slate-900 font-['Cairo']">
            إجابات على أكثر ما يسأله الطلبة
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-right flex items-center justify-between gap-2 cursor-pointer font-bold text-xs text-slate-900"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-blue-700' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-0 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100">
                    <p className="mt-2">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
