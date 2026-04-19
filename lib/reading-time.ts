// Estimated reading speed (words per minute) for average readers
const WORDS_PER_MINUTE = 200

/**
 * Calculate estimated reading time in minutes for given content.
 * Returns minimum 1 minute for any content including empty strings.
 */
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
