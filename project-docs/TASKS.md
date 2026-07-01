# TASKS.md — Implementation Checklist
## Delivery Management Web Application

> Check off tasks as you complete them. Never mark a task done unless:
> - The code compiles without TypeScript errors
> - The feature works end-to-end
> - It matches the design file for the relevant screen

---

## Phase 1 — Foundation

- [ ] Scaffold Next.js 15 project (`create-next-app`)
- [ ] Install all dependencies (see AGENT.md §2)
- [ ] Create complete folder structure (see AGENT.md §1)
- [ ] `src/lib/mongodb.ts` — connection singleton
- [ ] `src/app/layout.tsx` — root layout (providers: SessionProvider, Toaster)
- [ ] `tailwind.config.ts` — design tokens (colors, fonts)
- [ ] `src/app/globals.css` — CSS reset + base styles
- [ ] `.env.local.example` — all required env vars documented
- [ ] `next.config.ts` — PWA setup, image domains, headers

---

## Phase 2 — Data Models

- [ ] `src/models/User.ts`
- [ ] `src/models/Product.ts`
- [ ] `src/models/Order.ts`
- [ ] `src/models/Cart.ts`
- [ ] `src/models/AppConfig.ts`
- [ ] `scripts/seed.ts` — seed admin user + sample products
- [ ] Test: `npx tsx scripts/seed.ts` runs without errors

---

## Phase 3 — Auth

- [ ] `src/lib/auth.ts` — NextAuth config with Credentials
- [ ] `src/types/next-auth.d.ts` — type augmentation
- [ ] `src/app/api/auth/[...nextauth]/route.ts`
- [ ] `src/middleware.ts` — route protection
- [ ] `src/app/api/auth/register/route.ts`
- [ ] `src/app/(auth)/login/page.tsx` — matches `design/auth-login/`
- [ ] `src/app/(auth)/register/page.tsx` — matches `design/auth-register/`
- [ ] Test: register → login → session persists → logout works

---

## Phase 4 — Customer Flow

### UI Components
- [ ] `src/components/ui/Button.tsx`
- [ ] `src/components/ui/Input.tsx`
- [ ] `src/components/ui/Badge.tsx`
- [ ] `src/components/ui/Card.tsx`
- [ ] `src/components/ui/Modal.tsx`
- [ ] `src/components/ui/Toast.tsx` (react-hot-toast wrapper)
- [ ] `src/components/ui/Spinner.tsx`
- [ ] `src/components/ui/EmptyState.tsx`
- [ ] `src/components/ui/ErrorState.tsx`
- [ ] `src/components/layout/BottomNav.tsx` — mobile nav
- [ ] `src/components/layout/CustomerNav.tsx`

### Cart State
- [ ] `src/store/cartStore.ts` — Zustand store
- [ ] `src/hooks/useCart.ts`
- [ ] `src/app/api/cart/route.ts` (GET, POST, DELETE)

### Pages
- [ ] `src/app/(customer)/layout.tsx`
- [ ] `src/app/(customer)/page.tsx` — product listing — matches `design/customer-home/`
- [ ] `src/app/api/products/route.ts` (GET with search + pagination)
- [ ] `src/components/customer/ProductCard.tsx`
- [ ] `src/components/customer/ProductGrid.tsx`
- [ ] `src/components/customer/SearchBar.tsx`
- [ ] `src/app/(customer)/product/[id]/page.tsx` — matches `design/customer-product/`
- [ ] `src/app/api/products/[id]/route.ts` (GET)
- [ ] `src/app/(customer)/cart/page.tsx` — matches `design/customer-cart/`
- [ ] `src/components/customer/CartItem.tsx`
- [ ] `src/components/customer/CartSummary.tsx`
- [ ] `src/app/(customer)/checkout/page.tsx` — matches `design/customer-checkout/`
- [ ] `src/components/customer/CheckoutForm.tsx`
- [ ] `src/app/api/orders/route.ts` (POST create order)
- [ ] `src/app/(customer)/orders/page.tsx` — matches `design/customer-orders/`
- [ ] `src/components/customer/OrderCard.tsx`
- [ ] `src/app/(customer)/orders/[id]/page.tsx` — matches `design/customer-order-detail/`
- [ ] `src/components/customer/OrderStatus.tsx`
- [ ] `src/app/api/orders/route.ts` (GET customer orders)
- [ ] `src/app/api/orders/[id]/route.ts` (GET)
- [ ] Profile page + API

