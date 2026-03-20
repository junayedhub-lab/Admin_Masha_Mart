# 🏢 BUSINESS CONFIGURATION FILE
> **Purpose:** Central config to adapt Masha Mart for any business with minimal code changes.
> Swap values here first before touching any feature-level code.

---

## 📌 CONFIG VERSION

```yaml
config_version: "1.0.0"
last_updated: "2025-01-01"
maintained_by: "Dev Team"
```

---

## 🏷️ 1. BRAND IDENTITY

```yaml
brand:
  app_name: "Masha Mart"             # Display name across app & admin
  app_slug: "mashamart"              # Lowercase, no spaces (used in URLs, storage buckets)
  tagline: "Shop Smart, Live Better"
  logo_url: "assets/images/logo.png"
  logo_dark_url: "assets/images/logo_dark.png"
  favicon_url: "assets/images/favicon.ico"
  app_icon_url: "assets/images/app_icon.png"
  support_email: "support@mashamart.com"
  support_phone: "+880-1700-000000"
  website_url: "https://mashamart.com"
```

---

## 🎨 2. THEME & COLORS

```yaml
theme:
  # Primary palette
  primary_color: "#E91E63"          # Main brand color (buttons, CTAs)
  primary_light: "#F48FB1"
  primary_dark: "#C2185B"

  # Secondary palette
  secondary_color: "#FF6F00"        # Accents, badges, highlights
  secondary_light: "#FFB300"
  secondary_dark: "#E65100"

  # Neutral
  background_color: "#F9F9F9"
  surface_color: "#FFFFFF"
  error_color: "#D32F2F"
  success_color: "#388E3C"
  warning_color: "#F57C00"

  # Typography
  font_family_primary: "Poppins"
  font_family_secondary: "Roboto"
  font_base_size: 14               # px

  # Dark mode
  dark_mode_support: true
  default_theme: "light"           # "light" | "dark" | "system"
```

---

## 🌍 3. LOCALE & REGION

```yaml
locale:
  default_language: "en"
  supported_languages:
    - code: "en"
      name: "English"
    - code: "bn"
      name: "বাংলা"
  
  currency:
    code: "BDT"
    symbol: "৳"
    position: "prefix"             # "prefix" | "suffix"
    decimal_places: 0

  timezone: "Asia/Dhaka"
  date_format: "DD/MM/YYYY"
  time_format: "12h"               # "12h" | "24h"
  country_code: "BD"
  phone_prefix: "+880"
```

---

## 🛒 4. BUSINESS MODEL

```yaml
business:
  type: "single_vendor"            # "single_vendor" | "multi_vendor" (future)
  category_type: "general"         # "general" | "grocery" | "fashion" | "electronics" | "food"

  # Product settings
  enable_variants: true            # Size, color, etc.
  enable_digital_products: false
  enable_rental: false
  max_images_per_product: 8

  # Inventory
  track_inventory: true
  allow_backorders: false
  low_stock_threshold: 5           # Notify admin when stock <= this

  # Pricing
  enable_bulk_pricing: false
  enable_price_comparison: false   # Show strikethrough MRP
  tax_inclusive_pricing: true

  # Ratings
  enable_reviews: true
  review_requires_purchase: true
  min_review_chars: 20
  allow_review_images: true
```

---

## 💳 5. PAYMENT METHODS

```yaml
payments:
  currency: "BDT"

  methods:
    cash_on_delivery:
      enabled: true
      label: "Cash on Delivery"
      icon: "assets/icons/cod.png"
      extra_fee: 0                 # Additional COD charge (0 = free)

    bkash:
      enabled: true
      label: "bKash"
      icon: "assets/icons/bkash.png"
      merchant_number: "01XXXXXXXXX"
      type: "manual"               # "manual" | "api"
      instructions: "Send money to 01XXXXXXXXX and enter TrxID below."

    nagad:
      enabled: true
      label: "Nagad"
      icon: "assets/icons/nagad.png"
      merchant_number: "01XXXXXXXXX"
      type: "manual"
      instructions: "Send money to 01XXXXXXXXX and enter TrxID below."

    stripe:
      enabled: false
      label: "Card Payment"
      publishable_key: ""
      webhook_secret: ""

    sslcommerz:
      enabled: false
      store_id: ""
      store_passwd: ""
      sandbox: true

  # Payment behavior
  require_payment_on_order: false  # false = pay at delivery is default
  auto_confirm_cod: true
  payment_timeout_minutes: 30
```

