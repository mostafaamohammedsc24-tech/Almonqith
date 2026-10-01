import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI client if key exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback rule-based extractor for Iraqi dialect & Arabic student prompts
function fallbackParseOrder(text: string) {
  const lower = text.toLowerCase();
  
  let serviceId = 'report_uni';
  if (lower.includes('بوربوينت') || lower.includes('عرض') || lower.includes('شريحة') || lower.includes('شرائح') || lower.includes('powerpoint') || lower.includes('سيمينار') || lower.includes('seminar')) {
    serviceId = 'ppt_standard';
  } else if (lower.includes('بحث تخرج') || lower.includes('مشروع تخرج') || lower.includes('اطروحة') || lower.includes('أطروحة')) {
    serviceId = 'grad_research';
  } else if (lower.includes('بحث') || lower.includes('ورقة علمية')) {
    serviceId = 'research_uni';
  } else if (lower.includes('مختبر') || lower.includes('تجربة') || lower.includes('lab') || lower.includes('ريبورت مختبر')) {
    serviceId = 'lab_report';
  } else if (lower.includes('تلخيص') || lower.includes('ملزمة') || lower.includes('محاضرة')) {
    serviceId = 'summary_lecture';
  } else if (lower.includes('حل مسائل') || lower.includes('واجب') || lower.includes('هومورك') || lower.includes('homework')) {
    serviceId = 'problem_solving';
  } else if (lower.includes('تنسيق')) {
    serviceId = 'format_thesis';
  } else if (lower.includes('احصاء') || lower.includes('إحصاء') || lower.includes('spss')) {
    serviceId = 'statistical_analysis';
  }

  // University extraction
  let universityName = 'جامعة بغداد';
  if (text.includes('النهرين')) universityName = 'جامعة النهرين';
  else if (text.includes('المستنصرية')) universityName = 'الجامعة المستنصرية';
  else if (text.includes('التكنولوجية')) universityName = 'الجامعة التكنولوجية';
  else if (text.includes('البصرة')) universityName = 'جامعة البصرة';
  else if (text.includes('الموصل')) universityName = 'جامعة الموصل';
  else if (text.includes('الكوفة')) universityName = 'جامعة الكوفة';
  else if (text.includes('بابل')) universityName = 'جامعة بابل';
  else if (text.includes('كربلاء')) universityName = 'جامعة كربلاء';
  else if (text.includes('تكريت')) universityName = 'جامعة تكريت';
  else if (text.includes('الأنبار') || text.includes('الانبار')) universityName = 'جامعة الأنبار';
  else if (text.includes('ديالى')) universityName = 'جامعة ديالى';
  else if (text.includes('التراث')) universityName = 'جامعة التراث الأهلية';
  else if (text.includes('المأمون')) universityName = 'كلية المأمون الجامعة الأهلية';
  else if (text.includes('دجلة')) universityName = 'كلية دجلة الجامعة الأهلية';

  // College & Department
  let collegeName = 'كلية العلوم';
  let departmentName = 'قسم الفيزياء';
  if (text.includes('هندسة') || text.includes('الهندسة')) {
    collegeName = 'كلية الهندسة';
    departmentName = text.includes('مدني') ? 'قسم الهندسة المدنية' : (text.includes('حاسوب') ? 'قسم هندسة الحاسوب' : 'قسم الهندسة الميكانيكية');
  } else if (text.includes('طب') || text.includes('الطب')) {
    collegeName = 'كلية الطب';
    departmentName = 'الطب العام وجراحة الجسم';
  } else if (text.includes('صيدلة') || text.includes('الصيدلة')) {
    collegeName = 'كلية الصيدلة';
    departmentName = 'قسم الصيدلانيات والسريرية';
  } else if (text.includes('ادارة') || text.includes('إدارة') || text.includes('اقتصاد')) {
    collegeName = 'كلية الإدارة والاقتصاد';
    departmentName = text.includes('محاسبة') ? 'قسم المحاسبة' : 'قسم إدارة الأعمال';
  } else if (text.includes('قانون') || text.includes('حقوق')) {
    collegeName = 'كلية القانون';
    departmentName = 'قسم القانون العام';
  } else if (text.includes('حاسوب') || text.includes('برمجة') || text.includes('ذكاء اصطناعي')) {
    collegeName = 'كلية تكنولوجيا المعلومات والاتصالات';
    departmentName = 'قسم علوم الحاسوب والذكاء الاصطناعي';
  }

  // Stage
  let stage: 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4' | 'postgrad' = 'stage_3';
  if (text.includes('أولى') || text.includes('اولى') || text.includes('مرحلة 1') || text.includes('مرحلة ١')) stage = 'stage_1';
  else if (text.includes('ثانية') || text.includes('ثانيه') || text.includes('مرحلة 2') || text.includes('مرحلة ٢')) stage = 'stage_2';
  else if (text.includes('ثالثة') || text.includes('ثالثه') || text.includes('مرحلة 3') || text.includes('مرحلة ٣')) stage = 'stage_3';
  else if (text.includes('رابعة') || text.includes('رابعه') || text.includes('مرحلة 4') || text.includes('تخرج')) stage = 'stage_4';
  else if (text.includes('ماجستير') || text.includes('دكتوراه') || text.includes('دراسات عليا')) stage = 'postgrad';

  // Pages / Slides
  const pageMatch = text.match(/(\d+)\s*(صفحة|صفحات|ورقة|ورقات|اوراق|pages)/);
  const pageCount = pageMatch ? parseInt(pageMatch[1], 10) : (serviceId === 'report_uni' ? 10 : 15);

  const slideMatch = text.match(/(\d+)\s*(شريحة|سلايد|شرائح|slides)/);
  const slideCount = slideMatch ? parseInt(slideMatch[1], 10) : 15;

  // Deadline & speed
  let deliverySpeed: 'normal' | 'hours_24' | 'hours_12' | 'hours_6' = 'hours_24';
  if (text.includes('باچر') || text.includes('غدا') || text.includes('غداً') || text.includes('24 ساعة')) {
    deliverySpeed = 'hours_24';
  } else if (text.includes('اليوم') || text.includes('عاجل جدا') || text.includes('6 ساعات')) {
    deliverySpeed = 'hours_6';
  } else if (text.includes('12 ساعة') || text.includes('الليلة')) {
    deliverySpeed = 'hours_12';
  }

  // Clean topic extraction
  let topic = text;
  // Remove starting request verbs
  topic = topic.replace(/^(أريد|اريد|عندي|محتاج|محتاجة|طلب)\s+/i, '');
  topic = topic.replace(/^(تقرير|بحث|عرض|بوربوينت|سيمينار|ملخص|حل مسائل|حل واجب)\s+/i, '');
  topic = topic.replace(/^(عن|في|بخصوص)\s+/i, '');
  // Remove university, stage, pages, and delivery clauses from the end
  topic = topic.split(/،|,/)[0].trim();
  topic = topic.replace(/(جامعة|كلية|قسم|مرحلة|تسليم|خلال|باچر|غدا|اليوم|\d+\s*(صفحة|شريحة)).*$/gi, '').trim();
  if (!topic || topic.length < 3) {
    topic = text.slice(0, 45).trim();
  }

  return {
    serviceId,
    topic,
    universityName,
    collegeName,
    departmentName,
    stage,
    pageCount,
    slideCount,
    deliverySpeed,
    professorInstructions: text,
    summary: `تم تحليل طلبك بنجاح (${universityName} - ${collegeName} - المرحلة ${stage === 'postgrad' ? 'الدراسات العليا' : stage.replace('stage_', '')})`,
  };
}

