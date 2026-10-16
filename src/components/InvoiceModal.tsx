import React from 'react';
import { CustomerSale } from '../types';
import { OmSaiRamLogo } from './OmSaiRamLogo';
import { X, Printer, Share2, CheckCircle2, ShieldCheck, Phone, MapPin } from 'lucide-react';

interface InvoiceModalProps {
  sale: CustomerSale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, isOpen, onClose }) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*OM SAI RAM ELECTRICALS - BILL RECEIPT*\n` +
      `Invoice: ${sale.invoiceNo}\n` +
      `Date: ${new Date(sale.date).toLocaleDateString('en-IN')}\n` +
      `Customer: ${sale.customerName} (${sale.customerPhone})\n` +
      `------------------------\n` +
      sale.items.map(it => `• ${it.productName} (${it.capacityValue}${it.capacityUnit}) x${it.quantity} - Rs.${it.total}${it.serialNumber ? `\n  S/N: ${it.serialNumber}` : ''}${it.hasScrapExchange ? ` (Scrap Off: -Rs.${it.scrapDeductionPerUnit * it.quantity})` : ''}`).join('\n') +
      `\n------------------------\n` +
      `*Grand Total: Rs. ${sale.grandTotal}*\n` +
      `Paid: Rs. ${sale.paidAmount} | Status: ${sale.paymentStatus}\n` +
      `Thank you for choosing Om Sai Ram Electricals - Powering Your Home!`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Customer Bill &amp; Warranty Slip</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Paper Canvas */}
        <div className="p-8 print:p-6 bg-white text-slate-900" id="printable-invoice">
          {/* Header with Logo */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-red-600 pb-5 gap-4">
            <OmSaiRamLogo size="md" variant="horizontal" />

            <div className="text-center sm:text-right text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900 text-sm">MAIN SHOWROOM &amp; SERVICE HUB</p>
              <p className="flex items-center justify-center sm:justify-end gap-1">
                <MapPin className="w-3 h-3 text-red-600" />
                <span>Shop No. 12, Power House Road, Main Chowk</span>
              </p>
              <p className="flex items-center justify-center sm:justify-end gap-1">
                <Phone className="w-3 h-3 text-red-600" />
                <span>Phone: +91 98271 54321 / 94250 12345</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: 23AABCO1234F1Z9 (Dealer Code: OSR-88)</p>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Invoice Number</span>
              <span className="font-black text-slate-900 text-sm font-mono">{sale.invoiceNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Date &amp; Time</span>
              <span className="font-medium text-slate-800">
                {new Date(sale.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                {new Date(sale.date).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Billed By</span>
              <span className="font-semibold text-slate-800">{sale.employeeName}</span>
            </div>

            {/* Customer Details */}
            <div className="col-span-2 sm:col-span-2 pt-1">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Customer Information</span>
              <span className="font-bold text-slate-900 text-sm">{sale.customerName}</span>
              <span className="text-slate-600 ml-2 font-mono">📱 {sale.customerPhone}</span>
              {sale.customerAddress && (
                <p className="text-slate-500 text-[11px] mt-0.5">📍 {sale.customerAddress}</p>
              )}
            </div>

            {sale.vehicleOrApplianceModel && (
              <div className="pt-1">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Vehicle / Load</span>
                <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {sale.vehicleOrApplianceModel}
                </span>
              </div>
            )}
          </div>

          {/* Items Purchased Table */}
          <div className="mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-[11px] font-bold text-slate-700 uppercase bg-slate-50">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Item Description &amp; Capacity</th>
                  <th className="py-2.5 px-2">Battery S/N (Warranty)</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-right">Scrap Less</th>
                  <th className="py-2.5 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-2 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="font-semibold text-red-700 bg-red-50 px-1.5 py-0.2 rounded">
                          {item.capacityValue} {item.capacityUnit}
                        </span>
                        <span>Brand: {item.brand}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono text-[11px]">
                      {item.serialNumber ? (
                        <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.serialNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-semibold">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-2 text-right font-semibold text-amber-700">
                      {item.hasScrapExchange ? `-₹${(item.scrapDeductionPerUnit * item.quantity).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-black text-slate-900">
                      ₹{item.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="mt-5 pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Warranty Policy:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                1. Preserve this invoice for warranty replacement claim.<br />
                2. Warranty will be void if serial number is scratched or battery physical damage is found.<br />
                3. Lead acid tubular batteries require distilled water top-up every 45-60 days.
              </p>
              {sale.notes && (
                <div className="p-2 rounded bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900">
                  <strong>Staff Note:</strong> {sale.notes}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Items Value:</span>
                <span className="font-semibold">₹{sale.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {sale.totalScrapDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Old Battery Scrap Exchange Less:</span>
                  <span>-₹{sale.totalScrapDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {sale.extraDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Discount:</span>
                  <span>-₹{sale.extraDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Grand Total Payable:</span>
                <span className="text-lg font-black text-red-700">₹{sale.grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-200 grid grid-cols-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Payment Mode:</span>
                  <span className="font-bold text-slate-800">{sale.paymentMode}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Status:</span>
                  <span
                    className={`font-black ${
                      sale.paymentStatus === 'Paid'
                        ? 'text-emerald-700'
                        : sale.paymentStatus === 'Partial'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {sale.paymentStatus} {sale.dueAmount > 0 ? `(Due: ₹${sale.dueAmount})` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span>Customer Signature</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 text-xs mb-6">OM SAI RAM ELECTRICALS</p>
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span>Authorized Signatory / Stamp</span>
            </div>
          </div>
        </div>

        {/* Footer info for employee */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 print:hidden">
          <span>Printed copies have official serial stamps for warranty.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
