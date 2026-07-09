import { z } from 'zod'

export const localizedTextSchema = z.object({
  ar: z.string().trim().optional(),
  fr: z.string().trim().optional(),
  en: z.string().trim().optional(),
})

export const localizedNameSchema = z
  .object({
    ar: z.string().trim().max(100).optional(),
    fr: z.string().trim().max(100).optional(),
    en: z.string().trim().max(100).optional(),
  })
  .refine((v) => !!(v.ar || v.fr || v.en), {
    message: 'Name is required in at least one language',
  })
