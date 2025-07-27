import { Platform, NativeModules, I18nManager, Dimensions } from 'react-native';
import { convertUSDToUserCurrency, getCurrencyCode } from './currencyConversion';

export interface CurrencyConfig {
  symbol: string;
  position: 'before' | 'after';
  decimalSeparator: string;
  thousandSeparator: string;
  decimalPlaces: number;
}

// Default currency configurations for common locales
const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  'en-US': { symbol: '$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-CA': { symbol: 'C$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-GB': { symbol: '£', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-AU': { symbol: 'A$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'de-DE': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'fr-FR': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'es-ES': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'it-IT': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'ja-JP': { symbol: '¥', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 0 },
  'ko-KR': { symbol: '₩', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 0 },
  'zh-CN': { symbol: '¥', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'zh-TW': { symbol: 'NT$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'pt-BR': { symbol: 'R$', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'ru-RU': { symbol: '₽', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'hi-IN': { symbol: '₹', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'ar-SA': { symbol: 'ر.س', position: 'after', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'tr-TR': { symbol: '₺', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'pl-PL': { symbol: 'zł', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'nl-NL': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'sv-SE': { symbol: 'kr', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'da-DK': { symbol: 'kr', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'no-NO': { symbol: 'kr', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'fi-FI': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'cs-CZ': { symbol: 'Kč', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'hu-HU': { symbol: 'Ft', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 0 },
  'ro-RO': { symbol: 'lei', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'bg-BG': { symbol: 'лв', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'hr-HR': { symbol: 'kn', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'sk-SK': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'sl-SI': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'et-EE': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'lv-LV': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'lt-LT': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'mt-MT': { symbol: '€', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'el-GR': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'cy-GB': { symbol: '£', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'ga-IE': { symbol: '€', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'is-IS': { symbol: 'kr', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 0 },
  'mk-MK': { symbol: 'ден', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'sq-AL': { symbol: 'L', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'sr-RS': { symbol: 'дин', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'bs-BA': { symbol: 'KM', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'me-ME': { symbol: '€', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'mn-MN': { symbol: '₮', position: 'after', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'ka-GE': { symbol: '₾', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'hy-AM': { symbol: '֏', position: 'after', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'az-AZ': { symbol: '₼', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 2 },
  'kk-KZ': { symbol: '₸', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'ky-KG': { symbol: 'с', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'uz-UZ': { symbol: 'so\'m', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'tg-TJ': { symbol: 'смн', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'tk-TM': { symbol: 'm', position: 'after', decimalSeparator: ',', thousandSeparator: ' ', decimalPlaces: 2 },
  'af-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'zu-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'xh-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'st-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'tn-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  've-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'ts-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'ss-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'nr-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'nso-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-ZA': { symbol: 'R', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-NZ': { symbol: 'NZ$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-IE': { symbol: '€', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-SG': { symbol: 'S$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-MY': { symbol: 'RM', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-PH': { symbol: '₱', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-IN': { symbol: '₹', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-PK': { symbol: '₨', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-BD': { symbol: '৳', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-LK': { symbol: 'Rs', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-NP': { symbol: '₨', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-MM': { symbol: 'K', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-KH': { symbol: '៛', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-VN': { symbol: '₫', position: 'after', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 0 },
  'en-TH': { symbol: '฿', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-ID': { symbol: 'Rp', position: 'before', decimalSeparator: ',', thousandSeparator: '.', decimalPlaces: 0 },
  'en-HK': { symbol: 'HK$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-MO': { symbol: 'MOP$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-TW': { symbol: 'NT$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-JM': { symbol: 'J$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-BB': { symbol: 'Bds$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-TT': { symbol: 'TT$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-GY': { symbol: 'G$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-BZ': { symbol: 'BZ$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-BS': { symbol: 'B$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-KY': { symbol: 'CI$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-TC': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-VG': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-AI': { symbol: 'EC$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-AG': { symbol: 'EC$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-DM': { symbol: 'EC$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-GD': { symbol: 'EC$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-KN': { symbol: 'EC$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-LC': { symbol: 'EC$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-VC': { symbol: 'EC$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-MT': { symbol: '€', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-CY': { symbol: '€', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-GI': { symbol: '£', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-IM': { symbol: '£', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-JE': { symbol: '£', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-GG': { symbol: '£', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-FJ': { symbol: 'FJ$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-PG': { symbol: 'K', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-SB': { symbol: 'SI$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-VU': { symbol: 'VT', position: 'after', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 0 },
  'en-NC': { symbol: 'CFP', position: 'after', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 0 },
  'en-PF': { symbol: 'CFP', position: 'after', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 0 },
  'en-WS': { symbol: 'T', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-TO': { symbol: 'T$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-TV': { symbol: 'A$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-KI': { symbol: 'A$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-NR': { symbol: 'A$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-TK': { symbol: 'NZ$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-CK': { symbol: 'NZ$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-NU': { symbol: 'NZ$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-PW': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-FM': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-MH': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-PR': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-GU': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-AS': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-MP': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-VI': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-UM': { symbol: 'US$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-US-POSIX': { symbol: '$', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 2 },
  'en-JP': { symbol: '¥', position: 'before', decimalSeparator: '.', thousandSeparator: ',', decimalPlaces: 0 },
};

// Get the user's locale
export const getUserLocale = (): string => {
  try {
    // Use React Native's built-in locale detection
    let locale = '';
    
    if (Platform.OS === 'ios') {
      // Try multiple methods for iOS
      try {
        locale = NativeModules.SettingsManager?.settings?.AppleLocale;
      } catch (e) {
        // Silent fallback
      }
      
      if (!locale) {
        try {
          locale = NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
        } catch (e) {
          // Silent fallback
        }
      }
      
      if (!locale) {
        // Fallback to I18nManager for iOS
        locale = NativeModules.I18nManager?.localeIdentifier;
      }
      
      if (!locale) {
        // Try to get from device dimensions or other sources
        try {
          // This is a workaround for Expo Go - try to get locale from device info
          const deviceInfo = Dimensions.get('window');
          // For now, fallback to US
          locale = 'en-US';
        } catch (e) {
          // Silent fallback
        }
      }
      
      if (!locale) {
        // Final fallback - use I18nManager.isRTL to determine if it's a RTL language
        // This is a very basic fallback
        locale = I18nManager.isRTL ? 'ar-SA' : 'en-US';
      }
    } else {
      locale = NativeModules.I18nManager?.localeIdentifier;
      
      if (!locale) {
        // Fallback for Android
        locale = I18nManager.isRTL ? 'ar-SA' : 'en-US';
      }
    }
    
    // If we still don't have a locale, try Intl API
    if (!locale || locale === 'en-US') {
      const intlLocale = getLocaleFromIntl();
      if (intlLocale && intlLocale !== 'en-US') {
        return intlLocale;
      }
    }
    
    return locale || 'en-US';
  } catch (error) {
    return 'en-US';
  }
};

// Alternative method using Intl API (more reliable in some cases)
export const getLocaleFromIntl = (): string => {
  try {
    // Try to get locale from Intl API
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale || 'en-US';
  } catch (error) {
    return 'en-US';
  }
};

// Get currency configuration for a locale
export const getCurrencyConfig = (locale?: string): CurrencyConfig => {
  const userLocale = locale || getCurrentLocale();
  
  // Try exact match first
  if (CURRENCY_CONFIGS[userLocale]) {
    return CURRENCY_CONFIGS[userLocale];
  }
  
  // Try language-only match (e.g., 'en' for 'en-US')
  const language = userLocale.split('-')[0];
  const languageMatch = Object.keys(CURRENCY_CONFIGS).find(key => key.startsWith(language + '-'));
  
  if (languageMatch) {
    return CURRENCY_CONFIGS[languageMatch];
  }
  
  // Try language-only match without country code
  const languageOnlyMatch = Object.keys(CURRENCY_CONFIGS).find(key => key === language);
  if (languageOnlyMatch) {
    return CURRENCY_CONFIGS[languageOnlyMatch];
  }
  
  // Special cases for common locale formats
  const specialCases: Record<string, string> = {
    'ja': 'ja-JP',
    'en_IE': 'en-IE',
    'en_GB': 'en-GB',
    'de_DE': 'de-DE',
    'fr_FR': 'fr-FR',
    'es_ES': 'es-ES',
    'it_IT': 'it-IT',
    'pt_BR': 'pt-BR',
    'ru_RU': 'ru-RU',
    'zh_CN': 'zh-CN',
    'zh_TW': 'zh-TW',
    'ko_KR': 'ko-KR',
    'ar_SA': 'ar-SA',
    'tr_TR': 'tr-TR',
    'pl_PL': 'pl-PL',
    'nl_NL': 'nl-NL',
    'sv_SE': 'sv-SE',
    'da_DK': 'da-DK',
    'no_NO': 'no-NO',
    'fi_FI': 'fi-FI',
    'cs_CZ': 'cs-CZ',
    'hu_HU': 'hu-HU',
    'ro_RO': 'ro-RO',
    'bg_BG': 'bg-BG',
    'hr_HR': 'hr-HR',
    'sk_SK': 'sk-SK',
    'sl_SI': 'sl-SI',
    'et_EE': 'et-EE',
    'lv_LV': 'lv-LV',
    'lt_LT': 'lt-LT',
    'mt_MT': 'mt-MT',
    'el_GR': 'el-GR',
    'cy_GB': 'cy-GB',
    'ga_IE': 'ga-IE',
    'is_IS': 'is-IS',
    'mk_MK': 'mk-MK',
    'sq_AL': 'sq-AL',
    'sr_RS': 'sr-RS',
    'bs_BA': 'bs-BA',
    'me_ME': 'me-ME',
    'mn_MN': 'mn-MN',
    'ka_GE': 'ka-GE',
    'hy_AM': 'hy-AM',
    'az_AZ': 'az-AZ',
    'kk_KZ': 'kk-KZ',
    'ky_KG': 'ky-KG',
    'uz_UZ': 'uz-UZ',
    'tg_TJ': 'tg-TJ',
    'tk_TM': 'tk-TM',
    'af_ZA': 'af-ZA',
    'zu_ZA': 'zu-ZA',
    'xh_ZA': 'xh-ZA',
    'st_ZA': 'st-ZA',
    'tn_ZA': 'tn-ZA',
    've_ZA': 've-ZA',
    'ts_ZA': 'ts-ZA',
    'ss_ZA': 'ss-ZA',
    'nr_ZA': 'nr-ZA',
    'nso_ZA': 'nso-ZA',
    'en_ZA': 'en-ZA',
    'en_NZ': 'en-NZ',
    'en_SG': 'en-SG',
    'en_MY': 'en-MY',
    'en_PH': 'en-PH',
    'en_IN': 'en-IN',
    'en_PK': 'en-PK',
    'en_BD': 'en-BD',
    'en_LK': 'en-LK',
    'en_NP': 'en-NP',
    'en_MM': 'en-MM',
    'en_KH': 'en-KH',
    'en_VN': 'en-VN',
    'en_TH': 'en-TH',
    'en_ID': 'en-ID',
    'en_HK': 'en-HK',
    'en_MO': 'en-MO',
    'en_TW': 'en-TW',
    'en_JM': 'en-JM',
    'en_BB': 'en-BB',
    'en_TT': 'en-TT',
    'en_GY': 'en-GY',
    'en_BZ': 'en-BZ',
    'en_BS': 'en-BS',
    'en_KY': 'en-KY',
    'en_TC': 'en-TC',
    'en_VG': 'en-VG',
    'en_AI': 'en-AI',
    'en_AG': 'en-AG',
    'en_DM': 'en-DM',
    'en_GD': 'en-GD',
    'en_KN': 'en-KN',
    'en_LC': 'en-LC',
    'en_VC': 'en-VC',
    'en_MT': 'en-MT',
    'en_CY': 'en-CY',
    'en_GI': 'en-GI',
    'en_IM': 'en-IM',
    'en_JE': 'en-JE',
    'en_GG': 'en-GG',
    'en_FJ': 'en-FJ',
    'en_PG': 'en-PG',
    'en_SB': 'en-SB',
    'en_VU': 'en-VU',
    'en_NC': 'en-NC',
    'en_PF': 'en-PF',
    'en_WS': 'en-WS',
    'en_TO': 'en-TO',
    'en_TV': 'en-TV',
    'en_KI': 'en-KI',
    'en_NR': 'en-NR',
    'en_TK': 'en-TK',
    'en_CK': 'en-CK',
    'en_NU': 'en-NU',
    'en_PW': 'en-PW',
    'en_FM': 'en-FM',
    'en_MH': 'en-MH',
    'en_PR': 'en-PR',
    'en_GU': 'en-GU',
    'en_AS': 'en-AS',
    'en_MP': 'en-MP',
    'en_VI': 'en-VI',
    'en_UM': 'en-UM',
    'en_US_POSIX': 'en-US-POSIX',
  };
  
  if (specialCases[userLocale]) {
    console.log('✅ Found special case match:', specialCases[userLocale]);
    return CURRENCY_CONFIGS[specialCases[userLocale]];
  }
  
  console.log('❌ No match found, falling back to en-US');
  // Fallback to US dollar
  return CURRENCY_CONFIGS['en-US'];
};

// Format a number as currency
export const formatCurrency = (amount: number, locale?: string): string => {
  const config = getCurrencyConfig(locale);
  
  // Handle negative amounts
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format the number with proper decimal places
  let formattedNumber = absAmount.toFixed(config.decimalPlaces);
  
  // Add thousand separators
  if (config.thousandSeparator) {
    const parts = formattedNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSeparator);
    formattedNumber = parts.join(config.decimalSeparator);
  }
  
  // Add currency symbol
  const symbol = isNegative ? `-${config.symbol}` : config.symbol;
  const formatted = config.position === 'before' 
    ? `${symbol}${formattedNumber}`
    : `${formattedNumber} ${symbol}`;
  
  return formatted;
};

// Format currency for display with custom decimal places
export const formatCurrencyWithDecimals = (amount: number, decimalPlaces: number = 2, locale?: string): string => {
  const config = getCurrencyConfig(locale);
  const customConfig = { ...config, decimalPlaces };
  return formatCurrency(amount, locale);
};

// Get just the currency symbol for a locale
export const getCurrencySymbol = (locale?: string): string => {
  const config = getCurrencyConfig(locale);
  return config.symbol;
};

// Check if the current locale uses a specific currency symbol
export const isCurrencySymbol = (symbol: string, locale?: string): boolean => {
  const config = getCurrencyConfig(locale);
  return config.symbol === symbol;
};

// Format USD amount converted to user's currency
export const formatUSDAsLocalCurrency = (usdAmount: number, locale?: string): string => {
  const userLocale = locale || getCurrentLocale();
  const convertedAmount = convertUSDToUserCurrency(usdAmount, userLocale);
  const config = getCurrencyConfig(userLocale);
  
  // Format the converted amount using the locale's currency formatting
  return formatCurrency(convertedAmount, userLocale);
};

// Get the conversion rate for the current locale
export const getCurrentConversionRate = (locale?: string): number => {
  const userLocale = locale || getCurrentLocale();
  const currencyCode = getCurrencyCode(userLocale);
  const rate = convertUSDToUserCurrency(1, userLocale);
  return rate;
};



// Manual override for testing different locales
let manualLocaleOverride: string | null = null;

export const setManualLocale = (locale: string | null) => {
  manualLocaleOverride = locale;
};

export const getCurrentLocale = (): string => {
  return manualLocaleOverride || getUserLocale();
}; 