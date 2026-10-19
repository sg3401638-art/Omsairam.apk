import React, { useState, useEffect } from 'react';
import { 
  Product, 
  CustomerSale, 
  StockPurchase, 
  ScrapInventoryItem, 
  SaleItem, 
  MerchantKhataRecord, 
  ActivityLog,
  UdharTransaction 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SALES, 
  INITIAL_PURCHASES, 
  INITIAL_SCRAP_INVENTORY,
  INITIAL_KHATA_RECORDS,
  INITIAL_ACTIVITY_LOGS 
} from './data/mockData';
import { OmSaiRamLogo } from './components/OmSaiRamLogo';
import { ProductCatalog } from './components/ProductCatalog';
import { SalesBilling } from './components/SalesBilling';
import { PurchaseEntry } from './components/PurchaseEntry';
import { CounterCalculator } from './components/CounterCalculator';
import { CustomerLedger } from './components/CustomerLedger';
import { UdharKhata } from './components/UdharKhata';
import { OwnerDashboard } from './components/OwnerDashboard';
import { PasswordModal } from './components/PasswordModal';
import { AddProductModal } from './components/AddProductModal';
import { InvoiceModal } from './components/InvoiceModal';
import { InstallModal, PWAInstallButton, OfflineBanner } from './components/InstallModal';
import { LiveSyncStatus } from './components/LiveSyncStatus';
import { realtimeSync, StoreState } from './services/realtimeSync';
import { SplashScreen } from './components/SplashScreen';
import { TransmissionTowersBg } from './components/TransmissionTowersBg';
import { 
  BatteryCharging, 
  Zap, 
  ShoppingCart, 
  PackagePlus, 
  Calculator, 
  FileText, 
  BookOpen,
  Lock,
  Unlock,
  ShieldCheck,
  User,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Menu,
  ChevronRight,
  ArrowLeft,
  Home,
  Search,
  Bike,
  Car,
  Lightbulb,
  Wrench,
  Smartphone,
  ChevronDown,
  Layers,
  Sparkles,
  Power,
  Package,
  Share2,
  Calendar,
  Download
} from 'lucide-react';

