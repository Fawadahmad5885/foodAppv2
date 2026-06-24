# Fiesta Platform — Dashboard Requirements

> **Document purpose:** Requirements and module map for the **Super Admin** and **Vendor** dashboards.  
> **Status:** Planning — implementation will proceed module-by-module after sign-off.  
> **Last updated:** 2026-06-24

---

## 1. Overview

Fiesta is a multi-tenant food ordering platform. Today the **storefront** is implemented (menu, cart, checkout, customer auth). This document defines what to build next: two separate back-office experiences.

| Surface | Audience | Scope |
|--------|----------|--------|
| **Super Admin Dashboard** | Platform operators (`SUPER_ADMIN`) | All tenants, platform config, cross-tenant visibility |
| **Vendor Dashboard** | Restaurant operators (`VENDOR_OWNER`, `VENDOR_STAFF`) | Single-tenant operations: orders, menu, add-ons, collections, promos, branches, storefront (theme + hero), team |

**Vendor capability summary (v1 target):**

| Capability | Module | Status in doc |
|------------|--------|---------------|
| Manage live orders & history | Orders | §5.3 |
| Menu items (categories, products, variants, images) | Menu | §5.4–5.5 |
| Add-ons (extras, toppings, sides) | Menu → Add-ons | §5.6 |
| Collections (curated product groups) | Menu → Collections | §5.7 |
| Combos / bundle deals | Menu → Combos | §5.8 |
| Discounts & promo codes | Promotions | §5.11 |
| Multiple branches & delivery areas | Branches | §5.12 |
| Storefront theme & colors | Storefront → Theme | §5.13 |
| Hero carousel / swiper images | Storefront → Hero | §5.14 |
| Tax, team, customers, reports | Supporting modules | §5.15–5.19 |

### 1.1 Goals

- Give vendors a single place to run day-to-day operations (orders + menu).
- Give platform admins visibility and control over tenants, users, and system health.
- Reuse existing Prisma models — minimal schema changes unless noted.
- Ship incrementally: one module per implementation step.

### 1.2 Current state (baseline)

| Area | Status |
|------|--------|
| Storefront (`app/(storefront)`) | ✅ Live |
| Customer sign-in / sign-up | ✅ Live |
| Guest + registered checkout | ✅ Live |
| Vendor / Admin dashboards | ❌ Not started |
| Branches & delivery areas | ⚠️ Hardcoded in `lib/locations.ts` (not in DB) |
| Hero carousel images | ⚠️ Hardcoded in `components/storefront/hero.tsx` (`CAROUSEL_IMAGES`) |
| Storefront theme (colors, branding) | ⚠️ Global CSS vars in `globals.css` — not per-tenant |
| Collections (curated product groups) | ❌ Not in schema or storefront |
| Payments | ⚠️ Schema exists (`PaymentIntent`, `Transaction`); no UI/integration yet |

### 1.3 Proposed route structure

```
app/
├── (storefront)/          # Public customer site (existing)
├── (vendor)/              # Vendor dashboard
│   └── vendor/
│       ├── login
│       ├── (dashboard)/   # Authenticated shell + sidebar
│       │   ├── page                 # Overview
│       │   ├── orders/...
│       │   ├── menu/...
│       │   ├── branches/...
│       │   ├── storefront/...   # theme, hero
│       │   └── ...
└── (admin)/               # Super admin dashboard
    └── admin/
        ├── login
        ├── (dashboard)/
        │   ├── page                 # Platform overview
        │   ├── tenants/...
        │   └── ...
```

**URL conventions (suggested):**

- Vendor: `/vendor`, `/vendor/orders`, `/vendor/menu/products`, `/vendor/menu/add-ons`, `/vendor/menu/collections`, `/vendor/branches`, `/vendor/storefront/theme`, `/vendor/storefront/hero`
- Admin: `/admin`, `/admin/tenants`, `/admin/users`

---

## 2. Roles & access control

### 2.1 Platform roles (`User.platformRole`)

| Role | Dashboard access |
|------|------------------|
| `SUPER_ADMIN` | Admin dashboard only |
| `VENDOR_OWNER` | Vendor dashboard (full tenant access) |
| `VENDOR_STAFF` | Vendor dashboard (restricted — see §2.2) |
| `CUSTOMER` | Storefront only |

### 2.2 Tenant roles (`TenantMembership.role`)

| Role | Typical permissions |
|------|---------------------|
| `OWNER` | Full vendor module access for that tenant |
| `STAFF` | Orders (view + update status), optional read-only menu |

A user must have **both** a vendor platform role (`VENDOR_OWNER` or `VENDOR_STAFF`) **and** a `TenantMembership` to access the vendor dashboard for that tenant.

### 2.3 Permission matrix (vendor)

