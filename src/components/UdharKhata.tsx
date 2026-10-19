import React, { useState } from 'react';
import { MerchantKhataRecord, UdharTransaction } from '../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  IndianRupee, 
  Phone, 
  User, 
  Clock, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  X,
  FileText,
  UserPlus
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface UdharKhataProps {
  khataRecords: MerchantKhataRecord[];
  onAddTransaction: (customerId: string, transaction: UdharTransaction) => void;
  onAddNewCustomer: (newCustomer: MerchantKhataRecord) => void;
  activeEmployee: string;
}

export const UdharKhata: React.FC<UdharKhataProps> = ({
  khataRecords,
  onAddTransaction,
  onAddNewCustomer,
  activeEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Selected customer for viewing history or adding transaction
  const [selectedCustomer, setSelectedCustomer] = useState<MerchantKhataRecord | null>(null);
  
  // Transaction Modal State
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [transType, setTransType] = useState<'credit_given' | 'payment_received'>('payment_received');
  const [transAmount, setTransAmount] = useState<number>(500);
  const [transMode, setTransMode] = useState<UdharTransaction['paymentMode']>('Cash');
  const [transDesc, setTransDesc] = useState('');
  const [transInvoiceNo, setTransInvoiceNo] = useState('');

  // Add Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustType, setNewCustType] = useState<MerchantKhataRecord['type']>('Mechanic');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [initialUdhar, setInitialUdhar] = useState<number>(0);

  // Filtered records
  const filteredRecords = khataRecords.filter((rec) => {
    if (typeFilter !== 'all' && rec.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = rec.customerName.toLowerCase().includes(q);
      const matchPhone = rec.phone.includes(q);
      const matchAddr = (rec.address || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchAddr;
    }
    return true;
  });

  // Calculate totals
  const totalOutstandingDue = khataRecords.reduce((acc, r) => acc + r.balanceDue, 0);

  // Today's stats
  const todayDateStr = new Date().toISOString().split('T')[0];
  let todayUdharGiven = 0;
  let todayPaymentsReceived = 0;

  khataRecords.forEach((rec) => {
    rec.transactions.forEach((t) => {
      if (t.date.startsWith(todayDateStr)) {
        if (t.type === 'credit_given') {
          todayUdharGiven += t.amount;
        } else {
          todayPaymentsReceived += t.amount;
        }
      }
    });
  });

  const handleOpenTransaction = (customer: MerchantKhataRecord, type: 'credit_given' | 'payment_received') => {
    setSelectedCustomer(customer);
    setTransType(type);
    setTransAmount(type === 'payment_received' ? customer.balanceDue : 1000);
    setTransDesc(type === 'credit_given' ? 'Battery / Parts purchased on credit' : 'Cash payment settled');
    setTransInvoiceNo('');
    setIsTransModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || transAmount <= 0) return;

    const newTx: UdharTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: transType,
      amount: Number(transAmount),
      paymentMode: transType === 'payment_received' ? transMode : undefined,
      description: transDesc.trim() || (transType === 'credit_given' ? 'Credit taken' : 'Payment received'),
      invoiceNo: transInvoiceNo.trim() || undefined,
      recordedBy: activeEmployee,
    };

    sounds.playSuccessDing();
    onAddTransaction(selectedCustomer.id, newTx);
    setIsTransModalOpen(false);

    // Refresh selected customer state
    const updatedCustomer = {
      ...selectedCustomer,
      transactions: [newTx, ...selectedCustomer.transactions],
      balanceDue:
        transType === 'credit_given'
          ? selectedCustomer.balanceDue + Number(transAmount)
          : Math.max(0, selectedCustomer.balanceDue - Number(transAmount)),
      totalCreditGiven:
        transType === 'credit_given'
          ? selectedCustomer.totalCreditGiven + Number(transAmount)
          : selectedCustomer.totalCreditGiven,
      totalPaymentReceived:
        transType === 'payment_received'
          ? selectedCustomer.totalPaymentReceived + Number(transAmount)
          : selectedCustomer.totalPaymentReceived,
    };
    setSelectedCustomer(updatedCustomer);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const initialTransactions: UdharTransaction[] = [];
    if (initialUdhar > 0) {
      initialTransactions.push({
        id: `tx-init-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'credit_given',
        amount: Number(initialUdhar),
        description: 'Opening credit balance',
        recordedBy: activeEmployee,
      });
    }

    const newRec: MerchantKhataRecord = {
      id: `cust-${Date.now()}`,
      customerName: newCustName.trim(),
      phone: newCustPhone.trim(),
      type: newCustType,
      address: newCustAddress.trim() || undefined,
      totalCreditGiven: Number(initialUdhar) || 0,
      totalPaymentReceived: 0,
      balanceDue: Number(initialUdhar) || 0,
      lastUpdated: new Date().toISOString(),
      transactions: initialTransactions,
    };

    sounds.playSuccessDing();
    onAddNewCustomer(newRec);

    // Reset
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setInitialUdhar(0);
    setIsAddCustomerOpen(false);
  };

  const handleSendReminder = (customer: MerchantKhataRecord) => {
    const text = `*OM SAI RAM ELECTRICALS - UDHAR STATEMENT*\n` +
      `Namaste ${customer.customerName} ji,\n` +
      `Your current pending balance for battery/electrical goods is *Rs. ${customer.balanceDue}*.\n` +
      `Kindly settle this balance at our store or via PhonePe/GPay.\n` +
      `Thank you!\n` +
      `*Om Sai Ram Electricals - Powering Your Home*`;

    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-800 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Customer &amp; Merchant Credit Ledger</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            DAILY UDHAR &amp; PAYMENTS KHATA BOOK
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Track daily credit given to mechanics and customers, record cash/UPI payments received, and manage balances with 1-click WhatsApp reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-700/30 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Customer / Khata</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Net Udhar Due</span>
          <span className="text-2xl font-black text-red-700 mt-1 block font-mono">
            ₹{totalOutstandingDue.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">{khataRecords.filter(k => k.balanceDue > 0).length} Customers pending</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Today's Udhar Given</span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 mt-1 block font-mono">
            ₹{todayUdharGiven.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">Credit goods disbursed today</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">Today's Received (Wasooli)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">
            ₹{todayPaymentsReceived.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">Cash &amp; UPI payments collected</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Registered Accounts</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
            {khataRecords.length}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">Mechanics, shops &amp; customers</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or shop..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs font-bold">
          {(['all', 'Mechanic', 'Retail Customer', 'Contractor', 'Dealer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All Accounts' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Khata Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((cust) => {
          const hasPending = cust.balanceDue > 0;
          return (
            <div
              key={cust.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                hasPending ? 'border-red-200' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {cust.type}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1.5">
                      {cust.customerName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Balance Due</span>
                    <span
                      className={`text-xl font-black font-mono ${
                        hasPending ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      ₹{cust.balanceDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="text-xs text-slate-600 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.address && (
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      📍 {cust.address}
                    </div>
                  )}
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Udhar</span>
                    <span className="font-bold text-slate-800 font-mono">
                      ₹{cust.totalCreditGiven.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Repaid</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      ₹{cust.totalPaymentReceived.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenTransaction(cust, 'credit_given')}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                    <span>+ Give Udhar</span>
                  </button>

                  <button
                    onClick={() => handleOpenTransaction(cust, 'payment_received')}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ Receive Cash</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCustomer(cust)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    History ({cust.transactions.length})
                  </button>

                  {hasPending && (
                    <button
                      onClick={() => handleSendReminder(cust)}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Send WhatsApp payment reminder"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="p-10 sm:p-14 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          {khataRecords.length === 0 ? (
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Zero Customer Dues • Khata is Clean</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All previous udhar and customer dues have been completely removed. No pending credit balances remain.
              </p>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="mt-4 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>+ Register New Customer / Mechanic</span>
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-bold text-slate-800">No accounts match your search filter</h3>
              <p className="text-xs text-slate-400 mt-1">Try searching a different name, phone number, or area.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Add Udhar or Payment Received */}
      {isTransModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {transType === 'credit_given' ? 'Record New Credit (Udhar Given)' : 'Record Payment Received (Wasooli)'}
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: <strong className="text-slate-800">{selectedCustomer.customerName}</strong> ({selectedCustomer.phone})
                </p>
              </div>
              <button
                onClick={() => setIsTransModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount (₹):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transAmount}
                  onChange={(e) => setTransAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xl font-black font-mono border-2 border-slate-300 rounded-xl focus:border-red-600 focus:outline-none"
                />
              </div>

              {transType === 'payment_received' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['Cash', 'UPI / PhonePe', 'Bank Transfer'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTransMode(m)}
                        className={`py-2 rounded-lg font-bold border ${
                          transMode === m
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Items Purchased:
                </label>
                <input
                  type="text"
                  value={transDesc}
                  onChange={(e) => setTransDesc(e.target.value)}
                  placeholder="e.g. 150Ah Livguard battery remaining payment"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bill / Invoice No (Optional):
                </label>
                <input
                  type="text"
                  value={transInvoiceNo}
                  onChange={(e) => setTransInvoiceNo(e.target.value)}
                  placeholder="e.g. OSR-2026-1043"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 text-xs font-bold text-white rounded-xl shadow cursor-pointer ${
                    transType === 'credit_given'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View History Ledger for Selected Customer */}
      {selectedCustomer && !isTransModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{selectedCustomer.customerName} - Ledger</h3>
                <p className="text-xs text-slate-400">
                  Phone: {selectedCustomer.phone} • Net Balance: <strong className="text-red-400 font-mono">₹{selectedCustomer.balanceDue}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {selectedCustomer.transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No transactions recorded yet.</div>
              ) : (
                selectedCustomer.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      tx.type === 'credit_given'
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-emerald-50/50 border-emerald-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {tx.type === 'credit_given' ? (
                          <span className="text-red-700 font-black">🔴 Credit Given (Udhar)</span>
                        ) : (
                          <span className="text-emerald-700 font-black">🟢 Payment Received (Jama)</span>
                        )}
                        {tx.paymentMode && (
                          <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border text-slate-600">
                            {tx.paymentMode}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{tx.description}</p>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{new Date(tx.date).toLocaleDateString('en-IN')} {new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>• By: {tx.recordedBy}</span>
                        {tx.invoiceNo && <span className="font-mono text-blue-700">Bill: {tx.invoiceNo}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-black font-mono ${
                          tx.type === 'credit_given' ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {tx.type === 'credit_given' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                onClick={() => handleSendReminder(selectedCustomer)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send WhatsApp Reminder</span>
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New Customer / Merchant Account */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Khata / Customer Account</h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer / Merchant Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Pappu Auto Garage / Rajesh Soni"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 98270 12345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Category</label>
                <select
                  value={newCustType}
                  onChange={(e) => setNewCustType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Mechanic">Mechanic (Two-wheeler / Auto Garage)</option>
                  <option value="Retail Customer">Retail Customer (Regular Home)</option>
                  <option value="Contractor">Electrician / Contractor</option>
                  <option value="Dealer">Sub-dealer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shop / Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Bypass Road, Near Railway Crossing"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Opening Udhar Balance (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={initialUdhar}
                  onChange={(e) => setInitialUdhar(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="flex-1 py-2 font-bold text-slate-600 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
