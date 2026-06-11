import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { Product } from '../types';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null; // Null means adding a new product
  onSaveSuccess: (updatedProduct: Product) => void;
}

export default function AdminProductModal({
  isOpen,
  onClose,
  product,
  onSaveSuccess,
}: AdminProductModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [colors, setColors] = useState('');
  const [stock, setStock] = useState('10');
  const [features, setFeatures] = useState('');
  
  // Drag and drop / local file upload states
  const [dragActive, setDragActive] = useState(false);
  const [imageType, setImageType] = useState<'upload' | 'url'>('upload');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please drop or select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setImages((prev) => [...prev, event.target!.result as string]);
      }
    };
    reader.onerror = () => {
      setError('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach((file: any) => processFile(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file: any) => processFile(file));
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:image/')) {
      setError('Please enter a valid HTTP or HTTPS image URL.');
      return;
    }
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    setError('');
  };

  // Specs state: simple array of key-value pairs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchronize dynamic form when product to edit changes
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(String(product.price || ''));
      setOriginalPrice(String(product.originalPrice || ''));
      
      const fixedCategories = ['Electronics', 'Fashion', 'Accessories'];
      if (fixedCategories.includes(product.category)) {
        setCategory(product.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(product.category);
      }
      
      const loadedImages: string[] = [];
      if (product.image) {
        loadedImages.push(product.image);
      }
      if (Array.isArray(product.images)) {
        product.images.forEach((img) => {
          if (img && !loadedImages.includes(img)) {
            loadedImages.push(img);
          }
        });
      }
      setImages(loadedImages);
      setUrlInput('');
      
      const hasBase64 = loadedImages.some((i) => i.startsWith('data:image/'));
      setImageType(hasBase64 || loadedImages.length === 0 ? 'upload' : 'url');

      setColors(Array.isArray(product.colors) ? product.colors.join(', ') : '');
      setStock(String(product.stock !== undefined ? product.stock : '10'));
      setFeatures(Array.isArray(product.features) ? product.features.join('\n') : '');
      
      if (product.specs && typeof product.specs === 'object') {
        const specPairs = Object.entries(product.specs).map(([key, val]) => ({
          key,
          value: String(val)
        }));
        setSpecs(specPairs.length > 0 ? specPairs : [{ key: '', value: '' }]);
      } else {
        setSpecs([{ key: '', value: '' }]);
      }
    } else {
      // Reset to defaults for addition
      setName('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setCategory('Electronics');
      setCustomCategory('');
      setImages([]);
      setUrlInput('');
      setImageType('upload');
      setColors('');
      setStock('10');
      setFeatures('');
      setSpecs([{ key: '', value: '' }]);
    }
    setError('');
  }, [product, isOpen]);

  // Spec handlers
  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const handleRemoveSpec = (index: number) => {
    const updated = specs.filter((_, i) => i !== index);
    setSpecs(updated.length > 0 ? updated : [{ key: '', value: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Product name is required.');
      setLoading(false);
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Product price must be a dynamic positive number.');
      setLoading(false);
      return;
    }

    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stock units must be a non-negative number.');
      setLoading(false);
      return;
    }

    // Resolve Category
    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please choose or enter a product category.');
      setLoading(false);
      return;
    }

    // Format specs to record object
    const finalSpecs: Record<string, string> = {};
    specs.forEach((item) => {
      if (item.key.trim()) {
        finalSpecs[item.key.trim()] = item.value.trim();
      }
    });

    const parsedColors = colors
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c);

    const parsedFeatures = features
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f);

    const payload = {
      id: product?.id, // Includes ID if editing
      name,
      description,
      price: priceNum,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category: finalCategory,
      image: images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
      images: images,
      colors: parsedColors,
      stock: stockNum,
      features: parsedFeatures,
      specs: finalSpecs,
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product details to server.');
      }

      onSaveSuccess(data.product);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Network error updating product catalog.');
    } finally {
      setLoading(false);
    }
  };

  const autofillPlaceholderUrl = (placeholderTheme: string) => {
    const urls: Record<string, string> = {
      iphone: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
      laptop: 'https://images.unsplash.com/photo-1496181130204-7552cc145cdb?auto=format&fit=crop&q=80&w=600',
      jacket: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
      shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
      watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    };
    if (urls[placeholderTheme]) {
      setImages((prev) => [...prev, urls[placeholderTheme]]);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/60 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white/95 rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-150 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#2563EB] tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-105">
              Superadmin Portal
            </span>
            <h2 className="text-xl font-bold text-slate-850 uppercase tracking-wide mt-1.5">
              {product ? 'Edit Product Parameters' : 'Add New Product to Store'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
            id="close-admin-modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 border border-red-200 font-bold text-xs mb-5 rounded-xl uppercase tracking-wide">
            ⚠️ {error}
          </div>
        )}

        {/* Dynamic form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title / Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple MacBook Pro M4"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-slate-800"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Category *</label>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-205 text-sm font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 bg-white rounded-xl flex-1 text-slate-700 cursor-pointer"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other (Type custom)</option>
                </select>
                {category === 'Other' && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Groceries"
                    className="p-2.5 bg-slate-50 border border-slate-205 text-sm font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 rounded-xl w-1/2 text-slate-850"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Selling Price (NPR) *</label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-205 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 rounded-xl font-semibold text-slate-800"
              />
            </div>

            {/* Original Price */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Original Price (NPR)</label>
              <input
                type="number"
                min="1"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="e.g. 18000"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-205 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 rounded-xl font-semibold text-slate-800"
              />
            </div>

            {/* Stock */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Stock Units *</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 25"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-205 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 rounded-xl font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Multiple Image Selection & Gallery Block */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-150">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Product Gallery Images ({images.length})</label>
              <div className="flex gap-1 bg-slate-105 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageType('upload')}
                  className={`text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    imageType === 'upload'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Upload size={10} />
                    Computer File
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageType('url')}
                  className={`text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    imageType === 'url'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <LinkIcon size={10} />
                    Web Link
                  </span>
                </button>
              </div>
            </div>

            {/* List of current thumbnails */}
            {images.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Images (First is primary thumbnail)</span>
                <div className="flex gap-2 flex-wrap items-center bg-white p-2.5 rounded-xl border border-slate-200">
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`relative w-16 h-16 rounded-lg border-2 p-0.5 bg-white shrink-0 group ${
                        idx === 0 ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-150'
                      }`}
                    >
                      <img
                        src={img}
                        alt="Thumbnail"
                        className="w-full h-full object-contain rounded-md"
                      />
                      {idx === 0 && (
                        <span className="absolute -top-1.5 -left-1.5 bg-blue-600 text-white text-[8px] px-1 rounded-full font-black uppercase scale-90 select-none">
                          Main
                        </span>
                      )}
                      
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-xs"
                        title="Remove Image"
                      >
                        <X size={8} />
                      </button>

                      {/* Move to front button */}
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setImages((prev) => {
                              const next = [...prev];
                              const [selected] = next.splice(idx, 1);
                              return [selected, ...next];
                            });
                          }}
                          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900/95 text-white text-[7px] font-bold tracking-wider px-1 py-0.5 rounded-sm scale-90"
                          title="Make Primary Cover"
                        >
                          Set Main
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imageType === 'upload' ? (
              <div
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-2xl p-4.5 text-center transition-all border-slate-200 hover:border-slate-300 bg-white"
              >
                <div className="flex flex-col items-center justify-center space-y-1.5 cursor-pointer">
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-full text-blue-600 mb-0.5 animate-bounce">
                      <Upload size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {images.length > 0 ? "Add another computer image" : "Drag & drop image here"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium pb-1">
                      or click to upload files
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-205 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 rounded-lg font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Link
                  </button>
                </div>
                {/* Quick autofill tag links */}
                <div className="flex gap-1.5 flex-wrap pt-1.5 border-t border-slate-100 mt-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mr-1 self-center">Autofill places:</span>
                  {['iphone', 'laptop', 'jacket', 'shoes', 'watch'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => autofillPlaceholderUrl(t)}
                      className="bg-slate-50 hover:bg-slate-900 border border-slate-200 text-slate-600 hover:text-white px-2 py-0.5 text-[9px] font-bold uppercase rounded-md cursor-pointer transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a convincing summary highlight description of your product..."
              rows={3}
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-205 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 rounded-xl font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Available Colors */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-650 tracking-wider block">Colors (Comma separated)</label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="Black, White, Natural Titanium"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-205 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 rounded-xl font-semibold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 font-bold leading-none block pt-1">Use commas to specify options customers can pick when adding to cart.</span>
            </div>

            {/* Bullet point features */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-650 tracking-wider block">Features (One line per feature)</label>
              <textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Pro Camera System (48MP Main)&#10;Up to 24 hours battery life&#10;Waterproof 5ATM"
                rows={3}
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-205 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 rounded-xl font-semibold text-slate-800 leading-normal"
              />
            </div>
          </div>

          {/* Product Specifications Key-Value */}
          <div className="space-y-2 border-t border-dashed border-slate-250 pt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">Product Specifications</label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="p-1 px-2.5 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 font-bold uppercase flex items-center gap-1 cursor-pointer rounded-lg transition-colors"
              >
                <Plus size={10} /> <span>Add spec row</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {specs.map((spec, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                    placeholder="Property (e.g. Weight)"
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-205 rounded-xl font-semibold text-slate-800"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 195 grams)"
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-205 rounded-xl font-semibold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                    title="Remove specification row"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action bar */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-150">
            <button
              type="button"
              onClick={onClose}
              className="p-3 px-5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="p-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 rounded-xl shadow-md shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none disabled:opacity-50 transition-all"
            >
              <Save size={14} />
              <span>{loading ? 'Saving Data...' : 'Save Product Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
