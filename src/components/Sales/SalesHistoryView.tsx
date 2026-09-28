import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  Eye,
  Trash2,
  Printer,
  Download,
  AlertTriangle,
  User,
  CreditCard
} from 'lucide-react';
import { Sale, Product, ShopSettings } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface SalesHistoryViewProps {
  sales: Sale[];
  products: Product[];
  settings: ShopSettings;
  onViewReceipt: (sale: Sale) => void;
  onVoidSale: (saleId: string) => void;
  onExportExcel: () => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  sales,
  products,
  settings,
  onViewReceipt,
  onVoidSale,
  onExportExcel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const filteredSales = sales
    .filter((s) => {
      const matchesSearch =
        s.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.customerPhone || '').includes(searchQuery) ||
        s.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPayment = paymentFilter === 'All' || s.paymentMethod === paymentFilter;

      let matchesDate = true;
      if (dateFilter) {
        matchesDate = new Date(s.date).toISOString().slice(0, 10) === dateFilter;
      }

      return matchesSearch && matchesPayment && matchesDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalFilteredRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Sales History & Receipts</h2>
          <p className="text-xs text-neutral-500">
            View completed transactions, reprint receipts, and track deducted stock
          </p>
        </div>

        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-700 font-semibold text-xs shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Sales to Excel</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by receipt #, customer name, or item sold..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:ring-2 focus:ring-emerald-600"
            >
              <option value="All">All Payment Types</option>
              <option value="Cash">Cash</option>
              <option value="Transfer">Bank Transfer</option>
              <option value="POS Card">POS Card</option>
              <option value="Credit">Credit</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-700 font-mono focus:ring-2 focus:ring-emerald-600"
            />

            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-neutral-500 hover:text-neutral-800 underline"
              >
                Clear date
              </button>
            )}
          </div>
        </div>

        {/* Revenue Summary Ribbon */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
          <span className="text-neutral-600">
            Showing <strong>{filteredSales.length}</strong> transactions
          </span>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Filtered Total:</span>
            <span className="font-mono text-base font-bold text-emerald-800 tabular-nums">
              {formatCurrency(totalFilteredRevenue, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Items Purchased</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-right">Total Paid</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                    #{s.receiptNo}
                  </td>

                  <td className="py-3 px-3 font-mono text-neutral-600 text-[11px] whitespace-nowrap">
                    {formatDateTime(s.date)}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-neutral-900">
                      {s.customerName || 'Walk-in Customer'}
                    </div>
                    {s.customerPhone && (
                      <span className="text-[10px] font-mono text-neutral-400">
                        {s.customerPhone}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div
                      className="max-w-xs truncate text-neutral-700"
                      title={s.items
                        .map(
                          (i) =>
                            `${i.name} (x${i.quantity} ${
                              i.unitType === 'pack' ? 'pk' : 'pcs'
                            })`
                        )
                        .join(', ')}
                    >
                      {s.items
                        .map(
                          (i) =>
                            `${i.name} (${i.quantity} ${
                              i.unitType === 'pack' ? 'pk' : 'pcs'
                            })`
                        )
                        .join(', ')}
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {s.items.reduce(
                        (acc, i) => acc + (i.totalPiecesDeducted || i.quantity),
                        0
                      )}{' '}
                      total pcs sold
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-medium">
                      {s.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                    {formatCurrency(s.total, settings.currencySymbol)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewReceipt(s)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        title="View receipt and stock check"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        <span>View / Print</span>
                      </button>

                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Void Sale #${s.receiptNo}?\n\nThe items (${s.items
                                .map((i) => `${i.quantity}x ${i.name}`)
                                .join(
                                  ', '
                                )}) will be returned directly to active stock inventory.`
                            )
                          ) {
                            onVoidSale(s.id);
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100 cursor-pointer"
                        title="Void sale and restore stock"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                    No sales records found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
