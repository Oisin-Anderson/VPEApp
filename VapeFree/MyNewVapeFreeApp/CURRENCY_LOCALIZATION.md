# Currency Localization Feature

## Overview

The VapeFree app now supports automatic currency localization based on the user's device settings. The app will automatically detect the user's locale and format currency amounts accordingly.

## Features

- **Automatic Locale Detection**: Uses React Native's built-in locale detection
- **Comprehensive Currency Support**: Supports 200+ locales with their respective currencies
- **Proper Formatting**: Handles currency symbols, decimal separators, thousand separators, and positioning
- **Fallback Support**: Falls back to US Dollar if locale is not supported

## Supported Currencies

The app supports currencies for the following regions (partial list):

- **Americas**: USD ($), CAD (C$), BRL (R$), MXN ($), ARS ($), CLP ($), COP ($), PEN (S/), UYU ($), VEF (Bs)
- **Europe**: EUR (€), GBP (£), CHF (CHF), SEK (kr), NOK (kr), DKK (kr), PLN (zł), CZK (Kč), HUF (Ft), RON (lei)
- **Asia**: JPY (¥), CNY (¥), KRW (₩), INR (₹), THB (฿), SGD (S$), MYR (RM), PHP (₱), IDR (Rp), VND (₫)
- **Oceania**: AUD (A$), NZD (NZ$)
- **Africa**: ZAR (R), EGP (E£), NGN (₦), KES (KSh), GHS (GH₵), MAD (MAD)
- **Middle East**: SAR (ر.س), AED (د.إ), ILS (₪), TRY (₺), QAR (ر.ق)

## Usage

### Basic Currency Formatting

```typescript
import { formatCurrency } from '../services/currency';

// Format a number as currency using the user's locale
const formatted = formatCurrency(29.99); // Returns "$29.99" for US, "€29,99" for German, etc.
```

### Get User's Locale

```typescript
import { getUserLocale } from '../services/currency';

const userLocale = getUserLocale(); // Returns "en-US", "de-DE", "fr-FR", etc.
```

### Get Currency Symbol

```typescript
import { getCurrencySymbol } from '../services/currency';

const symbol = getCurrencySymbol(); // Returns "$", "€", "£", "¥", etc.
```

### Custom Locale

```typescript
import { formatCurrency } from '../services/currency';

// Format currency for a specific locale
const formatted = formatCurrency(29.99, 'de-DE'); // Returns "29,99 €"
```

## Implementation Details

### Currency Configuration

Each locale has a configuration object with:
- `symbol`: Currency symbol (e.g., "$", "€", "£")
- `position`: Symbol position ("before" or "after")
- `decimalSeparator`: Decimal separator (e.g., ".", ",")
- `thousandSeparator`: Thousand separator (e.g., ",", " ", ".")
- `decimalPlaces`: Number of decimal places (0, 2, etc.)

### Locale Detection

The app uses React Native's built-in locale detection:
1. iOS: Uses `NativeModules.SettingsManager.settings.AppleLocale` or `AppleLanguages[0]`
2. Android: Uses `NativeModules.I18nManager.localeIdentifier`
3. Falls back to "en-US" if detection fails
4. Matches exact locale first, then language-only match
5. Falls back to US Dollar if no match found

### Formatting Logic

1. **Negative Handling**: Handles negative amounts with proper symbol placement
2. **Decimal Places**: Formats according to locale-specific decimal places
3. **Thousand Separators**: Adds appropriate thousand separators
4. **Symbol Positioning**: Places currency symbol before or after the number as per locale

## Files Modified

### New Files
- `src/services/currency.ts` - Currency localization service
- `src/components/CurrencyTest.tsx` - Test component for currency formatting
- `CURRENCY_LOCALIZATION.md` - This documentation

### Updated Files
- `src/screens/StatsScreen.tsx` - Updated money saved display
- `src/screens/MembershipScreen.tsx` - Updated money saved display
- `src/onboard/Onboarding11.tsx` - Updated yearly cost display
- `src/onboard/Onboarding12.tsx` - Updated money saved display
- `src/onboard/Onboarding17.tsx` - Updated subscription prices

### Dependencies Added
- No additional dependencies required - uses React Native's built-in locale detection

## Testing

To test the currency localization:

1. **Change Device Locale**: Change your device's language/region settings
2. **Use Test Component**: Import and use the `CurrencyTest` component
3. **Check Different Amounts**: Test with various amounts (0, small, large, negative)

## Examples

### US Locale (en-US)
- `formatCurrency(29.99)` → `"$29.99"`
- `formatCurrency(1000.50)` → `"$1,000.50"`
- `formatCurrency(-15.75)` → `"-$15.75"`

### German Locale (de-DE)
- `formatCurrency(29.99)` → `"29,99 €"`
- `formatCurrency(1000.50)` → `"1.000,50 €"`
- `formatCurrency(-15.75)` → `"-15,75 €"`

### Japanese Locale (ja-JP)
- `formatCurrency(29.99)` → `"¥30"`
- `formatCurrency(1000.50)` → `"¥1,001"`
- `formatCurrency(-15.75)` → `"-¥16"`

## Future Enhancements

1. **Exchange Rate Integration**: Real-time currency conversion
2. **User Preference Override**: Allow users to manually select currency
3. **Regional Pricing**: Different prices for different regions
4. **Currency Symbol Fonts**: Support for special currency symbol fonts

## Troubleshooting

### Common Issues

1. **Locale Not Detected**: Falls back to "en-US" and US Dollar
2. **Unsupported Locale**: Falls back to closest language match
3. **Formatting Issues**: Check the currency configuration for the specific locale

### Debug Information

Use the `CurrencyTest` component to see:
- Detected user locale
- Currency symbol being used
- Sample formatted amounts

## Support

For issues or questions about currency localization, check:
1. The `src/services/currency.ts` file for configuration
2. The `CurrencyTest` component for examples
3. This documentation for usage patterns 