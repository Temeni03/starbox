/**
 * Presence ("active now") tuning, shared by the client heartbeat and the admin counts so the
 * two can never drift apart.
 *
 * A signed-in client pings /api/presence every HEARTBEAT_INTERVAL_MS while its tab is visible,
 * which stamps `lastActiveAt` on the user. Anyone stamped within PRESENCE_WINDOW_MINUTES counts
 * as active.
 *
 * Why 5 minutes: the app is a mobile PWA, so heartbeats stop the moment the phone locks or the
 * user switches apps, and mobile browsers throttle timers in background tabs. A 5 minute window
 * absorbs up to four missed 60s beats (screen off, tunnel, flaky data) without dropping a user
 * who is genuinely still shopping, while staying short enough to mean "here right now" — a 2
 * minute window made the number flap on every red light in testing, and anything past ~10
 * minutes stops being presence and starts being "visited recently".
 */
export const HEARTBEAT_INTERVAL_MS = 60_000
export const PRESENCE_WINDOW_MINUTES = 5
export const PRESENCE_WINDOW_MS = PRESENCE_WINDOW_MINUTES * 60_000

/** Cut-off timestamp: users with `lastActiveAt` at or after this are considered active now. */
export function presenceCutoff(now: number = Date.now()) {
  return new Date(now - PRESENCE_WINDOW_MS)
}

/** Whether a stored `lastActiveAt` still falls inside the presence window. */
export function isOnline(lastActiveAt?: string | Date | null) {
  if (!lastActiveAt) return false
  const ts = new Date(lastActiveAt).getTime()
  return Number.isFinite(ts) && ts >= Date.now() - PRESENCE_WINDOW_MS
}
