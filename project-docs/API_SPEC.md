# API_SPEC.md — API Route Specification
## Delivery Management Web Application

> All routes return `{ success: boolean, data?: T, error?: string }`.
> All authenticated routes require a valid session cookie (NextAuth).
> Base URL: `/api`

---

## Auth Routes

### POST `/api/auth/register`
**Auth:** None  
**Body:**
```json
{
  "name": "string (required)",
  "phone": "string (required)",
  "password": "string (required, min 8)",
  "confirmPassword": "string (required, must match password)",
  "address": "string (optional)"
}
```
**Success 201:**
```json
{ "success": true, "data": { "user": { "id": "...", "name": "...", "role": "customer" } } }
```
**Errors:** 400 (validation), 409 (phone taken)

---

### POST `/api/auth/[...nextauth]`
Handled by NextAuth. Exposes `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session`.

---

## Product Routes

### GET `/api/products`
**Auth:** None  
**Query params:**
- `search` (string, optional) — text search
- `page` (int, default 1)
- `limit` (int, default 20, max 100)
- `includeInactive` (boolean, admin only)

**Success 200:**
```json
{
  "success": true,
  "data": {
    "products": [Product],
    "total": 42,
    "page": 1,
    "pages": 3
  }
}
```

---

### POST `/api/products`
**Auth:** Admin only  
**Body (multipart or JSON with UploadThing URLs):**
```json
{
  "name": "string (required)",
  "price": "number (required, >0)",
  "description": "string (optional)",
  "images": ["url1", "url2"],
  "quantity": "integer (required, >=0)"
}
```
**Success 201:** `{ "success": true, "data": { "product": Product } }`

---

### GET `/api/products/[id]`
**Auth:** None  
**Success 200:** `{ "success": true, "data": { "product": Product } }`  
**Errors:** 404

---

### PUT `/api/products/[id]`
**Auth:** Admin only  
**Body:** Same shape as POST, all fields optional  
**Success 200:** `{ "success": true, "data": { "product": Product } }`

---

### DELETE `/api/products/[id]`
**Auth:** Admin only  
**Behavior:** Soft delete (`isActive: false`)  
**Success 200:** `{ "success": true, "data": { "message": "Product deactivated" } }`

---

## Cart Routes

### GET `/api/cart`
**Auth:** Customer  
**Success 200:**
```json
{
  "success": true,
  "data": {
    "items": [CartItem],
    "cartTotal": 1500
  }
}
```

---

### POST `/api/cart`
**Auth:** Customer  
**Body:**
```json
{
  "productId": "string",
  "quantity": "integer (>=1)"
}
```
**Behavior:** If product already in cart, replace quantity. Validate against current stock.  
**Success 200:** `{ "success": true, "data": { "cart": Cart } }`  
**Errors:** 400 (insufficient stock), 404 (product not found)

---

### PUT `/api/cart`
**Auth:** Customer  
**Body:**
```json
{
  "productId": "string",
  "quantity": "integer (>=0)"  // 0 = remove item
}
```
**Success 200:** `{ "success": true, "data": { "cart": Cart } }`

---

### DELETE `/api/cart`
**Auth:** Customer  
**Behavior:** Clear all items from cart  
**Success 200:** `{ "success": true, "data": { "message": "Cart cleared" } }`

---

## Order Routes

### GET `/api/orders`
**Auth:** Customer (own orders), Admin (all orders)  

**Customer query params:**
- `page`, `limit`

**Admin query params:**
- `status` (filter by status)
- `customerId`
- `page`, `limit`

**Success 200:**
```json
{
  "success": true,
  "data": {
    "orders": [Order],
    "total": 10,
    "page": 1,
    "pages": 1
  }
}
```

---

### POST `/api/orders`
**Auth:** Customer  
**Body:**
```json
{
  "deliveryOption": "home | pickup",
  "deliveryAddress": "string (required if home)",
  "paymentMethod": "cash | bank_transfer",
  "paymentScreenshot": "string URL (required if bank_transfer)"
}
```
**Behavior:**
1. Validate body
2. Fetch customer's cart (must not be empty)
3. Validate stock availability for all items
4. Atomically decrement stock
5. Create order with status "pending"
6. Clear cart
7. Send "Order Submitted" notification to customer

**Success 201:**
```json
{
  "success": true,
  "data": { "order": Order }
}
```
**Errors:** 400 (empty cart, missing screenshot, insufficient stock), 409 (stock conflict)

---

### GET `/api/orders/[id]`
**Auth:** Customer (own order only), Admin (any), Delivery (assigned order only)  
**Success 200:** `{ "success": true, "data": { "order": Order } }`  
**Errors:** 404, 403

---

### POST `/api/orders/[id]/approve`
**Auth:** Admin  
**Behavior:** pending → confirmed. Send "Order Confirmed" notification.  
**Success 200:** `{ "success": true, "data": { "order": Order } }`  
**Errors:** 400 (wrong current status)

---

