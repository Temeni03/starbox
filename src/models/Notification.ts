import mongoose, { Schema, Document, Types } from 'mongoose'

export type NotificationType =
  | 'order_submitted'
  | 'order_confirmed'
  | 'order_cancelled'
  | 'order_assigned'
  | 'order_transit'
  | 'order_delivered'
  | 'promotion'
  | 'new_order'
  | 'payment_submitted'
  | 'low_stock'
  | 'delivery_confirmed'
  | 'delivery_new_mission'

export interface INotification extends Document {
  user: Types.ObjectId
  type: NotificationType
  title: string
  body: string
  url?: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    url: { type: String },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

NotificationSchema.index({ user: 1, createdAt: -1 })
NotificationSchema.index({ user: 1, read: 1 })

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
