import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICartItem {
  product: Types.ObjectId
  itemType: 'Product' | 'Box'
  quantity: number
  price: number
  name: string
  image?: string
}

export interface ICart extends Document {
  user: Types.ObjectId
  items: ICartItem[]
  updatedAt: Date
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, refPath: 'itemType', required: true },
    itemType: { type: String, enum: ['Product', 'Box'], default: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String },
  },
  { _id: false }
)

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
)

CartSchema.index({ user: 1 })

export const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema)
