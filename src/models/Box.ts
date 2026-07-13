import mongoose, { Schema, Document, Types } from 'mongoose'
import { LocalizedTextSchema, hasLocalizedText } from './LocalizedText'
import type { LocalizedText } from '@/types/localized'

export interface IBoxProduct {
  product: Types.ObjectId
  quantity: number
}

export interface IBox extends Document {
  name: LocalizedText
  price: number
  coverImage?: string
  startDate?: Date
  endDate?: Date
  products: IBoxProduct[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BoxProductSchema = new Schema<IBoxProduct>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
)

const BoxSchema = new Schema<IBox>(
  {
    name: {
      type: LocalizedTextSchema,
      required: true,
      validate: {
        validator: hasLocalizedText,
        message: 'Box name is required in at least one language',
      },
    },
    price: { type: Number, required: true, min: 0 },
    coverImage: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    products: { type: [BoxProductSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

BoxSchema.index({ isActive: 1 })
BoxSchema.index({ startDate: 1, endDate: 1 })

export const Box = mongoose.models.Box || mongoose.model<IBox>('Box', BoxSchema)
