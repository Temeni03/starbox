import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  price: number
  description?: string
  usageInstructions?: string
  images: string[]
  video?: string
  quantity: number
  isActive: boolean
  lowStockThreshold: number
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    usageInstructions: { type: String, trim: true },
    images: [{ type: String }],
    video: { type: String },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    lowStockThreshold: {
      type: Number,
      default: () => parseInt(process.env.LOW_STOCK_THRESHOLD || '10'),
    },
  },
  { timestamps: true }
)

ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ quantity: 1 })

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
