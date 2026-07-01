# PRD.md — Product Requirements Document
## Delivery Management Web Application

---

## 1. Product Summary

A mobile-first web application that enables customers to browse products and place orders with cash or bank transfer payment. Administrators manage products, inventory, and orders. Delivery personnel receive and fulfill delivery assignments.

---

## 2. User Roles

### 2.1 Customer
- Self-registers with name, phone, address, password
- Browses and searches the product catalog
- Manages a persistent cart
- Checks out with delivery + payment selection
- Tracks order history and status

### 2.2 Administrator
- Created manually (seeded or via admin CLI — no public registration)
- Full product, inventory, and order management
- Manages delivery personnel accounts
- Views operational dashboard KPIs
- Approves/rejects orders and assigns deliveries

### 2.3 Delivery Personnel
- Account created by admin
- Views assigned deliveries only
- Updates delivery status (start / complete)
- Views their own profile and delivery history

---

## 3. Customer Features

### 3.1 Authentication

#### Registration
**Fields (all required):**
- Full Name
- Phone Number (unique)
- Address (text area)
- Password (min 8 chars)
- Confirm Password

**Behavior:**
- Phone number must be unique
- On success: auto-login and redirect to home
- On failure: show field-level error messages

#### Login
**Fields:**
- Phone Number
- Password

**Behavior:**
- On success: redirect to home (or previous page if redirect was set)
- On failure: "Invalid phone number or password."
- No "forgot password" flow required (v1)

### 3.2 Product Catalog (Home)

**Display:**
- Product grid (2 columns on mobile, 3 on tablet, 4 on desktop)
- Each card shows: product image, name, price, "Add to Cart" button
- Search bar at top (sticky)
- Category filter (if categories are implemented — optional v1)

**Search:**
- Searches by product name and keywords (description)
- Debounced 300ms
- Shows "No Matching Products Found." when empty

**Product Detail Page:**
- Full-size image gallery (swipeable on mobile)
- Name, price, full description / usage instructions
- Quantity selector (min 1, max = available stock)
- "Add to Cart" button
- Stock indicator (shows "Out of Stock" when quantity = 0, disables add to cart)

### 3.3 Cart

**Display:**
- List of cart items
- Each item: image thumbnail, name, price, quantity controls (−/+), remove button, line total
- Cart summary at bottom: subtotal
- "Proceed to Checkout" CTA (disabled if cart is empty)

**Behavior:**
- Quantity cannot exceed available stock (validate on change)
- Removing last item shows empty cart state
- Cart persists across sessions (localStorage for guests, DB for logged-in)

### 3.4 Checkout

#### Step 1: Delivery Options

| Option | Label | Details |
|--------|-------|---------|
| Home Delivery | "Home Delivery" | Requires address (pre-filled from profile, editable) |
| Store Pickup | "Store Pickup" | No address needed |

**Delivery fee:**
- Home Delivery: configurable (stored in DB/env, e.g. flat fee)
- Store Pickup: free (0)

#### Step 2: Order Summary
- Product list with quantities
- Cart total
- Delivery fee
- **Grand Total** = Cart Total + Delivery Fee
- Updates automatically when delivery option changes

#### Step 3: Payment Method

**Option A — Cash on Delivery:**
- Display: Total Amount Due
- CTA: "Submit Order"

**Option B — Bank Transfer:**
- Display: Store Payment Code (configured in admin/env)
- Display: Transfer Amount (= Grand Total)
- Upload: Payment Screenshot (image file, required)
- CTA: "Submit Order"

**Validation before submission:**
- Delivery option selected ✓
- Payment method selected ✓
- Screenshot uploaded if bank transfer selected ✓

**On success:**
- Create order in DB with status "Pending Review"
- Clear cart
- Show success message
- Redirect to order detail page

### 3.5 Orders

