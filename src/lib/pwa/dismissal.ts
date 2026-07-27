const STORAGE_KEY = 'starbox:install-prompt-dismissed'

interface DismissalState {
  dismissedAt: number
  /** true = never show again (e.g. user clicked Install / Got it). false = snooze for a few days. */
  permanent: boolean
}

function readState(): DismissalState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DismissalState
  } catch {
    return null
  }
}

/** Call after the user dismisses or completes the install flow. */
export function setDismissed(permanent: boolean) {
  if (typeof window === 'undefined') return
  try {
    const state: DismissalState = { dismissedAt: Date.now(), permanent }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — fail silently
  }
}

/** True if the prompt should stay hidden — either dismissed permanently, or within the snooze window. */
export function isDismissed(snoozeDays: number): boolean {
  const state = readState()
  if (!state) return false
  if (state.permanent) return true
  const elapsedDays = (Date.now() - state.dismissedAt) / (1000 * 60 * 60 * 24)
  return elapsedDays < snoozeDays
}
