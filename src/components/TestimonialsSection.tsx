import React from 'react';
import { Star, CheckCircle, GraduationCap } from 'lucide-react';
import { ReviewItem } from '../types';

interface TestimonialsSectionProps {
  reviews: ReviewItem[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ reviews }) => {
  return (
    <section className="py-6 px-3.5 bg-slate-50 border-b border-slate-200 font-['Cairo']">
      <div className="w-full">
        
        {/* Section Header */}
        <div className="text-center mb-4">
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase inline-block mb-1.5">
            آراء طلابنا
          </span>
          <h2 className="text-base font-black text-slate-900 font-['Cairo']">
            ماذا يقول طلبة الجامعات عنا؟
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            تجارب حقيقية لطلبة استلموا أعمالهم في موعدها
          </p>
        </div>

        {/* Reviews Stack - Mobile */}
        <div className="space-y-2.5">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  تسليم بالموعد
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px]">
                    {rev.studentName[0]}
                  </div>
                  <span className="font-bold text-slate-900">{rev.studentName}</span>
                </div>
                <span className="text-slate-500">{rev.university} · {rev.college}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
