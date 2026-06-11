import { Product, ShippingRegion, CustomerReview } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'iphone-16-pro',
    name: 'Apple iPhone 16 Pro',
    description: 'The ultimate iPhone. Featuring a stunning Grade 5 Titanium design, the powerful A18 Pro chip, advanced Camera Control, and exceptional battery life.',
    price: 189999,
    originalPrice: 199999,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
    category: 'Electronics',
    colors: ['Black Titanium', 'White Titanium', 'Natural Titanium'],
    rating: 4.9,
    reviewsCount: 1284,
    stock: 45,
    features: [
      'Pro Camera System (48MP Main, Ultrawide, and Telephoto)',
      'A18 Pro Chip with 16-core Neural Engine',
      'AAA gaming console support with hardware-accelerated ray tracing',
      'Action button and Camera Control side sensor',
      'Super Retina XDR display with ProMotion'
    ],
    specs: {
      'Display': '6.3-inch OLED touchscreen',
      'Processor': 'Apple A18 Pro',
      'Storage options': '128GB, 256GB, 512GB, 1TB',
      'OS': 'iOS 18',
      'Weight': '199 grams'
    }
  },
  {
    id: 'galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra',
    description: 'The pinnacle of mobile innovation. Crafted with premium Titanium, powered by the Snapdragon 8 Gen 4, equipped with an integrated S Pen, and featuring groundbreaking Galaxy AI.',
    price: 174999,
    originalPrice: 184999,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600',
    category: 'Electronics',
    colors: ['Titanium Black', 'Titanium Gray', 'Blue'],
    rating: 4.8,
    reviewsCount: 983,
    stock: 58,
    features: [
      'Embedded stylus S Pen for notes, drawing, and remote navigation',
      'Dynamic AMOLED 2X Display with adaptive 120Hz refresh rate',
      '200MP Main lens with dual telephoto and Space Zoom up to 100x',
      'Snapdragon 8 Gen 4 for Galaxy mobile platform',
      'All-day 5,000 mAh battery with 45W ultra-fast charging'
    ],
    specs: {
      'Display': '6.8-inch Dynamic AMOLED 2X',
      'Processor': 'Snapdragon 8 Gen 4 for Galaxy',
      'Storage options': '256GB, 512GB, 1TB',
      'OS': 'Android 15 with One UI 7',
      'Weight': '232 grams'
    }
  },
  {
    id: 'sony-alpha-zv-e10',
    name: 'Sony Alpha ZV-E10',
    description: 'Perfect for content creators. An interchangeable-lens vlog camera featuring a large APS-C sensor, high-quality directional microphone with wind screen, and ultra-fast autofocus.',
    price: 109999,
    originalPrice: 119999,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    category: 'Electronics',
    colors: ['Black', 'White'],
    rating: 4.8,
    reviewsCount: 421,
    stock: 20,
    features: [
      'Large 24.2 MP APS-C Exmor CMOS sensor for gorgeous depth of field',
      'Fast Hybrid AF and high-accuracy Real-time Eye AF',
      'Directional 3-capsule mic with wind screen included',
      'Vari-angle side-flip LCD screen for perfect selfie angles',
      '4K video recording with full pixel readout'
    ],
    specs: {
      'Sensor Type': '24.2 Megapixel APS-C CMOS',
      'Mount system': 'Sony E-mount',
      'ISO Range': '100 - 32,000 (Expandable to 51,200)',
      'Battery life': 'Approx. 440 shots or 80 minutes of video recording',
      'Connectivity': 'USB-C, Micro HDMI, 3.5mm Mic, Wi-Fi, Bluetooth'
    }
  },
  {
    id: 'nike-air-max',
    name: 'Nike Air Max Elite',
    description: 'Classic athletic footwear designed for unparalleled comfort and modern casual styling. Featuring visible Air cushioning, an engineered mesh upper, and a durable traction outsole.',
    price: 18500,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    category: 'Fashion',
    colors: ['Black', 'White', 'Blue'],
    rating: 4.7,
    reviewsCount: 562,
    stock: 150,
    features: [
      'Visible Air-Sole unit provides lightweight cushioning with energy rebound',
      'Breathable engineered mesh upper reinforced with leather/synthetic overlays',
      'Waffle-pattern solid rubber outsole for multitone traction and grid durability',
      'Premium padded collar for custom ankle luxury',
      'Reflective design highlights accentuating sleek night strides'
    ],
    specs: {
      'Upper Material': 'Engineered mesh and premium synthetic overlays',
      'Cushioning': 'Heel Air-Sole unit and full foam midsole',
      'Sole': 'Hardwearing waffle rubber',
      'Best Use': 'Running, Gym, Everyday Streetwear',
      'Weight': '340 grams'
    }
  },
  {
    id: 'mechanical-keyboard',
    name: 'BuyNow Tech Mechanical Gaming Keyboard',
    description: 'Premium tenkeyless layout mechanical keyboard featuring hot-swappable switches, dynamic customizable per-key RGB backlighting, and a heavy-duty aluminum frame.',
    price: 8500,
    originalPrice: 10500,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
    category: 'Accessories',
    colors: ['Black', 'Grey', 'White'],
    rating: 4.6,
    reviewsCount: 148,
    stock: 75,
    features: [
      'Hot-swappable mechanical keys (supports 3-pin or 5-pin switches)',
      'Pre-lubed linear red switches for silent, ultra-smooth keystrokes',
      'Full RGB backlight with 18 dynamic profile presets',
      'Anodized aluminum alloy top case for structural weight and stability',
      'Detachable double-sleeved USB Type-C high-speed cable'
    ],
    specs: {
      'Layout': 'TKL (Tenkeyless - 87 Keys)',
      'Switch Type': 'Linear Red Mechanical Switches',
      'Hot-swap': 'Yes, fully hot-swappable',
      'Keycaps': 'Double-shot PBT keycaps',
      'Compatibility': 'Windows, macOS, Linux, Consoles'
    }
  },
  {
    id: 'leather-wallet',
    name: 'Premium Leather Minimalist Bifold',
    description: 'Beautifully crafted bifold wallet manufactured with 100% genuine full-grain leather. Built with built-in RFID blocking safety and a sleek slimline profile that avoids pocket bulk.',
    price: 2800,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600',
    category: 'Fashion',
    colors: ['Brown', 'Black', 'Tan'],
    rating: 4.5,
    reviewsCount: 88,
    stock: 92,
    features: [
      'Made from 100% hand-selected full-grain vegetable-tanned leather',
      'Advanced RFID-blocking lining protects against digital skimming',
      'Slimline architecture holds up to 8 credit cards and 15 bank notes',
      'Quick-access front card pocket for convenient everyday commuting tap',
      'Elegant, heavy-duty stitching ensures years of faithful service'
    ],
    specs: {
      'Material': '100% Full-grain genuine leather',
      'Dimensions': '10.2 cm x 8.1 cm x 1.3 cm',
      'Pockets': '6 Card slots, 2 Hidden slide pockets, 1 Cash compartment',
      'Lining': 'Military-grade RFID-blocking composite',
      'Origin': 'Handcrafted in Nepal'
    }
  },
  {
    id: 'powercore-20k',
    name: 'Anker PowerCore 20,000mAh Power Bank',
    description: 'High-capacity heavy-duty portable power bank with exclusive PowerIQ tech for high-speed charging. Capable of charging modern smartphones up to 5 times over.',
    price: 4500,
    originalPrice: 5500,
    image: 'https://images.unsplash.com/photo-1609592424089-9a2961e6191b?auto=format&fit=crop&q=80&w=600',
    category: 'Accessories',
    colors: ['Black', 'White'],
    rating: 4.8,
    reviewsCount: 312,
    stock: 120,
    features: [
      'Massive 20,000mAh capacity provides multiple charges on long outings',
      'PowerIQ and VoltageBoost technologies deliver full high-speed charging',
      'MultiProtect safety suite prevents overcharging, voltage spikes, and heating',
      'Dual output USB ports to charge two devices concurrently',
      'Matte scratch-resistant finish keeps the unit looking pristine'
    ],
    specs: {
      'Capacity': '20,000 mAh / 74Wh',
      'Input Port': 'Micro-USB & USB-C',
      'Output Ports': '2 x USB-A (PowerIQ enabled)',
      'Dimensions': '15.8 cm x 7.4 cm x 1.9 cm',
      'Weight': '343 grams'
    }
  },
  {
    id: 'fitness-tracker',
    name: 'Smart Active Fitness Tracker Pro',
    description: 'Your wellness navigator. Keep tabs on heart rate, blood oxygen levels, sleep quality, and active statistics with a vivid 1.62-inch always-on AMOLED touchscreen.',
    price: 6200,
    originalPrice: 7500,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=600',
    category: 'Electronics',
    colors: ['Black', 'Blue', 'Pink'],
    rating: 4.6,
    reviewsCount: 194,
    stock: 65,
    features: [
      'Large high-definition always-on AMOLED pane with auto-brightness',
      'Continuous SpO2 blood-oxygen and 24h cardiac tracking',
      'Over 120 sports tracking profiles including swimming (5ATM water seal)',
      'Incredible battery lifespan lasting up to 14 days on a single load',
      'Intelligent smart notifications, alarms, and music playback controls'
    ],
    specs: {
      'Screen size': '1.62-inch AMOLED Panel',
      'Waterproof Index': '5 ATM (Waterproof up to 50 meters)',
      'Sensors': '6-axis sensor, PPG heart rate sensor, Ambient light sensor',
      'Connectivity': 'Bluetooth 5.2 BLE',
      'Battery capacity': '180 mAh'
    }
  }
];

