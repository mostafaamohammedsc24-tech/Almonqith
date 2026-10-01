import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Send, Loader2, CheckCircle2, ShieldCheck, HelpCircle, MessageCircle } from 'lucide-react';
import { formatIqd } from '../utils/pricing';

interface CustomRequestSectionProps {
  onStartCustomOrder: (prefillData: any) => void;
}

export const CustomRequestSection: React.FC<CustomRequestSectionProps> = ({ onStartCustomOrder }) => {
  const [details, setDetails] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const handleAnalyze = async () => {
    if (!details.trim()) return;

    setAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details: details.trim() }),
      });

      if (!res.ok) throw new Error('Failed to analyze');
      const data = await res.json();
      setAnalysisResult(data);
    } catch {
      setAnalysisResult({
        classifiedCategory: 'مهمة أكاديمية خاصة',
        estimatedDays: 2,
        estimatedPriceIqd: 25000,
        complexity: 'متوسط',
        suggestedDeliverables: ['ملف DOCX منسق', 'نسخة PDF معتمدة'],
        adviceForStudent: 'طلبك واضح ويمكن تنفيذه مع مشرف أكاديمي متخصص.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProceed = () => {
    onStartCustomOrder({
      serviceId: 'report_uni',
      topic: details.slice(0, 80),
      professorInstructions: details,
    });
  };

  const handleDirectWhatsApp = () => {
    const text = encodeURIComponent(`مرحباً فريق المنقذ الجامعي، لدي طلب مخصص بالتفاصيل التالية:\n${details.trim()}`);
    window.open(`https://wa.me/9647740080310?text=${text}`, '_blank');
  };

  return (
    <section id="custom-request-section" className="py-6 px-3.5 bg-slate-900 text-white border-b border-slate-800 font-['Cairo']">
      <div className="w-full">
        
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300 text-[10px] font-bold mb-1.5">
            <HelpCircle className="w-3 h-3 text-blue-400" />
            <span>طلب غير مدرج</span>
          </div>
          <h2 className="text-base font-black font-['Cairo'] text-white">
            لم تجد الخدمة التي تريدها؟
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            اكتب لنا بالتفصيل ماذا تحتاج وسيقوم المشرف بتقديره لك
          </p>
        </div>

        {/* Text Input Box */}
        <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700 shadow-md space-y-3">
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="اكتب لنا بالتفصيل: الموضوع، متطلبات الدكتور، عدد الصفحات، والجامعة..."
            className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
          />

          <div className="flex flex-col gap-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !details.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تحليل الطلب...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>تحليل الطلب وتجهيزه</span>
                </>
              )}
            </button>

            {/* Direct WhatsApp button */}
            <button
              onClick={handleDirectWhatsApp}
              disabled={!details.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال التفاصيل مباشرة لواتساب 07740080310</span>
            </button>
          </div>

          {/* Analysis Result Box */}
          {analysisResult && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>التصنيف المقترح: {analysisResult.classifiedCategory}</span>
                <span className="text-amber-400 font-mono">{formatIqd(analysisResult.estimatedPriceIqd)}</span>
              </div>
              <p className="text-[11px] text-slate-300">{analysisResult.adviceForStudent}</p>
              <button
                onClick={handleProceed}
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>متابعة إرسال هذا الطلب</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
