// Currency conversion service
// Note: These are approximate exchange rates - for production, use a real-time API

export interface ExchangeRate {
    currency: string;
    rate: number; // Rate relative to USD (1 USD = rate * currency)
    lastUpdated: string;
  }
  
  // Approximate exchange rates (should be updated regularly in production)
  const EXCHANGE_RATES: Record<string, ExchangeRate> = {
    USD: { currency: 'USD', rate: 1.0, lastUpdated: '2024-01-01' },
    EUR: { currency: 'EUR', rate: 0.85, lastUpdated: '2024-01-01' },
    GBP: { currency: 'GBP', rate: 0.73, lastUpdated: '2024-01-01' },
    JPY: { currency: 'JPY', rate: 110.0, lastUpdated: '2024-01-01' },
    CAD: { currency: 'CAD', rate: 1.25, lastUpdated: '2024-01-01' },
    AUD: { currency: 'AUD', rate: 1.35, lastUpdated: '2024-01-01' },
    CHF: { currency: 'CHF', rate: 0.92, lastUpdated: '2024-01-01' },
    CNY: { currency: 'CNY', rate: 6.45, lastUpdated: '2024-01-01' },
    INR: { currency: 'INR', rate: 74.0, lastUpdated: '2024-01-01' },
    BRL: { currency: 'BRL', rate: 5.2, lastUpdated: '2024-01-01' },
    MXN: { currency: 'MXN', rate: 20.0, lastUpdated: '2024-01-01' },
    KRW: { currency: 'KRW', rate: 1150.0, lastUpdated: '2024-01-01' },
    SGD: { currency: 'SGD', rate: 1.35, lastUpdated: '2024-01-01' },
    HKD: { currency: 'HKD', rate: 7.8, lastUpdated: '2024-01-01' },
    TWD: { currency: 'TWD', rate: 28.0, lastUpdated: '2024-01-01' },
    THB: { currency: 'THB', rate: 33.0, lastUpdated: '2024-01-01' },
    PHP: { currency: 'PHP', rate: 50.0, lastUpdated: '2024-01-01' },
    IDR: { currency: 'IDR', rate: 14200.0, lastUpdated: '2024-01-01' },
    VND: { currency: 'VND', rate: 23000.0, lastUpdated: '2024-01-01' },
    MYR: { currency: 'MYR', rate: 4.15, lastUpdated: '2024-01-01' },
    NZD: { currency: 'NZD', rate: 1.4, lastUpdated: '2024-01-01' },
    SEK: { currency: 'SEK', rate: 8.5, lastUpdated: '2024-01-01' },
    NOK: { currency: 'NOK', rate: 8.7, lastUpdated: '2024-01-01' },
    DKK: { currency: 'DKK', rate: 6.3, lastUpdated: '2024-01-01' },
    PLN: { currency: 'PLN', rate: 3.8, lastUpdated: '2024-01-01' },
    CZK: { currency: 'CZK', rate: 21.5, lastUpdated: '2024-01-01' },
    HUF: { currency: 'HUF', rate: 300.0, lastUpdated: '2024-01-01' },
    RON: { currency: 'RON', rate: 4.1, lastUpdated: '2024-01-01' },
    BGN: { currency: 'BGN', rate: 1.66, lastUpdated: '2024-01-01' },
    HRK: { currency: 'HRK', rate: 6.3, lastUpdated: '2024-01-01' },
    RUB: { currency: 'RUB', rate: 75.0, lastUpdated: '2024-01-01' },
    TRY: { currency: 'TRY', rate: 8.5, lastUpdated: '2024-01-01' },
    ZAR: { currency: 'ZAR', rate: 15.0, lastUpdated: '2024-01-01' },
    ILS: { currency: 'ILS', rate: 3.2, lastUpdated: '2024-01-01' },
    AED: { currency: 'AED', rate: 3.67, lastUpdated: '2024-01-01' },
    SAR: { currency: 'SAR', rate: 3.75, lastUpdated: '2024-01-01' },
    QAR: { currency: 'QAR', rate: 3.64, lastUpdated: '2024-01-01' },
    EGP: { currency: 'EGP', rate: 15.7, lastUpdated: '2024-01-01' },
    NGN: { currency: 'NGN', rate: 410.0, lastUpdated: '2024-01-01' },
    KES: { currency: 'KES', rate: 110.0, lastUpdated: '2024-01-01' },
    GHS: { currency: 'GHS', rate: 6.0, lastUpdated: '2024-01-01' },
    MAD: { currency: 'MAD', rate: 9.0, lastUpdated: '2024-01-01' },
  };
  
  // Map locale codes to currency codes
  const LOCALE_TO_CURRENCY: Record<string, string> = {
    'en-US': 'USD',
    'en-CA': 'CAD',
    'en-GB': 'GBP',
    'en-AU': 'AUD',
    'en-NZ': 'NZD',
    'en-IE': 'EUR',
    'en-SG': 'SGD',
    'en-MY': 'MYR',
    'en-PH': 'PHP',
    'en-IN': 'INR',
    'en-HK': 'HKD',
    'en-TW': 'TWD',
    'en-JP': 'JPY',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'pt-BR': 'BRL',
    'ru-RU': 'RUB',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'hi-IN': 'INR',
    'ar-SA': 'SAR',
    'tr-TR': 'TRY',
    'pl-PL': 'PLN',
    'nl-NL': 'EUR',
    'sv-SE': 'SEK',
    'da-DK': 'DKK',
    'no-NO': 'NOK',
    'fi-FI': 'EUR',
    'cs-CZ': 'CZK',
    'hu-HU': 'HUF',
    'ro-RO': 'RON',
    'bg-BG': 'BGN',
    'hr-HR': 'HRK',
    'sk-SK': 'EUR',
    'sl-SI': 'EUR',
    'et-EE': 'EUR',
    'lv-LV': 'EUR',
    'lt-LT': 'EUR',
    'mt-MT': 'EUR',
    'el-GR': 'EUR',
    'cy-GB': 'GBP',
    'ga-IE': 'EUR',
    'is-IS': 'ISK',
    'mk-MK': 'MKD',
    'sq-AL': 'ALL',
    'sr-RS': 'RSD',
    'bs-BA': 'BAM',
    'me-ME': 'EUR',
    'mn-MN': 'MNT',
    'ka-GE': 'GEL',
    'hy-AM': 'AMD',
    'az-AZ': 'AZN',
    'kk-KZ': 'KZT',
    'ky-KG': 'KGS',
    'uz-UZ': 'UZS',
    'tg-TJ': 'TJS',
    'tk-TM': 'TMT',
    'af-ZA': 'ZAR',
    'zu-ZA': 'ZAR',
    'xh-ZA': 'ZAR',
    'st-ZA': 'ZAR',
    'tn-ZA': 'ZAR',
    've-ZA': 'ZAR',
    'ts-ZA': 'ZAR',
    'ss-ZA': 'ZAR',
    'nr-ZA': 'ZAR',
    'nso-ZA': 'ZAR',
    'en-ZA': 'ZAR',
    'en-PK': 'PKR',
    'en-BD': 'BDT',
    'en-LK': 'LKR',
    'en-NP': 'NPR',
    'en-MM': 'MMK',
    'en-KH': 'KHR',
    'en-VN': 'VND',
    'en-TH': 'THB',
    'en-ID': 'IDR',
    'en-FJ': 'FJD',
    'en-PG': 'PGK',
    'en-SB': 'SBD',
    'en-VU': 'VUV',
    'en-NC': 'XPF',
    'en-PF': 'XPF',
    'en-WS': 'WST',
    'en-TO': 'TOP',
    'en-TV': 'AUD',
    'en-KI': 'AUD',
    'en-NR': 'AUD',
    'en-TK': 'NZD',
    'en-CK': 'NZD',
    'en-NU': 'NZD',
    'en-PW': 'USD',
    'en-FM': 'USD',
    'en-MH': 'USD',
    'en-PR': 'USD',
    'en-GU': 'USD',
    'en-AS': 'USD',
    'en-MP': 'USD',
    'en-VI': 'USD',
    'en-UM': 'USD',
    'en-US-POSIX': 'USD',
  };
  
  // Get currency code from locale
  export const getCurrencyCode = (locale: string): string => {
    return LOCALE_TO_CURRENCY[locale] || 'USD';
  };
  
  // Convert USD amount to target currency
  export const convertUSDToCurrency = (usdAmount: number, targetCurrency: string): number => {
    const rate = EXCHANGE_RATES[targetCurrency];
    if (!rate) {
      console.warn(`No exchange rate found for ${targetCurrency}, using USD`);
      return usdAmount;
    }
    
    return usdAmount * rate.rate;
  };
  
  // Convert USD amount to user's locale currency
  export const convertUSDToUserCurrency = (usdAmount: number, locale: string): number => {
    const currencyCode = getCurrencyCode(locale);
    return convertUSDToCurrency(usdAmount, currencyCode);
  };
  
  // Get exchange rate for a currency
  export const getExchangeRate = (currency: string): number => {
    const rate = EXCHANGE_RATES[currency];
    return rate ? rate.rate : 1.0;
  };
  
  // Format converted amount with proper currency formatting
  export const formatConvertedAmount = (usdAmount: number, locale: string): string => {
    const convertedAmount = convertUSDToUserCurrency(usdAmount, locale);
    const currencyCode = getCurrencyCode(locale);
    
    // For now, use basic formatting - in production, you'd want more sophisticated formatting
    if (currencyCode === 'JPY') {
      return `¥${Math.round(convertedAmount)}`;
    } else if (currencyCode === 'EUR') {
      return `€${convertedAmount.toFixed(2)}`;
    } else if (currencyCode === 'GBP') {
      return `£${convertedAmount.toFixed(2)}`;
    } else {
      return `$${convertedAmount.toFixed(2)}`;
    }
  }; 