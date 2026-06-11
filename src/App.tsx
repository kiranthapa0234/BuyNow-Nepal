import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from './data/products';
import { Product, CartItem, UserProfile } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AuthModal from './components/AuthModal';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ReviewsSection from './components/ReviewsSection';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer';
import AiAssistant from './components/AiAssistant';
import { Eye, ShieldAlert, Sparkles, Filter, RefreshCcw, CheckCircle2, Plus, Database, Copy, Check } from 'lucide-react';
import AdminProductModal from './components/AdminProductModal';
import UserProfileModal from './components/UserProfileModal';
import { useEffect } from 'react';

const SQL_SCHEMA = `-- 1. Create Users Table
create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text unique not null,
  password text not null,
  location jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Products Table
create table if not exists products (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  original_price numeric,
  image text,
  images text[] default '{}'::text[],
  category text not null,
  colors text[] default '{}'::text[],
  rating numeric default 5.0,
  reviews_count integer default 0,
  stock integer default 10,
  features text[] default '{}'::text[],
  specs jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Reviews Table
create table if not exists reviews (
  id text primary key,
  author text not null,
  location text not null,
  rating integer default 5,
  comment text not null,
  date text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Logins Log Table
create table if not exists logins (
  id bigint generated always as identity primary key,
  user_id text,
  email text,
  name text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable Row Level Security (RLS) for public inserts or testing
alter table users disable row level security;
alter table products disable row level security;
alter table reviews disable row level security;
alter table logins disable row level security;`;

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('shop');

  // Dynamic products catalog states
  const [productsState, setProductsState] = useState<Product[]>(() => PRODUCTS);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminSelectedProduct, setAdminSelectedProduct] = useState<Product | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load products list dynamically from persistent backend
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductsState(data);
        }
      })
      .catch((err) => console.log('Products fetch skipped (using static fallback):', err));
  }, []);

  const handleProductSaveSuccess = (updatedProduct: Product) => {
    setProductsState((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedProduct.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updatedProduct;
        return next;
      } else {
        return [...prev, updatedProduct];
      }
    });
  };

  const handleDeleteProduct = async (productToDelete: Product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productToDelete.name}" from the product list?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProductsState((prev) => prev.filter((p) => p.id !== productToDelete.id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete product from database.');
      }
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Network error deleting product. Please check your connection.');
    }
  };
  
  // User Authentication & Session state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('buynow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Supabase Database Diagnostics States
  const [supabaseDiag, setSupabaseDiag] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  // Load diagnostics
  const fetchSupabaseDiagnostics = () => {
    fetch('/api/supabase-status')
      .then((res) => res.json())
      .then((data) => setSupabaseDiag(data))
      .catch((err) => console.error('Failed to query Supabase status:', err));
  };

  useEffect(() => {
    fetchSupabaseDiagnostics();
  }, [user]);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSeedSupabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/supabase-seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedResult(data.results);
        fetchSupabaseDiagnostics();
        alert('Local database successfully cloned and seeded to your Supabase backend! Refresh the window to reload your live inventory products.');
      } else {
        alert(data.error || 'Failed to seed local database.');
      }
    } catch (err) {
      console.error('Seed error:', err);
      alert('Network error executing seed script.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAuthSuccess = (authUser: UserProfile) => {
    setUser(authUser);
    localStorage.setItem('buynow_user', JSON.stringify(authUser));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('buynow_user');
  };

  // Shopping logic states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<number>(200000);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Automatically scroll to the product when search query is entered
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // If the user starts typing and is not in the shop tab, active the shop view automatically
    if (activeTab !== 'shop') {
      setActiveTab('shop');
    }

    const timer = setTimeout(() => {
      // Find the first product that has a match in title, description, or category
      const firstMatch = productsState.find((p) => {
        return p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
               p.description.toLowerCase().includes(trimmed.toLowerCase()) ||
               p.category.toLowerCase().includes(trimmed.toLowerCase());
      });

      if (firstMatch) {
        const cardElement = document.getElementById(`product-card-${firstMatch.id}`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Fallback to the catalog anchor if card element is not available (e.g. because of transitions)
          const anchorElement = document.getElementById('catalog-anchor');
          anchorElement?.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Fallback to catalog anchor so user can see there are no matches
        const anchorElement = document.getElementById('catalog-anchor');
        anchorElement?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500); // 500ms debounce allows comfortable typing without continuous viewport shifting

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, productsState]);

  // Checkout flows trigger
  const [checkoutConfig, setCheckoutConfig] = useState({
    isOpen: false,
    shippingCharge: 100,
    regionName: 'Kathmandu Valley',
  });

  // Toast confirmation alerts
  const [showOrderToast, setShowOrderToast] = useState(false);

  // Formatting currency
  const formatNPR = (amount: number) => {
    return 'NPR ' + amount.toLocaleString();
  };

  // Cart operations managers
  const handleAddToCart = (product: Product, quantity: number = 1, color: string) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx].quantity = Math.min(newQty, product.stock);
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedColor: color }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, color: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedColor === color
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string, color: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedColor === color))
    );
  };

  const handleCheckoutTrigger = (shippingCharge: number, regionName: string) => {
    setIsCartOpen(false);
    setCheckoutConfig({
      isOpen: true,
      shippingCharge,
      regionName,
    });
  };

  const handleOrderSuccess = () => {
    setCart([]); // Reset Cart
    setShowOrderToast(true);
    setTimeout(() => setShowOrderToast(false), 5000);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange(200000);
    setSortBy('recommended');
    setOnlyInStock(false);
  };

  // Filtered and Sorted list selector
  const filteredProducts = productsState.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesPrice = p.price <= priceRange;
    const matchesInStock = !onlyInStock || p.stock > 0;

    return matchesSearch && matchesCat && matchesPrice && matchesInStock;
  });

  // Sort logic runner
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating-desc') return b.rating - a.rating;
    return 0; // Default recommended (as listed in db schema)
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative antialiased text-gray-800">
      
      {/* Header component */}
      <Navbar
        cart={cart}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        openAiAssistant={() => setIsAiOpen(true)}
        user={user}
        onAuthClick={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      {/* Main tabs routers */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* SHOP FLOW SECTION */}
          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-0"
            >
              {/* Responsive Hero Banner */}
              <Hero 
                onShopClick={() => {
                  const el = document.getElementById('catalog-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }} 
                openAiAssistant={() => setIsAiOpen(true)}
              />

              {/* Superadmin Dashboard Controls Ribbon */}
              {user?.role === 'superadmin' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-4">
                  <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xs">
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase text-blue-600 tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 inline-block mb-1">
                        Active Superadmin Session
                      </span>
                      <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                        BuyNow Product Inventory Manager
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Logged in as: <strong className="text-slate-800 font-bold">{user.email}</strong>. Live catalog synchronization is active.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAdminSelectedProduct(null);
                        setIsAdminModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-5.5 rounded-xl transition-all shadow-md shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2 self-start sm:self-center select-none"
                    >
                      <Plus size={14} />
                      <span>Add New Product</span>
                    </button>
                  </div>

                  {/* Supabase Dashboard Integration Control card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                          <Database size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                            Supabase Backend Active Integration
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold">
                            Project Ref ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-blue-600">cahuugpenecotdpbsnyj</code>
                          </p>
                        </div>
                      </div>

                      {/* Seed connection button */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={handleSeedSupabase}
                          disabled={isSeeding}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles size={13} />
                          <span>{isSeeding ? 'Seeding Data...' : 'Import Local Data to Supabase'}</span>
                        </button>

                        <button
                          onClick={() => setShowSqlGuide(!showSqlGuide)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all cursor-pointer"
                        >
                          {showSqlGuide ? 'Hide SQL Script Guide' : 'Show SQL Script Guide'}
                        </button>
                      </div>
                    </div>

                    {/* Connection tables matrix status */}
                    {supabaseDiag ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">
                            Table Setup Status:
                          </span>
                          {Object.entries(supabaseDiag.tables || {}).map(([tableName, tblStatus]: [string, any]) => (
                            <div
                              key={tableName}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                tblStatus.exists
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${tblStatus.exists ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span>{tableName} table: {tblStatus.exists ? 'Online (Ready)' : 'Needs Creation'}</span>
                            </div>
                          ))}
                        </div>

                        {/* Warning message if tables are missing */}
                        {Object.values(supabaseDiag.tables || {}).some((t: any) => !t.exists) && (
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
                            <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={15} />
                            <p className="text-xs text-amber-800 font-bold leading-relaxed">
                              Database Sync Pending: One or more tables are missing on your Supabase dashboard! The website is gracefully falling back to the local JSON engine. Click the "Show SQL Script Guide" button below to copy and run the setup script in your Supabase SQL editor to enable database persistence!
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <RefreshCcw className="animate-spin text-blue-600" size={13} />
                        <span>Analyzing Supabase database table schema...</span>
                      </div>
                    )}

                    {/* Seed Results Notice */}
                    {seedResult && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800 font-bold">
                        <h5 className="font-black text-blue-900 uppercase tracking-wider mb-1">Local Database Seeding Report:</h5>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Successfully imported users: {seedResult.users}</li>
                          <li>Successfully imported products: {seedResult.products}</li>
                          <li>Successfully imported reviews: {seedResult.reviews}</li>
                          {seedResult.errors && seedResult.errors.length > 0 && (
                            <li className="text-amber-700">Seeding warnings / errors encountered: {seedResult.errors.length}</li>
                          )}
                        </ul>
                        <p className="text-[10px] text-blue-500 mt-1 uppercase tracking-wide">
                          Refresh the page to sync your live catalog view with the newly loaded data!
                        </p>
                      </div>
                    )}

                    {/* Code guide accordion */}
                    {showSqlGuide && (
                      <div className="mt-4 border-t border-slate-100 pt-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                            SQL Command to Execute on Supabase Dashboard SQL Editor
                          </h5>
                          <button
                            onClick={handleCopySQL}
                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 font-bold text-[10px] text-slate-600 px-2.5 py-1.5 rounded uppercase tracking-wider transition select-none cursor-pointer"
                          >
                            {copiedSql ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            <span>{copiedSql ? 'Copied script' : 'Copy Script'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mb-3">
                          Paste this script in the <strong className="font-extrabold text-slate-800">SQL Editor</strong> tab within your <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a> and hit <strong className="font-extrabold text-slate-800">Run</strong>. This will instantly build the correct tables, columns, and disable RLS for direct syncing.
                        </p>
                        <pre className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-[11px] font-mono text-slate-700 overflow-x-auto max-h-60 leading-relaxed block text-left">
                          {SQL_SCHEMA}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Core Store Listing Grid containing filters sidebar */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="catalog-anchor">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  
                  {/* Filters Left Sidebar */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-md shadow-slate-100/50 text-left">
                      <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                        <span className="font-bold text-slate-850 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <Filter size={15} className="text-blue-600" />
                          <span>Filter options</span>
                        </span>
                        {(searchQuery || selectedCategory !== 'All' || priceRange < 200000 || sortBy !== 'recommended' || onlyInStock) && (
                          <button
                            onClick={handleResetFilters}
                            className="text-[10px] bg-red-50 text-red-655 font-bold px-2.5 py-1 rounded-full border border-red-100 hover:bg-red-100 flex items-center gap-1 transition cursor-pointer"
                            title="Reset filters"
                          >
                            <RefreshCcw size={10} /> Reset
                          </button>
                        )}
                      </div>

                      {/* Browse Categories Selector */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Browse Categories</span>
                        <div className="flex flex-col gap-1.5">
                          {['All', 'Electronics', 'Fashion', 'Accessories'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                                selectedCategory === cat
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100'
                                  : 'bg-white text-slate-700 border-slate-150 hover:bg-slate-50'
                              }`}
                              id={`sidebar-cat-btn-${cat.toLowerCase()}`}
                            >
                              <span>{cat}</span>
                              <span className={`text-[9px] border px-2 py-0.5 rounded-full font-bold ${
                                selectedCategory === cat
                                  ? 'bg-blue-750 text-white border-blue-500/20'
                                  : 'bg-slate-50 text-slate-500 border-slate-150'
                              }`}>
                                {cat === 'All' 
                                  ? productsState.length 
                                  : productsState.filter(p => p.category === cat).length}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* By price ranges */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Price Limit Range</span>
                        <div className="space-y-1">
                          <input
                            type="range"
                            min={2000}
                            max={200000}
                            step={5000}
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[11px] font-bold text-slate-400">
                            <span>NPR 2,000</span>
                            <span className="text-blue-600 font-bold text-xs">{formatNPR(priceRange)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sort ordering */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Sort Products By</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                          <option value="recommended">Best Recommended</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="rating-desc">Highly Rated Customers</option>
                        </select>
                      </div>

                      {/* Only show in stocks */}
                      <div className="pt-4 border-t border-slate-150">
                        <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={onlyInStock}
                            onChange={(e) => setOnlyInStock(e.target.checked)}
                            className="rounded-md border border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Show Only In-Stock ({productsState.filter(p => p.stock > 0).length})</span>
                        </label>
                      </div>

                      {/* Live AI Assistant promo card inside filters sidebar */}
                      <div className="pt-4 mt-2 border-t border-slate-150">
                        <div className="bg-gradient-to-tr from-blue-50/50 to-indigo-50/50 p-4.5 border border-blue-100 rounded-2xl space-y-2.5">
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                            <Sparkles size={11} className="text-orange-500" />
                            <span>AI Companion</span>
                          </span>
                          <span className="font-bold text-slate-800 block text-xs leading-snug uppercase tracking-wide">Need shopping advice?</span>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                            Ask our instant Gemini Retail Advisor! It compares specs, estimates custom shipping charges and more.
                          </p>
                          <button
                            onClick={() => setIsAiOpen(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                          >
                            Open AI Advisor
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Main Product Catalog listing */}
                  <div className="lg:col-span-3 space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-100">
                      <div>
                        <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
                          <span>Verified Store Catalog</span>
                          <span className="text-xs font-bold text-gray-400">({sortedProducts.length} items found)</span>
                        </h2>
                        {selectedCategory !== 'All' && (
                          <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-md mt-1.5 inline-block">
                            Category: {selectedCategory}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-widest leading-none flex items-center h-fit">
                          ● Genuine Guarantee
                        </span>
                      </div>
                    </div>

                    {sortedProducts.length === 0 ? (
                      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center space-y-4">
                        <div className="p-4 bg-gray-50 rounded-full border border-gray-100 text-gray-400 w-16 h-16 flex items-center justify-center mx-auto">
                          <ShieldAlert size={28} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-gray-800 text-sm">No products found matching filters</h3>
                          <p className="text-xs text-gray-500 max-w-xs mx-auto font-semibold">
                            Try adjusting your price range limit or clearing search keywords.
                          </p>
                        </div>
                        <button
                          onClick={handleResetFilters}
                          className="bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sortedProducts.map((prod) => (
                          <div key={prod.id}>
                            <ProductCard
                              product={prod}
                              onViewDetails={(p) => setSelectedProduct(p)}
                              onAddToCart={(p, col) => handleAddToCart(p, 1, col)}
                              isAdmin={user?.role === 'superadmin'}
                              onEditProduct={(p) => {
                                setAdminSelectedProduct(p);
                                setIsAdminModalOpen(true);
                              }}
                              onDeleteProduct={handleDeleteProduct}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* TESTIMONIAL FEED */}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ReviewsSection />
            </motion.div>
          )}

          {/* CONTACT INFO TAB */}
          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ContactPage />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer corporate component */}
      <Footer onNavClick={setActiveTab} activeTab={activeTab} />

      {/* Drawers / Lightbox dialog components */}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutTrigger}
      />

      {/* AI Assistant Drawer */}
      <AiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        products={productsState}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsAiOpen(false);
        }}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty, col) => handleAddToCart(p, qty, col)}
      />

      {/* Checkout Multi-Step Modal */}
      <CheckoutModal
        isOpen={checkoutConfig.isOpen}
        onClose={() => setCheckoutConfig({ ...checkoutConfig, isOpen: false })}
        cart={cart}
        defaultShippingCharge={checkoutConfig.shippingCharge}
        selectedRegionName={checkoutConfig.regionName}
        onOrderSuccess={handleOrderSuccess}
        user={user}
      />

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Active Profile & Order History Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Superadmin Catalog Management Modal */}
      <AdminProductModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setAdminSelectedProduct(null);
        }}
        product={adminSelectedProduct}
        onSaveSuccess={handleProductSaveSuccess}
      />

      {/* Order completed Floating Toast banner notification */}
      <AnimatePresence>
        {showOrderToast && (
          <motion.div
            key="order-completed-toast"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-6 z-50 bg-gray-900 border border-gray-800 text-white rounded-xl p-4 flex items-center gap-3 shadow-2xl max-w-sm text-left"
          >
            <div className="p-1.5 bg-emerald-500 rounded-full text-white shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-xs font-black block">Order Received! 🚚</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">We are packaging your items inside Kathmandu or provincial nodes now. Tracking SMS inbound.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Chat Button */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3.5 rounded-full shadow-lg shadow-blue-500/20 border border-white/10 hover:scale-105 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-250 cursor-pointer flex items-center justify-center gap-2.5 group select-none backdrop-blur-md"
          id="floating-ai-assistant-btn"
          title="Compare hardware & items instantly using our AI Retail Expert"
        >
          <Sparkles size={16} className="text-white group-hover:rotate-12 transition-transform animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider hidden sm:inline-block">Shop with AI</span>
        </button>
      )}

    </div>
  );
}
