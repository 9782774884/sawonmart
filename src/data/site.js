/** Homepage carousel banners. Copy is Hinglish; artwork is decorative SVG. */

export const BANNERS = [
  {
    id: 'hero-1',
    image: 'banners/hero-1.svg',
    eyebrow: 'SawonMart BBD',
    title: 'Mobiles Ka Maha-Bandoff',
    subtitle: '50% tak OFF + EMI 0% par',
    cta: 'Deals Dekhein',
    alt: 'Deep blue banner promoting the mobile phone sale',
  },
  {
    id: 'hero-2',
    image: 'banners/hero-2.svg',
    eyebrow: 'Fashion Fest',
    title: 'Nayi Collection, Naye Dost',
    subtitle: 'Shirts, Kurti aur Shoes par 60% OFF',
    cta: 'Shop Karo',
    alt: 'Red banner promoting the fashion sale',
  },
  {
    id: 'hero-3',
    image: 'banners/hero-3.svg',
    eyebrow: 'Home Needs',
    title: 'Ghar Ka Har Saman Ab Easy',
    subtitle: 'Free delivery 5000 se upar',
    cta: 'Explore',
    alt: 'Teal banner promoting home appliance delivery offers',
  },
  {
    id: 'hero-4',
    image: 'banners/hero-4.svg',
    eyebrow: 'Shukrawat Special',
    title: 'Weekend Mega Sale',
    subtitle: 'Extra 10% instant discount',
    cta: 'Grab Deal',
    alt: 'Amber banner promoting the weekend sale',
  },
  {
    id: 'hero-5',
    image: 'banners/hero-5.svg',
    eyebrow: 'Premium Electronics',
    title: 'Laptops & TVs, Best Price',
    subtitle: 'EMI 0% + bank offer 10%',
    cta: 'Dekhein',
    alt: 'Violet banner promoting premium electronics',
  },
];

/** Circular "shop by category" shortcuts. */
export const CATEGORIES = [
  { id: 'fashion', label: 'Fashion', image: 'categories/fashion.svg', count: '1.2M+' },
  { id: 'electronics', label: 'Electronics', image: 'categories/electronics.svg', count: '980K+' },
  { id: 'home', label: 'Home', image: 'categories/home.svg', count: '640K+' },
  { id: 'beauty', label: 'Beauty', image: 'categories/beauty.svg', count: '410K+' },
  { id: 'groceryFresh', label: 'Grocery', image: 'categories/groceryFresh.svg', count: '520K+' },
  { id: 'toys', label: 'Toys', image: 'categories/toys.svg', count: '310K+' },
  { id: 'travel', label: 'Travel', image: 'categories/travel.svg', count: '260K+' },
  { id: 'sports', label: 'Sports', image: 'categories/sports.svg', count: '180K+' },
  { id: 'topOffers', label: 'Top Offers', image: 'categories/topOffers.svg', count: 'Live' },
];

/** Brand logos strip. */
export const BRANDS = [
  { id: 'mi', label: 'Mi' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'sony', label: 'Sony' },
  { id: 'dell', label: 'Dell' },
  { id: 'adidas', label: 'adidas' },
  { id: 'puma', label: 'Puma' },
  { id: 'amazon', label: 'amazon' },
  { id: 'lego', label: 'LEGO' },
  { id: 'boat', label: 'boAt' },
  { id: 'realme', label: 'realme' },
  { id: 'pepsi', label: 'pepsi' },
];

/** Small promo tiles shown between sections. */
export const PROMOS = [
  { id: 'p1', image: 'banners/promo-1.svg', title: 'EMI 0% par', subtitle: 'Selected banks', alt: 'No cost EMI offer banner' },
  { id: 'p2', image: 'banners/promo-2.svg', title: 'Bank Offer 10%', subtitle: 'HDFC & Axis', alt: 'Bank discount banner' },
  { id: 'p3', image: 'banners/promo-3.svg', title: 'Free Delivery', subtitle: '5000 se upar', alt: 'Free delivery banner' },
];

