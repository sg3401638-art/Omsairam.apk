import React, { useState } from 'react';
import { Product, CustomerSale, SaleItem } from '../types';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Car, 
  Sparkles,
  Check
} from 'lucide-react';

interface SalesBillingProps {
  products: Product[];
  onCompleteSale: (sale: CustomerSale) => void;
  activeEmployee: string;
  onBack?: () => void;
}

export const SalesBilling: React.FC<SalesBillingProps> = ({
  products,
  onCompleteSale,
  activeEmployee,
  onBack,
}) => {
  // Screen 4 Form state
  const [customerName, setCustomerName] = useState('Rahul Traders');
  const [saleDate, setSaleDate] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  });

  // Items in Sale
  const [items, setItems] = useState<SaleItem[]>([
    {
      productId: 'sample-1',
      productName: '230Ah Battery',
      brand: 'Livguard',
      category: 'inverter_battery',
      capacityValue: 230,
      capacityUnit: 'Ah',
      unitPrice: 20200,
      quantity: 2,
      hasScrapExchange: false,
      scrapDeductionPerUnit: 0,
      total: 40400,
    },
    {
      productId: 'sample-2',
      productName: 'LED Bulb 12W',
      brand: 'Livguard',
      category: 'bulb_lighting',
      capacityValue: 12,
      capacityUnit: 'W',
      unitPrice: 120,
      quantity: 5,
      hasScrapExchange: false,
      scrapDeductionPerUnit: 0,
      total: 600,
    },
    {
      productId: 'sample-3',
      productName: '2W Battery 12V',
      brand: 'Livguard',
      category: 'two_wheeler',
      capacityValue: 5,
      capacityUnit: 'Ah',
      unitPrice: 350,
      quantity: 3,
      hasScrapExchange: false,
      scrapDeductionPerUnit: 0,
      total: 1050,
    },
  ]);

  // Inline Add Item modal / picker
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [customRate, setCustomRate] = useState<number | ''>('');
  const [customQty, setCustomQty] = useState<number>(1);
  const [hasScrap, setHasScrap] = useState(false);
  const [scrapDeduction, setScrapDeduction] = useState<number>(0);

  // Additional billing attributes preserved (Phone, Address, Payment Mode, Udhar)
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [customerAddress, setCustomerAddress] = useState('');
  const [vehicleOrApplianceModel, setVehicleOrApplianceModel] = useState('');
  const [paymentMode, setPaymentMode] = useState<CustomerSale['paymentMode']>('UPI / PhonePe');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [showOptions, setShowOptions] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalScrapDiscount = items.reduce((sum, item) => sum + (item.scrapDeductionPerUnit * item.quantity), 0);
  const grandTotal = Math.max(0, subtotal - totalScrapDiscount);

  const effectivePaid = paidAmount === '' ? (paymentMode === 'Credit (Udhar)' ? 0 : grandTotal) : Number(paidAmount);
  const dueAmount = Math.max(0, grandTotal - effectivePaid);

  const handleAddItemToSale = () => {
    if (selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId);
      if (prod) {
        const scrap = hasScrap ? (scrapDeduction || prod.scrapValue) : 0;
        const rate = Number(customRate) || prod.sellPrice;
        const total = Math.max(0, (rate - scrap) * customQty);

        const newItem: SaleItem = {
          productId: prod.id,
          productName: prod.name,
          brand: prod.brand,
          category: prod.category,
          capacityValue: prod.capacityValue,
          capacityUnit: prod.capacityUnit,
          unitPrice: rate,
          quantity: customQty,
          hasScrapExchange: hasScrap,
          scrapAh: prod.capacityValue,
          scrapDeductionPerUnit: scrap,
          total,
        };

        setItems([...items, newItem]);
        setIsPickerOpen(false);
        resetPicker();
        return;
      }
    }

    if (customItemName.trim()) {
      const rate = Number(customRate) || 0;
      const total = rate * customQty;
      const newItem: SaleItem = {
        productId: `custom-${Date.now()}`,
        productName: customItemName.trim(),
        brand: 'Livguard',
        category: 'electrical_thing',
        capacityValue: 1,
        capacityUnit: 'Pcs',
        unitPrice: rate,
        quantity: customQty,
        hasScrapExchange: false,
        scrapDeductionPerUnit: 0,
        total,
      };
      setItems([...items, newItem]);
      setIsPickerOpen(false);
      resetPicker();
    }
  };

  const resetPicker = () => {
    setSelectedProductId('');
    setCustomItemName('');
    setCustomRate('');
    setCustomQty(1);
    setHasScrap(false);
    setScrapDeduction(0);
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...items];
    const it = updated[index];
    const scrap = it.hasScrapExchange ? it.scrapDeductionPerUnit : 0;
    updated[index] = {
      ...it,
      quantity: newQty,
      total: (it.unitPrice - scrap) * newQty,
    };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleClear = () => {
    setItems([]);
    setCustomerName('');
    setPaidAmount('');
  };

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one product to the sale.');
      return;
    }

    const invoiceNo = `INV-${Date.now().toString().slice(-4)}`;

    const newSale: CustomerSale = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || '9876543210',
      customerAddress: customerAddress.trim() || undefined,
      vehicleOrApplianceModel: vehicleOrApplianceModel.trim() || undefined,
      items,
      subtotal,
      totalScrapDiscount,
      extraDiscount: 0,
      taxIncluded: true,
      taxAmount: 0,
      grandTotal,
      paymentMode,
      paymentStatus: dueAmount === 0 ? 'Paid' : effectivePaid > 0 ? 'Partial' : 'Pending Due',
      paidAmount: effectivePaid,
      dueAmount,
      employeeName: activeEmployee,
    };

    sounds.playSuccessDing();
    try {
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
    } catch {
      // Confetti fallback
    }

    onCompleteSale(newSale);
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Container styled like Screen 4 */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header: Solid Crimson Red with Back Arrow and 'New Sale' */}
        <div className="bg-[#8b0000] text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold tracking-tight">New Sale</h2>
          </div>
          <div className="text-[11px] font-semibold text-red-200 font-mono">
            Staff: {activeEmployee.split(' ')[0]}
          </div>
        </div>

        {/* Screen 4 Form Body */}
        <form onSubmit={handleSaveSale} className="p-4 sm:p-5 space-y-4">
          {/* 1. Customer Name with User Icon */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Customer Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Rahul Traders"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 font-medium"
              />
            </div>
          </div>

          {/* 2. Date with Calendar Icon */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                placeholder="11 Oct 2025"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 font-medium pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-500">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 3. Products Table (Exact columns: Product | Qty | Rate (₹) | Total (₹)) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2.5 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    <th className="py-2.5 px-1.5 text-center w-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        No products added yet. Click "+ Add Product" below.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {item.productName}
                          {item.hasScrapExchange && (
                            <span className="block text-[10px] text-emerald-600 font-normal">
                              -₹{item.scrapDeductionPerUnit} scrap
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(index, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-600 font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-slate-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(index, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-emerald-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-700">
                          {item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {item.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-300 hover:text-red-600 p-1 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. + Add Product Button (Solid dark red matching screenshot 4) */}
          <div>
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#8b0000] hover:bg-red-800 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Inline Product Picker Modal */}
          {isPickerOpen && (
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900 uppercase">Select or Enter Item</span>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {products.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    From Inventory Catalog
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = products.find((pr) => pr.id === e.target.value);
                      if (p) {
                        setCustomRate(p.sellPrice);
                        setCustomItemName(p.name);
                        setScrapDeduction(p.scrapValue);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Choose Product from Catalog --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) • ₹{p.sellPrice} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Or manual entry */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="e.g. 230Ah Battery"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="20200"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">Qty:</label>
                  <input
                    type="number"
                    min={1}
                    value={customQty}
                    onChange={(e) => setCustomQty(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    id="scrapCheck"
                    checked={hasScrap}
                    onChange={(e) => setHasScrap(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <label htmlFor="scrapCheck" className="text-[11px] cursor-pointer">
                    Old Battery Exchange
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToSale}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  + Add to Table
                </button>
              </div>
            </div>
          )}

          {/* 5. Total Amount Row (Exact match to screenshot 4) */}
          <div className="flex items-center justify-between pt-3 pb-1 border-t border-slate-200">
            <span className="text-sm sm:text-base font-bold text-slate-800">
              Total Amount
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              ₹ {grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Collapsible Customer Phone & Payment Mode (Preserves 100% of features) */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center justify-between w-full py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span>Customer Phone &amp; Payment Mode (Optional)</span>
              {showOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOptions && (
              <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      <option value="UPI / PhonePe">UPI / PhonePe</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit (Udhar)">Credit (Udhar)</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                {paymentMode === 'Credit (Udhar)' && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                    This bill will automatically be recorded in the Customer's Daily Udhar Khata ledger!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 6. Action Buttons: Clear (white w/ red border) and Save Sale (solid crimson red) */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-3 px-4 rounded-xl border border-red-400 bg-white hover:bg-red-50 text-red-700 font-bold text-sm transition-colors cursor-pointer shadow-2xs"
            >
              Clear
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#8b0000] hover:bg-red-800 active:bg-red-950 text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
            >
              Save Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
