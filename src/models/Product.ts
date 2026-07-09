import mongoose, { Schema, Document } from 'mongoose'
import { LocalizedTextSchema, hasLocalizedText, type LocalizedText } from './LocalizedText'

export interface IProduct extends Document {
  name: LocalizedText
  price: number
  description?: LocalizedText
  usageInstructions?: LocalizedText
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
    name: {
      type: LocalizedTextSchema,
      required: true,
      validate: {
        validator: hasLocalizedText,
        message: 'Product name is required in at least one language',
      },
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: LocalizedTextSchema },
    usageInstructions: { type: LocalizedTextSchema },
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

ProductSchema.index({
  'name.ar': 'text',
  'name.fr': 'text',
  'name.en': 'text',
  'description.ar': 'text',
  'description.fr': 'text',
  'description.en': 'text',
})
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ quantity: 1 })

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
