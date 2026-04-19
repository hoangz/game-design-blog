import { describe, it, expect } from 'vitest'
import { calculateReadingTime } from '@/lib/reading-time'

describe('calculateReadingTime', () => {
  it('returns 1 for content under 200 words', () => {
    const content = Array(100).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(1)
  })

  it('returns 2 for 400-word content', () => {
    const content = Array(400).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(2)
  })

  it('returns 1 for empty string', () => {
    expect(calculateReadingTime('')).toBe(1)
  })
})
