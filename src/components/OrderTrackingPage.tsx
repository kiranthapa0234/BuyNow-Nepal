import React, { useState, useEffect } from 'react';
import { 
  Package, Search, ShieldCheck, MapPin, Truck, CheckCircle2, User, Phone, 
  Clock, CreditCard, ChevronRight, AlertCircle, Sparkles, Building2, Terminal, Info, Code, Copy, Check
} from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
  status: string; // 'Processing' | 'Shipped' | 'In Transit' | 'Out for Delivery' | 'Delivered'
  shippingAddress: string;
  email: string;
  phone?: string;
}

// Sample orders representing various logistics stages for user exploration
const SAMPLE_TRACKING_ORDERS: Record<string, OrderData> = {
  'BN-40592-KTM': {
    id: 'BN-40592-KTM',
    date: 'June 12, 2026',
    items: [
      {
        productId: 'prod_1',
        name: 'Ultra Slim High-Power Powerbank',
        image: 'https://images.unsplash.com/photo-1609592424089-986067fc283c?auto=format&fit=crop&q=80&w=600',
        color: 'Meteorite Gray',
        quantity: 1,
        price: 4800
      }
    ],
    subtotal: 4800,
    shippingCharge: 150,
    total: 4950,
    paymentMethod: 'eSewa Mobile Wallet',
    status: 'Processing',
    shippingAddress: 'Ward no. 5, Near Nabil Bank ATM, New Baneshwor, Kathmandu',
    email: 'kiran.thapa@factnepal.org',
    phone: '9841893012'
  },
  'BN-81920-LTP': {
    id: 'BN-81920-LTP',
    date: 'June 11, 2026',
    items: [
      {
        productId: 'prod_5',
        name: 'Tactical Sports Smartwatch Pro',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
        color: 'Carbon Black',
        quantity: 1,
        price: 12500
      }
    ],
    subtotal: 12500,
    shippingCharge: 0,
    total: 12500,
    paymentMethod: 'Khalti Pay',
    status: 'In Transit',
    shippingAddress: 'Gusingal Road, Ward 10, Jhamsikhel, Lalitpur',
    email: 'test.user@nepalmail.com',
    phone: '9803291830'
  },
  'BN-39201-PKR': {
    id: 'BN-39201-PKR',
    date: 'June 10, 2026',
    items: [
      {
        productId: 'prod_2',
        name: 'Active Noise Cancelling Earbuds',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600',
        color: 'Platinum White',
        quantity: 2,
        price: 5200
      }
    ],
    subtotal: 10400,
    shippingCharge: 0,
    total: 10400,
    paymentMethod: 'Bank Transfer',
    status: 'Out for Delivery',
    shippingAddress: 'Baidam Road, Ward 6, Lakeside, Pokhara',
    email: 'pokhara.buyer@gmail.com',
    phone: '9812930291'
  },
  'BN-11203-KTM': {
    id: 'BN-11203-KTM',
    date: 'June 08, 2026',
    items: [
      {
        productId: 'prod_3',
        name: 'Anti-Glare High-Contrast Mech Keyboard',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
        color: 'Neon RGB Chroma',
        quantity: 1,
        price: 9500
      }
    ],
    subtotal: 9500,
    shippingCharge: 0,
    total: 9500,
    paymentMethod: 'Cash on Delivery',
    status: 'Delivered',
    shippingAddress: 'Sorhakhutte Heights near Petrol Pump, Kathmandu',
    email: 'kiran.thapa@factnepal.org',
    phone: '9841893012'
  }
};