| Module | Owner | Staff |
|--------|:-----:|:-----:|
| Dashboard overview | ✅ | ✅ (limited widgets) |
| Orders — live queue | ✅ | ✅ |
| Orders — cancel / refund | ✅ | ❌ |
| Menu — categories | ✅ | 👁️ optional |
| Menu — products | ✅ | 👁️ optional |
| Menu — add-ons (modifiers) & combos | ✅ | ❌ |
| Menu — collections | ✅ | 👁️ optional |
| Promotions / discounts | ✅ | ❌ |
| Branches & delivery areas | ✅ | 👁️ optional |
| Storefront — theme & branding | ✅ | ❌ |
| Storefront — hero carousel | ✅ | ❌ |
| Tax categories | ✅ | ❌ |
| Team / staff | ✅ | ❌ |
| Store settings & domains | ✅ | ❌ |
| Reports | ✅ | 👁️ optional |

### 2.4 Auth requirements (both dashboards)

- Separate login pages from storefront customer auth.
- Session cookie distinct from customer session (e.g. `fiesta-admin-session`, `fiesta-vendor-session`).
- Middleware guards on `(admin)` and `(vendor)` route groups.
- Redirect unauthenticated users to respective `/login`.
- Multi-tenant vendors: if user belongs to multiple tenants (future), show tenant switcher; **v1 assumes one tenant per vendor user** (matches current seed).

---

## 3. Shared dashboard UX

### 3.1 Layout shell (both dashboards)

- **Sidebar navigation** — collapsible on mobile, icons + labels.
- **Top bar** — page title, user menu (profile, sign out), optional tenant name (vendor).
- **Content area** — max-width container, consistent padding.
- **Empty states** — friendly copy when lists have no data.
- **Loading** — skeleton placeholders for tables and cards.
- **Toasts** — success/error feedback on mutations.

### 3.2 Reusable patterns

| Pattern | Use |
|---------|-----|
| Data table | Lists with sort, filter, pagination |
| Detail drawer / page | Order detail, product edit |
| Form modal | Quick create (tag, allergen) |
| Full-page form | Product create/edit, discount create |
| Status badge | Order status, tenant status, active/inactive |
| Confirm dialog | Delete, cancel order, suspend tenant |
| Date range filter | Reports, order history |

### 3.3 Design direction

- Match storefront stone/amber palette (`primary`, `secondary` from `globals.css`).
- Dashboard tone: clean, data-dense, optimized for operators (not marketing).

---

## 4. Super Admin Dashboard

**Base path:** `/admin`  
**Primary user:** Platform operator managing the Fiesta network.

### 4.1 Module map

```
Admin Dashboard
├── Overview (home)
├── Tenants
├── Domains
├── Users
├── Customers
├── Orders (cross-tenant)
├── Platform Settings
│   └── Theme presets (defaults for new tenants)
├── Audit Log
└── Reports
```

**Super Admin responsibilities (summary):**

- Full lifecycle of tenants, domains, and platform users.
- Cross-tenant read access to orders, customers, and aggregate reports.
- Read-only visibility into each tenant's storefront config (theme, hero slides, branches) from the tenant detail page — vendors own day-to-day edits.
- Platform-wide defaults (currency, onboarding, optional theme presets) — not per-order operations.

---

### 4.2 Overview — `/admin`

**Purpose:** At-a-glance platform health.

**Widgets / data:**

| Widget | Metrics |
|--------|---------|
| Tenants | Total, active, suspended, pending |
| Orders (24h / 7d) | Count, revenue, avg order value |
| Revenue chart | Line/bar by day (last 30 days) |
| Recent orders | Last 10 across all tenants |
| Tenant activity | Orders per tenant (top 5) |
| System alerts | Failed payments, suspended tenants |

**Actions:** Quick links to create tenant, view all orders.

---

### 4.3 Tenants — `/admin/tenants`

**Purpose:** CRUD for restaurant brands on the platform.

**List page**

| Column | Source |
|--------|--------|
| Name | `Tenant.name` |
| Slug | `Tenant.slug` |
| Status | `Tenant.status` (ACTIVE / SUSPENDED / PENDING) |
| Domains | Count from `TenantDomain` |
| Orders (30d) | Aggregated |
| Created | `Tenant.createdAt` |

**Filters:** status, search by name/slug.

**Actions:** Create tenant, edit, suspend/activate, delete (soft-delete or hard with confirmation).

**Create / Edit form fields**

| Field | Required | Notes |
|-------|:--------:|-------|
| Name | ✅ | Display name |
| Slug | ✅ | Unique, URL-safe |
| Status | ✅ | Default PENDING on create |

**Detail page — `/admin/tenants/[id]`**