export default function App() {
  // Navigation: 'home' is the clean sorted dashboard like in the user's reference image
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'billing' | 'khata' | 'purchase' | 'calculator' | 'ledger' | 'owner'>('home');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('all');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [homeSearchQuery, setHomeSearchQuery] = useState<string>('');
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Employee profile & Owner authentication state (Password: 9766208407)
  const [activeEmployee, setActiveEmployee] = useState<string>('Sunil (Store Staff)');
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('osr_owner_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [targetTabAfterAuth, setTargetTabAfterAuth] = useState<'owner' | null>(null);

  // Data states with LocalStorage persistence (Clean slate: 0 products, 0 dues)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      if (localStorage.getItem('osr_clean_slate_v5') !== 'true') {
        // Clear all previous mock data keys
        localStorage.removeItem('osr_products_v3_ljm');
        localStorage.removeItem('osr_sales_v3_ljm');
        localStorage.removeItem('osr_purchases_v3_ljm');
        localStorage.removeItem('osr_scrap_v3_ljm');
        localStorage.removeItem('osr_khata_v3_ljm');
        localStorage.removeItem('osr_activity_logs_v3');
        localStorage.removeItem('osr_products_v2');
        localStorage.removeItem('osr_products');
        localStorage.setItem('osr_clean_slate_v5', 'true');
        return [];
      }
      const saved = localStorage.getItem('osr_clean_products_v5');
      if (saved) {
        return JSON.parse(saved) as Product[];
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [sales, setSales] = useState<CustomerSale[]>(() => {
    try {
      if (localStorage.getItem('osr_clean_slate_v5') !== 'true') return [];
      const saved = localStorage.getItem('osr_clean_sales_v5');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  const [purchases, setPurchases] = useState<StockPurchase[]>(() => {
    try {
      if (localStorage.getItem('osr_clean_slate_v5') !== 'true') return [];
      const saved = localStorage.getItem('osr_clean_purchases_v5');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  const [scrapInventory, setScrapInventory] = useState<ScrapInventoryItem[]>(() => {
    try {
      if (localStorage.getItem('osr_clean_slate_v5') !== 'true') return [];
      const saved = localStorage.getItem('osr_clean_scrap_v5');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Daily Customer Credit (Udhar) & Payments Khata (Clean - Zero Dues)
  const [khataRecords, setKhataRecords] = useState<MerchantKhataRecord[]>(() => {
    try {
      if (localStorage.getItem('osr_clean_slate_v5') !== 'true') return [];
      const saved = localStorage.getItem('osr_clean_khata_v5');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Owner Audit / Staff Activity Tracker
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      if (localStorage.getItem('osr_clean_slate_v5') !== 'true') return INITIAL_ACTIVITY_LOGS;
      const saved = localStorage.getItem('osr_clean_logs_v5');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [activeInvoice, setActiveInvoice] = useState<CustomerSale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Persist clean data
  useEffect(() => {
    localStorage.setItem('osr_clean_products_v5', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('osr_clean_sales_v5', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('osr_clean_purchases_v5', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('osr_clean_scrap_v5', JSON.stringify(scrapInventory));
  }, [scrapInventory]);

  useEffect(() => {
    localStorage.setItem('osr_clean_khata_v5', JSON.stringify(khataRecords));
  }, [khataRecords]);

  useEffect(() => {
    localStorage.setItem('osr_clean_logs_v5', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Real-time synchronization state ref for deterministic broadcasting
  const stateRef = React.useRef<StoreState>({
    products,
    sales,
    purchases,
    scrapInventory,
    khataRecords,
    activityLogs,
  });

  useEffect(() => {
    stateRef.current = {
      products,
      sales,
      purchases,
      scrapInventory,
      khataRecords,
      activityLogs,
    };
  }, [products, sales, purchases, scrapInventory, khataRecords, activityLogs]);

  // Initial load from server + subscribe to live changes from other devices (Staff/Owner)
  useEffect(() => {
    let isMounted = true;

    // Fetch initial shared state from server
    realtimeSync.fetchServerState().then((serverData) => {
      if (!isMounted || !serverData) return;
      if (Array.isArray(serverData.products)) setProducts(serverData.products);
      if (Array.isArray(serverData.sales)) setSales(serverData.sales);
      if (Array.isArray(serverData.purchases)) setPurchases(serverData.purchases);
      if (Array.isArray(serverData.scrapInventory)) setScrapInventory(serverData.scrapInventory);
      if (Array.isArray(serverData.khataRecords)) setKhataRecords(serverData.khataRecords);
      if (Array.isArray(serverData.activityLogs)) setActivityLogs(serverData.activityLogs);
    });

    // Subscribe to live broadcast from Staff / Owner
    const unsubscribe = realtimeSync.subscribe((remoteData) => {
      if (!isMounted || !remoteData) return;
      if (Array.isArray(remoteData.products)) setProducts(remoteData.products);
      if (Array.isArray(remoteData.sales)) setSales(remoteData.sales);
      if (Array.isArray(remoteData.purchases)) setPurchases(remoteData.purchases);
      if (Array.isArray(remoteData.scrapInventory)) setScrapInventory(remoteData.scrapInventory);
      if (Array.isArray(remoteData.khataRecords)) setKhataRecords(remoteData.khataRecords);
      if (Array.isArray(remoteData.activityLogs)) setActivityLogs(remoteData.activityLogs);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleForceSync = async () => {
    const serverData = await realtimeSync.fetchServerState();
    if (serverData) {
      if (Array.isArray(serverData.products)) setProducts(serverData.products);
      if (Array.isArray(serverData.sales)) setSales(serverData.sales);
      if (Array.isArray(serverData.purchases)) setPurchases(serverData.purchases);
      if (Array.isArray(serverData.scrapInventory)) setScrapInventory(serverData.scrapInventory);
      if (Array.isArray(serverData.khataRecords)) setKhataRecords(serverData.khataRecords);
      if (Array.isArray(serverData.activityLogs)) setActivityLogs(serverData.activityLogs);
    }
  };

  // Helper to broadcast changes live across all connected devices
  const syncBroadcast = (
    actionDescription: string,
    updateType: 'sale' | 'product' | 'khata' | 'stock' | 'reset' | 'general',
    partialState: Partial<StoreState>
  ) => {
    const nextState: StoreState = {
      products: partialState.products ?? stateRef.current.products,
      sales: partialState.sales ?? stateRef.current.sales,
      purchases: partialState.purchases ?? stateRef.current.purchases,
      scrapInventory: partialState.scrapInventory ?? stateRef.current.scrapInventory,
      khataRecords: partialState.khataRecords ?? stateRef.current.khataRecords,
      activityLogs: partialState.activityLogs ?? stateRef.current.activityLogs,
    };
    realtimeSync.broadcastChange(nextState, actionDescription, activeEmployee, updateType);
  };

  // Helper to record real-time staff actions in the audit log
  const createActivityLog = (
    action: ActivityLog['action'],
    title: string,
    details: string,
    amount?: number
  ): ActivityLog => {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      title,
      details,
      performedBy: activeEmployee,
      amount,
    };
  };

  const addActivityLog = (
    action: ActivityLog['action'],
    title: string,
    details: string,
    amount?: number
  ) => {
    const newLog = createActivityLog(action, title, details, amount);
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Owner authentication handling (PIN: 9766208407)
  const handleOpenOwnerMode = () => {
    if (isOwnerAuthenticated) {
      setActiveEmployee('Om Prakash (Owner)');
      setActiveTab('owner');
      setIsSideMenuOpen(false);
    } else {
      setTargetTabAfterAuth('owner');
      setIsPasswordModalOpen(true);
      setIsSideMenuOpen(false);
    }
  };

  const handleOwnerAuthSuccess = () => {
    setIsOwnerAuthenticated(true);
    sessionStorage.setItem('osr_owner_auth', 'true');
    setActiveEmployee('Om Prakash (Owner)');
    if (targetTabAfterAuth) {
      setActiveTab(targetTabAfterAuth);
      setTargetTabAfterAuth(null);
    }
  };

  const handleLockOwnerMode = () => {
    setIsOwnerAuthenticated(false);
    sessionStorage.removeItem('osr_owner_auth');
    setActiveEmployee('Sunil (Store Staff)');
    if (activeTab === 'owner') {
      setActiveTab('home');
    }
  };

  const handleEmployeeChange = (newEmp: string) => {
    if (newEmp === 'Om Prakash (Owner)') {
      if (!isOwnerAuthenticated) {
        setIsPasswordModalOpen(true);
        return;
      }
    }
    setActiveEmployee(newEmp);
  };

  // Delete Product Handler
  const handleDeleteProduct = (productId: string, productName: string) => {
    const nextProducts = products.filter((p) => p.id !== productId);
    setProducts(nextProducts);
    const newLog = createActivityLog(
      'product_deleted',
      `Product Deleted: ${productName}`,
      `Removed "${productName}" from the store catalog and price list.`
    );
    const nextLogs = [newLog, ...activityLogs];
    setActivityLogs(nextLogs);
    syncBroadcast(`Product Deleted: ${productName}`, 'product', {
      products: nextProducts,
      activityLogs: nextLogs,
    });
  };

  // Add / Edit Product Handler
  const handleSaveProduct = (product: Product) => {
    const existingIndex = products.findIndex((p) => p.id === product.id);
    let nextProducts: Product[];
    let actionTitle: string;
    let actionDetails: string;
    let actionType: ActivityLog['action'];

    if (existingIndex >= 0) {
      nextProducts = [...products];
      nextProducts[existingIndex] = product;
      actionType = 'product_updated';
      actionTitle = `Product Updated: ${product.name}`;
      actionDetails = `Updated details for ${product.brand} ${product.capacityValue}${product.capacityUnit} (Sell Price: ₹${product.sellPrice}, Stock: ${product.stock})`;
    } else {
      nextProducts = [product, ...products];
      actionType = 'product_added';
      actionTitle = `New Product Added: ${product.name}`;
      actionDetails = `Added ${product.brand} ${product.category} (${product.capacityValue} ${product.capacityUnit}) at ₹${product.sellPrice} with initial stock of ${product.stock} units.`;
    }

    setProducts(nextProducts);
    const newLog = createActivityLog(actionType, actionTitle, actionDetails, product.sellPrice);
    const nextLogs = [newLog, ...activityLogs];
    setActivityLogs(nextLogs);
    setEditingProduct(null);

    syncBroadcast(actionTitle, 'product', {
      products: nextProducts,
      activityLogs: nextLogs,
    });
  };

  // Stock Adjustment Handler
  const handleUpdateStock = (productId: string, newStock: number) => {
    const prod = products.find((p) => p.id === productId);
    const nextProducts = products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
    setProducts(nextProducts);
    if (prod) {
      const title = `Stock Adjusted: ${prod.name}`;
      const newLog = createActivityLog(
        'stock_adjusted',
        title,
        `Stock quantity changed from ${prod.stock} to ${newStock} units.`
      );
      const nextLogs = [newLog, ...activityLogs];
      setActivityLogs(nextLogs);
      syncBroadcast(title, 'stock', {
        products: nextProducts,
        activityLogs: nextLogs,
      });
    }
  };

  // Quick Price Adjustment Handler
  const handleQuickUpdatePrice = (productId: string, newSellPrice: number) => {
    const prod = products.find((p) => p.id === productId);
    const nextProducts = products.map((p) => (p.id === productId ? { ...p, sellPrice: newSellPrice } : p));
    setProducts(nextProducts);
    if (prod) {
      const title = `Price Changed: ${prod.name}`;
      const newLog = createActivityLog(
        'price_updated',
        title,
        `Customer sell price updated from ₹${prod.sellPrice} to ₹${newSellPrice}.`,
        newSellPrice
      );
      const nextLogs = [newLog, ...activityLogs];
      setActivityLogs(nextLogs);
      syncBroadcast(title, 'product', {
        products: nextProducts,
        activityLogs: nextLogs,
      });
    }
  };

  // Complete Sale (Decrements stock, handles scrap, records in ledger, updates Khata if Udhar)
  const handleCompleteSale = (newSale: CustomerSale) => {
    // 1. Decrement products stock
    const nextProducts = products.map((prod) => {
      const itemSold = newSale.items.find((it) => it.productId === prod.id);
      if (itemSold) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - itemSold.quantity),
        };
      }
      return prod;
    });
    setProducts(nextProducts);

    // 2. Add scrap batteries to scrap inventory
    let nextScrapInventory = [...scrapInventory];
    newSale.items.forEach((item) => {
      if (item.hasScrapExchange) {
        const matchingScrap = nextScrapInventory.find(
          (s) => s.ahRating === item.capacityValue && s.type.includes(item.category === 'two_wheeler' ? '2W' : 'Tubular')
        );
        if (matchingScrap) {
          nextScrapInventory = nextScrapInventory.map((s) =>
            s.id === matchingScrap.id ? { ...s, quantity: s.quantity + item.quantity } : s
          );
        } else {
          nextScrapInventory = [
            ...nextScrapInventory,
            {
              id: `scrap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              type: item.category === 'two_wheeler' ? '2W Bike Ah' : 'Tubular Ah',
              ahRating: item.capacityValue,
              quantity: item.quantity,
              averageBuyRate: item.scrapDeductionPerUnit,
              lastUpdated: new Date().toISOString().split('T')[0],
            },
          ];
        }
      }
    });
    setScrapInventory(nextScrapInventory);

    // 3. Save to sales ledger
    const nextSales = [newSale, ...sales];
    setSales(nextSales);

    // 4. If sale has Udhar (credit) or partial due, automatically record in customer's Khata book
    let nextKhataRecords = [...khataRecords];
    if (newSale.dueAmount > 0 || newSale.paymentMode === 'Credit (Udhar)') {
      const due = newSale.dueAmount > 0 ? newSale.dueAmount : newSale.grandTotal;
      const cleanPhone = newSale.customerPhone.trim();
      
      const newTx: UdharTransaction = {
        id: `tx-sale-${Date.now()}`,
        date: newSale.date,
        type: 'credit_given',
        amount: due,
        description: `Billed: ${newSale.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}`,
        invoiceNo: newSale.invoiceNo,
        recordedBy: newSale.employeeName,
      };

      const existingIdx = nextKhataRecords.findIndex(
        (k) => k.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '') ||
               k.customerName.toLowerCase() === newSale.customerName.toLowerCase()
      );
      if (existingIdx >= 0) {
        const cust = nextKhataRecords[existingIdx];
        nextKhataRecords[existingIdx] = {
          ...cust,
          totalCreditGiven: cust.totalCreditGiven + due,
          balanceDue: cust.balanceDue + due,
          lastUpdated: new Date().toISOString(),
          transactions: [newTx, ...cust.transactions],
        };
      } else {
        const newCust: MerchantKhataRecord = {
          id: `cust-${Date.now()}`,
          customerName: newSale.customerName,
          phone: newSale.customerPhone,
          type: 'Retail Customer',
          address: newSale.customerAddress || undefined,
          totalCreditGiven: due,
          totalPaymentReceived: 0,
          balanceDue: due,
          lastUpdated: new Date().toISOString(),
          transactions: [newTx],
        };
        nextKhataRecords = [newCust, ...nextKhataRecords];
      }
      setKhataRecords(nextKhataRecords);
    }

    // 5. Record activity in Owner Audit log
    const saleLog = createActivityLog(
      'sale_created',
      `Sale Billed #${newSale.invoiceNo}`,
      `Customer: ${newSale.customerName} (${newSale.customerPhone}) purchased ${newSale.items.length} item(s). Paid ₹${newSale.paidAmount} via ${newSale.paymentMode}${newSale.dueAmount > 0 ? ` • Pending Udhar ₹${newSale.dueAmount}` : ''}`,
      newSale.grandTotal
    );
    const nextLogs = [saleLog, ...activityLogs];
    setActivityLogs(nextLogs);

    // 6. Broadcast live to Owner app & all connected devices
    syncBroadcast(
      `Sale Billed #${newSale.invoiceNo} (₹${newSale.grandTotal.toLocaleString('en-IN')}) by ${newSale.employeeName}`,
      'sale',
      {
        products: nextProducts,
        scrapInventory: nextScrapInventory,
        sales: nextSales,
        khataRecords: nextKhataRecords,
        activityLogs: nextLogs,
      }
    );

    // 7. Open invoice receipt modal
    setActiveInvoice(newSale);
    setIsInvoiceOpen(true);
  };

  // Handle Purchase Inflow
  const handleSavePurchase = (newPurchase: StockPurchase) => {
    const nextPurchases = [newPurchase, ...purchases];
    setPurchases(nextPurchases);

    let nextProducts = products;
    let nextScrapInventory = scrapInventory;

    if (newPurchase.type === 'distributor_stock') {
      nextProducts = products.map((prod) => {
        const purchased = newPurchase.items.find((it) => it.productId === prod.id);
        if (purchased) {
          return {
            ...prod,
            stock: prod.stock + purchased.quantity,
          };
        }
        return prod;
      });
      setProducts(nextProducts);
    } else {
      nextScrapInventory = [
        ...scrapInventory,
        ...newPurchase.items.map((it) => ({
          id: `scrap-buy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'Mixed Lead' as const,
          ahRating: 150,
          quantity: it.quantity,
          averageBuyRate: it.unitCost,
          lastUpdated: new Date().toISOString().split('T')[0],
        })),
      ];
      setScrapInventory(nextScrapInventory);
    }

    const newLog = createActivityLog(
      'stock_purchased',
      `Stock Inward from ${newPurchase.supplierName}`,
      `Recorded purchase bill #${newPurchase.purchaseBillNo} with ${newPurchase.items.length} items. Total: ₹${newPurchase.totalAmount} (${newPurchase.paymentStatus})`,
      newPurchase.totalAmount
    );
    const nextLogs = [newLog, ...activityLogs];
    setActivityLogs(nextLogs);

    syncBroadcast(
      `Stock Inward #${newPurchase.purchaseBillNo} from ${newPurchase.supplierName}`,
      'stock',
      {
        purchases: nextPurchases,
        products: nextProducts,
        scrapInventory: nextScrapInventory,
        activityLogs: nextLogs,
      }
    );

    setActiveTab('ledger');
  };

  // Khata Handlers
  const handleAddKhataTransaction = (customerId: string, transaction: UdharTransaction) => {
    let custName = 'Customer';
    const nextKhataRecords = khataRecords.map((cust) => {
      if (cust.id === customerId) {
        custName = cust.customerName;
        const isPayment = transaction.type === 'payment_received';
        return {
          ...cust,
          transactions: [transaction, ...cust.transactions],
          balanceDue: isPayment
            ? Math.max(0, cust.balanceDue - transaction.amount)
            : cust.balanceDue + transaction.amount,
          totalPaymentReceived: isPayment
            ? cust.totalPaymentReceived + transaction.amount
            : cust.totalPaymentReceived,
          totalCreditGiven: !isPayment
            ? cust.totalCreditGiven + transaction.amount
            : cust.totalCreditGiven,
          lastUpdated: new Date().toISOString(),
        };
      }
      return cust;
    });
    setKhataRecords(nextKhataRecords);

    const isPayment = transaction.type === 'payment_received';
    const newLog = createActivityLog(
      isPayment ? 'payment_received' : 'udhar_given',
      isPayment
        ? `Payment Received: ₹${transaction.amount} from ${custName}`
        : `Udhar (Credit) Given: ₹${transaction.amount} to ${custName}`,
      isPayment
        ? `Received payment via ${transaction.paymentMode || 'Cash'} towards pending balance. Note: ${transaction.description}`
        : `Recorded credit in customer ledger. Note: ${transaction.description}`,
      transaction.amount
    );
    const nextLogs = [newLog, ...activityLogs];
    setActivityLogs(nextLogs);

    syncBroadcast(
      isPayment
        ? `Payment Received: ₹${transaction.amount} from ${custName}`
        : `Udhar Given: ₹${transaction.amount} to ${custName}`,
      'khata',
      {
        khataRecords: nextKhataRecords,
        activityLogs: nextLogs,
      }
    );
  };

  const handleAddNewKhataCustomer = (newCustomer: MerchantKhataRecord) => {
    const nextKhataRecords = [newCustomer, ...khataRecords];
    setKhataRecords(nextKhataRecords);
    const newLog = createActivityLog(
      'udhar_given',
      `New Khata Account: ${newCustomer.customerName}`,
      `Created ledger account for ${newCustomer.type} (${newCustomer.phone})${newCustomer.balanceDue > 0 ? ` with opening balance of ₹${newCustomer.balanceDue}` : ''}`,
      newCustomer.balanceDue
    );
    const nextLogs = [newLog, ...activityLogs];
    setActivityLogs(nextLogs);

    syncBroadcast(
      `New Khata Account: ${newCustomer.customerName}`,
      'khata',
      {
        khataRecords: nextKhataRecords,
        activityLogs: nextLogs,
      }
    );
  };

  // Quick Sell from Catalog
  const handleQuickSell = (_product: Product) => {
    setActiveTab('billing');
  };

  // Transfer Combo from Calculator to Bill
  const handleTransferToBill = (_items: SaleItem[]) => {
    setActiveTab('billing');
  };

  // Settle Customer Due
  const handleSettleDue = (saleId: string, amountCollected: number) => {
    const nextSales = sales.map((sale) => {
      if (sale.id === saleId) {
        const newPaid = sale.paidAmount + amountCollected;
        const newDue = Math.max(0, sale.dueAmount - amountCollected);
        return {
          ...sale,
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentStatus: (newDue === 0 ? 'Paid' : 'Partial') as 'Paid' | 'Partial',
        };
      }
      return sale;
    });
    setSales(nextSales);

    syncBroadcast(`Customer Due Settled: ₹${amountCollected}`, 'sale', {
      sales: nextSales,
    });
  };

  // Reset all data completely: delete each and every product and customer dues
  const handleConfirmReset = () => {
    setProducts([]);
    setSales([]);
    setPurchases([]);
    setScrapInventory([]);
    setKhataRecords([]);
    const resetLog: ActivityLog = {
      id: `log-reset-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'product_deleted',
      title: 'Complete Store Reset',
      details: 'All products, customer credit (Udhar), and past sales records were cleared by Owner.',
      performedBy: activeEmployee,
      amount: 0,
    };
    setActivityLogs([resetLog]);

    localStorage.clear();
    localStorage.setItem('osr_clean_slate_v5', 'true');
    localStorage.setItem('osr_clean_products_v5', JSON.stringify([]));
    localStorage.setItem('osr_clean_sales_v5', JSON.stringify([]));
    localStorage.setItem('osr_clean_purchases_v5', JSON.stringify([]));
    localStorage.setItem('osr_clean_scrap_v5', JSON.stringify([]));
    localStorage.setItem('osr_clean_khata_v5', JSON.stringify([]));
    localStorage.setItem('osr_clean_logs_v5', JSON.stringify([resetLog]));

    realtimeSync.resetAllDevices(activeEmployee);

    setIsResetConfirmOpen(false);
    setIsSideMenuOpen(false);
    setActiveTab('home');
  };

  // Helper to open catalog with a specific category from the sorted grid
  const handleOpenCategory = (cat: string) => {
    setSelectedCatalogCategory(cat);
    setActiveTab('catalog');
  };

  // Counters & Metrics
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;
  const totalStoreUdhar = khataRecords.reduce((acc, k) => acc + k.balanceDue, 0);

  // Category counts
  const countInverterBattery = products.filter(p => p.category === 'inverter_battery').length;
  const countInverterUps = products.filter(p => p.category === 'inverter_ups').length;
  const countTwoWheeler = products.filter(p => p.category === 'two_wheeler').length;
  const countFourWheeler = products.filter(p => p.category === 'four_wheeler').length;
  const countBulbs = products.filter(p => p.category === 'bulb_lighting').length;
  const countElectricals = products.filter(p => p.category === 'electrical_thing').length;

  // Today's Date formatted
  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-red-600 selection:text-white pb-20 sm:pb-8">
      {/* 1. Deep Crimson Red Header Bar (Directly modeled after the sorted reference image) */}
      <header className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Hamburger Menu Icon + Store Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="p-2 -ml-1 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white flex items-center justify-center p-1 shadow-xs shrink-0">
                <OmSaiRamLogo size="sm" variant="icon-only" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-wide uppercase leading-tight flex items-center gap-1.5">
                  <span>OM SAI RAM</span>
                  <span className="hidden xs:inline text-red-200 font-bold text-xs">ELECTRICALS</span>
                </h1>
                <p className="text-[10px] text-red-100/90 font-medium tracking-wide leading-none">
                  LIVGUARD • MASSIMO • JAMES
                </p>
              </div>
            </button>
          </div>

          {/* Right: Owner / Staff Mode Status & Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Owner Lock Indicator */}
            {isOwnerAuthenticated ? (
              <button
                onClick={() => setActiveTab('owner')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                title="Owner Mode Unlocked"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Owner Mode</span>
                <span className="sm:hidden">Owner</span>
              </button>
            ) : (
              <button
                onClick={handleOpenOwnerMode}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-900/90 border border-red-500/40 text-red-100 text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                title="Owner Login (Requires PIN: 9766208407)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Owner PIN</span>
                <span className="sm:hidden">PIN</span>
              </button>
            )}

            {/* Real-time Live Sync Indicator between Staff & Owner */}
            <LiveSyncStatus
              activeEmployee={activeEmployee}
              isOwner={isOwnerAuthenticated}
              onForceSync={handleForceSync}
            />

            {/* Quick Employee Switcher */}
            <div className="hidden md:flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-xl border border-white/10 text-xs">
              <User className="w-3.5 h-3.5 text-red-200" />
              <select
                value={activeEmployee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer text-[11px]"
              >
                <option value="Sunil (Store Staff)" className="text-slate-900">Sunil (Staff)</option>
                <option value="Manoj (Technician)" className="text-slate-900">Manoj (Tech)</option>
                <option value="Om Prakash (Owner)" className="text-slate-900">Om Prakash (Owner 🔒)</option>
              </select>
            </div>

            {/* Download App / APK */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              title="Download Android APK (Omsairam.apk) / 1-Click Install"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download APK</span>
              <span className="sm:hidden">APK</span>
            </button>

            {/* Quick Bill Action */}
            <button
              onClick={() => setActiveTab('billing')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>+ Bill</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation Ribbon (Quick Tabs for Desktop / Tablet) */}
        <div className="bg-red-900/90 border-t border-red-600/30 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 flex items-center justify-between gap-1 py-1 text-xs font-semibold whitespace-nowrap">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-white text-red-800 font-bold shadow-xs'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCatalogCategory('all');
                  setActiveTab('catalog');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-white text-red-800 font-bold shadow-xs'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>All Products ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-white text-red-800 font-bold shadow-xs'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Customer Sell Entry</span>
              </button>

              <button
                onClick={() => setActiveTab('khata')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'khata'
                    ? 'bg-white text-red-800 font-bold shadow-xs'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Daily Udhar Khata</span>
                {totalStoreUdhar > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-bold font-mono">
                    ₹{totalStoreUdhar.toLocaleString('en-IN')}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'calculator'
                    ? 'bg-white text-red-800 font-bold shadow-xs'
                    : 'text-red-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Ah + VA Calculator</span>
              </button>

              <button
                onClick={handleOpenOwnerMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'owner'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Owner Panel 🔒</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                title="Download Omsairam.apk & Android Install"
              >
                <Download className="w-3 h-3" />
                <span>Get App / APK</span>
              </button>
              <div className="hidden lg:flex items-center gap-3 text-[11px] text-red-200">
                <span>{todayStr}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Slide-Over Side Drawer (Clean, sorted navigation menu) */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSideMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                  <OmSaiRamLogo size="sm" variant="icon-only" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">OM SAI RAM</h3>
                  <p className="text-[10px] text-red-200 font-medium">Electricals &amp; Battery Hub</p>
                </div>
              </div>
              <button
                onClick={() => setIsSideMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active User Strip */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Logged in as:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                  isOwnerAuthenticated ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isOwnerAuthenticated ? 'Owner (Full Access)' : 'Staff Terminal'}
                </span>
              </div>
              <div className="mt-2">
                <select
                  value={activeEmployee}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="Sunil (Store Staff)">Sunil (Store Staff)</option>
                  <option value="Manoj (Technician)">Manoj (Technician)</option>
                  <option value="Om Prakash (Owner)">Om Prakash (Owner 🔒)</option>
                </select>
              </div>
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">Store Navigation</div>

              <button
                onClick={() => {
                  setActiveTab('home');
                  setIsSideMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'home' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4 text-red-600" />
                <span>Sorted Home Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCatalogCategory('all');
                  setActiveTab('catalog');
                  setIsSideMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'catalog' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BatteryCharging className="w-4 h-4 text-red-600" />
                  <span>All Stock &amp; Prices</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('billing');
                  setIsSideMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'billing' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>Customer Billing (POS)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('khata');
                  setIsSideMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'khata' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Daily Customer Credit (Udhar)</span>
                </div>
                {totalStoreUdhar > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono">
                    ₹{totalStoreUdhar.toLocaleString('en-IN')}
                  </span>
                )}
              </button>

              <button
                onClick={handleOpenOwnerMode}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'owner' ? 'bg-red-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>Owner Control Center</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-mono">
                  {isOwnerAuthenticated ? 'UNLOCKED' : 'PIN 9766208407'}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('calculator');
                  setIsSideMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'calculator' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Calculator className="w-4 h-4 text-teal-600" />
                <span>Ah + VA Load Calculator</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('purchase');
                  setIsSideMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'purchase' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <PackagePlus className="w-4 h-4 text-blue-600" />
                <span>Stock Purchase Inflow</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('ledger');
                  setIsSideMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'ledger' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Sales Ledger &amp; Bills</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {sales.length}
                </span>
              </button>

              <div className="pt-3 text-[10px] uppercase font-bold text-slate-400 px-3 py-1">Quick Tools</div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsAddProductOpen(true);
                  setIsSideMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-red-600" />
                <span>+ Add New Product</span>
              </button>

              <button
                onClick={() => {
                  setIsInstallModalOpen(true);
                  setIsSideMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-slate-600" />
                <span>Install Mobile App / APK</span>
              </button>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsResetConfirmOpen(true);
                  setIsSideMenuOpen(false);
                }}
                className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Staff &amp; Owner Live</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
        {/* ========================================================== */}
        {/* VIEW 0: SORTED HOME DASHBOARD (Like the reference image)   */}
        {/* ========================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Hero Card: Om Sai Ram Official Dealer & Quick Status */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-2 flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
                    <OmSaiRamLogo size="sm" isDark={true} variant="icon-only" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      <span>Official Retail Terminal</span>
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                      OM SAI RAM ELECTRICALS
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Authorized Dealer: <strong className="text-red-600">Livguard</strong> • <strong className="text-slate-800">Massimo</strong> • <strong className="text-blue-700">James</strong>
                    </p>
                  </div>
                </div>

                {/* Live Stats Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedCatalogCategory('all');
                      setActiveTab('catalog');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Products</span>
                    <span className="text-base sm:text-lg font-black text-slate-900">{products.length}</span>
                    <span className="text-[9px] text-slate-400 block">In Catalog</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCatalogCategory('all');
                      setActiveTab('catalog');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      lowStockCount > 0 
                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80'
                    }`}
                  >
                    <span className={`text-[10px] font-bold block uppercase ${lowStockCount > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                      Low Stock
                    </span>
                    <span className={`text-base sm:text-lg font-black ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {lowStockCount}
                    </span>
                    <span className="text-[9px] text-slate-400 block">{lowStockCount > 0 ? 'Needs Refill' : 'All OK'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('khata')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Pending Udhar</span>
                    <span className={`text-base sm:text-lg font-black font-mono ${totalStoreUdhar > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {totalStoreUdhar > 0 ? `₹${(totalStoreUdhar / 1000).toFixed(1)}k` : '₹0 Clean'}
                    </span>
                    <span className="text-[9px] text-slate-400 block">{totalStoreUdhar > 0 ? 'Credit Due' : 'Zero Dues'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ledger')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Bills</span>
                    <span className="text-base sm:text-lg font-black text-emerald-600">{sales.length}</span>
                    <span className="text-[9px] text-slate-400 block">Generated</span>
                  </button>
                </div>
              </div>

              {/* Instant Search Bar directly on Home */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={homeSearchQuery}
                    onChange={(e) => setHomeSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSelectedCatalogCategory('all');
                        setActiveTab('catalog');
                      }
                    }}
                    placeholder="Quick search any battery (150Ah, 200Ah), Inverter VA, Bulb, Brand..."
                    className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setSelectedCatalogCategory('all');
                      setActiveTab('catalog');
                    }}
                    className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* SORTED 2-COLUMN GRID (Matching user reference image!) */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Store Modules &amp; Categories</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Sorted tap-to-open menu for rapid counter operations</p>
                </div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">
                  12 Modules Ready
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Inverter Batteries */}
                <button
                  onClick={() => handleOpenCategory('inverter_battery')}
                  className="bg-white hover:bg-red-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-red-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <BatteryCharging className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {countInverterBattery} Models
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-red-700 transition-colors">
                      Inverter Batteries
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      150Ah, 200Ah, 220Ah Tall Tubular
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-red-600">
                    <span>Livguard • Massimo • James</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 2. Inverters & Home UPS */}
                <button
                  onClick={() => handleOpenCategory('inverter_ups')}
                  className="bg-white hover:bg-blue-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <Zap className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {countInverterUps} Models
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors">
                      Inverters &amp; UPS
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Pure Sine Wave &amp; Heavy Duty Systems
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-blue-600">
                    <span>700VA to 2000VA</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 3. 2-Wheeler Batteries */}
                <button
                  onClick={() => handleOpenCategory('two_wheeler')}
                  className="bg-white hover:bg-emerald-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <Bike className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {countTwoWheeler} Models
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                      2-Wheeler Batteries
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Motorcycle &amp; Scooter (2.5Ah - 9Ah)
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-emerald-600">
                    <span>Livguard Bike Range</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 4. 4-Wheeler & Auto */}
                <button
                  onClick={() => handleOpenCategory('four_wheeler')}
                  className="bg-white hover:bg-sky-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <Car className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {countFourWheeler} Models
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-sky-700 transition-colors">
                      Car &amp; Tractor Batteries
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Automotive &amp; Heavy Commercial (35Ah-150Ah)
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-sky-600">
                    <span>Livguard &amp; Massimo Auto</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 5. LED Bulbs & Lighting */}
                <button
                  onClick={() => handleOpenCategory('bulb_lighting')}
                  className="bg-white hover:bg-amber-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {countBulbs} Items
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-amber-700 transition-colors">
                      LED Bulbs &amp; Lights
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      9W, 12W, 18W Bulbs, Battens &amp; Panels
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-amber-600">
                    <span>Watts Rating</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 6. Wires & Electricals */}
                <button
                  onClick={() => handleOpenCategory('electrical_thing')}
                  className="bg-white hover:bg-purple-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {countElectricals} Items
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-purple-700 transition-colors">
                      Wires &amp; Electricals
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Copper Cables, Switches, MCBs &amp; Fittings
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-purple-600">
                    <span>Coils, Switches &amp; Accessories</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 7. New Customer Sale (POS) */}
                <button
                  onClick={() => setActiveTab('billing')}
                  className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-4 rounded-2xl shadow-md shadow-red-700/20 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-red-700 uppercase">
                        + NEW BILL
                      </span>
                    </div>
                    <h4 className="font-black text-white text-sm sm:text-base">
                      Customer Billing (POS)
                    </h4>
                    <p className="text-[11px] text-red-100 mt-0.5 leading-snug">
                      Instant Bill, Scrap Battery Exchange &amp; Print
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-black text-white uppercase tracking-wider">
                    <span>Create Invoice</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 8. Daily Udhar Khata */}
                <button
                  onClick={() => setActiveTab('khata')}
                  className="bg-white hover:bg-amber-50/40 p-4 rounded-2xl border border-amber-300 shadow-2xs hover:shadow-md text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        ₹{totalStoreUdhar.toLocaleString('en-IN')} Due
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-amber-800 transition-colors">
                      Daily Udhar Khata
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Customer Credit, Payments &amp; WhatsApp Reminders
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-amber-700">
                    <span>{khataRecords.length} Customer Accounts</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 9. Owner Control Dashboard */}
                <button
                  onClick={handleOpenOwnerMode}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl border border-slate-800 shadow-md text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-700">
                        <Lock className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                        {isOwnerAuthenticated ? 'UNLOCKED' : 'PIN 9766208407'}
                      </span>
                    </div>
                    <h4 className="font-black text-white text-sm sm:text-base">
                      Owner Dashboard
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Daily Profits, Stock Valuation &amp; Staff Audit Logs
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-amber-400">
                    <span>Confidential Controls</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 10. Ah + VA Load Calculator */}
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="bg-white hover:bg-teal-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <Calculator className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Smart Sizer
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-teal-700 transition-colors">
                      Ah + VA Calculator
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Calculate Home Appliance Load &amp; Inverter Backup Hours
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-teal-600">
                    <span>Counter Sizing Tool</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 11. Stock Purchase Inflow */}
                <button
                  onClick={() => setActiveTab('purchase')}
                  className="bg-white hover:bg-cyan-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-cyan-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <PackagePlus className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Inward
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-cyan-700 transition-colors">
                      Stock Purchase Inflow
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Distributor Inward Stock &amp; Scrap Old Battery Purchases
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-cyan-600">
                    <span>{purchases.length} Purchase Bills</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 12. Sales History & Invoices */}
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="bg-white hover:bg-indigo-50/40 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {sales.length} Bills
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-indigo-700 transition-colors">
                      Sales History &amp; Invoices
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Customer Invoice Ledger, Print &amp; Balance Dues
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-indigo-600">
                    <span>Full Ledger</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 1: PRODUCT CATALOG & PRICE LIST                       */}
        {/* ========================================================== */}
        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onAddProduct={() => {
              setEditingProduct(null);
              setIsAddProductOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsAddProductOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onQuickSell={handleQuickSell}
            onUpdateStock={handleUpdateStock}
            onQuickUpdatePrice={handleQuickUpdatePrice}
            isOwner={isOwnerAuthenticated}
            selectedCategory={selectedCatalogCategory}
            initialSearchQuery={homeSearchQuery}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {/* ========================================================== */}
        {/* VIEW 2: BILLING & SELL ENTRY (POS)                         */}
        {/* ========================================================== */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>← Back to Dashboard</span>
              </button>
              <span className="text-xs text-slate-500 font-medium">Billed by: <strong>{activeEmployee}</strong></span>
            </div>
            <SalesBilling
              products={products}
              onCompleteSale={handleCompleteSale}
              activeEmployee={activeEmployee}
            />
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 3: DAILY CUSTOMER CREDIT (UDHAR KHATA)                */}
        {/* ========================================================== */}
        {activeTab === 'khata' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>← Back to Dashboard</span>
              </button>
              <div className="text-xs text-slate-500 font-medium">
                Total Store Udhar: <strong className="text-red-700 font-mono">₹{totalStoreUdhar.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <UdharKhata
              khataRecords={khataRecords}
              onAddTransaction={handleAddKhataTransaction}
              onAddNewCustomer={handleAddNewKhataCustomer}
              activeEmployee={activeEmployee}
            />
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 4: STOCK PURCHASE INFLOW                              */}
        {/* ========================================================== */}
        {activeTab === 'purchase' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>← Back to Dashboard</span>
              </button>
            </div>
            <PurchaseEntry
              products={products}
              onSavePurchase={handleSavePurchase}
              activeEmployee={activeEmployee}
            />
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 5: AH + VA LOAD CALCULATOR                            */}
        {/* ========================================================== */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>← Back to Dashboard</span>
              </button>
            </div>
            <CounterCalculator
              products={products}
              onTransferToBill={handleTransferToBill}
            />
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 6: SALES LEDGER & INVOICES                            */}
        {/* ========================================================== */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>← Back to Dashboard</span>
              </button>
            </div>
            <CustomerLedger
              sales={sales}
              purchases={purchases}
              scrapInventory={scrapInventory}
              onViewInvoice={(sale) => {
                setActiveInvoice(sale);
                setIsInvoiceOpen(true);
              }}
              onSettleDue={handleSettleDue}
            />
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 7: OWNER SECURE DASHBOARD (PIN 9766208407)            */}
        {/* ========================================================== */}
        {activeTab === 'owner' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>← Back to Dashboard</span>
              </button>
            </div>
            <OwnerDashboard
              sales={sales}
              purchases={purchases}
              products={products}
              khataRecords={khataRecords}
              activityLogs={activityLogs}
              onLockOwner={handleLockOwnerMode}
              onResetStore={() => setIsResetConfirmOpen(true)}
            />
          </div>
        )}
      </main>

      {/* 3. Mobile Bottom Navigation Bar (Sorted, quick thumb access) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-red-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => {
            setSelectedCatalogCategory('all');
            setActiveTab('catalog');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'catalog' ? 'text-red-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <BatteryCharging className="w-5 h-5" />
          <span className="text-[10px]">Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className="flex flex-col items-center gap-0.5 -mt-3 py-1 px-3 rounded-2xl bg-red-600 text-white font-bold shadow-md shadow-red-600/30 cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">New Bill</span>
        </button>

        <button
          onClick={() => setActiveTab('khata')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors cursor-pointer relative ${
            activeTab === 'khata' ? 'text-red-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Udhar</span>
          {totalStoreUdhar > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={handleOpenOwnerMode}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'owner' ? 'text-red-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Lock className="w-5 h-5" />
          <span className="text-[10px]">{isOwnerAuthenticated ? 'Owner' : 'PIN'}</span>
        </button>
      </nav>

      {/* Modals */}
      {/* 1. Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        initialProduct={editingProduct}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* 2. Customer Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        sale={activeInvoice}
        onClose={() => {
          setIsInvoiceOpen(false);
          setActiveInvoice(null);
        }}
      />

      {/* 3. Mobile APK / PWA Install Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* 4. Owner Password Security Modal (Requires 9766208407) */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setTargetTabAfterAuth(null);
        }}
        onSuccess={handleOwnerAuthSuccess}
      />

      {/* 5. In-App Reset Confirmation Modal (No window.confirm) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Reset App &amp; Delete All Data?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently delete every product, remove all customer credit (Udhar) and dues, wipe sales records, and reset the store to a clean slate.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition-colors cursor-pointer"
              >
                Delete All &amp; Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Connectivity Offline Banner */}
      <OfflineBanner />

      {/* Footer */}
      <footer className="hidden sm:block bg-slate-900 text-slate-400 py-6 text-xs border-t border-slate-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <OmSaiRamLogo size="sm" variant="icon-only" />
            <div>
              <p className="font-bold text-white tracking-wide">OM SAI RAM ELECTRICALS</p>
              <p className="text-[10px] text-red-400 uppercase tracking-widest font-semibold">POWERING YOUR HOME</p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <p>Official Retail &amp; Employee Terminal • Livguard • Massimo • James</p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Ah = Ampere-Hour (Battery) • VA = Volt-Ampere (Inverter) • W = Watts (Bulbs &amp; Lights)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
