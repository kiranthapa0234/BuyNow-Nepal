import React from 'react';
import { Mail, Phone, MapPin, Calendar, Clock, Sparkles, Send, Copy, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isSent, setIsSent] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill out all mandatory contact fields!');
      return;
    }
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 2500);
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText('27.6947° N, 85.3420° E');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left" id="contact-page-panel">
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h2 className="text-2xl font-black text-gray-950 tracking-tight">
          Contact Information & Support
        </h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 block">
          Reach BuyNow Nepal Corporate Head Office or Branch Nodes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Left Columns: Contact info & Operational hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-6">
            <div className="text-left space-y-1">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Direct Contacts</h3>
              <p className="text-xs text-gray-450 font-medium">Have queries about delivery times or payments? Talk directly to us!</p>
            </div>

            <div className="space-y-4">
              {/* Phone item */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Call or WhatsApp</span>
                  <a href="tel:+9779812345678" className="text-sm font-black text-gray-900 block hover:text-blue-600 transition-colors mt-0.5">
                    +977 9812345678
                  </a>
                  <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">WhatsApp enabled for immediate chats.</span>
                </div>
              </div>

              {/* Email item */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Official Email</span>
                  <a href="mailto:support@buynownepal.com" className="text-sm font-black text-gray-900 block hover:text-blue-600 transition-colors mt-0.5 animate-pulse-once">
                    support@buynownepal.com
                  </a>
                  <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">Expect response within 1 hour.</span>
                </div>
              </div>

              {/* Primary Address */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Head Office Address</span>
                  <span className="text-sm font-black text-gray-900 block mt-0.5">
                    New Baneshwor, Kathmandu, Nepal
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">Postal Code: 44600</span>
                </div>
              </div>

              {/* Branch Address */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Branch Office Location</span>
                  <span className="text-sm font-black text-gray-900 block mt-0.5">
                    Birtamode, Jhapa, Nepal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 text-left space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">
              Customer Support Hours
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={13} className="text-orange-500" />
                  <span>Sunday to Friday</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                  <Clock size={13} className="text-blue-600" />
                  <span>9:00 AM to 8:00 PM</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={13} className="text-orange-500" />
                  <span>Saturday</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold">
                  <Clock size={13} className="text-blue-600" />
                  <span>10:00 AM to 5:00 PM</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1 bg-yellow-50 p-2 rounded text-left border border-yellow-100">
              <AlertCircle size={12} className="text-orange-500 shrink-0" />
              <span>Saturday deliveries inside Kathmandu Valley run from 12:00 PM to 5:00 PM.</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Dynamic Geo Map and message dispatcher */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mock Interactive Compass/Leaflet Map wrapper */}
          <div className="bg-gray-950 text-white rounded-2xl p-5 border border-gray-800 space-y-4 relative overflow-hidden shadow-lg">
            
            {/* The mockup graphical location map */}
            <div className="bg-slate-900 h-64 rounded-xl relative border border-slate-800 flex items-center justify-center overflow-hidden">
              {/* Compass grid lines */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute h-px w-full bg-slate-800 top-1/2 left-0" />
              <div className="absolute w-px h-full bg-slate-800 left-1/2 top-0" />

              {/* Map abstract cities coordinates */}
              <div className="absolute text-[9px] font-mono text-slate-500 font-bold top-6 right-8 text-right">
                <span>NABIL BANK TOWER</span> <br />
                <span>KTM VALLEY 27.6947 N</span>
              </div>

              {/* Radial sonar wave around address */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-20 w-20 bg-blue-500/20 rounded-full animate-ping" />
                <div className="h-10 w-10 bg-orange-500/30 rounded-full absolute top-5 left-5" />
              </div>

              {/* The compass pin marker */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[45%] flex flex-col items-center">
                <div className="p-2.5 bg-blue-600 rounded-full text-white shadow-lg relative border border-white">
                  <MapPin size={16} className="animate-pulse" />
                </div>
                <div className="bg-slate-950 border border-slate-700 rounded px-2 py-1 mt-1.5 shadow-md">
                  <span className="text-[10px] font-extrabold tracking-tight font-sans text-white block">HEAD OFFICE</span>
                  <span className="text-[8px] font-mono text-gray-400 font-medium">New Baneshwor, Nepal</span>
                </div>
              </div>

              {/* Compass Cardinal labels */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black text-gray-500">N</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black text-gray-500">S</span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black text-gray-500">W</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black text-gray-500">E</span>
              
              {/* Copy coordinates trigger */}
              <button
                onClick={copyCoordinates}
                className="absolute bottom-3 left-3 bg-black/60 hover:bg-black text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer"
                id="copy-coords-btn"
              >
                <span>Coords: 27.6947, 85.3420</span>
                <Copy size={10} />
              </button>

            </div>

            {/* Geographical coordinates dashboard info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-left">
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase block">
                  GEOGRAPHIC REFERENCE LOCATOR
                </span>
                <span className="text-xs font-bold text-gray-300 mt-1 block leading-tight">
                  Latitude: 27.6947 • Longitude: 85.3420
                </span>
              </div>
              
              <a
                href="https://maps.google.com/?q=27.6947,85.3420"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 group focus:outline-hidden"
              >
                <span>Navigate in Google Maps</span>
                <span className="group-hover:translate-x-0.5 transition-transform">➔</span>
              </a>
            </div>

            {isCopied && (
              <p className="text-[10px] font-bold text-[#10B981] h-1">Copied coordinates to clip!</p>
            )}

          </div>

          {/* Quick message dispatch center */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 text-left shadow-xs">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">
              Deliver Message to Store Administrator
            </h4>

            {isSent ? (
              <div className="py-6 text-center space-y-3">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <Send size={16} />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-gray-900">Message Dispatched!</h5>
                  <p className="text-[11px] text-gray-500 font-medium">Thank you for contacting BuyNow Nepal. We will reply to your mail shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMessageSubmit} className="space-y-4 text-xs pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="contact@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Subject</label>
                  <input
                    type="text"
                    placeholder="General inquiry, bulk purchase request, delivery check..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Query Message <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={2.5}
                    placeholder="Write detailed inquiry notes here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs cursor-pointer select-none"
                  id="send-msg-btn"
                >
                  <Send size={13} />
                  <span>Send Secure Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
