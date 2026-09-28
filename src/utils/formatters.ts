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

/**
 * Breakdown total base pieces into whole packs and loose pieces.
 */
export function breakdownStock(stock: number, piecesPerPack?: number): {
  packs: number;
  pieces: number;
  totalPieces: number;
} {
  const safeStock = Math.max(0, Math.floor(stock || 0));
  if (!piecesPerPack || piecesPerPack <= 1) {
    return { packs: 0, pieces: safeStock, totalPieces: safeStock };
  }
  const packs = Math.floor(safeStock / piecesPerPack);
  const pieces = safeStock % piecesPerPack;
  return { packs, pieces, totalPieces: safeStock };
}

/**
 * Calculates total base pieces from packs and loose pieces.
 */
export function calculateTotalPieces(
  packs: number,
  pieces: number,
  piecesPerPack: number = 1
): number {
  const safePacks = Math.max(0, Math.floor(packs || 0));
  const safePieces = Math.max(0, Math.floor(pieces || 0));
  const ppp = Math.max(1, Math.floor(piecesPerPack || 1));
  return safePacks * ppp + safePieces;
}

/**
 * Formats stock breakdown for display.
 * e.g. 43 pieces with 5 pcs/pk => "8 pks 3 pcs"
 * e.g. 45 pieces with 5 pcs/pk => "9 pks"
 * with showTotalPieces: "8 pks 3 pcs (43 pcs)"
 */
export function formatStockUnits(
  stock: number,
  piecesPerPack?: number,
  options?: { showTotalPieces?: boolean; short?: boolean }
): string {
  if (stock <= 0) return '0 pcs';

  if (!piecesPerPack || piecesPerPack <= 1) {
    return `${stock} pcs`;
  }

  const { packs, pieces } = breakdownStock(stock, piecesPerPack);
  const pkLabel = options?.short ? 'pks' : packs === 1 ? 'pack' : 'packs';
  const pcsLabel = 'pcs';

  let text = '';
  if (packs > 0 && pieces > 0) {
    text = `${packs} ${pkLabel} ${pieces} ${pcsLabel}`;
  } else if (packs > 0 && pieces === 0) {
    text = `${packs} ${pkLabel}`;
  } else {
    text = `${pieces} ${pcsLabel}`;
  }

  if (options?.showTotalPieces && packs > 0) {
    text += ` (${stock} pcs)`;
  }

  return text;
}
