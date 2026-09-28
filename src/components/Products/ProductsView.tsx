import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Tag,
  DollarSign,
  Boxes
} from 'lucide-react';
import { Product, ProductCategory, ShopSettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';

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

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Stationery');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [minStock, setMinStock] = useState<number | ''>(settings.defaultMinStock);
  const [shelfLocation, setShelfLocation] = useState('');
  const [icon, setIcon] = useState('📦');
  const [description, setDescription] = useState('');

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
    setName('');
    setCategory('Stationery');
    setSku(`ZION-${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcode('');
    setPrice('');
    setCost('');
    setStock(10);
    setMinStock(settings.defaultMinStock);
    setShelfLocation('');
    setIcon('📦');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setSku(p.sku);
    setBarcode(p.barcode || '');
    setPrice(p.price);
    setCost(p.cost);
    setStock(p.stock);
    setMinStock(p.minStock);
    setShelfLocation(p.shelfLocation || '');
    setIcon(p.icon || '📦');
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter product name.');
    const numPrice = typeof price === 'number' ? price : 0;
    const numCost = typeof cost === 'number' ? cost : 0;
    const numStock = typeof stock === 'number' ? stock : 0;
    const numMinStock = typeof minStock === 'number' ? minStock : settings.defaultMinStock;

    if (numPrice < 0) return alert('Selling price cannot be negative.');
    if (numCost < 0) return alert('Cost price cannot be negative.');

    onSaveProduct(
      {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        name: name.trim(),
        category,
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-5)}`,
        barcode: barcode.trim() || undefined,
        price: numPrice,
        cost: numCost,
        stock: numStock,
        minStock: numMinStock,
        shelfLocation: shelfLocation.trim() || undefined,
        icon: icon.trim() || '📦',
        description: description.trim() || undefined,
      },
      !!editingProduct
    );

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Products Catalog</h2>
          <p className="text-xs text-neutral-500">
            Manage Bible translations, stationery items, books, and pricing
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
                <th className="py-3 px-3">SKU / Code</th>
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
                          <p className="font-semibold text-neutral-900">{p.name}</p>
                          {p.shelfLocation && (
                            <span className="text-[10px] text-neutral-400">
                              Shelf: {p.shelfLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-neutral-600 text-[11px]">
                      {p.sku}
                    </td>

                    <td className="py-3 px-3 text-neutral-600">
                      {p.category}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                      {formatCurrency(p.cost, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                      {formatCurrency(p.price, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700">
                      {margin.toFixed(0)}%
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-mono font-bold text-xs ${
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

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenNewStockModal(p.id)}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                          title="Record restock intake"
                        >
                          + Stock
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 cursor-pointer"
                          title="Edit details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Delete "${p.name}" from catalog? Past sales will be preserved.`
                              )
                            ) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100 cursor-pointer"
                          title="Delete product"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Holy Bible (KJV Large Print)"
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white focus:ring-2 focus:ring-emerald-600"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    SKU / Product Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. BIB-001"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Cost Price (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={cost}
                    onChange={(e) =>
                      setCost(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="e.g. 10000"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Selling Price (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Initial / On-Hand Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={stock}
                    onChange={(e) =>
                      setStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Min Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={minStock}
                    onChange={(e) =>
                      setMinStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Display Icon / Emoji
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📕"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Shelf Location (Optional)
                </label>
                <input
                  type="text"
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  placeholder="e.g. Aisle 1 / Shelf B"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
