// Small formatting helpers used across the app.

export const formatPrice = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

/** Compact price, e.g. $2.85M or $315K */
export const formatPriceShort = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  return `$${Math.round(n / 1000)}K`;
};

export const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** Unique id for saved builds */
export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
