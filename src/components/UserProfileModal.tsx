import React, { useState, useEffect } from 'react';
import { X, Calendar, Package, MapPin, Phone, Mail, DollarSign, ChevronDown, ChevronUp, Clock, CheckCircle2, User, LogOut, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  quantity: number;
  price: number;
}

interface LocalOrder {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
  status: string;
  shippingAddress: string;
  email: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSignOut: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  onSignOut,
}: UserProfileModalProps) {
  if (!isOpen || !user) return null;

  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Fetch or Seed orders
  useEffect(() => {
    const fetchOrders = () => {
      try {
        let savedOrdersRaw = localStorage.getItem('buynow_orders');
        let savedOrders: LocalOrder[] = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];

        // Dynamic seeding if user has absolutely no history recorded at all
        const seedKey = `buynow_orders_seeded_${user.email}`;
        const hasSeeded = localStorage.getItem(seedKey);

        if (savedOrders.filter(o => o.email === user.email).length === 0 && !hasSeeded) {
          // Generate 2 stylish mock historical orders
          const pastOrder1: LocalOrder = {
            id: 'BN-' + Math.floor(Math.random() * 90000 + 10000) + '-KTM',
            date: 'June 01, 2026',
            items: [
              {
                productId: 'prod_1',
                name: 'Premium Leather Bifold Wallet',
                image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
                color: 'Tan Brown',
                quantity: 1,
                price: 2450
              },
              {
                productId: 'prod_2',
                name: 'Minimalist Neo-Retro Sneakers',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
                color: 'Vibrant Red',
                quantity: 1,
                price: 6800
              }
            ],
            subtotal: 9250,
            shippingCharge: 150,
            total: 9400,
            paymentMethod: 'eSewa Mobile Wallet',
            status: 'Delivered',
            shippingAddress: `${user.location.address || 'New Baneshwor'}, ${user.location.city || 'Kathmandu'}, ${user.location.province || 'Kathmandu Valley'}`,
            email: user.email
          };

          const pastOrder2: LocalOrder = {
            id: 'BN-' + Math.floor(Math.random() * 90000 + 10000) + '-LTP',
            date: 'May 14, 2026',
            items: [
              {
                productId: 'prod_5',
                name: 'Tactical Sports Smartwatch',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
                color: 'Space Black',
                quantity: 1,
                price: 8900
              }
            ],
            subtotal: 8900,
            shippingCharge: 0, // Free shipping above 5000 NPR
            total: 8900,
            paymentMethod: 'Cash on Delivery',
            status: 'Delivered',
            shippingAddress: `${user.location.address || 'Sanepa Area'}, ${user.location.city || 'Lalitpur'}, ${user.location.province || 'Kathmandu Valley'}`,
            email: user.email
          };

          const consolidated = [pastOrder1, pastOrder2, ...savedOrders];
          localStorage.setItem('buynow_orders', JSON.stringify(consolidated));
          localStorage.setItem(seedKey, 'true');
          savedOrders = consolidated;
        }

        // Filter orders only relevant to the currently active logged-in account
        const userSpecificOrders = savedOrders.filter(order => order.email === user.email);
        setOrders(userSpecificOrders);

        // Auto-expand the topmost order if it exists
        if (userSpecificOrders.length > 0) {
          setExpandedOrders({ [userSpecificOrders[0].id]: true });
        }
      } catch (e) {
        console.error('Error fetching orders from localStorage db:', e);
      }
    };

    fetchOrders();
  }, [user.email, isOpen]);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleClearHistory = () => {
    if (window.confirm('Do you want to clear your local order history? New orders from checks will still be saved.')) {
      try {
        const savedOrdersRaw = localStorage.getItem('buynow_orders');
        const saved: LocalOrder[] = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];
        const filtered = saved.filter(order => order.email !== user.email);
        localStorage.setItem('buynow_orders', JSON.stringify(filtered));
        localStorage.setItem(`buynow_orders_seeded_${user.email}`, 'true'); // Don't re-seed
        setOrders([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const calculateTotalInvested = () => {
    return orders.reduce((sum, o) => sum + o.total, 0);
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/60 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white/95 rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 text-left flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="user-profile-modal-dialog"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-150 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase text-blue-600 tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Customer Profile Portal
              </span>
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mt-1">
                My Retail Profile
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
            id="close-profile-modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          {/* User Meta Summary Board */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 relative grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Details</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <User size={13} className="text-orange-500" />
                  <span>Name:</span>
                  <span className="text-slate-900 font-bold">{user.name}</span>
                  {user.role === 'superadmin' && (
                    <span className="bg-amber-100 text-amber-800 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-205">Superadmin</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Mail size={13} className="text-slate-400" />
                  <span>Email:</span>
                  <span className="text-slate-800 font-semibold">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Phone size={13} className="text-slate-400" />
                  <span>Phone:</span>
                  <span className="text-slate-800 font-semibold">{user.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:border-l md:border-dashed md:border-slate-200 md:pl-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Delivery Station</h3>
              <div className="space-y-1 text-xs text-slate-500 font-medium">
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-800 font-bold">
                      {user.location.address || 'Not specified address'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {user.location.city}, {user.location.province}
                    </p>
                  </div>
                </div>
                {user.createdAt && (
                  <p className="text-[10px] text-slate-400 pt-1">
                    Profile Registered: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick summary stats ribbon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 border border-blue-100 p-3.5 text-center rounded-2xl shadow-xs">
              <span className="text-[9.5px] font-bold uppercase text-blue-600 tracking-wider block">Total Orders</span>
              <span className="text-2xl font-black text-slate-800 block tracking-tight mt-0.5">{orders.length}</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 text-center rounded-2xl shadow-xs">
              <span className="text-[9.5px] font-bold uppercase text-emerald-700 tracking-wider block">Total Spent</span>
              <span className="text-2xl font-black text-slate-800 block tracking-tight mt-0.5">NPR {calculateTotalInvested().toLocaleString()}</span>
            </div>
          </div>

          {/* Order history section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Package size={15} className="text-blue-500" />
                <span>Our Purchase Order History</span>
              </h3>
              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[9px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2.5 py-1 border border-red-200 rounded-full cursor-pointer"
                >
                  <Trash2 size={10} />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 p-6 rounded-2xl">
                <Package size={36} className="text-slate-300 mx-auto mb-2.5" />
                <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">No Orders Logged Yet</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto font-medium leading-relaxed">
                  Real records will show up automatically right after you finish checking out customized products in your cart.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {orders.map((order) => {
                  const isExpanded = !!expandedOrders[order.id];
                  const dBadgeColor = order.status === 'Delivered' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-amber-400 text-amber-900';

                  return (
                    <div 
                      key={order.id} 
                      className="border border-slate-200 bg-white text-left shadow-sm rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300"
                    >
                      {/* Order main strip trigger button */}
                      <button
                        type="button"
                        onClick={() => toggleOrderExpand(order.id)}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors focus:outline-hidden cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                          <span className="font-bold text-slate-800 uppercase tracking-wide">
                            {order.id}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-2.5 py-0.5 font-bold border border-slate-150 text-slate-600 rounded-full">
                            {order.date}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 tracking-wider rounded-full ${dBadgeColor}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            NPR {order.total.toLocaleString()}
                          </span>
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </div>
                      </button>

                      {/* Expandable Order Details Block */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50/40 border-t border-slate-150 text-xs space-y-4">
                          {/* Order items nested list */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Purchased Items</h4>
                            <div className="space-y-1.5">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex gap-3 bg-white p-2 border border-slate-150 rounded-xl">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-10 h-10 object-cover border border-slate-105 rounded-lg bg-slate-100"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-700 truncate leading-tight uppercase text-[11px]">
                                      {item.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                      Option Selected: <strong className="text-slate-600">{item.color}</strong> • Qty: <strong>{item.quantity}</strong>
                                    </p>
                                  </div>
                                  <div className="text-right text-[11px] font-bold text-slate-800 self-center">
                                    NPR {item.price.toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping address & pricing break */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-dashed border-slate-205">
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Shipping Destination</h4>
                              <p className="text-[10.5px] font-semibold text-slate-600 leading-normal">
                                {order.shippingAddress}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                Gateway selected: <strong className="text-slate-600 font-bold">{order.paymentMethod}</strong>
                              </p>
                            </div>

                            <div className="space-y-1 md:text-right bg-white p-2.5 border border-slate-200 rounded-xl text-[11px]">
                              <div className="flex justify-between md:justify-end gap-x-4 font-bold text-slate-400">
                                <span>Subtotal:</span>
                                <span>NPR {order.subtotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between md:justify-end gap-x-4 font-bold text-slate-400">
                                <span>Shipping Charge:</span>
                                <span>
                                  {order.shippingCharge === 0 ? 'FREE' : `NPR ${order.shippingCharge}`}
                                </span>
                              </div>
                              <div className="flex justify-between md:justify-end gap-x-4 font-extrabold text-slate-800 border-t border-slate-100 pt-1 mt-1 text-xs">
                                <span>Total Payment:</span>
                                <span>NPR {order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-150 mt-5">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to log out from your active session?')) {
                onSignOut();
                onClose();
              }
            }}
            className="p-2.5 px-3 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 font-bold text-2xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded-xl"
            id="modal-signout-btn"
          >
            <LogOut size={12} />
            <span>Sign Out Profile</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-2xs uppercase tracking-wider rounded-xl cursor-pointer select-none"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}
