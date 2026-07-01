import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/lib/auth'

const f = createUploadthing()

export const ourFileRouter = {
  paymentScreenshot: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session) throw new Error('Unauthorized')
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),

  profilePhoto: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session) throw new Error('Unauthorized')
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),

  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async () => {
      const session = await auth()
      if (!session || session.user.role !== 'admin') throw new Error('Unauthorized')
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