- Tenant summary + status timeline.
- Linked domains list.
- Owner user(s) from `TenantMembership` where `role = OWNER`.
- Order stats for this tenant.
- **Storefront snapshot (read-only):** active theme preset / custom colors, hero slide count + preview thumbnails, branch count, collection count, active discount count.
- **Branches tab (read-only v1):** list branches and delivery areas configured by the vendor.
- Quick actions: open storefront preview (new tab), impersonate vendor (future), suspend.

---

### 4.4 Domains — `/admin/domains`

**Purpose:** Manage custom domains per tenant.

**List:** domain, tenant, primary flag, verified flag, created date.

**Actions:** Add domain to tenant, set primary, mark verified, remove.

**Fields:** `TenantDomain.domain`, `isPrimary`, `verified`, `tenantId`.

> **Note:** Domain verification flow (DNS) is out of scope for v1 — manual `verified` toggle is acceptable initially.

---

### 4.5 Users — `/admin/users`

**Purpose:** Platform-level staff accounts (admins + vendor owners).

**List columns:** name, email, platform role, tenant memberships, created.

**Filters:** role (`SUPER_ADMIN`, `VENDOR_OWNER`, `VENDOR_STAFF`).

**Create user form**

| Field | Required |
|-------|:--------:|
| Name | ✅ |
| Email | ✅ |
| Password | ✅ (on create) |
| Platform role | ✅ |
| Tenant + tenant role | If vendor role |

**Actions:** Edit, reset password, deactivate (future: add `isActive` to User if needed).

**Restrictions:**

- Cannot delete the last `SUPER_ADMIN`.
- Vendor users must have at least one `TenantMembership`.

---

### 4.6 Customers — `/admin/customers`

**Purpose:** Read-only view of registered storefront customers.

**List columns:** name, email, phone, order count, last order date, created.

**Filters:** search, date joined, has orders.

**Detail — `/admin/customers/[id]`**

- Profile info (`User` where `platformRole = CUSTOMER`).
- Order history across tenants (if applicable).

**Actions:** View only in v1 (no edit/delete).

---

### 4.7 Orders (cross-tenant) — `/admin/orders`

**Purpose:** Platform-wide order visibility for support and ops.

**List columns:** order number, tenant, customer name, status, total, payment status, created.

