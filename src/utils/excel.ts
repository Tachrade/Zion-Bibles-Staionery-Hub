import * as XLSX from 'xlsx';
import { Product, StockMovement, Sale, ShopSettings } from '../types';
import { formatCurrency, formatDateTime, formatStockUnits } from './formatters';

export function exportInventoryToExcel(
  products: Product[],
  movements: StockMovement[],
  sales: Sale[],
  settings: ShopSettings
) {
  const wb = XLSX.utils.book_new();

  // 1. Products Sheet
  const productsData = products.map((p) => ({
    'Product ID': p.id,
    'Product Name': p.name,
    'Category': p.category,
    'SKU': p.sku,
    'Barcode': p.barcode || '',
    'Selling Price (₦)': p.price,
    'Cost Price (₦)': p.cost,
    'Has Packs': p.hasPacks ? 'Yes' : 'No',
    'Pieces Per Pack': p.piecesPerPack || '—',
    'Pack Price (₦)': p.packPrice || '—',
    'Current Stock (Pieces)': p.stock,
    'Stock Breakdown (Pks & Pcs)': p.hasPacks
      ? formatStockUnits(p.stock, p.piecesPerPack, { showTotalPieces: true })
      : `${p.stock} pcs`,
    'Min Reorder Level': p.minStock,
    'Stock Status': p.stock <= 0 ? 'Out of Stock' : p.stock <= p.minStock ? 'Low Stock' : 'Adequate',
    'Total Cost Value (₦)': p.stock * p.cost,
    'Total Retail Value (₦)': p.stock * p.price,
    'Shelf Location': p.shelfLocation || '',
    'Updated At': formatDateTime(p.updatedAt),
  }));
  const wsProducts = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Products');

  // 2. Stock Movements Log Sheet
  const movementsData = movements.map((m) => ({
    'Log ID': m.id,
    'Date & Time': formatDateTime(m.date),
    'Product Name': m.productName,
    'SKU': m.productSku,
    'Movement Type': m.type.toUpperCase(),
    'Quantity Change (Pieces)': m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange,
    'Stock Before': m.stockBefore,
    'Stock After': m.stockAfter,
    'Reference / Receipt #': m.referenceNo || '—',
    'Supplier / Customer': m.supplierOrParty || '—',
    'Unit Cost (₦)': m.unitCostAtMovement || '—',
    'Audit Notes': m.notes || '',
  }));
  const wsMovements = XLSX.utils.json_to_sheet(movementsData);
  XLSX.utils.book_append_sheet(wb, wsMovements, 'Stock Audit Trail');

  // 3. Sales Sheet
  const salesData = sales.map((s) => ({
    'Receipt No': `#${s.receiptNo}`,
    'Date & Time': formatDateTime(s.date),
    'Customer Name': s.customerName || 'Walk-in Customer',
    'Customer Phone': s.customerPhone || '—',
    'Payment Method': s.paymentMethod,
    'Items Count': s.items.length,
    'Subtotal (₦)': s.subtotal,
    'Discount (₦)': s.discount,
    'Total Paid (₦)': s.total,
    'Items Summary': s.items.map((i) => `${i.name} (x${i.quantity})`).join(', '),
  }));
  const wsSales = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(wb, wsSales, 'Sales History');

  // 4. Detailed Sales Items Sheet
  const saleItemsData = sales.flatMap((s) =>
    s.items.map((i) => {
      const lineCost = (i.cost || 0) * i.quantity;
      const lineTotal = i.price * i.quantity;
      return {
        'Receipt No': `#${s.receiptNo}`,
        'Sale Date': formatDateTime(s.date),
        'Item Name': i.name,
        'SKU': i.sku,
        'Category': i.category,
        'Quantity Sold': i.quantity,
        'Unit Type': i.unitType || 'piece',
        'Pieces Deducted': i.totalPiecesDeducted || i.quantity,
        'Unit Price (₦)': i.price,
        'Unit Cost (₦)': i.cost,
        'Line Total (₦)': lineTotal,
        'Line Cost (₦)': lineCost,
        'Estimated Profit (₦)': lineTotal - lineCost,
        'Payment Method': s.paymentMethod,
        'Customer': s.customerName || 'Walk-in',
      };
    })
  );
  const wsSaleItems = XLSX.utils.json_to_sheet(saleItemsData);
  XLSX.utils.book_append_sheet(wb, wsSaleItems, 'Sale Line Items');

  // 5. Summary Dashboard Sheet
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCostVal = products.reduce((acc, p) => acc + p.stock * p.cost, 0);
  const totalRetailVal = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalSalesCount = sales.length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const summaryData = [
    { 'Metric': 'Business Name', 'Value': settings.shopName },
    { 'Metric': 'Report Generated At', 'Value': new Date().toLocaleString('en-NG') },
    { 'Metric': 'Total Active Products', 'Value': products.length },
    { 'Metric': 'Total Stock Units On Hand', 'Value': totalStockUnits },
    { 'Metric': 'Total Inventory Cost Value (₦)', 'Value': totalCostVal },
    { 'Metric': 'Total Potential Retail Value (₦)', 'Value': totalRetailVal },
    { 'Metric': 'Potential Gross Margin (₦)', 'Value': totalRetailVal - totalCostVal },
    { 'Metric': 'Total Completed Sales Recorded', 'Value': totalSalesCount },
    { 'Metric': 'Total Sales Revenue (₦)', 'Value': totalRevenue },
    { 'Metric': 'Items Needing Restock', 'Value': lowStockCount },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const fileName = `Zion_Inventory_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function downloadJsonBackup(
  products: Product[],
  movements: StockMovement[],
  sales: Sale[],
  settings: ShopSettings
) {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    shop: settings,
    products,
    stockMovements: movements,
    sales,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Zion_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
