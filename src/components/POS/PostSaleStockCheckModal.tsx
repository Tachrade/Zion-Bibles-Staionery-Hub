import React from 'react';
import {
  CheckCircle2,
  Printer,
  Boxes,
  ArrowRight,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  Plus
} from 'lucide-react';
import { Sale, Product, ShopSettings } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface PostSaleStockCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  products: Product[];
  settings: ShopSettings;
  onStartNewSale: () => void;
  onViewStockLog: () => void;
  onQuickRestock: (productId: string) => void;
}

export const PostSaleStockCheckModal: React.FC<PostSaleStockCheckModalProps> = ({
  isOpen,
  onClose,
  sale,
  products,
  settings,
  onStartNewSale,
  onViewStockLog,
  onQuickRestock,
}) => {
  if (!isOpen || !sale) return null;

  // Compute for each item in the sale:
  // Previous stock = current stock + quantity sold in this sale
  // Current stock = current stock now
  const stockCheckItems = sale.items.map((item) => {
    const prod = products.find((p) => p.id === item.productId);
    const currentStock = prod ? prod.stock : 0;
    const previousStock = currentStock + item.quantity;
    const minStock = prod ? prod.minStock : settings.defaultMinStock;
    const isOut = currentStock <= 0;
    const isLow = currentStock > 0 && currentStock <= minStock;

    return {
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantitySold: item.quantity,
      price: item.price,
      lineTotal: item.price * item.quantity,
      previousStock,
      currentStock,
      minStock,
      isOut,
      isLow,
    };
  });

  const lowOrOutItems = stockCheckItems.filter((i) => i.isOut || i.isLow);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-neutral-200 my-8">
        {/* Banner with Success Confirmation */}
        <div className="bg-emerald-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                  Sale Completed
                </span>
                <span className="text-xs bg-emerald-800/80 px-2 py-0.5 rounded font-mono text-emerald-100">
                  Receipt #{sale.receiptNo}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Payment Received: {formatCurrency(sale.total, settings.currencySymbol)}
              </h2>
            </div>
          </div>
          <div className="text-right text-xs text-emerald-200 hidden sm:block">
            <p className="font-medium">{sale.customerName || 'Walk-in Customer'}</p>
            <p className="font-mono opacity-80">{formatDateTime(sale.date)}</p>
          </div>
        </div>

        {/* POST-SALE STOCK CHECK SECTION */}
        <div className="p-6 space-y-6">
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-800" />
                <h3 className="font-bold text-sm text-emerald-950">
                  Post-Sale Stock Verification & Inventory Check
                </h3>
              </div>
              <span className="text-xs text-emerald-700 font-medium">
                {sale.items.reduce((acc, i) => acc + i.quantity, 0)} total units deducted
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-3">
              Stock levels have been automatically updated. Review the remaining on-hand quantity for every item sold:
            </p>

            {/* Table of stock deductions */}
            <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Item Sold</th>
                    <th className="py-2.5 px-3 text-center">Previous Stock</th>
                    <th className="py-2.5 px-3 text-center">Sold</th>
                    <th className="py-2.5 px-3 text-center">Remaining Now</th>
                    <th className="py-2.5 px-3">Current Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-normal">
                  {stockCheckItems.map((item) => (
                    <tr
                      key={item.productId}
                      className={
                        item.isOut
                          ? 'bg-red-50/40'
                          : item.isLow
                          ? 'bg-amber-50/40'
                          : 'hover:bg-neutral-50/50'
                      }
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-neutral-900">{item.name}</div>
                        <div className="text-[11px] font-mono text-neutral-400">
                          {item.sku}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-600">
                        {item.previousStock}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600">
                        -{item.quantitySold}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.isOut
                              ? 'text-red-600'
                              : item.isLow
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {item.isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : item.isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock (≤{item.minStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                            Adequate
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {(item.isLow || item.isOut) && (
                          <button
                            type="button"
                            onClick={() => onQuickRestock(item.productId)}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Restock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {lowOrOutItems.length > 0 && (
              <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-100/70 border border-amber-300 text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Reorder Warning:</span>{' '}
                  {lowOrOutItems.length} {lowOrOutItems.length === 1 ? 'item is' : 'items are'} now below the minimum stock threshold after this sale. Consider placing a purchase order.
                </div>
              </div>
            )}
          </div>

          {/* Printable Receipt Preview & Hidden Print Container */}
          <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-neutral-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700">
                  Customer Receipt (58mm Thermal Print)
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  58mm Roll
                </span>
              </div>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt (58mm)</span>
              </button>
            </div>

            {/* 58mm Thermal Paper Simulation Preview */}
            <div className="bg-white p-3.5 rounded-lg border border-neutral-300 text-xs font-mono text-neutral-900 w-[240px] mx-auto shadow-sm">
              <div className="text-center border-b border-dashed border-neutral-400 pb-2 mb-2">
                <h3 className="font-bold text-xs tracking-tight text-neutral-900 uppercase">
                  {settings.shopName}
                </h3>
                <p className="text-[10px] text-neutral-600 font-sans leading-tight mt-0.5">{settings.tagline}</p>
                <p className="text-[9px] text-neutral-500 font-sans mt-0.5">{settings.address}</p>
                <p className="text-[9px] text-neutral-500 font-sans">Tel: {settings.phone}</p>
              </div>

              <div className="text-[10px] space-y-0.5 pb-2 mb-2 border-b border-dashed border-neutral-400">
                <div className="flex justify-between">
                  <span>RCPT:</span>
                  <span className="font-bold">#{sale.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{formatDateTime(sale.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAY:</span>
                  <span>{sale.paymentMethod}</span>
                </div>
                {sale.customerName && (
                  <div className="flex justify-between truncate">
                    <span>CUST:</span>
                    <span className="truncate max-w-[140px]">{sale.customerName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pb-2 mb-2 border-b border-dashed border-neutral-400 text-[10px]">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-semibold text-neutral-900 leading-tight">
                      {item.name}
                    </div>
                    <div className="flex justify-between text-neutral-600 text-[10px]">
                      <span>
                        {item.quantity} x {formatCurrency(item.price, settings.currencySymbol)}
                      </span>
                      <span className="font-bold text-neutral-900">
                        {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {sale.discount > 0 && (
                <div className="flex justify-between text-[10px] text-neutral-600 pb-1">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.discount, settings.currencySymbol)}</span>
                </div>
              )}

              <div className="pt-1 pb-2 border-b border-dashed border-neutral-400">
                <div className="flex justify-between font-bold text-xs text-neutral-900">
                  <span>TOTAL:</span>
                  <span className="text-sm">{formatCurrency(sale.total, settings.currencySymbol)}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[9px] text-neutral-600 font-sans italic leading-tight">
                {settings.receiptFooter}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Navigation Buttons */}
        <div className="bg-neutral-100 px-6 py-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onViewStockLog}
            className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs"
          >
            View in Stock Audit Log
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onStartNewSale}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Start Next Sale</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden 58mm thermal print wrapper */}
      <div id="printable-receipt" className="hidden">
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
            {settings.shopName}
          </div>
          <div style={{ fontSize: '9px', marginTop: '1px' }}>{settings.tagline}</div>
          <div style={{ fontSize: '9px' }}>{settings.address}</div>
          <div style={{ fontSize: '9px' }}>Tel: {settings.phone}</div>
        </div>
        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
        <div style={{ fontSize: '9px', lineHeight: '1.3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>RCPT: #{sale.receiptNo}</span>
            <span>{sale.paymentMethod}</span>
          </div>
          <div>DATE: {formatDateTime(sale.date)}</div>
          {sale.customerName && <div>CUST: {sale.customerName}</div>}
        </div>
        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
        <div style={{ fontSize: '9px', lineHeight: '1.3' }}>
          {sale.items.map((it, idx) => (
            <div key={idx} style={{ marginBottom: '3px' }}>
              <div style={{ fontWeight: 'bold' }}>{it.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{it.quantity} x {formatCurrency(it.price, settings.currencySymbol)}</span>
                <span style={{ fontWeight: 'bold' }}>
                  {formatCurrency(it.price * it.quantity, settings.currencySymbol)}
                </span>
              </div>
            </div>
          ))}
        </div>
        {sale.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span>Discount:</span>
            <span>-{formatCurrency(sale.discount, settings.currencySymbol)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total, settings.currencySymbol)}</span>
        </div>
        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
        <div style={{ textAlign: 'center', fontSize: '8.5px', marginTop: '6px', fontStyle: 'italic', lineHeight: '1.2' }}>
          {settings.receiptFooter}
        </div>
      </div>
    </div>
  );
};
