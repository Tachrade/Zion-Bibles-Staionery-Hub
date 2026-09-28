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
import {
  formatCurrency,
  formatStockUnits,
  breakdownStock,
  calculateTotalPieces
} from '../../utils/formatters';

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
  const [price, setPrice] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [minStock, setMinStock] = useState<number | ''>(settings.defaultMinStock);
  const [shelfLocation, setShelfLocation] = useState('');
  const [icon, setIcon] = useState('📦');
  const [description, setDescription] = useState('');

  // Packs & Pieces configuration
  const [hasPacks, setHasPacks] = useState<boolean>(false);
  const [piecesPerPack, setPiecesPerPack] = useState<number | ''>(5);
  const [packPrice, setPackPrice] = useState<number | ''>('');
  const [packCost, setPackCost] = useState<number | ''>('');
  const [stockPacks, setStockPacks] = useState<number | ''>(0);
  const [stockPieces, setStockPieces] = useState<number | ''>(0);

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
    setPrice('');
    setCost('');
    setStock(10);
    setMinStock(settings.defaultMinStock);
    setShelfLocation('');
    setIcon('📦');
    setDescription('');
    setHasPacks(false);
    setPiecesPerPack(5);
    setPackPrice('');
    setPackCost('');
    setStockPacks(2);
    setStockPieces(0);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setSku(p.sku);
    setPrice(p.price);
    setCost(p.cost);
    setStock(p.stock);
    setMinStock(p.minStock);
    setShelfLocation(p.shelfLocation || '');
    setIcon(p.icon || '📦');
    setDescription(p.description || '');

    const pHasPacks = !!p.hasPacks;
    const ppp = p.piecesPerPack || 5;
    setHasPacks(pHasPacks);
    setPiecesPerPack(ppp);
    setPackPrice(p.packPrice ?? '');
    setPackCost(p.packCost ?? '');

    if (pHasPacks) {
      const b = breakdownStock(p.stock, ppp);
      setStockPacks(b.packs);
      setStockPieces(b.pieces);
    } else {
      setStockPacks(0);
      setStockPieces(p.stock);
    }

    setIsModalOpen(true);
  };

  const handlePacksOrPiecesChange = (newPacks: number | '', newPieces: number | '', pppVal?: number | '') => {
    const currentPpp = typeof pppVal === 'number' && pppVal > 0 ? pppVal : typeof piecesPerPack === 'number' && piecesPerPack > 0 ? piecesPerPack : 5;
    const pks = typeof newPacks === 'number' ? newPacks : 0;
    const pcs = typeof newPieces === 'number' ? newPieces : 0;
    const totalCalc = calculateTotalPieces(pks, pcs, currentPpp);
    setStock(totalCalc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter product name.');
    const numPrice = typeof price === 'number' ? price : 0;
    const numCost = typeof cost === 'number' ? cost : 0;
    const numMinStock = typeof minStock === 'number' ? minStock : settings.defaultMinStock;

    const numPpp = typeof piecesPerPack === 'number' && piecesPerPack > 0 ? piecesPerPack : 5;
    const finalStock = hasPacks
      ? calculateTotalPieces(
          typeof stockPacks === 'number' ? stockPacks : 0,
          typeof stockPieces === 'number' ? stockPieces : 0,
          numPpp
        )
      : typeof stock === 'number' ? stock : 0;

    if (numPrice < 0) return alert('Selling price cannot be negative.');
    if (numCost < 0) return alert('Cost price cannot be negative.');

    const numPackPrice = typeof packPrice === 'number' && packPrice > 0 ? packPrice : undefined;
    const numPackCost = typeof packCost === 'number' && packCost > 0 ? packCost : undefined;

    onSaveProduct(
      {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        name: name.trim(),
        category,
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-5)}`,
        price: numPrice,
        cost: numCost,
        stock: finalStock,
        minStock: numMinStock,
        shelfLocation: shelfLocation.trim() || undefined,
        icon: icon.trim() || '📦',
        description: description.trim() || undefined,
        hasPacks: hasPacks,
        piecesPerPack: hasPacks ? numPpp : undefined,
        packPrice: hasPacks ? numPackPrice : undefined,
        packCost: hasPacks ? numPackCost : undefined,
      },
      !!editingProduct
    );

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
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
              placeholder="Search product name or SKU / Code..."
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
                      {p.sku}
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
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(p.price, settings.currencySymbol)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700">
                      {margin.toFixed(0)}%
                    </td>

                    <td className="py-3 px-3 text-center">
                      {p.hasPacks && p.piecesPerPack ? (
                        <div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              p.stock <= 0
                                ? 'text-red-600'
                                : p.stock <= p.minStock
                                ? 'text-amber-700'
                                : 'text-neutral-900'
                            }`}
                          >
                            {formatStockUnits(p.stock, p.piecesPerPack, { short: true })}
                          </span>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            ({p.stock} pcs)
                          </div>
                        </div>
                      ) : (
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
                      )}
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
                    placeholder="e.g. 450"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-neutral-400">Unit / piece cost</span>
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
                    placeholder="e.g. 700"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-neutral-400">Single piece selling price</span>
                </div>
              </div>

              {/* Pack & Pieces Wholesale / Retail Unit System */}
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-emerald-800" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        Pack & Pieces Unit System (Wholesale / Retail)
                      </span>
                      <span className="text-[10px] text-emerald-800/80">
                        Sell by full pack (e.g. ₦3,000) or loose pieces (e.g. ₦700)
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPacks}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasPacks(checked);
                        if (checked) {
                          const ppp = typeof piecesPerPack === 'number' && piecesPerPack > 0 ? piecesPerPack : 5;
                          setPiecesPerPack(ppp);
                          const b = breakdownStock(typeof stock === 'number' ? stock : 0, ppp);
                          setStockPacks(b.packs);
                          setStockPieces(b.pieces);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700"></div>
                  </label>
                </div>

                {hasPacks && (
                  <div className="space-y-3 pt-2.5 border-t border-emerald-200">
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-950 mb-1">
                          Pieces per Pack <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="2"
                          step="1"
                          required={hasPacks}
                          value={piecesPerPack}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                            setPiecesPerPack(val);
                            handlePacksOrPiecesChange(stockPacks, stockPieces, val);
                          }}
                          placeholder="e.g. 5"
                          className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono focus:ring-2 focus:ring-emerald-600 font-semibold"
                        />
                        <span className="text-[10px] text-neutral-500">e.g. 5 pcs in 1 pk</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-950 mb-1">
                          Pack Selling Price (₦) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required={hasPacks}
                          value={packPrice}
                          onChange={(e) =>
                            setPackPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                          placeholder="e.g. 3000"
                          className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-900"
                        />
                        <span className="text-[10px] text-neutral-500">Full pack selling price</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-950 mb-1">
                          Pack Cost Price (₦)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={packCost}
                          onChange={(e) =>
                            setPackCost(e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                          placeholder="e.g. 2250"
                          className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                        />
                        <span className="text-[10px] text-neutral-500">Pack purchase cost</span>
                      </div>
                    </div>

                    {/* Pack & Pieces Stock Counter Helper */}
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2">
                      <label className="block text-[11px] font-bold text-neutral-800">
                        Set Initial Stock in Packs & Loose Pieces:
                      </label>
                      <div className="grid grid-cols-2 gap-3 items-center">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={stockPacks}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                setStockPacks(val);
                                handlePacksOrPiecesChange(val, stockPieces);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs font-mono font-bold"
                            />
                            <span className="text-xs text-neutral-700 font-semibold">packs</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={stockPieces}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                setStockPieces(val);
                                handlePacksOrPiecesChange(stockPacks, val);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs font-mono font-bold"
                            />
                            <span className="text-xs text-neutral-700 font-semibold">loose pcs</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-emerald-900 font-semibold bg-emerald-100/80 px-2.5 py-1.5 rounded border border-emerald-200 flex items-center justify-between">
                        <span>Total Base Stock:</span>
                        <span>
                          {calculateTotalPieces(
                            typeof stockPacks === 'number' ? stockPacks : 0,
                            typeof stockPieces === 'number' ? stockPieces : 0,
                            typeof piecesPerPack === 'number' ? piecesPerPack : 5
                          )}{' '}
                          pieces ({stockPacks || 0} pks {stockPieces || 0} pcs)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {hasPacks ? 'Total Stock (Pcs)' : 'Initial / On-Hand Stock'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={stock}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                      setStock(val);
                      if (hasPacks) {
                        const b = breakdownStock(val === '' ? 0 : val, typeof piecesPerPack === 'number' ? piecesPerPack : 5);
                        setStockPacks(b.packs);
                        setStockPieces(b.pieces);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                  {hasPacks && (
                    <span className="text-[10px] text-neutral-400">Total pieces</span>
                  )}
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
