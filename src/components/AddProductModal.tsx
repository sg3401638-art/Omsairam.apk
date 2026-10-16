import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CapacityUnit } from '../types';
import { X, Plus, Save, BatteryCharging, Zap, Lightbulb, Bike, Car, Wrench, AlertCircle } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [category, setCategory] = useState<ProductCategory>('inverter_battery');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Livguard');
  const [modelNumber, setModelNumber] = useState('');
  const [capacityValue, setCapacityValue] = useState<number>(150);
  const [capacityUnit, setCapacityUnit] = useState<CapacityUnit>('Ah');
  const [mrp, setMrp] = useState<number>(18000);
  const [sellPrice, setSellPrice] = useState<number>(14000);
  const [purchasePrice, setPurchasePrice] = useState<number>(12000);
  const [scrapValue, setScrapValue] = useState<number>(2500);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(60);
  const [warrantyDetails, setWarrantyDetails] = useState('36 Months Free + 24 Months Pro-rata');
  const [stock, setStock] = useState<number>(5);
  const [minStockAlert, setMinStockAlert] = useState<number>(2);
  const [shelfLocation, setShelfLocation] = useState('Bay A');
  const [description, setDescription] = useState('');

  // When editing or category changes, set sensible defaults
  useEffect(() => {
    if (initialProduct) {
      setCategory(initialProduct.category);
      setName(initialProduct.name);
      setBrand(initialProduct.brand);
      setModelNumber(initialProduct.modelNumber || '');
      setCapacityValue(initialProduct.capacityValue);
      setCapacityUnit(initialProduct.capacityUnit);
      setMrp(initialProduct.mrp);
      setSellPrice(initialProduct.sellPrice);
      setPurchasePrice(initialProduct.purchasePrice);
      setScrapValue(initialProduct.scrapValue);
      setWarrantyMonths(initialProduct.warrantyMonths);
      setWarrantyDetails(initialProduct.warrantyDetails || '');
      setStock(initialProduct.stock);
      setMinStockAlert(initialProduct.minStockAlert);
      setShelfLocation(initialProduct.shelfLocation || '');
      setDescription(initialProduct.description || '');
    }
  }, [initialProduct]);

  // Handle Category selection change to auto-set appropriate unit & scrap values
  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    if (!initialProduct) {
      if (newCat === 'inverter_battery') {
        setCapacityUnit('Ah');
        setCapacityValue(150);
        setScrapValue(2500);
        setWarrantyMonths(60);
        setWarrantyDetails('36 Months Free + 24 Months Pro-rata');
        setBrand('Livguard');
        setMrp(18900);
        setSellPrice(14400);
        setPurchasePrice(12200);
      } else if (newCat === 'inverter_ups') {
        setCapacityUnit('VA');
        setCapacityValue(1100);
        setScrapValue(350);
        setWarrantyMonths(24);
        setWarrantyDetails('24 Months Onsite Warranty');
        setBrand('Livguard');
        setMrp(9600);
        setSellPrice(7100);
        setPurchasePrice(5900);
      } else if (newCat === 'two_wheeler') {
        setCapacityUnit('Ah');
        setCapacityValue(5);
        setScrapValue(110);
        setWarrantyMonths(48);
        setWarrantyDetails('24M Free + 24M Pro-rata');
        setBrand('Livguard');
        setMrp(1650);
        setSellPrice(1280);
        setPurchasePrice(1020);
      } else if (newCat === 'four_wheeler') {
        setCapacityUnit('Ah');
        setCapacityValue(35);
        setScrapValue(700);
        setWarrantyMonths(48);
        setWarrantyDetails('24M Free + 24M Pro-rata');
        setBrand('Livguard');
        setMrp(5200);
        setSellPrice(4100);
        setPurchasePrice(3250);
      } else if (newCat === 'bulb_lighting') {
        setCapacityUnit('W');
        setCapacityValue(9);
        setScrapValue(0);
        setWarrantyMonths(12);
        setWarrantyDetails('1 Year OTC Guarantee');
        setBrand('Livguard');
        setMrp(140);
        setSellPrice(80);
        setPurchasePrice(55);
      } else {
        setCapacityUnit('Pcs');
        setCapacityValue(1);
        setScrapValue(0);
        setWarrantyMonths(24);
        setWarrantyDetails('2 Years Guarantee');
        setBrand('Polycab');
        setMrp(1200);
        setSellPrice(950);
        setPurchasePrice(760);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      category,
      modelNumber: modelNumber.trim(),
      capacityValue: Number(capacityValue) || 0,
      capacityUnit,
      mrp: Number(mrp) || 0,
      sellPrice: Number(sellPrice) || 0,
      purchasePrice: Number(purchasePrice) || 0,
      scrapValue: Number(scrapValue) || 0,
      warrantyMonths: Number(warrantyMonths) || 0,
      warrantyDetails: warrantyDetails.trim(),
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 2,
      shelfLocation: shelfLocation.trim(),
      description: description.trim(),
    };

    onSave(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/30 border border-red-500/40 text-red-400">
              {initialProduct ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {initialProduct ? 'Edit Product & Pricing' : 'Add New Product to Store'}
              </h2>
              <p className="text-xs text-slate-300">
                Om Sai Ram Electricals • Product Catalog Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Select Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Product Category Section:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('inverter_battery')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  category === 'inverter_battery'
                    ? 'border-red-600 bg-red-50 text-red-900 font-bold ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <BatteryCharging className="w-4 h-4 text-red-600 shrink-0" />
                <span className="text-xs">Inverter Battery (Ah)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('inverter_ups')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  category === 'inverter_ups'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs">Inverter / UPS (VA)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('two_wheeler')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  category === 'two_wheeler'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Bike className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs">2W Bike Battery (Ah)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('four_wheeler')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  category === 'four_wheeler'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs">Car / 4W Battery (Ah)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('bulb_lighting')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  category === 'bulb_lighting'
                    ? 'border-yellow-600 bg-yellow-50 text-yellow-900 font-bold ring-2 ring-yellow-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-yellow-600 shrink-0" />
                <span className="text-xs">Bulb &amp; Lighting (W)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('electrical_thing')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  category === 'electrical_thing'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold ring-2 ring-purple-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Wrench className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs">Wires, Fans &amp; MCB</span>
              </button>
            </div>
          </div>

          {/* Product Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name / Model Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Livguard Invertuff IT 1560TT"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Manufacturer * (Store Authorized Only)
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                {(['Livguard', 'James', 'Massimo'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      brand === b
                        ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              >
                <option value="Livguard">Livguard</option>
                <option value="James">James</option>
                <option value="Massimo">Massimo</option>
              </select>
            </div>
          </div>

          {/* Capacity Value & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Rating / Capacity *
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={capacityValue}
                onChange={(e) => setCapacityValue(Number(e.target.value))}
                placeholder="150"
                className="w-full px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Unit (Ah / VA / Watts) *
              </label>
              <select
                value={capacityUnit}
                onChange={(e) => setCapacityUnit(e.target.value as CapacityUnit)}
                className="w-full px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              >
                <option value="Ah">Ah (Ampere-Hour for Batteries)</option>
                <option value="VA">VA (Volt-Ampere for Inverters)</option>
                <option value="W">W (Watts for Bulbs / Tubes)</option>
                <option value="Pcs">Pcs (Fans, Sockets, MCBs)</option>
                <option value="Mtr">Mtr (Wire Bundles)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Model / Code Number
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. RC-18000TT"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Price Details (₹ Rupees):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">MRP</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-sm border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-red-700 mb-1">Customer Sell Price *</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-red-600 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-sm border-2 border-red-500 rounded-lg font-black text-red-700 bg-red-50/30"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">Dealer Purchase Cost</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-sm border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-amber-700 mb-1">Old Scrap Value (Off)</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-amber-600 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={scrapValue}
                    onChange={(e) => setScrapValue(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-sm border border-amber-300 rounded-lg font-semibold bg-amber-50/40 text-amber-900"
                  />
                </div>
              </div>
            </div>

            {/* Quick Profit & Exchange Summary pill */}
            <div className="mt-2 text-xs flex flex-wrap items-center gap-3 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <span>
                Net Customer Pay with Old Scrap:{' '}
                <strong className="text-emerald-700">₹{Math.max(0, sellPrice - scrapValue)}</strong>
              </span>
              <span>•</span>
              <span>
                Profit Margin:{' '}
                <strong className="text-slate-800">₹{sellPrice - purchasePrice}</strong> (
                {purchasePrice > 0 ? Math.round(((sellPrice - purchasePrice) / purchasePrice) * 100) : 0}%)
              </span>
            </div>
          </div>

          {/* Warranty & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty (Months)
              </label>
              <input
                type="number"
                min="0"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                placeholder="36"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Shop Stock
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Stock Alert Level
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Warranty Terms & Shelf Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty Terms Description
              </label>
              <input
                type="text"
                value={warrantyDetails}
                onChange={(e) => setWarrantyDetails(e.target.value)}
                placeholder="e.g. 36 Months Free Replacement + 18M Pro-rata"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop Shelf / Rack Location
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. Rack A-2, Floor Left"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Compatible vehicle models, backup hours, power draw, etc."
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialProduct ? 'Update Product' : 'Save New Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
