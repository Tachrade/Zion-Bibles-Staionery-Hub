import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { LoginPage } from './components/Auth/LoginPage';
import { Sidebar, NavigationPage } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/Dashboard/DashboardView';
import { StockManagementView } from './components/StockManagement/StockManagementView';
import { NewStockModal } from './components/StockManagement/NewStockModal';
import { StockAdjustmentModal } from './components/StockManagement/StockAdjustmentModal';
import { POSView } from './components/POS/POSView';
import { PostSaleStockCheckModal } from './components/POS/PostSaleStockCheckModal';
import { ProductsView } from './components/Products/ProductsView';
import { SalesHistoryView } from './components/Sales/SalesHistoryView';
import { ReportsView } from './components/Reports/ReportsView';
import { StaffManagementView } from './components/Users/StaffManagementView';
import { SettingsView } from './components/Settings/SettingsView';
import { CashierDashboardView } from './components/Cashier/CashierDashboardView';

import {
  Product,
  StockMovement,
  Sale,
  SaleItem,
  PaymentMethod,
  ShopSettings,
  StockMovementType,
  ShopUser
} from './types';
import {
  loadStoredProducts,
  saveStoredProducts,
  loadStoredMovements,
  saveStoredMovements,
  loadStoredSales,
  saveStoredSales,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredUsers,
  saveStoredUsers,
  INITIAL_PRODUCTS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SALES,
  INITIAL_USERS,
  DEFAULT_SETTINGS
} from './utils/storage';
import { exportInventoryToExcel, downloadJsonBackup } from './utils/excel';
import {
  saveProductToCloud,
  deleteProductFromCloud,
  saveMovementToCloud,
  saveSaleToCloud,
  deleteSaleFromCloud,
  saveSettingsToCloud,
  saveUserToCloud,
  deleteUserFromCloud,
  subscribeToCloudProducts,
  subscribeToCloudMovements,
  subscribeToCloudSales,
  subscribeToCloudSettings,
  subscribeToCloudUsers,
  uploadLocalDataToCloud,
  clearAllCloudData
} from './services/cloudSync';

