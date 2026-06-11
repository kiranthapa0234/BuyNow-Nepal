import React from 'react';
import { ShieldCheck, ArrowRight, Check, Key, Smartphone, Lock, AlertCircle, Copy, CheckSquare, Upload, ArrowLeft } from 'lucide-react';

interface PaymentSimulationProps {
  paymentMethod: string;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function PaymentSimulation({
  paymentMethod,
  amount,
  onSuccess,
  onCancel,
}: PaymentSimulationProps) {
  const [step, setStep] = React.useState<'login' | 'otp' | 'processing' | 'success'>('login');
  const [walletPhone, setWalletPhone] = React.useState('');
  const [walletPin, setWalletPin] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [copiedText, setCopiedText] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [slipUploaded, setSlipUploaded] = React.useState(false);

  // Auto-generate transaction ID
  const txId = 'TXN-' + Math.floor(Math.random() * 9000000000 + 1000000000);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletPhone || walletPhone.length < 10) {
      setErrorMessage('Please include a valid 10-digit wallet account number.');
      return;
    }
    if (!walletPin || walletPin.length < 4) {
      setErrorMessage('Please enter your secure 4-digit PIN/Password.');
      return;
    }
    setErrorMessage('');
    setStep('otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMessage('Verification pin must contain at least 4 digits.');
      return;
    }
    setErrorMessage('');
    setStep('processing');
    
