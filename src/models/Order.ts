import mongoose, { Schema, Document, Types } from 'mongoose'

export type OrderStatus = 'pending' | 'confirmed' | 'transit' | 'delivered' | 'cancelled'
export type DeliveryOption = 'home' | 'pickup'
export type PaymentMethod = 'cash' | 'bank_transfer'

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  price: number
  quantity: number
  image?: string
}

export interface IOrder extends Document {
  orderNumber: string
  customer: Types.ObjectId
  items: IOrderItem[]

  cartTotal: number
  deliveryFee: number
  grandTotal: number

  deliveryOption: DeliveryOption
  deliveryAddress?: string
  deliveryLocation?: Types.ObjectId

  paymentMethod: PaymentMethod
  paymentScreenshot?: string

  status: OrderStatus
  statusHistory: Array<{
    status: OrderStatus
    changedAt: Date
    changedBy: Types.ObjectId
    note?: string
  }>

  assignedTo?: Types.ObjectId

  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],

    cartTotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true },

    deliveryOption: { type: String, enum: ['home', 'pickup'], required: true },
    deliveryAddress: { type: String },
    deliveryLocation: { type: Schema.Types.ObjectId, ref: 'Location' },

    paymentMethod: { type: String, enum: ['cash', 'bank_transfer'], required: true },
    paymentScreenshot: { type: String },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'transit', 'delivered', 'cancelled'],
      default: 'pending',
      required: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
      },
    ],

    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

OrderSchema.index({ customer: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ assignedTo: 1, status: 1 })
OrderSchema.index({ orderNumber: 1 })

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
