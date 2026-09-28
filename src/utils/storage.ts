import { Product, StockMovement, Sale, ShopSettings, ShopUser } from '../types';

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Zion Bible & Stationery Hub',
  tagline: 'Quality Scriptures, Christian Books, Stationery & Church Supplies',
  address: 'Shop 14, Grace Plaza, Commercial Avenue',
  phone: '+234 803 123 4567',
  email: 'contact@zionstationery.com',
  receiptFooter: 'Thank you for shopping with us! May God richly bless you!',
  currencySymbol: '₦',
  defaultMinStock: 5,
  enableSoundEffects: true,
  receiptPaperWidth: '58mm',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Holy Bible (KJV Reference & Concordance)',
    category: 'Bibles',
    sku: 'BIB-KJV-01',
    price: 15000,
    cost: 10500,
    stock: 24,
    minStock: 5,
    shelfLocation: 'Aisle 1 / Shelf A',
    icon: '📕',
    description: 'Black leatherette cover with red letter text and study maps.',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Holy Bible (NIV Student Edition)',
    category: 'Bibles',
    sku: 'BIB-NIV-02',
    price: 18500,
    cost: 13000,
    stock: 12,
    minStock: 6,
    shelfLocation: 'Aisle 1 / Shelf B',
    icon: '📖',
    description: 'Complete text with footnotes and quick-reference dictionary.',
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'The Purpose Driven Life (Rick Warren)',
    category: 'Books & Literature',
    sku: 'BK-PDL-03',
    price: 6500,
    cost: 4200,
    stock: 4,
    minStock: 5,
    shelfLocation: 'Aisle 2 / Front Display',
    icon: '📘',
    description: 'Bestselling spiritual growth and purpose devotional guide.',
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Higher Education Notebook (80 Leaves, 2A)',
    category: 'Stationery',
    sku: 'STN-HE-04',
    price: 700,
    cost: 450,
    stock: 45,
    minStock: 10,
    shelfLocation: 'Stationery Bay / Rack 2',
    icon: '📚',
    description: 'Higher Education notebooks. 5 pcs per pack. Pack price: ₦3,000, Piece price: ₦700.',
    hasPacks: true,
    piecesPerPack: 5,
    packPrice: 3000,
    packCost: 2250,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-4b',
    name: 'Hardcover Notebook (A4, 200 Pages)',
    category: 'Stationery',
    sku: 'STN-NB-A4',
    price: 2500,
    cost: 1500,
    stock: 46,
    minStock: 10,
    shelfLocation: 'Stationery Bay / Rack 3',
    icon: '📓',
    description: 'Durable faux-leather embossed spine, ruled margins.',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-5',
    name: 'Schneider Ballpoint Pen (Blue, Box of 50)',
    category: 'Stationery',
    sku: 'STN-PEN-BL',
    price: 12000,
    cost: 8500,
    stock: 8,
    minStock: 4,
    shelfLocation: 'Counter Storage C-1',
    icon: '🖊️',
    description: 'German quality smooth ink pens for everyday writing.',
    createdAt: '2026-09-03T11:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-6',
    name: 'Oxford Mathematical Set (Original Tin)',
    category: 'Stationery',
    sku: 'STN-MATH-06',
    price: 3200,
    cost: 2100,
    stock: 3,
    minStock: 8,
    shelfLocation: 'Stationery Bay / Rack 1',
    icon: '📐',
    description: 'Genuine Oxford metal case with compass, dividers, set squares.',
    createdAt: '2026-09-04T12:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-7',
    name: 'Communion Cups (Box of 1000)',
    category: 'Church Supplies',
    sku: 'CHR-CUP-1000',
    price: 28000,
    cost: 20000,
    stock: 6,
    minStock: 3,
    shelfLocation: 'Church Supply Store Room',
    icon: '🍷',
    description: 'Disposable crystal-clear communion chalice cups.',
    createdAt: '2026-09-08T09:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-8',
    name: 'Scripture Wooden Desk Plaque ("As for Me & My House")',
    category: 'Gift Items',
    sku: 'GFT-PLQ-08',
    price: 7500,
    cost: 4500,
    stock: 9,
    minStock: 3,
    shelfLocation: 'Gift Showcase 2',
    icon: '🪵',
    description: 'Carved cedar finish with gold typography.',
    createdAt: '2026-09-10T14:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-9',
    name: 'Pelikan Highlighter Assorted (Pack of 4)',
    category: 'Stationery',
    sku: 'STN-HL-04',
    price: 2200,
    cost: 1400,
    stock: 2,
    minStock: 6,
    shelfLocation: 'Stationery Bay / Rack 2',
    icon: '🖍️',
    description: 'Fluorescent yellow, pink, green, orange chisel tip.',
    createdAt: '2026-09-12T15:00:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'prod-10',
    name: 'Helix 30cm Shatterproof Ruler',
    category: 'Stationery',
    sku: 'STN-RUL-30',
    price: 700,
    cost: 350,
    stock: 35,
    minStock: 10,
    shelfLocation: 'Counter Storage C-2',
    icon: '📏',
    description: 'Metric and imperial markings with bevelled edge.',
    createdAt: '2026-09-12T15:30:00.000Z',
    updatedAt: '2026-09-28T08:00:00.000Z',
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    productName: 'Holy Bible (KJV Reference & Concordance)',
    productSku: 'BIB-KJV-01',
    type: 'restock',
    quantityChange: 20,
    stockBefore: 5,
    stockAfter: 25,
    date: '2026-09-25T10:15:00.000Z',
    referenceNo: 'PO-2026-089',
    supplierOrParty: 'Bible Society of Nigeria Depot',
    unitCostAtMovement: 10500,
    notes: 'Quarterly Scripture replenishment shipment received in good condition.',
  },
  {
    id: 'mov-2',
    productId: 'prod-1',
    productName: 'Holy Bible (KJV Reference & Concordance)',
    productSku: 'BIB-KJV-01',
    type: 'sale',
    quantityChange: -1,
    stockBefore: 25,
    stockAfter: 24,
    date: '2026-09-27T14:22:00.000Z',
    referenceNo: 'RCP-000101',
    supplierOrParty: 'Pastor Emmanuel Adeleke',
    unitCostAtMovement: 10500,
    notes: 'POS Sale #000101 - 1 copy purchased.',
  },
  {
    id: 'mov-3',
    productId: 'prod-4',
    productName: 'Hardcover Notebook (A4, 200 Pages)',
    productSku: 'STN-NB-A4',
    type: 'restock',
    quantityChange: 50,
    stockBefore: 0,
    stockAfter: 50,
    date: '2026-09-26T09:00:00.000Z',
    referenceNo: 'INV-ST-402',
    supplierOrParty: 'Apex Paper & Stationery Wholesalers',
    unitCostAtMovement: 1500,
    notes: 'Back-to-school stock intake (1 carton).',
  },
  {
    id: 'mov-4',
    productId: 'prod-4',
    productName: 'Hardcover Notebook (A4, 200 Pages)',
    productSku: 'STN-NB-A4',
    type: 'sale',
    quantityChange: -4,
    stockBefore: 50,
    stockAfter: 46,
    date: '2026-09-27T16:45:00.000Z',
    referenceNo: 'RCP-000102',
    supplierOrParty: 'Grace Academy Secretariat',
    unitCostAtMovement: 1500,
    notes: 'POS Sale #000102 - 4 units for church admin.',
  },
  {
    id: 'mov-5',
    productId: 'prod-6',
    productName: 'Oxford Mathematical Set (Original Tin)',
    productSku: 'STN-MATH-06',
    type: 'sale',
    quantityChange: -2,
    stockBefore: 5,
    stockAfter: 3,
    date: '2026-09-28T07:30:00.000Z',
    referenceNo: 'RCP-000103',
    supplierOrParty: 'Mrs. Folake Johnson',
    unitCostAtMovement: 2100,
    notes: 'POS Sale #000103 - Alert triggered: stock reached low threshold (3 remaining).',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    receiptNo: '000101',
    date: '2026-09-27T14:22:00.000Z',
    items: [
      {
        productId: 'prod-1',
        name: 'Holy Bible (KJV Reference & Concordance)',
        sku: 'BIB-KJV-01',
        category: 'Bibles',
        quantity: 1,
        price: 15000,
        cost: 10500,
      }
    ],
    subtotal: 15000,
    discount: 0,
    total: 15000,
    paymentMethod: 'Transfer',
    customerName: 'Pastor Emmanuel Adeleke',
    customerPhone: '+234 802 334 5566',
    cashier: 'Zion Admin',
  },
  {
    id: 'sale-2',
    receiptNo: '000102',
    date: '2026-09-27T16:45:00.000Z',
    items: [
      {
        productId: 'prod-4',
        name: 'Hardcover Notebook (A4, 200 Pages)',
        sku: 'STN-NB-A4',
        category: 'Stationery',
        quantity: 4,
        price: 2500,
        cost: 1500,
      }
    ],
    subtotal: 10000,
    discount: 0,
    total: 10000,
    paymentMethod: 'POS Card',
    customerName: 'Grace Academy Secretariat',
    cashier: 'Zion Admin',
  },
  {
    id: 'sale-3',
    receiptNo: '000103',
    date: '2026-09-28T07:30:00.000Z',
    items: [
      {
        productId: 'prod-6',
        name: 'Oxford Mathematical Set (Original Tin)',
        sku: 'STN-MATH-06',
        category: 'Stationery',
        quantity: 2,
        price: 3200,
        cost: 2100,
      }
    ],
    subtotal: 6400,
    discount: 0,
    total: 6400,
    paymentMethod: 'Cash',
    customerName: 'Mrs. Folake Johnson',
    cashier: 'Zion Admin',
  }
];

