export const UPLOAD_TYPES = {
  productImage: {
    kind: 'image',
    folder: 'products',
    maxSize: 4 * 1024 * 1024,
    maxFiles: 5,
    roles: ['admin'],
  },
  productVideo: {
    kind: 'video',
    folder: 'product-videos',
    maxSize: 30 * 1024 * 1024,
    maxFiles: 1,
    roles: ['admin'],
  },
  boxCoverImage: {
    kind: 'image',
    folder: 'boxes',
    maxSize: 4 * 1024 * 1024,
    maxFiles: 1,
    roles: ['admin'],
  },
  paymentScreenshot: {
    kind: 'image',
    folder: 'payment-screenshots',
    maxSize: 4 * 1024 * 1024,
    maxFiles: 1,
    roles: ['customer', 'admin', 'delivery'],
  },
  profilePhoto: {
    kind: 'image',
    folder: 'profile-photos',
    maxSize: 2 * 1024 * 1024,
    maxFiles: 1,
    roles: ['customer', 'admin', 'delivery'],
  },
} as const

export type UploadType = keyof typeof UPLOAD_TYPES

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const ALLOWED_VIDEO_CONTENT_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
]