/** Customer reviews. */
export const REVIEWS = [
  {
    id: 'rv-1',
    name: 'Rahul Verma',
    city: 'Pune',
    rating: 5,
    avatar: 'brand/avatar-a.svg',
    title: 'Delivery bahut tez thi',
    body: 'Maine Tuesday ko order kiya aur Wednesday subah 9 baje hi mil gaya. Product bilkul waisa hi hai jaisa picture mein. Packing bhi solid thi, koi corner damage nahi.',
    productId: 'sm-ph-01',
  },
  {
    id: 'rv-2',
    name: 'Ananya Sharma',
    city: 'Jaipur',
    rating: 4,
    avatar: 'brand/avatar-b.svg',
    title: 'Value for money',
    body: 'Is price mein 50MP camera aur AMOLED display — koi complaint nahi. Bas packaging thoda late tha, support team ne 2 din mein sort kar diya.',
    productId: 'sm-au-01',
  },
  {
    id: 'rv-3',
    name: 'Sandeep Rao',
    city: 'Hyderabad',
    rating: 5,
    avatar: 'brand/avatar-c.svg',
    title: 'Return process easy tha',
    body: 'Size exchange karna tha, pickup schedule hua aur 3 din mein refund aa gaya. Isse zyada kya expect kar sakte ho.',
    productId: 'sm-fa-04',
  },
];

/** Top announcement strip. */
export const TOP_STRIP = [
  'Flipkart Sale! Sab kuch 40% tak OFF',
  'Bank Offer: 10% instant discount',
  'No Cost EMI available',
  'Extra 5% off on SawonMart Axis Card',
  'Free delivery on orders over Rs.500',
];

/** Primary navigation bar. */
export const NAV_LINKS = [
  { id: 'electronics', label: 'Electronics', hasDropdown: true },
  { id: 'fashion', label: 'Fashion', hasDropdown: true },
  { id: 'home', label: 'Home', hasDropdown: true },
  { id: 'beauty', label: 'Beauty', hasDropdown: true },
  { id: 'appliances', label: 'Appliances', hasDropdown: true },
  { id: 'grocery', label: 'Grocery', hasDropdown: false },
  { id: 'books', label: 'Books', hasDropdown: false },
  { id: 'toys', label: 'Toys & Games', hasDropdown: false },
  { id: 'sports', label: 'Sports', hasDropdown: false },
  { id: 'travel', label: 'Travel', hasDropdown: false },
];

