import React, { useState } from 'react';
import { Product, SaleItem } from '../types';
import { Calculator, BatteryCharging, Zap, ArrowRight, ShieldCheck, Check, Sparkles, ShoppingCart } from 'lucide-react';

interface CounterCalculatorProps {
  products: Product[];
  onTransferToBill: (items: SaleItem[]) => void;
}

export const CounterCalculator: React.FC<CounterCalculatorProps> = ({
  products,
  onTransferToBill,
}) => {
  const batteries = products.filter((p) => p.category === 'inverter_battery');
  const inverters = products.filter((p) => p.category === 'inverter_ups');

  const [selectedBatteryId, setSelectedBatteryId] = useState<string>(batteries[0]?.id || '');
  const [selectedInverterId, setSelectedInverterId] = useState<string>(inverters[0]?.id || '');
  
  const [includeOldScrap, setIncludeOldScrap] = useState<boolean>(true);
  const [scrapRating, setScrapRating] = useState<number>(150);
  const [customScrapPrice, setCustomScrapPrice] = useState<number>(2500);

  const [includeTrolley, setIncludeTrolley] = useState<boolean>(true);
  const [trolleyPrice] = useState<number>(950);

  const [includeDistilledWater, setIncludeDistilledWater] = useState<boolean>(true);
  const [waterPrice] = useState<number>(150);

  const selectedBattery = products.find((p) => p.id === selectedBatteryId);
  const selectedInverter = products.find((p) => p.id === selectedInverterId);

  // Auto set scrap price based on scrap rating
  const handleScrapRatingChange = (ah: number) => {
    setScrapRating(ah);
    if (ah === 100) setCustomScrapPrice(1800);
    else if (ah === 150) setCustomScrapPrice(2500);
    else if (ah === 180) setCustomScrapPrice(2900);
    else if (ah === 200) setCustomScrapPrice(3300);
    else if (ah === 220) setCustomScrapPrice(3600);
    else setCustomScrapPrice(100);
  };

  // Calculations
  const batteryCost = selectedBattery?.sellPrice || 0;
  const inverterCost = selectedInverter?.sellPrice || 0;
  const accessoriesCost = (includeTrolley ? trolleyPrice : 0) + (includeDistilledWater ? waterPrice : 0);
  const scrapDeduction = includeOldScrap ? customScrapPrice : 0;
  
  const grossTotal = batteryCost + inverterCost + accessoriesCost;
  const netPayable = Math.max(0, grossTotal - scrapDeduction);

  // Approximate backup calculator
  // (Battery Ah * 12V * 0.8 efficiency) / Watts
  const batteryAh = selectedBattery?.capacityValue || 150;
  const backupHoursForTypicalLoad = ((batteryAh * 12 * 0.8) / 320).toFixed(1); // 320W ~ 3 fans + 3 bulbs + 1 TV

  const handlePushToBill = () => {
    const saleItems: SaleItem[] = [];

    if (selectedBattery) {
      saleItems.push({
        productId: selectedBattery.id,
        productName: selectedBattery.name,
        brand: selectedBattery.brand,
        category: selectedBattery.category,
        capacityValue: selectedBattery.capacityValue,
        capacityUnit: selectedBattery.capacityUnit,
        unitPrice: selectedBattery.sellPrice,
        quantity: 1,
        hasScrapExchange: includeOldScrap,
        scrapAh: scrapRating,
        scrapDeductionPerUnit: includeOldScrap ? customScrapPrice : 0,
        total: Math.max(0, selectedBattery.sellPrice - (includeOldScrap ? customScrapPrice : 0)),
      });
    }

    if (selectedInverter) {
      saleItems.push({
        productId: selectedInverter.id,
        productName: selectedInverter.name,
        brand: selectedInverter.brand,
        category: selectedInverter.category,
        capacityValue: selectedInverter.capacityValue,
        capacityUnit: selectedInverter.capacityUnit,
        unitPrice: selectedInverter.sellPrice,
        quantity: 1,
        hasScrapExchange: false,
        scrapDeductionPerUnit: 0,
        total: selectedInverter.sellPrice,
      });
    }

    onTransferToBill(saleItems);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Counter Quick Quotation Tool</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            BATTERY (Ah) + INVERTER (VA) COMBO ESTIMATOR
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Give customers an immediate price quote on the counter including battery Ah, inverter VA, old scrap deduction, trolley, and backup time.
          </p>
        </div>

        <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-xl flex items-center gap-3">
          <Calculator className="w-8 h-8 text-red-400" />
          <div className="text-right">
            <span className="text-[10px] text-red-200 uppercase font-bold block">Instant Net Quote</span>
            <span className="text-2xl font-black text-white font-mono">₹{netPayable.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Product Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Inverter Battery (Ah) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-red-600" />
                <span>1. Choose Tubular Battery (Ah)</span>
              </h3>
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                Unit: Ah (Ampere-Hour)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {batteries.map((bat) => {
                const isSelected = selectedBatteryId === bat.id;
                return (
                  <div
                    key={bat.id}
                    onClick={() => setSelectedBatteryId(bat.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-900 text-white">
                          {bat.brand}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{bat.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-black text-xs">
                        {bat.capacityValue} Ah
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">{bat.warrantyMonths}M Warranty</span>
                      <span className="text-sm font-black text-red-700 font-mono">
                        ₹{bat.sellPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Inverter / UPS (VA) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>2. Choose Inverter / UPS (VA)</span>
              </h3>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Unit: VA (Volt-Ampere)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inverters.map((inv) => {
                const isSelected = selectedInverterId === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInverterId(inv.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-900 text-white">
                          {inv.brand}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{inv.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-black text-xs">
                        {inv.capacityValue} VA
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">{inv.warrantyMonths}M Warranty</span>
                      <span className="text-sm font-black text-blue-800 font-mono">
                        ₹{inv.sellPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Old Battery Scrap Exchange */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOldScrap}
                  onChange={(e) => setIncludeOldScrap(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600"
                />
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. Old Battery Scrap Exchange (Deduct from Total)
                </span>
              </label>

              {includeOldScrap && (
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  -₹{customScrapPrice} Off
                </span>
              )}
            </div>

            {includeOldScrap && (
              <div className="space-y-3 pt-2">
                <span className="block text-xs font-semibold text-slate-600">
                  Select Old Battery Rating (Ah):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[100, 150, 180, 200, 220].map((ah) => (
                    <button
                      key={ah}
                      type="button"
                      onClick={() => handleScrapRatingChange(ah)}
                      className={`p-2 rounded-xl text-center border font-bold text-xs transition-colors ${
                        scrapRating === ah
                          ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>{ah} Ah</div>
                      <div className="text-[10px] text-amber-700 font-normal">
                        ₹{ah === 100 ? 1800 : ah === 150 ? 2500 : ah === 180 ? 2900 : ah === 200 ? 3300 : 3600}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600">Custom Exchange Scrap Rate:</span>
                  <div className="flex items-center gap-1 font-bold">
                    <span>₹</span>
                    <input
                      type="number"
                      value={customScrapPrice}
                      onChange={(e) => setCustomScrapPrice(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-xs border border-slate-300 rounded text-right font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Quotation Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-red-500 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Quotation Breakdown
              </span>
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                Om Sai Ram Electricals
              </span>
            </div>

            {/* Line items */}
            <div className="mt-4 space-y-3 text-xs">
              {/* Battery */}
              {selectedBattery ? (
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 block">{selectedBattery.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      {selectedBattery.capacityValue} Ah • {selectedBattery.warrantyMonths}M Warranty
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">₹{batteryCost.toLocaleString('en-IN')}</span>
                </div>
              ) : null}

              {/* Inverter */}
              {selectedInverter ? (
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 block">{selectedInverter.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      {selectedInverter.capacityValue} VA • Pure Sine Wave
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">₹{inverterCost.toLocaleString('en-IN')}</span>
                </div>
              ) : null}

              {/* Optional Accessories */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeTrolley}
                      onChange={(e) => setIncludeTrolley(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span className="text-slate-700">Heavy Inverter Trolley Stand</span>
                  </div>
                  <span className="font-medium text-slate-800">₹{trolleyPrice}</span>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeDistilledWater}
                      onChange={(e) => setIncludeDistilledWater(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span className="text-slate-700">Distilled Battery Water (5 Litre Jar)</span>
                  </div>
                  <span className="font-medium text-slate-800">₹{waterPrice}</span>
                </label>
              </div>

              {/* Gross Total */}
              <div className="pt-3 border-t border-slate-200 flex justify-between text-slate-600 font-semibold">
                <span>Subtotal Combo:</span>
                <span>₹{grossTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Scrap deduction */}
              {includeOldScrap && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Old {scrapRating}Ah Scrap Exchange:</span>
                  <span>-₹{scrapDeduction.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Net Customer Payable */}
              <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900 block">Net Customer Pay:</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Includes GST &amp; Free Setup</span>
                </div>
                <span className="text-2xl font-black text-red-700 font-mono">
                  ₹{netPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Estimated Backup info */}
            <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Estimated Home Backup:</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Will run <strong className="text-slate-900">3 Fans + 3 LED Bulbs + 1 LED TV</strong> for approx{' '}
                <strong className="text-red-700 font-bold">{backupHoursForTypicalLoad} to {Number(backupHoursForTypicalLoad) + 1.5} Hours</strong> during power cut.
              </p>
            </div>

            {/* Action: Transfer directly to billing */}
            <button
              onClick={handlePushToBill}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-700/30 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Bill This Customer Combo Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
