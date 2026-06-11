import React from 'react';
import { ShoppingBag, Search, Phone, ShoppingCart, Star, MapPin, Sparkles, User, LogOut } from 'lucide-react';
import { CartItem, UserProfile } from '../types';

interface NavbarProps {
  cart: CartItem[];
  toggleCart: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  openAiAssistant: () => void;
  user: UserProfile | null;
  onAuthClick: () => void;
  onSignOut: () => void;
  onProfileClick: () => void;
}

export default function Navbar({
  cart,
  toggleCart,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  openAiAssistant,
  user,
  onAuthClick,
  onSignOut,
  onProfileClick,
}: NavbarProps) {
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const categories = ['All', 'Electronics', 'Fashion', 'Accessories'];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-xs">
      {/* Top micro-bar */}
      <div className="bg-slate-900 text-white text-[10px] uppercase tracking-wider py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-gray-300 font-extrabold">
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-orange-500" /> Support: +977 9812345678
            </span>
            <span className="hidden md:flex items-center gap-1">
              <MapPin size={12} className="text-orange-500" /> Kathmandu & 77 Districts
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">
              FREE SHIPPING ON ORDERS ABOVE NPR 5,000
            </span>
            <button
              onClick={openAiAssistant}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest transition shadow-xs"
              id="ai-helper-btn"
            >
              <Sparkles size={11} className="animate-pulse" /> AI assistant
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <button 
              onClick={() => { setActiveTab('shop'); setSelectedCategory('All'); }}
              className="flex items-center gap-3 cursor-pointer focus:outline-hidden group"
              id="brand-logo-btn"
            >
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-xl text-white flex items-center justify-center shadow-md shadow-blue-100 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag size={20} className="stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 block leading-none">
                  BUYNOW<span className="text-orange-500 font-black">.</span>
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold">Nepal Store</span>
              </div>
            </button>

            {/* Mobile quick icons */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={openAiAssistant}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                title="AI Shopping Advisor"
              >
                <Sparkles size={20} />
              </button>
              
              {user ? (
                <button
                  onClick={onProfileClick}
                  className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs border border-orange-400 cursor-pointer shadow-sm"
                  title={`Logged in as ${user.name}. Click to view Profile & Orders.`}
                  id="mobile-profile-active-btn"
                >
                  {user.name[0].toUpperCase()}
                </button>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition"
                  title="Sign In or Signup"
                  id="mobile-signin-trigger"
                >
                  <User size={22} />
                </button>
              )}

              <button
                onClick={toggleCart}
                className="p-2 relative text-gray-700 hover:bg-gray-100 rounded-full transition"
                id="mobile-cart-toggle-btn"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="w-full md:max-w-xl flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-gray-950 font-medium focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-150"
                id="search-input"
              />
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
            </div>
          </div>

          {/* Navigation Links and Cart Desk */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-5">
              <button
                onClick={() => { setActiveTab('shop'); setSelectedCategory('All'); }}
                className={`text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                  activeTab === 'shop' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                id="nav-shop-link"
              >
                Shop
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                  activeTab === 'reviews' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                id="nav-reviews-link"
              >
                Testimonials
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                  activeTab === 'contact' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                id="nav-contact-link"
              >
                Contact
              </button>
            </nav>

            <span className="h-6 w-px bg-slate-200" />

            {/* User Profile / Login Integration */}
            {user ? (
              <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-250/70 p-1.5 pr-3 rounded-xl text-left">
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-2 hover:bg-white p-1 rounded-lg transition-all cursor-pointer text-left shadow-2xs"
                  title="View Profile & Purchase Order History"
                  id="desktop-view-profile-btn"
                >
                  <div className="h-7 w-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs select-none">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="text-[10px] leading-tight font-bold text-slate-800">
                    <span className="text-blue-500 block text-[8px] font-extrabold uppercase">My Profile</span>
                    <span className="max-w-[70px] block truncate" title={user.name}>{user.name.split(' ')[0]}</span>
                  </div>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                  title="Sign Out Account"
                  id="desktop-signout-btn"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 uppercase font-bold tracking-wider text-xs shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-blue-600"
                id="desktop-signin-btn"
              >
                <User size={14} className="text-blue-600" />
                <span>Sign In</span>
              </button>
            )}

            <span className="h-6 w-px bg-slate-200" />

            {/* Desktop Cart Trigger */}
            <button
              onClick={toggleCart}
              className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4.5 py-2 transition-all hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer shadow-sm hover:shadow-md"
              id="desktop-cart-toggle-btn"
            >
              <div className="relative">
                <ShoppingCart size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-orange-500 text-white text-[9px] font-bold h-4.5 w-4.5 rounded-full border border-white flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left text-xs leading-none uppercase font-bold">
                <span className="text-slate-400 block text-[9px] font-semibold">Your Cart</span>
                <span className="text-slate-800">
                  {cartTotal > 0 ? `NPR ${cartTotal.toLocaleString()}` : 'NPR 0'}
                </span>
              </div>
            </button>
          </div>

        </div>

        {/* Mobile category bar */}
        <div className="flex sm:hidden overflow-x-auto gap-2 py-2.5 mt-2 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('shop');
              setSelectedCategory('All');
            }}
            className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition border ${
              activeTab === 'shop'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition border ${
              activeTab === 'reviews' 
                ? 'bg-orange-500 text-white border-orange-500 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            id="mobile-nav-reviews-link"
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition border ${
              activeTab === 'contact' 
                ? 'bg-orange-500 text-white border-orange-500 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            id="mobile-nav-contact-link"
          >
            Contact
          </button>
        </div>
      </div>
    </header>
  );
}
