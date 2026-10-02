import { ServiceItem, DeliverySpeed, AcademicStage } from '../types';

export interface PriceCalculationInput {
  service: ServiceItem;
  pageCount?: number;
  slideCount?: number;
  stage: AcademicStage;
  deliverySpeed: DeliverySpeed;
  needsReferences: boolean;
  referenceCount?: number;
  specialFormatting?: boolean;
  couponCode?: string;
  useLoyaltyPoints?: number; // 100 points = 1,000 IQD
  additionalFeeIds?: string[];
}

export interface PriceBreakdown {
  basePriceIqd: number;
  volumeMultiplier: number;
  volumeLabel: string;
  volumePriceIqd: number;
  complexityFeeIqd: number;
  formattingFeeIqd: number;
  referencesFeeIqd: number;
  additionalFees: { id: string; label: string; amountIqd: number }[];
  urgencyFeeIqd: number;
  flexibleDiscountIqd: number; // 25% discount for deadlines > 48 hours
  subtotalIqd: number;
  discountIqd: number;
  pointsDiscountIqd: number;
  totalPriceIqd: number;
  isUrgentFeasible: boolean;
  unfeasibleReason?: string;
}

export interface AdminPricingConfig {
  serviceBasePrices: Record<string, number>;
  pricePerPageRegular: number; // default 2000
  pricePerPageGrad: number; // default 3500
  pricePerSlide: number; // default 1500
  flexibleDiscountPercent: number; // default 25% (for >48 hours or normal)
  hours12UrgencyPercent: number;
  hours6UrgencyPercent: number;
  formattingFee: number; // default 3000
  additionalFees: { id: string; label: string; amountIqd: number }[];
}

const PRICING_CONFIG_KEY = 'al_munqith_pricing_config_v2';

export const DEFAULT_PRICING_CONFIG: AdminPricingConfig = {
  serviceBasePrices: {
    report_uni: 10000,
    research_uni: 25000,
    grad_project: 75000,
    ppt_seminar: 15000,
    format_plagiarism: 10000,
    summarize_questions: 12000,
    grad_research: 50000,
    translation_academic: 8000,
  },
  pricePerPageRegular: 2000,
  pricePerPageGrad: 3500,
  pricePerSlide: 1500,
  flexibleDiscountPercent: 25, // 25% discount for flexible/late deadlines (>48 hours)
  hours12UrgencyPercent: 25,
  hours6UrgencyPercent: 50,
  formattingFee: 3000,
  additionalFees: [],
};

