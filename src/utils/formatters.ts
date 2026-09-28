export function formatCurrency(amount: number, symbol: string = '₦'): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${symbol}${safeAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getStockStatus(stock: number, minStock: number = 5): {
  label: string;
  badgeClass: string;
  dotColor: string;
  isLow: boolean;
  isOut: boolean;
} {
  if (stock <= 0) {
    return {
      label: 'Out of Stock',
      badgeClass: 'bg-red-50 text-red-700 border border-red-200',
      dotColor: 'bg-red-500',
      isLow: true,
      isOut: true,
    };
  }
  if (stock <= minStock) {
    return {
      label: `Low Stock (${stock})`,
      badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
      dotColor: 'bg-amber-500',
      isLow: true,
      isOut: false,
    };
  }
  return {
    label: `In Stock (${stock})`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dotColor: 'bg-emerald-500',
    isLow: false,
    isOut: false,
  };
}
