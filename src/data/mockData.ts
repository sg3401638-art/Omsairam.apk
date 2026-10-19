import { Product, CustomerSale, StockPurchase, ScrapInventoryItem, MerchantKhataRecord, ActivityLog } from '../types';

// App reset: Clean slate with zero products, zero dues, zero past sales
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_SALES: CustomerSale[] = [];

export const INITIAL_PURCHASES: StockPurchase[] = [];

export const INITIAL_SCRAP_INVENTORY: ScrapInventoryItem[] = [];

export const INITIAL_KHATA_RECORDS: MerchantKhataRecord[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-init-reset',
    timestamp: new Date().toISOString(),
    action: 'product_deleted',
    title: 'Store Reset to Clean Slate',
    details: 'All demo products, customer dues (Udhar), sales, and purchases have been completely wiped. Ready for fresh live store data.',
    performedBy: 'Store Owner',
    amount: 0,
  },
];