/** Mega-menu columns shown on hover/focus for nav items with a dropdown. */
export const NAV_MENUS = {
  electronics: [
    {
      heading: 'Mobiles',
      links: ['Smartphones', 'Android Phones', 'iPhones', '5G Phones', 'Budget Mobiles', 'Refurbished'],
    },
    {
      heading: 'Laptops & Tablets',
      links: ['Laptops', 'Tablets', 'iPads', 'Desktop PCs', 'Monitors', 'Laptop Accessories'],
    },
    {
      heading: 'Audio',
      links: ['Headphones', 'Earbuds', 'Bluetooth Speakers', 'Home Theatre', 'Soundbars', 'DJ Equipment'],
    },
    {
      heading: 'Cameras',
      links: ['DSLR Cameras', 'Mirrorless', 'Action Cameras', 'Webcams', 'Camera Accessories', 'Drones'],
    },
  ],
  fashion: [
    {
      heading: 'Men',
      links: ['T-Shirts', 'Shirts', 'Jeans', 'Jackets', 'Ethnic Wear', 'Footwear'],
    },
    {
      heading: 'Women',
      links: ['Kurtas & Suits', 'Dresses', 'Sarees', 'Western Wear', 'Handbags', 'Heels'],
    },
    {
      heading: 'Kids',
      links: ['Boys Clothing', 'Girls Clothing', 'Infant Wear', 'Kids Footwear', 'School Bags'],
    },
    {
      heading: 'Accessories',
      links: ['Watches', 'Wallets', 'Belts', 'Sunglasses', 'Perfumes', 'Hair Care'],
    },
  ],
  home: [
    {
      heading: 'Home Decor',
      links: ['Wall Decor', 'Vases', 'Candles', 'Clock', 'Showpieces', 'Cushions'],
    },
    {
      heading: 'Furniture',
      links: ['Sofas', 'Beds', 'Chairs', 'Tables', 'Wardrobes', 'Home Office'],
    },
    {
      heading: 'Kitchen',
      links: ['Cookware', 'Air Fryers', 'Mixers', 'Kettles', 'Dinner Sets', 'Storage'],
    },
    {
      heading: 'Bedding & Bath',
      links: ['Bed Sheets', 'Comforters', 'Pillows', 'Towels', 'Bath Mats', 'Curtains'],
    },
  ],
  beauty: [
    {
      heading: 'Makeup',
      links: ['Lipstick', 'Foundation', 'Kajal & Mascara', 'Eyeshadow', 'Compact Powder', 'Makeup Brushes'],
    },
    {
      heading: 'Skincare',
      links: ['Face Wash', 'Moisturiser', 'Sunscreen', 'Serum', 'Face Mask', 'Cleanser'],
    },
    {
      heading: 'Fragrance',
      links: ['Eau de Parfum', 'Body Mist', 'Attar & Deo', 'Gift Sets', 'Perfume Refills'],
    },
    {
      heading: 'Grooming',
      links: ['Shaving', 'Hair Care', 'Bath & Body', 'Men Grooming', 'Oral Care'],
    },
  ],
  appliances: [
    {
      heading: 'Kitchen Appliances',
      links: ['Refrigerators', 'Microwave Ovens', 'Air Fryers', 'Dishwashers', 'Chimneys', 'Gas Stoves'],
    },
    {
      heading: 'Air Care',
      links: ['Air Conditioners', 'Air Purifiers', 'Dehumidifiers', 'Fan', 'Heater'],
    },
    {
      heading: 'Laundry',
      links: ['Washing Machines', 'Dryers', 'Ironing Boards', 'Detergents'],
    },
    {
      heading: 'Large Appliances',
      links: ['Televisions', 'Water Purifiers', 'Room Heaters', 'Inverter Batteries'],
    },
  ],
};

/** Footer link groups. */
export const FOOTER_LINKS = [
  {
    heading: 'ABOUT',
    links: [
      'Contact Us',
      'About Us',
      'Careers',
      'SawonMart Stories',
      'Press',
      'Corporate Information',
      'SawonMart Sustainability',
    ],
  },
  {
    heading: 'HELP',
    links: [
      'Payments',
      'Shipping',
      'Cancellation &amp; Returns',
      'FAQ',
      'Report Infringement',
    ],
  },
  {
    heading: 'POLICY',
    links: [
      'Privacy Policy',
      'Return Policy',
      'Terms Of Use',
      'Grievance Redressal',
      'Do Not Sell Info',
    ],
  },
  {
    heading: 'CONSUMER POLICY',
    links: [
      'Cancellation &amp; Returns',
      'Return Policy',
      'Security',
      'Sitemap',
      'E-Commerce Rules',
      'Accessibility',
    ],
  },
  {
    heading: 'REDESSAL',
    links: [
      'Grievance Redressal Officer',
      'Grievance Redressal Committee',
      'Online NCL',
    ],
  },
];

/** Social profiles. */
export const SOCIAL_LINKS = [
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { id: 'twitter', label: 'Twitter', href: 'https://twitter.com' },
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
];

/** Small trust badges shown above the footer. */
export const TRUST_POINTS = [
  { id: 'secure', title: '100% Secure Payments', text: 'UPI, cards aur wallets — sab protected' },
  { id: 'delivery', title: 'Fast Delivery', text: '2000+ cities mein, doorstep tak' },
  { id: 'returns', title: 'Easy Returns', text: '7 din mein replacement ya refund' },
  { id: 'support', title: '24x7 Support', text: 'Hindi aur English mein madad' },
];