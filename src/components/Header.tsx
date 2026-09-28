import React from 'react';
import {
  PlusCircle,
  ShoppingCart,
  Download,
  Bell,
  Boxes,
  Cloud,
  LogOut,
  UserCheck,
  Menu
} from 'lucide-react';
import { NavigationPage } from './Sidebar';
import { Product } from '../types';

interface HeaderProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenRestockModal: () => void;
  products: Product[];
  onExportExcel: () => void;
  currentUser: string;
  onLogout: () => void;
  isCloudSyncing: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenRestockModal,
  products,
  onExportExcel,
  currentUser,
  onLogout,
  isCloudSyncing,
  onToggleMobileMenu,
}) => {
  const [isOnline, setIsOnline] = React.useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const lowStockItems = products.filter((p) => p.stock <= p.minStock);

  const getPageTitle = (page: NavigationPage) => {
    switch (page) {
      case 'dashboard':
        return 'Shop Overview & Operations';
      case 'stock':
        return 'Stock Management & Audit Control';
      case 'pos':
        return 'Point of Sale (POS Terminal)';
      case 'products':
        return 'Product Inventory Catalog';
      case 'sales':
        return 'Sales History & Receipts';
      case 'reports':
        return 'Financial Reports & Stock Valuation';
      case 'users':
        return 'Staff Accounts & Passwords';
      case 'settings':
        return 'Store Settings & Excel Sync';
      default:
        return 'Zion Hub Dashboard';
    }
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-neutral-200/80 flex items-center justify-between shrink-0">
      {/* Zone 1: Breadcrumb, Hamburger Menu & Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <span>Zion Hub</span>
            <span>/</span>
            <span className="capitalize">{currentPage}</span>
          </div>
          <h2 className="text-base font-bold text-neutral-900 leading-tight">
            {getPageTitle(currentPage)}
          </h2>
        </div>
      </div>

      {/* Zone 2: Cloud Sync status & low stock alert */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        {/* Live Multi-User Cloud Sync or Offline Badge */}
        {isOnline ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
            title="Firebase Firestore live real-time sync active across all staff devices"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-[11px]">Live Cloud Sync</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300"
            title="Internet disconnected. App is working 100% offline. Sales are saved on this device and will automatically sync when internet returns."
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <Cloud className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-semibold text-[11px]">Offline Mode (Saved Locally)</span>
          </div>
        )}

        {lowStockItems.length > 0 && (
          <button
            onClick={() => onNavigate('stock')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
            title="View low stock products"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="font-medium">
              {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'items'} need restock
            </span>
          </button>
        )}
      </div>

      {/* Zone 3: Actions & User Session */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onExportExcel}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
          title="Export complete inventory and audit log to Excel workbook (.xlsx)"
        >
          <Download className="w-3.5 h-3.5 text-neutral-500" />
          <span>Export Excel</span>
        </button>

        <button
          onClick={onOpenRestockModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300/80 rounded-lg hover:bg-emerald-100/80 transition-colors shadow-2xs cursor-pointer"
        >
          <Boxes className="w-3.5 h-3.5 text-emerald-700" />
          <span>+ Add New Stock</span>
        </button>

        {currentPage !== 'pos' && (
          <button
            onClick={() => onNavigate('pos')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New Sale (POS)</span>
          </button>
        )}

        {/* Staff User & Lock Button */}
        <div className="pl-1 border-l border-neutral-200 flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 font-medium bg-neutral-100 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="max-w-[100px] truncate">{currentUser}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 text-neutral-500 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Lock terminal / Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

