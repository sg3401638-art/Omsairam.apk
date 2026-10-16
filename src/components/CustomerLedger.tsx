import React, { useState } from 'react';
import { CustomerSale, StockPurchase, ScrapInventoryItem } from '../types';
import { 
  FileText, 
  Search, 
  Printer, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  User, 
  ShieldCheck, 
  IndianRupee, 
  Recycle, 
  Truck, 
  Calendar,
  Eye
} from 'lucide-react';

interface CustomerLedgerProps {
  sales: CustomerSale[];
  purchases: StockPurchase[];
  scrapInventory: ScrapInventoryItem[];
  onViewInvoice: (sale: CustomerSale) => void;
  onSettleDue: (saleId: string, amountCollected: number) => void;
}

export const CustomerLedger: React.FC<CustomerLedgerProps> = ({
  sales,
  purchases,
  scrapInventory,
  onViewInvoice,
  onSettleDue,
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases' | 'scrap' | 'dues'>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Payment settlement modal state
  const [settlingSaleId, setSettlingSaleId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);

  // Filter sales
  const filteredSales = sales.filter((sale) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = sale.customerName.toLowerCase().includes(q);
    const matchPhone = sale.customerPhone.includes(q);
    const matchInvoice = sale.invoiceNo.toLowerCase().includes(q);
    const matchSerial = sale.items.some((it) => (it.serialNumber || '').toLowerCase().includes(q));
    const matchProduct = sale.items.some((it) => it.productName.toLowerCase().includes(q));
    return matchName || matchPhone || matchInvoice || matchSerial || matchProduct;
  });

  // Filter dues
  const dueSales = sales.filter((s) => s.dueAmount > 0);

  // Filter purchases
  const filteredPurchases = purchases.filter((pur) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchSup = pur.supplierName.toLowerCase().includes(q);
    const matchBill = pur.purchaseBillNo.toLowerCase().includes(q);
    const matchItem = pur.items.some((it) => it.productName.toLowerCase().includes(q));
    return matchSup || matchBill || matchItem;
  });

  const handleOpenSettle = (sale: CustomerSale) => {
    setSettlingSaleId(sale.id);
    setSettleAmount(sale.dueAmount);
  };

  const handleConfirmSettle = () => {
    if (settlingSaleId && settleAmount > 0) {
      onSettleDue(settlingSaleId, settleAmount);
    }
    setSettlingSaleId(null);
  };

  const totalDuesOutstanding = dueSales.reduce((acc, s) => acc + s.dueAmount, 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalScrapBatteries = scrapInventory.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">Total Sales Billed</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              ₹{totalSalesRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold">{sales.length} Bills Issued</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">Customer Dues (Khata)</span>
            <span className="text-2xl font-black text-red-700 mt-1 block">
              ₹{totalDuesOutstanding.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-amber-700 font-bold">{dueSales.length} Pending Customers</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">Old Scrap Battery Stock</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block">
              {totalScrapBatteries} Units
            </span>
            <span className="text-[11px] text-slate-500">In shop storage for scrap dealer</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Recycle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sales'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Customer Sales Bills ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dues'
                ? 'bg-red-600 text-white shadow'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Pending Dues / Khata ({dueSales.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'purchases'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Stock Purchases ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab('scrap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scrap'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Scrap Battery Inventory
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phone, customer, or serial no..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1 & 2: Sales Bills & Dues */}
      {(activeTab === 'sales' || activeTab === 'dues') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Invoice No &amp; Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Purchased Items &amp; S/N</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status / Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'dues' ? dueSales : filteredSales).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Invoice & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono">{sale.invoiceNo}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(sale.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{sale.employeeName}</span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sale.customerName}</div>
                      <div className="text-slate-600 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{sale.customerPhone}</span>
                      </div>
                      {sale.vehicleOrApplianceModel && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          App: {sale.vehicleOrApplianceModel}
                        </div>
                      )}
                    </td>

                    {/* Items & Serial Numbers */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1">
                        {sale.items.map((it, i) => (
                          <div key={i} className="text-[11px] leading-tight">
                            <span className="font-semibold text-slate-800">
                              {it.productName} ({it.capacityValue} {it.capacityUnit}) ×{it.quantity}
                            </span>
                            {it.serialNumber && (
                              <div className="text-[10px] text-blue-800 font-mono flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" />
                                <span>S/N: {it.serialNumber}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-black text-slate-900 text-sm">
                        ₹{sale.grandTotal.toLocaleString('en-IN')}
                      </div>
                      {sale.totalScrapDiscount > 0 && (
                        <div className="text-[10px] text-amber-700 font-semibold">
                          Scrap: -₹{sale.totalScrapDiscount}
                        </div>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sale.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 font-semibold">{sale.paymentMode}</div>
                      {sale.dueAmount > 0 && (
                        <div className="text-[11px] text-red-700 font-black mt-0.5">
                          Due: ₹{sale.dueAmount}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                          title="View & Print Bill"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Bill</span>
                        </button>

                        {sale.dueAmount > 0 && (
                          <button
                            onClick={() => handleOpenSettle(sale)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                          >
                            <span>Settle</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(activeTab === 'dues' ? dueSales : filteredSales).length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No bills found matching your search.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Stock Purchases */}
      {activeTab === 'purchases' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Bill No &amp; Date</th>
                  <th className="py-3 px-4">Supplier / Source</th>
                  <th className="py-3 px-4">Items Received</th>
                  <th className="py-3 px-4 text-right">Total Inflow Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Received By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono">{pur.purchaseBillNo}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(pur.date).toLocaleDateString('en-IN')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{pur.supplierName}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                        {pur.type === 'distributor_stock' ? 'Depot Stock' : 'Scrap Buyback'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="space-y-1">
                        {pur.items.map((it, i) => (
                          <div key={i} className="text-[11px]">
                            <span className="font-semibold text-slate-800">{it.productName}</span> ×{' '}
                            <strong>{it.quantity}</strong> (Rate: ₹{it.unitCost})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      ₹{pur.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          pur.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pur.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                      {pur.receivedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Scrap Inventory */}
      {activeTab === 'scrap' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Recycle className="w-5 h-5 text-amber-700" />
              <div>
                <strong className="block text-sm">Shop Scrap Yard Tracker</strong>
                <span>
                  Old scrap batteries returned by customers during sales or purchased directly. Ready for bulk lead recycling pickup.
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-amber-900 block">{totalScrapBatteries} Units</span>
              <span className="text-[11px] text-amber-700">Total in Shop</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {scrapInventory.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {item.type}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-2">{item.ahRating} Ah Rating</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Average buy rate: ₹{item.averageBuyRate}/unit</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">In Stock:</span>
                  <span className="text-xl font-black text-slate-900 font-mono">{item.quantity} Units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      {settlingSaleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Collect Due Payment</h3>
            <p className="text-xs text-slate-500">
              Enter amount collected from customer to clear or reduce their pending balance.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount Received (₹):
              </label>
              <input
                type="number"
                min="1"
                value={settleAmount}
                onChange={(e) => setSettleAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-base font-bold border border-slate-300 rounded-xl font-mono text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSettlingSaleId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSettle}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
