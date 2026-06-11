import React, { useState } from 'react';
import { X, Lock, Mail, Phone, MapPin, User, Navigation, Key, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserLocation } from '../types';
import { SHIPPING_REGIONS } from '../data/products';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login input state
  const [loginField, setLoginField] = useState('');

  // Location details (required data)
  const [province, setProvince] = useState('Kathmandu Valley');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [geoCoordinates, setGeoCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoSuccess, setGeoSuccess] = useState(false);

  const activeRegion = SHIPPING_REGIONS.find((r) => r.province === province) || SHIPPING_REGIONS[0];
  const cities = activeRegion.cities;

  // Sync cities when province changes
  React.useEffect(() => {
    if (cities && cities.length > 0) {
      setCity(cities[0]);
    }
  }, [province]);

  const handleGeoDetect = () => {
    setIsLocating(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGeoCoordinates({ lat: latitude, lng: longitude });
          setGeoSuccess(true);
          setIsLocating(false);
          // Auto add GPS details to manual address if blank
          if (!address) {
            setAddress(`GPS Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          }
        },
        (err) => {
          console.warn("Geolocation permission error: ", err);
          setError("Location permission refused or timed out. Please enter your location details manually.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setError("This browser device does not support high-fidelity geolocation tracing.");
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN FLOW
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginField, password }),
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Authentication credential validation failed.');
        }

        onAuthSuccess(data.user);
        onClose();
      } else {
        // SIGNUP FLOW
        if (!phone || phone.length < 10) {
          throw new Error('Please supply a valid 10-digit mobile number.');
        }

        const locationData: UserLocation = {
          province,
          city,
          address: address.trim(),
          latitude: geoCoordinates?.lat || null,
          longitude: geoCoordinates?.lng || null
        };

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
            location: locationData
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Account creation failed. Please check inputs.');
        }

        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'A transmission failure occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Main dialog panel */}
      <div 
        className="bg-white/95 rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200"
        id="auth-modal-dialog"
      >
        {/* Top title area */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Key size={16} className="text-orange-500" />
              <span>{isLogin ? 'Welcome Back!' : 'Create Retail Profile'}</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Secure Account Portal • BuyNow Nepal
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"
            id="auth-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab triggers */}
        <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${isLogin ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            id="auth-tab-login"
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${!isLogin ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            id="auth-tab-[signup]"
          >
            Register Account
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="bg-red-50 text-red-700 border-b border-slate-100 px-4 py-2.5 text-xs font-bold text-left flex items-start gap-2">
            <span className="shrink-0 text-red-500 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-left">
          {isLogin ? (
            /* LOGIN CONTENT PANEL */
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Email Address or Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter email or 10-digit mobile phone"
                    value={loginField}
                    onChange={(e) => setLoginField(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205/70 p-3 pl-10 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                    id="login-username-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Profile Password</label>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400">
                    <Lock size={14} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205/70 p-3 pl-10 pr-10 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                    id="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2.5 text-slate-400 uppercase tracking-widest text-[9px] font-bold">Quick Demo Access</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const res = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ loginField: 'buynownepal@buynow.com', password: 'buynow@01' })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || 'Superuser login failed.');
                    }
                    onAuthSuccess(data.user);
                    onClose();
                  } catch (err: any) {
                    setError(err.message || 'Transmission failure accessing superuser panel.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-orange-300 text-orange-600 hover:text-white bg-orange-50/50 hover:bg-orange-500 hover:border-orange-500 font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
              >
                <Sparkles size={12} className="animate-pulse" />
                <span>One-Click Superuser Access</span>
              </button>
            </div>
          ) : (
            /* SIGNUP CONTENT PANEL */
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Suman Rai"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205/70 p-3 pl-10 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                    id="signup-fullname-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="suman@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205/70 p-3 pl-10 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                      id="signup-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205/70 p-3 pl-10 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                      id="signup-phone-input"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Set Account Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400">
                    <Lock size={14} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205/70 p-3 pl-10 pr-10 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
                    id="signup-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Required location info partition */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} />
                    <span>Required Account Location</span>
                  </span>
                  
                  {/* GPS Locator Button */}
                  <button
                    type="button"
                    onClick={handleGeoDetect}
                    disabled={isLocating}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer ${
                      geoSuccess 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                    }`}
                    id="signup-gps-detector-btn"
                  >
                    {isLocating ? (
                      <span>Tracing...</span>
                    ) : geoSuccess ? (
                      <>
                        <CheckCircle2 size={10} className="text-emerald-600 fill-emerald-100" />
                        <span>Coordinates locked</span>
                      </>
                    ) : (
                      <>
                        <Navigation size={10} className="animate-bounce" />
                        <span>Detect Location</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Province Region</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-white border border-slate-205 p-2 rounded-xl text-xs text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
                      id="signup-province-select"
                    >
                      {SHIPPING_REGIONS.map((reg) => (
                        <option key={reg.province} value={reg.province}>
                          {reg.province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">District/City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
                      id="signup-city-select"
                    >
                      {cities && cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Street, Ward & Landmarking Landmark</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="E.g. Ward no. 4, Near Baneshwor Plaza, Kathmandu"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-205 p-2.5 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
                    id="signup-address-textarea"
                  />
                  {geoCoordinates && (
                    <span className="text-[9px] font-mono text-emerald-700 font-bold block mt-1">
                      🛰️ Custom GPS Locked: Latitude: {geoCoordinates.lat.toFixed(6)}, Longitude: {geoCoordinates.lng.toFixed(6)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              id="auth-submit-trigger"
            >
              {loading ? 'Authenticating Profile...' : isLogin ? 'Sign In Now' : 'Create My Retail Account'}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">
              {isLogin ? (
                <>
                  New to BuyNow Nepal?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setError(null); }}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setError(null); }}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Click to sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
