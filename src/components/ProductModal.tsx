import React from 'react';
import { X, Star, Shield, Truck, Calendar, ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color: string) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  if (!product) return null;

  // Compute a list of unique, valid colors for the product
  const colorsList = React.useMemo(() => {
    return Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors
      : ['Carbon Black'];
  }, [product]);

  const [selectedColor, setSelectedColor] = React.useState(colorsList[0]);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);

  // Compute a list of unique, valid images for the product
  const imagesList = React.useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'];
  }, [product]);

  const [activeImage, setActiveImage] = React.useState(imagesList[0]);

  // Sync color and active image when product changes
  React.useEffect(() => {
    setSelectedColor(colorsList[0]);
    setQuantity(1);
    setIsAdded(false);
    setActiveImage(imagesList[0]);
  }, [product, imagesList, colorsList]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose(); // Auto-close modal after successful added alert
    }, 1500);
  };

  // Pricing formatting
  const formatNPR = (amount: number) => {
    return 'NPR ' + amount.toLocaleString();
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Main modal surface */}
      <div 
        className="bg-white/95 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 flex flex-col md:flex-row transition-all scale-100 animate-in fade-in zoom-in-95 duration-200"
        id="product-detail-modal"
      >
        {/* Close button indicator */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 hover:text-black rounded-full text-slate-500 transition-colors cursor-pointer"
          id="modal-close-btn"
        >
          <X size={18} />
        </button>

        {/* Left Side: Product Image & Badges */}
        <div className="w-full md:w-1/2 bg-slate-50/50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-150">
          <div className="w-full max-w-sm aspect-square bg-white rounded-xl shadow-xs overflow-hidden p-4 flex items-center justify-center border border-slate-100">
            <img
              src={activeImage}
              alt={product.name}
              className="object-contain h-full w-full transition-all duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Multiple images thumbnail row */}
          {imagesList.length > 1 && (
            <div className="flex gap-2 mt-4 max-w-sm overflow-x-auto py-1 scrollbar-none justify-center">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`w-12 h-12 rounded-lg border bg-white p-0.5 shrink-0 overflow-hidden transition-all duration-150 cursor-pointer ${
                    activeImage === img
                      ? 'border-blue-600 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Core delivery assurance metrics */}
          <div className="w-full max-w-sm mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-start gap-2.5">
              <Truck size={16} className="text-orange-500 mt-0.5" />
              <div className="text-[11px] leading-tight font-semibold">
                <span className="text-gray-900 block font-bold">Fast Dispatch</span>
                <span className="text-gray-500 block">Deliver within 1-3 days across Nepal.</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-start gap-2.5">
              <Shield size={16} className="text-blue-500 mt-0.5" />
              <div className="text-[11px] leading-tight font-semibold">
                <span className="text-gray-900 block font-bold">100% Genuine</span>
                <span className="text-gray-500 block">Official warranty & return guarantee.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Informative panel */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col text-left">
          
          {/* Header Title & Ratings */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <span className="text-blue-600 font-extrabold text-xs uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
              {product.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 mt-2 leading-tight">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center text-yellow-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={15}
                    className={idx < Math.floor(product.rating) ? 'fill-yellow-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-gray-900 font-extrabold text-sm">{product.rating} / 5</span>
              <span className="text-gray-400 text-xs font-semibold">({product.reviewsCount} customer reviews)</span>
            </div>
          </div>

          <div className="flex-1 space-y-5">
            {/* Price block */}
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-blue-600">
                  {formatNPR(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through font-semibold">
                    {formatNPR(product.originalPrice!)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                Prices are inclusive of Nepalese VAT values.
              </span>
            </div>

            {/* General item Description */}
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Color selection buttons */}
            <div>
              <span className="text-xs font-bold text-gray-500 block mb-2 uppercase tracking-wider">
                Select Color: <span className="text-gray-900 font-extrabold">{selectedColor}</span>
              </span>
              <div className="flex gap-2">
                {colorsList.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    id={`color-opt-${color.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Features layout list */}
            <div>
              <span className="text-xs font-bold text-gray-500 block mb-2 uppercase tracking-wider">
                Highlights & Features
              </span>
              <ul className="space-y-1 text-xs text-gray-600 font-medium">
                {(product.features || []).map((feat, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-extrabold mt-0.5">✔</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Specifications specifications */}
            <div>
              <span className="text-xs font-bold text-gray-500 block mb-2 uppercase tracking-wider">
                Technical Specifications
              </span>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 overflow-hidden text-xs">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs || {}).map(([key, val]) => (
                      <tr key={key} className="border-b border-gray-200 last:border-0 py-1.5 flex justify-between">
                        <td className="font-bold text-gray-500 mr-2">{key}</td>
                        <td className="font-extrabold text-gray-800 text-right">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quantity controller & actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qty:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="p-2.5 text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 cursor-pointer"
                    id="quantity-decrease-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm text-gray-900 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    disabled={quantity >= product.stock}
                    className="p-2.5 text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 cursor-pointer"
                    id="quantity-increase-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Add button trigger */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 w-full flex items-center justify-center gap-2.5 font-bold py-3 px-6 rounded-xl transition-all cursor-pointer select-none ${
                  isAdded
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-md shadow-blue-500/10'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                id="modal-add-to-cart-btn"
              >
                {isAdded ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart Successfully!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Shopping Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Displaying stock warning in button footer */}
            <div className="font-bold text-[10px] text-center text-gray-400 uppercase tracking-widest mt-1">
              Currently {product.stock} items available in head office stockpile.
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
