import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Receipt,
  Plus,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { Product, Sale, StockMovement, ShopSettings } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { NavigationPage } from '../Sidebar';

interface DashboardViewProps {
  products: Product[];
  sales: Sale[];
  movements: StockMovement[];
  settings: ShopSettings;
  onNavigate: (page: NavigationPage) => void;
  onOpenNewStockModal: (productId?: string) => void;
  onViewSaleReceipt: (sale: Sale) => void;
  onExportExcel: () => void;
  onStartFreshStore: () => void;
  onLoadDemoData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  sales,
  movements,
  settings,
  onNavigate,
  onOpenNewStockModal,
  onViewSaleReceipt,
  onExportExcel,
  onStartFreshStore,
  onLoadDemoData,
}) => {
  // Today's metrics
  const todayStr = new Date().toDateString();
  const todaySales = sales.filter(
    (s) => new Date(s.date).toDateString() === todayStr
  );
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.minStock);

  // Recent 5 sales
  const recentSales = [...sales].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  // Recent 6 stock movements
  const recentMovements = [...movements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 6);

  const isDemoActive = products.some((p) => p.id === 'prod-1' && p.sku === 'BIB-KJV-01');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Fresh Store vs Demo Banner */}
      {isDemoActive ? (
        <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="font-bold">Sample Demo Data is currently loaded.</span>
            <span className="text-amber-700 hidden sm:inline">
              Ready to input your shop's actual items?
            </span>
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  'Start fresh with zero details?\n\nThis will clear sample demo products and mock sales so you can enter your real shop inventory.'
                )
              ) {
                onStartFreshStore();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>⚡ Clear Demo Data & Start Fresh (0 Items)</span>
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="p-6 bg-emerald-900/90 text-white rounded-2xl border border-emerald-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <span>✨ Fresh Store Active (Zero Items)</span>
          </div>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Your inventory is completely clean with zero demo products and zero mock sales. You can begin adding your real Bibles, books, and stationery items, or import an Excel spreadsheet.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onNavigate('products')}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
            >
              + Add First Product
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Store Settings & Sharing Info
            </button>
            <button
              onClick={onLoadDemoData}
              className="px-3 py-1.5 text-xs text-emerald-300 hover:text-white underline cursor-pointer"
            >
              Load Sample Demo Data for testing
            </button>
          </div>
        </div>
      ) : null}
      {/* Welcome & Trust Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950 text-white p-6 rounded-2xl shadow-sm border border-emerald-900">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-medium mb-2">
            <span>Zion Bible & Stationery Hub Management System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Store Operations & Stock Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-xl">
            Real-time inventory levels, post-sale deduction tracking, and sales management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenNewStockModal()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Boxes className="w-4 h-4" />
            <span>+ Add New Stock</span>
          </button>

          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New Sale (POS)</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ₦
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(todayRevenue, settings.currencySymbol)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {todaySales.length} {todaySales.length === 1 ? 'sale' : 'sales'} completed today
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {sales.length}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Lifetime receipts recorded
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Units in Stock</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {totalStockUnits.toLocaleString()}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Across {products.length} catalog items
          </p>
        </div>

        <div
          onClick={() => onNavigate('stock')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-2xs ${
            lowStockItems.length > 0
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-100/70'
              : 'bg-white border-neutral-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
            {lowStockItems.length}
          </div>
          <p className="text-xs text-amber-800 mt-1 font-medium">
            {lowStockItems.length > 0
              ? 'Items needing urgent reorder'
              : 'Inventory levels healthy'}
          </p>
        </div>
      </div>

      {/* Two Column Grid: Recent Sales & Stock Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Sales (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-neutral-900">Recent Sales & Receipts</h3>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-emerald-700 font-semibold hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-neutral-500 font-semibold border-b border-neutral-200 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Receipt</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentSales.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 px-3 font-mono font-semibold text-neutral-900">
                      #{s.receiptNo}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-500">
                      {formatDateTime(s.date)}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600">
                      {s.items.reduce((acc, i) => acc + i.quantity, 0)} units
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-medium">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {formatCurrency(s.total, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onViewSaleReceipt(s)}
                        className="text-[11px] px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium transition-colors cursor-pointer"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No sales recorded yet. Use New Sale (POS) to start!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Stock Movements & Audits (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-neutral-900">
                  Stock Movements & Sales Deductions
                </h3>
              </div>
              <button
                onClick={() => onNavigate('stock')}
                className="text-xs text-emerald-700 font-semibold hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentMovements.map((m) => {
                const isAdd = m.quantityChange > 0;
                return (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isAdd ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isAdd ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                        <span className="font-semibold text-neutral-900 truncate">
                          {m.productName}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{m.type}</span>
                        <span>·</span>
                        <span className="font-mono">{m.referenceNo || '—'}</span>
                        <span>·</span>
                        <span className="font-mono text-neutral-400">
                          {m.stockBefore} ➔ {m.stockAfter}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(m.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Need to record a supplier delivery?</span>
            <button
              onClick={() => onOpenNewStockModal()}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              + Quick Stock Intake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
