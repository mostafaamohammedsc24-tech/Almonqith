const configuredWhatsAppNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
const configuredAppUrl = (import.meta.env.VITE_APP_URL || import.meta.env.APP_URL || '') as string | undefined;
const defaultWhatsAppNumber = '9647740080310';

function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `964${digits.slice(1)}`;
  return digits;
}

export function getAppBaseUrl(): string {
  const candidate = (configuredAppUrl || (typeof window !== 'undefined' ? window.location.origin : '')).trim();
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return url.origin;
  } catch {
    return '';
  }
}

export function getReferralUrl(referralCode: string): string {
  const baseUrl = getAppBaseUrl();
  if (!baseUrl || !referralCode.trim()) return '';
  const url = new URL(baseUrl);
  url.searchParams.set('ref', referralCode.trim());
  return url.toString();
}

export function getWhatsAppUrl(message = '', phone?: string): string {
  const target = normalizeWhatsAppNumber(phone || configuredWhatsAppNumber || defaultWhatsAppNumber);
  const baseUrl = `https://wa.me/${target}`;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `${baseUrl}${query}`;
}