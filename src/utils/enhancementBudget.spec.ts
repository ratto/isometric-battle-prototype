import { describe, expect, it } from 'vitest'

import {
  calculateNegativePointsTaken,
  calculatePositiveBudget,
  calculatePositiveSpent,
  isOptionSelectable,
} from './enhancementBudget'
import type { Enhancement } from './enhancement'

function enhancement(overrides: Partial<Enhancement>): Enhancement {
  return {
    id: 'test-id',
    name: 'Test Enhancement',
    groupKey: 'test-group',
    polarity: 'positive',
    cost: 1,
    effect: 'Test effect.',
    ...overrides,
  }
}

describe('calculateNegativePointsTaken', () => {
  it('returns 0 when no negative enhancements are selected', () => {
    expect(calculateNegativePointsTaken([])).toBe(0)
  })

  it('sums the magnitude of negative costs', () => {
    const selected = [enhancement({ cost: -1 }), enhancement({ cost: -2 })]
    expect(calculateNegativePointsTaken(selected)).toBe(3)
  })

  it('caps the result at 3, per the Sistema Daemon rule', () => {
    const selected = [enhancement({ cost: -2 }), enhancement({ cost: -4 })]
    expect(calculateNegativePointsTaken(selected)).toBe(3)
  })
})

describe('calculatePositiveBudget', () => {
  it('returns the base 5 points when no negative points were taken', () => {
    expect(calculatePositiveBudget(0)).toBe(5)
  })

  it('adds the negative points taken to the base budget', () => {
    expect(calculatePositiveBudget(3)).toBe(8)
  })
})

describe('calculatePositiveSpent', () => {
  it('returns 0 when no positive enhancements are selected', () => {
    expect(calculatePositiveSpent([])).toBe(0)
  })

  it('sums the cost of the selected positive enhancements', () => {
    const selected = [enhancement({ cost: 2 }), enhancement({ cost: 3 })]
    expect(calculatePositiveSpent(selected)).toBe(5)
  })
})

describe('isOptionSelectable', () => {
  it('excludes an option whose groupKey is already selected elsewhere', () => {
    const option = enhancement({ groupKey: 'arcane-library', cost: 1 })
    const selectedGroupKeys = new Set(['arcane-library'])

    expect(isOptionSelectable(option, selectedGroupKeys, 0, 5)).toBe(false)
  })

  it('allows a positive option whose cost fits within the remaining budget', () => {
    const option = enhancement({ polarity: 'positive', cost: 2 })

    expect(isOptionSelectable(option, new Set(), 3, 5)).toBe(true)
  })

  it('disables a positive option whose cost would exceed the remaining budget', () => {
    const option = enhancement({ polarity: 'positive', cost: 3 })

    expect(isOptionSelectable(option, new Set(), 3, 5)).toBe(false)
  })

  it('always allows a negative option regardless of the positive budget', () => {
    const option = enhancement({ polarity: 'negative', cost: -4 })

    expect(isOptionSelectable(option, new Set(), 5, 5)).toBe(true)
  })
})
