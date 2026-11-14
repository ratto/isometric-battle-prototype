import { afterEach, describe, expect, it, vi } from 'vitest'

import { distributeAttributes } from './attributeDistribution'

// A fixed, already-sorted-descending pool so the expected tier split is easy to
// read off directly: [18, 17, 16, 15, 14, 13, 12, 11].
const POOL = [18, 17, 16, 15, 14, 13, 12, 11]

describe('distributeAttributes with mocked Math.random (deterministic shuffle)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fighter: 4 highest on FR/AGI/DEX/CON, 4 lowest on INT/WILL/PER/CAR', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const attributes = distributeAttributes(POOL, 'fighter')

    expect(attributes).toEqual({
      FR: 18,
      CON: 17,
      AGI: 16,
      DEX: 15,
      INT: 14,
      CAR: 13,
      WILL: 12,
      PER: 11,
    })
  })

  it('wizard: 2 highest on INT/WILL, 2 lowest on PER/CAR, 4 middle on FR/AGI/DEX/CON', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const attributes = distributeAttributes(POOL, 'wizard')

    expect(attributes).toEqual({
      INT: 18,
      WILL: 17,
      FR: 16,
      CON: 15,
      AGI: 14,
      DEX: 13,
      PER: 12,
      CAR: 11,
    })
  })

  it('thief: 3 highest on AGI/DEX/INT, 5 remaining on FR/CON/WILL/PER/CAR', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const attributes = distributeAttributes(POOL, 'thief')

    expect(attributes).toEqual({
      AGI: 18,
      INT: 17,
      DEX: 16,
      FR: 15,
      PER: 14,
      CON: 13,
      CAR: 12,
      WILL: 11,
    })
  })
})

describe('distributeAttributes invariants (no mocking)', () => {
  it('always assigns exactly the 8 pool values, with no value invented or lost', () => {
    for (const characterClass of ['fighter', 'wizard', 'thief'] as const) {
      const attributes = distributeAttributes(POOL, characterClass)

      expect(Object.values(attributes).sort((a, b) => a - b)).toEqual(
        [...POOL].sort((a, b) => a - b),
      )
    }
  })
})
