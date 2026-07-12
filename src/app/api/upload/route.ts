import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { auth } from '@/lib/auth'
import { deleteBlob } from '@/lib/blob'
import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  ALLOWED_VIDEO_CONTENT_TYPES,
  UPLOAD_TYPES,
  type UploadType,
} from '@/lib/upload-types'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await auth()
        if (!session) throw new Error('Unauthorized')

        const payload = clientPayload ? JSON.parse(clientPayload) : {}
        const type = payload.type as string | undefined
        const config = type && type in UPLOAD_TYPES ? UPLOAD_TYPES[type as UploadType] : undefined
        if (!config) throw new Error('Invalid upload type')

        if (!(config.roles as readonly string[]).includes(session.user.role)) {
          throw new Error('Forbidden')
        }

        return {
          allowedContentTypes:
            config.kind === 'video' ? ALLOWED_VIDEO_CONTENT_TYPES : ALLOWED_IMAGE_CONTENT_TYPES,
          maximumSizeInBytes: config.maxSize,
          addRandomSuffix: true,
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, type } = (await request.json().catch(() => ({}))) as {
    url?: string
    type?: string
  }
  if (!url || !type) {
    return NextResponse.json({ error: 'Missing url or type' }, { status: 400 })
  }

  const config = type in UPLOAD_TYPES ? UPLOAD_TYPES[type as UploadType] : undefined
  if (!config) return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
  if (!(config.roles as readonly string[]).includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let pathname: string
  try {
    pathname = new URL(url).pathname
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }
  if (!pathname.startsWith(`/${config.folder}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await deleteBlob(url)
  return NextResponse.json({ success: true })
}
