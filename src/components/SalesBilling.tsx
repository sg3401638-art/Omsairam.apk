import React, { useState } from 'react';
import { Product, CustomerSale, SaleItem } from '../types';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  AlertCircle, 
  User, 
  Phone, 
  Car, 
  Sparkles, 
  RotateCcw,
  Tag,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface SalesBillingProps {
  products: Product[];
  onCompleteSale: (sale: CustomerSale) => void;
  activeEmployee: string;
}

export const SalesBilling: React.FC<SalesBillingProps> = ({
  products,
  onCompleteSale,
  activeEmployee,
}) => {
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [vehicleOrApplianceModel, setVehicleOrApplianceModel] = useState('');
  const [notes, setNotes] = useState('');

  // Cart Items
  const [items, setItems] = useState<SaleItem[]>([]);

  // Item selector state
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [selectedSerial, setSelectedSerial] = useState<string>('');
  const [hasScrap, setHasScrap] = useState<boolean>(false);
  const [customScrapValue, setCustomScrapValue] = useState<number>(0);

  // Financials
  const [extraDiscount, setExtraDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<CustomerSale['paymentMode']>('UPI / PhonePe');
  const [paymentStatus, setPaymentStatus] = useState<CustomerSale['paymentStatus']>('Paid');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [autoMatchPaid, setAutoMatchPaid] = useState<boolean>(true);

  // Filter products by in-stock or category
  const [catFilter, setCatFilter] = useState<string>('all');

  // Handle selected product change
  const handleProductSelection = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      if (prod.category === 'inverter_battery' || prod.category === 'two_wheeler' || prod.category === 'four_wheeler') {
        setHasScrap(true);
        setCustomScrapValue(prod.scrapValue);
      } else {
        setHasScrap(false);
        setCustomScrapValue(0);
      }
    }
  };

  // Add Item to Bill
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const scrapDeduction = hasScrap ? customScrapValue : 0;
    const itemTotal = (prod.sellPrice - scrapDeduction) * selectedQty;

    const newItem: SaleItem = {
      productId: prod.id,
      productName: prod.name,
      brand: prod.brand,
      category: prod.category,
      capacityValue: prod.capacityValue,
      capacityUnit: prod.capacityUnit,
      unitPrice: prod.sellPrice,
      quantity: selectedQty,
      serialNumber: selectedSerial.trim() || undefined,
      hasScrapExchange: hasScrap,
      scrapAh: hasScrap ? prod.capacityValue : undefined,
      scrapDeductionPerUnit: scrapDeduction,
      total: Math.max(0, itemTotal),
    };

    setItems([...items, newItem]);

    // Reset selector
    setSelectedProductId('');
    setSelectedQty(1);
    setSelectedSerial('');
    setHasScrap(false);
    setCustomScrapValue(0);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const rawSubtotal = items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
  const totalScrapDiscount = items.reduce((acc, it) => acc + (it.hasScrapExchange ? it.scrapDeductionPerUnit * it.quantity : 0), 0);
  const grandTotal = Math.max(0, rawSubtotal - totalScrapDiscount - extraDiscount);

  // Sync paid amount if auto match is on
  const effectivePaid = autoMatchPaid ? grandTotal : paidAmount;
  const balanceDue = Math.max(0, grandTotal - effectivePaid);

  // Finalize Sale
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter Customer Name and Mobile Number.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one product to the sale bill.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const randomBillId = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `OSR-${currentYear}-${randomBillId}`;

    const newSale: CustomerSale = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || undefined,
      vehicleOrApplianceModel: vehicleOrApplianceModel.trim() || undefined,
      items,
      subtotal: rawSubtotal,
      totalScrapDiscount,
      extraDiscount: Number(extraDiscount) || 0,
      taxIncluded: true,
      taxAmount: 0,
      grandTotal,
      paymentMode,
      paymentStatus: balanceDue === 0 ? 'Paid' : effectivePaid > 0 ? 'Partial' : 'Pending Due',
      paidAmount: effectivePaid,
      dueAmount: balanceDue,
      notes: notes.trim() || undefined,
      employeeName: activeEmployee,
    };

    // Trigger celebration effects
    sounds.playSuccessDing();
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.75 },
      });
    } catch {
      // Ignore if confetti fails
    }

    onCompleteSale(newSale);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setVehicleOrApplianceModel('');
    setNotes('');
    setItems([]);
    setExtraDiscount(0);
    setPaidAmount(0);
    setAutoMatchPaid(true);
  };

  const filteredCatalog = products.filter((p) => {
    if (catFilter === 'all') return true;
    return p.category === catFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Customer Point of Sale • Billing Station</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            CREATE CUSTOMER SALE ENTRY
          </h2>
          <p className="text-xs text-red-100 max-w-xl">
            Quickly bill Batteries (Ah), Inverters (VA), 2W Batteries &amp; Electronics. Deduct old battery scrap exchange and issue warranty invoices.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-red-950/60 border border-red-500/30 px-4 py-2.5 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-red-300 block uppercase font-bold">Billing Attendant</span>
            <span className="text-sm font-extrabold text-white">{activeEmployee}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
            {activeEmployee.charAt(0)}
          </div>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (Col 7): Customer Info + Product Picker */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details Box */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-red-600" />
              <span>Customer Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number * (For Warranty &amp; SMS)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 98270 12345"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle / Application Model (Optional)
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={vehicleOrApplianceModel}
                    onChange={(e) => setVehicleOrApplianceModel(e.target.value)}
                    placeholder="e.g. Activa 6G, Swift, 2BHK Home Inverter"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Address / Area
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. Gandhi Nagar, Ward 5"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Add Item to Cart Box */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-red-600" />
                <span>Select Product to Add</span>
              </h3>

              {/* Category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs py-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'inverter_battery', label: 'Battery (Ah)' },
                  { id: 'inverter_ups', label: 'Inverter (VA)' },
                  { id: 'two_wheeler', label: '2W (Ah)' },
                  { id: 'bulb_lighting', label: 'Bulbs (W)' },
                  { id: 'electrical_thing', label: 'Electricals' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCatFilter(t.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      catFilter === t.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product dropdown */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose Item from Inventory:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelection(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="">-- Choose Product (Ah / VA / Watts) --</option>
                  {filteredCatalog.map((prod) => (
                    <option key={prod.id} value={prod.id} disabled={prod.stock <= 0}>
                      {prod.name} [{prod.capacityValue} {prod.capacityUnit}] — ₹{prod.sellPrice}{' '}
                      {prod.stock <= 0 ? '(Out of Stock)' : `(Stock: ${prod.stock})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* If a product is selected, show details and exchange options */}
              {selectedProductId && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  {(() => {
                    const prod = products.find((p) => p.id === selectedProductId);
                    if (!prod) return null;
                    return (
                      <>
                        <div className="flex flex-wrap items-center justify-between text-xs border-b border-slate-200 pb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{prod.name}</span>
                            <span className="ml-2 font-mono text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded">
                              {prod.capacityValue} {prod.capacityUnit}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 line-through mr-1">₹{prod.mrp}</span>
                            <span className="text-base font-black text-red-700">₹{prod.sellPrice}</span>
                          </div>
                        </div>

                        {/* Quantity & Serial Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={prod.stock || 99}
                              value={selectedQty}
                              onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value)))}
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Battery / Inverter Serial No. (Warranty S/N)
                            </label>
                            <input
                              type="text"
                              value={selectedSerial}
                              onChange={(e) => setSelectedSerial(e.target.value)}
                              placeholder="e.g. LUM-18K-49102"
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-mono"
                            />
                          </div>
                        </div>

                        {/* Old Battery Scrap Exchange checkbox */}
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasScrap}
                              onChange={(e) => setHasScrap(e.target.checked)}
                              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-xs font-bold text-amber-900">
                              Customer Exchanging Old Scrap Battery? (Deduct from bill)
                            </span>
                          </label>

                          {hasScrap && (
                            <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                              <span className="text-amber-800">Scrap Discount per item:</span>
                              <div className="flex items-center gap-1 font-bold text-amber-900">
                                <span>₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={customScrapValue}
                                  onChange={(e) => setCustomScrapValue(Number(e.target.value))}
                                  className="w-24 px-2 py-1 text-sm border border-amber-300 rounded bg-white text-right font-bold"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Add to Bill Button */}
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Customer Bill</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side (Col 5): Invoice Items & Finalize Payment */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-red-600" />
                <span>Invoice Items ({items.length})</span>
              </h3>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Items List */}
            <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>No items added yet. Choose a product from the left.</span>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                        <span className="text-red-700 font-semibold">
                          {item.capacityValue} {item.capacityUnit}
                        </span>
                        <span>• Qty: {item.quantity}</span>
                        <span>• Rate: ₹{item.unitPrice}</span>
                      </div>
                      {item.serialNumber && (
                        <div className="text-[10px] text-blue-800 font-mono">S/N: {item.serialNumber}</div>
                      )}
                      {item.hasScrapExchange && (
                        <div className="text-[10px] text-amber-700 font-semibold">
                          Scrap Exchanged: -₹{item.scrapDeductionPerUnit * item.quantity}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-black text-slate-900 text-sm">₹{item.total}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discounts */}
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold">₹{rawSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {totalScrapDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Old Scrap Exchange Discount:</span>
                  <span>-₹{totalScrapDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Extra Shop Discount */}
              <div className="flex items-center justify-between text-slate-600">
                <span>Special Shop Discount:</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    value={extraDiscount}
                    onChange={(e) => setExtraDiscount(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 text-xs border border-slate-300 rounded text-right font-semibold"
                  />
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t-2 border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Total Net Amount:</span>
                <span className="text-xl font-black text-red-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Mode & Status */}
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Mode:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(['Cash', 'UPI / PhonePe', 'Card', 'Credit (Udhar)'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        paymentMode === mode
                          ? 'border-red-600 bg-red-50 text-red-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid vs Due */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoMatchPaid}
                      onChange={(e) => setAutoMatchPaid(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span>Full Payment Received</span>
                  </label>
                  {!autoMatchPaid && (
                    <div className="flex items-center gap-1">
                      <span>Paid ₹</span>
                      <input
                        type="number"
                        min="0"
                        max={grandTotal}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        className="w-20 px-2 py-0.5 border border-slate-300 rounded text-right font-bold"
                      />
                    </div>
                  )}
                </div>

                {balanceDue > 0 && (
                  <div className="flex justify-between items-center text-red-700 font-bold bg-red-50 p-2 rounded border border-red-200">
                    <span>Balance Due (Udhar/Credit):</span>
                    <span>₹{balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Staff Notes */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (e.g. Free home installation, battery water check)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Submit / Generate Bill */}
              <button
                type="submit"
                disabled={items.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-700/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>Save Sale &amp; Print Bill Slip</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