**Filters:** tenant, status, date range, search (order #, customer).

**Detail — `/admin/orders/[id]`**

- Full order breakdown (items, modifiers, discounts).
- Status history (`OrderStatusHistory`).
- Payment intents + transactions.
- Customer contact + delivery address.

**Actions:** View only in v1; status override reserved for vendor unless escalated (future flag).

---

### 4.8 Platform Settings — `/admin/settings`

**Purpose:** Global configuration via `PlatformSetting` key/value store.

**Suggested settings (v1):**

| Key | Type | Description |
|-----|------|-------------|
| `platform.name` | string | "Fiesta" |
| `platform.support_email` | string | Support contact |
| `defaults.currency` | string | e.g. USD |
| `defaults.tax_inclusive` | boolean | Pricing display default |
| `onboarding.auto_approve_tenants` | boolean | Skip PENDING status |
| `defaults.theme_preset` | string | Default storefront palette for new tenants |
| `defaults.max_hero_slides` | number | Platform cap on carousel slides per tenant (e.g. 8) |

**Theme presets subsection**

- CRUD for named platform presets (e.g. "Classic Amber", "Dark Kitchen") — each preset stores primary, secondary, background, foreground, menu-accent hex values.
- New tenants inherit `defaults.theme_preset` until the vendor overrides in their dashboard.

**UI:** Grouped sections, JSON editor for advanced keys.

---

### 4.9 Audit Log — `/admin/audit-log`

**Purpose:** Traceability for admin actions.

**List columns:** timestamp, actor, action, entity type, entity id.

**Filters:** actor, action, entity type, date range.

**Data source:** `AuditLog` — write entries from server actions on create/update/delete across admin and vendor mutations.

---

### 4.10 Reports — `/admin/reports`

**Purpose:** Platform analytics.

**Reports (v1):**

| Report | Description |
|--------|-------------|
| Revenue by tenant | Table + chart |
| Orders by status | Pie/bar |
| Top products (platform) | Aggregated `OrderItem` |
| Discount usage | `Discount.usageCount` across tenants |
| New customers | Registrations over time |

**Export:** CSV download per report (v1 nice-to-have).

---

## 5. Vendor Dashboard

**Base path:** `/vendor`  
**Primary user:** Restaurant owner or staff for **one tenant** (scoped by session).

All queries **must filter by `tenantId`** from the authenticated user's membership.

### 5.1 Module map

```
Vendor Dashboard
├── Overview (home)
├── Orders
│   ├── Live queue
│   ├── History
│   └── [id] Detail
├── Menu
│   ├── Categories
│   ├── Products
│   ├── Add-ons (modifiers)
│   ├── Collections
│   ├── Combos
│   ├── Tags
│   └── Allergens
├── Promotions
├── Branches & areas
├── Storefront
│   ├── Theme & branding
│   └── Hero carousel
├── Tax
├── Customers
├── Team
├── Store Settings
└── Reports
```

> **Terminology:** In the vendor UI, **Add-ons** is the operator-facing label for `ModifierGroup` / `ModifierOption` (extras, sauces, toppings, sides). The data model keeps the existing modifier names.

---

### 5.2 Overview — `/vendor`

**Purpose:** Today's operational snapshot.

**Widgets:**

| Widget | Data |
|--------|------|
| Orders today | Count by status |
| Revenue today | Sum of `Order.total` |
| Avg prep time | From completed orders (future) |
| Live queue | PENDING + CONFIRMED + PREPARING count |
| Low stock / inactive products | Products with `isActive = false` |
| Active promos | Running discounts |

**Quick actions:** View live orders, add product.

**Optional:** Sound/browser notification for new orders (phase 2).

---

### 5.3 Orders — `/vendor/orders`

#### 5.3.1 Live queue — `/vendor/orders` (default tab)

**Purpose:** Real-time order fulfillment board.

**Views:**

- **Kanban** by status: PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
- **Table** toggle for dense view

**Order card fields:** order #, time ago, customer name, item count, total, order type (pickup/delivery — *requires schema addition or notes parsing*), branch/area (*future DB model*).

**Actions per order:**

| Action | Allowed statuses | Result |
|--------|------------------|--------|
| Confirm | PENDING | → CONFIRMED |
| Start preparing | CONFIRMED | → PREPARING |
| Mark ready | PREPARING | → READY |
| Out for delivery | READY | → OUT_FOR_DELIVERY |
| Mark delivered | READY / OUT_FOR_DELIVERY | → DELIVERED |
| Cancel | PENDING, CONFIRMED | → CANCELLED + note |

Each transition writes to `OrderStatusHistory`.

**Polling / realtime:** Start with 15–30s polling; upgrade to WebSockets/SSE later.

#### 5.3.2 History — `/vendor/orders/history`

**List:** all past orders with filters (status, date, search).

**Export:** CSV for date range (nice-to-have).

#### 5.3.3 Order detail — `/vendor/orders/[id]`

- Line items with modifiers and notes.
- Customer contact (name, email, phone, address).
- Applied discounts.
- Payment status from `PaymentIntent`.
- Status timeline.
- Internal notes field (add to `OrderStatusHistory.note` or new `Order.internalNotes`).

---

### 5.4 Menu — Categories — `/vendor/menu/categories`

**Purpose:** Organize products; supports parent/child hierarchy.

**List:** name, parent category, product count, sort order, active, image.

**Actions:** Create, edit, reorder (drag), activate/deactivate, delete (block if products exist).

**Form fields:** `name`, `description`, `imageUrl`, `parentCategoryId`, `sortOrder`, `isActive`.

---

### 5.5 Menu — Products — `/vendor/menu/products`

**Purpose:** Core catalog management.

**List columns:** image, name, category, base price, active, featured, sort order.

**Filters:** category, active, featured, search, dietary flags.

**Create / Edit — `/vendor/menu/products/new` | `[id]`**

**Tabs or sections:**

| Section | Fields / relations |
|---------|-------------------|
| Basics | name, description, category, sku, barcode, basePrice, compareAtPrice, costPrice, imageUrl |
| Variants | `ProductVariant[]` — name, price, sku, default, active |
| Images | `ProductImage[]` — multi-image gallery |
| Modifiers | Attach `ModifierGroup` via `ProductModifierGroup` |
| Dietary | isVegetarian, isVegan, isGlutenFree, spicyLevel |
| Details | prepTimeMinutes, calories, servingSize |
| Tags | `Tag` multi-select |
| Allergens | `Allergen` multi-select |
| Nutrition | `NutritionInfo` one-to-one |
| Availability | `ProductAvailability[]` — day, start/end time |
| Display | sortOrder, isActive, isFeatured |

**Actions:** Duplicate product, bulk activate/deactivate.

---

### 5.6 Menu — Add-ons — `/vendor/menu/add-ons`

**Purpose:** Modifier groups and options — presented in the dashboard as **Add-ons** (e.g. "Choose your sauce", "Extra toppings", "Select a side").

> **Route alias:** `/vendor/menu/modifiers` may redirect here for consistency with the Prisma model names in code.

**List:** group name, option count, min/max selections, required, active.

**Group form:** `name`, `description`, `minSelections`, `maxSelections`, `isRequired`, `isActive`, `sortOrder`.

**Options (nested):** `name`, `description`, `price`, `calories`, `isDefault`, `isActive`, `sortOrder`.

**Product assignment:** From the product edit screen or a bulk "Attach add-ons" action — link groups via `ProductModifierGroup` with per-product `sortOrder`.

**Storefront behavior:** Selected add-ons appear in the product modal on the customer site; prices roll into line-item totals at checkout.

---

### 5.7 Menu — Collections — `/vendor/menu/collections`

**Purpose:** Curated, cross-category product groups for merchandising (e.g. "Chef's Picks", "Spicy Favorites", "Weekend Specials"). Distinct from **Categories** (menu structure) and **Combos** (bundled pricing).

**List columns:** name, slug, product count, featured on homepage, active, sort order.

**Create / Edit form**

| Field | Required | Notes |
|-------|:--------:|-------|
| name | ✅ | Display title |
| slug | ✅ | URL-safe; used for `/#collection-{slug}` anchor |
| description | | Optional subtitle on storefront |
| imageUrl | | Optional collection banner |
| isActive | ✅ | Hide when inactive |
| isFeatured | | Show on homepage / dedicated section (phase 2) |
| sortOrder | | Manual ordering among collections |

**Collection products (nested):**

- Add/remove products from any category.
- Reorder products within the collection (drag).
- Optional per-collection `compareAtPrice` override is **out of scope** — pricing comes from the product.

**Storefront:** Collections render as horizontal scroll rows or a dedicated nav section; products can belong to multiple collections and one primary category.

---

### 5.8 Menu — Combos — `/vendor/menu/combos`

**Purpose:** Bundle deals.

**List:** name, price, compareAtPrice, item count, active.

**Form:** name, description, price, compareAtPrice, imageUrl, isActive, sortOrder.

**Combo items:** product, optional variant, quantity, sort order (`ComboItem`).

---

### 5.9 Menu — Tags — `/vendor/menu/tags`

**Purpose:** Product labels (e.g. "Bestseller", "New").

**Fields:** `name`, `slug` (auto from name).

---

### 5.10 Menu — Allergens — `/vendor/menu/allergens`

**Purpose:** Allergen library for products.

**Fields:** `name`, `icon` (optional emoji or icon key).

---

### 5.11 Promotions — `/vendor/promotions`

**Purpose:** Discount and promo code management (`Discount` model).

**List:** name, code, type, scope, value, usage, active, date range.

**Form fields:**

| Field | Notes |
|-------|-------|
| name, description, code | Code optional for automatic discounts |
| type | PERCENTAGE, FIXED_AMOUNT, FREE_DELIVERY, BOGO, BUY_X_GET_Y |
| scope | ORDER, CATEGORY, PRODUCT, COLLECTION, DELIVERY |
| value | Interpretation depends on type |
| buyQuantity / getQuantity | For BOGO / BUY_X_GET_Y |
| minOrderAmount, maxDiscountAmount | Constraints |
| usageLimit, usageCount | Read-only count |
| isActive, isAutomatic | |
| startsAt, endsAt | Schedule |
| categories / products / collections | When scope is CATEGORY, PRODUCT, or COLLECTION (*schema addition*) |

**Actions:** Create, edit, activate/deactivate, duplicate, delete. Preview estimated discount on a sample cart (nice-to-have).

**Storefront:** Automatic discounts apply at cart/checkout; code-based discounts accept promo code on checkout.

---

### 5.12 Branches & delivery areas — `/vendor/branches`

**Purpose:** Manage multiple physical locations and their delivery zones — replaces hardcoded `lib/locations.ts` per tenant.

**List columns:** branch name, address (short), area count, active, orders today (optional widget).

**Branch form**

| Field | Required | Notes |
|-------|:--------:|-------|
| name | ✅ | e.g. "Gulberg", "DHA" |
| slug | ✅ | Unique per tenant; used in checkout location selector |
| address | | Full address for pickup orders |
| phone | | Branch contact |
| isActive | ✅ | Inactive branches hidden from storefront |
| sortOrder | | Display order in location picker |

**Delivery areas (nested per branch)**

| Field | Required | Notes |
|-------|:--------:|-------|
| name | ✅ | e.g. "MM Alam Road", "Phase 5" |
| slug | ✅ | Unique within branch |
| deliveryFee | | Override tenant default; nullable = use default |
| minOrderAmount | | Optional minimum for delivery to this area |
| isActive | ✅ | |

**Actions:** Create, edit, reorder branches and areas, activate/deactivate. Cannot delete a branch with open orders — deactivate instead.

**Order integration:** Live queue and order detail show branch + area. Status transitions unchanged; branch is informational for routing unless multi-kitchen workflows are added later.

**Permissions:** Owner full CRUD; staff read-only (optional).

---

### 5.13 Storefront — Theme & branding — `/vendor/storefront/theme`

**Purpose:** Per-tenant visual identity on the customer-facing site.

**Sections**

| Section | Fields / behavior |
|---------|-------------------|
| Brand | Logo URL (`Tenant.logoUrl` or settings), favicon URL, display name override |
| Colors | `primary`, `secondary`, `background`, `foreground`, `menu-accent` — color pickers with live preview panel |
| Preset | Apply a platform preset (from admin) as starting point, then customize |
| Typography | Font family selection from curated list (v1: Geist only; v2: 2–3 Google Font options) |
| Advanced | Custom CSS disabled in v1 (security) |

**Preview:** Split-pane or modal showing storefront header + product card with applied theme before save.

**Persistence:** `TenantTheme` model or `TenantSettings.theme` JSON — see §6.

**Constraints:** WCAG contrast warning if primary on background fails AA (advisory, not blocking).

---

### 5.14 Storefront — Hero carousel — `/vendor/storefront/hero`

**Purpose:** Manage homepage hero swiper slides — replaces hardcoded `CAROUSEL_IMAGES` in `components/storefront/hero.tsx`.

**List:** thumbnail, title, sort order, active, link URL, schedule (starts/ends).

**Slide form**

| Field | Required | Notes |
|-------|:--------:|-------|
| imageUrl | ✅ | Desktop banner; recommend 21:9 aspect |
| mobileImageUrl | | Optional crop for small screens |
| altText | ✅ | Accessibility |
| title / subtitle | | Optional overlay text on storefront (phase 2) |
| linkUrl | | Optional CTA — internal (`/#cat-…`) or external |
| sortOrder | ✅ | Drag reorder in list |
| isActive | ✅ | |
| startsAt / endsAt | | Schedule seasonal promos |

**Actions:** Add slide, edit, reorder (drag), activate/deactivate, delete. Respect platform `defaults.max_hero_slides` cap.

**Storefront:** `Hero` component loads slides from DB for the resolved tenant; autoplay, pagination, and arrows unchanged.

---

### 5.15 Tax — `/vendor/tax`

**Purpose:** Tax category management (`TaxCategory`).

**List:** name, rate, isDefault.

**Form:** name, rate (decimal e.g. 0.08 = 8%), isDefault (only one default per tenant).

---

### 5.16 Customers — `/vendor/customers`

**Purpose:** Customers who have ordered from this tenant.

**List:** derived from `Order` grouped by email/phone/userId — name, email, phone, orders count, total spent, last order.

**Detail:** order history for this customer at this tenant.

> **Note:** Not all customers are registered users; merge guest orders by email/phone.

---

### 5.17 Team — `/vendor/team`

**Purpose:** Staff access for the tenant.

**List:** name, email, tenant role (OWNER/STAFF), joined date.

**Actions (owner only):**

- Invite staff (create user with `VENDOR_STAFF` + membership, or add existing user).
- Change role, remove from tenant.
- Cannot remove last OWNER.

---

### 5.18 Store Settings — `/vendor/settings`

**Purpose:** Tenant profile and operational defaults (theme, hero, and branches live in dedicated modules — §5.12–§5.14).

**Sections:**

| Section | Fields |
|---------|--------|
| General | `Tenant.name`, `Tenant.slug` (read-only after create), `Tenant.status` (read-only for vendor) |
| Domains | List `TenantDomain` — view only for vendor in v1; request custom domain (future workflow) |
| Order defaults | Default prep time, default delivery fee, default tax behavior |
| Checkout | Min order amount, guest checkout toggle, order notes enabled |
| Notifications | Email/SMS toggles for new orders (future) |
| Storefront links | Quick links to Theme, Hero, and Branches modules |

---

### 5.19 Reports — `/vendor/reports`

| Report | Description |
|--------|-------------|
| Sales summary | Revenue, orders, AOV by day/week/month |
| Orders by status | Fulfillment funnel |
| Top products | By quantity and revenue |
| Category performance | Revenue per category |
| Discount performance | Redemption and cost |
| Peak hours | Orders by hour of day |
| Branch performance | Orders and revenue per branch/area |
| Collection performance | Views and sales attributed to collections (when tracking added) |

**Export:** CSV per report.

---

## 6. Data model gaps (plan before building)

These are **not** in the schema today but referenced by the storefront or dashboards. Track as follow-up migrations:

| Gap | Impact | Suggested model |
|-----|--------|-----------------|
| Branches & delivery areas | Location selector, order routing | `Branch`, `DeliveryArea` per tenant |
| Order type (pickup vs delivery) | Order queue, reports | `Order.orderType` enum |
| Branch & area on order | Per-location fulfillment | `Order.branchId`, `Order.deliveryAreaId` |
| Store settings / delivery fee | Checkout, vendor settings | `TenantSettings` JSON or columns |
| Per-tenant theme | Storefront colors, branding | `TenantTheme` or `TenantSettings.theme` JSON |
| Hero carousel slides | Homepage swiper | `HeroSlide` — `tenantId`, `imageUrl`, `sortOrder`, `isActive`, schedule fields |
| Collections | Curated merchandising groups | `Collection`, `CollectionProduct` (productId, sortOrder) |
| Discount scope: collection | Promo on a curated set | Extend `DiscountScope` with `COLLECTION` + `DiscountCollection` join |
| User `isActive` | Deactivate staff/admin | `User.isActive` boolean |
| Media library | Product images, logos, hero | `MediaAsset` or external storage URLs only in v1 |
| Platform theme presets | Admin defaults for new tenants | `ThemePreset` or `PlatformSetting` JSON array |

---

## 7. Technical requirements

### 7.1 Stack (align with existing project)

- Next.js App Router, React 19, Server Actions, Prisma, PostgreSQL.
- Auth: extend pattern from `lib/auth/session.ts` with role-specific cookies.
- No new UI library required initially — Tailwind + lucide-react (already installed).

### 7.2 Server actions layout (suggested)

```
lib/actions/
├── auth.ts              # Customer (existing)
├── admin/
│   ├── tenants.ts
│   ├── users.ts
│   ├── orders.ts
│   └── settings.ts
└── vendor/
    ├── orders.ts
    ├── categories.ts
    ├── products.ts
    ├── modifiers.ts       # add-ons
    ├── collections.ts
    ├── combos.ts
    ├── discounts.ts
    ├── branches.ts
    ├── storefront.ts      # theme + hero slides
    ├── tax.ts
    └── team.ts
```

### 7.3 Middleware

- `middleware.ts` at project root:
  - `/admin/*` → require `SUPER_ADMIN`
  - `/vendor/*` → require `VENDOR_OWNER` or `VENDOR_STAFF` + tenant membership
  - Pass `tenantId` via header or session for vendor routes

### 7.4 Audit logging

Log to `AuditLog` on:

- Tenant create/update/suspend
- User create/role change
- Order status change
- Product/discount/collection create/update/delete
- Branch and hero slide create/update/delete
- Theme changes on tenant

### 7.5 Validation

- Zod schemas per form (add `zod` dependency when implementing forms).
- Server-side validation always; client-side for UX.

---

## 8. Implementation phases

Recommended order — each phase is one or more PRs.

### Phase 0 — Foundation

- [ ] Dashboard route groups `(admin)` and `(vendor)`
- [ ] Admin + vendor auth (login, session, middleware)
- [ ] Shared dashboard layout (sidebar, top bar)
- [ ] Placeholder overview pages

### Phase 1 — Vendor orders (highest business value)

- [ ] Live order queue + status transitions
- [ ] Order detail page
- [ ] Order history list
- [ ] `OrderStatusHistory` on every transition
- [ ] Vendor overview widgets (orders today)

### Phase 2 — Vendor menu core

- [ ] Categories CRUD + reorder
- [ ] Products CRUD (basics + variants + images)
- [ ] Tags & allergens

### Phase 3 — Vendor menu advanced

- [ ] Modifier groups & options
- [ ] Product modifier assignment
- [ ] Combos
- [ ] Product availability schedule
- [ ] Nutrition info

### Phase 4 — Vendor commercial

- [ ] Tax categories
- [ ] Promotions / discounts (all types)
- [ ] Collections CRUD + product assignment
- [ ] Vendor reports (sales, top products)

### Phase 5 — Vendor locations & storefront

- [ ] Branches & delivery areas CRUD (DB migration + storefront location picker)
- [ ] Theme & branding editor with live preview
- [ ] Hero carousel slide management
- [ ] Wire storefront `Hero` and CSS variables to tenant config

### Phase 6 — Vendor admin

- [ ] Team management
- [ ] Store settings
- [ ] Customer list (from orders)

### Phase 7 — Super admin core

- [ ] Admin overview
- [ ] Tenants CRUD + storefront snapshot on tenant detail
- [ ] Domains management
- [ ] Users management
- [ ] Platform theme presets

### Phase 8 — Super admin ops

- [ ] Cross-tenant orders view
- [ ] Customers view
- [ ] Platform settings
- [ ] Audit log viewer
- [ ] Platform reports

### Phase 9 — Enhancements

- [ ] Realtime order updates (SSE/WebSocket)
- [ ] CSV exports
- [ ] Payment provider integration UI
- [ ] Email / SMS notifications
- [ ] Image upload to object storage (replace URL-only fields)
- [ ] Collection and hero analytics

---

## 9. Page checklist (quick reference)

### Super Admin — 15 pages

| # | Route | Page |
|---|-------|------|
| 1 | `/admin/login` | Login |
| 2 | `/admin` | Overview |
| 3 | `/admin/tenants` | Tenant list |
| 4 | `/admin/tenants/new` | Create tenant |
| 5 | `/admin/tenants/[id]` | Tenant detail |
| 6 | `/admin/domains` | Domain list |
| 7 | `/admin/users` | User list |
| 8 | `/admin/users/new` | Create user |
| 9 | `/admin/customers` | Customer list |
| 10 | `/admin/customers/[id]` | Customer detail |
| 11 | `/admin/orders` | Order list |
| 12 | `/admin/orders/[id]` | Order detail |
| 13 | `/admin/settings` | Platform settings |
| 14 | `/admin/audit-log` | Audit log |
| 15 | `/admin/reports` | Reports |

### Vendor — 32+ pages

| # | Route | Page |
|---|-------|------|
| 1 | `/vendor/login` | Login |
| 2 | `/vendor` | Overview |
| 3 | `/vendor/orders` | Live queue |
| 4 | `/vendor/orders/history` | Order history |
| 5 | `/vendor/orders/[id]` | Order detail |
| 6 | `/vendor/menu/categories` | Category list |
| 7 | `/vendor/menu/categories/new` | Create category |
| 8 | `/vendor/menu/categories/[id]` | Edit category |
| 9 | `/vendor/menu/products` | Product list |
| 10 | `/vendor/menu/products/new` | Create product |
| 11 | `/vendor/menu/products/[id]` | Edit product |
| 12 | `/vendor/menu/add-ons` | Add-on groups (modifiers) |
| 13 | `/vendor/menu/add-ons/[id]` | Edit group + options |
| 14 | `/vendor/menu/collections` | Collection list |
| 15 | `/vendor/menu/collections/new` | Create collection |
| 16 | `/vendor/menu/collections/[id]` | Edit collection + products |
| 17 | `/vendor/menu/combos` | Combo list |
| 18 | `/vendor/menu/combos/[id]` | Edit combo |
| 19 | `/vendor/menu/tags` | Tags |
| 20 | `/vendor/menu/allergens` | Allergens |
| 21 | `/vendor/promotions` | Discount list |
| 22 | `/vendor/promotions/new` | Create discount |
| 23 | `/vendor/promotions/[id]` | Edit discount |
| 24 | `/vendor/branches` | Branch list |
| 25 | `/vendor/branches/new` | Create branch |
| 26 | `/vendor/branches/[id]` | Edit branch + delivery areas |
| 27 | `/vendor/storefront/theme` | Theme & branding |
| 28 | `/vendor/storefront/hero` | Hero carousel slides |
| 29 | `/vendor/tax` | Tax categories |
| 30 | `/vendor/customers` | Customer list |
| 31 | `/vendor/customers/[id]` | Customer detail |
| 32 | `/vendor/team` | Team members |
| 33 | `/vendor/settings` | Store settings |
| 34 | `/vendor/reports` | Reports |

---

## 10. Open questions (decide before Phase 0)

| # | Question | Options |
|---|----------|---------|
| 1 | Single login page or separate `/admin/login` and `/vendor/login`? | **Recommend separate** — clearer UX |
| 2 | Can one email be both admin and vendor? | **Recommend no** — one `platformRole` per user |
| 3 | Staff invite flow: email magic link or manual password? | Manual password v1; invite link later |
| 4 | Product images: upload to Supabase Storage or URL only? | URL v1; storage in Phase 8 |
| 5 | Currency / locale | Single currency (USD) v1 |
| 6 | Collections vs categories | **Collections** = merchandising; **categories** = menu structure; a product can be in both |
| 7 | Theme: preset-only vs full custom? | **Recommend** preset + per-color overrides (not arbitrary CSS) |
| 8 | Hero slides: image upload v1? | URL-only v1 (same as product images); storage in Phase 9 |
| 9 | Branch delete with historical orders? | **Deactivate only** — never hard-delete branches with orders |

---

## 11. Acceptance criteria (per module)

Each implementation step should satisfy:

1. **Auth** — only authorized roles can access routes and actions.
2. **Tenant isolation** — vendor never sees another tenant's data.
3. **CRUD** — list, create, read, update, delete (where applicable) with validation.
4. **Feedback** — loading, error, and success states.
5. **Mobile** — usable on tablet (kitchen / counter use case).
6. **Audit** — sensitive mutations logged (where applicable).

---

## 12. Related files (codebase reference)

| File | Relevance |
|------|-----------|
| `prisma/schema.prisma` | All domain models |
| `prisma/seed.ts` | Admin + vendor seed users |
| `lib/actions/orders.ts` | Storefront order placement |
| `lib/auth/session.ts` | Session pattern to extend |
| `lib/tenant.ts` | Tenant resolution |
| `lib/locations.ts` | Branches (to migrate) |
| `components/storefront/hero.tsx` | Hero carousel (to migrate to DB-driven) |
| `app/globals.css` | Theme CSS variables (to become per-tenant) |
| `app/(storefront)/` | Customer-facing reference UX |

---

*Next step: review this document, resolve open questions in §10, then begin **Phase 0 — Foundation**.*
