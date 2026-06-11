import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, ShieldCheck, Truck, Sparkles, Star, Smartphone, HelpCircle } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  openAiAssistant: () => void;
}

export default function Hero({ onShopClick, openAiAssistant }: HeroProps) {
  // Statistics items
  const stats = [
    { label: 'Products', value: '25,000+' },
    { label: 'Customers', value: '100,000+' },
    { label: 'Orders Delivered', value: '300,000+' },
    { label: 'Average Rating', value: '4.8/5' },
  ];

  const benefits = [
    {
      icon: <ShieldCheck className="text-blue-600 h-5 w-5" />,
      title: 'Secure Payments',
      desc: '100% verified eSewa, Khalti, IME Pay, and Cards integrations.',
    },
    {
      icon: <Truck className="text-orange-500 h-5 w-5" />,
      title: 'Fast Nepal Delivery',
      desc: 'Inside KTM in 24 hours. Cover all 77 districts with tracking.',
    },
    {
      icon: <Sparkles className="text-emerald-500 h-5 w-5" />,
      title: 'Genuine Products',
      desc: 'Direct partner brands backings. No counterfeits.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#eff6ff] py-16 md:py-24 border-b border-gray-200">
      {/* Decorative background vectors */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 text-orange-500 font-extrabold text-xs tracking-[0.2em] uppercase"
            >
              <Sparkles size={12} className="text-orange-500 animate-spin" />
              <span>Shop Smart, Live Better</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hero-title-bold text-gray-950 font-black tracking-tighter"
              id="hero-heading"
            >
              NEPAL'S<br />
              TRUSTED<br />
              <span className="text-[#2563EB]">STORE<span className="text-[#F97316]">.</span></span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold"
              id="hero-subheading"
            >
              Secure payments through eSewa, Khalti, and IME Pay. Delivering happiness across 77 districts of Nepal since 2024.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={onShopClick}
                className="flex items-center gap-2 btn-bold-primary cursor-pointer active:scale-98 transition-transform"
                id="hero-shop-now-btn"
              >
                <ShoppingCart size={14} />
                <span>Shop Now</span>
              </button>

              <button
                onClick={() => alert("BuyNow Nepal App is cooking! Available soon on Android and iOS.")}
                className="flex items-center gap-2 bg-[#111827] hover:bg-gray-850 text-white font-extrabold uppercase text-xs tracking-wider px-5 py-4 rounded-md transition duration-205 cursor-pointer active:scale-98"
                id="hero-download-app-btn"
              >
                <Smartphone size={14} className="text-[#F97316]" />
                <span>Get App</span>
              </button>
            </motion.div>

            {/* Dynamic statistics ribbon */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-gray-200 text-left"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xl sm:text-2xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right graphics / Visual mockup with modern professional design */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white/80 p-6 rounded-3xl border border-white/40 shadow-xl backdrop-blur-md w-full max-w-sm relative md:rotate-[-2deg] hover:rotate-0 transition-all duration-300 shadow-slate-200/60"
            >
              {/* Promo tag */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full rotate-12 shadow-lg uppercase">
                FREE Delivery 🚚
              </div>

              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span>Featured partner promo</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-250">
                  Verified
                </span>
              </div>

              {/* Stacked interactive promo cards */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex items-center justify-center p-1 border border-slate-100 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=150"
                      alt="iPhone"
                      className="object-cover h-full w-full rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate">Apple iPhone 16 Pro</h3>
                    <div className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg inline-block mt-1 tracking-wider uppercase">
                      NPR 189,999
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-500 font-semibold">
                      <span className="bg-amber-100 text-amber-800 px-1 rounded">4.9 ★</span>
                      <span>(1.2K+ reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Simulated payment badges in modern glassy theme */}
                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-left space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                    Supported Secured Gateways
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                      eSewa 💚
                    </span>
                    <span className="bg-indigo-50 text-indigo-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-200">
                      Khalti 💜
                    </span>
                    <span className="bg-orange-50 text-orange-900 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-orange-200">
                      IME Pay 🧡
                    </span>
                  </div>
                </div>

                {/* Applet delivery badge */}
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-xl text-left text-xs font-bold text-blue-700 border border-blue-100">
                  <div className="p-1.5 bg-white rounded-lg text-blue-600 shadow-2xs">
                    <Truck size={14} />
                  </div>
                  <span>Free shipping above NPR 5,000!</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Benefits micro grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-100">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex gap-4.5 text-left bg-white p-5 rounded-2xl border border-slate-100 shadow-md shadow-slate-100 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex-shrink-0 p-3 bg-slate-50 h-fit rounded-xl">
                {benefit.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{benefit.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
