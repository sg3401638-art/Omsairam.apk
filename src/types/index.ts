export type ProductCategory = 
  | 'inverter_battery'   // Ah rating (Tall Tubular, Inverter)
  | 'inverter_ups'       // VA rating (Pure sine wave, square wave)
  | 'two_wheeler'        // Ah rating (Bike, Scooter, 2.5Ah - 9Ah)
  | 'four_wheeler'       // Ah rating (Car, Jeep, Tractor, Commercial 35Ah - 180Ah)
  | 'bulb_lighting'      // Watts rating (LED bulbs, battens, panels)
  | 'electrical_thing';  // Wires, switches, fans, MCBs, sockets

export type CapacityUnit = 'Ah' | 'VA' | 'W' | 'Pcs' | 'Mtr';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  capacityValue: number;
  capacityUnit: CapacityUnit;
  modelNumber?: string;
  mrp: number;
  sellPrice: number;
  purchasePrice: number;
  scrapValue: number; // Value deducted if old battery exchanged
  warrantyMonths: number;
  warrantyDetails?: string;
  stock: number;
  minStockAlert: number;
  shelfLocation?: string;
  description?: string;
  popular?: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  capacityValue: number;
  capacityUnit: CapacityUnit;
  unitPrice: number;
  quantity: number;
  serialNumber?: string;
  hasScrapExchange: boolean;
  scrapAh?: number;
  scrapDeductionPerUnit: number;
  total: number;
}

export interface CustomerSale {
  id: string;
  invoiceNo: string;
  date: string; // ISO string
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  vehicleOrApplianceModel?: string; // e.g., "Activa 6G" or "Home 2BHK 150Ah"
  items: SaleItem[];
  subtotal: number;
  totalScrapDiscount: number;
  extraDiscount: number;
  taxIncluded: boolean;
  taxAmount: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'UPI / PhonePe' | 'Card' | 'Credit (Udhar)';
  paymentStatus: 'Paid' | 'Partial' | 'Pending Due';
  paidAmount: number;
  dueAmount: number;
  notes?: string;
  employeeName: string;
}

export interface StockPurchase {
  id: string;
  purchaseBillNo: string;
  date: string;
  supplierName: string;
  supplierPhone?: string;
  type: 'distributor_stock' | 'customer_scrap_buyback';
  items: {
    productId?: string;
    productName: string;
    category?: ProductCategory;
    quantity: number;
    unitCost: number;
    totalCost: number;
    unit?: string;
  }[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Due';
  paidAmount: number;
  notes?: string;
  receivedBy: string;
}

export interface ScrapInventoryItem {
  id: string;
  type: 'Tubular Ah' | '2W Bike Ah' | 'Car / 4W Ah' | 'Mixed Lead';
  ahRating: number;
  quantity: number;
  averageBuyRate: number;
  lastUpdated: string;
}

export interface UdharTransaction {
  id: string;
  date: string;
  type: 'credit_given' | 'payment_received';
  amount: number;
  paymentMode?: 'Cash' | 'UPI / PhonePe' | 'Bank Transfer';
  description: string;
  invoiceNo?: string;
  recordedBy: string;
}

export interface MerchantKhataRecord {
  id: string;
  customerName: string;
  phone: string;
  type: 'Mechanic' | 'Retail Customer' | 'Contractor' | 'Dealer';
  address?: string;
  totalCreditGiven: number;
  totalPaymentReceived: number;
  balanceDue: number;
  lastUpdated: string;
  transactions: UdharTransaction[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: 'sale_created' | 'payment_received' | 'udhar_given' | 'product_added' | 'product_updated' | 'product_deleted' | 'stock_purchased' | 'stock_adjusted' | 'price_updated';
  title: string;
  details: string;
  performedBy: string;
  amount?: number;
}
