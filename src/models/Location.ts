import mongoose, { Schema, Document } from 'mongoose'

export interface ILocation extends Document {
  nameAr: string
  nameFr: string
  price: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const LocationSchema = new Schema<ILocation>(
  {
    nameAr: { type: String, required: true, trim: true },
    nameFr: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

LocationSchema.index({ nameAr: 'text', nameFr: 'text' })
LocationSchema.index({ isActive: 1 })

export const Location =
  mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema)
