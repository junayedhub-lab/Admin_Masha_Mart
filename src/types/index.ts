// =============================================
// MASHA MART ADMIN - TypeScript Types
// =============================================

// ---- Users & Auth ----
export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'operations' | 'support';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Products ----
export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_pct: number;
  stock: number;
  sku: string | null;
  brand: string | null;
  is_featured: boolean;
  is_active: boolean;
  avg_rating: number;
  review_count: number;
  orders_count: number;
  images: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  price_modifier: number;
  stock: number;
  sku: string | null;
}

// ---- Categories ----
export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  children?: Category[];
  product_count?: number;
}

// ---- Orders ----
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  address_id: string | null;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  coupon_id: string | null;
  shipping_zone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
  address?: Address;
  user?: User;
  status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_image: string | null;
  variant_info: string | null;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  method: 'cod' | 'bkash' | 'nagad' | 'stripe';
  amount: number;
  status: 'pending' | 'pending_verification' | 'paid' | 'failed';
  transaction_id: string | null;
  screenshot_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  division: string | null;
  district: string | null;
  upazila: string | null;
  street: string;
  postal_code: string | null;
  is_default: boolean;
}

// ---- Marketing ----
export interface Coupon {
  id: string;
  code: string;
  type: 'flat' | 'percentage';
  value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_type: 'product' | 'category' | 'url' | 'promo' | null;
  link_value: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface FlashSale {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  items?: FlashSaleItem[];
}

export interface FlashSaleItem {
  id: string;
  flash_sale_id: string;
  product_id: string;
  sale_price: number;
  original_price: number;
  stock_limit: number | null;
  sold_count: number;
  product?: Product;
}

// ---- Reviews ----
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  user?: Pick<User, 'full_name' | 'avatar_url'>;
  product?: Pick<Product, 'name' | 'images'>;
}

// ---- Dashboard ----
export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  newCustomers: number;
  pendingOrders: number;
  yesterdayOrders: number;
  yesterdayRevenue: number;
  yesterdayCustomers: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

// ---- Filters ----
export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  payment?: string;
  page?: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
  sort?: 'name' | 'newest' | 'price_asc' | 'price_desc';
  page?: number;
}

export interface CustomerFilters {
  search?: string;
  status?: 'all' | 'active' | 'blocked';
  page?: number;
}
