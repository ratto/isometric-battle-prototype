import { afterEach, describe, expect, it, vi } from 'vitest'

import { d10, d100, d12, d3, d4, d6, d8 } from './dice'
import { DieRoll } from './dieRoll'

describe('DieRoll construction', () => {
  it('throws when roll is empty', () => {
    expect(() => new DieRoll([], 0)).toThrow()
  })

  it('accepts a single roll entry', () => {
    const dieRoll = new DieRoll([{ dice: d6, modifier: 0 }], 0)

    expect(dieRoll.getResult()).toBeGreaterThanOrEqual(1)
  })
})

describe('DieRoll rolled value ranges', () => {
  const allDice = [d3, d4, d6, d8, d10, d12, d100]
  const samplesPerDie = 200

  it.each(allDice)('rolls %o within 1..faceNumber across many samples', (dice) => {
    for (let i = 0; i < samplesPerDie; i++) {
      const dieRoll = new DieRoll([{ dice, modifier: 0 }], 0)
      const { entries } = dieRoll.getDetailedResult()
      const [{ rolledValue }] = entries

      expect(rolledValue).toBeGreaterThanOrEqual(1)
      expect(rolledValue).toBeLessThanOrEqual(dice.faceNumber)
      expect(Number.isInteger(rolledValue)).toBe(true)
    }
  })

  it('never rolls 0 for d100', () => {
    for (let i = 0; i < samplesPerDie; i++) {
      const dieRoll = new DieRoll([{ dice: d100, modifier: 0 }], 0)
      const { entries } = dieRoll.getDetailedResult()

      expect(entries[0].rolledValue).not.toBe(0)
    }
  })
})

describe('DieRoll with mocked Math.random', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('computes getResult() from a known rolled value and modifiers', () => {
    // Math.random() = 0.5 on a d6 rolls floor(0.5 * 6) + 1 = 4
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const dieRoll = new DieRoll([{ dice: d6, modifier: 2 }], 3)

    expect(dieRoll.getResult()).toBe(4 + 2 + 3)
  })

  it('computes getDetailedResult() breakdown for multiple entries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const dieRoll = new DieRoll(
      [
        { dice: d6, modifier: 1 },
        { dice: d10, modifier: -2 },
      ],
      5,
    )

    const result = dieRoll.getDetailedResult()

    expect(result.entries).toEqual([
      { dice: d6, rolledValue: 4, modifier: 1, subtotal: 5 },
      { dice: d10, rolledValue: 6, modifier: -2, subtotal: 4 },
    ])
    expect(result.modifier).toBe(5)
    expect(result.total).toBe(5 + 4 + 5)
  })
})

describe('DieRoll edge cases', () => {
  it('reports multiple entries of the same Dice independently', () => {
    const dieRoll = new DieRoll(
      [
        { dice: d6, modifier: 0 },
        { dice: d6, modifier: 0 },
      ],
      0,
    )

    const result = dieRoll.getDetailedResult()

    expect(result.entries).toHaveLength(2)
    expect(result.total).toBe(result.entries[0].subtotal + result.entries[1].subtotal)
  })

  it('subtracts negative per-entry and overall modifiers without clamping', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    // Math.random() = 0 on a d6 rolls floor(0 * 6) + 1 = 1
    const dieRoll = new DieRoll([{ dice: d6, modifier: -5 }], -10)

    expect(dieRoll.getResult()).toBe(1 - 5 - 10)

    vi.restoreAllMocks()
  })

  it('getResult() equals the plain sum of rolled values when all modifiers are 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const dieRoll = new DieRoll(
      [
        { dice: d6, modifier: 0 },
        { dice: d10, modifier: 0 },
      ],
      0,
    )

    expect(dieRoll.getResult()).toBe(4 + 6)

    vi.restoreAllMocks()
  })

  it('re-rolls on every call instead of caching the first roll', () => {
    const rollDieSpy = vi.spyOn(Math, 'random')
    const dieRoll = new DieRoll([{ dice: d6, modifier: 0 }], 0)

    dieRoll.getResult()
    dieRoll.getDetailedResult()

    expect(rollDieSpy).toHaveBeenCalledTimes(2)

    vi.restoreAllMocks()
  })
})
