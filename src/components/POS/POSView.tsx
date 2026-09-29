import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Tag,
  Calendar,
  Clock,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, PaymentMethod, SaleItem, ShopSettings, SaleUnitType } from '../../types';
import { formatCurrency, formatStockUnits } from '../../utils/formatters';

interface POSViewProps {
  products: Product[];
  settings: ShopSettings;
  onCompleteSale: (saleData: {
    items: SaleItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerPhone: string;
    customDate?: string;
  }) => void;
}

interface CartItem {
  id: string; // `${product.id}-${unitType}`
  product: Product;
  quantity: number;
  unitType: SaleUnitType;
  unitPrice: number;
  unitCost: number;
  piecesPerPack: number;
  totalPieces: number; // total base pieces deducted
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  settings,
  onCompleteSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number | ''>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Past / Custom Date State
  const [isPastDateSale, setIsPastDateSale] = useState(false);
  const [customSaleDate, setCustomSaleDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const categories = ['All', 'Bibles', 'Books & Literature', 'Stationery', 'Church Supplies', 'Gift Items'];

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate total pieces of a specific product already in cart
  const getProductPiecesInCart = (productId: string, excludeItemId?: string) => {
    return cart
      .filter((i) => i.product.id === productId && i.id !== excludeItemId)
      .reduce((sum, i) => sum + i.totalPieces, 0);
  };

  const addToCart = (product: Product, unitType: SaleUnitType = 'piece') => {
    if (product.stock <= 0) return;

    const ppp = product.piecesPerPack || 1;
    const piecesNeeded = unitType === 'pack' ? ppp : 1;
    const currentInCart = getProductPiecesInCart(product.id);
    const availablePieces = product.stock - currentInCart;

    if (availablePieces < piecesNeeded) {
      alert(
        `Insufficient stock for "${product.name}". Remaining available: ${availablePieces} piece(s). Cannot add ${unitType} (${piecesNeeded} pcs).`
      );
      return;
    }

    const price = unitType === 'pack' && product.packPrice ? product.packPrice : product.price;
    const cost = unitType === 'pack' && product.packCost ? product.packCost : product.cost * (unitType === 'pack' ? ppp : 1);
    const cartItemId = `${product.id}-${unitType}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + 1;
            return {
              ...item,
              quantity: newQty,
              totalPieces: newQty * (unitType === 'pack' ? ppp : 1),
            };
          }
          return item;
        });
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          unitType,
          quantity: 1,
          unitPrice: price,
          unitCost: cost,
          piecesPerPack: ppp,
          totalPieces: piecesNeeded,
        },
      ];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;

            const ppp = item.unitType === 'pack' ? item.piecesPerPack : 1;
            const newTotalPieces = newQty * ppp;
            const otherPiecesInCart = getProductPiecesInCart(item.product.id, item.id);

            if (otherPiecesInCart + newTotalPieces > item.product.stock) {
              const maxExtra = item.product.stock - (otherPiecesInCart + item.totalPieces);
              alert(
                `Cannot add more units for "${item.product.name}". Maximum available pieces in stock reached.`
              );
              return item;
            }

            return {
              ...item,
              quantity: newQty,
              totalPieces: newTotalPieces,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const numDiscount = typeof discount === 'number' ? Math.max(0, discount) : 0;
  const total = Math.max(0, subtotal - numDiscount);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Validate that total pieces deducted across all cart items don't exceed stock
    for (const p of products) {
      const piecesForProduct = cart
        .filter((c) => c.product.id === p.id)
        .reduce((sum, c) => sum + c.totalPieces, 0);

      if (piecesForProduct > p.stock) {
        alert(
          `Insufficient stock for "${p.name}". Total requested: ${piecesForProduct} pcs, Available: ${p.stock} pcs.`
        );
        return;
      }
    }

    const saleItems: SaleItem[] = cart.map((item) => ({
      productId: item.product.id,
      name:
        item.unitType === 'pack'
          ? `${item.product.name} (Pack)`
          : item.product.hasPacks
          ? `${item.product.name} (Piece)`
          : item.product.name,
      sku: item.product.sku,
      category: item.product.category,
      quantity: item.quantity,
      unitType: item.unitType,
      piecesPerPack: item.piecesPerPack,
      totalPiecesDeducted: item.totalPieces,
      price: item.unitPrice,
      cost: item.unitCost,
    }));

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    onCompleteSale({
      items: saleItems,
      subtotal,
      discount: numDiscount,
      total,
      paymentMethod,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customDate: isPastDateSale && customSaleDate ? new Date(customSaleDate).toISOString() : undefined,
    });

    clearCart();
    setIsPastDateSale(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Product Catalog Grid (7 or 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          {/* Search & Category Header */}
          <div className="p-4 border-b border-neutral-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Bible, book, stationery, SKU, or barcode..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                autoFocus
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const ppp = p.piecesPerPack || 1;
                const inCartPieces = getProductPiecesInCart(p.id);
                const remainingPieces = Math.max(0, p.stock - inCartPieces);
                const isOut = p.stock <= 0 || remainingPieces <= 0;
                const isLow = remainingPieces > 0 && remainingPieces <= p.minStock;

                const canBuyPiece = remainingPieces >= 1;
                const canBuyPack = !!p.hasPacks && remainingPieces >= ppp;

                // Total items of this product in cart (for badge)
                const itemsOfProdInCart = cart.filter((i) => i.product.id === p.id);
                const totalUnitsInCart = itemsOfProdInCart.reduce((sum, i) => sum + i.quantity, 0);

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between group relative ${
                      isOut
                        ? 'opacity-60 bg-neutral-50 border-neutral-200'
                        : 'bg-white border-neutral-200/90 shadow-2xs hover:border-emerald-600'
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition-transform">
                        {p.icon || '📦'}
                      </div>
                      <h4 className="font-semibold text-xs text-neutral-900 line-clamp-2 leading-tight">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {p.sku}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-100 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div className="text-[10px]">
                          {isOut ? (
                            <span className="text-red-600 font-bold">Out of stock</span>
                          ) : (
                            <span
                              className={`font-mono font-medium ${
                                isLow ? 'text-amber-700' : 'text-neutral-600'
                              }`}
                            >
                              Stock:{' '}
                              {p.hasPacks
                                ? formatStockUnits(remainingPieces, p.piecesPerPack, {
                                    showTotalPieces: true,
                                    short: true,
                                  })
                                : `${remainingPieces} pcs`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing and Action Buttons */}
                      {p.hasPacks && p.packPrice ? (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => addToCart(p, 'piece')}
                            disabled={!canBuyPiece}
                            className={`py-1.5 px-2 rounded-lg text-center font-mono text-[11px] font-bold border transition-colors ${
                              !canBuyPiece
                                ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                            }`}
                          >
                            <span className="block text-[9px] uppercase tracking-wider text-emerald-700 font-sans font-semibold">
                              +1 Piece
                            </span>
                            {formatCurrency(p.price, settings.currencySymbol)}
                          </button>

                          <button
                            type="button"
                            onClick={() => addToCart(p, 'pack')}
                            disabled={!canBuyPack}
                            className={`py-1.5 px-2 rounded-lg text-center font-mono text-[11px] font-bold border transition-colors ${
                              !canBuyPack
                                ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                                : 'bg-emerald-800 text-white border-emerald-900 hover:bg-emerald-900 shadow-2xs cursor-pointer'
                            }`}
                          >
                            <span className="block text-[9px] uppercase tracking-wider text-emerald-200 font-sans font-semibold">
                              +1 Pack ({p.piecesPerPack})
                            </span>
                            {formatCurrency(p.packPrice, settings.currencySymbol)}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(p, 'piece')}
                          disabled={!canBuyPiece}
                          className={`w-full py-1.5 px-3 rounded-lg flex items-center justify-between font-mono font-bold text-xs border transition-colors ${
                            !canBuyPiece
                              ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                          }`}
                        >
                          <span className="text-[10px] font-sans font-semibold text-emerald-700">
                            + Add to Order
                          </span>
                          <span>{formatCurrency(p.price, settings.currencySymbol)}</span>
                        </button>
                      )}
                    </div>

                    {totalUnitsInCart > 0 && (
                      <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-1.5 h-5 rounded-full flex items-center justify-center shadow-xs">
                        {totalUnitsInCart} in cart
                      </span>
                    )}
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center text-neutral-400 text-xs">
                  No matching items found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cart & Checkout Checkout Panel (5 or 4 cols) */}
        <div id="cart-checkout-section" className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden scroll-mt-4">
          {/* Cart Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-emerald-950 text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-300" />
              <h3 className="font-bold text-sm">Current Order</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
            {cart.map((item) => {
              const lineTotal = item.unitPrice * item.quantity;
              const otherPieces = getProductPiecesInCart(item.product.id, item.id);
              const ppp = item.unitType === 'pack' ? item.piecesPerPack : 1;
              const isMaxStock = otherPieces + (item.quantity + 1) * ppp > item.product.stock;

              return (
                <div
                  key={item.id}
                  className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="font-semibold text-neutral-900 truncate">
                        {item.product.name}
                      </h5>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.unitType === 'pack'
                            ? 'bg-emerald-800 text-white'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {item.unitType === 'pack'
                          ? `Pack (${item.piecesPerPack} pcs)`
                          : 'Piece'}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-emerald-700 font-semibold">
                        {formatCurrency(item.unitPrice, settings.currencySymbol)} each
                      </span>
                      <span>·</span>
                      <span className="font-mono text-neutral-400">
                        deducts: {item.totalPieces} pcs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-white border border-neutral-300 rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={isMaxStock}
                        className={`w-6 h-6 flex items-center justify-center rounded cursor-pointer ${
                          isMaxStock
                            ? 'text-neutral-300 cursor-not-allowed'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                        title={isMaxStock ? 'Maximum available stock reached' : ''}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-mono font-bold text-neutral-900">
                        {formatCurrency(lineTotal, settings.currencySymbol)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-neutral-400">
                <ShoppingCart className="w-10 h-10 mb-2 stroke-1 text-neutral-300" />
                <p className="text-xs font-medium">Cart is currently empty</p>
                <p className="text-[11px] text-neutral-400 max-w-[200px] mt-0.5">
                  Click any product from the catalog on the left to begin sale.
                </p>
              </div>
            )}
          </div>

          {/* Checkout Controls & Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-neutral-200 bg-neutral-50/70 space-y-3">
              {/* Customer details accordion/inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name (optional)"
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone # (optional)"
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Sale Date & Time Selector (Supports Past Dates) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Sale Date & Time:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPastDateSale(!isPastDateSale)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                  >
                    {isPastDateSale ? '⚡ Use Current Time' : '📅 Record Past Date Sale'}
                  </button>
                </div>

                {isPastDateSale ? (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-amber-950 flex items-center gap-1">
                        <History className="w-3.5 h-3.5 text-amber-700" />
                        <span>Select Past Date & Time:</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const y = new Date();
                            y.setDate(y.getDate() - 1);
                            y.setMinutes(y.getMinutes() - y.getTimezoneOffset());
                            setCustomSaleDate(y.toISOString().slice(0, 16));
                          }}
                          className="px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 text-[10px] font-medium hover:bg-amber-100 cursor-pointer"
                        >
                          Yesterday
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 2);
                            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                            setCustomSaleDate(d.toISOString().slice(0, 16));
                          }}
                          className="px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 text-[10px] font-medium hover:bg-amber-100 cursor-pointer"
                        >
                          2 Days Ago
                        </button>
                      </div>
                    </div>
                    <input
                      type="datetime-local"
                      value={customSaleDate}
                      onChange={(e) => setCustomSaleDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono text-neutral-900 focus:ring-2 focus:ring-amber-600"
                    />
                    <p className="text-[10px] text-amber-800 leading-tight">
                      ✓ Receipt, stock movement history, and financial reports will record this past date.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-[11px] text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>Today / Current Time (Real-time Sale)</span>
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">Automatic</span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Cash', 'Transfer', 'POS Card'] as PaymentMethod[]).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                        paymentMethod === pm
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-1 pt-1 text-xs border-t border-neutral-200">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-mono">
                    {formatCurrency(subtotal, settings.currencySymbol)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-neutral-400" />
                    <span>Discount (₦)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-24 text-right px-2 py-0.5 bg-white border border-neutral-300 rounded text-xs font-mono"
                  />
                </div>

                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1 border-t border-neutral-300/80">
                  <span>Total Due:</span>
                  <span className="font-mono text-base text-emerald-800">
                    {formatCurrency(total, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Sale & Verify Stock</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button for Mobile Phones */}
      {cart.length > 0 && (
        <div className="lg:hidden sticky bottom-2 left-0 right-0 z-40 mt-3">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('cart-checkout-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-between cursor-pointer border border-emerald-600 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-300" />
              <span>Checkout Order ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
            </div>
            <span className="font-mono text-amber-300 font-bold">
              {formatCurrency(total, settings.currencySymbol)} →
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
