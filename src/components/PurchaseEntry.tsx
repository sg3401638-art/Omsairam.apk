import React, { useState } from 'react';
import { Product, StockPurchase, ProductCategory } from '../types';
import { Truck, Plus, Trash2, Save, CheckCircle, PackagePlus, Recycle, Building2, Phone } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PurchaseEntryProps {
  products: Product[];
  onSavePurchase: (purchase: StockPurchase) => void;
  activeEmployee: string;
}

export const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
  products,
  onSavePurchase,
  activeEmployee,
}) => {
  const [purchaseType, setPurchaseType] = useState<'distributor_stock' | 'customer_scrap_buyback'>('distributor_stock');
  const [supplierName, setSupplierName] = useState('Livguard Batteries Depot');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [purchaseBillNo, setPurchaseBillNo] = useState('');
  const [notes, setNotes] = useState('');

  // Items in this purchase
  const [purchaseItems, setPurchaseItems] = useState<
    {
      productId?: string;
      productName: string;
      category?: ProductCategory;
      quantity: number;
      unitCost: number;
      totalCost: number;
      unit?: string;
    }[]
  >([]);

  // Item selector
  const [selectedProdId, setSelectedProdId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<ProductCategory>('inverter_battery');
  const [qty, setQty] = useState<number>(5);
  const [cost, setCost] = useState<number>(12000);
  const [unit, setUnit] = useState<string>('Ah');

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Due'>('Paid');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [autoFullPaid, setAutoFullPaid] = useState<boolean>(true);

  // When picking a product from catalog
  const handleSelectProduct = (prodId: string) => {
    setSelectedProdId(prodId);
    if (!prodId) return;

    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setCustomItemName(prod.name);
      setItemCategory(prod.category);
      setCost(prod.purchasePrice);
      setUnit(prod.capacityUnit);
    }
  };

  // Add Item to purchase list
  const handleAddItem = () => {
    const name = selectedProdId
      ? products.find((p) => p.id === selectedProdId)?.name || customItemName
      : customItemName;

    if (!name.trim() || qty <= 0 || cost < 0) return;

    const newItem = {
      productId: selectedProdId || undefined,
      productName: name.trim(),
      category: itemCategory,
      quantity: Number(qty),
      unitCost: Number(cost),
      totalCost: Number(qty) * Number(cost),
      unit,
    };

    setPurchaseItems([...purchaseItems, newItem]);

    // Reset selector
    setSelectedProdId('');
    setCustomItemName('');
    setQty(1);
    setCost(1000);
  };

  const handleRemoveItem = (idx: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== idx));
  };

  const totalAmount = purchaseItems.reduce((acc, it) => acc + it.totalCost, 0);
  const effectivePaid = autoFullPaid ? totalAmount : paidAmount;

  // Submit Purchase
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Please enter Supplier or Customer name.');
      return;
    }
    if (purchaseItems.length === 0) {
      alert('Please add at least one item to this purchase.');
      return;
    }

    const billNo = purchaseBillNo.trim() || `PB-${Date.now().toString().slice(-6)}`;

    const newPurchase: StockPurchase = {
      id: `pur-${Date.now()}`,
      purchaseBillNo: billNo,
      date: new Date().toISOString(),
      supplierName: supplierName.trim(),
      supplierPhone: supplierPhone.trim() || undefined,
      type: purchaseType,
      items: purchaseItems,
      totalAmount,
      paymentStatus,
      paidAmount: effectivePaid,
      notes: notes.trim() || undefined,
      receivedBy: activeEmployee,
    };

    sounds.playSuccessDing();
    onSavePurchase(newPurchase);

    // Reset Form
    setPurchaseItems([]);
    setPurchaseBillNo('');
    setSupplierPhone('');
    setNotes('');
    setPaidAmount(0);
    setAutoFullPaid(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
            <PackagePlus className="w-4 h-4 text-emerald-400" />
            <span>Stock Inflow &amp; Purchase Entry</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            PURCHASE ENTRY / INVENTORY RESTOCK
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Log incoming stock from authorized brands (Livguard, James, Massimo) or direct scrap battery buybacks.
          </p>
        </div>

        {/* Purchase Type Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800 border border-slate-700">
          <button
            type="button"
            onClick={() => {
              setPurchaseType('distributor_stock');
              setSupplierName('Livguard Batteries Depot');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              purchaseType === 'distributor_stock'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Company Stock Purchase</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPurchaseType('customer_scrap_buyback');
              setSupplierName('Walk-in Scrap Customer');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              purchaseType === 'customer_scrap_buyback'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Recycle className="w-3.5 h-3.5" />
            <span>Scrap Battery Buyback</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Supplier & Item inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Supplier Details */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>
                {purchaseType === 'distributor_stock' ? 'Distributor / Supplier Details' : 'Scrap Seller Details'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Livguard Batteries Depot"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Invoice / Challan No.
                </label>
                <input
                  type="text"
                  value={purchaseBillNo}
                  onChange={(e) => setPurchaseBillNo(e.target.value)}
                  placeholder="e.g. LIV-INV-9901"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier Contact Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="e.g. 98260 00000"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add Item to Purchase */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-600" />
              <span>Add Items to Purchase Inflow</span>
            </h3>

            {purchaseType === 'distributor_stock' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Existing Catalog Product (Auto-updates stock):
                  </label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => handleSelectProduct(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white font-medium"
                  >
                    <option value="">-- Choose Existing Product from Store --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.capacityValue} {p.capacityUnit}] (Current Stock: {p.stock}) — Dealer Cost: ₹
                        {p.purchasePrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center text-xs text-slate-400 font-semibold">— OR TYPE NEW ITEM NAME —</div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Product / Material Name:
                  </label>
                  <input
                    type="text"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="e.g. James 150Ah Tubular Master"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            ) : (
              /* Scrap Buyback Items */
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scrap Battery Type:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { label: 'Tubular 150Ah Scrap', rate: 2500, unit: 'Ah' },
                    { label: 'Tubular 200Ah Scrap', rate: 3200, unit: 'Ah' },
                    { label: '2W Bike 5Ah Scrap', rate: 110, unit: 'Ah' },
                    { label: 'Car 35Ah Scrap', rate: 750, unit: 'Ah' },
                    { label: 'Car 65Ah Scrap', rate: 1200, unit: 'Ah' },
                    { label: 'Dead Inverter Scrap', rate: 300, unit: 'VA' },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        setCustomItemName(s.label);
                        setCost(s.rate);
                        setUnit(s.unit);
                      }}
                      className="p-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-left transition-colors"
                    >
                      <div>{s.label}</div>
                      <div className="text-amber-700 font-normal">Std Rate: ₹{s.rate}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity, Cost, Unit */}
            <div className="mt-4 grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Inflow Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Unit Purchase Cost (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white text-red-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Item Total (₹)
                </label>
                <div className="py-1.5 px-3 rounded-lg bg-slate-200 text-slate-900 font-black text-sm">
                  ₹{(qty * cost).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Purchase List</span>
            </button>
          </div>
        </div>

        {/* Right Side: Inflow Summary & Settlement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 sticky top-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-200 flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-600" />
              <span>Purchase Batch Items ({purchaseItems.length})</span>
            </h3>

            {/* List */}
            <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto">
              {purchaseItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <PackagePlus className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>No purchase items added yet.</span>
                </div>
              ) : (
                purchaseItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-slate-500 text-[11px]">
                        Qty: <strong className="text-slate-800">{item.quantity}</strong> × Rate: ₹
                        {item.unitCost}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">₹{item.totalCost}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Settlement */}
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Total Purchase Amount:</span>
                <span className="text-xl font-black text-red-700">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Status:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('Paid')}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      paymentStatus === 'Paid'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Payment Made (Paid)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('Due')}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      paymentStatus === 'Due'
                        ? 'bg-amber-50 border-amber-500 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Payment Pending (Due)
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (e.g. Delivery vehicle MP-09-AA-1234, 30 days credit)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={purchaseItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-700/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>Save Purchase &amp; Update Inventory</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
