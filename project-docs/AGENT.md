# AGENT.md — AI Implementation Guide
## Delivery Management Web Application

> **Read this file first and completely before writing a single line of code.**
> This is your single source of truth. Follow it exactly, in order.

---

## 0. Project Overview

A mobile-first delivery management web application built with **Next.js 15 (App Router)** and **MongoDB**. It serves three user roles:

| Role | Access |
|------|--------|
| **Customer** | Browse products, manage cart, checkout, track orders |
| **Admin** | Manage products, orders, inventory, delivery personnel |
| **Delivery** | View assigned orders, update delivery status |

**Primary target**: Mobile browsers (375px+). Must also work on tablet and desktop.

---

## 1. Repository Structure

After scaffolding, the project must look exactly like this:

```
/
├── AGENT.md                        ← This file (copy to repo root)
├── project-docs/
│   ├── AGENT.md                    ← Same file, canonical location
│   ├── PRD.md                      ← Product Requirements Document
│   ├── DATA_MODELS.md              ← MongoDB schemas
│   ├── API_SPEC.md                 ← All API routes spec
│   ├── AUTH.md                     ← Auth architecture
│   └── TASKS.md                    ← Implementation checklist
├── design/
│   ├── customer-home/
│   │   ├── screen.png
│   │   └── screen.html
│   ├── customer-cart/
│   │   ├── screen.png
│   │   └── screen.html
│   ├── ... (all other screens)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (customer)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    ← Home / product listing
│   │   │   ├── product/[id]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── delivery-personnel/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── (delivery)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── deliveries/[id]/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts                ← GET list, POST create
│   │   │   │   └── [id]/route.ts           ← GET, PUT, DELETE
│   │   │   ├── cart/route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── approve/route.ts
│   │   │   │       ├── reject/route.ts
│   │   │   │       ├── assign/route.ts
│   │   │   │       └── status/route.ts
│   │   │   ├── inventory/route.ts
│   │   │   ├── delivery-personnel/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── notifications/route.ts
│   │   ├── layout.tsx                      ← Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                             ← Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   ├── layout/
│   │   │   ├── CustomerNav.tsx
│   │   │   ├── AdminNav.tsx
│   │   │   ├── DeliveryNav.tsx
│   │   │   └── BottomNav.tsx               ← Mobile bottom navigation
│   │   ├── customer/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── OrderStatus.tsx
│   │   ├── admin/
│   │   │   ├── KPICard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── InventoryRow.tsx
│   │   │   ├── OrderTable.tsx
│   │   │   ├── OrderDetailPanel.tsx
│   │   │   └── DeliveryPersonnelForm.tsx
│   │   └── delivery/
│   │       ├── DeliveryCard.tsx
│   │       └── DeliveryDetail.tsx
│   ├── lib/
│   │   ├── mongodb.ts                      ← DB connection singleton
│   │   ├── auth.ts                         ← Auth helpers (JWT/session)
│   │   ├── middleware.ts                   ← Route protection logic
│   │   ├── uploadthing.ts                  ← File upload config
│   │   ├── notifications.ts                ← Push notification helpers
│   │   └── validations.ts                  ← Zod schemas
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Cart.ts
│   │   └── DeliveryPersonnel.ts
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useOrders.ts
│   │   ├── useProducts.ts
│   │   └── useNotifications.ts
│   ├── store/
│   │   └── cartStore.ts                    ← Zustand cart store
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts                       ← Next.js middleware for auth
├── public/
│   └── icons/                             ← PWA icons
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 2. Tech Stack

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.x | Framework (App Router) |
| `react` | 19.x | UI |
| `typescript` | 5.x | Type safety |
| `mongodb` | 6.x | Database driver |
| `mongoose` | 8.x | ODM / Schema validation |

### Auth
| Package | Purpose |
|---------|---------|
| `next-auth` v5 (beta) | Session management |
| `bcryptjs` | Password hashing |

### State & Data Fetching
| Package | Purpose |
|---------|---------|
| `zustand` | Client state (cart) |
| `swr` | Data fetching / caching |
| `zod` | Runtime validation |

### UI
| Package | Purpose |
|---------|---------|
| `tailwindcss` | Styling |
| `lucide-react` | Icons |
| `react-hot-toast` | Toast notifications |
| `uploadthing` | File/image uploads |

### PWA & Notifications
| Package | Purpose |
|---------|---------|
| `next-pwa` | PWA manifest + service worker |
| `web-push` | Push notifications |

### Dev
| Package | Purpose |
|---------|---------|
| `eslint` | Linting |
| `prettier` | Formatting |

---

## 3. Environment Variables

Create `.env.local` from `.env.local.example`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# UploadThing (file uploads)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Web Push (notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:admin@yourdomain.com

# Low stock threshold
LOW_STOCK_THRESHOLD=10
```

---

## 4. Implementation Order

