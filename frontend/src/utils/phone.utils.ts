/**
 * Phone number utility functions for Uzbek phone numbers (+998 XX XXX XX XX)
 */

export function cleanPhoneNumber(phone: string): string {
  // Extract all digits
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return phone.trim();
}

export function formatPhoneDisplay(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return phone;
}

export function applyPhoneMask(value: string): string {
  // If empty or user cleared
  if (!value) return '+998 ';

  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 9); // Max 9 digits after 998

  let formatted = '+998 ';
  if (digits.length > 0) {
    formatted += digits.slice(0, 2);
  }
  if (digits.length > 2) {
    formatted += ' ' + digits.slice(2, 5);
  }
  if (digits.length > 5) {
    formatted += ' ' + digits.slice(5, 7);
  }
  if (digits.length > 7) {
    formatted += ' ' + digits.slice(7, 9);
  }
  return formatted;
}