**List view:**
Each order card:
- Order Number (e.g. #ORD-00042)
- Date (formatted: "15 Jan 2025")
- Total Amount
- Status badge (color-coded — see status colors in AGENT.md)

**Detail view:**
- All order fields
- Product list with quantities and prices
- Delivery address (if home delivery)
- Payment method
- Payment screenshot (if bank transfer — visible to customer)
- Current status with timeline

### 3.6 Profile

**Display:**
- Profile photo (optional, editable)
- Name
- Phone Number
- Address

**Actions:**
- "Edit Profile" — inline form edit
- "Logout"

---

## 4. Admin Features

### 4.1 Dashboard KPIs

| KPI | Description |
|-----|-------------|
| Total Products | Count of active products |
| Total Orders | Count of all orders |
| New Orders | Orders with status "Pending Review" |
| Orders In Transit | Orders with status "In Transit" |
| Delivery Personnel | Count of delivery personnel accounts |

Refresh: on page load (no real-time polling required in v1).

### 4.2 Product Management

**List view:**
- Search by name
- "Add Product" button
- Each product row: image thumbnail, name, price, quantity, actions (Edit, Delete)
- Delete: confirm dialog before deletion

**Add/Edit form fields:**
| Field | Type | Validation |
|-------|------|-----------|
| Name | Text | Required, max 100 chars |
| Price | Number | Required, > 0, 2 decimal places |
| Usage Instructions | Textarea | Optional |
| Images | File upload | 1–5 images, each max 4MB |
| Available Quantity | Integer | Required, ≥ 0 |

**Behavior:**
- Deleting a product with active orders: soft-delete (mark inactive) — do not remove from DB
- Images uploaded via UploadThing

### 4.3 Inventory Management

**Display:**
- Table: product name, current stock, actions
- Low Stock Warning badge when quantity < LOW_STOCK_THRESHOLD

**Actions per product:**
- Increase Stock: input number → add to current quantity
- Decrease Stock: input number → subtract from current quantity (cannot go below 0)

### 4.4 Order Management

**List view:**
- Filter by status (all, pending, confirmed, transit, delivered, cancelled)
- Each order row: order number, customer name, date, total, status, action button

**Detail view — readable sections:**
1. Customer: name, phone, delivery address
2. Payment: method, screenshot (viewable/downloadable if bank transfer)
3. Products: item list with quantities and prices
4. Total amount
5. Current status

**Admin actions:**
- **Approve** (Pending → Confirmed)
- **Reject** (Pending → Cancelled) — requires reason (optional text)
- **Assign Delivery Personnel** (Confirmed → shown when assigning)
- **Update Status** → triggers notification to customer

When assigning delivery:
- Dropdown of active delivery personnel
- On assign: order moves to "In Transit", assigned delivery person notified

### 4.5 Delivery Personnel Management

**List view:**
- Table: name, phone, assigned orders count, status, actions

**Add/Edit form:**
| Field | Type |
|-------|------|
| Full Name | Text (required) |
| Phone Number | Text (required, unique) |
| Password | Text (required on create, optional on edit) |

**Delete:** soft-delete. Cannot delete if they have active (In Transit) orders.

**Status:** Active / Inactive (admin can toggle)

---

## 5. Delivery Personnel Features

### 5.1 Dashboard

Three sections:
1. **New Orders** — assigned but not yet started (status: In Transit, not yet confirmed start)
2. **Active Deliveries** — started (delivery confirmed by delivery person)
3. **Completed Deliveries** — delivered

### 5.2 Delivery Detail

**Customer information:**
- Customer name
- Phone number (tappable tel: link on mobile)
- Delivery address

**Payment information (if Cash on Delivery):**
- Amount to collect

**Actions:**
- "Start Delivery" → marks delivery as active
- "Mark as Delivered" → status → Delivered, triggers customer notification

### 5.3 Profile

**Display:**
- Name, phone
- Completed deliveries count
- Activity status

**Actions:**
- Logout

---

## 6. Global Requirements

### 6.1 Notifications

Implement browser push notifications (Web Push API). Users must opt-in.
- Store subscription in DB per user
- Trigger on all order status changes (see AGENT.md §13)

Fallback: if push not supported/denied, skip silently (no v1 fallback required).

### 6.2 Search

- Product search available to all users (auth not required)
- Search by: product name (primary), description/keywords (secondary)
- MongoDB text index on Product collection

### 6.3 Error States

| Situation | Display |
|-----------|---------|
| Network error | "Connection Lost. Please Try Again." + retry button |
| Payment screenshot missing | "Payment Proof Required." (inline form error) |
| No search results | "No Matching Products Found." |
| Empty cart | "Your cart is empty." + "Browse Products" button |
| Empty orders | "No orders yet." + "Start Shopping" button |

### 6.4 Loading States

- Use skeleton loaders (not spinners) for:
  - Product grid
  - Order list
  - Order detail
  - Dashboard KPIs
- Use spinner only for form submission buttons

### 6.5 PWA

Configure as a Progressive Web App:
- `manifest.json` with app name, icons, theme color
- Service worker for offline fallback page (not full offline support)
- "Add to Home Screen" prompt

---

## 7. Out of Scope (v1)

- Forgot password / password reset
- Product categories/filters (optional)
- Real-time order tracking (WebSocket/SSE)
- Multi-language support
- Payment gateway integration (only manual bank transfer)
- Customer reviews / ratings
- Discount codes / promotions
- Admin analytics charts (only KPI numbers)
