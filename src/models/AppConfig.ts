import mongoose, { Schema, Document } from 'mongoose'

export interface IAppConfig extends Document {
  key: string
  value: string
  updatedAt: Date
}

const AppConfigSchema = new Schema<IAppConfig>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
)

export const AppConfig =
  mongoose.models.AppConfig || mongoose.model<IAppConfig>('AppConfig', AppConfigSchema)
