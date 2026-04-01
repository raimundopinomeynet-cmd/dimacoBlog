import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: es });
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getWeekLabel(date: Date): string {
  const { start, end } = getWeekRange(date);
  return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
}

export function calculateChange(current: number, previous: number): { change: number; percent: number } {
  const change = current - previous;
  const percent = previous === 0 ? (current > 0 ? 100 : 0) : (change / previous) * 100;
  return { change, percent };
}

export function getSentimentLabel(score: number): 'positive' | 'neutral' | 'negative' {
  if (score > 0.2) return 'positive';
  if (score < -0.2) return 'negative';
  return 'neutral';
}

export function getSentimentColor(label: 'positive' | 'neutral' | 'negative'): string {
  switch (label) {
    case 'positive':
      return 'text-green-600';
    case 'negative':
      return 'text-red-600';
    default:
      return 'text-yellow-600';
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
