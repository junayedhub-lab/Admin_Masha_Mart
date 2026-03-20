// =============================================
// MASHA MART ADMIN - Configuration
// Maps from business.config.md
// =============================================

export const adminConfig = {
  brand: {
    app_name: 'Masha Mart',
    admin_title: 'Masha Mart Admin',
    app_slug: 'mashamart',
    tagline: 'Shop Smart, Live Better',
    support_email: 'support@mashamart.com',
    support_phone: '+880-1700-000000',
    website_url: 'https://mashamart.com',
  },

  theme: {
    primary_color: '#E91E63',
    primary_light: '#F48FB1',
    primary_dark: '#C2185B',
    secondary_color: '#FF6F00',
  },

  locale: {
    default_language: 'en',
    currency: {
      code: 'BDT',
      symbol: '৳',
      position: 'prefix' as 'prefix' | 'suffix',
      decimal_places: 0,
    },
    timezone: 'Asia/Dhaka',
    phone_prefix: '+880',
  },

  business: {
    type: 'single_vendor' as const,
    enable_variants: true,
    track_inventory: true,
    low_stock_threshold: 5,
    max_images_per_product: 8,
  },

  orders: {
    statuses: [
      { id: 'pending', label: 'Pending', color: '#FF9800' },
      { id: 'confirmed', label: 'Confirmed', color: '#2196F3' },
      { id: 'processing', label: 'Processing', color: '#9C27B0' },
      { id: 'shipped', label: 'Shipped', color: '#00BCD4' },
      { id: 'delivered', label: 'Delivered', color: '#4CAF50' },
      { id: 'cancelled', label: 'Cancelled', color: '#F44336' },
      { id: 'returned', label: 'Returned', color: '#795548' },
    ],
    invoice_prefix: 'MM',
  },

  shipping: {
    zones: [
      { name: 'Inside Dhaka', base_fee: 60, estimated_days: '1-2' },
      { name: 'Outside Dhaka', base_fee: 120, estimated_days: '3-5' },
      { name: 'Chittagong', base_fee: 100, estimated_days: '2-3' },
    ],
    free_shipping_above: 1000,
  },

  payments: {
    methods: [
      { id: 'cod', label: 'Cash on Delivery', enabled: true },
      { id: 'bkash', label: 'bKash', enabled: true },
      { id: 'nagad', label: 'Nagad', enabled: true },
      { id: 'stripe', label: 'Card Payment', enabled: false },
    ],
  },
} as const;

export type AdminConfig = typeof adminConfig;
