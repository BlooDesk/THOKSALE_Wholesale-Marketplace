// =====================================================================
// ThokSale — Input Sanitization Helpers (H8)
// Strip HTML / script content from user-supplied text fields.
// =====================================================================

/**
 * Remove HTML tags from a string. Use on any user-supplied text that will be
 * stored in the database and later rendered for other users (notes,
 * descriptions, payment terms, cancellation reasons, etc.).
 */
export function sanitizeText(input: string | null | undefined): string | null {
  if (!input) return null
  return input
    .replace(/<[^>]*>/g, '')   // strip HTML tags
    .replace(/&#?[a-z0-9]+;/gi, '') // strip HTML entities
    .trim()
}

/**
 * Sanitize + enforce a max length. Returns null if the result is empty.
 */
export function sanitizeField(
  input: string | null | undefined,
  maxLength: number = 5000
): string | null {
  const cleaned = sanitizeText(input)
  if (!cleaned) return null
  return cleaned.slice(0, maxLength)
}
