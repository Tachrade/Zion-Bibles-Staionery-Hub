import React, { useState } from 'react';
import { X, Scale, AlertTriangle, Check } from 'lucide-react';
import { Product, StockMovementType } from '../../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirmAdjustment: (params: {
    productId: string;
    newStock: number;
    reasonType: StockMovementType;
    reasonText: string;
  }) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirmAdjustment,
}) => {
  if (!isOpen || !product) return null;

  const [newStockCount, setNewStockCount] = useState<number | ''>(product.stock);
  const [reasonType, setReasonType] = useState<StockMovementType>('adjustment');
  const [reasonText, setReasonText] = useState<string>('Routine physical shelf audit');

  const currentStock = product.stock;
  const numNewStock = typeof newStockCount === 'number' ? newStockCount : currentStock;
  const diff = numNewStock - currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof newStockCount !== 'number' || newStockCount < 0) {
      alert('Please enter a valid, non-negative stock count.');
      return;
    }

    onConfirmAdjustment({
      productId: product.id,
      newStock: newStockCount,
      reasonType,
      reasonText: reasonText.trim() || 'Manual stock adjustment',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-neutral-200">
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base text-white">Adjust / Reconcile Stock</h3>
              <p className="text-xs text-neutral-300">
                Correct on-hand stock for {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-500 font-medium">Product</span>
              <p className="font-bold text-neutral-800 text-sm">
                {product.icon} {product.name}
              </p>
              <p className="text-neutral-400 font-mono">{product.sku}</p>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 font-medium">System Count</span>
              <p className="font-mono text-base font-bold text-neutral-900">
                {currentStock} units
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Actual Physical Count on Shelf <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={newStockCount}
              onChange={(e) =>
                setNewStockCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-base font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {diff !== 0 && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center justify-between font-medium ${
                diff > 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span>Calculated Discrepancy:</span>
              <span className="font-mono font-bold text-sm">
                {diff > 0 ? `+${diff} units found` : `${diff} units shortage`}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Reason / Category
            </label>
            <select
              value={reasonType}
              onChange={(e) => setReasonType(e.target.value as StockMovementType)}
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
            >
              <option value="adjustment">Physical Shelf Count Reconciliation</option>
              <option value="damage">Damaged / Spoiled / Defective Units</option>
              <option value="return">Customer Return Restored to Inventory</option>
              <option value="restock">Direct Intake (Restock)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Audit Explanation / Notes
            </label>
            <input
              type="text"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="e.g. Recounted during weekend inventory check"
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-800 bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
