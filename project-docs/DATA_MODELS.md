# DATA_MODELS.md — MongoDB Schemas
## Delivery Management Web Application

> Implement each schema in `src/models/`. Use Mongoose 8.x.
> All schemas must include `timestamps: true` unless noted.

---

## 1. User

**File:** `src/models/User.ts`
**Collection:** `users`

```ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  phone: string
  password: string            // bcrypt hashed
  role: 'customer' | 'admin' | 'delivery'
  address?: string            // customer delivery address
  profilePhoto?: string       // URL from UploadThing
  pushSubscription?: {        // Web Push subscription object
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'delivery'], 
    default: 'customer',
    required: true 
  },
  address: { type: String, trim: true },
  profilePhoto: { type: String },
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String,
    },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// Index for auth lookups
UserSchema.index({ phone: 1 })
UserSchema.index({ role: 1 })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
```

---

## 2. Product

**File:** `src/models/Product.ts`
**Collection:** `products`

```ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  price: number               // stored in base currency units (e.g. cents or whole units)
  description?: string        // usage instructions
  images: string[]            // array of UploadThing URLs
  quantity: number            // available stock
  isActive: boolean           // soft delete flag
  lowStockThreshold: number   // default from env, overridable per product
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  images: [{ type: String }],
  quantity: { type: Number, required: true, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  lowStockThreshold: { 
    type: Number, 
    default: () => parseInt(process.env.LOW_STOCK_THRESHOLD || '10') 
  },
}, { timestamps: true })

// Text index for search
ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ quantity: 1 })

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
```

---

## 3. Cart

**File:** `src/models/Cart.ts`
**Collection:** `carts`

```ts
import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICartItem {
  product: Types.ObjectId
  quantity: number
  price: number               // snapshot of price at time of adding
  name: string                // snapshot of name
  image?: string              // snapshot of first image URL
}

export interface ICart extends Document {
  user: Types.ObjectId
  items: ICartItem[]
  updatedAt: Date
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },          // denormalized snapshot
  name: { type: String, required: true },            // denormalized snapshot
  image: { type: String },
}, { _id: false })

const CartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
}, { timestamps: true })

CartSchema.index({ user: 1 })

export const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema)
```

**Cart computation (always computed, never stored):**
```
cartTotal = sum(item.price * item.quantity)
```

---

## 4. Order

**File:** `src/models/Order.ts`
**Collection:** `orders`

```ts
import mongoose, { Schema, Document, Types } from 'mongoose'

export type OrderStatus = 'pending' | 'confirmed' | 'transit' | 'delivered' | 'cancelled'
export type DeliveryOption = 'home' | 'pickup'
export type PaymentMethod = 'cash' | 'bank_transfer'

export interface IOrderItem {
  product: Types.ObjectId
  name: string                // snapshot
  price: number               // snapshot
  quantity: number
  image?: string              // snapshot
}

export interface IOrder extends Document {
  orderNumber: string         // e.g. "ORD-00042"
  customer: Types.ObjectId
  items: IOrderItem[]
  
  cartTotal: number
  deliveryFee: number
  grandTotal: number
  
  deliveryOption: DeliveryOption
  deliveryAddress?: string    // required if deliveryOption === 'home'
  
  paymentMethod: PaymentMethod
  paymentScreenshot?: string  // UploadThing URL, required for bank_transfer
  
  status: OrderStatus
  statusHistory: Array<{
    status: OrderStatus
    changedAt: Date
    changedBy: Types.ObjectId // User who triggered the change
    note?: string
  }>
  
  assignedTo?: Types.ObjectId // DeliveryPersonnel User ID
  
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
}, { _id: false })

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  
  cartTotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true, default: 0 },
  grandTotal: { type: Number, required: true },
  
  deliveryOption: { type: String, enum: ['home', 'pickup'], required: true },
  deliveryAddress: { type: String },
  
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer'], required: true },
  paymentScreenshot: { type: String },
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'transit', 'delivered', 'cancelled'],
    default: 'pending',
    required: true 
  },
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String },
  }],
  
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

OrderSchema.index({ customer: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ assignedTo: 1, status: 1 })
OrderSchema.index({ orderNumber: 1 })

// Auto-generate order number
OrderSchema.pre('save', async function (next) {
  if (!this.isNew) return next()
  const count = await mongoose.model('Order').countDocuments()
  this.orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`
  next()
})

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
```

---

## 5. AppConfig (Optional — for runtime config)

**File:** `src/models/AppConfig.ts`
**Collection:** `app_configs`

Stores configurable values like delivery fee and bank payment code.

```ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IAppConfig extends Document {
  key: string
  value: string
  updatedAt: Date
}

const AppConfigSchema = new Schema<IAppConfig>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, { timestamps: true })

// Seed with defaults:
// { key: 'delivery_fee', value: '500' }           // in smallest currency unit
// { key: 'bank_payment_code', value: 'STORE-001' }
// { key: 'low_stock_threshold', value: '10' }

export const AppConfig = mongoose.models.AppConfig || mongoose.model<IAppConfig>('AppConfig', AppConfigSchema)
```

---

## 6. Database Seed Script

**File:** `scripts/seed.ts`

Create a seed script that:
1. Creates one admin user (phone: `0000000000`, password: `admin1234`)
2. Creates sample products (5–10) with placeholder images
3. Sets AppConfig defaults
4. Logs created records to console

Run with: `npx tsx scripts/seed.ts`

---

## 7. Indexes Summary

| Collection | Index | Purpose |
|---|---|---|
| users | `{ phone: 1 }` unique | Auth lookup |
| users | `{ role: 1 }` | Role-based queries |
| products | `{ name: 'text', description: 'text' }` | Full-text search |
| products | `{ isActive: 1 }` | Filter active products |
| carts | `{ user: 1 }` unique | One cart per user |
| orders | `{ customer: 1, createdAt: -1 }` | Customer order history |
| orders | `{ status: 1 }` | Status filtering |
| orders | `{ assignedTo: 1, status: 1 }` | Delivery dashboard |
| orders | `{ orderNumber: 1 }` unique | Order lookup |

---

## 8. Data Integrity Rules

1. **Stock decrement on order creation**: When an order is created, decrement product quantities atomically. Use MongoDB `$inc` with a check that quantity ≥ ordered amount.

```ts
// Atomic stock check + decrement
const result = await Product.findOneAndUpdate(
  { _id: productId, quantity: { $gte: orderedQty } },
  { $inc: { quantity: -orderedQty } },
  { new: true }
)
if (!result) throw new Error(`Insufficient stock for product ${productId}`)
```

2. **Stock restore on cancellation**: If order is cancelled, restore stock quantities.

3. **Price snapshots**: Always store item price/name in the order at time of order creation. Never reference live product price from order display.

4. **Cart cleanup**: After successful order creation, clear the user's cart.