    // Simulate transaction delay
    setTimeout(() => {
      setStep('success');
      // Trigger checkout success redirect after short display
      setTimeout(() => {
        onSuccess(txId);
      }, 1500);
    }, 2000);
  };

  const handleBankConfirm = () => {
    if (!slipUploaded) {
      setErrorMessage('Please check file box to declare payment transfer.');
      return;
    }
    setStep('processing');
    setTimeout(() => {
      onSuccess(txId);
    }, 2000);
  };

  const handleCodConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      onSuccess('COD-ARRIVE-AT-DOOR');
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200">
      
      {/* Header bar outlining merchant details */}
      <div className="bg-white rounded-xl p-4 mb-4 border border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-left">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">
            SECURE MERCHANT TRANSACTION
          </span>
          <span className="text-base font-black text-gray-900 block mt-0.5">
            BuyNow Nepal Pvt. Ltd.
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100">
              ID: BUYNOWNP
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-100">
              Verified Gateway
            </span>
          </div>
        </div>
        <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
          <span className="text-xs font-bold text-gray-400 block uppercase">Payable Total</span>
          <span className="text-lg font-black text-blue-600">NPR {amount.toLocaleString()}</span>
        </div>
      </div>

      {/* RENDER BASED ON GATEWAY SPECIFIC STYLE */}
      
      {/* 💚 eSewa Simulator */}
      {paymentMethod === 'eSewa' && (
        <div className="bg-white rounded-2xl border-2 border-[#60B544]/20 overflow-hidden text-left shadow-lg">
          <div className="bg-[#60B544] p-4 text-white flex justify-between items-center">
            <span className="text-base font-black tracking-tight flex items-center gap-1">
              eSewa E-Payment Portal 💚
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
              Merchant Code: BUYNOWNP
            </span>
          </div>

          <div className="p-6">
            {step === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">eSewa ID (Mobile Number)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 focus:outline-hidden focus:border-[#60B544] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">eSewa Password (MPIN)</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="****"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm letter-spacing-4 focus:outline-hidden focus:border-[#60B544] focus:bg-white"
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errorMessage}
                  </p>
                )}
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#60B544] hover:bg-[#529e3a] text-white font-bold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Secure Login</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-800 font-medium mb-2">
                  We have sent a 6-digit mock Security Code to <strong>{walletPhone}</strong>. Enter code <strong>4829</strong> to test.
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750 block">One Time Password (OTP)</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Code 4829"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center text-base tracking-widest font-black focus:outline-hidden focus:border-[#60B544] focus:bg-white"
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs font-semibold text-red-600">
                    {errorMessage}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#60B544] hover:bg-[#529e3a] text-white font-bold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Pay {amount.toLocaleString()} NPR</span>
                  </button>
                </div>
              </form>
            )}

            {step === 'processing' && (
              <div className="py-8 text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent mx-auto" />
                <p className="text-xs font-bold text-gray-500">Contacting secure eSewa ledger database, do not refresh...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 bg-emerald-100 text-[#60B544] rounded-full flex items-center justify-center mx-auto border-2 border-[#60B544]/20 animate-bounce">
                  <Check size={26} className="stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-950 text-base">Payment Done!</h3>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">eSewa Reference ID: {txId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💜 Khalti Simulator */}
      {paymentMethod === 'Khalti' && (
        <div className="bg-white rounded-2xl border-2 border-[#5C2D91]/20 overflow-hidden text-left shadow-lg">
          <div className="bg-[#5C2D91] p-4 text-white flex justify-between items-center">
            <span className="text-sm font-black tracking-tight">Khalti Digital Payment Widget 💜</span>
            <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
              Demo Key: khalti_demo
            </span>
          </div>

          <div className="p-6">
            {step === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750 block">Khalti Registered Wallet Identity</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-[#5C2D91] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750 block">Khalti Transaction Pin</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="****"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-[#5C2D91] focus:bg-white animate-pulse-once"
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs font-bold text-red-500">{errorMessage}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#5C2D91] hover:bg-[#4b2476] text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Request OTP Code</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100 text-xs text-purple-800 font-medium mb-1">
                  Khalti Code triggered to <strong>{walletPhone}</strong>. Validate with <strong>3810</strong>.
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750 block">Confirm Khalti verification Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Code 3810"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center text-base tracking-widest font-black focus:outline-[#5C2D91]"
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs font-bold text-red-500">{errorMessage}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#5C2D91] hover:bg-[#4b2476] text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Finalize Secure Payment</span>
                  </button>
                </div>
              </form>
            )}

            {step === 'processing' && (
              <div className="py-8 text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent mx-auto" />
                <p className="text-xs font-bold text-gray-500 scroll-smooth">Synchronizing Khalti wallet validation...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 bg-purple-100 text-[#5C2D91] rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check size={26} className="stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-950 text-base">Payment Completed Successfully</h3>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">Khalti Tx ID: {txId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🧡 IME Pay Simulator */}
      {paymentMethod === 'IME Pay' && (
        <div className="bg-white rounded-2xl border-2 border-orange-500/20 overflow-hidden text-left shadow-lg">
          <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
            <span className="text-sm font-black tracking-tight">IME Pay Checkout Portal 🧡</span>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">
              Code: BNIME001
            </span>
          </div>

          <div className="p-6">
            {step === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750 block">IME Pay Smartphone Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-orange-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750 block">4-Digit IME Pay PIN</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="****"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-orange-500 focus:bg-white"
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs font-bold text-red-500">{errorMessage}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Initiate Session</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100 text-xs text-orange-850 font-medium mb-1">
                  Mock OTP sent. Authenticate using Code <strong>9204</strong>.
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-750 block">IME Security OTP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Type 9204"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center text-base font-black tracking-widest focus:outline-none focus:border-orange-500"
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs font-bold text-red-500">{errorMessage}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Complete Verification</span>
                  </button>
                </div>
              </form>
            )}

            {step === 'processing' && (
              <div className="py-8 text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent mx-auto" />
                <p className="text-xs font-bold text-gray-500">Connecting payment nodes at IME ledger, please stay...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <Check size={26} className="stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-950 text-base">IME Wallet Success</h3>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">IME Reference ID: {txId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🏛️ Bank Transfer Gateway details */}
      {paymentMethod === 'Bank Transfer' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-left shadow-md">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded">🏛️</span>
            <div>
              <h3 className="font-extrabold text-gray-950 text-sm">Nepal SBI or Nabil Bank Transfer</h3>
              <span className="text-[10px] text-gray-400 block font-semibold">Manual Verification System</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Please transfer the total invoice of <strong className="text-blue-600">NPR {amount.toLocaleString()}</strong> to either specified corporate account. After completion, verify by checking declarations box below.
            </p>

            <div className="space-y-3">
              {/* Account Card 1 */}
              <div className="border border-gray-150 rounded-xl p-3 bg-gray-50 relative group">
                <span className="absolute right-3 top-3 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                  Recommended
                </span>
                <span className="text-xs font-black text-gray-800 block">Nabil Bank Ltd.</span>
                <span className="text-[10px] text-gray-400 block font-semibold mt-0.5">Corporate Branch, Kathmandu</span>
                <div className="flex justify-between items-center mt-2 bg-white px-2 py-1 rounded border border-gray-200">
                  <span className="font-mono text-xs text-gray-700 font-extrabold tracking-wider">0024829103940192</span>
                  <button
                    onClick={() => copyToClipboard('0024829103940192')}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer"
                    title="Copy Account Number"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 block mt-1">Acc Name: <strong>BuyNow Nepal Pvt. Ltd.</strong></span>
              </div>

              {/* Account Card 2 */}
              <div className="border border-gray-150 rounded-xl p-3 bg-gray-50 relative">
                <span className="text-xs font-black text-gray-800 block">Nepal SBI Bank Ltd.</span>
                <span className="text-[10px] text-gray-400 block font-semibold mt-0.5">Head Office, New Baneshwor</span>
                <div className="flex justify-between items-center mt-2 bg-white px-2 py-1 rounded border border-gray-200">
                  <span className="font-mono text-xs text-gray-700 font-extrabold tracking-wider">102919302910392</span>
                  <button
                    onClick={() => copyToClipboard('102919302910392')}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 block mt-1">Acc Name: <strong>BuyNow Nepal Pvt. Ltd.</strong></span>
              </div>
            </div>

            {/* Simulated attachment slips */}
            <div className="border-t border-gray-100 pt-4 space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slipUploaded}
                  onChange={(e) => setSlipUploaded(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div className="leading-tight">
                  <span className="font-bold text-gray-900 block">I have transfered NPR {amount.toLocaleString()} successfully</span>
                  <span className="text-gray-400 block mt-0.5">Our accounting branch will verify the bank ledger within 2 hours.</span>
                </div>
              </label>

              {errorMessage && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errorMessage}
                </p>
              )}

              {isCopied && (
                <p className="text-[11px] font-bold text-emerald-600">
                  Copied Account number to clipboard!
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer text-center"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleBankConfirm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer"
                >
                  Submit Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📦 Cash on Delivery (COD) options */}
      {paymentMethod === 'Cash on Delivery' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-left shadow-md">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <span className="p-1.5 bg-orange-100 text-orange-600 rounded">📦</span>
            <div>
              <h3 className="font-extrabold text-gray-950 text-sm">Cash on Delivery (COD)</h3>
              <span className="text-[10px] text-gray-400 block font-semibold">Pay at the doorstep</span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-gray-500 leading-relaxed font-semibold">
              The shipment will be hand-delivered to your specified address. Please pay the invoice amount of <strong className="text-blue-600">NPR {amount.toLocaleString()}</strong> in cash (or local Fonepay scan code if courier supports) to the dispatch team upon arrival.
            </p>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3.5 space-y-2 text-gray-600">
              <span className="font-bold text-gray-800 block text-xs">🔒 Secure Verification Safeguard:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] font-medium">
                <li>You will receive a call from +977 9812345678 to verify dispatch.</li>
                <li>Please keep the exact cash amount ready for smooth logistics.</li>
                <li>Package check on delivery is fully supported.</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer text-center"
              >
                Change Payment Method
              </button>
              <button
                type="button"
                onClick={handleCodConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer"
                id="cod-confirm-btn"
              >
                Place COD Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
