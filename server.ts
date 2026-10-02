import express from 'express';
import dotenv from 'dotenv';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { Pool, type PoolClient } from 'pg';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const database = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

app.use(express.json({ limit: '64kb' }));
app.set('trust proxy', 'loopback');

const ADMIN_SESSION_COOKIE = 'al_munqith_admin_session';
const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
const orderSubmissionLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'تم تجاوز عدد محاولات إرسال الطلبات. يرجى المحاولة لاحقاً.' },
});

function constantTimeEqual(left: string, right: string): boolean {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function createAdminSession(expiresAt: number): string {
  const signature = createHmac('sha256', process.env.SESSION_SECRET || '')
    .update(String(expiresAt))
    .digest('hex');
  return `${expiresAt}.${signature}`;
}

function hasValidAdminSession(req: express.Request): boolean {
  const cookie = req.headers.cookie?.split(';').map(value => value.trim())
    .find(value => value.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const session = cookie?.slice(ADMIN_SESSION_COOKIE.length + 1);
  const [expiresAtText, signature] = session?.split('.') || [];
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || !signature || !process.env.SESSION_SECRET) {
    return false;
  }
  return constantTimeEqual(signature, createAdminSession(expiresAt).split('.')[1]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

type PendingOrderPayload = Record<string, unknown> & {
  id: string;
  orderNumber: string;
  studentName: string;
  studentPhone: string;
  title: string;
  paymentMethod: 'wayl_online';
  paymentStatus: 'pending';
  status: 'awaiting_payment';
  totalPriceIqd: number;
  discountIqd: number;
  pointsDiscountIqd: number;
};

function isPendingOrder(value: unknown): value is PendingOrderPayload {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' &&
    /^ord-[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id) &&
    typeof value.orderNumber === 'string' && value.orderNumber.length > 0 && value.orderNumber.length <= 64 &&
    typeof value.studentName === 'string' && value.studentName.trim().length > 0 && value.studentName.length <= 200 &&
    typeof value.studentPhone === 'string' && value.studentPhone.trim().length > 0 && value.studentPhone.length <= 32 &&
    typeof value.title === 'string' && value.title.trim().length > 0 && value.title.length <= 2000 &&
    value.paymentMethod === 'wayl_online' &&
    value.paymentStatus === 'pending' &&
    value.status === 'awaiting_payment' &&
    isNonNegativeInteger(value.totalPriceIqd) &&
    isNonNegativeInteger(value.discountIqd) &&
    isNonNegativeInteger(value.pointsDiscountIqd);
}

const ORDER_STATUSES = [
  'awaiting_payment',
  'received',
  'confirmed',
  'in_progress',
  'quality_review',
  'ready',
  'delivered',
  'revision',
];

app.post('/api/admin/login', (req, res) => {
  const configuredPhone = process.env.ADMIN_PHONE;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPhone || !configuredPassword || !process.env.SESSION_SECRET) {
    return res.status(503).json({ error: 'Admin authentication is not configured on this server.' });
  }

  const { phone, password } = req.body || {};
  if (typeof phone !== 'string' || typeof password !== 'string' ||
      !constantTimeEqual(phone.replace(/\s+/g, ''), configuredPhone.replace(/\s+/g, '')) ||
      !constantTimeEqual(password, configuredPassword)) {
    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة.' });
  }

  const expiresAt = Date.now() + ADMIN_SESSION_SECONDS * 1000;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${createAdminSession(expiresAt)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${ADMIN_SESSION_SECONDS}${secure}`);
  return res.json({ authenticated: true });
});

app.get('/api/admin/session', (req, res) => {
  return res.json({ authenticated: hasValidAdminSession(req) });
});

app.post('/api/admin/logout', (_req, res) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`);
  return res.json({ authenticated: false });
});

app.get('/api/health', async (_req, res) => {
  if (!database) return res.status(503).json({ status: 'unavailable', database: 'not_configured' });
  try {
    await database.query('SELECT 1');
    return res.json({ status: 'ok', database: 'ready' });
  } catch (error) {
    console.error('Database health check failed:', error);
    return res.status(503).json({ status: 'unavailable', database: 'error' });
  }
});

app.post('/api/orders', orderSubmissionLimit, async (req, res) => {
  if (!database) {
    return res.status(503).json({ error: 'حفظ الطلبات غير متاح حالياً لأن قاعدة البيانات غير مهيأة.' });
  }
  if (!isPendingOrder(req.body)) {
    return res.status(400).json({ error: 'بيانات الطلب غير صالحة.' });
  }

  const order = req.body;
  const id = order.id.slice('ord-'.length);
  const discountIqd = order.discountIqd + order.pointsDiscountIqd;
  const subtotalIqd = order.totalPriceIqd + discountIqd;
  if (!Number.isSafeInteger(discountIqd) || !Number.isSafeInteger(subtotalIqd)) {
    return res.status(400).json({ error: 'مبالغ الطلب تتجاوز النطاق المقبول.' });
  }
  const persistedOrder = {
    ...order,
    paymentStatus: 'pending',
    paymentReference: 'بانتظار تفعيل بوابة Wayl',
    paidAt: undefined,
    status: 'awaiting_payment',
  };

  try {
    const result = await database.query(
      `INSERT INTO orders (
        id, order_number, student_name, student_phone, status, payment_status,
        subtotal_iqd, discount_iqd, total_iqd, details
      ) VALUES ($1, $2, $3, $4, 'awaiting_payment', 'pending', $5, $6, $7, $8::jsonb)
      RETURNING id, created_at`,
      [
        id,
        order.orderNumber,
        order.studentName.trim(),
        order.studentPhone.trim(),
        subtotalIqd,
        discountIqd,
        order.totalPriceIqd,
        JSON.stringify(persistedOrder),
      ],
    );

    return res.status(201).json({
      ...persistedOrder,
      id: `ord-${result.rows[0].id}`,
      createdAt: result.rows[0].created_at.toISOString(),
    });
  } catch (error) {
    console.error('Order persistence failed:', error);
    if (isRecord(error) && error.code === '23505') {
      return res.status(409).json({ error: 'رقم الطلب مستخدم مسبقاً. يرجى إعادة إرسال الطلب.' });
    }
    return res.status(500).json({ error: 'تعذر حفظ الطلب في قاعدة البيانات. يرجى المحاولة مجدداً.' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  if (!hasValidAdminSession(req)) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول إلى لوحة الإدارة.' });
  }
  if (!database) {
    return res.status(503).json({ error: 'قاعدة البيانات غير متاحة.' });
  }

  try {
    const result = await database.query(
      'SELECT id, order_number, status, payment_status, total_iqd, discount_iqd, details, created_at FROM orders ORDER BY created_at DESC',
    );
    const orders = result.rows.map(row => {
      const details = isRecord(row.details) ? row.details : {};
      return {
        ...details,
        id: `ord-${row.id}`,
        orderNumber: row.order_number,
        status: row.status,
        paymentStatus: row.payment_status,
        totalPriceIqd: Number(row.total_iqd),
        discountIqd: Number(row.discount_iqd),
        createdAt: row.created_at.toISOString(),
      };
    });
    return res.json({ orders });
  } catch (error) {
    console.error('Admin order retrieval failed:', error);
    return res.status(500).json({ error: 'تعذر تحميل الطلبات من قاعدة البيانات.' });
  }
});

app.put('/api/admin/orders/:id', async (req, res) => {
  if (!hasValidAdminSession(req)) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول إلى لوحة الإدارة.' });
  }
  if (!database) {
    return res.status(503).json({ error: 'قاعدة البيانات غير متاحة.' });
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id) ||
      !isRecord(req.body) || typeof req.body.status !== 'string' ||
      !ORDER_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: 'تحديث الطلب غير صالح.' });
  }

  let client: PoolClient | undefined;
  let transactionStarted = false;
  try {
    client = await database.connect();
    await client.query('BEGIN');
    transactionStarted = true;
    const currentResult = await client.query(
      'SELECT order_number, status, payment_status, total_iqd, discount_iqd, details, created_at FROM orders WHERE id = $1 FOR UPDATE',
      [req.params.id],
    );
    const current = currentResult.rows[0];
    if (!current) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({ error: 'الطلب غير موجود.' });
    }
    if (current.payment_status !== 'paid' && req.body.status !== 'awaiting_payment') {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(409).json({ error: 'لا يمكن بدء تنفيذ الطلب قبل تأكيد السداد من بوابة الدفع.' });
    }

    const details = isRecord(current.details) ? current.details : {};
    const updatedOrder = {
      ...details,
      ...req.body,
      id: `ord-${req.params.id}`,
      orderNumber: current.order_number,
      paymentMethod: 'wayl_online',
      paymentStatus: current.payment_status,
      totalPriceIqd: Number(current.total_iqd),
      discountIqd: Number(current.discount_iqd),
      createdAt: current.created_at.toISOString(),
    };
    await client.query(
      'UPDATE orders SET status = $1, details = $2::jsonb, updated_at = now() WHERE id = $3',
      [updatedOrder.status, JSON.stringify(updatedOrder), req.params.id],
    );
    await client.query('COMMIT');
    transactionStarted = false;
    return res.json({ order: updatedOrder });
  } catch (error) {
    if (client && transactionStarted) await client.query('ROLLBACK');
    console.error('Admin order update failed:', error);
    return res.status(500).json({ error: 'تعذر حفظ تحديث الطلب.' });
  } finally {
    client?.release();
  }
});

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
    return res.status(503).json({ error: 'Custom request analysis is not configured.' });
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
    return res.status(502).json({ error: 'Custom request analysis failed.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && !database) {
    throw new Error('DATABASE_URL is required in production; refusing to start without persistent order storage.');
  }
  if (database) await database.query('SELECT 1');

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

  app.listen(PORT, isDev ? '0.0.0.0' : '127.0.0.1', () => {
    console.log(`[المنقذ الجامعي] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
});
