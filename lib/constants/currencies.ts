export interface Currency {
  code: string
  symbol: string
  name: string
  rateToEur: number // 1 EUR = X of this currency
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro', rateToEur: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToEur: 1.08 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToEur: 0.86 },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', rateToEur: 1.96 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rateToEur: 0.94 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToEur: 162.5 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToEur: 1.47 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToEur: 1.66 },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rateToEur: 4.32 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rateToEur: 34.5 },
]

export function getCurrency(code: string): Currency {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]
}

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount
  const fromCurrency = getCurrency(from)
  const toCurrency = getCurrency(to)
  // Convert: amount in "from" → EUR → "to"
  const amountInEur = amount / fromCurrency.rateToEur
  return Math.round(amountInEur * toCurrency.rateToEur * 100) / 100
}