### Tests (manual)
- [ ] Browse products without auth
- [ ] Search products
- [ ] Add to cart, update qty, remove
- [ ] Checkout — cash on delivery
- [ ] Checkout — bank transfer (with screenshot upload)
- [ ] View order list + detail
- [ ] Edit profile

---

## Phase 5 — Admin Flow

### API Routes
- [ ] `src/app/api/admin/dashboard/route.ts`
- [ ] `src/app/api/products/route.ts` (POST)
- [ ] `src/app/api/products/[id]/route.ts` (PUT, DELETE)
- [ ] `src/app/api/inventory/route.ts` (GET)
- [ ] `src/app/api/inventory/[productId]/route.ts` (PATCH)
- [ ] `src/app/api/orders/route.ts` (GET admin — all orders)
- [ ] `src/app/api/orders/[id]/approve/route.ts`
- [ ] `src/app/api/orders/[id]/reject/route.ts`
- [ ] `src/app/api/orders/[id]/assign/route.ts`
- [ ] `src/app/api/orders/[id]/status/route.ts`
- [ ] `src/app/api/delivery-personnel/route.ts`
- [ ] `src/app/api/delivery-personnel/[id]/route.ts`

### Pages
- [ ] `src/app/(admin)/layout.tsx`
- [ ] `src/app/(admin)/dashboard/page.tsx` — matches `design/admin-dashboard/`
- [ ] `src/components/admin/KPICard.tsx`
- [ ] `src/app/(admin)/products/page.tsx` — matches `design/admin-products/`
- [ ] `src/app/(admin)/products/new/page.tsx`
- [ ] `src/app/(admin)/products/[id]/edit/page.tsx`
- [ ] `src/components/admin/ProductForm.tsx`
- [ ] `src/app/(admin)/inventory/page.tsx` — matches `design/admin-inventory/`
- [ ] `src/components/admin/InventoryRow.tsx`
- [ ] `src/app/(admin)/orders/page.tsx` — matches `design/admin-orders/`
- [ ] `src/app/(admin)/orders/[id]/page.tsx` — matches `design/admin-order-detail/`
- [ ] `src/components/admin/OrderDetailPanel.tsx`
- [ ] `src/app/(admin)/delivery-personnel/page.tsx` — matches `design/admin-delivery-personnel/`
- [ ] `src/components/admin/DeliveryPersonnelForm.tsx`

### Tests (manual)
- [ ] Dashboard KPIs accurate
- [ ] Add, edit, delete product
- [ ] Inventory increase/decrease + low stock warning
- [ ] View all orders + filter by status
- [ ] Approve / reject order
- [ ] Assign delivery personnel
- [ ] Add, edit, delete delivery personnel

---

## Phase 6 — Delivery Flow

### API Routes
- [ ] `src/app/api/delivery/orders/route.ts`

### Pages
- [ ] `src/app/(delivery)/layout.tsx`
- [ ] `src/app/(delivery)/dashboard/page.tsx` — matches `design/delivery-dashboard/`
- [ ] `src/components/delivery/DeliveryCard.tsx`
- [ ] `src/app/(delivery)/deliveries/[id]/page.tsx` — matches `design/delivery-detail/`
- [ ] `src/components/delivery/DeliveryDetail.tsx`
- [ ] `src/app/(delivery)/profile/page.tsx` — matches `design/delivery-profile/`

