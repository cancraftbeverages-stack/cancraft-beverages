/**
 * Detects characters that must never reach storage, shared by enquiry
 * validation (lib/enquiry/validate.ts) and attribution sanitising
 * (lib/attribution/attribution.ts) so the two cannot drift apart.
 *
 * Why these characters: the enquiry is stored as Postgres TEXT columns plus a
 * JSONB `payload` (lib/enquiry/store.ts). Postgres cannot store U+0000 in text
 * or JSONB, and JSONB rejects unpaired surrogate escapes, so either one makes
 * the INSERT fail (HTTP 500 and a fail-safe alert). Other C0 control
 * characters and DEL can be stored, but no keyboard produces them in a form
 * field; they only arrive from crafted requests or corrupted pastes.
 *
 * Detection only: values are REJECTED by the caller, never silently altered,
 * so submitted text is never corrupted.
 *
 * Deliberately allowed: tab, line feed and carriage return (multi-line text),
 * all printable Unicode including Devanagari and other scripts, emoji
 * (well-formed surrogate pairs), and format characters such as the zero-width
 * joiner/non-joiner (U+200D/U+200C), which Indic scripts need.
 */

/** C0 controls except TAB (U+0009), LF (U+000A) and CR (U+000D), plus DEL (U+007F). */
const CONTROL_EXCEPT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

/** Every C0 control including TAB, LF and CR, plus DEL. For single-token values such as UTM parameters. */
const ANY_CONTROL = /[\u0000-\u001F\u007F]/;

/**
 * With the `u` flag a well-formed surrogate pair is matched as one code point
 * (outside this range), so this matches only an unpaired high or low surrogate.
 */
const UNPAIRED_SURROGATE = /[\uD800-\uDFFF]/u;

export function hasUnsupportedCharacters(
  value: string,
  options: { allowTabsAndLineBreaks?: boolean } = {},
): boolean {
  const allowWhitespace = options.allowTabsAndLineBreaks ?? true;
  return (allowWhitespace ? CONTROL_EXCEPT_WHITESPACE : ANY_CONTROL).test(value) || UNPAIRED_SURROGATE.test(value);
}
