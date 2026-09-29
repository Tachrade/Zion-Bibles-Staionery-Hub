import React, { useState, useEffect } from 'react';
import { Package, X, Boxes, Barcode } from 'lucide-react';
import { Product, ProductCategory, ShopSettings } from '../../types';
import { breakdownStock, calculateTotalPieces } from '../../utils/formatters';

interface ProductFormProps {
  isOpen: boolean;
  editingProduct: Product | null;
  settings: ShopSettings;
  categories: ProductCategory[];
  onClose: () => void;
  onSave: (productData: Omit<Product, 'createdAt' | 'updatedAt'>, isEdit: boolean) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  editingProduct,
  settings,
  categories,
  onClose,
  onSave,
}) => {
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

  // Packs & Pieces configuration
  const [hasPacks, setHasPacks] = useState<boolean>(false);
  const [piecesPerPack, setPiecesPerPack] = useState<number | ''>(5);
  const [packPrice, setPackPrice] = useState<number | ''>('');
  const [packCost, setPackCost] = useState<number | ''>('');
  const [stockPacks, setStockPacks] = useState<number | ''>(0);
  const [stockPieces, setStockPieces] = useState<number | ''>(0);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setSku(editingProduct.sku);
      setBarcode(editingProduct.barcode || '');
      setPrice(editingProduct.price);
      setCost(editingProduct.cost);
      setStock(editingProduct.stock);
      setMinStock(editingProduct.minStock);
      setShelfLocation(editingProduct.shelfLocation || '');
      setIcon(editingProduct.icon || '📦');
      setDescription(editingProduct.description || '');

      const pHasPacks = !!editingProduct.hasPacks;
      const ppp = editingProduct.piecesPerPack || 5;
      setHasPacks(pHasPacks);
      setPiecesPerPack(ppp);
      setPackPrice(editingProduct.packPrice ?? '');
      setPackCost(editingProduct.packCost ?? '');

      if (pHasPacks) {
        const b = breakdownStock(editingProduct.stock, ppp);
        setStockPacks(b.packs);
        setStockPieces(b.pieces);
      }
    } else {
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
      setHasPacks(false);
      setPiecesPerPack(5);
      setPackPrice('');
      setPackCost('');
      setStockPacks(2);
      setStockPieces(0);
    }
  }, [editingProduct, isOpen, settings.defaultMinStock]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Product name is required.');

    const numPrice = typeof price === 'number' ? price : 0;
    const numCost = typeof cost === 'number' ? cost : 0;
    const numMinStock = typeof minStock === 'number' ? minStock : settings.defaultMinStock;
    const numPpp = typeof piecesPerPack === 'number' && piecesPerPack > 0 ? piecesPerPack : 1;

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

    // Safely assign barcode: trimmed string if non-empty, otherwise undefined (sanitized before Firestore)
    const cleanBarcode = barcode.trim();

    onSave(
      {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        name: name.trim(),
        category,
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-5)}`,
        barcode: cleanBarcode || undefined,
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

    onClose();
  };

  return (
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
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
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

          {/* Barcode / UPC Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-neutral-500" />
                Barcode / ISBN / UPC (Optional)
              </span>
              <span className="text-[10px] text-neutral-400 font-normal">Optional hardware barcode</span>
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 9780191234561 (leave blank if none)"
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
            />
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
                  onChange={(e) => setHasPacks(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {hasPacks && (
              <div className="pt-2 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-950 mb-1">
                    Pieces Per Pack <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2"
                    step="1"
                    required={hasPacks}
                    value={piecesPerPack}
                    onChange={(e) =>
                      setPiecesPerPack(
                        e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      )
                    }
                    placeholder="e.g. 5"
                    className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[9px] text-emerald-700">e.g. 5 notebooks in 1 pack</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-950 mb-1">
                    Pack Selling Price (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={packPrice}
                    onChange={(e) =>
                      setPackPrice(
                        e.target.value === '' ? '' : parseFloat(e.target.value)
                      )
                    }
                    placeholder="e.g. 3000"
                    className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[9px] text-emerald-700">Whole pack discount price</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-950 mb-1">
                    Pack Cost (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={packCost}
                    onChange={(e) =>
                      setPackCost(
                        e.target.value === '' ? '' : parseFloat(e.target.value)
                      )
                    }
                    placeholder="e.g. 2400"
                    className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[9px] text-emerald-700">Wholesale cost per pack</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {hasPacks ? 'Current Total Pieces' : 'Current Stock'} <span className="text-red-500">*</span>
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
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 shadow-sm"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
