
const localeMap: { [key: string]: string } = {
  es: 'es-CO',
  en: 'en-US',
};

export const formatCurrencyLocalized = (amount: number, currency: string = 'USD', language: string = 'en') => {
  const locale = localeMap[language] || 'en-US';
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
  };
  
  if (Math.round(amount) === amount) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  } else {
    options.minimumFractionDigits = 2;
    options.maximumFractionDigits = 2;
  }

  return new Intl.NumberFormat(locale, options).format(amount);
};
