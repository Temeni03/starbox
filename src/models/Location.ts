import mongoose, { Schema, Document } from 'mongoose'
import { LocalizedTextSchema, hasLocalizedText, type LocalizedText } from './LocalizedText'

export interface ILocation extends Document {
  name: LocalizedText
  price: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: LocalizedTextSchema,
      required: true,
      validate: {
        validator: hasLocalizedText,
        message: 'Location name is required in at least one language',
      },
    },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

LocationSchema.index({ 'name.ar': 'text', 'name.fr': 'text', 'name.en': 'text' })
LocationSchema.index({ isActive: 1 })

export const Location =
  mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema)