---

## 🚚 6. SHIPPING & DELIVERY

```yaml
shipping:
  enable_shipping: true

  zones:
    - name: "Inside Dhaka"
      base_fee: 60
      estimated_days: "1-2"
    - name: "Outside Dhaka"
      base_fee: 120
      estimated_days: "3-5"
    - name: "Chittagong"
      base_fee: 100
      estimated_days: "2-3"

  free_shipping_above: 1000        # Order value in BDT (0 = disabled)
  enable_express_delivery: false
  enable_same_day: false

  # Tracking
  enable_order_tracking: true
  tracking_provider: "custom"      # "custom" | "pathao" | "redx" | "steadfast"
```

---

## 🔔 7. NOTIFICATIONS

```yaml
notifications:
  # Push notifications
  push:
    enabled: true
    provider: "firebase"           # "firebase" | "onesignal"
    firebase_project_id: ""
    firebase_server_key: ""

  # SMS
  sms:
    enabled: false
    provider: "twilio"             # "twilio" | "bdbulksms"
    sender_id: "MashaMart"

  # Email
  email:
    enabled: true
    provider: "resend"             # "resend" | "sendgrid" | "smtp"
    from_address: "noreply@mashamart.com"
    from_name: "Masha Mart"

  # Notification triggers
  triggers:
    order_placed: true
    order_confirmed: true
    order_shipped: true
    order_delivered: true
    order_cancelled: true
    payment_received: true
    flash_sale_start: true
    new_offers: true
    review_reply: false
```

---

## 🎯 8. MARKETING & PROMOTIONS

```yaml
marketing:
  # Coupons
  enable_coupons: true
  max_coupon_discount_percent: 50

  # Flash sales
  enable_flash_sales: true
  flash_sale_countdown_visible: true

  # Banners
  home_banner_count: 5
  banner_auto_scroll: true
  banner_scroll_interval_seconds: 4

  # Referrals
  enable_referral_program: false
  referral_reward_amount: 50       # BDT

  # Loyalty points
  enable_loyalty_points: false
  points_per_bdt: 1
  points_to_bdt_ratio: 0.01

  # Affiliate
  enable_affiliate: false          # Future scope
```

---

## 🔐 9. AUTH & SECURITY

```yaml
auth:
  # Login methods
  email_password: true
  google_oauth: true
  facebook_oauth: false
  phone_otp: false

  # Session
  session_timeout_hours: 720       # 30 days
  require_email_verification: false
  guest_checkout: false

  # Password rules
  min_password_length: 6
  require_special_char: false

  # Admin auth
  admin_2fa_enabled: false
  admin_ip_whitelist: []           # Empty = allow all

  # Security
  max_login_attempts: 5
  lockout_duration_minutes: 30
  api_rate_limit_per_minute: 60
```

---

## 📦 10. ORDER SETTINGS

```yaml
orders:
  statuses:
    - id: "pending"
      label: "Pending"
      color: "#FF9800"
    - id: "confirmed"
      label: "Confirmed"
      color: "#2196F3"
    - id: "processing"
      label: "Processing"
      color: "#9C27B0"
    - id: "shipped"
      label: "Shipped"
      color: "#00BCD4"
    - id: "delivered"
      label: "Delivered"
      color: "#4CAF50"
    - id: "cancelled"
      label: "Cancelled"
      color: "#F44336"
    - id: "returned"
      label: "Returned"
      color: "#795548"

  # Customer permissions
  allow_cancel_before: "shipped"   # Customer can cancel if status is before this
  allow_return_within_days: 7
  return_requires_approval: true

  # Invoice
  invoice_prefix: "MM"             # e.g., MM-2025-0001
  invoice_footer_text: "Thank you for shopping with Masha Mart!"
```

