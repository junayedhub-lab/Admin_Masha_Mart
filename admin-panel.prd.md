# 🧑‍💼 MASHA MART — ADMIN PANEL PRD
**Version:** 1.0.0 | **Platform:** React + Vite (TypeScript) | **Backend:** Supabase

> ⚙️ All business-specific values (brand, currency, tax, shipping zones, payment keys) are defined in `business.config.md`. This PRD references config keys where applicable.

---

## 📋 TABLE OF CONTENTS

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Admin Roles & Permissions](#4-admin-roles--permissions)
5. [Screen Inventory](#5-screen-inventory)
6. [Auth Module](#6-auth-module)
7. [Dashboard Module](#7-dashboard-module)
8. [Product Management Module](#8-product-management-module)
9. [Category Management Module](#9-category-management-module)
10. [Order Management Module](#10-order-management-module)
11. [Customer Management Module](#11-customer-management-module)
12. [Marketing Module](#12-marketing-module)
13. [Reports & Analytics Module](#13-reports--analytics-module)
14. [Support Module](#14-support-module)
15. [Settings Module](#15-settings-module)
16. [Database Tables (Admin Side)](#16-database-tables-admin-side)
17. [API Contracts (Admin)](#17-api-contracts-admin)
18. [Security & Access Control](#18-security--access-control)
19. [Performance Requirements](#19-performance-requirements)
20. [Future Scope](#20-future-scope)

---

## 1. PRODUCT OVERVIEW

**Panel Name:** `config → brand.app_name` Admin
**URL:** `https://admin.{config → brand.website_url}`
**Goal:** Give business operators full control over products, orders, customers, marketing, and analytics through a fast, clean web dashboard.

**Core Principles:**
- Role-based access: Super Admin, Operations, Support
- Action audit trail: all mutations logged
- Realtime order updates via Supabase Realtime
- Exportable data (CSV/PDF) for all key modules

---

## 2. TECH STACK

| Layer | Technology | Notes |
|---|---|---|
| Build Tool | Vite 5.x | Fast builds, HMR |
| UI Framework | React 18 + TypeScript | Strict mode |
| Styling | Tailwind CSS v3 | JIT mode, utility-first |
| Component Library | shadcn/ui + Radix UI | Accessible, headless primitives |
| Data Tables | TanStack Table v8 | Sorting, filtering, pagination |
| Charts | Recharts | Revenue, orders, analytics |
| State Management | Zustand | Auth state, UI state, filters |
| Server State | TanStack Query v5 | Caching, pagination, mutations |
| Routing | React Router v6 | Nested layouts, protected routes |
| Forms | React Hook Form + Zod | Type-safe schema validation |
| Rich Text Editor | TipTap | Product descriptions |
| PDF Generation | Supabase Edge Functions | Invoices, reports |
| File Upload | react-dropzone + Supabase Storage | Product images, banners |
| Date Handling | date-fns | Formatting, range pickers |
| Icons | Lucide React | Consistent icon set |
| Notifications | react-hot-toast | Admin action feedback |
| Backend | Supabase | Auth, DB, Storage, Realtime |
| Realtime | Supabase Realtime | Live order feed |
| Export | Papa Parse + jsPDF | CSV + PDF data export |

---

## 3. ARCHITECTURE

### Folder Structure

```
src/
├── config/
│   └── adminConfig.ts             ← Reads from business.config.yaml
├── lib/
│   ├── supabase.ts                ← Supabase admin client (service role)
│   ├── queryClient.ts             ← TanStack Query config
│   └── utils.ts                  ← cn(), formatCurrency(), formatDate()
├── types/
│   └── index.ts                  ← Shared TypeScript interfaces
├── store/
│   ├── authStore.ts               ← Zustand: admin session + role
│   └── uiStore.ts                 ← Zustand: sidebar open, active filters
├── hooks/
│   ├── useAdminAuth.ts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useCustomers.ts
│   └── useReports.ts
├── components/
│   ├── ui/                        ← shadcn/ui base components
│   │   ├── Button.tsx
│   │   ├── DataTable.tsx          ← TanStack Table wrapper
│   │   ├── DateRangePicker.tsx
│   │   ├── StatCard.tsx
│   │   └── ...
│   └── layout/
│       ├── AdminShell.tsx         ← Sidebar + topbar wrapper
│       ├── Sidebar.tsx
│       ├── Topbar.tsx
│       └── ProtectedRoute.tsx
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── VariantMatrix.tsx
│   │   │   └── BulkUpload.tsx
│   │   └── pages/
│   ├── categories/
│   ├── orders/
│   ├── customers/
│   ├── marketing/
│   │   ├── coupons/
│   │   ├── flash-sales/
│   │   └── banners/
│   ├── reports/
│   ├── support/
│   └── settings/
├── router/
│   └── index.tsx                  ← React Router v6 + role guards
└── main.tsx
```

### Key Config Files

```
├── vite.config.ts                 ← Path aliases, env vars, proxy
├── tailwind.config.ts             ← Admin theme tokens
├── tsconfig.json                  ← Strict mode, path aliases
├── .env.local                     ← VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_KEY
└── .env.production
```

### State Management Pattern

```
Admin Action (React Component)
  ↓
Zustand setter / TanStack Query mutation
  ↓
Custom Hook (useOrders, useProducts, etc.)
  ↓
Supabase JS SDK (service role)
  ↓
PostgreSQL (Supabase) + audit_log write
  ↑
TanStack Query cache invalidation → table/chart re-renders
```

### Tailwind Admin Theme

```typescript
// tailwind.config.ts (admin)
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#E91E63', dark: '#C2185B' },
        sidebar:   { bg: '#111827', text: '#9CA3AF', active: '#F9FAFB' },
        surface:   '#FFFFFF',
        muted:     '#F3F4F6',
        border:    '#E5E7EB',
        success:   '#16A34A',
        warning:   '#D97706',
        danger:    '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### Admin Layout Shell

```
┌───────────────────────────────────────────────────┐
│  🏪 [Logo]          [Notifications 🔔] [Admin ▾]  │  ← Top bar
├──────────┬────────────────────────────────────────┤
│          │                                        │
│  SIDEBAR │   MAIN CONTENT AREA                   │
│          │                                        │
│  • Dashboard         ← Active                    │
│  • Products                                      │
│  • Categories                                    │
│  • Orders                                        │
│  • Customers                                     │
│  • Marketing                                     │
│  • Reports                                       │
│  • Support                                       │
│  • Settings                                      │
│          │                                        │
└──────────┴────────────────────────────────────────┘
```

---

## 4. ADMIN ROLES & PERMISSIONS

| Permission | Super Admin | Operations | Support |
|---|---|---|---|
| View dashboard | ✅ | ✅ | ✅ |
| Add / edit products | ✅ | ✅ | ❌ |
| Delete products | ✅ | ❌ | ❌ |
| Manage categories | ✅ | ✅ | ❌ |
| View orders | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ✅ |
| Manage customers | ✅ | ✅ | ✅ |
| Block/unblock users | ✅ | ❌ | ❌ |
| Create coupons | ✅ | ✅ | ❌ |
| Manage banners | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ |
| Export data | ✅ | ✅ | ❌ |
| Manage settings | ✅ | ❌ | ❌ |
| Manage admin users | ✅ | ❌ | ❌ |

---

## 5. SCREEN INVENTORY

| # | Screen | Module | Route |
|---|---|---|---|
| 1 | Admin Login | Auth | `/login` |
| 2 | Dashboard | Dashboard | `/dashboard` |
| 3 | Products List | Products | `/products` |
| 4 | Add Product | Products | `/products/new` |
| 5 | Edit Product | Products | `/products/:id/edit` |
| 6 | Bulk Upload | Products | `/products/bulk-upload` |
| 7 | Inventory | Products | `/products/inventory` |
| 8 | Categories | Categories | `/categories` |
| 9 | Add Category | Categories | `/categories/new` |
| 10 | Orders List | Orders | `/orders` |
| 11 | Order Details | Orders | `/orders/:id` |
| 12 | Customers List | Customers | `/customers` |
| 13 | Customer Details | Customers | `/customers/:id` |
| 14 | Coupons | Marketing | `/marketing/coupons` |
| 15 | Flash Sales | Marketing | `/marketing/flash-sales` |
| 16 | Banners | Marketing | `/marketing/banners` |
| 17 | Sales Report | Reports | `/reports/sales` |
| 18 | Product Report | Reports | `/reports/products` |
| 19 | Customer Report | Reports | `/reports/customers` |
| 20 | Support Tickets | Support | `/support` |
| 21 | Payment Settings | Settings | `/settings/payments` |
| 22 | Shipping Settings | Settings | `/settings/shipping` |
| 23 | Tax Settings | Settings | `/settings/tax` |
| 24 | App Config | Settings | `/settings/app` |
| 25 | Admin Users | Settings | `/settings/admins` |

---

## 6. AUTH MODULE

### 6.1 Admin Login Screen

**Layout:** Centered card on branded background

**Fields:**
- Email address
- Password (toggle visibility)

**Actions:**
- Sign In → Supabase `signInWithPassword`
- After login: verify user exists in `admin_users` table with `is_active = true`
- If not admin → force logout + "Access denied" error

**2FA (optional):** `config → auth.admin_2fa_enabled`

**IP Whitelist:** `config → auth.admin_ip_whitelist` (empty = allow all)

**Session:** Admin sessions expire after 8 hours of inactivity.

---

## 7. DASHBOARD MODULE

### 7.1 Dashboard Overview Screen

**KPI Cards (top row):**

| Card | Value | Change |
|---|---|---|
| Total Orders (today) | Count | vs. yesterday |
| Revenue (today) | ৳ Amount | vs. yesterday |
| New Customers (today) | Count | vs. yesterday |
| Pending Orders | Count | Action required badge |

**Revenue Chart:**
- Line chart (fl_chart)
- X-axis: days of selected period
- Y-axis: revenue in BDT
- Date range picker: Today / Last 7 Days / Last 30 Days / Custom
- Toggle: Daily / Weekly / Monthly view

**Orders by Status (donut chart):**
- Each slice = status, color matches `config → orders.statuses`
- Click slice → filtered Orders List

**Top Selling Products (table):**

| Column | Description |
|---|---|
| # | Rank |
| Product | Thumbnail + name |
| Orders | Total order count |
| Revenue | Total revenue |
| Stock | Current inventory |

**Recent Orders (live table):**
- Last 10 orders, refreshed via Supabase Realtime
- Columns: Order ID, Customer, Total, Status, Time
- Click → Order Details

**Low Stock Alerts:**
- Products where `stock ≤ config → business.low_stock_threshold`
- Dismissable warning cards
- Click → Edit Product (inventory tab)

---

## 8. PRODUCT MANAGEMENT MODULE

### 8.1 Products List Screen

**Toolbar:**
- Search input (by name, SKU)
- Filter: Category, Status (active/inactive/out of stock), Brand
- Sort: Name A-Z, Newest, Price
- "Add Product" button (primary CTA)
- "Bulk Upload" button
- Selected count + Bulk Delete (when rows selected)

**Data Table Columns:**

| Column | Type |
|---|---|
| ☐ Checkbox | Multi-select |
| Thumbnail | 50×50 image |
| Product Name | Clickable → edit |
| SKU | Text |
| Category | Badge |
| Price | Currency |
| Stock | Number (color: green/orange/red) |
| Status | Active / Inactive toggle |
| Actions | Edit ✏️ Delete 🗑️ |

**Pagination:** 25 items per page, page selector + prev/next

---

### 8.2 Add / Edit Product Screen

**Form Sections:**

#### Basic Info
```
Product Name*       [__________________________]
Slug (auto)         [__________________________]  ← editable
Short Description   [__________________________]  ← 160 chars max
Description*        [Rich text editor — Quill]
Brand               [__________________________]
Tags                [tag input with chips]
```

#### Pricing & Stock
```
Regular Price (BDT)*  [_______]
Sale Price (BDT)      [_______]  ← blank = no discount
Cost Price            [_______]  ← internal, not shown to customer
Stock Quantity*       [_______]
SKU                   [_______]
Track Inventory       [Toggle]
Allow Backorders      [Toggle]  ← if config.allow_backorders = true
```

#### Images
```
[+ Upload Images]  ← drag & drop, multi-select, max: config.max_images_per_product
Order images by drag
First image = cover/thumbnail
Format: WebP auto-convert on upload
```

#### Variants (visible if `config → business.enable_variants: true`)
```
[+ Add Variant Type]
Variant Type: [Size ▾]    Values: [S] [M] [L] [XL] [+ Add]
Variant Type: [Color ▾]   Values: [Red] [Blue] [+ Add]

Variant Matrix (auto-generated):
┌──────────────┬──────┬──────┬──────┬────────────┐
│ Variant      │ SKU  │ Price│ Stock│ Active     │
├──────────────┼──────┼──────┼──────┼────────────┤
│ S / Red      │ [__] │ [__] │ [__] │ [toggle]   │
│ M / Red      │ [__] │ [__] │ [__] │ [toggle]   │
└──────────────┴──────┴──────┴──────┴────────────┘
```

#### Category & Visibility
```
Category*          [dropdown — hierarchical]
Subcategory        [dependent dropdown]
Featured Product   [Toggle]
Active             [Toggle]
```

**Save Actions:** "Save Draft" | "Save & Publish"

---

### 8.3 Bulk Upload Screen

**Template Download:** Pre-filled CSV/XLSX template with all columns

**Upload Flow:**
1. Upload CSV/XLSX file
2. Preview parsed data in table (first 10 rows)
3. Validate: highlight errors in red (missing required fields, invalid price, etc.)
4. Show summary: X valid rows, Y errors
5. "Confirm Import" → batch insert to Supabase

**Columns in template:**
`name, description, price, sale_price, stock, sku, category_slug, brand, tags, is_active`

---

### 8.4 Inventory Screen

**Purpose:** Quick stock management without full product edit.

**Table Columns:** Product, SKU, Variant, Current Stock, New Stock (editable input), Reason (dropdown: Restock / Adjustment / Damage)

**Bulk Update:** Edit multiple rows, "Save All Changes"

**Export:** CSV of current inventory snapshot

---

## 9. CATEGORY MANAGEMENT MODULE

### 9.1 Categories Screen

**Layout:** Tree view (collapsible parent → child)

**Category Row:**
- Drag handle (reorder display_order)
- Category image thumbnail
- Category name
- Product count
- Active toggle
- Edit ✏️ Delete 🗑️ (can't delete if has products)

**Add/Edit Category Modal:**
```
Category Name*        [__________________________]
Slug (auto)           [__________________________]
Parent Category       [None (Top-level) ▾]
Image*                [Upload image]
Display Order         [__] (auto-filled, draggable)
Active                [Toggle]
```

---

## 10. ORDER MANAGEMENT MODULE

### 10.1 Orders List Screen

**Filter Bar:**
- Date range picker
- Status filter (multi-select checkboxes per `config → orders.statuses`)
- Payment method filter
- Search (order ID or customer name/phone)

**Data Table Columns:**

| Column | Notes |
|---|---|
| Order ID | Clickable |
| Customer | Name + phone |
| Items | Count |
| Total | BDT |
| Payment | Method + status badge |
| Status | Color badge |
| Date | Relative + absolute |
| Actions | View 👁️ Print 🖨️ |

**Realtime:** New orders appear instantly (Supabase Realtime subscription on `orders` table, INSERT event). Bell sound + toast notification.

**Bulk Actions:** Export selected orders as CSV

---

### 10.2 Order Details Screen

**Header:**
```
Order #MM-2025-0042        Status: [Shipped ▾]   ← Dropdown to change status
Placed: Jan 10, 2025 · 2:30 PM
```

**Status Update Flow:**
- Admin selects new status from dropdown
- Confirmation dialog: "Change status to Shipped?"
- On confirm: updates `orders.status` + creates entry in `order_status_history`
- Triggers notification to customer (if `config → notifications.triggers.order_shipped: true`)

**Status History Timeline:**
```
✅ Order Placed      Jan 10 · 10:30 AM   by System
✅ Confirmed         Jan 10 · 11:00 AM   by admin@mashamart.com
✅ Shipped           Jan 11 · 9:00 AM    by ops@mashamart.com
```

**Customer Info Panel:**
- Name, email, phone, account link

**Delivery Address Panel:**
- Full formatted address
- Copy button

**Order Items Table:**

| Product | Variant | Qty | Unit Price | Total |
|---|---|---|---|---|
| [Thumb] Product Name | M / Blue | 2 | ৳500 | ৳1,000 |

**Payment Panel:**
- Method, status, transaction ID
- For manual payments (bKash/Nagad):
  - TrxID, screenshot preview
  - [✅ Verify Payment] / [❌ Reject] buttons
  - On verify → payment status = `paid`, order status → `confirmed`

**Price Summary:** Subtotal, discount, shipping, total

**Actions:**
- Generate Invoice → PDF via Edge Function → opens in new tab
- Cancel Order (if cancellable)
- Add Internal Note (stored in `order_notes`, not visible to customer)

---

## 11. CUSTOMER MANAGEMENT MODULE

### 11.1 Customers List Screen

**Filter Bar:**
- Search (name, email, phone)
- Status filter: All / Active / Blocked
- Registration date range

**Data Table Columns:**

| Column | Notes |
|---|---|
| Avatar + Name | Clickable |
| Email | |
| Phone | |
| Total Orders | |
| Total Spent | BDT |
| Status | Active / Blocked badge |
| Joined | Date |
| Actions | View 👁️ Block/Unblock |

---

### 11.2 Customer Details Screen

**Header:** Avatar, name, email, phone, join date, status badge

**Tabs:**

**Overview Tab:**
- KPIs: Total Orders, Total Spent, Avg Order Value, Last Order Date
- Recent activity timeline

**Orders Tab:**
- All orders by this customer (same table as Orders List, filtered)
- Click → Order Details

**Addresses Tab:**
- All saved addresses in a list

**Reviews Tab:**
- All reviews written by this customer

**Actions (Super Admin only):**
- Block Account → sets `is_blocked = true` in `users` table; invalidates session
- Unblock Account
- Delete Account (with double confirmation; soft delete)

---

## 12. MARKETING MODULE

### 12.1 Coupons Screen

**Coupon List Table:**

| Column | Notes |
|---|---|
| Code | Monospace font |
| Type | Flat / Percentage |
| Value | ৳ X or X% |
| Min Order | ৳ minimum |
| Usage | Used / Max (e.g., 45/100) |
| Valid Until | Date + expired badge |
| Active | Toggle |
| Actions | Edit ✏️ Delete 🗑️ |

**Add / Edit Coupon Modal:**
```
Coupon Code*          [SUMMER20]  [Auto-generate]
Discount Type*        [Percentage ▾ | Flat Amount]
Discount Value*       [20] %
Minimum Order (BDT)   [500]
Maximum Discount (BDT)[200]  ← cap for percentage discounts
Usage Limit           [100]  ← total across all users
Per-User Limit        [1]
Valid From*           [Date picker]
Valid Until*          [Date picker]
Active                [Toggle]
Applicable Categories [All ▾ / select specific]
```

---

### 12.2 Flash Sales Screen

**Flash Sale List:**
- Name, start/end datetime, product count, status (Scheduled/Live/Ended)
- Active sale shows live countdown

**Add / Edit Flash Sale:**
```
Sale Name*            [Summer Mega Sale]
Start Date/Time*      [Date-time picker]
End Date/Time*        [Date-time picker]
Active                [Toggle]

Products:
[Search & add products to flash sale]
┌────────────────────────────────────────────────────┐
│ Product         | Original Price | Sale Price | Remove│
│ Blue T-Shirt    | ৳800           | [600]      | ✕    │
└────────────────────────────────────────────────────┘
[+ Add Products]
```

---

### 12.3 Banners Screen

**Banner List:**
- Preview thumbnail (300×100)
- Title, link target, schedule dates, order, active toggle
- Drag to reorder

**Add / Edit Banner:**
```
Title*                [Summer Collection]
Image*                [Upload — recommended 1200×400px]
Click Action          [None | Product | Category | URL]
Target ID/URL         [dependent on action type]
Display Order         [auto, draggable]
Start Date            [Date picker — optional]
End Date              [Date picker — optional]
Active                [Toggle]
```

---

## 13. REPORTS & ANALYTICS MODULE

### 13.1 Sales Report Screen

**Controls:**
- Date range picker
- Group by: Day / Week / Month
- Export: CSV | PDF

**Widgets:**

**Revenue Chart:** Line chart, revenue over time

**Orders Chart:** Bar chart, order count over time

**Summary Cards:**
```
Total Revenue     ৳ XXX,XXX
Total Orders      XXX
Avg Order Value   ৳ X,XXX
New Customers     XX
```

**Revenue by Payment Method:** Donut chart (COD vs bKash vs Nagad vs Card)

**Revenue by Category:** Horizontal bar chart

**Detailed Table:** Day-by-day breakdown (Date, Orders, Revenue, Avg Order Value, New Customers)

---

### 13.2 Product Performance Report

**Controls:** Date range, category filter, export

**Top Products Table:**

| Rank | Product | Category | Units Sold | Revenue | Avg Rating |
|---|---|---|---|---|---|
| 1 | Blue T-Shirt | Fashion | 142 | ৳85,200 | 4.5 |

**Inventory Valuation:** Total stock value (stock × cost_price)

**Slow-Movers:** Products with 0 orders in last 30 days

---

### 13.3 Customer Insights Report

**Metrics:**
- New vs Returning customers (donut chart)
- Repeat purchase rate
- Customer Lifetime Value distribution
- Geographic distribution (division-level)
- Top customers by spend (table)

---

## 14. SUPPORT MODULE

### 14.1 Support Tickets Screen

> Enabled when `config → features.in_app_chat: false` — uses ticket system instead.

**Ticket List:**

| Column | Notes |
|---|---|
| #ID | |
| Customer | Name + email |
| Subject | First 80 chars |
| Status | Open / In Progress / Resolved / Closed |
| Priority | Low / Medium / High / Urgent |
| Assigned To | Admin user |
| Created | Relative date |

**Filter Bar:** Status, priority, assigned admin, date range

---

### 14.2 Ticket Details Screen

**Header:** Subject, status badge, priority badge, customer info

**Conversation Thread:**
```
👤 Customer [Jan 10 · 3:00 PM]
   I haven't received my order #MM-2025-0042...

🧑‍💼 Support Agent [Jan 10 · 3:30 PM]
   Hi! We're looking into this for you...
```

**Reply Box:** Rich text editor + "Send Reply" + "Attach File"

**Side Panel:**
- Ticket info (ID, created, last updated)
- Customer profile link
- Linked order (if applicable)
- Assign to admin dropdown
- Change status / priority

---

## 15. SETTINGS MODULE

### 15.1 Payment Settings

- Toggle each payment method on/off (reflects `config → payments.methods`)
- Update merchant numbers, API keys, instructions
- Set COD extra fee
- Configure payment timeout

> Changes here update the `app_settings` table in Supabase, which the user app reads at startup.

---

### 15.2 Shipping Settings

**Zones Table:**

| Zone Name | Delivery Fee (BDT) | Estimated Days | Active |
|---|---|---|---|
| Inside Dhaka | 60 | 1-2 | ✅ |
| Outside Dhaka | 120 | 3-5 | ✅ |

**Add/Edit Zone:** Name, fee, estimated days, active toggle

**Free Shipping Threshold:** BDT input field (0 = disabled)

---

### 15.3 Tax Settings

```
Tax System            [Inclusive ▾ | Exclusive]
Default Tax Rate (%)  [0]
Tax Label             [VAT / GST / Tax]
Show Tax Breakdown    [Toggle]
```

---

### 15.4 App Configuration

**Items editable in admin (stored in `app_settings` table):**

```
Maintenance Mode          [Toggle]  ← shows maintenance screen in app
Minimum App Version       [1.0.0]   ← force update if below this
Support Email             [support@mashamart.com]
Support Phone             [+880-1700-XXXXXX]
Social Links              [Facebook] [Instagram] [WhatsApp]
Onboarding Slides         [Edit CMS content per slide]
Footer Text               [Invoice footer message]
```

---

### 15.5 Admin User Management (Super Admin only)

**Admin Users Table:**

| Name | Email | Role | Last Login | Active |
|---|---|---|---|---|
| Masha Admin | admin@mashamart.com | Super Admin | 2h ago | ✅ |

**Invite Admin:**
```
Full Name*       [__________________________]
Email*           [__________________________]
Role*            [Operations ▾]
→ Sends invite email with set-password link
```

**Edit Admin:** Change role, active status
**Deactivate:** Sets `is_active = false` (does not delete — preserves audit trail)

---

## 16. DATABASE TABLES (ADMIN SIDE)

### admin_users
```sql
id              UUID PRIMARY KEY REFERENCES auth.users(id)
email           TEXT NOT NULL
full_name       TEXT
role            TEXT NOT NULL    -- super_admin | operations | support
is_active       BOOLEAN DEFAULT TRUE
last_login_at   TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### banners
```sql
id              UUID PRIMARY KEY
title           TEXT NOT NULL
image_url       TEXT NOT NULL
action_type     TEXT             -- none | product | category | url
action_target   TEXT
display_order   INT DEFAULT 0
start_date      DATE
end_date        DATE
is_active       BOOLEAN DEFAULT TRUE
created_by      UUID REFERENCES admin_users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### coupons
```sql
id              UUID PRIMARY KEY
code            TEXT UNIQUE NOT NULL
discount_type   TEXT NOT NULL    -- percentage | flat
discount_value  DECIMAL(10,2) NOT NULL
min_order_value DECIMAL(10,2) DEFAULT 0
max_discount    DECIMAL(10,2)
usage_limit     INT
per_user_limit  INT DEFAULT 1
used_count      INT DEFAULT 0
valid_from      TIMESTAMPTZ
valid_until     TIMESTAMPTZ
is_active       BOOLEAN DEFAULT TRUE
created_by      UUID REFERENCES admin_users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### flash_sales
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
start_at        TIMESTAMPTZ NOT NULL
end_at          TIMESTAMPTZ NOT NULL
is_active       BOOLEAN DEFAULT TRUE
created_by      UUID REFERENCES admin_users(id)
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### flash_sale_products
```sql
id              UUID PRIMARY KEY
flash_sale_id   UUID REFERENCES flash_sales(id)
product_id      UUID REFERENCES products(id)
sale_price      DECIMAL(10,2) NOT NULL
```

### order_status_history
```sql
id              UUID PRIMARY KEY
order_id        UUID REFERENCES orders(id)
from_status     TEXT
to_status       TEXT NOT NULL
changed_by      UUID REFERENCES admin_users(id) NULL  -- NULL = system
note            TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### order_notes
```sql
id              UUID PRIMARY KEY
order_id        UUID REFERENCES orders(id)
admin_id        UUID REFERENCES admin_users(id)
note            TEXT NOT NULL
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### support_tickets
```sql
id              UUID PRIMARY KEY
ticket_number   TEXT UNIQUE
user_id         UUID REFERENCES users(id)
order_id        UUID REFERENCES orders(id) NULL
subject         TEXT NOT NULL
status          TEXT DEFAULT 'open'  -- open | in_progress | resolved | closed
priority        TEXT DEFAULT 'medium'-- low | medium | high | urgent
assigned_to     UUID REFERENCES admin_users(id) NULL
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ
```

### ticket_messages
```sql
id              UUID PRIMARY KEY
ticket_id       UUID REFERENCES support_tickets(id)
sender_type     TEXT NOT NULL   -- customer | admin
sender_id       UUID NOT NULL
message         TEXT NOT NULL
attachments     TEXT[]
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### app_settings
```sql
key             TEXT PRIMARY KEY   -- 'maintenance_mode', 'min_app_version', etc.
value           TEXT NOT NULL
updated_by      UUID REFERENCES admin_users(id)
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### audit_log
```sql
id              UUID PRIMARY KEY
admin_id        UUID REFERENCES admin_users(id)
action          TEXT NOT NULL      -- 'product.create', 'order.status_update', etc.
entity_type     TEXT               -- 'product', 'order', 'coupon'
entity_id       UUID
old_values      JSONB
new_values      JSONB
ip_address      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## 17. API CONTRACTS (ADMIN)

> Admin uses Supabase service role key server-side. All mutations are also logged to `audit_log`.

### Products

```
GET    /rest/v1/products?select=*,categories(name)&order=created_at.desc
POST   /rest/v1/products                              ← create
PATCH  /rest/v1/products?id=eq.{id}                   ← update
DELETE /rest/v1/products?id=eq.{id}                   ← delete
POST   /functions/v1/bulk-import-products             ← Edge Function
```

### Orders

```
GET    /rest/v1/orders?select=*,user(*),items(*,product(*)),payment(*)
PATCH  /rest/v1/orders?id=eq.{id}                     ← status update
POST   /rest/v1/order_status_history                  ← log status change
POST   /functions/v1/generate-invoice?order_id={id}  ← Edge Function → PDF
```

### Reports (Edge Functions)

```
POST /functions/v1/report-sales
     Body: { start_date, end_date, group_by }

POST /functions/v1/report-products
     Body: { start_date, end_date, category_id }

POST /functions/v1/report-customers
     Body: { start_date, end_date }
```

### Marketing

```
POST   /rest/v1/coupons                               ← create coupon
PATCH  /rest/v1/coupons?id=eq.{id}                    ← update
DELETE /rest/v1/coupons?id=eq.{id}

POST   /rest/v1/flash_sales                           ← create
POST   /rest/v1/flash_sale_products                   ← add products

POST   /rest/v1/banners
PATCH  /rest/v1/banners?id=eq.{id}
DELETE /rest/v1/banners?id=eq.{id}
```

---

## 18. SECURITY & ACCESS CONTROL

### Row-Level Security (RLS) Policies

```sql
-- Admin users table: only super_admin can manage
CREATE POLICY admin_management ON admin_users
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin'));

-- Products: admins can write
CREATE POLICY admin_write_products ON products
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Orders: admins can read and update
CREATE POLICY admin_orders ON orders
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
```

### Audit Logging

Every mutation in the admin panel writes a record to `audit_log`:
- `action`: dot-notation (e.g., `product.create`, `order.status_update`)
- `old_values` and `new_values`: JSON snapshots (before/after)
- `ip_address`: captured from request headers

---

## 19. PERFORMANCE REQUIREMENTS

| Metric | Target |
|---|---|
| Dashboard load | < 2 seconds |
| Orders list (50 rows) | < 500ms |
| Report generation | < 3 seconds |
| Product save | < 1 second |
| Image upload (5MB) | < 5 seconds |
| Invoice PDF generation | < 3 seconds |

**Implementation:**
- Supabase indexes on: `orders.status`, `orders.user_id`, `products.category_id`, `orders.created_at`
- Reports use Supabase Edge Functions with pre-aggregated queries (not row-by-row)
- Dashboard KPIs fetched with a single aggregation Edge Function call
- Pagination: 25 rows default on all data tables

---

## 20. FUTURE SCOPE

| Feature | Priority | Config Flag |
|---|---|---|
| Multi-vendor seller portal | High | `features.multi_vendor` |
| Push campaign manager | Medium | — |
| AI-powered demand forecasting | Medium | `features.ai_recommendations` |
| Live chat (Realtime) | Medium | `features.in_app_chat` |
| Affiliate dashboard | Low | `marketing.enable_affiliate` |
| Subscription management | Low | `features.subscriptions` |
| POS integration | Low | — |
| Advanced A/B testing for banners | Low | — |
| WhatsApp order notifications | Medium | — |

---

*PRD Version 1.0.0 | Masha Mart Admin Panel | Reference `business.config.md` for all business-specific values.*