// 1. API route: AI order text parsing (from quick search bar or freeform prompt)
app.post('/api/ai/parse-order', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  if (!aiClient) {
    // Return robust rule-based extractor
    return res.json(fallbackParseOrder(text));
  }

  try {
    const prompt = `أنت المساعد الذكي لمنصة "المنقذ الجامعي" في العراق.
حلل الطلب الطلابي العراقي التالي واستخرج منه بدقة الحقول التالية بصيغة JSON:
الطلب: "${text}"

الخيارات المتاحة:
- serviceId: واحد من:
  'report_uni' (تقرير جامعي),
  'research_uni' (بحث جامعي فصلي),
  'grad_research' (بحث تخرج),
  'grad_project' (مشروع تخرج تطبيقي),
  'lab_report' (تقرير مختبر),
  'ppt_standard' (عرض تقديمي PowerPoint),
  'seminar_presentation' (عرض سيمينار),
  'summary_lecture' (تلخيص محاضرة),
  'problem_solving' (حل مسائل وواجبات),
  'format_thesis' (تنسيق بحث وتخرج),
  'statistical_analysis' (تحليل إحصائي SPSS)
- universityName: اسم الجامعة العراقية (مثلاً: جامعة بغداد، جامعة النهرين، الجامعة المستنصرية، الجامعة التكنولوجية، جامعة البصرة، جامعة الموصل، جامعة الكوفة، جامعة بابل، كلية المأمون، جامعة التراث، الخ)
- collegeName: اسم الكلية المناسبة للتخصص
- departmentName: اسم القسم المناسب
- stage: واحد من ('stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5_6', 'postgrad')
- topic: عنوان الموضوع الصافي بدون عبارات الطلب
- pageCount: عدد الصفحات كرقم (افتراضي 10 للتقارير)
- slideCount: عدد الشرائح كرقم للعروض (افتراضي 15)
- deliverySpeed: واحد من ('hours_6', 'hours_12', 'hours_24', 'hours_48', 'normal')
- professorInstructions: أي تعليمات خاصة ذكرها الطالب أو الأستاذ
- summary: جملة عراقية لطيفة ومطمئنة تلخص ما فهمته من طلبه وتشجعه على المتابعة`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            serviceId: { type: Type.STRING },
            universityName: { type: Type.STRING },
            collegeName: { type: Type.STRING },
            departmentName: { type: Type.STRING },
            stage: { type: Type.STRING },
            topic: { type: Type.STRING },
            pageCount: { type: Type.INTEGER },
            slideCount: { type: Type.INTEGER },
            deliverySpeed: { type: Type.STRING },
            professorInstructions: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ['serviceId', 'universityName', 'stage', 'topic', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err) {
    console.error('Gemini parse error, falling back to rule-based:', err);
    return res.json(fallbackParseOrder(text));
  }
});

