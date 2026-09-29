import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Tag,
  DollarSign,
  Boxes
} from 'lucide-react';
import { Product, ProductCategory, ShopSettings } from '../../types';
import {
  formatCurrency,
  formatStockUnits,
} from '../../utils/formatters';
import { ProductForm } from './ProductForm';

interface ProductsViewProps {
  products: Product[];
  settings: ShopSettings;
  onSaveProduct: (productData: Omit<Product, 'createdAt' | 'updatedAt'>, isEdit: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenNewStockModal: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onOpenNewStockModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories: ProductCategory[] = [
    'Bibles',
    'Books & Literature',
    'Stationery',
    'Church Supplies',
    'Gift Items',
    'Others',
  ];

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q));
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Products Catalog</h2>
          <p className="text-xs text-neutral-500">
            Manage Bible translations, stationery items, books, barcodes, and pricing
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, SKU, or barcode..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="All">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c} ({products.filter((p) => p.category === c).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Catalog Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-3">SKU / Barcode</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Cost (₦)</th>
                <th className="py-3 px-3 text-right">Price (₦)</th>
                <th className="py-3 px-3 text-right">Margin</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((p) => {
                const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-neutral-900">{p.name}</p>
                            {p.hasPacks && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {p.piecesPerPack} pcs/pk
                              </span>
                            )}
                          </div>
                          {p.shelfLocation && (
                            <span className="text-[10px] text-neutral-400">
                              Shelf: {p.shelfLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-neutral-600 text-[11px]">
                      <div>{p.sku}</div>
                      {p.barcode && (
                        <div className="text-[10px] text-neutral-400 font-mono tracking-tight">
                          🏷️ {p.barcode}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-neutral-600">
                      {p.category}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                      {formatCurrency(p.cost, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-900">
                      {p.hasPacks && p.packPrice ? (
                        <div>
                          <div className="font-bold text-xs text-neutral-900">
                            {formatCurrency(p.price, settings.currencySymbol)}{' '}
                            <span className="text-[10px] font-normal text-neutral-500">/pc</span>
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-700">
                            {formatCurrency(p.packPrice, settings.currencySymbol)}{' '}
                            <span className="text-[9px] font-normal text-emerald-600">/pk</span>
                          </div>
                        </div>
                      ) : (
                        <span className="font-bold">
                          {formatCurrency(p.price, settings.currencySymbol)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[11px] tabular-nums">
                      <span
                        className={`font-semibold ${
                          margin >= 25 ? 'text-emerald-700' : margin >= 15 ? 'text-amber-600' : 'text-neutral-500'
                        }`}
                      >
                        {margin.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-bold font-mono text-xs px-2 py-0.5 rounded-full ${
                            p.stock <= 0
                              ? 'bg-rose-100 text-rose-800'
                              : p.stock <= p.minStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.hasPacks ? formatStockUnits(p.stock, p.piecesPerPack) : `${p.stock} pcs`}
                        </span>
                        {p.hasPacks && (
                          <span className="text-[9px] text-neutral-400 font-mono mt-0.5">
                            {p.stock} pcs total
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenNewStockModal(p.id)}
                          title="Record Stock Intake"
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
                        >
                          + Stock
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Details"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          title="Delete Product"
                          className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400 text-xs">
                    No products found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal via ProductForm component */}
      <ProductForm
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        settings={settings}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveProduct}
      />
    </div>
  );
};
