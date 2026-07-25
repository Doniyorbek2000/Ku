// Summani so'm ko'rinishida formatlaydi: 100000 -> "100 000 so'm"
export function sum(amount: number): string {
  const s = Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}${s} so'm`;
}

// Sanani qisqa ko'rinishda
export function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Keshbek qoidasini matnga aylantiradi
export function cashbackLabel(type: string, value: number): string {
  return type === 'PERCENT' ? `${value}% keshbek` : `${sum(value)} keshbek`;
}
