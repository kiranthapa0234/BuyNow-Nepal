import React from 'react';
import { X, Check, ArrowLeft, ArrowRight, ShieldCheck, MapPin, CreditCard, ShoppingBag, HelpCircle } from 'lucide-react';
import { CartItem, ShippingRegion, UserProfile } from '../types';
import { SHIPPING_REGIONS } from '../data/products';
import PaymentSimulation from './PaymentSimulation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  defaultShippingCharge: number;
  selectedRegionName: string;
  onOrderSuccess: () => void;
  user?: UserProfile | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  defaultShippingCharge,
  selectedRegionName,
  onOrderSuccess,
  user = null,
}: CheckoutModalProps) {
  if (!isOpen) return null;

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  
  // Delivery State Info
  const [fullName, setFullName] = React.useState(user ? user.name : '');
  const [email, setEmail] = React.useState(user ? user.email : '');
  const [phone, setPhone] = React.useState(user ? user.phone : '');
  const [selectedProvince, setSelectedProvince] = React.useState(user ? user.location.province : (selectedRegionName || 'Kathmandu Valley'));
  const [selectedCity, setSelectedCity] = React.useState(user ? user.location.city : '');
  const [deliveryAddress, setDeliveryAddress] = React.useState(user ? user.location.address : '');
  const [isExpress, setIsExpress] = React.useState(false);
  const [isRemoteArea, setIsRemoteArea] = React.useState(false);

  // Synchronize inputs dynamically when user session changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setSelectedProvince(user.location.province);
      setSelectedCity(user.location.city);
      setDeliveryAddress(user.location.address);
    }
  }, [user, isOpen]);

  // Payment Selection State
  const [selectedPayment, setSelectedPayment] = React.useState('eSewa');
  
  // Simulation Success State
  const [transactionId, setTransactionId] = React.useState('');
  const [orderId, setOrderId] = React.useState('');

  // Format currency
  const formatNPR = (amount: number) => {
    return 'NPR ' + amount.toLocaleString();
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Dynamic Cities list based on selected Province
  const activeRegion = SHIPPING_REGIONS.find((r) => r.province === selectedProvince) || SHIPPING_REGIONS[0];
  const cities = activeRegion.cities;

  // Initialize City when province changes
  React.useEffect(() => {
    setSelectedCity(cities[0] || '');
  }, [selectedProvince]);

  // Recalculating shipping charge live on checkout edits
  let calculatedShipping = 0;
  if (subtotal > 0 && subtotal < 5000) {
    if (isRemoteArea) {
      calculatedShipping = 250;
    } else {
      calculatedShipping = activeRegion.charge;
    }
  } else if (subtotal >= 5000) {
    calculatedShipping = 0; // Free shipping
  }

  // Add express delivery charge
  if (isExpress) {
    calculatedShipping += 300;
  }

  const billTotal = subtotal + calculatedShipping;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !deliveryAddress) {
      alert('Please fill out all mandatory shipping details.');
      return;
    }
    setStep(2);
  };

  const handlePaymentSuccess = (txId: string) => {
    const computedOrderId = 'BN-' + Math.floor(Math.random() * 90000 + 10000) + '-' + selectedCity.toUpperCase().slice(0, 3);
    setTransactionId(txId);
    setOrderId(computedOrderId);

    // Save order details to local storage
    const newOrder = {
      id: computedOrderId,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image,
        color: item.selectedColor,
        quantity: item.quantity,
        price: item.product.price
      })),
      subtotal,
      shippingCharge: calculatedShipping,
      total: billTotal,
      paymentMethod: selectedPayment,
      status: 'Processing',
      shippingAddress: `${deliveryAddress}, ${selectedCity}, ${selectedProvince}`,
      email: user?.email || email || 'guest@buynow.com'
    };

    try {
      const existingRaw = localStorage.getItem('buynow_orders');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(newOrder);
      localStorage.setItem('buynow_orders', JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to save order to localStorage', e);
    }

    setStep(4);
  };

  const handleFinishCheckout = () => {
    onOrderSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Surface block */}
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative border border-gray-150 flex flex-col text-left animate-in fade-in zoom-in-95 duration-200"
        id="checkout-dialog-modal"
      >
        {/* Header navigation bar inside checkout */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
              <span>Secure Cart Checkout</span>
              <ShieldCheck size={18} className="text-blue-600" />
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              BuyNow Nepal • Fast & Encrypted Gateway System
            </p>
          </div>
          {step < 4 && (
            <button
              onClick={onClose}
              className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-gray-500 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Progress header tracking dots */}
        {step < 4 && (
          <div className="bg-blue-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center text-xs text-blue-800 font-bold">
            <div className="flex items-center gap-1.5">
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
              <span>Shipping</span>
            </div>
            <span className="text-gray-300">➔</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
              <span>Billing</span>
            </div>
            <span className="text-gray-300">➔</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
              <span>Confirmation</span>
            </div>
          </div>
        )}

        {/* Form content pane */}
        <div className="p-6 flex-1">
          
          {/* STEP 1: Delivery detail entry form */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-1.5">
                Delivery Location Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Suman Rai"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="support@buynownepal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Province Region <span className="text-red-500">*</span></label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  >
                    {SHIPPING_REGIONS.map((reg) => (
                      <option key={reg.province} value={reg.province}>
                        {reg.province}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Delivery City <span className="text-red-500">*</span></label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Street/Thole Address & Landmarks <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  placeholder="E.g. Ward no. 5, Near Nabil Bank ATM building, New Baneshwor"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Express delivery check boxes */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Shipping Upgrades & Enhancments
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isExpress}
                      onChange={(e) => setIsExpress(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <div className="text-xs text-left">
                      <span className="font-bold text-gray-900 block">Express Shipping (+ NPR 300)</span>
                      <span className="text-gray-550 block mt-0.5">Priority express delivery queue. Save up to 24-48 hours.</span>
                    </div>
                  </label>

                  <label className="flex-1 flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRemoteArea}
                      onChange={(e) => setIsRemoteArea(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <div className="text-xs text-left">
                      <span className="font-bold text-gray-900 block">Remote Village (+ NPR 250 Base)</span>
                      <span className="text-gray-550 block mt-0.5">Settle extra carriage protocols for remote hill areas.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer summary details inside form */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500">Invoice Total: </span>
                  <strong className="text-base font-black text-blue-600">{formatNPR(billTotal)}</strong>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm cursor-pointer"
                  id="checkout-step1-next-btn"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: Secure Payment Selector */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-1.5 text-left">
                Choose Secure Payment Integration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {/* eSewa */}
                <button
                  onClick={() => setSelectedPayment('eSewa')}
                  className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                    selectedPayment === 'eSewa'
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  id="pay-opt-esewa"
                >
                  <span className="text-xl">💚</span>
                  <div>
                    <span className="text-xs font-black text-gray-950 block">eSewa Mobile Wallet</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Instantly pay via the eSewa Nepal merchant platform.</p>
                  </div>
                </button>

                {/* Khalti */}
                <button
                  onClick={() => setSelectedPayment('Khalti')}
                  className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                    selectedPayment === 'Khalti'
                      ? 'border-purple-600 bg-purple-50/30'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  id="pay-opt-khalti"
                >
                  <span className="text-xl">💜</span>
                  <div>
                    <span className="text-xs font-black text-gray-950 block">Khalti Pay</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Secure sandbox API checkout widget with SMS verification.</p>
                  </div>
                </button>

                {/* IME Pay */}
                <button
                  onClick={() => setSelectedPayment('IME Pay')}
                  className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                    selectedPayment === 'IME Pay'
                      ? 'border-orange-500 bg-orange-50/30'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  id="pay-opt-imepay"
                >
                  <span className="text-xl">🧡</span>
                  <div>
                    <span className="text-xs font-black text-gray-950 block">IME Pay</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Pay using official IME Wallet networks.</p>
                  </div>
                </button>

                {/* Bank Transfer */}
                <button
                  onClick={() => setSelectedPayment('Bank Transfer')}
                  className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                    selectedPayment === 'Bank Transfer'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  id="pay-opt-bank"
                >
                  <span className="text-xl">🏛️</span>
                  <div>
                    <span className="text-xs font-black text-gray-950 block">Bank Transfer (Nabil/SBI)</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Direct manual deposit into our corporate ledgers.</p>
                  </div>
                </button>
              </div>

              <div className="border-t border-gray-100 pt-3">
                {/* Cash on Delivery (COD) */}
                <button
                  onClick={() => setSelectedPayment('Cash on Delivery')}
                  className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                    selectedPayment === 'Cash on Delivery'
                      ? 'border-gray-800 bg-gray-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  id="pay-opt-cod"
                >
                  <span className="text-xl">📦</span>
                  <div>
                    <span className="text-xs font-black text-gray-950 block">Cash on Delivery (COD)</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Settle invoice bill when the package arrives safely inside {selectedCity}.</p>
                  </div>
                </button>
              </div>

              {/* Details table before transfer click */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-250 text-xs text-gray-600 font-medium space-y-1.5">
                <div className="flex justify-between">
                  <span>Contact Ship Name:</span>
                  <span className="font-extrabold text-gray-900">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispatch Destination:</span>
                  <span className="font-extrabold text-gray-900">{selectedCity}, {selectedProvince}</span>
                </div>
                <div className="flex justify-between">
                  <span>Freight Delivery Level:</span>
                  <span className="font-bold text-gray-950">{isExpress ? 'Express Dispatch 🚀' : 'Standard Delivery 🚚'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-gray-500 font-bold hover:text-black cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Update Address</span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg cursor-pointer"
                  id="checkout-step2-next-btn"
                >
                  <span>Verify Payment Setup</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Integrated Live Sandbox Payment Simulator */}
          {step === 3 && (
            <div className="space-y-4">
              <PaymentSimulation
                paymentMethod={selectedPayment}
                amount={billTotal}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setStep(2)}
              />
            </div>
          )}

          {/* STEP 4: Beautiful Electronic Receipt */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              
              <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-sm animate-bounce">
                <Check size={32} className="stroke-[3.5]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-gray-950">Purchase Authenticated!</h3>
                <p className="text-xs text-gray-500 font-medium">
                  We have received your order successfully. Your tracking and booking logs are detailed below.
                </p>
              </div>

              {/* Printable visual ticket */}
              <div className="bg-radial from-slate-50 to-gray-50 border border-gray-250 rounded-2xl p-5 mx-auto max-w-md text-left font-mono text-xs text-gray-700 space-y-4 shadow-sm relative overflow-hidden">
                
                {/* Visual barcode indicator */}
                <div className="absolute right-4 top-4 opacity-15">
                  <span className="text-4xl">🧾</span>
                </div>

                <div className="border-b border-dashed border-gray-300 pb-3">
                  <div className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-2">
                    <span className="font-extrabold text-[10px] text-gray-500">RECEIPT ID</span>
                    <span className="font-bold text-gray-900 text-xs">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold text-gray-900">June 11, 2026</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Pay Channel:</span>
                    <span className="font-extrabold text-blue-600">{selectedPayment}</span>
                  </div>
                  {transactionId && transactionId !== 'COD-ARRIVE-AT-DOOR' && (
                    <div className="flex justify-between mt-1">
                      <span>Gateway Ref:</span>
                      <span className="text-gray-900 font-bold truncate max-w-[170px]">{transactionId}</span>
                    </div>
                  )}
                </div>

                {/* Items loop */}
                <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Purchased Stocks</span>
                  {cart.map((item, id) => (
                    <div key={id} className="flex justify-between leading-tight text-[11px]">
                      <span className="text-gray-900 font-semibold truncate max-w-[190px]">
                        {item.product.name} (x{item.quantity})
                      </span>
                      <span className="font-bold text-gray-800">{formatNPR(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Final summary billing breakdown */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-gray-900">{formatNPR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight ({selectedProvince}):</span>
                    <span>{calculatedShipping === 0 ? 'FREE' : formatNPR(calculatedShipping)}</span>
                  </div>
                  <div className="h-px bg-gray-200 my-1.5" />
                  <div className="flex justify-between text-sm font-black">
                    <span className="text-gray-950 uppercase font-black">Grand Total:</span>
                    <span className="text-blue-600 text-sm font-black">{formatNPR(billTotal)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-3 text-[10px] text-gray-400 space-y-1 leading-tight font-semibold">
                  <span>Ship To: <strong>{fullName} ({phone})</strong></span>
                  <span className="block">Address: {deliveryAddress}, {selectedCity}</span>
                  <span className="block mt-2 text-center text-orange-600">
                    🚚 Expected Door Delivery: {isExpress ? 'Within 24-48 Hours!' : 'Within 2-3 Delivery Days.'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 font-medium max-w-md mx-auto leading-relaxed">
                Our support team is dispatching a tracking confirmation SMS now. Keep your device active! Feel free to reach out to <strong>support@buynownepal.com</strong> / <strong>+977 9812345678</strong> if any queries arrive.
              </div>

              <button
                onClick={handleFinishCheckout}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer"
                id="finish-checkout-btn"
              >
                Continue Shopping
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