**Follow this order strictly. Do not skip ahead.**

### Phase 1 — Foundation
1. `npm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"`
2. Install all packages from section 2
3. Create folder structure from section 1
4. Set up `src/lib/mongodb.ts` (connection singleton)
5. Set up `src/app/layout.tsx` (root layout with providers)
6. Set up `tailwind.config.ts` (design tokens — see section 6)
7. Set up `src/globals.css`
8. Create `.env.local.example`

### Phase 2 — Data Models
Implement all Mongoose models per `DATA_MODELS.md`:
1. `User.ts`
2. `Product.ts`
3. `Order.ts`
4. `Cart.ts`
5. `DeliveryPersonnel.ts`

### Phase 3 — Auth
1. Configure NextAuth with Credentials provider
2. Implement `src/app/api/auth/[...nextauth]/route.ts`
3. Implement `src/middleware.ts` for route protection
4. Build login page — match `design/auth-login/`
5. Build register page — match `design/auth-register/`

### Phase 4 — Customer Flow
Implement in this sub-order:
1. Product listing page (home) — match `design/customer-home/`
2. Product detail page — match `design/customer-product/`
3. Cart page — match `design/customer-cart/`
4. Checkout page (delivery + payment) — match `design/customer-checkout/`
5. Orders list page — match `design/customer-orders/`
6. Order detail page — match `design/customer-order-detail/`
7. Profile page — match `design/customer-profile/`

### Phase 5 — Admin Flow
1. Dashboard — match `design/admin-dashboard/`
2. Product list + CRUD — match `design/admin-products/`
3. Inventory management — match `design/admin-inventory/`
4. Order management — match `design/admin-orders/`
5. Order detail — match `design/admin-order-detail/`
6. Delivery personnel management — match `design/admin-delivery-personnel/`

### Phase 6 — Delivery Flow
1. Delivery dashboard — match `design/delivery-dashboard/`
2. Delivery detail — match `design/delivery-detail/`
3. Profile — match `design/delivery-profile/`

### Phase 7 — Cross-Cutting Features
1. Push notifications (web-push)
2. PWA manifest + service worker
3. Search functionality
4. Low stock alerts

### Phase 8 — Polish & Production
1. Error boundaries
2. Loading skeletons
3. Network error handling
4. Empty states
5. Form validation messages
6. SEO metadata
7. Performance audit (Lighthouse)

---

## 5. Design System

### Color Tokens (add to `tailwind.config.ts`)

```ts
colors: {
  brand: {
    primary: '#1B4332',    // Deep green — primary actions
    secondary: '#40916C',  // Medium green — accents
    light: '#D8F3DC',      // Light green — backgrounds
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  status: {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    transit: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
  },
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
}
```

> **Override with design files**: If any screen in `design/` uses different colors, those screens win. Extract exact hex values from the HTML files.

### Typography

```ts
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

### Spacing & Radius
- Mobile base padding: `px-4` (16px)
- Card radius: `rounded-2xl`
- Button radius: `rounded-xl`
- Input radius: `rounded-lg`
- Mobile touch targets: minimum `h-12` (48px)

### Breakpoints (mobile-first)
```
sm: 640px   ← tablet portrait
md: 768px   ← tablet landscape  
lg: 1024px  ← desktop
```

---

## 6. Design File Usage Rules

For every screen you implement:

1. **Open the `.html` file** in `design/<screen-name>/screen.html` first
2. **Extract**: exact colors, spacing, font sizes, component layouts, copy/labels
3. **Reference the `.png`** for visual verification
4. Your implementation must be **pixel-faithful** on mobile (375px wide)
5. Adapt the layout to be responsive for larger screens (the designs are mobile)
6. **Do not invent UI** — every element must come from the design files or be a direct functional necessity

---

## 7. API Design Rules

All API routes must:

```ts
// ✅ Standard response shape
{ success: true, data: T }
{ success: false, error: string, code?: string }

// ✅ Always validate with Zod
const schema = z.object({ ... })
const result = schema.safeParse(body)
if (!result.success) return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 })

// ✅ Always check auth
const session = await getServerSession(authOptions)
if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

// ✅ Role guard helper
if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
```

See `API_SPEC.md` for every route's full spec.

---

## 8. MongoDB Connection Pattern

```ts
// src/lib/mongodb.ts — singleton pattern (REQUIRED, do not deviate)
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) throw new Error('MONGODB_URI env var is not set')

