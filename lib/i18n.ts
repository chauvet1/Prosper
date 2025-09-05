export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

// Cookie-based locale detection
export function getLocaleFromCookie(): Locale {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
    if (localeCookie) {
      const locale = localeCookie.split('=')[1] as Locale;
      return locales.includes(locale) ? locale : defaultLocale;
    }
  }
  return defaultLocale;
}

export function setLocaleCookie(locale: Locale) {
  if (typeof document !== 'undefined') {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`; // 1 year
  }
}
