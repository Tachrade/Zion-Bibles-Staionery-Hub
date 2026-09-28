import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Boxes,
  PieChart,
  BarChart2,
  Calendar,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Sale, Product, ShopSettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
  settings: ShopSettings;
  onExportExcel: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  products,
  settings,
  onExportExcel,
}) => {
  // Financial computations
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalCostOfGoodsSold = sales.reduce((acc, s) => {
    const saleCost = s.items.reduce(
      (itemAcc, item) => itemAcc + (item.cost || 0) * item.quantity,
      0
    );
    return acc + saleCost;
  }, 0);
  const grossProfit = totalRevenue - totalCostOfGoodsSold;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  // Inventory valuation
  const inventoryCostValuation = products.reduce((acc, p) => acc + p.stock * p.cost, 0);
  const inventoryRetailValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const potentialInventoryMargin = inventoryRetailValuation - inventoryCostValuation;

  // Category sales breakdown
  const categorySalesMap: { [cat: string]: { revenue: number; units: number } } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      const cat = item.category || 'Others';
      if (!categorySalesMap[cat]) categorySalesMap[cat] = { revenue: 0, units: 0 };
      categorySalesMap[cat].revenue += item.price * item.quantity;
      categorySalesMap[cat].units += item.quantity;
    });
  });

  // Top products by volume
  const productVolumeMap: { [name: string]: { units: number; revenue: number; icon?: string } } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productVolumeMap[item.name]) {
        const prod = products.find((p) => p.name === item.name);
        productVolumeMap[item.name] = { units: 0, revenue: 0, icon: prod?.icon || '📦' };
      }
      productVolumeMap[item.name].units += item.quantity;
      productVolumeMap[item.name].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.entries(productVolumeMap)
    .sort((a, b) => b[1].units - a[1].units)
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Financial & Stock Analytics</h2>
          <p className="text-xs text-neutral-500">
            Real-time profit margins, inventory capital valuation, and sales velocity
          </p>
        </div>

        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Full Analytics to Excel</span>
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Total Sales Revenue
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
            {formatCurrency(totalRevenue, settings.currencySymbol)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Across {sales.length} customer orders
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Total Cost of Goods Sold (COGS)
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(totalCostOfGoodsSold, settings.currencySymbol)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Historical supplier acquisition cost
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Realized Gross Profit
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {formatCurrency(grossProfit, settings.currencySymbol)}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            Overall Margin: {profitMargin.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Average Ticket Size
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatCurrency(avgOrderValue, settings.currencySymbol)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Average spending per transaction
          </p>
        </div>
      </div>

      {/* Two Column: Inventory Capital Valuation & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inventory Capital Valuation (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-neutral-900">
                Current Inventory Capital & Valuation
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">On-Hand Assets</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
              <span className="text-neutral-600 font-medium">
                Total Inventory Cost Basis (Invested Capital)
              </span>
              <span className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                {formatCurrency(inventoryCostValuation, settings.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
              <span className="text-neutral-600 font-medium">
                Potential Retail Value (If 100% Sold)
              </span>
              <span className="font-mono font-bold text-sm text-emerald-800 tabular-nums">
                {formatCurrency(inventoryRetailValuation, settings.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
              <span className="text-emerald-950 font-semibold">
                Projected Unrealized Gross Margin
              </span>
              <span className="font-mono font-bold text-sm text-emerald-700 tabular-nums">
                {formatCurrency(potentialInventoryMargin, settings.currencySymbol)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl text-[11px] text-neutral-500">
            💡 <strong>Accounting note:</strong> Profit is calculated accurately per individual sale line item using the unit cost at the time of purchase. Deleting or updating a catalog price will never tamper with past historical profit figures.
          </div>
        </div>

        {/* Top Selling Products (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-neutral-900">
                Top Selling Products by Volume
              </h3>
            </div>
            <span className="text-xs text-neutral-400">Bestsellers</span>
          </div>

          <div className="space-y-2.5">
            {topProducts.map(([name, data], idx) => (
              <div
                key={name}
                className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-lg shrink-0">{data.icon}</span>
                  <span className="font-semibold text-neutral-900 truncate">
                    {name}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-neutral-900">
                    {data.units} units
                  </span>
                  <div className="text-[10px] font-mono text-emerald-700">
                    {formatCurrency(data.revenue, settings.currencySymbol)}
                  </div>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <div className="py-8 text-center text-neutral-400 text-xs">
                No product sales recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-neutral-900 border-b border-neutral-200 pb-3">
          Sales Volume by Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(categorySalesMap).map(([category, val]) => {
            const pct = totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0;
            return (
              <div
                key={category}
                className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/50 space-y-1.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-neutral-800">{category}</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="text-lg font-bold font-mono text-neutral-900">
                  {formatCurrency(val.revenue, settings.currencySymbol)}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {val.units} units sold
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