let cached = (global as any).mongoose ?? { conn: null, promise: null }
;(global as any).mongoose = cached

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cached.conn = await cached.promise
  return cached.conn
}
```

---

## 9. Auth Architecture

- **Library**: NextAuth v5 (Auth.js)
- **Strategy**: JWT sessions (no DB session adapter needed)
- **Credentials**: email + password (bcrypt)
- **Roles stored in JWT**: `user.role` = `'customer' | 'admin' | 'delivery'`

### Route Protection Matrix

| Path Pattern | Allowed Roles |
|---|---|
| `/` (home, product, cart) | Public (no auth required to browse) |
| `/checkout`, `/orders/*` | `customer` |
| `/admin/*` | `admin` |
| `/delivery/*` | `delivery` |
| `/api/admin/*` | `admin` |
| `/api/delivery/*` | `delivery` |

### Middleware

```ts
// src/middleware.ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

---

## 10. Cart Architecture

Cart state lives in **two places**, kept in sync:

| Location | Purpose |
|---|---|
| **Zustand store** (`cartStore.ts`) | Client-side, instant UI updates |
| **MongoDB** `Cart` collection | Server-side persistence for logged-in users |

### Sync rules:
- Anonymous users: cart in Zustand only (localStorage backup)
- On login: merge local cart with server cart
- On checkout: read from server cart (authoritative)

---

## 11. File Upload (Payment Screenshots)

Use **UploadThing**:

```ts
// src/lib/uploadthing.ts
import { createUploadthing } from 'uploadthing/next'
const f = createUploadthing()

export const ourFileRouter = {
  paymentScreenshot: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions)
      if (!session) throw new Error('Unauthorized')
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url }
    }),
}
```

---

## 12. Order Status Flow

```
Pending Review → Confirmed → In Transit → Delivered
                ↘ Cancelled (from any state except Delivered)
```

- Only **admin** can transition: Pending → Confirmed, Confirmed → In Transit, any → Cancelled
- Only **delivery** can transition: In Transit → Delivered (via "Mark as Delivered")
- Admin assigns delivery personnel when moving to "In Transit"

---

## 13. Notification Events

Trigger push notifications for these events:

| Event | Recipient | Message |
|---|---|---|
| Order placed | Customer | "Your order #X has been submitted." |
| Order confirmed | Customer | "Your order #X has been confirmed." |
| Order shipped | Customer | "Your order #X is on its way!" |
| Order delivered | Customer | "Your order #X has been delivered." |
| Order cancelled | Customer | "Your order #X has been cancelled." |
| New order assigned | Delivery | "You have a new delivery assigned." |

---

## 14. Error Messages (Exact Strings)

Use these exact strings in UI:

```
Network error:     "Connection Lost. Please Try Again."
Payment missing:   "Payment Proof Required."
No search results: "No Matching Products Found."
Low stock:         "Low Stock Warning"
```

---

## 15. Performance Requirements

- Lighthouse mobile score: **≥ 85** on all pages
- Product images: use `next/image` with proper `sizes` prop
- API routes: add proper cache headers for product listings
- Use `loading.tsx` files for all route segments
- Use `error.tsx` files for all route segments
- Implement skeleton loaders (not spinners) for content areas

---

## 16. Security Checklist

Before considering any feature complete:

- [ ] Input sanitized with Zod before any DB write
- [ ] MongoDB queries use parameterized values (Mongoose handles this)
- [ ] File uploads validated (type + size) server-side
- [ ] API routes check session role, not just session existence
- [ ] No secrets in client-side code
- [ ] Payment screenshots stored via UploadThing (not local filesystem)
- [ ] Passwords hashed with bcrypt (cost factor ≥ 12)

---

## 17. Code Style Rules

```ts
// ✅ Server Components by default
// Only add 'use client' when you need: useState, useEffect, event handlers, browser APIs

// ✅ Async server components
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  // ...
}

// ✅ API routes always handle errors
try {
  await connectDB()
  // ... logic
} catch (error) {
  console.error('[API_ERROR]', error)
  return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
}

// ✅ Types first — define before using
interface Product { ... }
type OrderStatus = 'pending' | 'confirmed' | 'transit' | 'delivered' | 'cancelled'
```

---

## 18. Testing Approach

For each implemented feature, verify:

1. **Happy path** — normal user flow works end-to-end
2. **Auth guard** — unauthenticated requests get 401
3. **Role guard** — wrong role gets 403
4. **Validation** — bad input returns 400 with clear message
5. **Mobile** — test at 375px width in browser devtools

---

## 19. Definition of Done

A feature is **done** when:

- [ ] Matches design file pixel-faithfully on 375px
- [ ] Responsive and functional at 768px and 1024px
- [ ] API route is implemented and validated
- [ ] Error states display correct messages
- [ ] Loading states implemented (skeleton or spinner)
- [ ] Empty states implemented
- [ ] Works without JavaScript (forms use server actions where possible)
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No ESLint errors

---

## 20. Contact Points

When you are uncertain about design intent:
1. Check the `.html` file first — it is the most authoritative design source
2. Check the `.png` for visual reference
3. Check `PRD.md` for functional requirements
4. Check `API_SPEC.md` for data shapes
5. Only then make a reasonable assumption and document it as a `// TODO: verify with designer` comment