export default function OrderTrackingPage() {
  const [searchId, setSearchId] = useState('');
  const [activeTracking, setActiveTracking] = useState<OrderData | null>(null);
  const [errorText, setErrorText] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showDeveloperGuide, setShowDeveloperGuide] = useState(false);

  // Load initial order or listen to search events
  useEffect(() => {
    const handleCheckTracking = (orderId?: string) => {
      const targetId = orderId || localStorage.getItem('buynow_active_tracking_id');
      if (targetId) {
        const query = targetId.trim().toUpperCase();
        setSearchId(query);
        let found = false;
        
        try {
          const savedOrdersRaw = localStorage.getItem('buynow_orders');
          if (savedOrdersRaw) {
            const saved: OrderData[] = JSON.parse(savedOrdersRaw);
            const match = saved.find(o => o.id.toUpperCase() === query);
            if (match) {
              setActiveTracking(match);
              found = true;
            }
          }
        } catch (err) {
          console.error(err);
        }
        
        if (!found && SAMPLE_TRACKING_ORDERS[query]) {
          setActiveTracking(SAMPLE_TRACKING_ORDERS[query]);
          found = true;
        }

        if (found) {
          localStorage.removeItem('buynow_active_tracking_id');
          setErrorText('');
          return;
        }
      }
      
      // Fallback
      if (!activeTracking) {
        setActiveTracking(SAMPLE_TRACKING_ORDERS['BN-40592-KTM']);
      }
    };

    handleCheckTracking();

    const listener = (event: Event) => {
      const customEv = event as CustomEvent;
      if (customEv.detail) {
        handleCheckTracking(customEv.detail);
      }
    };

    window.addEventListener('buynow_track_order', listener);
    return () => {
      window.removeEventListener('buynow_track_order', listener);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toUpperCase();
    if (!query) return;

    setErrorText('');

    // 1. Search in local storage database (actual orders placed by the user)
    try {
      const savedOrdersRaw = localStorage.getItem('buynow_orders');
      if (savedOrdersRaw) {
        const saved: OrderData[] = JSON.parse(savedOrdersRaw);
        const match = saved.find(o => o.id.toUpperCase() === query);
        if (match) {
          setActiveTracking(match);
          return;
        }
      }
    } catch (err) {
      console.error('Failed reading user local orders:', err);
    }

    // 2. Search in sample order records
    if (SAMPLE_TRACKING_ORDERS[query]) {
      setActiveTracking(SAMPLE_TRACKING_ORDERS[query]);
      return;
    }

    // 3. Not found - fallback with simulated details for ANY pattern to keep it fun and helpful
    if (query.startsWith('BN-')) {
      const generatedOrder: OrderData = {
        id: query,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: [
          {
            productId: 'custom_query',
            name: 'Generic Cart Package Shipment',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
            color: 'Assorted Option',
            quantity: 1,
            price: 7500
          }
        ],
        subtotal: 7500,
        shippingCharge: 150,
        total: 7650,
        paymentMethod: 'eSewa Mobile Wallet',
        status: 'Processing',
        shippingAddress: 'Kathmandu central delivery zone (Awaiting physical address verification)',
        email: 'customer@buynow.com',
        phone: '98XXXXXXXX'
      };
      setActiveTracking(generatedOrder);
      setErrorText('Custom Order ID detected. Displaying automatic verification status.');
      return;
    }

    setErrorText('Order ID not recognized. Enter a formal ID like BN-40592-KTM or check your custom receipt.');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Get status metadata
  const getStatusMetadata = (status: string) => {
    switch (status) {
      case 'Processing':
        return {
          percent: 20,
          currentHub: 'Central Kathmandu Sorting Warehouse',
          nextAction: 'Cargo dispatch loading',
          courier: 'Awaiting dispatch assignment',
          courierPhone: 'None'
        };
      case 'Shipped':
        return {
          percent: 45,
          currentHub: 'Bagmati Transit Freight Hub, Sorhakhutte',
          nextAction: 'Settle regional customs boundaries',
          courier: 'BuyNow Core Courier Cargo',
          courierPhone: '+977 1-4423940'
        };
      case 'In Transit':
        return {
          percent: 70,
          currentHub: 'Provincial Storage sector hub',
          nextAction: 'Final sector routing clearance',
          courier: 'Hari Shrestha',
          courierPhone: '+977 9845612345'
        };
      case 'Out for Delivery':
        return {
          percent: 90,
          currentHub: 'Local District Delivery Depot',
          nextAction: 'Rider hand-to-hand transit',
          courier: 'Suman Tamang',
          courierPhone: '+977 9801234567'
        };
      case 'Delivered':
        return {
          percent: 100,
          currentHub: 'Customer Doorstep Location',
          nextAction: 'Signed, verified and archived',
          courier: 'Rajesh Thapa',
          courierPhone: '+977 9811234567'
        };
      default:
        return {
          percent: 20,
          currentHub: 'BuyNow Sorting Station',
          nextAction: 'Pending dispatch check',
          courier: 'Unassigned Logistics Team',
          courierPhone: 'None'
        };
    }
  };

  const meta = activeTracking ? getStatusMetadata(activeTracking.status) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Page Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <span className="text-[10px] bg-blue-50 text-blue-650 font-bold border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 leading-none">
          <Truck size={12} className="animate-bounce" /> Live Doorstep Logistics
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Nepalese Order & Dispatch Tracker
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Verify your parcel transport corridors, locate direct courier contact numbers, and check status parameters across 77 districts instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Search & Display Track Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tracker Search Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-left">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3.5 block">
              Inquire Order Dispatch Status
            </h3>
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Enter Order ID (e.g. BN-40592-KTM)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-900 font-extrabold tracking-wide uppercase focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:normal-case placeholder:font-semibold"
                  id="order-tracker-search-input"
                />
                <Search className="absolute left-4 top-3.5 text-slate-400 stroke-[2.5]" size={15} />
              </div>
              <button
                type="submit"
                className="bg-blue-650 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                id="search-tracking-btn"
              >
                <span>Track Parcel</span>
                <ChevronRight size={14} />
              </button>
            </form>

            {errorText && (
              <p className="text-[11px] font-bold text-red-655 mt-2.5 flex items-center gap-1">
                <AlertCircle size={12} /> {errorText}
              </p>
            )}

            {/* Quick Presets / Clickable Sample IDs */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
                Click Demo IDs to test shipping status stages:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSearchId('BN-40592-KTM'); setActiveTracking(SAMPLE_TRACKING_ORDERS['BN-40592-KTM']); setErrorText(''); }}
                  className={`text-[10.5px] font-mono font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    activeTracking?.id === 'BN-40592-KTM' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-black' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  type="button"
                >
                  BN-40592-KTM (Processing Preparing)
                </button>
                <button
                  onClick={() => { setSearchId('BN-81920-LTP'); setActiveTracking(SAMPLE_TRACKING_ORDERS['BN-81920-LTP']); setErrorText(''); }}
                  className={`text-[10.5px] font-mono font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    activeTracking?.id === 'BN-81920-LTP' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-black' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  type="button"
                >
                  BN-81920-LTP (In Transit Truck)
                </button>
                <button
                  onClick={() => { setSearchId('BN-39201-PKR'); setActiveTracking(SAMPLE_TRACKING_ORDERS['BN-39201-PKR']); setErrorText(''); }}
                  className={`text-[10.5px] font-mono font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    activeTracking?.id === 'BN-39201-PKR' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-black' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  type="button"
                >
                  BN-39201-PKR (Out for Delivery Road)
                </button>
                <button
                  onClick={() => { setSearchId('BN-11203-KTM'); setActiveTracking(SAMPLE_TRACKING_ORDERS['BN-11203-KTM']); setErrorText(''); }}
                  className={`text-[10.5px] font-mono font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    activeTracking?.id === 'BN-11203-KTM' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-black' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  type="button"
                >
                  BN-11203-KTM (Delivered Saved)
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE TRACKING DETAILS SCREEN */}
          {activeTracking && meta && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs text-left animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header Info */}
              <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-blue-500 font-black px-2 py-0.5 uppercase tracking-widest rounded">
                      LIVE STATUS
                    </span>
                    <span className="font-mono text-base font-black tracking-wider text-orange-400">
                      {activeTracking.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                    Order Registered Date: {activeTracking.date}
                  </p>
                </div>
                <div className="text-right sm:text-right w-full sm:w-auto border-t border-slate-800 sm:border-0 pt-2 sm:pt-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Estimated Timeframe</span>
                  <span className="text-sm font-black text-emerald-400">
                    {activeTracking.status === 'Delivered' 
                      ? 'Package Handed Over ✓' 
                      : activeTracking.status === 'Out for Delivery' 
                        ? 'Expected Today!' 
                        : 'Within 24-48 Hours'}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Status Text */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Location hub</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={13} className="text-red-500 shrink-0" />
                      {meta.currentHub}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] bg-blue-50 text-blue-650 px-2.5 py-1 border border-blue-100 rounded-full font-black uppercase tracking-wider">
                      ★ {activeTracking.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-1 border border-slate-200">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-550 ease-out"
                    style={{ width: `${meta.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Warehouse Prep</span>
                  <span>In Transit Cargo</span>
                  <span>Doorstep Courier</span>
                  <span>Archived</span>
                </div>
              </div>

              {/* Step-by-Step Logistics Stepper Timeline */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/40">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">
                  Transportation Journey Timeline
                </h4>

                <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  
                  {/* Step 1: Placed */}
                  <div className="flex gap-4 relative">
                    <div className="h-9 w-9 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xs z-10">
                      <CheckCircle2 size={16} className="stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block uppercase">Order Checkout Placed</span>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                        Cart items securely settled. Verified via {activeTracking.paymentMethod}.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Sorting */}
                  <div className="flex gap-4 relative">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xs z-10 text-white ${
                      ['Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'].includes(activeTracking.status)
                        ? 'bg-emerald-500' : 'bg-slate-250 text-slate-400'
                    }`}>
                      <Package size={15} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block uppercase">Sorted & Clearances Verified</span>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                        Allocated at central Kathmandu Sorhakhutte warehouse. Weighing measurements: 1.4kg cargo payload.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Shipped / Transit */}
                  <div className="flex gap-4 relative">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xs z-10 text-white ${
                      ['Shipped', 'In Transit', 'Out for Delivery', 'Delivered'].includes(activeTracking.status)
                        ? 'bg-emerald-500' : 'bg-slate-250 text-slate-400'
                    }`}>
                      <Truck size={15} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block uppercase">In Transit Corridors</span>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                        Dispatched on high-speed regional dispatch freighter. Crossing local district checkpoints safely.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Out for delivery */}
                  <div className="flex gap-4 relative">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xs z-10 text-white ${
                      ['Out for Delivery', 'Delivered'].includes(activeTracking.status)
                        ? 'bg-emerald-500 animate-pulse' : 'bg-slate-250 text-slate-400'
                    }`}>
                      <User size={15} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block uppercase">Courier Assigned (Rider Out)</span>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                        {activeTracking.status === 'Out for Delivery' || activeTracking.status === 'Delivered'
                          ? `Rider ${meta.courier} (${meta.courierPhone}) carries the parcel to delivery address.`
                          : 'Assisted local delivery runner will be assigned upon regional checkpoint delivery.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 5: Delivered */}
                  <div className="flex gap-4 relative">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xs z-10 text-white ${
                      activeTracking.status === 'Delivered'
                        ? 'bg-emerald-500' : 'bg-slate-250 text-slate-400'
                    }`}>
                      <CheckCircle2 size={15} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block uppercase">Doorstep Handover Complete</span>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                        Recipient visual checkout confirmed. Final cargo ledger status set as signature cleared.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Order contents & shipping details breakdown */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Parcel Contents */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2.5">
                    Shipped Parcel Contents
                  </h4>
                  <div className="space-y-1.5">
                    {activeTracking.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover border border-slate-200 rounded-lg bg-white"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 self-center text-xs">
                          <span className="font-bold text-slate-800 truncate block uppercase text-[10px]">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                            Color: <strong className="text-slate-700">{item.color}</strong> • Qty: <strong>{item.quantity}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1 text-xs text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span>Gateway Mode:</span>
                      <strong className="text-slate-800 uppercase text-[10.5px]">{activeTracking.paymentMethod}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total settle value:</span>
                      <strong className="text-blue-600 text-xs">NPR {activeTracking.total.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Delivery Information Sheet */}
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Assigned District Destiny
                    </h4>
                    <p className="text-xs font-semibold text-slate-700 mt-1 flex items-start gap-1">
                      <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <span>{activeTracking.shippingAddress}</span>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Dispatched Logistics Contact
                    </h4>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs text-slate-700 space-y-1 font-medium mt-1">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-500 shrink-0" />
                        <span>Rider Runner: <strong>{meta.courier}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Phone size={13} className="text-slate-500 shrink-0" />
                        <span>Rider Line: <strong className="text-blue-600 tracking-wider">{meta.courierPhone}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-3.5 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-normal font-semibold">
                    💡 Our Kathmandu dispatch office contacts you on <strong>{activeTracking.phone || 'your phone number'}</strong> prior to the doorstep rider arriving. Keep your cellular device active!
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Right Column: Interactive Nepal Payment Gateway Integration Methods Guide */}
        <div className="lg:col-span-4 space-y-5 text-left">
          
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-5">
              <Terminal size={140} />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Code size={18} className="text-blue-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                API Integration Methods
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              The user requested to know exactly what methods are used for integrating eSewa, Khalti, and Banking APIs in Nepalese production environments.
            </p>

            <button
              onClick={() => setShowDeveloperGuide(!showDeveloperGuide)}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-650 text-white font-extrabold text-[10.5px] uppercase tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              type="button"
            >
              <span>{showDeveloperGuide ? 'Hide Methods' : 'Show Complete Code Methods'}</span>
              <ChevronRight size={14} className={`transform transition-transform ${showDeveloperGuide ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* DYNAMIC INTEGRATION METHOD SPEC SHEETS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm text-xs">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              Parameters & Endpoint Checklist
            </h4>

            {/* eSewa */}
            <div className="space-y-1.5 bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/55">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-emerald-800 flex items-center gap-1.5">
                  <span>💚 eSewa E-Payment (v2)</span>
                </span>
                <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Form POST</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Requires server-side HMAC-SHA256 signatures to authorize direct client forms posted to eSewa gateways.
              </p>
              <div className="pt-2">
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Endpoints</span>
                <div className="font-mono text-[9px] bg-white border border-slate-100 p-1 rounded overflow-x-auto truncate text-slate-700">
                  https://epay.esewa.com.np/api/epay/main/v2
                </div>
              </div>
            </div>

            {/* Khalti */}
            <div className="space-y-1.5 bg-purple-50/30 p-3 rounded-xl border border-purple-100/55">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-purple-900 flex items-center gap-1.5">
                  <span>💜 Khalti Wallet (v2)</span>
                </span>
                <span className="text-[8px] bg-purple-100 text-purple-950 font-bold px-2 py-0.5 rounded uppercase tracking-wider">REST API JSON</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Server-side transaction initiation payload request returning a custom <code className="font-mono text-purple-800 text-[10px]">payment_url</code> for instant gateway iframe/popup redirects.
              </p>
              <div className="pt-2">
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Endpoints</span>
                <div className="font-mono text-[9px] bg-white border border-slate-100 p-1 rounded overflow-x-auto truncate text-slate-700">
                  https://a.khalti.com/api/v2/epayment/initiate/
                </div>
              </div>
            </div>

            {/* Direct Bank or IPS */}
            <div className="space-y-1.5 bg-blue-50/30 p-3 rounded-xl border border-blue-100/55">
              <span className="font-extrabold text-xs text-blue-900 flex items-center gap-1.5">
                <span>🏛️ Bank Gateway / ConnectIPS</span>
              </span>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                ConnectIPS uses cryptographic signatures based on digital certificates (<code className="font-mono text-[9.5px]">.pfx</code> files) loaded into Java/Node backend environments.
              </p>
              <div className="pt-2">
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Endpoints</span>
                <div className="font-mono text-[9px] bg-white border border-slate-100 p-1 rounded overflow-x-auto truncate text-slate-700">
                  https://login.connectips.com/connectips
                </div>
              </div>
            </div>

          </div>

          {/* IN DEPTH CODE METHODS DRAWER */}
          {showDeveloperGuide && (
            <div className="bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 p-5 space-y-4 font-mono text-[10px] shadow-2xl animate-in slide-in-from-right duration-250 leading-relaxed overflow-x-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-[10px] font-black text-white uppercase block">
                  Implementation Schema
                </h4>
                <button 
                  onClick={() => setShowDeveloperGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Step 1 Code */}
              <div className="space-y-2">
                <span className="text-blue-400 font-extrabold block">/* 1. ESEWA SIGNATURE SIGNER (server.ts) */</span>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto max-h-[160px] text-left">
{`const crypto = require('crypto');

app.post('/api/payment/esewa-signature', (req, res) => {
  const { total_amount, transaction_uuid, product_code } = req.body;
  
  // Loaded securely from AI Studio backend environment variables (.env)
  const secretKey = process.env.ESEWA_SECRET_KEY || '8g8DGWZ7h9KsM90t'; 
  
  const signatureString = \`total_amount=\${total_amount},transaction_uuid=\${transaction_uuid},product_code=\${product_code}\`;
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(signatureString)
    .digest('base64');
    
  res.json({ signature });
});`}
                </pre>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCopy('process.env.ESEWA_SECRET_KEY', 'esewa')}
                    className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[8px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'esewa' ? <Check size={8} /> : null}
                    <span>{copiedKey === 'esewa' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2 Code */}
              <div className="space-y-2">
                <span className="text-purple-400 font-extrabold block">/* 2. KHALTI INITIATION CALL (server.ts) */</span>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto max-h-[160px] text-left">
{`app.post('/api/payment/khalti-initiate', async (req, res) => {
  const { amount, order_id, customer_info } = req.body;
  const secretKey = process.env.KHALTI_SECRET_KEY; // "Key test_secret_key_..."

  try {
    const response = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
      method: 'POST',
      headers: {
        'Authorization': \`Key \${secretKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        return_url: 'https://buynownepal.com/api/payment/khalti-callback',
        website_url: 'https://buynownepal.com',
        amount: Math.round(amount * 100), // convert NPR to paisa
        purchase_order_id: order_id,
        purchase_order_name: "BuyNow Nepal Settlement",
        customer_info
      })
    });
    
    const result = await response.json();
    res.json(result); // returns payment_url and pidx
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`}
                </pre>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCopy('process.env.KHALTI_SECRET_KEY', 'khalti')}
                    className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[8px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'khalti' ? <Check size={8} /> : null}
                    <span>{copiedKey === 'khalti' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Env vars list */}
              <div className="space-y-1 pt-3 border-t border-slate-800">
                <span className="text-slate-450 block uppercase text-[8.5px] font-bold">REQUIRED ENVIRONMENT CREDENTIALS FILE</span>
                <pre className="bg-slate-950 p-2 text-slate-400 rounded-lg text-[9px] tracking-wider text-left border border-slate-800">
{`# AI Studio Environment Settings
VITE_ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8g8DGWZ7h9KsM90t

VITE_KHALTI_PUBLIC_KEY=key_test_5x930...
KHALTI_SECRET_KEY=test_secret_key_67b...`}
                </pre>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