---

## 🖥️ 11. HOME SCREEN LAYOUT

```yaml
home_layout:
  sections:
    - type: "banner_slider"
      visible: true
      order: 1
    - type: "categories_horizontal"
      visible: true
      order: 2
      max_items: 8
    - type: "flash_deals"
      visible: true
      order: 3
    - type: "featured_products"
      visible: true
      order: 4
      max_items: 10
    - type: "new_arrivals"
      visible: true
      order: 5
      max_items: 10
    - type: "top_rated"
      visible: false
      order: 6

  # Bottom nav tabs
  bottom_nav:
    - id: "home"
      icon: "home"
      label: "Home"
    - id: "categories"
      icon: "grid"
      label: "Shop"
    - id: "cart"
      icon: "shopping_cart"
      label: "Cart"
    - id: "orders"
      icon: "receipt"
      label: "Orders"
    - id: "profile"
      icon: "person"
      label: "Profile"
```

---

## ⚙️ 12. SUPABASE & INFRASTRUCTURE

```yaml
infrastructure:
  supabase:
    project_url: "https://XXXX.supabase.co"
    anon_key: "YOUR_ANON_KEY"
    service_role_key: "YOUR_SERVICE_KEY"   # Server/admin only — never expose in app
    storage_bucket_products: "product-images"
    storage_bucket_banners: "banners"
    storage_bucket_avatars: "avatars"
    storage_bucket_reviews: "review-images"

  cdn:
    enabled: false
    provider: "cloudflare"
    base_url: ""

  analytics:
    enabled: false
    provider: "firebase"           # "firebase" | "mixpanel" | "amplitude"

  crash_reporting:
    enabled: false
    provider: "sentry"
    dsn: ""
```

---

## 🔮 13. FEATURE FLAGS

> Toggle features on/off without touching feature code.

```yaml
features:
  # Core
  wishlist: true
  product_comparison: false
  recently_viewed: true
  product_share: true

  # Social
  social_login_google: true
  social_login_facebook: false
  in_app_chat: false               # Future scope

  # Commerce
  multi_vendor: false              # Future scope
  subscriptions: false             # Future scope
  digital_products: false

  # AI / Advanced
  ai_recommendations: false        # Future scope
  voice_search: false
  ar_preview: false
  pwa_support: false

  # Admin
  advanced_analytics: true
  bulk_product_upload: true
  inventory_alerts: true
  chat_support: false
```

---

## 📱 13. APP STORE METADATA

```yaml
app_store:
  android:
    package_name: "com.mashamart.app"
    version_name: "1.0.0"
    version_code: 1

  ios:
    bundle_id: "com.mashamart.app"
    version: "1.0.0"
    build_number: 1

  web:
    base_url: "https://app.mashamart.com"
    pwa_name: "Masha Mart"
```

---

## 🔁 HOW TO CLONE FOR A NEW BUSINESS

1. Copy this file and rename: `business_[name].config.md`
2. Update **Section 1** — Brand Identity
3. Update **Section 2** — Colors & Theme
4. Update **Section 3** — Locale & Currency
5. Update **Section 4** — Business Model (category type, enable variants, etc.)
6. Update **Section 5** — Payment Methods (enable/disable, keys)
7. Update **Section 6** — Shipping zones & fees
8. Update **Section 12** — Supabase project credentials
9. Use **Section 13 Feature Flags** to enable/disable features
10. Reference this file in `src/config/appConfig.ts` (user app) and `src/config/adminConfig.ts` (admin panel)

> All values here map 1:1 to constants in `appConfig.ts` / `adminConfig.ts`. Never hardcode business values anywhere else in the codebase.
