import { adminConfig } from '../config/adminConfig';

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  const { symbol, position, decimal_places } = adminConfig.locale.currency;
  const formatted = amount.toFixed(decimal_places).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return position === 'prefix' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getOrderStatusColor(status: string): string {
  const statusConfig = adminConfig.orders.statuses.find(s => s.id === status);
  return statusConfig?.color || '#9E9E9E';
}

export function getOrderStatusLabel(status: string): string {
  const statusConfig = adminConfig.orders.statuses.find(s => s.id === status);
  return statusConfig?.label || status;
}

export function getStockStatus(stock: number, threshold: number = 5): {
  label: string;
  type: 'success' | 'warning' | 'error';
} {
  if (stock <= 0) return { label: 'Out of Stock', type: 'error' };
  if (stock <= threshold) return { label: `Low Stock (${stock})`, type: 'warning' };
  return { label: 'In Stock', type: 'success' };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPercentChange(current: number, previous: number): { value: number; type: 'up' | 'down' | 'neutral' } {
  if (previous === 0) return { value: 0, type: 'neutral' };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(change * 10) / 10),
    type: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
  };
}