// 2. API route: Custom request analysis ("لم تجد الخدمة التي تريدها؟")
app.post('/api/ai/analyze-custom', async (req, res) => {
  const { details } = req.body;
  if (!details || typeof details !== 'string') {
    return res.status(400).json({ error: 'Details are required' });
  }

  if (!aiClient) {
    return res.json({
      classifiedCategory: 'مهمة أكاديمية مخصصة',
      estimatedDays: 2,
      estimatedPriceIqd: 25000,
      complexity: 'متوسط',
      suggestedDeliverables: ['ملف DOCX منسق بالكامل', 'نسخة PDF معتمدة', 'تقرير مراجعة الجودة الأكاديمية'],
      adviceForStudent: 'طلبك واضح ومتاح لفريقنا الأكاديمي، سنقوم بالتواصل معك لتأكيد كافة التفاصيل قبل البدء.',
    });
  }

  try {
    const prompt = `حلل هذا الطلب الجامعي المخصص من طالب عراقي:
"${details}"

استخرج JSON يحتوي على:
- classifiedCategory: تصنيف العمل
- estimatedDays: الوقت المتوقع بالأيام
- estimatedPriceIqd: السعر التقديري بالدينار العراقي (مثلاً بين 15000 إلى 50000)
- complexity: مدى التعقيد (بسيط / متوسط / متقدم / دراسات عليا)
- suggestedDeliverables: مصفوفة بالصيغ والملفات التي سيستلمها الطالب
- adviceForStudent: نصيحة ودية عراقية للطالب وتأكيد قدرة المنقذ الجامعي على إنجازها بدقة`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classifiedCategory: { type: Type.STRING },
            estimatedDays: { type: Type.INTEGER },
            estimatedPriceIqd: { type: Type.INTEGER },
            complexity: { type: Type.STRING },
            suggestedDeliverables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            adviceForStudent: { type: Type.STRING },
          },
          required: ['classifiedCategory', 'estimatedPriceIqd', 'complexity', 'suggestedDeliverables'],
        },
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    console.error('Custom request analysis error:', err);
    return res.json({
      classifiedCategory: 'طلب جامعي خاص',
      estimatedDays: 2,
      estimatedPriceIqd: 25000,
      complexity: 'متوسط',
      suggestedDeliverables: ['ملف Word مفتوح', 'ملف PDF جاهز للتسليم'],
      adviceForStudent: 'فريق المنقذ الجامعي جاهز لتنفيذ طلبك بأعلى دقة.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[المنقذ الجامعي] Server running on http://localhost:${PORT}`);
  });
}

startServer();
