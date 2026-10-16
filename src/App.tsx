import React, { useState, useEffect } from 'react';
import { Product, CustomerSale, StockPurchase, ScrapInventoryItem, SaleItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_PURCHASES, INITIAL_SCRAP_INVENTORY } from './data/mockData';
import { OmSaiRamLogo } from './components/OmSaiRamLogo';
import { SplashScreen } from './components/SplashScreen';
import { ProductCatalog } from './components/ProductCatalog';
import { SalesBilling } from './components/SalesBilling';
import { PurchaseEntry } from './components/PurchaseEntry';
import { CounterCalculator } from './components/CounterCalculator';
import { CustomerLedger } from './components/CustomerLedger';
import { AddProductModal } from './components/AddProductModal';
import { InvoiceModal } from './components/InvoiceModal';
import { 
  BatteryCharging, 
  Zap, 
  ShoppingCart, 
  PackagePlus, 
  Calculator, 
  FileText, 
  Plus, 
  Play, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  User,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'billing' | 'purchase' | 'calculator' | 'ledger'>('catalog');

  // Employee profile
  const [activeEmployee, setActiveEmployee] = useState<string>('Sunil (Store Staff)');

  // Data states with LocalStorage persistence (Strictly Livguard, James, Massimo)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('osr_products_v3_ljm');
      if (saved) {
        const parsed = JSON.parse(saved) as Product[];
        // Filter strictly to Livguard, James, Massimo
        const valid = parsed.filter(p => ['Livguard', 'James', 'Massimo'].includes(p.brand));
        if (valid.length > 0) return valid;
      }
    } catch {
      // Fallback
    }
    return INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<CustomerSale[]>(() => {
    try {
      const saved = localStorage.getItem('osr_sales_v3_ljm');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_SALES;
  });

  const [purchases, setPurchases] = useState<StockPurchase[]>(() => {
    try {
      const saved = localStorage.getItem('osr_purchases_v3_ljm');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_PURCHASES;
  });

  const [scrapInventory, setScrapInventory] = useState<ScrapInventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('osr_scrap_v3_ljm');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_SCRAP_INVENTORY;
  });

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [activeInvoice, setActiveInvoice] = useState<CustomerSale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('osr_products_v3_ljm', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('osr_sales_v3_ljm', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('osr_purchases_v3_ljm', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('osr_scrap_v3_ljm', JSON.stringify(scrapInventory));
  }, [scrapInventory]);

  // Handle Add/Edit Product
  const handleSaveProduct = (product: Product) => {
    const existingIndex = products.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...products];
      updated[existingIndex] = product;
      setProducts(updated);
    } else {
      setProducts([product, ...products]);
    }
    setEditingProduct(null);
  };

  // Stock Adjustment
  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  // Quick Price Adjustment
  const handleQuickUpdatePrice = (productId: string, newSellPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, sellPrice: newSellPrice } : p))
    );
  };

  // Complete Sale (Decrements product stock and records scrap if applicable)
  const handleCompleteSale = (newSale: CustomerSale) => {
    // 1. Decrement products stock
    setProducts((prev) =>
      prev.map((prod) => {
        const itemSold = newSale.items.find((it) => it.productId === prod.id);
        if (itemSold) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - itemSold.quantity),
          };
        }
        return prod;
      })
    );

    // 2. Add scrap batteries to scrap inventory
    newSale.items.forEach((item) => {
      if (item.hasScrapExchange) {
        setScrapInventory((prev) => {
          const matchingScrap = prev.find(
            (s) => s.ahRating === item.capacityValue && s.type.includes(item.category === 'two_wheeler' ? '2W' : 'Tubular')
          );
          if (matchingScrap) {
            return prev.map((s) =>
              s.id === matchingScrap.id ? { ...s, quantity: s.quantity + item.quantity } : s
            );
          } else {
            return [
              ...prev,
              {
                id: `scrap-${Date.now()}-${Math.random()}`,
                type: item.category === 'two_wheeler' ? '2W Bike Ah' : 'Tubular Ah',
                ahRating: item.capacityValue,
                quantity: item.quantity,
                averageBuyRate: item.scrapDeductionPerUnit,
                lastUpdated: new Date().toISOString().split('T')[0],
              },
            ];
          }
        });
      }
    });

    // 3. Save to sales ledger
    setSales([newSale, ...sales]);

    // 4. Open invoice modal
    setActiveInvoice(newSale);
    setIsInvoiceOpen(true);
  };

  // Handle Purchase Inflow (increments product stock if existing catalog item, or scrap)
  const handleSavePurchase = (newPurchase: StockPurchase) => {
    setPurchases([newPurchase, ...purchases]);

    // If distributor stock, increase catalog stock
    if (newPurchase.type === 'distributor_stock') {
      setProducts((prev) =>
        prev.map((prod) => {
          const purchased = newPurchase.items.find((it) => it.productId === prod.id);
          if (purchased) {
            return {
              ...prod,
              stock: prod.stock + purchased.quantity,
            };
          }
          return prod;
        })
      );
    } else {
      // If customer scrap buyback, increment scrap inventory
      newPurchase.items.forEach((it) => {
        setScrapInventory((prev) => [
          ...prev,
          {
            id: `scrap-buy-${Date.now()}`,
            type: 'Mixed Lead',
            ahRating: 150,
            quantity: it.quantity,
            averageBuyRate: it.unitCost,
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        ]);
      });
    }

    setActiveTab('ledger');
  };

  // Quick Sell from Catalog
  const handleQuickSell = (product: Product) => {
    setActiveTab('billing');
  };

  // Transfer Combo from Calculator to Bill
  const handleTransferToBill = (items: SaleItem[]) => {
    setActiveTab('billing');
  };

  // Settle Customer Due
  const handleSettleDue = (saleId: string, amountCollected: number) => {
    setSales((prev) =>
      prev.map((sale) => {
        if (sale.id === saleId) {
          const newPaid = sale.paidAmount + amountCollected;
          const newDue = Math.max(0, sale.dueAmount - amountCollected);
          return {
            ...sale,
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus: newDue === 0 ? 'Paid' : 'Partial',
          };
        }
        return sale;
      })
    );
  };

  // Reset to sample initial data
  const handleResetSampleData = () => {
    if (confirm('Reset store data back to original default catalog & sample sales?')) {
      setProducts(INITIAL_PRODUCTS);
      setSales(INITIAL_SALES);
      setPurchases(INITIAL_PURCHASES);
      setScrapInventory(INITIAL_SCRAP_INVENTORY);
      localStorage.clear();
    }
  };

  // Low stock counter
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-red-600 selection:text-white">
      {/* 1. Entrance Animation / Splash Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          employeeName={activeEmployee}
        />
      )}

      {/* Top Navbar / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo with Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="cursor-pointer" onClick={() => setActiveTab('catalog')}>
              <OmSaiRamLogo size="sm" variant="horizontal" />
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-white text-[11px] font-bold shadow-xs">
              <span className="text-red-400 font-extrabold">Exclusive Brands:</span>
              <span className="text-slate-100">Livguard</span>
              <span className="text-red-500">•</span>
              <span className="text-slate-100">James</span>
              <span className="text-red-500">•</span>
              <span className="text-slate-100">Massimo</span>
            </div>
          </div>

          {/* Quick Info & Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Low stock alert badge */}
            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab('catalog')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold"
                title={`${lowStockCount} items have low stock`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>{lowStockCount} Low Stock</span>
              </button>
            )}

            {/* Replay Logo Animation button */}
            <button
              onClick={() => setShowSplash(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              title="Replay Entrance Animation"
            >
              <Play className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden md:inline">Logo Animation</span>
            </button>

            {/* Employee Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={activeEmployee}
                onChange={(e) => setActiveEmployee(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Sunil (Store Staff)">Sunil (Staff)</option>
                <option value="Manoj (Technician)">Manoj (Tech)</option>
                <option value="Om Prakash (Owner)">Om Prakash (Owner)</option>
              </select>
            </div>

            {/* Quick Bill Button */}
            <button
              onClick={() => setActiveTab('billing')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-700/20 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>+ New Bill</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto py-1 scrollbar-none">
            <div className="flex items-center gap-1">
              {/* Tab 1: Catalog */}
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <BatteryCharging className="w-4 h-4 text-red-500" />
                <span>Price &amp; Stock Catalog</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white">
                  {products.length}
                </span>
              </button>

              {/* Tab 2: Billing / Sell */}
              <button
                onClick={() => setActiveTab('billing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Customer Sell Entry</span>
              </button>

              {/* Tab 3: Purchase Inflow */}
              <button
                onClick={() => setActiveTab('purchase')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'purchase'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <PackagePlus className="w-4 h-4 text-emerald-500" />
                <span>Purchase Stock Inflow</span>
              </button>

              {/* Tab 4: Ah + VA Calculator */}
              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'calculator'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Calculator className="w-4 h-4 text-amber-500" />
                <span>Ah + VA Combo Calculator</span>
              </button>

              {/* Tab 5: Ledger */}
              <button
                onClick={() => setActiveTab('ledger')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'ledger'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Sales Ledger &amp; Khata</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white">
                  {sales.length}
                </span>
              </button>
            </div>

            {/* Quick helper note */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span>
                <strong>Ah</strong>: Battery Capacity • <strong>VA</strong>: Inverter Rating
              </span>
              <button
                onClick={handleResetSampleData}
                className="text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                title="Reset sample test data"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
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
            onQuickSell={handleQuickSell}
            onUpdateStock={handleUpdateStock}
            onQuickUpdatePrice={handleQuickUpdatePrice}
          />
        )}

        {activeTab === 'billing' && (
          <SalesBilling
            products={products}
            onCompleteSale={handleCompleteSale}
            activeEmployee={activeEmployee}
          />
        )}

        {activeTab === 'purchase' && (
          <PurchaseEntry
            products={products}
            onSavePurchase={handleSavePurchase}
            activeEmployee={activeEmployee}
          />
        )}

        {activeTab === 'calculator' && (
          <CounterCalculator
            products={products}
            onTransferToBill={handleTransferToBill}
          />
        )}

        {activeTab === 'ledger' && (
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
        )}
      </main>

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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <OmSaiRamLogo size="sm" variant="icon-only" />
            <div>
              <p className="font-bold text-white tracking-wide">OM SAI RAM ELECTRICALS</p>
              <p className="text-[10px] text-red-400 uppercase tracking-widest font-semibold">POWERING YOUR HOME</p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <p>Official Employee Portal • Battery &amp; Electrical Billing Terminal</p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Ah = Ampere-Hour (Battery) • VA = Volt-Ampere (Inverter) • W = Watts (Bulbs &amp; Lights)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
