import { describe, test, expect } from 'vitest'
import { formatPrice } from '../utils'

describe('formatPrice', () => {
  test('formats cents to euro string', () => {
    expect(formatPrice(123)).toBe('€1.23')
    expect(formatPrice(0)).toBe('€0.00')
    expect(formatPrice(1999)).toBe('€19.99')
  })
})
