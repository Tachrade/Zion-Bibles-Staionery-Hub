import React, { useState } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Building,
  Printer,
  ShieldAlert,
  Share2,
  Cloud,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ShopSettings, Product, StockMovement, Sale } from '../../types';

interface SettingsViewProps {
  settings: ShopSettings;
  products: Product[];
  movements: StockMovement[];
  sales: Sale[];
  onSaveSettings: (settings: ShopSettings) => void;
  onExportExcel: () => void;
  onDownloadBackup: () => void;
  onRestoreBackup: (jsonContent: string) => void;
  onResetDemoData: () => void;
  onStartFreshStore: () => void;
  onLoadDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  products,
  movements,
  sales,
  onSaveSettings,
  onExportExcel,
  onDownloadBackup,
  onRestoreBackup,
  onResetDemoData,
  onStartFreshStore,
  onLoadDemoData,
}) => {
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isDemoActive = products.some((p) => p.id === 'prod-1' && p.sku === 'BIB-KJV-01');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        onRestoreBackup(text);
        alert('Database restored successfully from backup JSON file.');
      } catch (err: any) {
        alert('Failed to parse backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Store Settings & Data Management</h2>
        <p className="text-xs text-neutral-500">
          Configure shop branding, receipt templates, fresh store initialization, and multi-user sharing
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold">
          ✓ Store settings updated successfully.
        </div>
      )}

      {/* Sharing & Multi-User Architecture Card */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Live Multi-User Cloud Sync (Firebase Firestore)</h3>
              <p className="text-xs text-emerald-300/80">
                Connected to cloud database · All devices share real-time stock
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 text-emerald-200 border border-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cloud Active</span>
          </span>
        </div>

        <p className="text-xs text-emerald-100/90 leading-relaxed">
          Your shop is connected to Firebase Firestore. Whenever a cashier records a sale or you receive new stock, it syncs <strong>instantly in real time</strong> across all phones, tablets, and computers logged into Zion Hub.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              try {
                const { uploadLocalDataToCloud } = await import('../../services/cloudSync');
                await uploadLocalDataToCloud(products, movements, sales, settings);
                alert('✓ All current products, stock levels, and sales successfully synced to Cloud Firestore!');
              } catch (e: any) {
                alert('Sync error: ' + e.message);
              }
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-200" />
            <span>Force Push All Data to Cloud</span>
          </button>
        </div>
      </div>

      {/* Security & Access Password Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
          <ShieldAlert className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-sm text-neutral-900">
            Shop Master Access Passcode
          </h3>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Anyone without this password cannot enter the system. Staff enter this passcode on the login screen to access the POS terminal and stock controls.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <input
            type="text"
            id="shopPasscodeInput"
            defaultValue={localStorage.getItem('zion_shop_passcode') || 'zion2026'}
            placeholder="e.g. zion2026"
            className="px-3.5 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-600 max-w-[220px]"
          />
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('shopPasscodeInput') as HTMLInputElement;
              if (el && el.value.trim()) {
                localStorage.setItem('zion_shop_passcode', el.value.trim());
                alert(`Shop access passcode updated to: "${el.value.trim()}". Staff will need this to unlock the app.`);
              }
            }}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-black text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          >
            Update Shop Passcode
          </button>
        </div>
      </div>

      {/* Fresh Store Initialization Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-neutral-900">
              Store Launch State: Start Fresh vs Demo Data
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
            {products.length} products · {sales.length} sales
          </span>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          {products.length === 0 ? (
            <span className="text-emerald-700 font-semibold">
              ✓ Clean slate active: Your store has 0 products and 0 sales. You are ready to enter your actual shop inventory.
            </span>
          ) : isDemoActive ? (
            <span>
              The application is currently showing sample demo products (Holy Bible KJV, Notebooks, Oxford Maths Sets, etc.) and mock sales.
            </span>
          ) : (
            <span>
              Your custom catalog contains {products.length} products.
            </span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Start completely fresh with zero details?\n\nThis will clear all products, stock audit logs, and sales so you can start clean for your real shop.'
                )
              ) {
                onStartFreshStore();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>⚡ Clear All & Start Fresh (0 Items)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Load sample demo products, stock movements, and test receipts?'
                )
              ) {
                onLoadDemoData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs transition-colors shadow-2xs inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-neutral-500" />
            <span>↺ Load Sample Demo Catalog</span>
          </button>
        </div>
      </div>

      {/* Store Information Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
          <Building className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-sm text-neutral-900">Business Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Store Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Contact Phone / WhatsApp
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Receipt Footer Message (Printed at the bottom of thermal receipts)
          </label>
          <input
            type="text"
            value={formData.receiptFooter}
            onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Default Minimum Stock Threshold
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.defaultMinStock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultMinStock: parseInt(e.target.value, 10) || 5,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Thermal Receipt Paper Size
            </label>
            <select
              value={formData.receiptPaperWidth || '58mm'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  receiptPaperWidth: e.target.value as '58mm' | '80mm',
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white focus:ring-2 focus:ring-emerald-600 font-medium"
            >
              <option value="58mm">58mm Thermal Roll (Standard Compact POS)</option>
              <option value="80mm">80mm Thermal Roll (Standard Wide POS)</option>
            </select>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Defaulted to 58mm printer roll.
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-200 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>

      {/* Excel Workbook Export & Backup Section */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
          <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-sm text-neutral-900">
            Offline Excel Database & Data Export
          </h3>
        </div>

        <p className="text-xs text-neutral-600">
          The app stores all products, complete stock movement audit trails, and sales history. You can generate a comprehensive 5-sheet <strong>.xlsx Excel workbook</strong> at any time to open in Microsoft Excel, Google Sheets, or WPS Office.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Export Complete Excel Workbook (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadBackup}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-neutral-300" />
            <span>Download JSON Backup</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold text-xs transition-colors shadow-2xs inline-flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-neutral-500" />
            <span>Restore From JSON Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone / Demo Data Reset */}
      <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>Reset Sample / Demo Data</span>
        </div>

        <p className="text-xs text-neutral-600">
          Reset all inventory levels, stock logs, and sales records back to default demo data.
        </p>

        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                'Are you sure you want to restore the initial demo catalog and sales records?'
              )
            ) {
              onResetDemoData();
            }
          }}
          className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold text-xs transition-colors cursor-pointer"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
