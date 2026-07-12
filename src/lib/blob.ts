import { del } from '@vercel/blob'

export async function deleteBlob(url: string) {
  try {
    await del(url)
  } catch {
    // best-effort cleanup — ignore failures (e.g. already deleted)
  }
}

export async function deleteBlobs(urls: (string | undefined | null)[]) {
  await Promise.all(urls.filter((u): u is string => !!u).map(deleteBlob))
}
