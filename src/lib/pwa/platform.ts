export interface PlatformInfo {
  isIOS: boolean
  isSafari: boolean
  isAndroid: boolean
  isStandalone: boolean
  isInAppBrowser: boolean
}

const IN_APP_BROWSER_PATTERN = /Instagram|FBAN|FBAV|Line\/|Twitter|TikTok|BytedanceWebview|musical_ly/i

const EMPTY_PLATFORM_INFO: PlatformInfo = {
  isIOS: false,
  isSafari: false,
  isAndroid: false,
  isStandalone: false,
  isInAppBrowser: false,
}

/** Client-only platform detection. Always call from inside a useEffect (or after mount) — never during SSR/render. */
export function getPlatformInfo(): PlatformInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return EMPTY_PLATFORM_INFO
  }

  const ua = navigator.userAgent

  const isIOS =
    (/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)) ||
    // iPadOS 13+ reports as a Mac with touch support
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  const isAndroid = /Android/.test(ua)

  const isInAppBrowser = IN_APP_BROWSER_PATTERN.test(ua)

  const isSafari =
    isIOS &&
    !isInAppBrowser &&
    /Safari/.test(ua) &&
    !/CriOS|FxiOS|OPiOS|EdgiOS|Chrome|Android/.test(ua)

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  return { isIOS, isSafari, isAndroid, isStandalone, isInAppBrowser }
}
