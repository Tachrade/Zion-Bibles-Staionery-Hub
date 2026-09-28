import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Package,
  Receipt,
  BarChart3,
  Settings,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  LogOut,
  UserCheck,
  X
} from 'lucide-react';
import { Product, ShopSettings } from '../types';

export type NavigationPage = 
  | 'dashboard' 
  | 'stock' 
  | 'pos' 
  | 'products' 
  | 'sales' 
  | 'reports' 
  | 'users'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  products: Product[];
  settings: ShopSettings;
  currentUser?: string;
  onLogout?: () => void;
  onSwitchToCashierTerminal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  products,
  settings,
  currentUser,
  onLogout,
  onSwitchToCashierTerminal,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);

  const navItems = [
    {
      id: 'dashboard' as NavigationPage,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'stock' as NavigationPage,
      label: 'Stock Management',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeColor: lowStockCount > 0 ? 'bg-amber-100 text-amber-800' : '',
      highlight: true,
    },
    {
      id: 'pos' as NavigationPage,
      label: 'New Sale (POS)',
      icon: ShoppingCart,
    },
    {
      id: 'products' as NavigationPage,
      label: 'Products Catalog',
      icon: Package,
      count: products.length,
    },
    {
      id: 'sales' as NavigationPage,
      label: 'Sales History',
      icon: Receipt,
    },
    {
      id: 'reports' as NavigationPage,
      label: 'Reports & Profit',
      icon: BarChart3,
    },
    {
      id: 'users' as NavigationPage,
      label: 'Staff & Passwords',
      icon: UserCheck,
    },
    {
      id: 'settings' as NavigationPage,
      label: 'Store Settings',
      icon: Settings,
    },
  ];

  const sidebarContent = (
    <aside className="w-64 bg-emerald-950 text-emerald-50 flex flex-col h-full border-r border-emerald-900/60 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-emerald-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center shadow-md font-bold text-lg text-white shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-white tracking-tight truncate leading-tight">
              {settings.shopName}
            </h1>
            <p className="text-xs text-emerald-300/80 truncate mt-0.5">
              POS & Stock Control
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-800/90 text-white shadow-sm ring-1 ring-emerald-700/50'
                  : 'text-emerald-200/85 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-amber-300' : 'text-emerald-400/80'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && !item.badge && (
                  <span className="text-xs font-mono text-emerald-400/70">
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Quick Stock Indicator Bottom Card */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-emerald-900/40 border border-emerald-800/40 text-xs">
        <div className="flex items-center justify-between text-emerald-300 mb-1">
          <span className="font-medium">Total On-Hand</span>
          <span className="font-mono font-semibold text-white">
            {totalStockUnits} units
          </span>
        </div>
        <div className="flex items-center justify-between text-emerald-300/80 text-[11px]">
          <span>Reorder attention:</span>
          {lowStockCount > 0 ? (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} items low
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">All healthy</span>
          )}
        </div>
      </div>

      {/* Switch to Cashier Terminal button */}
      {onSwitchToCashierTerminal && (
        <div className="px-3 mb-2">
          <button
            onClick={() => {
              onSwitchToCashierTerminal();
              onCloseMobile?.();
            }}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-emerald-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Open Cashier Terminal</span>
          </button>
        </div>
      )}

      {/* Staff Session Bar at Bottom */}
      {currentUser && (
        <div className="p-3 mx-3 mb-4 rounded-xl bg-emerald-900/70 border border-emerald-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate text-emerald-100 font-medium" title={currentUser}>
              {currentUser}
            </span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-emerald-400 hover:text-rose-300 p-1 transition-colors cursor-pointer"
              title="Lock terminal / Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex h-screen shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

