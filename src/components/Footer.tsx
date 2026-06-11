import React from 'react';
import { ShoppingBag, Facebook, Instagram, Youtube, Linkedin, Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string) => void;
  activeTab: string;
}

export default function Footer({ onNavClick, activeTab }: FooterProps) {
  
  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com', icon: <Facebook size={16} /> },
    { name: 'Instagram', url: 'https://instagram.com', icon: <Instagram size={16} /> },
    { name: 'YouTube', url: 'https://youtube.com', icon: <Youtube size={16} /> },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: <Linkedin size={16} /> },
  ];

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800 text-left pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-gray-800">
        
        {/* Brand identity block */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white flex items-center justify-center">
              <ShoppingBag size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                BuyNow<span className="text-orange-500 font-extrabold">.</span>
              </span>
              <span className="text-[9px] tracking-widest text-gray-400 uppercase font-bold">Nepal</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Shop Smart, Live Better
          </p>
          <p className="text-xs text-gray-405 leading-relaxed max-w-sm">
            BuyNow Nepal is the country's premium online shopping ecosystem, connecting users with verified local and international partner brands with secure digital wallets and bank integrations.
          </p>
          
          {/* Social Icons row */}
          <div className="flex gap-2.5 pt-2">
            {socialLinks.map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-gray-900 border border-gray-850 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-gray-400"
                title={soc.name}
              >
                {soc.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Nav links */}
        <div className="md:col-span-3 space-y-4 text-xs">
          <h4 className="font-extrabold text-white uppercase tracking-widest text-[11px] border-b border-gray-900 pb-2">
            Quick Navigation
          </h4>
          <ul className="space-y-2 font-semibold">
            <li>
              <button 
                onClick={() => onNavClick('shop')}
                className={`hover:text-white transition-colors cursor-pointer ${activeTab === 'shop' ? 'text-blue-500' : 'text-gray-400'}`}
              >
                Explore Products Catalog
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('reviews')}
                className={`hover:text-white transition-colors cursor-pointer ${activeTab === 'reviews' ? 'text-blue-500' : 'text-gray-400'}`}
              >
                Verified Testimonials
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('contact')}
                className={`hover:text-white transition-colors cursor-pointer ${activeTab === 'contact' ? 'text-blue-500' : 'text-gray-400'}`}
              >
                Direct Support & Map location
              </button>
            </li>
          </ul>

          <div className="pt-2">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">FOUNDED STATE</span>
            <span className="text-xs text-gray-350 block mt-0.5">Established in 2024, Kathmandu.</span>
          </div>
        </div>

        {/* Secure integrations & shipping summary */}
        <div className="md:col-span-4 space-y-4 text-xs">
          <h4 className="font-extrabold text-white uppercase tracking-widest text-[11px] border-b border-gray-900 pb-2">
            Billing Security & Logistics
          </h4>
          <p className="text-xs text-gray-405 leading-relaxed">
            All transaction packages operate under corporate verified key registries. Supported integrations include eSewa, Khalti, IME Pay, cash on shipment, and direct bank clearances.
          </p>

          <div className="space-y-1 bg-gray-900 p-3 rounded-lg border border-gray-850">
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase">
              <ShieldCheck size={12} />
              <span>Gateway Certifications Verified</span>
            </div>
            <p className="text-[10px] text-gray-500 font-semibold leading-tight mt-0.5">
              Secure wallets tokenized. Keys: BUYNOWNP (eSewa), khalti_public_key_demo (Khalti).
            </p>
          </div>
        </div>

      </div>

      {/* Footer minimal credentials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-mono">
        <div>
          <span>© {new Date().getFullYear()} BuyNow Nepal Pvt. Ltd. All rights preserved.</span>
        </div>
        <div className="flex items-center gap-1 font-sans">
          <span>Proudly serving across 77 Districts of Nepal</span>
          <span className="text-red-500">❤️</span>
        </div>
      </div>
    </footer>
  );
}
