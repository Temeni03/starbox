'use client'

import { useState } from 'react'
import { upload } from '@vercel/blob/client'
import { UPLOAD_TYPES, type UploadType } from '@/lib/upload-types'

export function useBlobUpload(type: UploadType) {
  const [uploading, setUploading] = useState(false)

  async function uploadFile(file: File): Promise<string> {
    const { folder, kind } = UPLOAD_TYPES[type]
    if (!file.type.startsWith(`${kind}/`)) {
      throw new Error(`Only ${kind} files are allowed`)
    }

    setUploading(true)
    try {
      const pathname = `${folder}/${crypto.randomUUID()}-${file.name}`
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ type }),
        contentType: file.type,
      })
      return blob.url
    } finally {
      setUploading(false)
    }
  }

  async function removeFile(url: string): Promise<void> {
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, type }),
    })
  }

  return { upload: uploadFile, remove: removeFile, uploading }
}