### POST `/api/orders/[id]/reject`
**Auth:** Admin  
**Body:** `{ "note": "string (optional)" }`  
**Behavior:** pending → cancelled. Restore stock. Send "Order Cancelled" notification.  
**Success 200:** `{ "success": true, "data": { "order": Order } }`

---

### POST `/api/orders/[id]/assign`
**Auth:** Admin  
**Body:** `{ "deliveryPersonnelId": "string" }`  
**Behavior:** confirmed → transit. Assign delivery person. Send notification to delivery person.  
**Success 200:** `{ "success": true, "data": { "order": Order } }`  
**Errors:** 400 (delivery person not found or inactive)

---

### POST `/api/orders/[id]/status`
**Auth:** Admin or Delivery (delivery can only set delivered)  
**Body:** `{ "status": "OrderStatus", "note": "string (optional)" }`  
**Behavior:** Update status. Send appropriate customer notification.  
**Validation:** Must follow valid status transitions.  
**Success 200:** `{ "success": true, "data": { "order": Order } }`  
**Errors:** 400 (invalid transition), 403 (delivery trying to set non-delivered status)

---

## Inventory Routes

### GET `/api/inventory`
**Auth:** Admin  
**Success 200:**
```json
{
  "success": true,
  "data": {
    "products": [{ "id": "...", "name": "...", "quantity": 5, "isLowStock": true }]
  }
}
```

---

### PATCH `/api/inventory/[productId]`
**Auth:** Admin  
**Body:** `{ "adjustment": integer }` (positive = increase, negative = decrease)  
**Behavior:** Cannot go below 0.  
**Success 200:** `{ "success": true, "data": { "product": { "quantity": 15 } } }`  
**Errors:** 400 (would go below 0)

---

## Delivery Personnel Routes

### GET `/api/delivery-personnel`
**Auth:** Admin  
**Success 200:**
```json
{
  "success": true,
  "data": {
    "personnel": [{
      "id": "...",
      "name": "...",
      "phone": "...",
      "isActive": true,
      "assignedOrdersCount": 3
    }]
  }
}
```

---

### POST `/api/delivery-personnel`
**Auth:** Admin  
**Body:**
```json
{
  "name": "string",
  "phone": "string",
  "password": "string"
}
```
**Behavior:** Creates a User with `role: 'delivery'`  
**Success 201:** `{ "success": true, "data": { "personnel": User } }`  
**Errors:** 409 (phone taken)

---

### PUT `/api/delivery-personnel/[id]`
**Auth:** Admin  
**Body:** `{ "name"?, "phone"?, "password"?, "isActive"? }`  
**Success 200:** `{ "success": true, "data": { "personnel": User } }`

---

### DELETE `/api/delivery-personnel/[id]`
**Auth:** Admin  
**Behavior:** Soft delete. Fails if they have active (transit) orders.  
**Success 200:** `{ "success": true, "data": { "message": "Personnel deactivated" } }`  
**Errors:** 409 (has active deliveries)

---

## Upload Route

### POST `/api/upload`
**Auth:** Customer (payment screenshots), Admin (product images)  
**Handled by:** UploadThing  
**Returns:** `{ "url": "https://..." }`

---

## Dashboard Route

### GET `/api/admin/dashboard`
**Auth:** Admin  
**Success 200:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 42,
    "totalOrders": 150,
    "newOrders": 5,
    "ordersInTransit": 8,
    "deliveryPersonnelCount": 3
  }
}
```

---

## Delivery Routes (for Delivery Personnel)

### GET `/api/delivery/orders`
**Auth:** Delivery  
**Returns:** Orders assigned to this delivery person, grouped by status  
**Success 200:**
```json
{
  "success": true,
  "data": {
    "newOrders": [Order],
    "activeDeliveries": [Order],
    "completedDeliveries": [Order]
  }
}
```

---

## Notification Routes

### POST `/api/notifications/subscribe`
**Auth:** Any authenticated user  
**Body:** Web Push subscription object  
**Behavior:** Save subscription to user record  
**Success 200:** `{ "success": true }`

### POST `/api/notifications/unsubscribe`
**Auth:** Any authenticated user  
**Behavior:** Remove subscription from user record  
**Success 200:** `{ "success": true }`

---

## Profile Routes

### GET `/api/profile`
**Auth:** Any authenticated user  
**Success 200:** `{ "success": true, "data": { "user": User (no password) } }`

### PUT `/api/profile`
**Auth:** Any authenticated user  
**Body:** `{ "name"?, "address"?, "profilePhoto"? }`  
**Success 200:** `{ "success": true, "data": { "user": User } }`

---

## Status Transition Rules

```
Valid transitions (from → to):
pending    → confirmed   (admin: approve)
pending    → cancelled   (admin: reject)
confirmed  → transit     (admin: assign delivery + triggers transit)
confirmed  → cancelled   (admin: cancel)
transit    → delivered   (delivery: mark delivered)
transit    → cancelled   (admin: cancel)
```

Any other transition must return: `{ "success": false, "error": "Invalid status transition" }` with status 400.