export function getAdminPricingConfig(): AdminPricingConfig {
  try {
    const raw = localStorage.getItem(PRICING_CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(PRICING_CONFIG_KEY, JSON.stringify(DEFAULT_PRICING_CONFIG));
      return DEFAULT_PRICING_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PRICING_CONFIG,
      ...parsed,
      serviceBasePrices: {
        ...DEFAULT_PRICING_CONFIG.serviceBasePrices,
        ...(parsed.serviceBasePrices || {}),
      },
      additionalFees: Array.isArray(parsed.additionalFees) ? parsed.additionalFees : [],
    };
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
}

export function saveAdminPricingConfig(config: AdminPricingConfig): void {
  try {
    localStorage.setItem(PRICING_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save admin pricing config', e);
  }
}

export function resetAdminPricingConfig(): AdminPricingConfig {
  try {
    localStorage.setItem(PRICING_CONFIG_KEY, JSON.stringify(DEFAULT_PRICING_CONFIG));
  } catch {}
  return DEFAULT_PRICING_CONFIG;
}

export interface AdminCoupon {
  code: string;
  discountType?: 'percent' | 'fixed';
  discountPercent: number; // 100 or 50 or other %
  discountAmountIqd?: number; // Fixed amount in IQD if discountType is 'fixed'
  maxDiscountIqd: number;
  label: string;
  createdAt: string;
  active: boolean;
  note?: string;
  usageCount?: number;
  maxUses?: number | null;
}

const COUPONS_STORAGE_KEY = 'al_munqith_admin_coupons_v4';

export function getAdminCoupons(): AdminCoupon[] {
  try {
    const raw = localStorage.getItem(COUPONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAdminCoupons(coupons: AdminCoupon[]): void {
  try {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
  } catch (e) {
    console.error('Failed to save coupons', e);
  }
}

export function addAdminCoupon(coupon: AdminCoupon): void {
  const current = getAdminCoupons();
  const existsIdx = current.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
  if (existsIdx >= 0) {
    current[existsIdx] = coupon;
  } else {
    current.unshift(coupon);
  }
  saveAdminCoupons(current);
}

export function deleteAdminCoupon(code: string): void {
  const current = getAdminCoupons().filter(c => c.code.toUpperCase() !== code.toUpperCase());
  saveAdminCoupons(current);
}

export function toggleAdminCouponActive(code: string): void {
  const current = getAdminCoupons().map(c => 
    c.code.toUpperCase() === code.toUpperCase() ? { ...c, active: !c.active } : c
  );
  saveAdminCoupons(current);
}

export function incrementCouponUsage(code: string): void {
  const current = getAdminCoupons().map(c => 
    c.code.toUpperCase() === code.toUpperCase() ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c
  );
  saveAdminCoupons(current);
}

export function findCoupon(code: string): AdminCoupon | undefined {
  const coupons = getAdminCoupons();
  return coupons.find(c =>
    c.code.toUpperCase() === code.trim().toUpperCase() &&
    c.active &&
    (c.maxUses == null || (c.usageCount || 0) < c.maxUses)
  );
}

export function calculateOrderPrice(input: PriceCalculationInput): PriceBreakdown {
  const { service, stage, deliverySpeed, needsReferences, referenceCount = 0, specialFormatting = true, couponCode, useLoyaltyPoints = 0 } = input;

  // Retrieve flexible admin-configured pricing
  const config = getAdminPricingConfig();
  const configuredBasePrice = config.serviceBasePrices[service.id] ?? service.basePriceIqd;
  const selectedAdditionalFees = config.additionalFees.filter(fee =>
    input.additionalFeeIds?.includes(fee.id) && fee.label.trim() && Number.isFinite(fee.amountIqd) && fee.amountIqd >= 0
  );
  const additionalFeesTotal = selectedAdditionalFees.reduce((sum, fee) => sum + fee.amountIqd, 0);

  let basePrice = configuredBasePrice;
  let volumePrice = 0;
  let volumeMultiplier = 1;
  let volumeLabel = 'خدمة أساسية';

  if (service.category === 'reports_research') {
    const pages = Math.max(1, input.pageCount || (service.id.includes('report') ? 6 : 15));
    if (pages > 5) {
      const extraPages = pages - 5;
      const pricePerPage = service.id.includes('grad') ? config.pricePerPageGrad : config.pricePerPageRegular;
      volumePrice = extraPages * pricePerPage;
      volumeLabel = `${pages} صفحات (${extraPages} صفحة إضافية)`;
    } else {
      volumeLabel = `${pages} صفحات`;
    }
  } else if (service.category === 'presentations') {
    const slides = Math.max(5, input.slideCount || 12);
    if (slides > 10) {
      const extraSlides = slides - 10;
      volumePrice = extraSlides * config.pricePerSlide;
      volumeLabel = `${slides} شريحة (${extraSlides} شريحة إضافية)`;
    } else {
      volumeLabel = `${slides} شريحة`;
    }
  }

  // Stage / Academic complexity multiplier
  let complexityFee = 0;
  if (stage === 'postgrad') {
    complexityFee = Math.round(basePrice * 0.4); // +40% for Master/PhD level
  } else if (stage === 'stage_4' || stage === 'stage_5_6') {
    complexityFee = Math.round(basePrice * 0.15); // +15% for Graduation/Senior level
  }

  // Formatting
  let formattingFee = specialFormatting ? config.formattingFee : 0;

  // References fee
  let referencesFee = 0;
  if (needsReferences) {
    if (referenceCount > 10) {
      referencesFee = 5000;
    } else if (referenceCount > 5) {
      referencesFee = 3000;
    } else {
      referencesFee = 2000;
    }
  }

  // Urgency percentages apply to the work price before optional formatting and references.
  let urgencyFee = 0;
  let flexibleDiscountIqd = 0;
  let isUrgentFeasible = true;
  let unfeasibleReason: string | undefined = undefined;

  const estimatedPages = input.pageCount || 10;
  if (deliverySpeed === 'hours_6') {
    if (service.minDurationHours > 6 || estimatedPages > 15 || service.id.includes('grad_project') || service.id.includes('grad_research')) {
      isUrgentFeasible = false;
      unfeasibleReason = 'نظراً لحجم العمل ومتطلبات الجودة العالية، لا يمكن تسليم هذا المشروع خلال 6 ساعات. أقرب موعد متاح هو خلال 24-48 ساعة.';
    } else {
      urgencyFee = Math.round((basePrice + volumePrice + complexityFee) * config.hours6UrgencyPercent / 100);
    }
  } else if (deliverySpeed === 'hours_12') {
    if (service.minDurationHours > 12 || estimatedPages > 30 || service.id.includes('grad_project')) {
      isUrgentFeasible = false;
      unfeasibleReason = 'هذا العمل يتطلب وقتاً أطول للتدقيق. يرجى اختيار موعد تسليم لا يقل عن 24 إلى 48 ساعة.';
    } else {
      urgencyFee = Math.round((basePrice + volumePrice + complexityFee) * config.hours12UrgencyPercent / 100);
    }
  } else if (deliverySpeed === 'hours_24') {
    urgencyFee = 0;
    if (service.minDurationHours > 24) {
      isUrgentFeasible = false;
      unfeasibleReason = 'المدة الدنيا لهذه الخدمة أطول من 24 ساعة. اختر موعداً مرناً لا يقل عن 48 ساعة.';
    }
  } else if (deliverySpeed === 'hours_48' || deliverySpeed === 'normal') {
    urgencyFee = 0;
    const discountRate = (config.flexibleDiscountPercent || 25) / 100;
    flexibleDiscountIqd = Math.round((basePrice + volumePrice + complexityFee + formattingFee + referencesFee + additionalFeesTotal) * discountRate);
  }

  const subtotalBeforeDiscounts = basePrice + volumePrice + complexityFee + formattingFee + referencesFee + additionalFeesTotal + urgencyFee;
  const subtotalAfterFlexibleDiscount = Math.max(0, subtotalBeforeDiscounts - flexibleDiscountIqd);

  // Coupon discount: only admin-created coupons are recognized.
  let couponDiscountIqd = 0;
  if (couponCode) {
    const cleanCode = couponCode.trim().toUpperCase();
    const dynamicFound = findCoupon(cleanCode);
    if (dynamicFound) {
      if (dynamicFound.discountType === 'fixed' && dynamicFound.discountAmountIqd) {
        couponDiscountIqd = Math.min(dynamicFound.discountAmountIqd, dynamicFound.maxDiscountIqd || subtotalAfterFlexibleDiscount, subtotalAfterFlexibleDiscount);
      } else {
        if (dynamicFound.discountPercent === 100) {
          couponDiscountIqd = subtotalAfterFlexibleDiscount; // 100% complete waiver
        } else {
          couponDiscountIqd = Math.min(Math.round((subtotalAfterFlexibleDiscount * dynamicFound.discountPercent) / 100), dynamicFound.maxDiscountIqd);
        }
      }
    }
  }

  // Combined discount (coupon + flexible delivery discount)
  const totalDiscounts = couponDiscountIqd + flexibleDiscountIqd;

  // Loyalty points
  let pointsDiscountIqd = 0;
  if (useLoyaltyPoints > 0) {
    const rawPointVal = useLoyaltyPoints * 10;
    const maxAllowedFromPoints = Math.round(subtotalAfterFlexibleDiscount * 0.3);
    pointsDiscountIqd = Math.min(rawPointVal, maxAllowedFromPoints);
  }

  const rawTotal = subtotalBeforeDiscounts - totalDiscounts - pointsDiscountIqd;
  const totalPriceIqd = totalDiscounts >= subtotalBeforeDiscounts ? 0 : Math.max(0, rawTotal);

  return {
    basePriceIqd: basePrice,
    volumeMultiplier,
    volumeLabel,
    volumePriceIqd: volumePrice,
    complexityFeeIqd: complexityFee,
    formattingFeeIqd: formattingFee,
    referencesFeeIqd: referencesFee,
    additionalFees: selectedAdditionalFees,
    urgencyFeeIqd: urgencyFee,
    flexibleDiscountIqd,
    subtotalIqd: subtotalBeforeDiscounts,
    discountIqd: totalDiscounts,
    pointsDiscountIqd,
    totalPriceIqd,
    isUrgentFeasible,
    unfeasibleReason,
  };
}

export function formatIqd(amount: number): string {
  return amount.toLocaleString('en-US') + ' د.ع';
}
