import React, { useState } from 'react';
import { X, Boxes, Truck, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { Product, StockMovement } from '../../types';
import {
  formatCurrency,
  formatStockUnits,
  breakdownStock,
  calculateTotalPieces
} from '../../utils/formatters';

interface NewStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProductId?: string;
  onAddStock: (
    movements: {
      productId: string;
      quantityAdded: number;
      unitCost: number;
      supplier: string;
      referenceNo: string;
      notes: string;
      updateProductCost: boolean;
    }[]
  ) => void;
}

export const NewStockModal: React.FC<NewStockModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProductId,
  onAddStock,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || (products.length > 0 ? products[0].id : '')
  );
  const [quantityAdded, setQuantityAdded] = useState<number | ''>(10);
  const [intakePacks, setIntakePacks] = useState<number | ''>(2);
  const [intakePieces, setIntakePieces] = useState<number | ''>(0);
  const [unitCost, setUnitCost] = useState<number | ''>('');
  const [supplier, setSupplier] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [updateProductCost, setUpdateProductCost] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const ppp = currentProduct?.piecesPerPack || 1;
  const hasPacks = !!(currentProduct?.hasPacks && ppp > 1);

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      if (unitCost === '' || unitCost === 0) {
        setUnitCost(prod.cost);
      }
      if (prod.hasPacks && prod.piecesPerPack) {
        setIntakePacks(2);
        setIntakePieces(0);
        setQuantityAdded(2 * prod.piecesPerPack);
      }
    }
  };

  const handlePacksOrPiecesChange = (pksVal: number | '', pcsVal: number | '') => {
    const pks = typeof pksVal === 'number' ? pksVal : 0;
    const pcs = typeof pcsVal === 'number' ? pcsVal : 0;
    const total = calculateTotalPieces(pks, pcs, ppp);
    setQuantityAdded(total);
  };

  const currentStock = currentProduct ? currentProduct.stock : 0;
  const numQty = typeof quantityAdded === 'number' ? quantityAdded : 0;
  const projectedStock = currentStock + numQty;
  const effectiveCost = typeof unitCost === 'number' && unitCost > 0 ? unitCost : currentProduct?.cost || 0;
  const totalBatchCost = numQty * effectiveCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;
    if (numQty <= 0) {
      alert('Please enter a valid stock quantity to add (at least 1 unit).');
      return;
    }

    const noteText = hasPacks
      ? `${notes.trim() ? notes.trim() + ' | ' : ''}Restocked: ${intakePacks || 0} pks & ${intakePieces || 0} pcs (${numQty} total pcs)`.trim()
      : notes.trim();

    onAddStock([
      {
        productId: currentProduct.id,
        quantityAdded: numQty,
        unitCost: effectiveCost,
        supplier: supplier.trim() || 'General Supplier Delivery',
        referenceNo: referenceNo.trim() || `INTK-${Date.now().toString().slice(-6)}`,
        notes: noteText,
        updateProductCost,
      },
    ]);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-neutral-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Add New Stock (Intake)</h3>
              <p className="text-xs text-emerald-200/80">
                Replenish inventory and record supplier batch details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Select Product to Restock
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name} [{p.sku}] — Current Stock:{' '}
                  {p.hasPacks
                    ? formatStockUnits(p.stock, p.piecesPerPack, { showTotalPieces: true })
                    : `${p.stock} pcs`}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Stock Calculation Banner */}
          {currentProduct && (
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-neutral-500 font-medium">Current Stock</span>
                <p className="font-mono text-base font-bold text-neutral-800">
                  {hasPacks
                    ? formatStockUnits(currentStock, ppp, { showTotalPieces: true, short: true })
                    : `${currentStock} pcs`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <ArrowRight className="w-4 h-4 text-neutral-400" />
                <span className="bg-emerald-100 px-2 py-0.5 rounded font-mono font-semibold">
                  +{numQty} pcs
                </span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-neutral-500 font-medium">Projected New Stock</span>
                <p className="font-mono text-base font-bold text-emerald-700">
                  {hasPacks
                    ? formatStockUnits(projectedStock, ppp, { showTotalPieces: true, short: true })
                    : `${projectedStock} pcs`}
                </p>
              </div>
            </div>
          )}

          {/* Quantity Section with Pack & Pieces breakdown if applicable */}
          {hasPacks ? (
            <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">
                  Pack Intake ({ppp} pieces per pack)
                </span>
                <span className="text-[10px] text-emerald-800">
                  Enter packs & loose pieces received
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Whole Packs Received
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={intakePacks}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                        setIntakePacks(val);
                        handlePacksOrPiecesChange(val, intakePieces);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono font-bold"
                    />
                    <span className="text-xs text-neutral-600 font-medium">pks</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Loose Pieces Received
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={intakePieces}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                        setIntakePieces(val);
                        handlePacksOrPiecesChange(intakePacks, val);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono font-bold"
                    />
                    <span className="text-xs text-neutral-600 font-medium">pcs</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-semibold text-emerald-900 bg-white p-2 rounded-lg border border-emerald-200">
                <span>Total Pieces Added:</span>
                <span>
                  {numQty} pcs ({intakePacks || 0} pks {intakePieces || 0} pcs)
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Quantity Added (Pieces) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantityAdded}
                  onChange={(e) =>
                    setQuantityAdded(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                  }
                  placeholder="e.g. 20"
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Cost per Piece (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitCost !== '' ? unitCost : currentProduct?.cost || ''}
                  onChange={(e) =>
                    setUnitCost(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder={`Current: ${currentProduct?.cost || 0}`}
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Batch investment: <strong className="font-mono">{formatCurrency(totalBatchCost)}</strong>
                </span>
              </div>
            </div>
          )}

          {hasPacks && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Cost per Piece (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost !== '' ? unitCost : currentProduct?.cost || ''}
                onChange={(e) =>
                  setUnitCost(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder={`Current: ${currentProduct?.cost || 0}`}
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Total batch investment: <strong className="font-mono">{formatCurrency(totalBatchCost)}</strong>
              </span>
            </div>
          )}

          {/* Supplier / Vendor & Invoice / Delivery Note # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Supplier / Source
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Bible Society Depot, CSS Bookshop"
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Invoice / Waybill / Reference #
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. INV-4921 / WB-082"
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Receiving Notes / Shelf Condition (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Carton 2 of 4, inspected in good condition, placed on Shelf A-3"
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Update product base cost checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="updateCost"
              checked={updateProductCost}
              onChange={(e) => setUpdateProductCost(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-neutral-300 cursor-pointer"
            />
            <label htmlFor="updateCost" className="text-xs text-neutral-600 cursor-pointer">
              Update catalog product cost price to this shipment's unit cost
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-800 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Record Stock Intake</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
