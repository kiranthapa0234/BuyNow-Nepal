export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string; // Dynamic URL or base64 SVG representation
  images?: string[]; // Multiple images support
  category: string;
  colors: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  features: string[];
  specs: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface ShippingRegion {
  province: string;
  charge: number;
  cities: string[];
}

export interface OrderDetails {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  deliveryAddress: string;
  shippingCharge: number;
  isExpress: boolean;
  paymentMethod: string;
  subtotal: number;
  total: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  likes?: number;
}

export interface UserLocation {
  province: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: UserLocation;
  role?: string;
  createdAt?: string;
}
