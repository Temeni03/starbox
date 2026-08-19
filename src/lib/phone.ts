/**
 * The one definition of a valid phone number in this app: 8 digits, starting with 2, 3, 4 or 7.
 *
 * Both halves of every form read from here — the browser-side `pattern` attribute and the
 * server-side zod schema — so a client can never accept a number the API rejects, and the rule
 * only ever has to be changed in one place (it previously lived as ten separate copies of
 * `[234][0-9]{7}`, which is how the 7 prefix ended up missing from all of them).
 */
export const PHONE_LENGTH = 8

/** Allowed leading digits, in the order they are listed to users. */
export const PHONE_PREFIXES = ['2', '3', '4', '7'] as const

/** For the HTML `pattern` attribute — unanchored, as the browser anchors it itself. */
export const PHONE_PATTERN = `[${PHONE_PREFIXES.join('')}][0-9]{${PHONE_LENGTH - 1}}`

/** For server-side validation. */
export const PHONE_REGEX = new RegExp(`^${PHONE_PATTERN}$`)

/**
 * Fallback message for API responses that are not locale-aware; UI copy lives in messages/*.json.
 * Deliberately says only that the number is wrong - the accepted length and leading digits are
 * guidance for the input hint, not something to spell out in a rejection.
 */
export const PHONE_ERROR_MESSAGE = 'Invalid phone number'

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value)
}
