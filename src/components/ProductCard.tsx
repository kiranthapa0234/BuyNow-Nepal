import React from 'react';
import { Star, ShoppingCart, Info, Check, Pencil, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, color: string) => void;
  isAdmin?: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  onViewDetails, 
  onAddToCart,
  isAdmin = false,
  onEditProduct,
  onDeleteProduct
}: ProductCardProps) {
  const [justAdded, setJustAdded] = React.useState(false);

  // Format currency
  const formatNPR = (amount: number) => {
    return 'NPR ' + amount.toLocaleString();
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, product.colors[0]);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  // Stock status styling
  const isLowStock = product.stock <= 25;

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-md shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative text-left"
      id={`product-card-${product.id}`}
    >
      {/* Category and Discount Tags */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5">
        <span className="bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
          {product.category}
        </span>
        {hasDiscount && (
          <span className="bg-orange-500 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Admin Quick Controls */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEditProduct?.(product)}
            className="p-1.5 px-3 bg-amber-400 hover:bg-amber-500 text-black rounded-lg font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 shadow-xs cursor-pointer select-none"
            title="Edit Product"
          >
            <Pencil size={11} /> <span>Edit</span>
          </button>
          <button
            onClick={() => onDeleteProduct?.(product)}
            className="p-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 shadow-xs cursor-pointer select-none"
            title="Delete Product"
          >
            <Trash2 size={11} /> <span>Del</span>
          </button>
        </div>
      )}

      {/* Product Image Panel */}
      <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 overflow-hidden relative border-b border-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="object-contain h-4/5 w-4/5 rounded-xl transition-transform duration-300 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4.5 flex flex-col flex-1 text-left">
        {/* Rating and review section */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-amber-400">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                size={12}
                className={idx < Math.floor(product.rating) ? 'fill-amber-400 text-amber-500' : 'text-slate-205'}
              />
            ))}
          </div>
          <span className="text-slate-800 font-bold text-xs">{product.rating}</span>
          <span className="text-slate-400 text-[10px] font-medium">({product.reviewsCount})</span>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-bold text-slate-800 hover:text-blue-600 uppercase tracking-wide line-clamp-1 mb-1 transition-colors">
          {product.name}
        </h3>

        {/* Short description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 font-medium">
          {product.description}
        </p>

        {/* Stock status indicator */}
        <div className="text-[10px] font-bold uppercase tracking-wider mt-auto pb-3">
          {product.stock === 0 ? (
            <span className="text-red-500">Unavailable</span>
          ) : isLowStock ? (
            <span className="text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">Only {product.stock} left</span>
          ) : (
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">Available: {product.stock} units</span>
          )}
        </div>

        {/* Pricing Panel and Action Buttons */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-blue-600 leading-none tracking-tight">
              {formatNPR(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through mt-1 font-medium">
                {formatNPR(product.originalPrice!)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Quick Details Trigger */}
            <button
              onClick={() => onViewDetails(product)}
              className="p-2 bg-slate-50 hover:bg-slate-150 text-slate-700 rounded-xl hover:text-blue-600 transition-colors border border-slate-200"
              title="Specifications"
              id={`quick-info-${product.id}`}
            >
              <Info size={14} />
            </button>

            {/* Quick Add To Cart */}
            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className={`p-2 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none border ${
                justAdded
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : 'bg-blue-600 text-white hover:bg-blue-700 uppercase tracking-wider text-[10px] font-bold shadow-sm hover:shadow-md'
              } disabled:opacity-50 disabled:pointer-events-none`}
              title="Quick Add to Cart"
              id={`quick-add-${product.id}`}
            >
              {justAdded ? (
                <Check size={14} />
              ) : (
                <ShoppingCart size={14} />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
