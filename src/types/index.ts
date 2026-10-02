export type ServiceCategory = 
  | 'reports_research'    // التقارير والبحوث
  | 'presentations'       // العروض التقديمية
  | 'files_formatting'    // خدمات الملفات والتنسيق
  | 'lectures_summaries'  // خدمات المحاضرات والتلخيص
  | 'scientific_stats'    // خدمات علمية وإحصائية
  | 'custom';             // طلب مخصص

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  shortDesc: string;
  basePriceIqd: number;
  priceUnit: 'page' | 'slide' | 'project' | 'file';
  minDurationHours: number;
  popular?: boolean;
  features: string[];
  deliverables: string[];
}

export interface University {
  id: string;
  name: string;
  type: 'public' | 'private';
  city: string;
  colleges: College[];
}

export interface College {
  id?: string;
  name: string;
  departments: Department[];
}

export interface Department {
  id?: string;
  name: string;
}

export type AcademicStage = 
  | 'stage_1' // الأولى
  | 'stage_2' // الثانية
  | 'stage_3' // الثالثة
  | 'stage_4' // الرابعة
  | 'stage_5_6' // الخامسة / السادسة
  | 'postgrad'; // الدراسات العليا (ماجستير / دكتوراه)

export type DeliverySpeed = 
  | 'normal'     // عادي (3-5 أيام)
  | 'hours_48'   // خلال 48 ساعة
  | 'hours_24'   // خلال 24 ساعة
  | 'hours_12'   // خلال 12 ساعة
  | 'hours_6'
  | (string & {}); // إضافات مخصصة من الإدارة

export type OrderStatus = 
  | 'awaiting_payment' // بانتظار الدفع
  | 'received'       // تم استلام الطلب
  | 'confirmed'      // تم تأكيد التفاصيل
  | 'in_progress'    // قيد التنفيذ الأكاديمي
  | 'quality_review' // مراجعة الجودة (QA)
  | 'ready'          // جاهز للتسليم
  | 'delivered'      // تم التسليم
  | 'revision';      // قيد التعديل

export type WorkerRole = 
  | 'Academic Writer'
  | 'Subject Specialist'
  | 'Presentation Designer'
  | 'Reviewer'
  | 'Quality Control'
  | 'Customer Support';

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  specialty: string;
  activeOrdersCount: number;
  rating: number;
}

export interface OrderAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt: string;
  isDeliverable?: boolean;
}

export interface OrderMessage {
  id: string;
  sender: 'student' | 'team' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
  attachmentName?: string;
}

export interface RevisionRequest {
  id: string;
  requestedAt: string;
  type: 'content' | 'formatting' | 'extra_pages' | 'references' | 'presentation' | 'professor_notes';
  notes: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #10294
  createdAt: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  
  // Academic context
  studentName?: string;
  studentPhone?: string;
  supervisorName?: string;
  universityName: string;
  collegeName: string;
  departmentName: string;
  stage: AcademicStage;
  subjectName: string;
  title: string;

  // Work specifications
  pageCount?: number;
  slideCount?: number;
  language: 'ar' | 'en' | 'ku';
  fileFormat: ('pdf' | 'docx' | 'pptx')[];
  needsReferences: boolean;
  referenceCount?: number;
  citationStyle?: 'APA' | 'IEEE' | 'MLA' | 'Chicago' | 'Harvard' | 'Vancouver' | 'Other';
  presentationStyle?: 'academic' | 'formal' | 'scientific' | 'minimal' | 'medical' | 'engineering' | 'dark' | 'university_branded';
  
  // Instructions & files
  professorInstructions: string;
  studentNotes?: string;
  attachments: OrderAttachment[];
  deliverableFiles?: OrderAttachment[];

  // Time & Pricing
  deliverySpeed: DeliverySpeed;
  deadlineDate: string;
  deadlineDisplay: string;
  basePriceIqd: number;
  volumePriceIqd?: number;
  complexityFeeIqd?: number;
  formattingFeeIqd: number;
  referencesFeeIqd?: number;
  urgencyFeeIqd: number;
  flexibleDiscountIqd?: number;
  pointsDiscountIqd?: number;
  discountIqd: number;
  totalPriceIqd: number;
  additionalFees?: { id: string; label: string; amountIqd: number }[];
  couponCode?: string;
  pointsUsed?: number;

  // Payment
  paymentMethod: 'wayl_online';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentReference?: string;
  paidAt?: string;
  verificationCode?: string; // e.g. VRF-8392

  // State & Management
  status: OrderStatus;
  statusTimeline: {
    status: OrderStatus;
    label: string;
    timestamp?: string;
    completed: boolean;
  }[];
  assignedWorker?: {
    id: string;
    name: string;
    role: WorkerRole;
  };
  messages: OrderMessage[];
  revisions: RevisionRequest[];
  
  // Review
  rating?: number;
  reviewComment?: string;
  deliveredAt?: string;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface PointsTransaction {
  id: string;
  title: string;
  points: number; // positive for earn, negative for redeem
  date: string;
  type: 'earn' | 'redeem' | 'bonus';
  orderId?: string;
  orderNumber?: string;
}

export interface StudentProfile {
  name: string;
  phone: string;
  university: string;
  college: string;
  department: string;
  stage: AcademicStage;
  loyaltyPoints: number;
  totalEarnedPoints?: number;
  loyaltyTier?: LoyaltyTier;
  dailyStreak?: number;
  lastCheckInDate?: string;
  referralCode?: string;
  referredByCode?: string;
  isRegistered?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'payment' | 'delivery' | 'points' | 'system';
  read: boolean;
  orderId?: string;
  orderNumber?: string;
  linkView?: 'home' | 'services' | 'orders' | 'order_wizard';
}

export interface ReviewItem {
  id: string;
  studentName: string;
  university: string;
  college: string;
  service: string;
  rating: number;
  date: string;
  comment: string;
  deliveryOnTime: boolean;
}
