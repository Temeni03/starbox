import { Schema } from 'mongoose'
import type { LocalizedText } from '@/types/localized'

export type { LocalizedText }

export const LocalizedTextSchema = new Schema<LocalizedText>(
  {
    ar: { type: String, trim: true },
    fr: { type: String, trim: true },
    en: { type: String, trim: true },
  },
  { _id: false }
)

export function hasLocalizedText(value?: LocalizedText | null) {
  return !!(value && (value.ar || value.fr || value.en))
}
