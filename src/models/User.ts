import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  phone: string
  password: string
  role: 'customer' | 'admin' | 'delivery'
  address?: string
  profilePhoto?: string
  language: 'ar' | 'fr' | 'en'
  fcmToken?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'admin', 'delivery'],
      default: 'customer',
      required: true,
    },
    address: { type: String, trim: true },
    profilePhoto: { type: String },
    language: { type: String, enum: ['ar', 'fr', 'en'], default: 'fr' },
    fcmToken: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

UserSchema.index({ phone: 1 })
UserSchema.index({ role: 1 })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
