'use client';

interface CurrencyDisplayProps {
  cents: number;
  showSymbol?: boolean;
}

export function CurrencyDisplay({ cents, showSymbol = true }: CurrencyDisplayProps) {
  const formatted = (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return <span>{showSymbol ? '₦' : ''}{formatted}</span>;
}
