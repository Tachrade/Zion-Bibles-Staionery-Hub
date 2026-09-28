import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Receipt,
  Boxes,
  Lock,
  LogOut,
  UserCheck,
  Printer,
  Eye,
  AlertTriangle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Product, Sale, SaleItem, PaymentMethod, ShopSettings, ShopUser } from '../../types';
import { POSView } from '../POS/POSView';
import { formatCurrency, formatDateTime, formatStockUnits } from '../../utils/formatters';

interface CashierDashboardViewProps {
  products: Product[];
  sales: Sale[];
  settings: ShopSettings;
  currentUser: ShopUser;
  onCompleteSale: (saleData: {
    items: SaleItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerPhone: string;
  }) => void;
  onViewReceipt: (sale: Sale) => void;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
}

export const CashierDashboardView: React.FC<CashierDashboardViewProps> = ({
  products,
  sales,
  settings,
  currentUser,
  onCompleteSale,
  onViewReceipt,
  onLogout,
  onSwitchToAdmin,
}) => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'pos' | 'stock' | 'receipts'>('pos');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Filter today's sales
  const todayStr = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.date).toDateString() === todayStr);
  const todayTotalRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      (p.shelfLocation || '').toLowerCase().includes(stockSearchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen w-screen bg-neutral-100 flex flex-col overflow-hidden text-neutral-900 select-none">
      {/* Cashier Terminal Header */}
      <header className="h-16 px-6 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center font-bold text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white tracking-tight leading-none">
                {settings.shopName}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 font-semibold border border-emerald-700">
                Staff Terminal
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Point of Sale & Stock Lookup
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <div className="hidden md:flex items-center bg-emerald-900/80 p-1 rounded-xl border border-emerald-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>New Sale (POS)</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4 text-amber-500" />
            <span>Check Stock Availability</span>
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'receipts'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>Today's Receipts ({todaySales.length})</span>
          </button>
        </div>

        {/* User Session & Terminal Lock */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Online / Offline status badge */}
          {isOnline ? (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700"
              title="Firebase live cloud sync active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-medium">Cloud Online</span>
            </div>
          ) : (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-900/80 text-amber-200 border border-amber-600"
              title="Offline mode: sales are saved locally and will sync when internet returns"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-[11px] font-medium">Offline Mode (Local)</span>
            </div>
          )}

          {currentUser.role === 'admin' && onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold transition-colors shadow-sm cursor-pointer"
            >
              <span>Admin Portal →</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-800">
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold text-white">{currentUser.displayName}</span>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-emerald-900 hover:bg-rose-900/80 text-emerald-300 hover:text-rose-200 transition-colors cursor-pointer"
            title="Lock terminal / Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-emerald-900 px-3 py-2 text-xs font-semibold text-white border-b border-emerald-800">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'pos' ? 'bg-white text-emerald-950' : 'text-emerald-200'}`}
        >
          🛒 POS Sale
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'stock' ? 'bg-white text-emerald-950' : 'text-emerald-200'}`}
        >
          🔍 Check Stock
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'receipts' ? 'bg-white text-emerald-950' : 'text-emerald-200'}`}
        >
          🧾 Receipts ({todaySales.length})
        </button>
      </div>

      {/* Main Cashier Viewport */}
      <main className="flex-1 overflow-y-auto">
        {/* TAB 1: POS TERMINAL */}
        {activeTab === 'pos' && (
          <POSView
            products={products}
            settings={settings}
            onCompleteSale={onCompleteSale}
          />
        )}

        {/* TAB 2: STAFF STOCK AVAILABILITY CHECK */}
        {activeTab === 'stock' && (
          <div className="p-6 max-w-6xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Staff Stock Availability Checker
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Quickly check how many Bibles or stationery units are in stock and where they are placed
                  </p>
                </div>
              </div>

              {/* Search Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[260px] relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    placeholder="Search product name, translation, SKU, or shelf location..."
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    autoFocus
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:ring-2 focus:ring-emerald-600"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Table (Note: Cost Price and Profit are intentionally HIDDEN for staff) */}
              <div className="overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-3">SKU / Code</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Shelf Location</th>
                      <th className="py-3 px-3 text-right">Selling Price</th>
                      <th className="py-3 px-4 text-center">Available Stock</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((p) => {
                      const isOut = p.stock <= 0;
                      const isLow = p.stock > 0 && p.stock <= p.minStock;

                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/70">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{p.icon}</span>
                              <span className="font-semibold text-neutral-900">{p.name}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono text-neutral-500 text-[11px]">
                            {p.sku}
                          </td>

                          <td className="py-3 px-3 text-neutral-600">{p.category}</td>

                          <td className="py-3 px-3 text-neutral-700 font-medium">
                            {p.shelfLocation || 'Store Shelf'}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm">
                            {p.hasPacks && p.packPrice ? (
                              <div>
                                <div className="font-bold text-xs">
                                  {formatCurrency(p.price, settings.currencySymbol)}{' '}
                                  <span className="text-[10px] text-neutral-500 font-normal">/pc</span>
                                </div>
                                <div className="text-[10px] font-semibold text-emerald-700">
                                  {formatCurrency(p.packPrice, settings.currencySymbol)}{' '}
                                  <span className="text-[9px] font-normal">/pk</span>
                                </div>
                              </div>
                            ) : (
                              <span className="font-bold">
                                {formatCurrency(p.price, settings.currencySymbol)}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {p.hasPacks && p.piecesPerPack ? (
                              <div>
                                <span
                                  className={`font-mono font-bold text-sm ${
                                    isOut
                                      ? 'text-red-600'
                                      : isLow
                                      ? 'text-amber-700'
                                      : 'text-emerald-700'
                                  }`}
                                >
                                  {formatStockUnits(p.stock, p.piecesPerPack, { short: true })}
                                </span>
                                <div className="text-[10px] text-neutral-400 font-mono">
                                  ({p.stock} pcs total)
                                </div>
                              </div>
                            ) : (
                              <span
                                className={`font-mono font-bold text-base ${
                                  isOut
                                    ? 'text-red-600'
                                    : isLow
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {p.stock} pcs
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3" />
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                                Ready to Sell
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TODAY'S RECEIPTS & REPRINTS */}
        {activeTab === 'receipts' && (
          <div className="p-6 max-w-5xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Today's Counter Transactions ({todaySales.length})
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Reprint receipts for customers or verify payment details
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-500 font-medium">Today's Sales Total</span>
                  <p className="text-lg font-bold font-mono text-emerald-800">
                    {formatCurrency(todayTotalRevenue, settings.currencySymbol)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Receipt #</th>
                      <th className="py-3 px-3">Time</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Items</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3 text-right">Total</th>
                      <th className="py-3 px-4 text-right">Reprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {todaySales.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                          #{s.receiptNo}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-500 text-[11px]">
                          {new Date(s.date).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3 font-medium text-neutral-800">
                          {s.customerName || 'Walk-in Customer'}
                        </td>
                        <td className="py-3 px-3 text-neutral-600">
                          {s.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-medium">
                            {s.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">
                          {formatCurrency(s.total, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onViewReceipt(s)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-neutral-500" />
                            <span>Print</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {todaySales.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                          No sales recorded yet today. Switch to the POS tab to start your first sale!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
