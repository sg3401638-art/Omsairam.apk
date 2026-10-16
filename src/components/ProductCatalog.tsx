import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  BatteryCharging, 
  Zap, 
  Bike, 
  Car, 
  Lightbulb, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle,
  ShoppingCart,
  Filter,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onQuickSell: (product: Product) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onQuickUpdatePrice: (productId: string, newSellPrice: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onQuickSell,
  onUpdateStock,
  onQuickUpdatePrice,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'price_low' | 'price_high' | 'stock'>('capacity');

  // Fast inline editing price state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Unique brands
  const brands = Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);

  // Filtered products
  const filteredProducts = products.filter((prod) => {
    // Category filter
    if (activeCategory !== 'all' && prod.category !== activeCategory) {
      return false;
    }
    // Brand filter
    if (brandFilter !== 'all' && prod.brand !== brandFilter) {
      return false;
    }
    // Stock filter
    if (stockFilter === 'in_stock' && prod.stock <= 0) return false;
    if (stockFilter === 'low_stock' && prod.stock > prod.minStockAlert) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchBrand = prod.brand.toLowerCase().includes(q);
      const matchCapacity = `${prod.capacityValue}${prod.capacityUnit}`.toLowerCase().includes(q);
      const matchModel = (prod.modelNumber || '').toLowerCase().includes(q);
      const matchLocation = (prod.shelfLocation || '').toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCapacity && !matchModel && !matchLocation) {
        return false;
      }
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'capacity') return b.capacityValue - a.capacityValue;
    if (sortBy === 'price_low') return a.sellPrice - b.sellPrice;
    if (sortBy === 'price_high') return b.sellPrice - a.sellPrice;
    if (sortBy === 'stock') return b.stock - a.stock;
    return 0;
  });

  // Category counts
  const getCatCount = (cat: string) => {
    if (cat === 'all') return products.length;
    return products.filter((p) => p.category === cat).length;
  };

  const startEditPrice = (prod: Product) => {
    setEditingPriceId(prod.id);
    setTempPrice(prod.sellPrice);
  };

  const saveEditPrice = (prodId: string) => {
    if (tempPrice > 0) {
      onQuickUpdatePrice(prodId, tempPrice);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search battery Ah, inverter VA, bulbs, brand, model..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Brand & Stock Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Brand select */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
          >
            <option value="all">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Stock state */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'all' | 'in_stock' | 'low_stock')}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">⚠️ Low Stock Alerts</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
          >
            <option value="capacity">Sort: Rating / Ah / VA</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="stock">Stock Available</option>
            <option value="name">Product Name</option>
          </select>

          {/* Add Product Button */}
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'all', label: 'All Items', icon: Layers, unit: '' },
          { id: 'inverter_battery', label: 'Inverter Batteries', icon: BatteryCharging, unit: 'Ah' },
          { id: 'inverter_ups', label: 'Inverters & UPS', icon: Zap, unit: 'VA' },
          { id: 'two_wheeler', label: '2W Bike Batteries', icon: Bike, unit: 'Ah' },
          { id: 'four_wheeler', label: 'Car & 4W Batteries', icon: Car, unit: 'Ah' },
          { id: 'bulb_lighting', label: 'Bulbs & Tubelights', icon: Lightbulb, unit: 'Watts' },
          { id: 'electrical_thing', label: 'Electricals & Fans', icon: Wrench, unit: 'Pcs/Mtr' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          const count = getCatCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.unit && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-red-950 text-red-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.unit}
                </span>
              )}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sortedProducts.map((prod) => {
          const isLowStock = prod.stock <= prod.minStockAlert;
          const isOutOfStock = prod.stock <= 0;
          const netWithScrap = Math.max(0, prod.sellPrice - prod.scrapValue);
          const isEditingPrice = editingPriceId === prod.id;

          return (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
                isOutOfStock
                  ? 'border-red-200 bg-red-50/20'
                  : isLowStock
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  {/* Brand & Category pill */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
                      {prod.brand}
                    </span>
                    {prod.popular && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white">
                        ★ Best Seller
                      </span>
                    )}
                    {prod.modelNumber && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {prod.modelNumber}
                      </span>
                    )}
                  </div>

                  {/* Rating / Capacity Badge (Ah, VA, W) */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-black shadow-sm">
                      <span className="text-xl leading-none">{prod.capacityValue}</span>
                      <span className="text-xs uppercase tracking-wider">{prod.capacityUnit}</span>
                    </div>
                    {prod.category === 'inverter_battery' && (
                      <span className="text-[9px] text-red-700 font-bold mt-0.5">Tubular Battery</span>
                    )}
                    {prod.category === 'inverter_ups' && (
                      <span className="text-[9px] text-blue-700 font-bold mt-0.5">Sine Wave UPS</span>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {prod.name}
                </h3>

                {/* Shelf Rack & Description */}
                {prod.shelfLocation && (
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Location:</span>
                    <span>{prod.shelfLocation}</span>
                  </div>
                )}
                {prod.description && (
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                )}

                {/* Warranty Pill */}
                {prod.warrantyMonths > 0 && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="font-semibold">
                      {prod.warrantyMonths} Months Warranty{' '}
                      {prod.warrantyDetails ? `• ${prod.warrantyDetails}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Details Section */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 space-y-2">
                {/* Selling Price vs MRP */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Customer Price
                    </span>
                    {isEditingPrice ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs font-bold text-red-700">₹</span>
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          className="w-24 px-2 py-0.5 text-sm font-black border border-red-500 rounded bg-white text-red-700"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditPrice(prod.id)}
                          className="px-2 py-0.5 bg-red-600 text-white rounded text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-red-700 font-mono">
                          ₹{prod.sellPrice.toLocaleString('en-IN')}
                        </span>
                        {prod.mrp > prod.sellPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{prod.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                        <button
                          onClick={() => startEditPrice(prod)}
                          className="text-[11px] text-slate-400 hover:text-slate-700 p-0.5"
                          title="Quick update price"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dealer Cost (Employee Eyes Only) */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Dealer Cost
                    </span>
                    <span className="text-xs font-semibold text-slate-600 font-mono">
                      ₹{prod.purchasePrice.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-emerald-700 font-bold">
                      +₹{prod.sellPrice - prod.purchasePrice} profit
                    </div>
                  </div>
                </div>

                {/* Old Battery Exchange Discount */}
                {prod.scrapValue > 0 && (
                  <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-900 block">
                        With Old Battery Scrap:
                      </span>
                      <span className="text-[10px] text-amber-700">
                        Exchange scrap deduction: -₹{prod.scrapValue}
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-950 font-mono">
                      ₹{netWithScrap.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Stock Counter and Quick Adjuster */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    {isOutOfStock ? (
                      <span className="flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-[11px]">
                        <AlertTriangle className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                        <AlertTriangle className="w-3 h-3" /> Low Stock: {prod.stock} left
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                        ✓ In Stock: {prod.stock} units
                      </span>
                    )}
                  </div>

                  {/* Stock + / - buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateStock(prod.id, Math.max(0, prod.stock - 1))}
                      className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 flex items-center justify-center text-xs"
                      title="Decrease stock by 1"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-slate-800 px-1 text-xs">{prod.stock}</span>
                    <button
                      onClick={() => onUpdateStock(prod.id, prod.stock + 1)}
                      className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 flex items-center justify-center text-xs"
                      title="Increase stock by 1"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
                <button
                  onClick={() => onEditProduct(prod)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Edit full product details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onQuickSell(prod)}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Bill / Sell Item</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedProducts.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BatteryCharging className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No products match your search or filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try clearing the search query or category filters, or click "Add New Product" to add it to the catalog.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
              setBrandFilter('all');
              setStockFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