export default function App() {
  // Check URL parameters for direct Cashier Terminal link: e.g. "?portal=cashier"
  const [activePortal, setActivePortal] = useState<'admin' | 'cashier'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'cashier') return 'cashier';
    const saved = localStorage.getItem('zion_active_portal');
    return saved === 'cashier' ? 'cashier' : 'admin';
  });

  // Authentication state
  const [users, setUsers] = useState<ShopUser[]>(loadStoredUsers);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('zion_auth_session') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<ShopUser>(() => {
    const raw = localStorage.getItem('zion_current_user_obj');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return users[0] || INITIAL_USERS[0];
  });
  const [shopPasscode, setShopPasscode] = useState<string>(() => {
    return localStorage.getItem('zion_shop_passcode') || 'zion2026';
  });

  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [products, setProducts] = useState<Product[]>(loadStoredProducts);
  const [movements, setMovements] = useState<StockMovement[]>(loadStoredMovements);
  const [sales, setSales] = useState<Sale[]>(loadStoredSales);
  const [settings, setSettings] = useState<ShopSettings>(loadStoredSettings);
  const [isCloudSyncing, setIsCloudSyncing] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals state
  const [isNewStockOpen, setIsNewStockOpen] = useState(false);
  const [newStockProductId, setNewStockProductId] = useState<string | undefined>(undefined);

  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  const [isPostSaleCheckOpen, setIsPostSaleCheckOpen] = useState(false);
  const [currentSaleForPostCheck, setCurrentSaleForPostCheck] = useState<Sale | null>(null);

  // Firebase Auth session listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setIsAuthenticated(true);
        localStorage.setItem('zion_auth_session', 'true');
      }
    });
    return () => unsub();
  }, []);

  // Sync users to storage
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  // Listen to Firestore changes in real-time
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Subscribe to Cloud Users (Admin-assigned accounts)
    const unsubUsers = subscribeToCloudUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
        saveStoredUsers(cloudUsers);
      } else if (users.length > 0) {
        // Upload initial default users to cloud
        users.forEach((u) => saveUserToCloud(u));
      }
    });

    // 2. Subscribe to Cloud Products
    let hasSyncedInitialProducts = false;
    const unsubProducts = subscribeToCloudProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
        saveStoredProducts(cloudProducts);
      } else if (!hasSyncedInitialProducts && products.length > 0) {
        hasSyncedInitialProducts = true;
        uploadLocalDataToCloud(products, movements, sales, settings).catch((e) =>
          console.warn('Initial cloud seed error:', e)
        );
      }
      setIsCloudSyncing(false);
    });

    // 3. Subscribe to Cloud Movements
    const unsubMovements = subscribeToCloudMovements((cloudMovements) => {
      if (cloudMovements && cloudMovements.length > 0) {
        setMovements(cloudMovements);
        saveStoredMovements(cloudMovements);
      }
    });

    // 4. Subscribe to Cloud Sales
    const unsubSales = subscribeToCloudSales((cloudSales) => {
      if (cloudSales && cloudSales.length > 0) {
        setSales(cloudSales);
        saveStoredSales(cloudSales);
      }
    });

    // 5. Subscribe to Cloud Settings
    const unsubSettings = subscribeToCloudSettings((cloudSettings) => {
      if (cloudSettings) {
        setSettings(cloudSettings);
        saveStoredSettings(cloudSettings);
      }
    });

    return () => {
      unsubUsers();
      unsubProducts();
      unsubMovements();
      unsubSales();
      unsubSettings();
    };
  }, [isAuthenticated]);

  // Sync to localStorage
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredMovements(movements);
  }, [movements]);

  useEffect(() => {
    saveStoredSales(sales);
  }, [sales]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Login handler
  const handleLoginSuccess = (user: ShopUser) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem('zion_auth_session', 'true');
    localStorage.setItem('zion_current_user_obj', JSON.stringify(user));
    localStorage.setItem('zion_auth_user', user.displayName);

    // If role is cashier, direct straight to Cashier Terminal!
    if (user.role === 'cashier') {
      setActivePortal('cashier');
      localStorage.setItem('zion_active_portal', 'cashier');
    } else {
      // If admin logging in from a direct cashier URL, keep cashier, otherwise admin
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'cashier') {
        setActivePortal('cashier');
        localStorage.setItem('zion_active_portal', 'cashier');
      } else {
        setActivePortal('admin');
        localStorage.setItem('zion_active_portal', 'admin');
      }
    }
  };

  // Logout / Lock terminal handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    localStorage.removeItem('zion_auth_session');
    localStorage.removeItem('zion_current_user_obj');
  };

  // User Management Handlers (Admin Only)
  const handleSaveUser = (userData: ShopUser, isEdit: boolean) => {
    saveUserToCloud(userData);
    if (isEdit) {
      setUsers((prev) => prev.map((u) => (u.id === userData.id ? userData : u)));
    } else {
      setUsers((prev) => [...prev, userData]);
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserFromCloud(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Open New Stock Modal
  const handleOpenNewStockModal = (productId?: string) => {
    setNewStockProductId(productId);
    setIsNewStockOpen(true);
  };

  // Open Physical Count Adjustment Modal
  const handleOpenAdjustmentModal = (product: Product) => {
    setAdjustingProduct(product);
    setIsAdjustmentOpen(true);
  };

  // Add New Stock Handler (Intake)
  const handleAddStock = (
    batches: {
      productId: string;
      quantityAdded: number;
      unitCost: number;
      supplier: string;
      referenceNo: string;
      notes: string;
      updateProductCost: boolean;
    }[]
  ) => {
    const newMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const batch = batches.find((b) => b.productId === prod.id);
      if (!batch) return prod;

      const previousStock = prod.stock;
      const newStock = previousStock + batch.quantityAdded;

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        type: 'restock',
        quantityChange: batch.quantityAdded,
        stockBefore: previousStock,
        stockAfter: newStock,
        date: new Date().toISOString(),
        referenceNo: batch.referenceNo,
        supplierOrParty: batch.supplier,
        unitCostAtMovement: batch.unitCost,
        notes: batch.notes || `Stock intake (+${batch.quantityAdded} units)`,
      };

      newMovements.push(movement);
      saveMovementToCloud(movement);

      const updatedProd = {
        ...prod,
        stock: newStock,
        cost: batch.updateProductCost ? batch.unitCost : prod.cost,
        updatedAt: new Date().toISOString(),
      };
      saveProductToCloud(updatedProd);

      return updatedProd;
    });

    setProducts(updatedProducts);
    setMovements((prev) => [...newMovements, ...prev]);
  };

  // Stock Adjustment Handler
  const handleStockAdjustment = (params: {
    productId: string;
    newStock: number;
    reasonType: StockMovementType;
    reasonText: string;
  }) => {
    const prod = products.find((p) => p.id === params.productId);
    if (!prod) return;

    const previousStock = prod.stock;
    const diff = params.newStock - previousStock;
    if (diff === 0) return;

    const movement: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      type: params.reasonType,
      quantityChange: diff,
      stockBefore: previousStock,
      stockAfter: params.newStock,
      date: new Date().toISOString(),
      referenceNo: `ADJ-${Date.now().toString().slice(-6)}`,
      supplierOrParty: 'Physical Inventory Audit',
      notes: params.reasonText || 'Manual count reconciliation',
    };

    saveMovementToCloud(movement);

    const updatedProd = {
      ...prod,
      stock: params.newStock,
      updatedAt: new Date().toISOString(),
    };
    saveProductToCloud(updatedProd);

    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? updatedProd : p))
    );
    setMovements((prev) => [movement, ...prev]);
  };

  // POS Complete Sale Handler
  const handleCompleteSale = (saleData: {
    items: SaleItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerPhone: string;
    customDate?: string;
  }) => {
    const existingReceiptNums = sales
      .map((s) => parseInt(s.receiptNo, 10))
      .filter((n) => !isNaN(n));
    const nextNum = (existingReceiptNums.length > 0 ? Math.max(...existingReceiptNums) : 100) + 1;
    const receiptNo = String(nextNum).padStart(6, '0');

    const saleTimestamp = saleData.customDate
      ? new Date(saleData.customDate).toISOString()
      : new Date().toISOString();

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNo,
      date: saleTimestamp,
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod,
      customerName: saleData.customerName || undefined,
      customerPhone: saleData.customerPhone || undefined,
      cashier: currentUser.displayName || 'Counter Attendant',
    };

    saveSaleToCloud(newSale);

    const newMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const soldItem = saleData.items.find((i) => i.productId === prod.id);
      if (!soldItem) return prod;

      const previousStock = prod.stock;
      const newStock = Math.max(0, previousStock - soldItem.quantity);

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        type: 'sale',
        quantityChange: -soldItem.quantity,
        stockBefore: previousStock,
        stockAfter: newStock,
        date: newSale.date,
        referenceNo: `RCP-${receiptNo}`,
        supplierOrParty: saleData.customerName || 'Walk-in Customer',
        unitCostAtMovement: prod.cost,
        notes: `POS Sale #${receiptNo} - ${soldItem.quantity} unit(s) sold by ${currentUser.displayName}`,
      };

      newMovements.push(movement);
      saveMovementToCloud(movement);

      const updatedProd = {
        ...prod,
        stock: newStock,
        updatedAt: newSale.date,
      };
      saveProductToCloud(updatedProd);

      return updatedProd;
    });

    setProducts(updatedProducts);
    setMovements((prev) =>
      [...newMovements, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
    setSales((prev) =>
      [newSale, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );

    // Open Post-Sale Stock Check Verification Modal!
    setCurrentSaleForPostCheck(newSale);
    setIsPostSaleCheckOpen(true);
  };

  // Void Sale Handler (restores stock)
  const handleVoidSale = (saleId: string) => {
    const saleToVoid = sales.find((s) => s.id === saleId);
    if (!saleToVoid) return;

    deleteSaleFromCloud(saleId);

    const restoreMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const itemToRestore = saleToVoid.items.find((i) => i.productId === prod.id);
      if (!itemToRestore) return prod;

      const previousStock = prod.stock;
      const newStock = previousStock + itemToRestore.quantity;

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        type: 'return',
        quantityChange: itemToRestore.quantity,
        stockBefore: previousStock,
        stockAfter: newStock,
        date: new Date().toISOString(),
        referenceNo: `VOID-#${saleToVoid.receiptNo}`,
        supplierOrParty: 'Voided Transaction',
        notes: `Sale #${saleToVoid.receiptNo} voided. ${itemToRestore.quantity} unit(s) restored to inventory.`,
      };

      restoreMovements.push(movement);
      saveMovementToCloud(movement);

      const updatedProd = {
        ...prod,
        stock: newStock,
        updatedAt: new Date().toISOString(),
      };
      saveProductToCloud(updatedProd);

      return updatedProd;
    });

    setProducts(updatedProducts);
    setMovements((prev) => [...restoreMovements, ...prev]);
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  // Save / Update product in catalog
  const handleSaveProduct = (
    productData: Omit<Product, 'createdAt' | 'updatedAt'>,
    isEdit: boolean
  ) => {
    const now = new Date().toISOString();
    if (isEdit) {
      const updated = { ...productData, updatedAt: now } as Product;
      saveProductToCloud(updated);
      setProducts((prev) =>
        prev.map((p) => (p.id === productData.id ? updated : p))
      );
    } else {
      const newProd: Product = {
        ...productData,
        createdAt: now,
        updatedAt: now,
      };
      saveProductToCloud(newProd);
      setProducts((prev) => [newProd, ...prev]);

      if (newProd.stock > 0) {
        const initialMovement: StockMovement = {
          id: `mov-${Date.now()}`,
          productId: newProd.id,
          productName: newProd.name,
          productSku: newProd.sku,
          type: 'initial',
          quantityChange: newProd.stock,
          stockBefore: 0,
          stockAfter: newProd.stock,
          date: now,
          referenceNo: 'INITIAL-STOCK',
          supplierOrParty: 'Initial Inventory Setup',
          notes: 'Product registered in catalog with initial stock',
        };
        saveMovementToCloud(initialMovement);
        setMovements((prev) => [initialMovement, ...prev]);
      }
    }
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProductFromCloud(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleSaveSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
    saveSettingsToCloud(newSettings);
  };

  const handleExportExcel = () => {
    exportInventoryToExcel(products, movements, sales, settings);
  };

  const handleDownloadBackup = () => {
    downloadJsonBackup(products, movements, sales, settings);
  };

  const handleRestoreBackup = (jsonContent: string) => {
    const parsed = JSON.parse(jsonContent);
    if (parsed.products && Array.isArray(parsed.products)) {
      setProducts(parsed.products);
      saveStoredProducts(parsed.products);
    }
    if (parsed.stockMovements && Array.isArray(parsed.stockMovements)) {
      setMovements(parsed.stockMovements);
      saveStoredMovements(parsed.stockMovements);
    }
    if (parsed.sales && Array.isArray(parsed.sales)) {
      setSales(parsed.sales);
      saveStoredSales(parsed.sales);
    }
    if (parsed.shop) {
      setSettings(parsed.shop);
      saveStoredSettings(parsed.shop);
    }
    uploadLocalDataToCloud(
      parsed.products || products,
      parsed.stockMovements || movements,
      parsed.sales || sales,
      parsed.shop || settings
    ).catch((e) => console.warn(e));
  };

  const handleResetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setMovements(INITIAL_STOCK_MOVEMENTS);
    setSales(INITIAL_SALES);
    setSettings(DEFAULT_SETTINGS);
    uploadLocalDataToCloud(
      INITIAL_PRODUCTS,
      INITIAL_STOCK_MOVEMENTS,
      INITIAL_SALES,
      DEFAULT_SETTINGS
    ).catch((e) => console.warn(e));
  };

  const handleStartFreshStore = async () => {
    setProducts([]);
    setMovements([]);
    setSales([]);
    try {
      await clearAllCloudData();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLoadDemoData = () => {
    handleResetDemoData();
  };

  // Gatekeeper: If user is not authenticated, render login page
  if (!isAuthenticated) {
    return (
      <LoginPage
        users={users}
        onLoginSuccess={handleLoginSuccess}
        shopPasscode={shopPasscode}
        isCashierPortal={activePortal === 'cashier'}
      />
    );
  }

  // 1. CASHIER TERMINAL VIEW (Dedicated Counter Staff Dashboard)
  if (activePortal === 'cashier') {
    return (
      <>
        <CashierDashboardView
          products={products}
          sales={sales}
          settings={settings}
          currentUser={currentUser}
          onCompleteSale={handleCompleteSale}
          onViewReceipt={(s) => {
            setCurrentSaleForPostCheck(s);
            setIsPostSaleCheckOpen(true);
          }}
          onLogout={handleLogout}
          onSwitchToAdmin={
            currentUser.role === 'admin'
              ? () => {
                  setActivePortal('admin');
                  localStorage.setItem('zion_active_portal', 'admin');
                }
              : undefined
          }
        />

        {/* Post-Sale Stock Check Verification & 58mm Thermal Receipt */}
        <PostSaleStockCheckModal
          isOpen={isPostSaleCheckOpen}
          onClose={() => {
            setIsPostSaleCheckOpen(false);
            setCurrentSaleForPostCheck(null);
          }}
          sale={currentSaleForPostCheck}
          products={products}
          settings={settings}
          onStartNewSale={() => {
            setIsPostSaleCheckOpen(false);
            setCurrentSaleForPostCheck(null);
          }}
          onViewStockLog={() => {
            setIsPostSaleCheckOpen(false);
            setCurrentSaleForPostCheck(null);
          }}
          onQuickRestock={(prodId) => {
            setIsPostSaleCheckOpen(false);
            setCurrentSaleForPostCheck(null);
            handleOpenNewStockModal(prodId);
          }}
        />
      </>
    );
  }

  // 2. ADMIN PORTAL VIEW (Full Store Management & Staff Passwords)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 text-neutral-900 select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        products={products}
        settings={settings}
        currentUser={currentUser.displayName}
        onLogout={handleLogout}
        onSwitchToCashierTerminal={() => {
          setActivePortal('cashier');
          localStorage.setItem('zion_active_portal', 'cashier');
        }}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenRestockModal={() => handleOpenNewStockModal()}
          products={products}
          onExportExcel={handleExportExcel}
          currentUser={currentUser.displayName}
          onLogout={handleLogout}
          isCloudSyncing={isCloudSyncing}
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardView
              products={products}
              sales={sales}
              movements={movements}
              settings={settings}
              onNavigate={setCurrentPage}
              onOpenNewStockModal={handleOpenNewStockModal}
              onViewSaleReceipt={(s) => {
                setCurrentSaleForPostCheck(s);
                setIsPostSaleCheckOpen(true);
              }}
              onExportExcel={handleExportExcel}
              onStartFreshStore={handleStartFreshStore}
              onLoadDemoData={handleLoadDemoData}
            />
          )}

          {currentPage === 'stock' && (
            <StockManagementView
              products={products}
              movements={movements}
              settings={settings}
              onOpenNewStockModal={handleOpenNewStockModal}
              onOpenAdjustmentModal={handleOpenAdjustmentModal}
              onExportExcel={handleExportExcel}
            />
          )}

          {currentPage === 'pos' && (
            <POSView
              products={products}
              settings={settings}
              onCompleteSale={handleCompleteSale}
            />
          )}

          {currentPage === 'products' && (
            <ProductsView
              products={products}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onOpenNewStockModal={handleOpenNewStockModal}
            />
          )}

          {currentPage === 'sales' && (
            <SalesHistoryView
              sales={sales}
              products={products}
              settings={settings}
              onViewReceipt={(s) => {
                setCurrentSaleForPostCheck(s);
                setIsPostSaleCheckOpen(true);
              }}
              onVoidSale={handleVoidSale}
              onExportExcel={handleExportExcel}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsView
              sales={sales}
              products={products}
              settings={settings}
              onExportExcel={handleExportExcel}
            />
          )}

          {currentPage === 'users' && (
            <StaffManagementView
              users={users}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
              currentUser={currentUser.displayName}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              settings={settings}
              products={products}
              movements={movements}
              sales={sales}
              onSaveSettings={handleSaveSettings}
              onExportExcel={handleExportExcel}
              onDownloadBackup={handleDownloadBackup}
              onRestoreBackup={handleRestoreBackup}
              onResetDemoData={handleResetDemoData}
              onStartFreshStore={handleStartFreshStore}
              onLoadDemoData={handleLoadDemoData}
            />
          )}
        </main>
      </div>

      {/* Modal 1: Add New Stock (Intake) */}
      <NewStockModal
        isOpen={isNewStockOpen}
        onClose={() => {
          setIsNewStockOpen(false);
          setNewStockProductId(undefined);
        }}
        products={products}
        initialProductId={newStockProductId}
        onAddStock={handleAddStock}
      />

      {/* Modal 2: Stock Adjustment & Physical Count Reconciliation */}
      <StockAdjustmentModal
        isOpen={isAdjustmentOpen}
        onClose={() => {
          setIsAdjustmentOpen(false);
          setAdjustingProduct(null);
        }}
        product={adjustingProduct}
        onConfirmAdjustment={handleStockAdjustment}
      />

      {/* Modal 3: Post-Sale Stock Check Verification & 58mm Thermal Receipt */}
      <PostSaleStockCheckModal
        isOpen={isPostSaleCheckOpen}
        onClose={() => {
          setIsPostSaleCheckOpen(false);
          setCurrentSaleForPostCheck(null);
        }}
        sale={currentSaleForPostCheck}
        products={products}
        settings={settings}
        onStartNewSale={() => {
          setIsPostSaleCheckOpen(false);
          setCurrentSaleForPostCheck(null);
          setCurrentPage('pos');
        }}
        onViewStockLog={() => {
          setIsPostSaleCheckOpen(false);
          setCurrentSaleForPostCheck(null);
          setCurrentPage('stock');
        }}
        onQuickRestock={(prodId) => {
          setIsPostSaleCheckOpen(false);
          setCurrentSaleForPostCheck(null);
          handleOpenNewStockModal(prodId);
        }}
      />
    </div>
  );
}
