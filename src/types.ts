export type ProductCategory = 
  | 'Bibles'
  | 'Books & Literature'
  | 'Stationery'
  | 'Church Supplies'
  | 'Gift Items'
  | 'Others';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  sku: string;
  barcode?: string;
  price: number; // Selling price in NGN
  cost: number;  // Cost price in NGN
  stock: number; // Current on-hand quantity
  minStock: number; // Reorder alert threshold (default e.g. 5)
  shelfLocation?: string; // e.g. "Shelf A-3", "Display Table 1"
  icon: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 
  | 'restock'      // New stock added / purchase intake
  | 'sale'         // Deducted from sale
  | 'adjustment'   // Physical count reconciliation
  | 'return'       // Customer return added back
  | 'damage'       // Damaged / expired / written-off
  | 'initial';     // Initial stock registration

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: StockMovementType;
  quantityChange: number; // positive for addition (+10), negative for sale/reduction (-2)
  stockBefore: number;
  stockAfter: number;
  date: string;
  referenceNo?: string; // Receipt # for sales (e.g. "RCP-000104"), Invoice/PO # for restock
  supplierOrParty?: string; // e.g. "Scripture Union Distributors", "Walk-in Customer"
  unitCostAtMovement?: number;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  cost: number;
}

export type PaymentMethod = 'Cash' | 'Transfer' | 'POS Card' | 'Credit' | 'Other';

export interface Sale {
  id: string;
  receiptNo: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  cashier?: string;
  notes?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  receiptFooter: string;
  currencySymbol: string;
  defaultMinStock: number;
  enableSoundEffects: boolean;
  receiptPaperWidth?: '58mm' | '80mm';
  logoUrl?: string;
  isClearedToZero?: boolean;
  cloudInitialized?: boolean;
}

export type UserRole = 'admin' | 'cashier';

export interface ShopUser {
  id: string;
  username: string; // e.g. "admin", "grace", "john"
  displayName: string; // "Sister Grace"
  role: UserRole;
  password: string; // Admin-assigned password
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface PostSaleStockCheckItem {
  productId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  previousStock: number;
  currentStock: number;
  minStock: number;
  status: 'good' | 'low' | 'out_of_stock';
}
