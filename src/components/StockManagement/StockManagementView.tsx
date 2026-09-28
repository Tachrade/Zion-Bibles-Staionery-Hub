import React, { useState } from 'react';
import {
  Boxes,
  History,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Scale,
  Calendar,
  Layers,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Product, StockMovement, StockMovementType, ShopSettings } from '../../types';
import { formatCurrency, formatDateTime, getStockStatus } from '../../utils/formatters';

interface StockManagementViewProps {
  products: Product[];
  movements: StockMovement[];
  settings: ShopSettings;
  onOpenNewStockModal: (productId?: string) => void;
  onOpenAdjustmentModal: (product: Product) => void;
  onExportExcel: () => void;
}

export const StockManagementView: React.FC<StockManagementViewProps> = ({
  products,
  movements,
  settings,
  onOpenNewStockModal,
  onOpenAdjustmentModal,
  onExportExcel,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'reorder' | 'audit'>(
    'inventory'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');

  // Movement log filters
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');
  const [movementSearchQuery, setMovementSearchQuery] = useState('');

  // Physical count state
  const [physicalCounts, setPhysicalCounts] = useState<{ [productId: string]: number | '' }>({});

  // Computations
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + p.stock * p.cost, 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.shelfLocation || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'low') matchesStatus = p.stock <= p.minStock && p.stock > 0;
    if (statusFilter === 'out') matchesStatus = p.stock <= 0;
    if (statusFilter === 'healthy') matchesStatus = p.stock > p.minStock;

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Filtered movements list
  const filteredMovements = movements.filter((m) => {
    const matchesType = movementTypeFilter === 'all' || m.type === movementTypeFilter;
    const matchesQuery =
      m.productName.toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      m.productSku.toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      (m.referenceNo || '').toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      (m.supplierOrParty || '').toLowerCase().includes(movementSearchQuery.toLowerCase()) ||
      (m.notes || '').toLowerCase().includes(movementSearchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="font-medium">Total On-Hand Stock</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {totalStockUnits.toLocaleString()} <span className="text-xs font-sans text-neutral-500 font-normal">units</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Across {products.length} catalog items
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="font-medium">Total Inventory Cost</span>
            <span className="text-emerald-700 font-bold font-mono text-xs">Cost Value</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(totalCostValuation, settings.currencySymbol)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Capital tied in warehouse & shelves
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="font-medium">Potential Retail Value</span>
            <span className="text-amber-700 font-bold font-mono text-xs">Retail</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(totalRetailValuation, settings.currencySymbol)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Margin: {formatCurrency(totalRetailValuation - totalCostValuation, settings.currencySymbol)}
          </p>
        </div>

        <div
          onClick={() => {
            setActiveTab('reorder');
            setStatusFilter('low');
          }}
          className={`p-4 rounded-xl border cursor-pointer transition-all shadow-2xs ${
            lowStockProducts.length + outOfStockProducts.length > 0
              ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70'
              : 'bg-white border-neutral-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span className="font-semibold">Reorder Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
            {lowStockProducts.length + outOfStockProducts.length}
          </div>
          <p className="text-[11px] text-amber-800 mt-1">
            {outOfStockProducts.length} out of stock · {lowStockProducts.length} low
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="border-b border-neutral-200 px-6 pt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-0">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Stock On-Hand & Levels</span>
            </button>

            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'movements'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Stock Audit Trail & Sales Log</span>
              <span className="bg-emerald-950/20 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {movements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reorder')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'reorder'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Low Stock & Reorder Plan</span>
              {lowStockProducts.length + outOfStockProducts.length > 0 && (
                <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                  {lowStockProducts.length + outOfStockProducts.length}
                </span>
              )}
            </button>
          </div>

          <div className="pb-3 flex items-center gap-2">
            <button
              onClick={() => onOpenNewStockModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record New Stock (Intake)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: STOCK ON-HAND & LEVELS */}
        {activeTab === 'inventory' && (
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50/70 p-3 rounded-xl border border-neutral-200">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, SKU, shelf location..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('healthy')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      statusFilter === 'healthy'
                        ? 'bg-emerald-700 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Healthy
                  </button>
                  <button
                    onClick={() => setStatusFilter('low')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      statusFilter === 'low'
                        ? 'bg-amber-600 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Low ({lowStockProducts.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('out')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      statusFilter === 'out'
                        ? 'bg-rose-700 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Out ({outOfStockProducts.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Product & Category</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3 text-right">Cost Price</th>
                    <th className="py-3 px-3 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-center">Stock On Hand</th>
                    <th className="py-3 px-3 text-center">Reorder Threshold</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Stock Valuation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredProducts.map((p) => {
                    const status = getStockStatus(p.stock, p.minStock);
                    const stockValuationCost = p.stock * p.cost;
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-neutral-50/70 transition-colors ${
                          p.stock <= 0
                            ? 'bg-red-50/20'
                            : p.stock <= p.minStock
                            ? 'bg-amber-50/20'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl shrink-0">{p.icon || '📦'}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-neutral-900 leading-tight">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                                <span>{p.category}</span>
                                {p.shelfLocation && (
                                  <>
                                    <span>·</span>
                                    <span>{p.shelfLocation}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-neutral-600 text-[11px]">
                          {p.sku}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-600">
                          {formatCurrency(p.cost, settings.currencySymbol)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                          {formatCurrency(p.price, settings.currencySymbol)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono font-bold text-sm tabular-nums ${
                              p.stock <= 0
                                ? 'text-red-600'
                                : p.stock <= p.minStock
                                ? 'text-amber-700'
                                : 'text-neutral-900'
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-neutral-500">
                          ≤ {p.minStock}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${status.badgeClass}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}
                            />
                            {status.label}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {formatCurrency(stockValuationCost, settings.currencySymbol)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenNewStockModal(p.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Add more stock for this product"
                            >
                              + Add Stock
                            </button>
                            <button
                              onClick={() => onOpenAdjustmentModal(p)}
                              className="px-2 py-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors cursor-pointer"
                              title="Physical count reconciliation or damage deduction"
                            >
                              Adjust
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-neutral-400">
                        No products match your search or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: STOCK MOVEMENT & AUDIT LOG (Directly addresses check after sales is made) */}
        {activeTab === 'movements' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50/70 p-3 rounded-xl border border-neutral-200">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={movementSearchQuery}
                  onChange={(e) => setMovementSearchQuery(e.target.value)}
                  placeholder="Search receipt #, invoice #, product name, or supplier..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-500">Filter Event:</span>
                <select
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="all">All Movement Events</option>
                  <option value="sale">🛒 Sales Deductions</option>
                  <option value="restock">📦 New Stock Intakes (Restocks)</option>
                  <option value="adjustment">⚖️ Inventory Count Adjustments</option>
                  <option value="return">↩️ Customer Returns</option>
                  <option value="damage">⚠️ Damaged / Written-off</option>
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-3">Event Type</th>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-3 text-center">Change</th>
                    <th className="py-3 px-4 text-center">Stock Transition</th>
                    <th className="py-3 px-3">Ref / Receipt #</th>
                    <th className="py-3 px-3">Supplier / Party</th>
                    <th className="py-3 px-4">Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredMovements.map((m) => {
                    const isAddition = m.quantityChange > 0;
                    return (
                      <tr key={m.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          {formatDateTime(m.date)}
                        </td>

                        <td className="py-3 px-3">
                          {m.type === 'sale' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              <ArrowDownRight className="w-3 h-3 text-rose-600" />
                              Sale Deducted
                            </span>
                          )}
                          {m.type === 'restock' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                              New Stock Intake
                            </span>
                          )}
                          {m.type === 'adjustment' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                              <Scale className="w-3 h-3 text-blue-600" />
                              Reconciliation
                            </span>
                          )}
                          {m.type === 'damage' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Damage
                            </span>
                          )}
                          {m.type === 'return' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200">
                              ↩️ Return
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-neutral-900 leading-tight">
                            {m.productName}
                          </p>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {m.productSku}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isAddition ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isAddition ? `+${m.quantityChange}` : m.quantityChange}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                            <span className="text-neutral-500">{m.stockBefore}</span>
                            <span className="text-neutral-400">➔</span>
                            <span className="font-bold text-neutral-900">{m.stockAfter}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-xs text-neutral-700">
                          {m.referenceNo || '—'}
                        </td>

                        <td className="py-3 px-3 text-neutral-700">
                          {m.supplierOrParty || '—'}
                        </td>

                        <td className="py-3 px-4 text-neutral-500 max-w-xs truncate text-[11px]" title={m.notes}>
                          {m.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMovements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400">
                        No movement audit records match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LOW STOCK & REORDER PLANNER */}
        {activeTab === 'reorder' && (
          <div className="p-6 space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-950 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Restock Recommendation & Supplier Replenishment List</span>
              </div>
              <p>
                The following products are at or below their designated minimum threshold. Recommended order quantities aim to restore healthy 30-day buffer levels.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3 text-center">Current Stock</th>
                    <th className="py-3 px-3 text-center">Min Threshold</th>
                    <th className="py-3 px-3 text-center">Suggested Order</th>
                    <th className="py-3 px-3 text-right">Unit Cost</th>
                    <th className="py-3 px-3 text-right">Estimated Investment</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products
                    .filter((p) => p.stock <= p.minStock)
                    .map((p) => {
                      const suggestedOrder = Math.max(10, p.minStock * 2 - p.stock);
                      const estimatedCost = suggestedOrder * p.cost;
                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/60">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{p.icon}</span>
                              <div>
                                <p className="font-semibold text-neutral-900">{p.name}</p>
                                <span className="text-[11px] text-neutral-500">{p.category}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono text-neutral-500">{p.sku}</td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-mono font-bold text-sm ${
                                p.stock === 0 ? 'text-red-600' : 'text-amber-700'
                              }`}
                            >
                              {p.stock}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-neutral-500">
                            {p.minStock}
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800 bg-emerald-50/80 rounded">
                            +{suggestedOrder} units
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-neutral-600">
                            {formatCurrency(p.cost, settings.currencySymbol)}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-900">
                            {formatCurrency(estimatedCost, settings.currencySymbol)}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onOpenNewStockModal(p.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Restock Now</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                  {products.filter((p) => p.stock <= p.minStock).length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-emerald-700 font-medium">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                        All products are currently well-stocked above reorder thresholds!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
