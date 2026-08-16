const STORAGE_KEY = 'starbox:battery-nudge-seen'

/** One-time tip, shown once per device after the user first grants notification permission. */
export function hasBatteryNudgeBeenSeen(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

export function markBatteryNudgeSeen() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — fail silently
  }
}

/**
 * Opens Android's "apps not optimized for battery" settings screen so the user can
 * exempt the app themselves. Public Android action, no permission required — works on
 * stock/near-stock Android; heavily customized OEM skins may show their own equivalent
 * screen instead, or ignore it entirely. Silently does nothing outside Chrome/Android.
 */
export function openBatterySettings() {
  window.location.href = 'intent:#Intent;action=android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS;end'
}
