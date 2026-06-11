import React from 'react';
import { X, Trash2, ShoppingCart, ArrowRight, Truck, Info } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, color: string) => void;
  onRemoveItem: (productId: string, color: string) => void;
  onCheckout: (shippingCharge: number, selectedRegion: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [shippingRegion, setShippingRegion] = React.useState('Kathmandu Valley');

  if (!isOpen) return null;

  // Formatting helper
  const formatNPR = (amount: number) => {
    return 'NPR ' + amount.toLocaleString();
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Calculate dynamic shipping
  let shippingCharge = 0;
  if (subtotal > 0 && subtotal < 5000) {
    if (shippingRegion === 'Kathmandu Valley') {
      shippingCharge = 100;
    } else if (shippingRegion === 'Remote Areas') {
      shippingCharge = 250;
    } else {
      shippingCharge = 150; // Major Cities / Other Provinces
    }
  } else if (subtotal >= 5000) {
    shippingCharge = 0; // Free Shipping above NPR 5000!
  }

  const grandTotal = subtotal + shippingCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-left border-l border-gray-100 animate-in slide-in-from-right duration-250"
          id="shopping-cart-drawer"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600" />
              <h2 className="text-lg font-black text-gray-900">Your Basket</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition cursor-pointer"
              id="close-cart-btn"
            >
              <X size={16} />
            </button>
          </div>

          {/* Cart Contents Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-gray-50 rounded-full border border-gray-100 text-gray-400">
                  <ShoppingCart size={36} className="stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Your card is empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Browse our high-quality Nepalese stock and start shopping!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white font-bold text-xs py-2.5 px-6 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  id="browse-shop-btn"
                >
                  Start Browsing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.selectedColor}`}
                    className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-150 relative group"
                    id={`cart-item-${item.product.id}`}
                  >
                    <div className="w-16 h-16 bg-white rounded-lg p-1 aspect-square flex items-center justify-center shadow-xs overflow-hidden border border-gray-100">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="object-cover h-full w-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 min-w-0 pr-6 text-left">
                      <h4 className="text-xs font-bold text-gray-950 truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                        Color: <span className="text-gray-800 font-bold">{item.selectedColor}</span>
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 bg-white rounded-md overflow-hidden">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor);
                              } else {
                                onRemoveItem(item.product.id, item.selectedColor);
                              }
                            }}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs text-gray-900 font-extrabold select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (item.quantity < item.product.stock) {
                                onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor);
                              }
                            }}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        
                        <span className="text-xs font-black text-blue-600">
                          {formatNPR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Trash/Delete Action */}
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.selectedColor)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-red-500 p-1 rounded-md transition cursor-pointer"
                      title="Remove product"
                      id={`remove-item-${item.product.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collated Bill summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
              
              {/* Dynamic Shipping calculator widget */}
              <div className="bg-white p-3 rounded-xl border border-gray-150 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Truck size={14} className="text-blue-600" />
                  <span>Estimate Shipping Charges</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={shippingRegion}
                    onChange={(e) => setShippingRegion(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-gray-700 focus:outline-hidden focus:border-blue-600"
                    id="shipping-region-select"
                  >
                    <option value="Kathmandu Valley">Kathmandu Valley (NPR 100)</option>
                    <option value="Major Cities">Major Cities Outside Valley (NPR 150)</option>
                    <option value="Remote Areas">Remote Areas of Nepal (NPR 250)</option>
                  </select>
                </div>

                {subtotal >= 5000 ? (
                  <div className="text-[10px] text-emerald-600 font-black flex items-center gap-1 bg-emerald-50 p-1.5 rounded border border-emerald-100">
                    <Info size={11} />
                    <span>Congrats! Your cart qualifies for FREE Shipping (Above NPR 5,000)!</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500 font-semibold flex items-center justify-between">
                    <span>Add {formatNPR(5000 - subtotal)} more to unlock free delivery.</span>
                    <span className="font-extrabold text-blue-600">Goal: Rs 5,000</span>
                  </div>
                )}
              </div>

              {/* Subtotal blocks */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-gray-500">
                  <span>Cart Subtotal</span>
                  <span className="text-gray-900 font-extrabold">{formatNPR(subtotal)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-500">
                  <span>Delivery Charge ({shippingRegion})</span>
                  <span className="text-gray-900 font-bold">
                    {shippingCharge === 0 ? 'FREE' : formatNPR(shippingCharge)}
                  </span>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-900">Grand Total</span>
                  <span className="font-black text-blue-600 text-base">{formatNPR(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => onCheckout(shippingCharge, shippingRegion)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md cursor-pointer select-none"
                id="drawer-checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
