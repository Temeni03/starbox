'use client'

import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import toast from 'react-hot-toast'
import { useBlobUpload } from '@/hooks/useBlobUpload'
import { UPLOAD_TYPES, type UploadType } from '@/lib/upload-types'

interface Props {
  type: UploadType
  multiple?: boolean
  label?: string
  onUploaded: (urls: string[]) => void
  /** Renders as a compact circular icon-only control instead of the default labeled button. */
  iconOnly?: boolean
  /** Accessible name for the icon-only variant; falls back to `label`, then the default upload label. */
  ariaLabel?: string
  /** Overrides the wrapper's classes entirely. Only meaningful with `iconOnly`. */
  className?: string
}

export function ImageUploadButton({ type, multiple = false, label, onUploaded, iconOnly = false, ariaLabel, className }: Props) {
  const t = useTranslations('upload')
  const { upload, uploading } = useBlobUpload(type)
  const { kind } = UPLOAD_TYPES[type]
  const iconName = kind === 'video' ? 'videocam' : 'add_a_photo'

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    try {
      const urls = await Promise.all(files.map((file) => upload(file)))
      onUploaded(urls)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('failed'))
    }
  }

  const defaultLabel = kind === 'video' ? t('uploadVideo') : t('uploadImage')

  if (iconOnly) {
    return (
      <label
        aria-label={ariaLabel ?? label ?? defaultLabel}
        className={
          className ??
          `inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-primary text-white shadow-md ring-2 ring-white transition hover:bg-brand-secondary ${
            uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer'
          }`
        }
      >
        <Icon name={uploading ? 'progress_activity' : iconName} size={16} className={uploading ? 'animate-spin' : ''} />
        <input
          type="file"
          accept={`${kind}/*`}
          multiple={multiple}
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    )
  }

  return (
    <label
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 text-label-lg text-neutral-600 hover:border-brand-secondary hover:text-brand-primary transition ${
        uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer'
      }`}
    >
      <Icon name={iconName} size={18} />
      {uploading ? t('uploading') : (label ?? defaultLabel)}
      <input
        type="file"
        accept={`${kind}/*`}
        multiple={multiple}
        onChange={handleChange}
        disabled={uploading}
        className="hidden"
      />
    </label>
  )
}
