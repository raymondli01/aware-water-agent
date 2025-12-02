import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2')
      expect(result).toBe('px-4 py-2')
    })

    it('should handle conditional classes', () => {
      const isHidden = false
      const result = cn('px-4', isHidden && 'hidden', 'py-2')
      expect(result).toBe('px-4 py-2')
    })

    it('should merge conflicting tailwind classes correctly', () => {
      // twMerge should keep the last class when there's a conflict
      const result = cn('px-4 px-2')
      expect(result).toBe('px-2')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle undefined and null values', () => {
      const result = cn('px-4', undefined, null, 'py-2')
      expect(result).toBe('px-4 py-2')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['px-4', 'py-2'], 'text-white')
      expect(result).toBe('px-4 py-2 text-white')
    })
  })
})
