import React, { useState } from 'react';
import { CustomerSale, StockPurchase, Product, ActivityLog, MerchantKhataRecord } from '../types';
import { 
  ShieldCheck, 
  TrendingUp, 
  IndianRupee, 
  ShoppingCart, 
  Users, 
  Clock, 
  Lock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  AlertTriangle,
  FileText,
  DollarSign,
  Filter,
  RotateCcw,
  Zap
} from 'lucide-react';

interface OwnerDashboardProps {
  sales: CustomerSale[];
  purchases: StockPurchase[];
  products: Product[];
  khataRecords: MerchantKhataRecord[];
  activityLogs: ActivityLog[];
  onLockOwner: () => void;
  onResetStore?: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  sales,
  purchases,
  products,
  khataRecords,
  activityLogs,
  onLockOwner,
  onResetStore,
}) => {
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Filter logs
  const filteredLogs = activityLogs.filter((log) => {
    if (filterStaff !== 'all' && log.performedBy !== filterStaff) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    return true;
  });

  // Unique staff list
  const staffMembers = Array.from(new Set(activityLogs.map((l) => l.performedBy))).filter(Boolean);

  // Today's Sales Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date.startsWith(todayStr));

  const todayGrossSales = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
  const todayCashCollected = todaySales
    .filter((s) => s.paymentMode === 'Cash')
    .reduce((acc, s) => acc + s.paidAmount, 0);
  const todayUPICollected = todaySales
    .filter((s) => s.paymentMode.includes('UPI'))
    .reduce((acc, s) => acc + s.paidAmount, 0);
  const todayUdharGiven = todaySales
    .filter((s) => s.dueAmount > 0)
    .reduce((acc, s) => acc + s.dueAmount, 0);

  // Today's Profit Estimate (Sell Price - Purchase Price)
  let todayEstimatedProfit = 0;
  todaySales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.purchasePrice > 0) {
        todayEstimatedProfit += (item.unitPrice - prod.purchasePrice) * item.quantity;
      }
    });
  });

  // Total Outstanding Udhar across store
  const totalStoreUdhar = khataRecords.reduce((acc, k) => acc + k.balanceDue, 0);

  // Total Inventory Value
  const totalStockValuation = products.reduce((acc, p) => acc + (p.purchasePrice * p.stock), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.sellPrice * p.stock), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Lock / Logout */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-red-600/40">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5 text-red-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>CONFIDENTIAL OWNER CONTROL CENTER • PIN: 9766208407</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-black text-emerald-300">
              <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>LIVE STAFF SYNC ACTIVE</span>
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            DAILY STORE AUDIT &amp; STAFF ACTIVITY TRACKER
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Real-time live updates whenever staff generates a bill, updates customer dues, or sells batteries. All changes sync bidirectionally without page reload.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onResetStore && (
            <button
              onClick={onResetStore}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Reset store data to clean slate"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Reset Store Data</span>
            </button>
          )}

          <button
            onClick={onLockOwner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow"
          >
            <Lock className="w-4 h-4 text-red-400" />
            <span>Lock &amp; Exit Owner Mode</span>
          </button>
        </div>
      </div>

      {/* Financial Overview (Confidential - Visible Only to Owner) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Today's Total Sales</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              {todaySales.length} Bills
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block font-mono">
            ₹{todayGrossSales.toLocaleString('en-IN')}
          </span>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Cash: ₹{todayCashCollected}</span>
            <span>UPI: ₹{todayUPICollected}</span>
          </div>
        </div>

        {/* Estimated Profit */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Today's Gross Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-2 block font-mono">
            +₹{todayEstimatedProfit.toLocaleString('en-IN')}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">
            Calculated from customer selling price minus wholesale dealer cost
          </p>
        </div>

        {/* Store Udhar */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase">Total Market Udhar (Dues)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-red-700 mt-2 block font-mono">
            ₹{totalStoreUdhar.toLocaleString('en-IN')}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">
            Total credit pending from mechanics &amp; customers
          </p>
        </div>

        {/* Stock Valuation */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Shop Stock Value</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block font-mono">
            ₹{totalStockValuation.toLocaleString('en-IN')}
          </span>
          <div className="text-[10px] text-slate-500 mt-1">
            Retail potential: <strong className="text-slate-800">₹{totalRetailValuation.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      {/* Staff Activity Tracker Log (Real Time Audit) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <span>Real-Time Staff Activity &amp; Audit Log</span>
            </h3>
            <p className="text-xs text-slate-500">
              Tracks every bill created, product added/deleted, stock adjusted, and payment entered by staff.
            </p>
          </div>

          {/* Filter Staff & Action */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold"
            >
              <option value="all">All Staff Members ({staffMembers.length})</option>
              {staffMembers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold"
            >
              <option value="all">All Actions</option>
              <option value="sale_created">Customer Sales Billed</option>
              <option value="payment_received">Udhar Payments Received</option>
              <option value="product_added">New Products Added</option>
              <option value="product_deleted">Products Deleted</option>
              <option value="stock_adjusted">Stock Counts Adjusted</option>
              <option value="price_updated">Prices Updated</option>
            </select>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No activity logs recorded yet. All staff actions will automatically appear here.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSale = log.action === 'sale_created';
              const isPayment = log.action === 'payment_received';
              const isDelete = log.action === 'product_deleted';
              const isAdd = log.action === 'product_added';

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-start justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isSale
                          ? 'bg-red-100 text-red-700'
                          : isPayment
                          ? 'bg-emerald-100 text-emerald-700'
                          : isDelete
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isSale ? (
                        <ShoppingCart className="w-4 h-4" />
                      ) : isPayment ? (
                        <IndianRupee className="w-4 h-4" />
                      ) : isDelete ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{log.title}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                          {log.performedBy}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{log.details}</p>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">
                        {new Date(log.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {log.amount && (
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ₹{log.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
