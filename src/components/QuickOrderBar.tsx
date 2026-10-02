import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

interface ParsedOrderResult {
  serviceId?: string;
  topic?: string;
  universityName?: string;
  collegeName?: string;
  departmentName?: string;
  stage?: string;
  pageCount?: number;
  slideCount?: number;
  deliverySpeed?: string;
  professorInstructions?: string;
  summary?: string;
}

interface QuickOrderBarProps {
  onOrderParsed: (parsedData: ParsedOrderResult) => void;
}

export const QuickOrderBar: React.FC<QuickOrderBarProps> = ({ onOrderParsed }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const samplePrompts = [
    'تقرير فيزياء ميكانيكا الكم 15 صفحة جامعة النهرين',
    'بوربوينت ذكاء اصطناعي 14 شريحة جامعة بغداد',
    'تقرير تجربة مختبر هندسة الجامعة التكنولوجية',
  ];

  const handleStartOrder = async (overrideText?: string) => {
    const textToProcess = (overrideText || inputText).trim();
    if (!textToProcess) return;

    setLoading(true);
    setStatusMessage('جاري تحليل طلبك...');

    try {
      const response = await fetch('/api/ai/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data: ParsedOrderResult = await response.json();
      setStatusMessage('تم تجهيز طلبك!');
      setTimeout(() => {
        setLoading(false);
        setStatusMessage(null);
        onOrderParsed(data);
      }, 400);
    } catch {
      setLoading(false);
      setStatusMessage('تعذر تحليل النص حالياً. أعد المحاولة أو ابدأ طلباً يدوياً.');
    }
  };

  return (
    <div className="w-full text-right font-['Cairo']">
      <div className="bg-white rounded-2xl p-2.5 shadow-md border border-slate-200">
        
        {/* Label */}
        <div className="flex items-center justify-between pb-1.5 px-1 text-[11px] font-bold text-slate-700">
          <span className="flex items-center gap-1 text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>شنو تحتاج؟ اكتب طلبك هنا:</span>
          </span>
          <span className="text-[10px] text-slate-400">
            تقرير · بحث · بوربوينت
          </span>
        </div>

        {/* Input box */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={2}
          placeholder="مثال: «أريد تقرير فيزياء عن ميكانيكا الكم، 15 صفحة، المرحلة الثالثة، جامعة النهرين...»"
          className="w-full p-2 text-xs text-slate-900 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none resize-none leading-relaxed font-medium"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2 pt-2 mt-1">
          <span className="text-[10px] text-slate-500 truncate max-w-[170px]">
            {loading ? (
              <span className="text-blue-700 font-bold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {statusMessage}
              </span>
            ) : (
              '⚡ يتحول تلقائياً لنموذج رسمي'
            )}
          </span>

          <button
            onClick={() => handleStartOrder()}
            disabled={loading || !inputText.trim()}
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>ابدأ الطلب</span>
                <ArrowLeft className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Quick Prompt Suggestions */}
      <div className="mt-2 flex flex-wrap gap-1">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputText(prompt);
              handleStartOrder(prompt);
            }}
            className="text-[10px] text-slate-600 bg-white hover:bg-blue-50 border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer truncate max-w-[140px]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
