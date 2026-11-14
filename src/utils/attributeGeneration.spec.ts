import { afterEach, describe, expect, it, vi } from 'vitest'

import { rollAttributePool } from './attributeGeneration'

// Converts a desired d6 face (1-6) into the Math.random() value that produces it,
// matching DieRoll's `Math.floor(Math.random() * faceNumber) + 1` formula.
function randomFor(face: number): number {
  return (face - 0.5) / 6
}

describe('rollAttributePool value range', () => {
  const samples = 50

  it('always returns 8 values, each a valid 4d6-drop-lowest total (3..18)', () => {
    for (let i = 0; i < samples; i++) {
      const pool = rollAttributePool()

      expect(pool).toHaveLength(8)
      for (const value of pool) {
        expect(value).toBeGreaterThanOrEqual(3)
        expect(value).toBeLessThanOrEqual(18)
        expect(Number.isInteger(value)).toBe(true)
      }
    }
  })
})

describe('rollAttributePool with mocked Math.random', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('drops the lowest of the nine totals and keeps the remaining eight', () => {
    // Nine rolls of four identical dice each (so "drop lowest die" is trivial):
    // faces [2,3,4,5,6,3,4,5,6] -> totals [6,9,12,15,18,9,12,15,18].
    // The first roll (total 6) is the unique lowest and must be dropped.
    const faces = [2, 3, 4, 5, 6, 3, 4, 5, 6]
    const randomQueue = faces.flatMap((face) => Array.from({ length: 4 }, () => randomFor(face)))

    vi.spyOn(Math, 'random').mockImplementation(() => randomQueue.shift() as number)

    const pool = rollAttributePool()

    expect(pool).toEqual([9, 12, 15, 18, 9, 12, 15, 18])
  })
})