export const SHIPPING_REGIONS: ShippingRegion[] = [
  {
    province: 'Kathmandu Valley',
    charge: 100,
    cities: ['Kathmandu', 'Lalitpur', 'Bhaktapur']
  },
  {
    province: 'Province 1',
    charge: 150,
    cities: ['Biratnagar', 'Dharan', 'Itahari', 'Birtamode', 'Damak']
  },
  {
    province: 'Madhesh Province',
    charge: 150,
    cities: ['Janakpur', 'Birgunj', 'Kalaiya']
  },
  {
    province: 'Bagmati Province',
    charge: 150,
    cities: ['Hetauda', 'Chitwan']
  },
  {
    province: 'Gandaki Province',
    charge: 150,
    cities: ['Pokhara', 'Baglung']
  },
  {
    province: 'Lumbini Province',
    charge: 150,
    cities: ['Butwal', 'Bhairahawa', 'Nepalgunj']
  },
  {
    province: 'Karnali Province',
    charge: 150,
    cities: ['Surkhet']
  },
  {
    province: 'Sudurpashchim Province',
    charge: 150,
    cities: ['Dhangadhi', 'Mahendranagar']
  }
];

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Suman Rai',
    location: 'Birtamode',
    rating: 5,
    comment: 'Ordered a camera and received it within 2 days. Genuine product. Very pleased with BuyNow Nepals service!',
    date: '2026-05-15'
  },
  {
    id: 'rev-2',
    author: 'Pratiksha Sharma',
    location: 'Kathmandu',
    rating: 5,
    comment: 'Easy payment through Khalti and super fast delivery within Kathmandu. Outstanding experience!',
    date: '2026-05-24'
  },
  {
    id: 'rev-3',
    author: 'Roshan Karki',
    location: 'Pokhara',
    rating: 4,
    comment: 'Product quality is excellent and customer support is highly responsive. Delivery was delayed by standard traffic but overall very stable.',
    date: '2026-06-02'
  },
  {
    id: 'rev-4',
    author: 'Nisha Thapa',
    location: 'Chitwan',
    rating: 5,
    comment: 'Best online shopping platform in Nepal. Highly competitive prices and authentic items.',
    date: '2026-06-08'
  }
];