### Tests (manual)
- [ ] See assigned orders on dashboard
- [ ] View delivery detail (customer info, COD amount)
- [ ] Start delivery
- [ ] Mark as delivered
- [ ] Completed moves to completed section

---

## Phase 7 — Cross-Cutting Features

### File Upload
- [ ] `src/lib/uploadthing.ts` — configure UploadThing
- [ ] `src/app/api/uploadthing/route.ts`
- [ ] Test: payment screenshot uploads and URL is stored on order

### Push Notifications
- [ ] `src/lib/notifications.ts` — web-push helpers
- [ ] `src/app/api/notifications/subscribe/route.ts`
- [ ] `src/app/api/notifications/unsubscribe/route.ts`
- [ ] Service worker (`public/sw.js`) — handles push events
- [ ] Test: notification fires on order status change

### PWA
- [ ] `public/manifest.json`
- [ ] Icons (192x192, 512x512) in `public/icons/`
- [ ] `next.config.ts` — next-pwa setup
- [ ] Test: "Add to Home Screen" prompt appears on mobile

### Search
- [ ] MongoDB text index on Product (name + description)
- [ ] Test: search works with partial words

---

## Phase 8 — Polish & Production

### Loading States
- [ ] `src/app/(customer)/loading.tsx`
- [ ] `src/app/(admin)/loading.tsx`
- [ ] `src/app/(delivery)/loading.tsx`
- [ ] Skeleton components for product grid
- [ ] Skeleton for order list

### Error Handling
- [ ] `src/app/error.tsx` — global error boundary
- [ ] `src/app/(customer)/error.tsx`
- [ ] `src/app/(admin)/error.tsx`
- [ ] Network error toast shows "Connection Lost. Please Try Again."
- [ ] 404 page (`src/app/not-found.tsx`)

### Validation
- [ ] `src/lib/validations.ts` — all Zod schemas
- [ ] All forms show inline validation errors
- [ ] All API routes validate with Zod

### SEO
- [ ] `src/app/layout.tsx` — base metadata
- [ ] Product pages have dynamic metadata
- [ ] `robots.txt` and `sitemap.xml`

### Performance
- [ ] All images use `next/image`
- [ ] Product listing API response cached (1 min revalidation)
- [ ] Lighthouse mobile score ≥ 85 on home page
- [ ] No unused dependencies

### Final Checks
- [ ] `tsc --noEmit` passes (zero TypeScript errors)
- [ ] `eslint .` passes (zero errors)
- [ ] All routes tested with auth guard (401/403 return correctly)
- [ ] Test at 375px, 768px, 1024px widths
- [ ] `.env.local.example` is complete and up-to-date
- [ ] `README.md` documents: setup, env vars, seed command, deployment

---

## Quick Reference: Design Files → Pages

| Design Folder | Page Route |
|---|---|
| `design/auth-login/` | `/login` |
| `design/auth-register/` | `/register` |
| `design/customer-home/` | `/` |
| `design/customer-product/` | `/product/[id]` |
| `design/customer-cart/` | `/cart` |
| `design/customer-checkout/` | `/checkout` |
| `design/customer-orders/` | `/orders` |
| `design/customer-order-detail/` | `/orders/[id]` |
| `design/customer-profile/` | `/profile` |
| `design/admin-dashboard/` | `/admin/dashboard` |
| `design/admin-products/` | `/admin/products` |
| `design/admin-inventory/` | `/admin/inventory` |
| `design/admin-orders/` | `/admin/orders` |
| `design/admin-order-detail/` | `/admin/orders/[id]` |
| `design/admin-delivery-personnel/` | `/admin/delivery-personnel` |
| `design/delivery-dashboard/` | `/delivery/dashboard` |
| `design/delivery-detail/` | `/delivery/deliveries/[id]` |
| `design/delivery-profile/` | `/delivery/profile` |