const STORAGE_KEYS = {
  PRODUCTS: 'zion_products_v2',
  MOVEMENTS: 'zion_stock_movements_v2',
  SALES: 'zion_sales_v2',
  SETTINGS: 'zion_settings_v2',
  IS_INITIALIZED: 'zion_is_initialized_v2',
};

export function isStoreInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED) === 'true';
}

export function setStoreInitialized(val: boolean): void {
  localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, val ? 'true' : 'false');
}

export function loadStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // If not initialized yet, return initial sample products
    if (!isStoreInitialized()) {
      return INITIAL_PRODUCTS;
    }
    return [];
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    setStoreInitialized(true);
  } catch (e) {
    console.error('Failed to save products:', e);
  }
}

export function loadStoredMovements(): StockMovement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    if (!isStoreInitialized()) {
      return INITIAL_STOCK_MOVEMENTS;
    }
    return [];
  } catch {
    return INITIAL_STOCK_MOVEMENTS;
  }
}

export function saveStoredMovements(movements: StockMovement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  } catch (e) {
    console.error('Failed to save stock movements:', e);
  }
}

export function loadStoredSales(): Sale[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    if (!isStoreInitialized()) {
      return INITIAL_SALES;
    }
    return [];
  } catch {
    return INITIAL_SALES;
  }
}

export function saveStoredSales(sales: Sale[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  } catch (e) {
    console.error('Failed to save sales:', e);
  }
}

export function loadStoredSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const INITIAL_USERS: ShopUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    displayName: 'Shop Admin',
    role: 'admin',
    password: 'admin',
    active: true,
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'user-cashier-1',
    username: 'cashier',
    displayName: 'Counter Attendant',
    role: 'cashier',
    password: '1234',
    active: true,
    createdAt: '2026-09-01T08:00:00.000Z',
  }
];

export function loadStoredUsers(): ShopUser[] {
  try {
    const raw = localStorage.getItem('zion_users_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: ShopUser[]): void {
  try {
    localStorage.setItem('zion_users_v2', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export function saveStoredSettings(settings: ShopSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

